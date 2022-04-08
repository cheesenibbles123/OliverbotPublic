const {reply} = require("./_combinedResponses");

module.exports = {
	name: "execute",
	args: [1,100],
	help: "Executes the provided target",
	usage: "<target>",
	category: "Meme",
	options : [
		{
			name : "target",
			description : "Target to execute ;)",
			type : 3,
			required : true
		}
	],
	executeGlobal: (event,args,isMessage) => {
		let checkString = args.join(' ').toLowerCase();
		if (typeof args[0] === undefined){
			reply(event, "You need to say who to execute! 🤦", isMessage);
		}else if (checkString.includes("@everyone") || checkString.includes("@here")){
			reply(event, "Nah.", isMessage);
		}else{
			reply(event, `Executing ${args.join(" ")}...\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`, isMessage);
		}
	}
}