const config = require("./../config.json");
const { CHANNEL } = require("./../structs/eventColours.js");
const { LOGGING_CHANNEL } = require("./../structs/eventColours.js");

let bot;

module.exports = {
	name : "THREAD_UPDATE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		if (!event.d.thread_metadata.archived) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		rawEmbed.setColor(CHANNEL)
			.setTitle(`Thread Archived`);

		bot.channels.cache.get(LOGGING_CHANNEL).send({embeds:[rawEmbed]});
	}
}