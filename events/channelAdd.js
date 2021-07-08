const config = require("./../config.json");

let bot;

module.exports = {
	name : "CHANNEL_CREATE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		let createChannel = bot.channels.cache.get(event.d.id);
		if (event.d.type !== 'dm'){

			rawEmbed.setColor(config.embedColours.channels)
				.setTitle("Channel Created")
				.addField("Info:",`Name: ${event.d.name}\n<#${event.d.id}>`);
		}
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(rawEmbed);
	}
}