const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");
const { MODERATOR, ADMINISTRATOR } = require("./../../structs/roles");
const embedColours = require("./../../structs/eventColours");
const { LOGGING_CHANNEL } = require("./../../structs/channels");

let bot;

module.exports = {
	name: "warn",
	args: 1,
	help: "Sends the user a warning",
	usage: "@user",
	roles: [ MODERATOR, ADMINISTRATOR ],
	category: "Mod",
	guildOnly: true,
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

		if (message.member.roles.cache.has(ADMINISTRATOR)){
			loggingWarningEmbed.setColor(embedColours.warningAdmin);
			warningEmbed.setColor(embedColours.warningAdmin);
		}else{
			loggingWarningEmbed.setColor(embedColours.warningMod);
			warningEmbed.setColor(embedColours.warningMod);
		}

		try{
			member.send(warningEmbed).catch(() => message.channel.send("This user does not have open DMs."));
			bot.channels.cache.get(LOGGING_CHANNEL).send(loggingWarningEmbed);
		}catch(e){
			message.reply("This isnt working currently. Tell archie to go look at the logs.");
			console.log(e);
		}
	}
}