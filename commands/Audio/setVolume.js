const Discord = require("discord.js");
const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "volume",
	args: 0,
	help: "Sets the current volume",
	init: (botInstance) => {
		bot = botInstance;
		variables = glob.variables;
	},
	execute: (message,args) => {
		let volume = parseFloat(args[0]).toFixed(3);
		if (!variables.isPlaying){
			message.reply("I am not playing any music!");
		}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
			message.channel.send("You must be in the same voice channel!");
		}else if (volume < 0.2){
			message.channel.send("I cannot go quieter than 0.2!");
		}else if (volume > 5){
			message.channel.send("I cannot go louder than 5!");
		}else {
			variables.currentDispatcher.setVolumeLogarithmic(volume);
			glob.embedHandler(message,2,volume);
		}
	},
}