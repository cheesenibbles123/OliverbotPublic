const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");

let bot;

module.exports = {
	name: "warn",
	args: 1,
	help: "Sends the user a warning",
	roles: ["440514569849536512"],
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let member = glob.getUserFromMention(args[0]);

		let warningEmbed = new Discord.MessageEmbed()
			.setTitle(`Warning from ${message.guild.name}`)
			.setDescription(`${(args.slice(1)).join(" ")}`);

		let loggingWarningEmbed = new Discord.MessageEmbed()
			.setTitle(`Warning to ${member.username}`)
			.setDescription(`${(args.slice(1)).join(" ")}`)
			.setFooter(`ID: ${member.id}`);

		if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
			loggingWarningEmbed.setColor(config.embedColours.warningAdmin);
			warningEmbed.setColor(config.embedColours.warningAdmin);
		}else{
			loggingWarningEmbed.setColor(config.embedColours.warningMod);
			warningEmbed.setColor(config.embedColours.warningMod);
		}

		try{
			member.send(warningEmbed).catch(() => message.channel.send("This user does not have open DMs."));
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(loggingWarningEmbed);
		}catch(e){
			message.reply("This isnt working currently. Tell archie to go look at the logs.");
			console.log(e);
		}
	}
}