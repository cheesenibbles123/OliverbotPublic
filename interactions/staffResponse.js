let bot;

module.exports = {
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (message) => { // Main event code that will be executed on call
		// If in a server
		if (message.guild){
			// random staff channel message
			if (message.channel.id === config.serverInfo.channels.staffChannels.moderator || message.channel.id === config.serverInfo.channels.staffChannels.serverAdministrator || message.channel.id === config.serverInfo.channels.staffChannels.discordAdministrator){
				if (glob.getRandomInt(1000) === 6){
					message.channel.send("Hmmm, yes, much discussion <:thonkhonk:690138132343160854>");
				}
			}
		}
	}
}
