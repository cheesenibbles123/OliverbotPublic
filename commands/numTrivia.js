const fetch = require("node-fetch");

module.exports = {
	name: "numtrivia",
	args: 0,
	help: "Gives you info about a random number",
	execute: (message,args) => {
		fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
			message.channel.send("```"+`${response}`+"```");
		});
	}
}