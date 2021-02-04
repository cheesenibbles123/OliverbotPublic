const ytdl = require("ytdl-core");
const Discord = require("discord.js");

var adjustableConfig;
var isPlaying = false;
var currentDispatcher = null;

exports.isPlaying = isPlaying;

exports.init = function init(){
	adjustableConfig = require("./../oliverbot.js").adjustableConfig;
}

exports.handler = function handler(message,commands,args){
	switch (command){
		case "playaudio":
			playAudio(message);
			break;
		case "stopaudio":
			stopAudio(message);
			break;
	}
}

async function playAudio(message){
	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel){
		message.reply("You must be in a voice channel!");
	}else if (!adjustableConfig.music.generalAudio){
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}else if (isPlaying){
		message.reply("I'm already playing!");
	}else{
		song = args.join("");
		if (song.includes("https://www.youtube.com/watch?v=")){
			let songInfo = await ytdl.getInfo(song);
			playAudio(message,args,voiceChannel);
			let embed = new Discord.MessageEmbed()
				.setTitle("Now Playing")
				.setColor('#add8e6')
				.addField(`Song Info:`,`${songInfo.title}\n${songInfo.video_url}\n${Math.floor(songInfo.length_seconds / 3600)}h ${Math.floor(((songInfo.length_seconds / 3600) - Math.floor(songInfo.length_seconds / 3600)) * 60)}m ${songInfo.length_seconds % 60}s\n${songInfo.player_response.videoDetails.author}`)
				.setThumbnail(`${message.author.displayAvatarURL()}`)
				.setTimestamp();
			message.channel.send(embed).then(msg => {
				setTimeout(function(){
					msg.delete();
				},songInfo.length_seconds * 1000);
			});
		}else{
			message.reply("Please enter a valid youtube link!");
		}
	}
}

function stopAudio(message){
	if (!adjustableConfig.music.generalAudio){
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}else if (!isPlaying){
		message.channel.send("I am not currently in a voice channel!");
	}else if (!currentDispatcher){
		message.channel.send("I am not currently playing anything!");
	}else if (!message.member.voice.channel){
		message.channel.send("You must be in the same voice channel!");
	}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else{
		currentDispatcher.destroy();
		bot.voice.connections.get(message.guild.id).disconnect();
		isPlaying = false;
		message.react("🛑");
		message.channel.send("I have stopped");
	}
}

async function playAudio(message,args,voiceChannel){
	isPlaying = true;
	voiceChannel.join().then(connection =>{
		currentDispatcher = connection
			.play(
        	  	ytdl(args.join(""),{filter:'audioonly',quality:'highestaudio',highWaterMark:1<<25}, {highWaterMark: 1},{bitrate: 192000})
      		)
      		.on("finish",() =>{
      			voiceChannel.leave();
      			isPlaying = false;
      		})
      		.on("error",e=>{
      			console.error(e);
     		 	voiceChannel.leave();
     		 	isPlaying = false;
     		});
     	currentDispatcher.setVolumeLogarithmic(1);
    });
}