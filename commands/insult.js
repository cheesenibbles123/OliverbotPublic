const glob = require("./_globalFunctions.js");

module.exports = {
	name: "insult",
	args: [0,100],
	help: "Insults whatever gets input",
	usage: "<target>",
	interactionSupport: true,
	options: [
		{
			name : "target",
			description : "Target to insult",
			type : 3,
			required : true
		}
	],
	execute: (message,args) => {
		mainHandler(interaction,args,true);
	},
	executeInteraction: (interaction,args) => {
		mainHandler(interaction,args,false);
	}
}

function mainHandler(event,args,isMessage){
	let fine = true;
	for (i=0; i<args.length;){
		let mentionrole = event.guild.roles.cache.get(args[i]);
		if (!(typeof mentionrole === "undefined")){
			fine = false;
		}
		i++;
	}
	if (args.join(' ').includes("@everyone") || args.join(' ').includes("@here")){
		glob.reply(event,"No.",isMessage);
		fine = false;
	}
	if (fine){
		glob.loadDataFromFile("insult",args.join(" "),message);
	}else{
		glob.reply(event,"Please enter a correct target. Please also refrain from insulting and pinging roles.",isMessage);
	}
}