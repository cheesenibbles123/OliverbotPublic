const config = require("./../config.json");
const colours = require("./../structs/eventColours.js");

let bot;

module.exports = {
	name : "CHANNEL_PINS_UPDATE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		rawEmbed.setColor(colours.channel)
			.setTitle(`Message Pinned`)
			.setDescription(`Channel: <#${event.d.channel_id}>\nID: ${event.d.channel_id}`);

		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send({embeds:[rawEmbed]});
	}
}