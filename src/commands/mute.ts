import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { Command } from "../interfaces/Command";
import { sendModerationDm } from "../modules/sendModerationDm";
import { updateHistory } from "../modules/updateHistory";
import { calculateMilliseconds } from "../utils/calculateMilliseconds";
import { customSubstring } from "../utils/customSubstring";
import { errorHandler } from "../utils/errorHandler";

export const mute: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user via your configured muted role.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to mute.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The length of time to mute the user.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("The unit of time for the duration.")
        .setRequired(true)
        .addChoices(
          {
            name: "Minutes",
            value: "minutes",
          },
          {
            name: "Hours",
            value: "hours",
          },
          {
            name: "Days",
            value: "days",
          },
          {
            name: "Weeks",
            value: "weeks",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for muting the user.")
        .setRequired(true)
    ),
  run: async (Bot, interaction) => {
    try {
      await interaction.deferReply();
      const { guild, member } = interaction;
      const target = interaction.options.getUser("target", true);
      const duration = interaction.options.getInteger("duration", true);
      const durationUnit = interaction.options.getString("unit", true);
      const reason = interaction.options.getString("reason", true);

      const durationMilliseconds = calculateMilliseconds(
        duration,
        durationUnit
      );

      if (!durationMilliseconds) {
        await interaction.editReply({
          content: `${duration}${durationUnit} is not a valid duration.`,
        });
        return;
      }

      if (durationMilliseconds > 2419200000) {
        await interaction.editReply({
          content: "You cannot mute someone for longer than a month.",
        });
        return;
      }

      if (!guild) {
        await interaction.editReply(
          "This command can only be run in a server."
        );
        return;
      }

      if (
        !member ||
        typeof member.permissions === "string" ||
        !member.permissions.has(PermissionFlagsBits.ModerateMembers)
      ) {
        await interaction.editReply(
          "You do not have permission to use this command."
        );
        return;
      }

      if (target.id === member.user.id) {
        await interaction.editReply("You cannot mute yourself.");
        return;
      }
      if (target.id === Bot.user?.id) {
        await interaction.editReply("You cannot mute the bot.");
        return;
      }

      const targetMember = await guild.members.fetch(target.id);

      const sentNotice = await sendModerationDm(
        Bot,
        "mute",
        target,
        guild.name,
        reason
      );

      await targetMember.timeout(durationMilliseconds, reason);

      await updateHistory(Bot, "mute", target.id);

      const muteEmbed = new EmbedBuilder();
      muteEmbed.setTitle("A user has been muted!");
      muteEmbed.setDescription(`They were muted by ${member.user.username}`);
      muteEmbed.addFields(
        {
          name: "Reason",
          value: customSubstring(reason, 1000),
        },
        {
          name: "Duration",
          value: `${duration} ${durationUnit}`,
        },
        {
          name: "User Notified?",
          value: String(sentNotice),
        }
      );
      muteEmbed.setTimestamp();
      muteEmbed.setAuthor({
        name: target.tag,
        iconURL: target.displayAvatarURL(),
      });

      await Bot.config.mod_hook.send({ embeds: [muteEmbed] });

      await interaction.editReply({
        content: "They have been muted!",
      });
    } catch (err) {
      await errorHandler(Bot, err);
      await interaction.editReply("Something went wrong.");
    }
  },
};
