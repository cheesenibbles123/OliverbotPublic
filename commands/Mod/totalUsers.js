module.exports = {
	name: "totalusers",
	args: 2,
	help: "Displays total number of users",
	roles: ["440514569849536512"],
	execute: (message,args) => {
		message.channel.send(message.guild.members.cache.filter(member => !member.user.bot).size);
	}
}