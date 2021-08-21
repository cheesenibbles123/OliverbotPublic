const glob = require("./_globalFunctions");
const {reply} = require("./_combinedResponses")
const fetch = require("node-fetch");

module.exports = {
	name: "today",
	args: 1,
	help: "Gets a random historical moment that occured at this time.",
	usage: "<type>",
	options: [
		{
			name : "type",
			description : "Event type",
			type : 3,
			required : true,
			choices : [
				{
					name : "Events",
					value : "events"
				},
				{
					name : "Births",
					value : "births"
				},
				{
					name : "Deaths",
					value : "deaths"
				}
			]
		}
	],
	executeGlobal: (event,args,isMessage) => {
		if (args[0]){
			let allowedInputs = ["events","births","deaths"];
			if (allowedInputs.indexOf(args[0]) >= 0){
				let date = new Date();
				fetch(`http://history.muffinlabs.com/date/${parseInt(date.getMonth()) + 1}/${date.getDate()}`).then(res => res.json()).then(response => {
					if (args[0] === "events"){
				 		let num = glob.getRandomInt(response.data.Events.length);
						reply(event,"```"+`${response.data.Events[num].year} - ${response.data.Events[num].text}`+"```",isMessage);
					}else if (args[0] === "births"){
						let num = glob.getRandomInt(response.data.Births.length);
						reply(event,"```"+`${response.data.Births[num].year} - ${response.data.Births[num].text}`+"```",isMessage);
					}else if (args[0] === "deaths"){
						let num = glob.getRandomInt(response.data.Deaths.length);
						reply(event,"```"+`${response.data.Deaths[num].year} - ${response.data.Deaths[num].text}`+"```",isMessage);
					}
				});
			}else{
				reply(event,"That type doesnt exist!",isMessage);
			}
		}else{
			reply(event,"You need to give the type!",isMessage);
		}
	}
}