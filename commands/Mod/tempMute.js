const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");
const shared = require("./_sharedFunctions.js");
const { MODERATOR, ADMINISTRATOR } = require("./../../structs/roles");

let bot;

module.exports = {
	name: "tempmute",
	args: [2,20],
	help: "Temporarily mutes a user",
	roles: [ MODERATOR ],
	category: "Mod",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let member = message.guild.members.find('id',message.mentions.users.first().id);
		try{
			let tempmuteAwnser = shared.rolecheckformutes(member, message);
			if (tempmuteAwnser){
				message.channel.send("You can't mute someone higher than, or at your current role.");
			}else{
				let tempmuteGo = false;
				if (typeof args[1] === "undefined"){
					time = 86400000;
					tempmuteGo = true;
				}else{
					try{
						time = parseInt(args[1]);
						tempmuteGo = true;
					}catch(e){
						message.channel.send("Please enter a correct number of hours.");
					}
				}
				if (tempmuteGo){
					let delayTemp = (parseInt(args[1]) * 1000 * 60 * 60);
					mute(message);
					bot.channels.cache.get("512331083493277706").send("User: "+member+" has been temporarily muted for "+time+" hour(s) by "+message.member.user.username+".\n"
														+"Reason: "+(args.slice(2)).join(" "));
					setTimeout(() => {
						unmute(message)
					}, delayTemp);
				}
			}
		}catch(e){
			message.channel.send("Error, please check you pinged an individual/used the command correctly.");
		}
	}
}