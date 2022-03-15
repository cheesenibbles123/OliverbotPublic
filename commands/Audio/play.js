const voice = require("@discordjs/voice");
const wrapper = require("./_musicLib.js");

let bot;

module.exports = {
	name : "play",
	args : 1,
	init : (botInstance) => {
		bot = botInstance;
		wrapper.init(botInstance);
	},
	execute : async (message, args) => {
		const voiceChannel = message.member.voice.channel;

		const isAllowed = wrapper.checkAllowed(message.member, voiceChannel);
		if (!isAllowed.isValid){
			return message.reply(isAllowed.content);
		}

		if (!bot.audio.connection){
			const connection = await wrapper.connectToChannel(voiceChannel);
			if (!connection.isValid){
				console.error(connection.error);
				return message.reply("An error occured.");
			}
			bot.audio.connection = connection.connection;
		}
		
		bot.audio.channel = voiceChannel.id;
		wrapper.playSong(args.join(""));

	}
}