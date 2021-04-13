const glob = require("./_globalFunctions");

module.exports = {
	name: "nerds",
	args: 0,
	help: "Pings all the nerds",
	execute: (message,args) => {
		message.channel.send(glob.getRandomInt(7));
	}
}