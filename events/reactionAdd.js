const config = require("./../config.json");
const db = require("./../startup/database.js");

let bot;

module.exports = {
	name : "MESSAGE_REACTION_ADD", // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call
		/*if (event.d.channel_id === "762401591180525608"){
			// manageJoinReaction(event);
		}else*/
		if (event.d.channel_id === "607491352598675457" && db.adjustableConfig.reactions.reactionMenu){
			let member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
			db.adjustableConfig.reactionRoles.forEach(roleInfo => {
				if (event.d.emoji.name === roleInfo.EmojiName){ 
					let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
					if (!message.members.cache.roles.has(roleInfo.RoleID)){
						member.roles.add(role);
					}
				}
			});
		}
	}
}