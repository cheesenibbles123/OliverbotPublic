const fetch = require("node-fetch");
const Discord = require("discord.js");
const {reply} = require("./_combinedResponses.js");

module.exports = {
	name: "chuck",
	help: "Gets a random certified chuck norris statement.",
	category: "Meme",
	interactionSupport: true,
	executeGlobal: (event,args,isMessage) => {
		fetch("https://api.chucknorris.io/jokes/random").then(res => res.json()).then(response => {
			let ChuckNorrisEmbed = new Discord.MessageEmbed()
				.setDescription(`${response.value}`)
				.setThumbnail("https://s3.amazonaws.com/mf-cnorris/assets/uploads/2016/10/19123509/timeline-05.jpg")
				.setTimestamp();
			reply(event,{embeds: [ChuckNorrisEmbed]},isMessage);
		});
	}
}
