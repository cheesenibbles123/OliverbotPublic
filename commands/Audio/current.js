const Discord = require("discord.js");

let bot;

module.exports = {
	name: "current",
	args: 0,
	help: "Displays the currently playing song",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (bot.audio.isPlaying){
			const timePassed = new Date(new Date().getTime() - bot.audio.currentSongStart);
			let hrs = timePassed.getHours();
			let duration = "";
			if (hrs > 0){
				duration += `${hrs}:`;
			}
			duration += `${timePassed.getMinutes()}:${timePassed.getSeconds()}`;

			let songLength = "";
			hrs = Math.floor(bot.audio.songQueue[0].lengthSeconds / 3600);
			if (hrs > 0){
				songLength += hrs;
			}
			songLength += `${Math.floor(((bot.audio.songQueue[0].lengthSeconds / 3600) - Math.floor(bot.audio.songQueue[0].lengthSeconds / 3600)) * 60)}:${bot.audio.songQueue[0].lengthSeconds % 60}`;
			const embed = new Discord.MessageEmbed()
				.setTitle("Now Playing")
				.setColor('#add8e6')
				.addField(`Song Info:`,`${bot.audio.songQueue[0].title}\n${bot.audio.songQueue[0].url}\n${Math.floor(bot.audio.songQueue[0].lengthSeconds / 3600)}h ${Math.floor(((bot.audio.songQueue[0].lengthSeconds / 3600) - Math.floor(bot.audio.songQueue[0].lengthSeconds / 3600)) * 60)}m ${bot.audio.songQueue[0].lengthSeconds % 60}s\n${bot.audio.songQueue[0].author}\nDuration: ${duration}/${songLength}`);
			message.reply({embeds:[embed]});
		}
	},
}