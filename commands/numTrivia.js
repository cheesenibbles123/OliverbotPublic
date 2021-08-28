const fetch = require("node-fetch");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "numtrivia",
	help: "Gives you info about a random number",
	executeGlobal: (event,args,isMessage) => {
		fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
			reply(event,"```"+`${response}`+"```",isMessage);
		});
	}
}