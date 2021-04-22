const Discord = require("discord.js");
const db = require("./../_databaseSetup");

let bot;

module.exports = {
	name: "channelinfo",
	args: 0,
	help: "Displays the channel information",
	roles: ["665939545371574283"],
	category: "Admin",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		db.mainDatabaseConnectionPool.query(`SELECT * FROM channel_messages WHERE channel_id = '${message.channel.id}'`, (err,rows) => {
			let message_count;
			if (rows.length < 1){
				message_count = 0;
			}else{
				message_count = rows[0].message_count;
			}

			let guild = bot.guilds.cache.get(message.guild.id);

			let channelinfo = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${message.channel.name}`)
				.setAuthor(`Channel Info`)
				.addField('Type', `${message.channel.type}`,true)
				.addField('Created', `${message.channel.createdAt}`,true)
				.addField('Amount of people that can view', `${message.channel.members.size} / ${guild.members.cache.size}`,true)
				.addField('Nsfw', `-${message.channel.nsfw}`,true)
				.addField('Category', `-${message.channel.parent}`,true)
				.addField('Last Pin', `-${message.channel.lastPinAt}`,true)
				.addField('Topic', `-${message.channel.topic}`,true)
				.addField('Currently being typed in', `${message.channel.typing}`,true)
				.addField('Messages Sent', `${message_count}`,true)
				.setTimestamp();
			message.channel.send(channelinfo);
		});
	}
}