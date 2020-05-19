const isSuppotedByPrettier = require('./is-suppoted-by-prettier');
const formatter = require('./formatter');
const formatMessageWithCodeblock = require('./format-codeblock');

/**
 * @name processReply
 * Processes the reply from client (reaction to prompt message)
 * and sends adequate reply
 *
 * @param {Object} languageName Object containing infos required to
 * process the reply
 */

module.exports = async function processReply({
  ref,
  reactionEmojies,
  reactionOptionsObj,
  languageGuesses,
  content
}) {
  try {
    const filter = (reaction) => {
      return reactionEmojies.includes(reaction.emoji.name);
    };

    const reaction = await ref.awaitReactions(filter, {
      max: 1,
      time: 60000,
      errors: ['time']
    }); // code can be formatted multiple times by chnaging this line

    const collectedEmojis = [...reaction.values()];
    const reactionEmoji = collectedEmojis[0]._emoji.name; // code can be formatted multiple times by chnaging this line

    switch (reactionEmoji) {
      case reactionOptionsObj.firstOption: {
        const supportedLanguage = isSuppotedByPrettier(languageGuesses[0]);
        if (supportedLanguage) {
          const formattedCode = formatter(content, supportedLanguage);
          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[0], formattedCode)
          );
        } else {
          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[0], content)
          );
        }
        break;
      }
      case reactionOptionsObj.secondOption: {
        const supportedLanguage = isSuppotedByPrettier(languageGuesses[1]);
        if (supportedLanguage) {
          const formattedCode = formatter(content, supportedLanguage);

          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[1], formattedCode)
          );
        } else {
          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[1], content)
          );
        }
        break;
      }
      case reactionOptionsObj.thirdOption: {
        const supportedLanguage = isSuppotedByPrettier(languageGuesses[2]);

        if (supportedLanguage) {
          const formattedCode = formatter(content, supportedLanguage);
          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[2], formattedCode)
          );
        } else {
          ref.channel.send(
            formatMessageWithCodeblock(languageGuesses[2], content)
          );
        }
        break;
      }
    }
  } catch (error) {
    ref.channel.send('Something went wrong! Failed to format code :(');
    console.error(error);
  }
};
