const fetch = require("node-fetch");

module.exports = {
	name: "cat",
	args: 0,
	help: "Gets a random cat image",
	execute: (message,args) => {
		fetch("https://api.thecatapi.com/v1/images/search").then(res => res.json()).then(response =>{
			message.channel.send(response[0].url);
		});
	}
}