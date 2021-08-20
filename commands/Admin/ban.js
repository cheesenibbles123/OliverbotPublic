const Discord = require("discord.js");
const config = require("./../../config.json");
let bot;

module.exports = {
	name: "ban",
	args: 0,
	help: "bans the user",
	usage: "@user",
	roles: ["665939545371574283"],
	category: "Admin",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (typeof args[0] === "string"){
			try{
				let member = message.guild.members.find('id',message.mentions.users.first().id);
				if (member.roles.has(config.serverInfo.roles.serverAdministrator)){
					message.channel.send("You can't ban an admin!");
				}else{
					message.guild.members.ban(member);
					bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+member+", has been banned. Reason: "+(args.slice(2)).join(" ")+"\n"
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