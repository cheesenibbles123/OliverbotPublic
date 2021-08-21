const fetch = require("node-fetch");
const Discord = require("discord.js");
const {reply} = require("./_combinedResponses.js");

module.exports = {
	name: "advice",
	help: "Grabs some random advice",
	executeGlobal: (event,args,isMessage) => {
		fetch(`https://api.adviceslip.com/advice`).then(res => res.json()).then(response => {
			let Advice = new Discord.MessageEmbed()
				.setDescription(`${response.slip.advice} ID:${response.slip.id}`);
			reply(event,{embeds:[Advice]},isMessage);
		});
	}
}