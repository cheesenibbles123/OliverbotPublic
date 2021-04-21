const fetch = require("node-fetch");
const Discord = require("discord.js");

module.exports = {
	name: "chuck",
	args: 0,
	help: "Gets a random certified chuck norris statement.",
	category: "Meme",
	execute: (message,args) => {
		fetch("https://api.chucknorris.io/jokes/random").then(res => res.json()).then(response => {
			let ChuckNorrisEmbed = new Discord.MessageEmbed()
				.setDescription(`${response.value}`)
				.setThumbnail("https://s3.amazonaws.com/mf-cnorris/assets/uploads/2016/10/19123509/timeline-05.jpg")
				.setTimestamp();
			message.channel.send(ChuckNorrisEmbed);
		});
	}
}