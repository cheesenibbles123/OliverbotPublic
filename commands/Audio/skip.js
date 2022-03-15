const Discord = require("discord.js");

let bot;

module.exports = {
	name: "skip",
	args: 0,
	help: "Skips the current song",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (!bot.audio.isPlaying){
			message.channel.send("I am not currently in a voice channel!");
		}else if (!bot.audio.player){
			message.channel.send("I am not currently playing anything!");
		}else if (!message.member.voice.channel){
			message.channel.send("You must be in a voice channel!");
		}else if (message.member.voice.channel.id !== bot.audio.channel){
			message.channel.send("You must be in the same voice channel!");
		}else{
			bot.audio.player.stop();
			message.reply({embeds : [new Discord.MessageEmbed().setTitle("Track Skipped")]});
		}
	},
}