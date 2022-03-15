const Discord = require("discord.js");

let bot;

module.exports = {
	name: "resume",
	args: 0,
	help: "Resumes the current track",
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
			bot.audio.player.unpause();
			message.reply({embeds : [new Discord.MessageEmbed().setTitle("Track Resumed")]});
		}
	},
}