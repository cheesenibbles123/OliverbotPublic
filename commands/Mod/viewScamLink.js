const Discord = require("discord.js");

let bot;

module.exports = {
	name: "viewscamlinks",
	args: 1,
	help: "Lists all links currently in the scam filter",
	roles: ["440514569849536512"],
	category: "Mod",
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