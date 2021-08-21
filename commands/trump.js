const glob = require("./_globalFunctions");
const fetch = require("node-fetch");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "trump",
	args: [1,30],
	help: "Gives a trump description about the input.",
	usage: "<target>",
	category: "Meme",
	options: [
		{
			name : "target",
			description : "Target of trumps opinion",
			required : true,
			type : 3
		}
	],
	executeGlobal: (event,args,isMessage) => {
		let checkString = args.join(' ');

		if (checkString.includes("everyone") || checkString.includes("here")){
			reply(event,"nah.",isMessage);
		}else{
			fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
				reply(event,`${args.join(" ")} ${response.messages.personalized[glob.getRandomInt(response.messages.personalized.length)]}`,isMessage);
			});
		}
	}
}