let bot;

module.exports = {
	name: "queue",
	args: 0,
	help: "Displays the current queue",
	category: "Audio",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (bot.audio.isPlaying){
			let finalMsg = "```\n";
			for (let i=0; i < bot.audio.songQueue.length; i++){
				if (finalMsg.length < 500){
					finalMsg += `${i} : ${bot.audio.songQueue[i].title}\n`;
				}else{
					finalMsg += `Displaying ${i}/${bot.audio.songQueue.length}\n`;
					break;
				}
			}
			message.channel.send(finalMsg + "```");
		}
	},
}