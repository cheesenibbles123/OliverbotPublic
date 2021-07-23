const glob = require("_globalFunctions.js");

module.exports = {
	name: "insult",
	args: [0,100],
	help: "Insults whatever gets input",
	execute: async (message,args) => {
		let fine = true;
		for (i=0; i<args.length;){
			let mentionrole = message.guild.roles.cache.get(args[i]);
			if (!(typeof mentionrole === "undefined")){
				fine = false;
			}
			i++;
		}
		if (message.content.includes("@everyone") || message.content.includes("@here")){
			message.channel.send("No.");
			fine = false;
		}
		if (fine){
			glob.loadFromDatafile(command,args.join(" "),message);
		}else{
			message.reply("Please enter a correct target. Please also refrain from insulting and pinging roles.");
		}
	}
}