const Discord = require("discord.js");
const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "pause",
	args: 0,
	help: "Pauses the current track",
	init: (botInstance) => {
		bot = botInstance;
		variables = glob.variables;
	},
	execute: (message,args) => {
		if (!variables.isPlaying){
			message.reply("I am not playing any music!");
		}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
			message.channel.send("You must be in the same voice channel!");
		}else{
			variables.currentDispatcher.pause();
			glob.embedHandler(message,0,null);
		}
	},
}