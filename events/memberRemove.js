const config = require("./../config.json");

let bot;

module.exports = {
	name : "GUILD_MEMBER_REMOVE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : async (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		try{
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				rawEmbed.setColor(config.embedColours.bans)
					.setTitle("User Kicked")
					.addField("User",`${entry.target}`)
					.addField("Executor",`${entry.executor}`)
					.addField("Reason",`${entry.reason}`)
					.setThumbnail(`${entry.target.displayAvatarURL()}`);
					bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(rawEmbed);
			}
		}catch(e){
			console.log("Someone left :(");
		}
	}
}