import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { Command } from "../interfaces/Command";
import { sendModerationDm } from "../modules/sendModerationDm";
import { updateHistory } from "../modules/updateHistory";
import { customSubstring } from "../utils/customSubstring";
import { errorHandler } from "../utils/errorHandler";

export const unmute: Command = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user via your configured muted role.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to unmute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for unmuting the user.")
        .setRequired(true)
    ),
  run: async (Bot, interaction) => {
    try {
      await interaction.deferReply();
      const { guild, member } = interaction;
      const target = interaction.options.getUser("target", true);
      const reason = interaction.options.getString("reason", true);

      if (!guild) {
        await interaction.editReply(
          "This command can only be used in a guild."
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
        await interaction.editReply("You cannot unmute yourself.");
        return;
      }
      if (target.id === Bot.user?.id) {
        await interaction.editReply("You cannot unmute the bot.");
        return;
      }

      const targetMember = await guild.members.fetch(target.id);

      await targetMember.timeout(null, reason);

      await updateHistory(Bot, "unmute", target.id);

      const sentNotice = await sendModerationDm(
        Bot,
        "unmute",
        target,
        guild.name,
        reason
      );

      const muteEmbed = new EmbedBuilder();
      muteEmbed.setTitle("A user is no longer silenced!");
      muteEmbed.setDescription(`They were unmuted by ${member.user.username}`);
      muteEmbed.addFields(
        {
          name: "Reason",
          value: customSubstring(reason, 1000),
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
        content: "That user has been unmuted.",
      });
    } catch (err) {
      await errorHandler(Bot, err);
      await interaction.editReply("Something went wrong!");
    }
  },
};
