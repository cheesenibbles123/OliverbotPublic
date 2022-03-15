const Discord = require("discord.js");

let bot;

module.exports = {
	name: "clear",
	args: 0,
	help: "Clears the current queue",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (message.member.voice.channel.id !== bot.audio.channel){
			message.channel.send("You must be in the same voice channel!");
		}else{
			bot.audio.songQueue = [];
			message.reply({embeds : [new Discord.MessageEmbed().setTitle("Queue cleared")]});
		}
	},
}