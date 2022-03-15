const voiceLIB = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const Discord = require("discord.js");

let bot;
const NO_MIC = "658787196714614816";
/*
{
	name : "",
	url : "",
	length : XX
}
*/

module.exports = {
	init : (botInstance) => {
		bot = botInstance;
	},
	checkAllowed : (member, voiceChannel) => {
		if ( (voiceChannel.id !== bot.audio.channel) && bot.audio.channel !== null){
			return { isValid : false, content : "You must be in the same channel!" };
		}else if (voiceChannel === null){
			return { isValid : false, content : "You must be in a voice channel to run this command!" };
		}

		return { isValid : true };
	},
	playSong : async (songURL) => {
		const songInfo = (
				await ytdl.getInfo(songURL).catch(err => {console.error(err)})
			).player_response.videoDetails;

		bot.audio.songQueue.push({
			title : songInfo.title,
			url : songURL,
			length : songInfo.lengthSeconds,
			author : songInfo.author
		});

		if (!bot.audio.isPlaying){
			play();
		}
	},
	connectToChannel : (channel) => {
		return new Promise((resolve, reject) => {
			const connection = voiceLIB.joinVoiceChannel({
				channelId : channel.id,
				guildId : channel.guild.id,
				adapterCreator : channel.guild.voiceAdapterCreator
			});

			voiceLIB.entersState(connection, voiceLIB.VoiceConnectionStatus.Ready, 30e3).then(conn => {
				resolve({ isValid : true, connection : conn });
			}).catch(err => {
				connection.destroy();
				resolve({ isValid : false, error : err});
			})
		});
	}
}

function play(){
	const song = bot.audio.songQueue[0];
	if (!song){
		return console.log("No song found");
	}

	if (bot.audio.player === null){
		bot.audio.player = voiceLIB.createAudioPlayer()
			.on(voiceLIB.AudioPlayerStatus.Idle, () => {
				bot.audio.songQueue.shift();
				if (bot.audio.songQueue.length < 1){
					bot.audio.player.stop();
					bot.audio.connection.destroy();
					bot.audio.connection = null;
					bot.audio.player = null;
					bot.audio.isPlaying = false;
					bot.audio.isSubscribed = false;
					bot.audio.channel = null;
				}else{
					play();
				}
			}).on('error', () => {
				bot.audio.player.stop(); 
				bot.audio.connection.destroy();
				bot.audio.connection = null;
				bot.audio.player = null;
				bot.audio.songQueue = [];
				bot.audio.isPlaying = false;
				bot.audio.isSubscribed = false;
				bot.audio.channel = null;
			});;
		voiceLIB.entersState(bot.audio.player, voiceLIB.AudioPlayerStatus.Playing, 5e3);
	}

	bot.audio.player.once(voiceLIB.AudioPlayerStatus.Playing, () => {
		bot.audio.isPlaying = true;
		bot.audio.currentSongStart = new Date().getTime();
		const embed = new Discord.MessageEmbed()
			.setTitle("Now Playing")
			.setDescription(`${song.title}\n${song.url}\n${Math.floor(song.length / 3600)}h ${Math.floor(((song.length / 3600) - Math.floor(song.length / 3600)) * 60)}m ${song.length % 60}s\n${song.author}`)
			.setColor('#add8e6');
		bot.channels.cache.get(NO_MIC).send({embeds : [embed]});
	})

	const resource = voiceLIB.createAudioResource(
		ytdl(song.url, {filter: "audioonly", quality : "highestaudio", highWaterMark: 1<<25}, {highWaterMark: 1}, {bitrate: 192000}),
		{
			inputType: voiceLIB.StreamType.Arbitrary
		}
	);

	if (!bot.audio.isSubscribed){
		bot.audio.connection.subscribe(bot.audio.player);
		bot.audio.isSubscribed = true;
	}

	bot.audio.player.play(resource);

}