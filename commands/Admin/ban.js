const Discord = require("discord.js");
const config = require("./../../config.json");
const { ADMINISTRATOR } = require("./../../structs/roles");
const { LOGGING_CHANNEL } = require("./../../structs/channels");

let bot;

module.exports = {
	name: "ban",
	args: 1,
	help: "bans the user",
	usage: "@user",
	roles: [ ADMINISTRATOR ],
	category: "Admin",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (typeof args[0] === "string"){
			try{
				let member = message.guild.members.find('id',message.mentions.users.first().id);
				if (member.roles.has(ADMINISTRATOR)){
					message.channel.send("You can't ban an admin!");
				}else{
					message.guild.members.ban(member, { reason : args.shift().join(' ') });
					bot.channels.cache.get(LOGGING_CHANNEL).send("User: "+member+", has been banned. Reason: "+(args.slice(2)).join(" ")+"\n"
																+"Banned by: "+message.member.user.username+".");
				}
			}catch(e){
				message.channel.send("Please enter a correct member.");
			}
		}else{
			message.channel.send("Please enter a User.");
		}
	}
}