const ytdl = require("ytdl-core");
const Discord = require("discord.js");
const fs = require("fs");
const glob = require("./globalFunctions")

var adjustableConfig;
var isPlaying = false;
var currentDispatcher = null;
var currentSongInfo;
var bot;

exports.isPlaying = isPlaying;

exports.init = function init(){
	adjustableConfig = require("./../oliverbot.js").adjustableConfig;
	bot = require("./../oliverbot.js").bot;
}

exports.handler = function handler(message,command,args){
	switch (command){
		case "play":
			setupTune(message,args,args === null ? true : false);
			break;
		case "pause":
			pauseAudio(message);
			break;
		case "resume":
			resumeAudio(message);
			break;
		case "stopaudio":
			stopAudio(message);
			break;
		case "volume":
			setVolume(message,parseFloat(args[0]).toFixed(3));
			break;

	}
}

async function setupTune(message,args,fromFile){
	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel){
		message.reply("You must be in a voice channel!");
	//}else if (!adjustableConfig.music.generalAudio){
	//	message.channel.send(issueEmbed.grabEmbed(4,null));
	}else if (isPlaying){
		message.reply("I'm already playing!");
	}else{
		if (fromFile){
			let file = fs.readFileSync("./datafile.json").toString();
			file = JSON.parse(file);
			let a = glob.getRandomInt(file.pingedSounds.length);
			let randomsong = file.pingedSounds[a].toString();
			playAudio(message,randomsong,voiceChannel);
		}else{
			song = args.join("");
			if (song.includes("https://www.youtube.com/watch?v=")){
				let songInfo = await ytdl.getInfo(song);

				songInfo = songInfo.player_response.videoDetails;

				playAudio(message,song,voiceChannel);

				let embed = new Discord.MessageEmbed()
					.setTitle("Now Playing")
					.setColor('#add8e6')
					.addField(`Song Info:`,`${songInfo.title}\n${song}\n${Math.floor(songInfo.lengthSeconds / 3600)}h ${Math.floor(((songInfo.lengthSeconds / 3600) - Math.floor(songInfo.lengthSeconds / 3600)) * 60)}m ${songInfo.lengthSeconds % 60}s\n${songInfo.author}`)
					.setThumbnail(`${message.author.displayAvatarURL()}`)
					.setTimestamp();
				message.channel.send(embed).then(msg => {
					setTimeout(function(){
						msg.delete();
					},songInfo.lengthSeconds * 1000);
				});
			}else{
				message.reply("Please enter a valid youtube link!");
			}
		}
	}
}

function stopAudio(message){
	//if (!adjustableConfig.music.generalAudio){
	//	message.channel.send(issueEmbed.grabEmbed(4,null));
	//}else
	if (!isPlaying){
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

async function playAudio(message,song,voiceChannel){
	isPlaying = true;
	voiceChannel.join().then(connection =>{
		connection.voice.setSelfDeaf(true);
		currentDispatcher = connection
			.play(
        	  	ytdl(song,{filter:'audioonly',quality:'highestaudio',highWaterMark:1<<25}, {highWaterMark: 1},{bitrate: 192000})
      		)
      		.on("finish",() =>{
      			voiceChannel.leave();
      			isPlaying = false;
      			currentDispatcher.destroy();
      		})
      		.on("error",e=>{
      			console.error(e);
     		 	voiceChannel.leave();
     		 	isPlaying = false;
     		 	currentDispatcher.destroy();
     		});
     	currentDispatcher.setVolumeLogarithmic(0.5);
    });
}

function setVolume(message,volume){
	if (!isPlaying){
		message.reply("I am not playing any music!");
	}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else if (volume < 0.2){
		message.channel.send("I cannot go quieter than 0.2!");
	}else if (volume > 5){
		message.channel.send("I cannot go louder than 5!");
	}else {
		currentDispatcher.setVolumeLogarithmic(volume);
		embedHandler(message,2,volume);
	}
}

function pauseAudio(message){
	if (!isPlaying){
		message.reply("I am not playing any music!");
	}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else{
		currentDispatcher.pause();
		embedHandler(message,0,null);
	}
}

function resumeAudio(message){
	if (!isPlaying){
		message.reply("I am not playing any music!");
	}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else{
		currentDispatcher.resume();
		embedHandler(message,1,null);
	}
}

function embedHandler(message, type, additionInfo){
	let embed = new Discord.MessageEmbed()
		.setColor('#add8e6');
	switch (type){
		case 0:
			embed.setTitle("Pause");
			break;
		case 1:
			embed.setTitle("Resume");
			break;
		case 2:
			embed.setTitle("SetVolume: " + additionInfo);
			break;
	}
	message.channel.send(embed);
}

function getCurrentInfo(){
	currentSongInfo
}