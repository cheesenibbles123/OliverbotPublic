const fs = require("fs");
const glob = require("./globalFunctions");
const { bot } = require("./../oliverbot.js");

exports.initStatus = function initStatus(){
	setInterval(() =>{
		Status();
	}, 30000000);
}

function Status(){
	let file = fs.readFileSync("./datafile.json").toString();
	file = JSON.parse(file);
	let a = getRandomInt(4);
	let b;
	switch (a){
		case 0:
			b = getRandomInt(file.status.PLAYING.length+1);
			bot.user.setActivity(`${file.status.PLAYING[b]}`);
			break;
		case 1:
			b = getRandomInt(file.status.WATCHING.length+1);
			bot.user.setActivity(`${file.status.WATCHING[b]}`,{
				type : "WATCHING"
			});
			break;
		case 2:
			b = getRandomInt(file.status.STREAMING.length+1);
			bot.user.setActivity(`${file.status.STREAMING[b]}`,{
				type: "STREAMING"
			});
			break;
		case 3:
			b = getRandomInt(file.status.LISTENING.length+1);
			bot.user.setActivity(`${file.status.LISTENING[b]}`,{
				type: "LISTENING"
			});
			break;
		default:
			break;
	}
}