const {reply} = require("./../_combinedResponses");
let bot;

module.exports = {
	name: "totalusers",
	help: "Displays total number of users",
	roles: ["440514569849536512"],
	users: ["337541914687569920"],
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