const config = require("./../config.json");

let bot;

module.exports = {
	name : "GUILD_ROLE_CREATE", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		if (event.d.guild_id !== config.serverInfo.serverId) return;

		let rawEmbed = new Discord.MessageEmbed()
			.setTimestamp();

		rawEmbed.setTitle("Role Created")
			.setColor(config.embedColours.roles)
			.addField("Role:",`${event.d.role.name}\n<@&${event.d.role.id}>`);
			
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(rawEmbed);
	}
}