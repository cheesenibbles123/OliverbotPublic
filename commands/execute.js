module.exports = {
	name: "execute",
	args: 1,
	help: "Executes the provided target",
	category: "Meme",
	execute: (message,args) => {
		if (typeof args[0] === undefined){
			message.channel.send("You need to say who to execute! 🤦");
		}else if (args[0].toLowerCase().includes("everyone") || args[0].toLowerCase().includes("here")){
			message.channel.send("Nah.");
		}else{
			message.channel.send(`Executing ${args.join(" ")}...\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`);
			TrackingCommand = true;
		}
	}
}