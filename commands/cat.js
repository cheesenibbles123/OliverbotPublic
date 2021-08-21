const fetch = require("node-fetch");
const {reply} = require("./_combinedResponses.js");

module.exports = {
	name: "cat",
	interactionSupport: true,
	help: "Gets a random cat image",
	executeGlobal: (event,args,isMessage) => {
		fetch("https://api.thecatapi.com/v1/images/search").then(res => res.json()).then(response =>{
			reply(event,response[0].url,isMessage);
		});
	}
}