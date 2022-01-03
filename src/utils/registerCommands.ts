import { REST } from "@discordjs/rest";
import {
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord-api-types/v9";

import { Camperbot } from "../interfaces/Camperbot";

import { errorHandler } from "./errorHandler";
import { logHandler } from "./logHandler";

/**
 * Takes both the commands and contexts, parses the `data` properties as needed,
 * and builds an array of all command data. Then, posts the data to the Discord endpoint
 * for registering commands.
 *
 * @param {Camperbot} Bot Bot's Discord instance.
 * @returns {boolean} True if the commands were registered, false on error.
 */
export const registerCommands = async (Bot: Camperbot): Promise<boolean> => {
  try {
    const rest = new REST({ version: "9" }).setToken(Bot.config.token);

    const commandData: (
      | RESTPostAPIApplicationCommandsJSONBody
      | RESTPostAPIChatInputApplicationCommandsJSONBody
    )[] = [];

    Bot.commands.forEach((command) =>
      commandData.push(
        command.data.toJSON() as RESTPostAPIApplicationCommandsJSONBody
      )
    );
    Bot.contexts.forEach((context) => commandData.push(context.data));
    logHandler.log("debug", "registering to home guild only");
    await rest.put(
      Routes.applicationGuildCommands(Bot.config.bot_id, Bot.config.home_guild),
      { body: commandData }
    );
    return true;
  } catch (err) {
    await errorHandler(Bot, err);
    return false;
  }
};
