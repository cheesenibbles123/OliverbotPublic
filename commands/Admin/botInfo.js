const Discord = require('discord.js');
const { ADMINISTRATOR } = require("./../../structs/roles");
const { LOGGING_CHANNEL } = require("./../../structs/channels");

let bot;

module.exports = {
	name: "botinfo",
	help: "Displays the bot information",
	roles: [ ADMINISTRATOR ],
	category: "Admin",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let totalSeconds = (bot.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = (totalSeconds % 60).toString();
		seconds = seconds.slice(0,seconds.indexOf(".") + 3);

		hours -= days * 24;
		let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

		let used = process.memoryUsage();
		let ramusage = (parseInt(used.rss) * (10**-6) ).toString();
		ramusage = ramusage.slice(0,ramusage.indexOf(".") + 3);

		let botInfo = new Discord.MessageEmbed()
			.addField(`Overview`,`Uptime: ${uptime}\nRam: ${ramusage}MB`)/*\nPlaying Audio: ${audio.isPlaying}`)*/
			.setTimestamp();

		if (args[0] === "adv"){
			let memoryInformation = "";
			for (let key in used) {
			  memoryInformation = memoryInformation + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\n`;
			}
			if (memoryInformation.length < 1)
			{
				memoryInformation = "N/A";
			}
			botInfo.addField("Memory Information", `${memoryInformation}`,true);

			let procInf = `Node Version: ${process.env.node_version}\nVersion: ${process.env.version}\nRestarts: ${process.env.restart_time}\nArgs: ${process.env.node_args}\nAutorestart: ${process.env.autorestart}`;

			botInfo.addField(`Process info`,procInf,true);
		}

		message.channel.send({embeds:[botInfo]});
	}
}