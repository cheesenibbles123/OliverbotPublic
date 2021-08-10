const Discord = require("discord.js");

let bot;
let file = "./../../data/scamFilter.json";

module.exports = {
	name: "addscamlink",
	args: 1,
	help: "Adds a scam link to the scam filter",
	roles: ["440514569849536512"],
	category: "Mod",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		bot.scamFilter.links.push(args[0]);
		message.channel.send("Added link.");
		fs.writeFileSync(file, JSON.stringify(bot.scamFilter), 'utf8');
	}
}