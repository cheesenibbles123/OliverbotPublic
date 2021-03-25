const ytdl = require("ytdl-core");
const Discord = require("discord.js");
const fs = require("fs");
const glob = require("./globalFunctions")

var adjustableConfig;
var isPlaying = false;
var currentDispatcher = null;
var currentSongInfo;
var bot;
var songQueue = [];
let connection;

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
		case "queue":
			getCurrentQueue(message);
			break;
		case "current":
			getCurrentInfo(message);
			break;
		case "clear":
			clearQueue(message);
			break;
		case "skip":
			skipTrack(message);
			break;
	}
}

async function setupTune(message,args,fromFile){
	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel){
		message.reply("You must be in a voice channel!");
	//}else if (!adjustableConfig.music.generalAudio){
	//	message.channel.send(issueEmbed.grabEmbed(4,null));
	}else{
		if (fromFile && !isPlaying){
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

				songQueue.push({
					"title" : songInfo.title,
					"url" : song,
					"lengthSeconds" : songInfo.lengthSeconds,
					"author" : songInfo.author
				});

				if (!isPlaying){
					playAudio(message,null,voiceChannel);
				}else{
					let embed = new Discord.MessageEmbed()
						.setTitle("Added to Queue")
						.setColor('#add8e6')
						.setDescription(`${songInfo.title}\n${song}\n${Math.floor(songInfo.lengthSeconds / 3600)}h ${Math.floor(((songInfo.lengthSeconds / 3600) - Math.floor(songInfo.lengthSeconds / 3600)) * 60)}m ${songInfo.lengthSeconds % 60}s\n${songInfo.author}`);
					message.channel.send(embed);
				}
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

	if (song === null){
		let embed = new Discord.MessageEmbed()
			.setTitle("Now Playing")
			.setColor('#add8e6')
			.addField(`Song Info:`,`${songQueue[0].title}\n${songQueue[0].url}\n${Math.floor(songQueue[0].lengthSeconds / 3600)}h ${Math.floor(((songQueue[0].lengthSeconds / 3600) - Math.floor(songQueue[0].lengthSeconds / 3600)) * 60)}m ${songQueue[0].lengthSeconds % 60}s\n${songQueue[0].author}`);
		message.channel.send(embed).then(msg => {
			setTimeout(function(){
				msg.delete();
			},songQueue[0].lengthSeconds * 1000);
		});

		song = songQueue[0].url;
	}

	if (!connection){
		await voiceChannel.join().then(connec => {
			connection = connec;
			connection.voice.setSelfDeaf(true);
		});
	}

	currentDispatcher = connection
		.play(
    	  	ytdl(song,{filter:'audioonly',quality:'highestaudio',highWaterMark:1<<25}, {highWaterMark: 1},{bitrate: 192000})
  		)
  		.on("finish",() =>{
  			songQueue.shift();
  			if (songQueue.length < 1){
  				voiceChannel.leave();
  				isPlaying = false;
  				currentDispatcher.destroy();
  				connection = undefined;
  			}else{
  				setTimeout(() => {
  					playAudio(message,null,voiceChannel);
  				}, 1000);
  			}
  		})
  		.on("error",e=>{
  			console.error(e);
 		 	voiceChannel.leave();
 		 	isPlaying = false;
 		 	currentDispatcher.destroy();
 		});
 	currentDispatcher.setVolumeLogarithmic(0.5);
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
			embed.setTitle("Paused");
			break;
		case 1:
			embed.setTitle("Resumed!");
			break;
		case 2:
			embed.setTitle("SetVolume: " + additionInfo);
			break;
		case 3:
			embed.setTitle("Skipped!");
			break;
		case 4:
			embed.setTitle("Queue cleared!");
			break;
	}
	message.channel.send(embed);
}

function getCurrentInfo(message){
	if (isPlaying){
		let embed = new Discord.MessageEmbed()
			.setTitle("Now Playing")
			.setColor('#add8e6')
			.addField(`Song Info:`,`${songQueue[0].title}\n${songQueue[0].url}\n${Math.floor(songQueue[0].lengthSeconds / 3600)}h ${Math.floor(((songQueue[0].lengthSeconds / 3600) - Math.floor(songQueue[0].lengthSeconds / 3600)) * 60)}m ${songQueue[0].lengthSeconds % 60}s\n${songQueue[0].author}`);
		message.channel.send(embed);
	}
}

function getCurrentQueue(message){
	let finalMsg = "```\n";
	for (let i=0; i < songQueue.length; i++){
		if (finalMsg.length < 500){
			finalMsg += `${i} : ${songQueue[i].title}\n`;
		}
	}
	message.channel.send(finalMsg + "```");
}

function skipTrack(message){
	if (!isPlaying){
		message.channel.send("I am not currently in a voice channel!");
	}else if (!currentDispatcher){
		message.channel.send("I am not currently playing anything!");
	}else if (!message.member.voice.channel){
		message.channel.send("You must be in the same voice channel!");
	}else if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else{
		currentDispatcher.end();
		embedHandler(message, 3, null);
	}
}

function clearQueue(message){
	if (message.member.voice.channel.id !== bot.voice.connections.get(message.guild.id).channel.id){
		message.channel.send("You must be in the same voice channel!");
	}else{
		songQueue = [];
		embedHandler(message,4,null);
	}
}