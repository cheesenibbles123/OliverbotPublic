module.exports = {
	name: "nerds",
	args: 0,
	help: "Pings all the nerds",
	execute: (message,args) => {
		if (message.member.roles.cache.has("639142448345513984")){
			message.channel.send("<@&639142448345513984> Assemble!");
		}
	}
}