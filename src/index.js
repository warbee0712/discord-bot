const { Client } = require('discord.js');
const getConfig = require('./config/get-config');
const validateConfig = require('./config/validate-config');
const bootstrap = require('./commands/bootstrap');
const client = new Client();

(async () => {
  try {
    // this iife is so we can get "top level await"
    console.log('Initalizing...');
    const config = getConfig();
    validateConfig(config);
    // rig up client callbacks
    client.on('error', console.error);

    bootstrap({ client, config });

    client.on('message', (message) => {
      console.log('>> ', message.content);
    });

    client.once('ready', () => console.log('ready!'));

    client.login(config.TOKEN);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
