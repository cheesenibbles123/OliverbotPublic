const config = require("./../config.json");
const { CHANNEL } = require("./../structs/eventColours.js");
const { LOGGING_CHANNEL } = require("./../structs/channels.js");
const Discord = require("discord.js");

let bot;

module.exports = {
	name : "CHANNEL_DELETE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		let createChannel = bot.channels.cache.get(event.d.id);
		if (event.d.type !== 'dm'){

			rawEmbed.setColor(CHANNEL)
				.addField(`Name:`,`${event.d.name}`,true)
  				.addField(`ID:`,`${event.d.id}`,true);

			switch (event.d.type){
				case 0:
  					rawEmbed.setTitle("Text Channel Deleted");
 					break;
 				case 2:
 					rawEmbed.setTitle("Voice Channel Deleted");
 					break;
 				case 4:
 					rawEmbed.setTitle("Category Deleted");
 					break;
 				default:
 					rawEmbed.setTitle("Channel Deleted");
 					break;
			}
		}
		bot.channels.cache.get(LOGGING_CHANNEL).send({embeds:[rawEmbed]});
	}
}