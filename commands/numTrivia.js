const fetch = require("node-fetch");

module.exports = {
	name: "numtrivia",
	help: "Gives you info about a random number",
	interactionSupport: true,
	execute: (message,args) => {
		fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
			message.channel.send("```"+`${response}`+"```");
		});
	},
	executeInteraction: (interaction,args) => {
		fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
			interaction.editReply("```"+`${response}`+"```");
		});
	}
}