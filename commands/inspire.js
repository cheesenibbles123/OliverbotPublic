const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
	name: "inspire",
	help: "Gets an image from inspirebot",
	category: "Meme",
	interactionSupport: true,
	execute: (message,args) => {
		fetch("http://inspirobot.me/api?generate=true").then(resp => resp.text()).then(picture => {
			let InspireImage = new Discord.MessageEmbed()
				.setImage(`${picture}`)
				.setTimestamp();
			message.channel.send(InspireImage);
		});
	},
	executeInteraction: (interaction,args) => {
		fetch("http://inspirobot.me/api?generate=true").then(resp => resp.text()).then(picture => {
			let InspireImage = new Discord.MessageEmbed()
				.setImage(`${picture}`)
				.setTimestamp();
			interaction.editReply(InspireImage);
		});
	}
}