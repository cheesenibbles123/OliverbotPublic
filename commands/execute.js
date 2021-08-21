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
			rely("You need to say who to execute! 🤦");
		}else if (checkString.includes("@everyone") || checkString.includes("@here")){
			rely("Nah.");
		}else{
			rely(`Executing ${args.join(" ")}...\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`);
		}
	}
}