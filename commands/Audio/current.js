const Discord = require("discord.js");
const glob = require("./_sharedFunctions.js");

let bot;
let variables;

module.exports = {
	name: "current",
	args: 0,
	help: "Displays the currently playing song",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
		variables = glob.variables;
	},
	execute: (message,args) => {
		if (variables.isPlaying){
			let timePassed = new Date(new Date().getTime() - variables.currentSongStart);
			let hrs = timePassed.getHours();
			let duration = "";
			if (hrs > 0){
				duration += `${hrs}:`;
			}
			duration += `${timePassed.getMinutes()}:${timePassed.getSeconds()}`;

			let songLength = "";
			hrs = Math.floor(variables.songQueue[0].lengthSeconds / 3600);
			if (hrs > 0){
				songLength += hrs;
			}
			songLength += `${Math.floor(((variables.songQueue[0].lengthSeconds / 3600) - Math.floor(variables.songQueue[0].lengthSeconds / 3600)) * 60)}:${variables.songQueue[0].lengthSeconds % 60}`;
			let embed = new Discord.MessageEmbed()
				.setTitle("Now Playing")
				.setColor('#add8e6')
				.addField(`Song Info:`,`${variables.songQueue[0].title}\n${variables.songQueue[0].url}\n${Math.floor(variables.songQueue[0].lengthSeconds / 3600)}h ${Math.floor(((variables.songQueue[0].lengthSeconds / 3600) - Math.floor(variables.songQueue[0].lengthSeconds / 3600)) * 60)}m ${variables.songQueue[0].lengthSeconds % 60}s\n${variables.songQueue[0].author}\nDuration: ${duration}/${songLength}`);
			message.channel.send(embed);
		}
	},
}