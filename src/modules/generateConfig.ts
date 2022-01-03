import { WebhookClient } from "discord.js";

import { Camperbot } from "../interfaces/Camperbot";

/**
 * Bootstraps the config from the ENV into the Bot's instance.
 *
 * @returns {Object} The bot's config.
 */
export const generateConfig = (): Camperbot["config"] => {
  if (
    !process.env.TOKEN ||
    !process.env.MONGO_URI ||
    !process.env.DEBUG_HOOK ||
    !process.env.MOD_HOOK ||
    !process.env.HOME_GUILD ||
    !process.env.BOT_ID
  ) {
    throw new Error("Missing required config variables");
  }
  return {
    token: process.env.TOKEN,
    mongo_uri: process.env.MONGO_URI,
    debug_hook: new WebhookClient({ url: process.env.DEBUG_HOOK }),
    mod_hook: new WebhookClient({ url: process.env.MOD_HOOK }),
    home_guild: process.env.HOME_GUILD,
    bot_id: process.env.BOT_ID,
    mod_role: process.env.MOD_ROLE || "no role set",
    private_category: process.env.PRIVATE_CATEGORY || "no category set",
  };
};
