const db = require("./../commands/_databaseSetup.js");
const config = require("./../config.json");

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
		if (db.adjustableConfig.quotes.active && message.guild.id === config.serverInfo.serverId){
			if (autoQuoteNotAllowedCategories.indexOf(parseInt(message.channel.parentID)) === -1){
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
				    		if (message.attachments.size === 1) {
				      			if (attachment.url && hasNotAddedImage){
				      				AutoQuote.setImage(`${attachment.url}`);
				      				hasNotAddedImage = false;
				      			}
				    		}
				  		});

						bot.channels.cache.get(config.serverInfo.channels.quotes).send(AutoQuote);
					}catch(e){
						console.log("I CANNOT DO THIS, PLEASE HELP!");
						console.log(e);
					}
				}
			}
		}
	}
}