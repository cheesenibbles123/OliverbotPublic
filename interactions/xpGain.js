const db = require("./../startup/database.js");
const config = require("./../config.json");

module.exports = {
	execute : (message) => { // Main event code that will be executed on call
		//XP Gain
		if (message.guild && message.guild.id === config.serverInfo.serverId){
			db.xpGainHandler(message);
		}
	}
}