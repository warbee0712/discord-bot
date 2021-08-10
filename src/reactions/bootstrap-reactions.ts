import { Client, Collection, MessageReaction } from 'discord.js';
import { Config } from '../config/get-config';
import { REACTIONS } from './reactions';
import { ReactionDef } from './reaction-def';
import { logger } from '../utilities/logger';

export const bootstrapReactions = ({
  client,
  config
}: {
  client: Client;
  config: Config;
}): void => {
  const reactions = REACTIONS.reduce(
    (acc, reactionDef) => acc.set(reactionDef.emoji, reactionDef),
    new Collection<string, ReactionDef>()
  );

  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        reaction.message.channel.send(
          'Something went wrong! Failed to format code :('
        );
        logger.error(error);
        return;
      }
    }

    if (!reactions.has(reaction.emoji.name || 'no emote found')) {
      // we don't care about this emoji
      return;
    }
    try {
      reactions
        .get(reaction.emoji.name || 'no emote found')
        ?.command(reaction as MessageReaction, { client, config, user });
    } catch (error) {
      // don't warn end users, just log the error
      logger.error(error);
    }
  });
};
