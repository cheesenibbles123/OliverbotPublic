module.exports = {
	name: "ping",
	help: "Pong!",
	interactionSupport: true,
	execute: (message,args) => {
		message.react("🏓");
	},
	executeInteraction: (interaction,args) => {
		interaction.editReply("🏓");
	}
}