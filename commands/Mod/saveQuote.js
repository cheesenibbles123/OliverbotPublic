const Discord = require("discord.js");
const { MODERATOR } = require("./../../structs/roles");
const { QUOTES } = require("./../../structs/channels");

let bot;

module.exports = {
	name: "savequote",
	args: 1,
	help: "Saves a message as a quote",
	usage: "<messageID>",
	roles: [ MODERATOR ],
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let channel = message.channel;
		let id = args[0];
		if (typeof id !== null && Number.isInteger(parseInt(id))){
			try{
				bot.channels.cache.get(channel.id).messages.fetch(id).then(message => {
					let dateSent = new Date(message.createdTimestamp);
					let quote = new Discord.MessageEmbed()
						.setTitle(`${message.author.username}`)
						.setDescription(`${message.content}`)
						.setThumbnail(message.author.displayAvatarURL())
						.setFooter(`Sent in: #${channel.name} ⚉ ${dateSent.getDay()}/${dateSent	.getDate()}/${dateSent.getFullYear()}`);
					let hasNotAddedImage = true;
					message.attachments.forEach(attachment => {
			    		if (message.attachments.size === 1) {
			      			if (attachment.url && hasNotAddedImage){
			      				quote.setImage(`${attachment.url}`);
			      				hasNotAddedImage = false;
			      			}
			    		}
			  		});
					bot.channels.cache.get(QUOTES).send({embeds: [quote]});
				});
			}catch(e){
				channel.send("Please make sure you have entered it correctly!");
			}
			channel.send("Done!");
		}else{
			channel.send("Please make sure you have entered the correct message ID :)");
		}
	}
}