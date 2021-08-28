const config = require("./../config.json");
const { CHANNEL } = require("./../structs/eventColours.js");
const { LOGGING_CHANNEL } = require("./../structs/eventColours.js");

let bot;

module.exports = {
	name : "THREAD_CREATE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		rawEmbed.setColor(CHANNEL)
			.setTitle(`Thread Created`);

		bot.channels.cache.get(LOGGING_CHANNEL).send({embeds:[rawEmbed]});
	}
}