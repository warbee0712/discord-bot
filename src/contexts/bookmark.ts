import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User,
} from "discord.js";

import { Context } from "../interfaces/Context";
import { customSubstring } from "../utils/customSubstring";
import { errorHandler } from "../utils/errorHandler";

export const bookmark: Context = {
  data: {
    name: "bookmark",
    type: 3,
  },
  run: async (Bot, interaction): Promise<void> => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const message = interaction.options.getMessage("message") as Message;

      if (!message) {
        await interaction.editReply(
          "I cannot bookmark that for you as I cannot locate the necessary records."
        );
        return;
      }

      const author = message.author as User;

      const bookmarkEmbed = new MessageEmbed();
      bookmarkEmbed.setTitle(`Your saved message!`);
      bookmarkEmbed.setDescription(
        `${customSubstring(message.content || "no content found!", 4000)}`
      );
      bookmarkEmbed.setAuthor({
        name: author.tag,
        iconURL: author.displayAvatarURL(),
      });
      bookmarkEmbed.addField("Link", message.url);

      const deleteButton = new MessageButton()
        .setCustomId("delete-bookmark")
        .setLabel("Delete this bookmark.")
        .setStyle("DANGER");

      const row = new MessageActionRow().addComponents([deleteButton]);

      await interaction.user
        .send({ embeds: [bookmarkEmbed], components: [row] })
        .then(async () => {
          await interaction.editReply(
            "I have bookmarked that message for you."
          );
        })
        .catch(async () => {
          await interaction.editReply(
            "I could not bookmark that for you. Please ensure your private messages are open."
          );
        });
    } catch (err) {
      await errorHandler(Bot, err);
      await interaction.editReply("Something went wrong.");
    }
  },
};
