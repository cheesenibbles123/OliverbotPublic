const glob = require("./_globalFunctions");
const fetch = require("node-fetch");

module.exports = {
	name: "trump",
	args: [0,30],
	help: "Gives a trump description about the input.",
	usage: "<target>",
	category: "Meme",
	execute: (message,args) => {
		if (message.content.includes("everyone") || message.content.includes("here")){
			message.channel.send("nah.");
		}else{
			fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
				message.channel.send(`${args.join(" ")} ${response.messages.personalized[glob.getRandomInt(response.messages.personalized.length)]}`);
			});
		}
	}
}