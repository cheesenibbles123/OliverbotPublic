const glob = require("./_globalFunctions");
const fetch = require("node-fetch");

module.exports = {
	name: "today",
	args: 1,
	help: "Gets a random historical moment that occured at this time.",
	execute: (message,args) => {
		if (args[0]){
			let allowedInputs = ["events","births","deaths"];
			if (allowedInputs.indexOf(args[0]) >= 0){
				let date = new Date();
				fetch(`http://history.muffinlabs.com/date/${parseInt(date.getMonth()) + 1}/${date.getDate()}`).then(res => res.json()).then(response => {
					if (argument === "events"){
				 		let num = glob.getRandomInt(response.data.Events.length);
						message.channel.send("```"+`${response.data.Events[num].year} - ${response.data.Events[num].text}`+"```");
					}else if (argument === "births"){
						let num = glob.getRandomInt(response.data.Births.length);
						message.channel.send("```"+`${response.data.Births[num].year} - ${response.data.Births[num].text}`+"```");
					}else if (argument === "deaths"){
						let num = glob.getRandomInt(response.data.Deaths.length);
						message.channel.send("```"+`${response.data.Deaths[num].year} - ${response.data.Deaths[num].text}`+"```");
					}
				});
			}else{
				message.channel.send("That type doesnt exist!");
			}
		}else{
			message.channel.send("You need to give the type!");
		}
	}
}