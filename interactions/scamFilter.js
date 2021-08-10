const config = require("./../config.json");
const fs = require('fs');
const Discord = require('discord.js');

let bot;
let file = "./data/scamFilter.json";

module.exports = {
	init : (botInstance) => {

		let data = JSON.parse(fs.readFileSync(file).toString());

		botInstance['scamFilter'] = data;
		bot = botInstance;
	},
	execute: (message,args) => {
		if (!message.guild){
			return;
		}
		for (let i=0; i < bot.scamFilter.links.length; i++){
			if (message.content.includes(bot.scamFilter.links[i])){
				if (bot.scamFilter.users[message.author.id]){
					bot.scamFilter.users[message.author.id].infractions += 1;
					bot.scamFilter.users[message.author.id].links.push(bot.scamFilter.links[i]);
				}else{
					bot.scamFilter.users[message.author.id] = {
						infractions: 1,
						links: [bot.scamFilter.links[i]],
						isMuted : false,
					};
				}

				if (bot.scamFilter.users[message.author.id].infractions >= bot.scamFilter.threshold && !bot.scamFilter.users[message.author.id].isMuted){
					bot.scamFilter.users[message.author.id].isMuted = true;
					message.member.roles.add(config.serverInfo.roles.muted);

					let links = "";
					for (let s = 0; s < bot.scamFilter.users[message.author.id].links.length; s++){
						links += `${bot.scamFilter.users[message.author.id].links[s]}\n`;
					}

					let embed = new Discord.MessageEmbed()
							.setTitle("User Scam Muted")
							.setDescription(`Muted user: ${message.author}\nFor posting ${bot.scamFilter.users[message.author.id].infractions} scam links:\n${links}`);

					bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(embed);
				}

				message.delete();

				fs.writeFileSync(file, JSON.stringify(bot.scamFilter), 'utf8');
			}
		}
	}
}