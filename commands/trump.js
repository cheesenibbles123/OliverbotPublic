const glob = require("./_globalFunctions");
const fetch = require("node-fetch");

module.exports = {
	name: "trump",
	args: [1,30],
	help: "Gives a trump description about the input.",
	usage: "<target>",
	category: "Meme",
	interactionSupport: true,
	options: [
		{
			name : "target",
			description : "Target of trumps opinion",
			required : true,
			type : 3
		}
	],
	execute: (message,args) => {
		if (message.content.includes("everyone") || message.content.includes("here")){
			message.channel.send("nah.");
		}else{
			fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
				message.channel.send(`${args.join(" ")} ${response.messages.personalized[glob.getRandomInt(response.messages.personalized.length)]}`);
			});
		}
	},
	executeInteraction: (interaction,args) => {
		if (args.join(' ').includes("everyone") || args.join(' ').includes("here")){
			interaction.editReply("nah.");
		}else{
			fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
				interaction.editReply(`${args.join(" ")} ${response.messages.personalized[glob.getRandomInt(response.messages.personalized.length)]}`);
			});
		}
	}
}