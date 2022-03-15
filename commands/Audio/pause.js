const Discord = require("discord.js");

let bot;

module.exports = {
	name: "pause",
	args: 0,
	help: "Pauses the current track",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (!bot.audio.isPlaying){
			message.reply("I am not playing any music!");
		}else if (message.member.voice.channel.id !== bot.audio.channel){
			message.channel.send("You must be in the same voice channel!");
		}else{
			bot.audio.player.pause();
			message.reply({embeds : [new Discord.MessageEmbed().setTitle("Track Paused")]});
		}
	},
}