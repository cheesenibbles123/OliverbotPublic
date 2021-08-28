const {reply} = require("./../_combinedResponses");
const { MODERATOR } = require("./../../structs/roles");
let bot;

module.exports = {
	name: "totalusers",
	help: "Displays total number of users",
	roles: [ MODERATOR ],
	default_permission : false,
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {
		reply(event,`${event.guild.members.cache.filter(member => !member.user.bot).size}`,isMessage);
	}
}