const Discord = require("discord.js");
const { MODERATOR } = require("./../../structs/roles");

let bot;

module.exports = {
	name: "viewscamlinks",
	args: 1,
	help: "Lists all links currently in the scam filter",
	roles: [ MODERATOR ],
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let links = "```\n";
		for (let i=0; i< bot.scamFilter.links.length; i++){
			links += bot.scamFilter.links[i] + "\n";
		}
		message.channel.send(links + "```");
	}
}