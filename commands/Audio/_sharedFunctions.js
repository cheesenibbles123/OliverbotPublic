const ytdl = require("ytdl-core");
const Discord = require("discord.js");

const variables = {
	isPlaying : false,
	currentDispatcher : null,
	currentSongStart : null,
	songQueue : [],
	connection : null
}

async function setupTune(message,args,fromFile){
	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel){
		message.reply("You must be in a voice channel!");
	//}else if (!adjustableConfig.music.generalAudio){
	//	message.channel.send(issueEmbed.grabEmbed(4,null));
	}else{
		if (fromFile && !variables.isPlaying){
			let file = fs.readFileSync("./datafile.json").toString();
			file = JSON.parse(file);
			let a = glob.getRandomInt(file.pingedSounds.length);
			let randomsong = file.pingedSounds[a].toString();
			playAudio(message,randomsong,voiceChannel);
		}else{
			song = args.join("");
			if (song.includes("https://www.youtube.com/watch?v=")){
				let songInfo = await ytdl.getInfo(song).catch(message.channel.send("Error getting song info."));

				songInfo = songInfo.player_response.videoDetails;

				variables.songQueue.push({
					"title" : songInfo.title,
					"url" : song,
					"lengthSeconds" : songInfo.lengthSeconds,
					"author" : songInfo.author
				});

				if (!variables.isPlaying){
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

exports.setupTune = setupTune;

async function playAudio(message,song,voiceChannel){
	variables.isPlaying = true;

	if (song === null){
		let embed = new Discord.MessageEmbed()
			.setTitle("Now Playing")
			.setColor('#add8e6')
			.addField(`Song Info:`,`${variables.songQueue[0].title}\n${variables.songQueue[0].url}\n${Math.floor(variables.songQueue[0].lengthSeconds / 3600)}h ${Math.floor(((variables.songQueue[0].lengthSeconds / 3600) - Math.floor(variables.songQueue[0].lengthSeconds / 3600)) * 60)}m ${variables.songQueue[0].lengthSeconds % 60}s\n${variables.songQueue[0].author}`);
		message.channel.send(embed).then(msg => {
			setTimeout(function(){
				msg.delete();
			},variables.songQueue[0].lengthSeconds * 1000);
		});

		song = variables.songQueue[0].url;
	}

	if (!variables.connection){
		await voiceChannel.join().then(connec => {
			variables.connection = connec;
			variables.connection.voice.setSelfDeaf(true);
		});
	}

	variables.currentDispatcher = variables.connection
		.play(
    	  	ytdl(song,{filter:'audioonly',quality:'highestaudio',highWaterMark:1<<25}, {highWaterMark: 1},{bitrate: 192000})
  		)
  		.on("finish",() =>{
  			variables.songQueue.shift();
  			if (variables.songQueue.length < 1){
  				voiceChannel.leave();
  				variables.isPlaying = false;
  				variables.currentDispatcher.destroy();
  				variables.connection = undefined;
  			}else{
  				setTimeout(() => {
  					playAudio(message,null,voiceChannel);
  				}, 1000);
  			}
  		})
  		.on("error",e=>{
  			console.error(e);
 		 	voiceChannel.leave();
 		 	variables.isPlaying = false;
 		 	variables.currentDispatcher.destroy();
 		});
 	variables.currentDispatcher.setVolumeLogarithmic(0.5);
 	variables.currentSongStart = new Date().getTime();
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

exports.embedHandler = embedHandler;