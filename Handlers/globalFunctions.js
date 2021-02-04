var { adjustableConfig } = require("./../oliverbot.js");
const db = require("./databaseSetup");
const fs = require('fs');

exports.getRandomInt = function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

exports.getRandomBetweenInt = function getRandomBetweenInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

exports.getUserFromMention = function getUserFromMention(mention) {
	let matches = mention.match(/^<@!?(\d+)>$/);
	if (!matches) return;
	let id = matches[1];
	return bot.users.cache.get(id);
}

exports.loadDataFromFile = function loadFromDatafile(commandUsed,data,message){
	let file = fs.readFileSync("./datafile.json").toString();
	file = JSON.parse(file);
	let p = 0
	try{
	switch (commandUsed){
		case "randomsong":
			let voiceChannel = message.member.voice.channel;
			if (!voiceChannel){ return; }
			else if (isPlaying){ return; }
			else if (!adjustableConfig.music.generalAudio){
				message.reply("That command is currently disabled, please ask an admin to re-enable it!");
			}else{
			let song = file.randomsongs[getRandomInt(file.randomsongs.length)];
			voiceChannel.join().then(connection => {
			isPlaying = true;
			currentDispatcher = connection
				.play(
        	 		ytdl(song)
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
			});
			}
			break;
		case "quote":
			message.channel.send(file.quotes[getRandomInt(file.quotes.length+1)]);
			break;
		case "nootnoot":
			message.channel.send(file.nootnoot[getRandomInt(file.nootnoot.length+1)]);
			break;
		case "dance":
			p = getRandomInt(file.Responses.dance.length);
			message.channel.send(file.Responses.dance[p]);
			break;
		case "beg":
			p = getRandomInt(file.Responses.beg.length);
			message.channel.send(file.Responses.beg[p]);
			break;
		case "dad":
			message.channel.send(file.dadjokes[getRandomInt(file.dadjokes.length+1)]);
			break;
		case "insult":
			if (message.content.includes("everyone") || message.content.includes("here"))
			{
				message.channel.send("nah");
			}else{
				let insult = file.insults[getRandomInt(file.insults.length+1)].toString();
				try{
					if (typeof data === "undefined"){
						message.reply("Please ensure you have use the correct syntax.");
					}else{
						insult = insult.replace("TARGET",`${data}`);
						message.channel.send(insult);
					}
				}catch(e){
					message.reply("Please ensure you have use the correct syntax.");
				}
			}
			break;
	}
	}catch(e){
		console.log("###########################################");
		console.log(e);
		console.log("###########################################");
	}
}