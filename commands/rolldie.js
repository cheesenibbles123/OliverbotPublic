const glob = require("./_globalFunctions");

module.exports = {
	name: "rolldie",
	help: "Rolls a die",
	interactionSupport: true,
	execute: (message,args) => {
		message.channel.send(glob.getRandomInt(7));
	},
	executeInteraction: (interaction,args) => {
		interaction.editReply(glob.getRandomInt(7));
	}
}