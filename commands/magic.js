module.exports = {
	name: "magic",
	help: "Magic!",
	interactionSupport: true,
	execute: (message,args) => {
		message.channel.send("https://giphy.com/gifs/magical-KFNQuuT1qx7I4");
	},
	executeInteraction: (interaction,args) => {
		interaction.editReply("https://giphy.com/gifs/magical-KFNQuuT1qx7I4");
	}
}