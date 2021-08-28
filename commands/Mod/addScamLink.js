const Discord = require("discord.js");
const { MODERATOR } = require("./../../structs/roles");

let bot;
let file = "./../../data/scamFilter.json";

module.exports = {
	name: "addscamlink",
	args: 1,
	help: "Adds a scam link to the scam filter",
	roles: [ MODERATOR ],
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		bot.scamFilter.links.push(args[0]);
		message.channel.send("Added link.");
		fs.writeFileSync(file, JSON.stringify(bot.scamFilter), 'utf8');
	}
}