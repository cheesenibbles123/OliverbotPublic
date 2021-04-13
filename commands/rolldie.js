const glob = require("./_globalFunctions");

module.exports = {
	name: "rolldie",
	args: 0,
	help: "Rolls a die",
	execute: (message,args) => {
		message.channel.send(glob.getRandomInt(7));
	}
}