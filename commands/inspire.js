const Discord = require("discord.js");
const fetch = require("node-fetch");
const {reply} =require("./_combinedResponses");

module.exports = {
	name: "inspire",
	help: "Gets an image from inspirebot",
	category: "Meme",
	interactionSupport: true,
	executeGlobal: (message,args) => {
		fetch("http://inspirobot.me/api?generate=true").then(resp => resp.text()).then(picture => {
			let InspireImage = new Discord.MessageEmbed()
				.setImage(`${picture}`)
				.setTimestamp();
			reply(event,{embeds:[InspireImage]},isMessage);
		});
	}
}