const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const config = require("./../../config.json");
const { MODERATOR, MUTED } = require("./../../structs/roles");
const { LOGGING_CHANNEL } = require("./../../structs/channels");

let bot;

module.exports = {
	name: "mute",
	args: 1,
	help: "Mutes a user",
	usage: "@user",
	roles: [ MODERATOR ],
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let member = message.guild.members.find('id',message.mentions.users.first().id);
		let pass = shared.roleCheckForMutes(muteMember, message);
		if (pass){
			message.channel.send("You can't use this command.");
		}else{
			try{
				member.roles.add(MUTED);
				message.channel.send(member + " has been muted");
			}catch (e) {
				console.log(e);
				message.channel.send("Can't mute this person right now, something doesnt seem to be working");
			}
			bot.channels.cache.get(LOGGING_CHANNEL).send("User: " + muteMember + " has been muted by " + message.member.user.username + ".");
		}
	}
}