const { reply } = require('./_combinedResponses.js');

module.exports = {
	name: "dox",
	args: [1,10],
	help: "Doxxes the given target",
	usage: "<target>",
	category: "Meme",
	options : [
		{
			name : "target",
			description : "Target to dox ;)",
			type : 3,
			required : true
		}
	],
	executeGlobal: (event,args,isMessage) => {
		let checkString = args.join(' ').toLowerCase();
		if (checkString.includes("@everyone") || checkString.includes("@here")){
			return reply(event,"No.",isMessage);
		}
		reply(event,`Doxing ${args.join(" ")}...`,isMessage);
	}
}