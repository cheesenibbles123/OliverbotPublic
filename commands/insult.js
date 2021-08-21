const glob = require("./_globalFunctions");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "insult",
	args: [1,100],
	help: "Insults whatever gets input",
	usage: "<target>",
	options: [
		{
			name : "target",
			description : "Target to insult",
			type : 3,
			required : true
		}
	],
	executeGlobal: (event,args,isMessage) => {
		let fine = true;
		for (i=0; i<args.length;){
			let mentionrole = event.guild.roles.cache.get(args[i]);
			if (!(typeof mentionrole === "undefined")){
				fine = false;
			}
			i++;
		}
		let checkString = args.join(' ').toLowerCase();
		if (checkString.includes("@everyone") || checkString.includes("@here")){
			reply(event,"No.",isMessage);
			fine = false;
		}
		if (fine){
			glob.loadDataFromFile(event,isMessage,"insult",args.join(" "));
		}else{
			reply(event,"Please enter a correct target. Please also refrain from insulting and pinging roles.",isMessage)
		}
	}
}