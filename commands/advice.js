const fetch = require("node-fetch");
const Discord = require("discord.js");

module.exports = {
	name: "advice",
	args: 0,
	help: "Grabs some random advice",
	execute: (message,args) => {
		fetch(`https://api.adviceslip.com/advice`).then(res => res.json()).then(response => {
			let Advice = new Discord.MessageEmbed()
				.setDescription(`${response.slip.advice} ID:${response.slip.id}`);
			message.channel.send(Advice);
		});
	}
}