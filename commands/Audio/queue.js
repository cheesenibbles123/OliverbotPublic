const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "queue",
	args: 0,
	help: "Displays the current queue",
	init: (botInstance) => {
		bot = botInstance;
		variables = glob.variables;
	},
	execute: (message,args) => {
		if (varaibles.isPlaying){
			let finalMsg = "```\n";
			for (let i=0; i < variables.songQueue.length; i++){
				if (finalMsg.length < 500){
					finalMsg += `${i} : ${variables.songQueue[i].title}\n`;
				}else{
					finalMsg += `Displaying ${i}/${varaibles.songQueue.length}\n`;
					break;
				}
			}
			message.channel.send(finalMsg + "```");
		}
	},
}