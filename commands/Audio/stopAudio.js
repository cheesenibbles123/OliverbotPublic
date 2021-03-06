//const glob = require("./_sharedFunctions.js");

let bot;
const variables = require("./_sharedFunctions.js").variables;

module.exports = {
	name: "stopaudio",
	args: 0,
	help: "Stops the bot playing music",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
		//variables = glob.variables;
	},
	execute: (message,args) => {
		if (!variables.isPlaying){
			message.channel.send("I am not currently in a voice channel!");
		}else if (!variables.currentDispatcher){
			message.channel.send("I am not currently playing anything!");
		}else if (!message.member.voice.channel){
			message.channel.send("You must be in the same voice channel!");
		}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
			message.channel.send("You must be in the same voice channel!");
		}else{
			variables.currentDispatcher.destroy();
			bot.voice.connections.get(message.guild.id).disconnect();
			variables.isPlaying = false;
			message.react("🛑");
			message.channel.send("I have stopped");
		}
	},
}