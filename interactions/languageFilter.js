const config = require("./config.json");
const db = require("./commands/_databaseSetup.js");

let bot;

module.exports = {
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (message) => { // Main event code that will be executed on call
		if (message.guild){
			//N word filter
			if (message.content.toLowerCase().includes('nigger') && db.adjustableConfig.misc.nWordFilter){
				if ( message.member.roles.cache.has(config.serverInfo.roles.serverModerator) || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
					// Ignore
				}else if (message.guild.id === config.serverInfo.serverId && adjustableConfig.misc.nWordFilter){
					message.delete();
					message.channel.send(message.author+" Please dont use that language!");
					bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("Message: "+message.content+" , has been deleted. Author: <@"+message.author,id+">");
				}
				db.updateNWordCounter(message);
			}
		}
	}
}
