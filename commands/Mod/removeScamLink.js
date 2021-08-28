const Discord = require("discord.js");
const { MODERATOR } = require("./../../structs/roles");

let bot;
let file = "./../../data/scamFilter.json";

module.exports = {
	name: "removescamlink",
	args: 1,
	help: "Removes a scam link to the scam filter",
	roles: [ MODERATOR ],
	category: "Mod",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let num = bot.scamFilter.links.indexOf(args[0]);
		if (num === -1){
			message.channel.send("Link not found.");
		}else{
			bot.scamFilter.links.splice(num, 1);
			message.channel.send("Removed link.");
			fs.writeFileSync(file, JSON.stringify(bot.scamFilter), 'utf8');
		}
	}
}