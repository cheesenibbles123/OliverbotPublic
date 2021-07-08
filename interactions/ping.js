const config = require("./../config.json");
const audio = {};

let bot;

module.exports = {
	enabled : 0,
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (message) => { // Main event code that will be executed on call
		//Ping Oliverbot
		if (message.content.startsWith("<@!556545106468012052>")){
			TrackingCommand = true;
			message.react("🤔");
			if(message.member.voice.channel){
				audio.handler(message, "play", null);
			}
		}
	}
}