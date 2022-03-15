let bot;

module.exports = {
	name: "stopaudio",
	args: 0,
	help: "Stops the bot playing music",
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
			message.channel.send("You must be in the same voice channel!");
		}else if (message.member.voice.channel.id !== bot.audio.channel){
			message.channel.send("You must be in the same voice channel!");
		}else{
			bot.audio.player.stop();
			bot.audio.connection.destroy();
			bot.audio.isPlaying = false;
			bot.audio.isSubscribed = false;
			bot.audio.player = null;
			bot.audio.connection = null;
			bot.audio.channel = null;
			bot.audio.songQueue = [];
			message.react("🛑");
			message.reply("I have stopped");
		}
	},
}