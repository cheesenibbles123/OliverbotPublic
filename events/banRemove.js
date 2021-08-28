const config = require("./../config.json");
const { BAN } = require("./../structs/eventColours.js");
const { LOGGING_CHANNEL } = require("./../structs/channels");

let bot;

module.exports = {
	name : "GUILD_BAN_REMOVE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : async (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
		rawEmbed.setColor(BAN)
			.setTitle("User Unbanned")
			.addField("User",`${entry.target}`)
			.addField("Executor",`${entry.executor}`)
			.setThumbnail(`${entry.target.displayAvatarURL()}`);
		bot.channels.cache.get(LOGGING_CHANNEL).send({embeds:[rawEmbed]});
	}
}