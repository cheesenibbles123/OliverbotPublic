const db = require("./../startup/database");
const config = require("./../config.json");
const glob = require("./../commands/_globalFunctions");
const Discord = require("discord.js");
const { QUOTES } = require("./../structs/channels");

const autoQuoteNotAllowedCategories = ["408407982926331904","440525688248991764","665972605928341505","585042086542311424","632107333933334539","692084502184329277"];

let bot;

module.exports = {
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
		// Ensures a local reference for bot
		// This is mostly useful if you want to do things like:
		// bot.channels.cache.get()
		// bot.users.get
		// etc
	},
	execute : (message) => { // Main event code that will be executed on call
		//Prevents autoquote from taking from sensitive channels
		if (message.guild){
			if (db.adjustableConfig.quotes.active && message.guild.id === config.serverInfo.serverId){
				if (autoQuoteNotAllowedCategories.indexOf(message.channel.parentID) === -1){
					if (message.channel.name.toLowerCase().includes("support")){
						// Ignore
					}else
					if (glob.getRandomInt(db.adjustableConfig.quotes.chanceOfBeingQuoted) === 1){
						try{
							let AutoQuote = new Discord.MessageEmbed()
								.setTitle(`${message.author.username}`)
								.setDescription(`${message.content}`)
								.setThumbnail(message.author.displayAvatarURL())
								.setFooter(`Sent in: #${message.channel.name} `)
								.setTimestamp();

							let hasNotAddedImage = true;
							
							message.attachments.forEach(attachment => {
				      			if (attachment.url && hasNotAddedImage){
				      				AutoQuote.setImage(`${attachment.url}`);
				      				hasNotAddedImage = false;
				      			}
					  		});

							bot.channels.cache.get(QUOTES).send({embeds:[AutoQuote]});
						}catch(e){
							console.log(e);
						}
					}
				}
			}
		}
	}
}