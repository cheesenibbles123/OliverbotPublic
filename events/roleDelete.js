const config = require("./../config.json");
const { ROLE } = require("./../structs/eventColours.js");
const { LOGGING_CHANNEL } = require("./../structs/eventColours.js");

let bot;

module.exports = {
	name : "GUILD_ROLE_DELETE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : async (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
		if (entry.createdTimestamp > (Date.now() - 5000)){
			rawEmbed.setTitle("Role Deleted")
				.setColor(ROLE)
				.setDescription(`${entry.changes[0].old}\nby: ${entry.executor}`);
			bot.channels.cache.get(LOGGING_CHANNEL).send({embeds:[rawEmbed]});
		}
	}
}