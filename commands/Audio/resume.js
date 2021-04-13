const Discord = require("discord.js");
const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "resume",
	args: 0,
	help: "Resumes the current track",
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
			variables.currentDispatcher.resume();
			glob.embedHandler(message,1,null);
		}
	},
}