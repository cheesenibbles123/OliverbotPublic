const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "clear",
	args: 0,
	help: "Clears the current queue",
	init: (botInstance) => {
		bot = botInstance;
		variables = glob.variables;
	},
	execute: (message,args) => {
		if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
			message.channel.send("You must be in the same voice channel!");
		}else{
			variables.songQueue = [];
			glob.embedHandler(message,4,null);
		}
	},
}