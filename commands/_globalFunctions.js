const db = require("./../startup/database.js");
const fs = require('fs');
const { reply } = require("./_combinedResponses");

let bot;

exports.init = function init(botInstance){
	bot = botInstance;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

exports.getRandomInt = getRandomInt;

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

exports.loadDataFromFile = function loadFromDatafile(event,isMessage,commandUsed,data){
	let file = fs.readFileSync("./datafile.json").toString();
	file = JSON.parse(file);
	let p = 0
	try{
	switch (commandUsed){
		case "randomsong":
			let voiceChannel = event.member.voice.channel;
			if (!voiceChannel){ return; }
			else if (isPlaying){ return; }
			else{
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
			reply(event,file.quotes[getRandomInt(file.quotes.length+1)],isMessage);
			break;
		case "nootnoot":
			reply(event,file.nootnoot[getRandomInt(file.nootnoot.length+1)],isMessage);
			break;
		case "dance":
			p = getRandomInt(file.Responses.dance.length);
			reply(event,file.Responses.dance[p],isMessage);
			break;
		case "beg":
			p = getRandomInt(file.Responses.beg.length);
			reply(event,file.Responses.beg[p],isMessage);
			break;
		case "dad":
			reply(event,file.dadjokes[getRandomInt(file.dadjokes.length+1)],isMessage);
			break;
		case "insult":
			let checkString = args.join(' ');
			if (checkString.includes("everyone") || checkString.includes("here"))
			{
				reply(event,"nah",isMessage);
			}else{
				let insult = file.insults[getRandomInt(file.insults.length+1)].toString();
				try{
					if (typeof data === "undefined"){
						reply(event,"Please ensure you have use the correct syntax.",isMessage);
					}else{
						insult = insult.replace("TARGET",`${data}`);
						reply(event,insult,isMessage);
					}
				}catch(e){
					reply(event,"Please ensure you have use the correct syntax.",isMessage);
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