const config = require("./../config.json");

let bot;

module.exports = {
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (message) => { // Main event code that will be executed on call
		message.attachments.forEach(attachment => {
	    	if (message.attachments.size > 0) {
	      		if (attachment.url){
	        		if (attachment.url.includes(".png") || attachment.url.includes(".jpg") || attachment.url.includes(".jpeg")){
	          			let sightengine = require('sightengine')('1166252206', 'aSwRzSN88ndBsSHyrUWJ');
	          			sightengine.check(['nudity']).set_url(`${attachment.url}`).then(function(result) {
	            			if (result.nudity.raw > 0.65){
	              				let nudityEmbed = new Discord.MessageEmbed()
	                			  .addField("image posted containing possible nudity",`Nudity rating of ${result.nudity.raw * 100}%\nAuthor: ${message.author}     Channel: ${message.channel}\nImage Link: [link](${attachment.url})`);
	             				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(nudityEmbed);
	            			}
	          			}).catch(function(err){
	            			console.log(err);
	          			});
	        		}
	      		}
	    	}
	  	});
	}
}