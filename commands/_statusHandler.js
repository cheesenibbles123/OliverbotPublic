const fs = require("fs");
const glob = require("./_globalFunctions");
var bot;

exports.initStatus = function initStatus(){
	bot = require("./../oliverbot.js").bot;
	Status();
	setInterval(() =>{
		Status();
	}, 30000000);
}

function Status(){
	let file = fs.readFileSync("./datafile.json").toString();
	file = JSON.parse(file);
	let a = glob.getRandomInt(4);
	let b;
	switch (a){
		case 0:
			b = glob.getRandomInt(file.status.PLAYING.length+1);
			bot.user.setActivity(`${file.status.PLAYING[b]}`);
			break;
		case 1:
			b = glob.getRandomInt(file.status.WATCHING.length+1);
			bot.user.setActivity(`${file.status.WATCHING[b]}`,{
				type : "WATCHING"
			});
			break;
		case 2:
			b = glob.getRandomInt(file.status.STREAMING.length+1);
			bot.user.setActivity(`${file.status.STREAMING[b]}`,{
				type: "STREAMING"
			});
			break;
		case 3:
			b = glob.getRandomInt(file.status.LISTENING.length+1);
			bot.user.setActivity(`${file.status.LISTENING[b]}`,{
				type: "LISTENING"
			});
			break;
		default:
			break;
	}
}

// //GETTING ALL GAMES PEOPLE ARE PLAYING
// function GetAllGamesBeingPlayed(guildID){
// 	let guildPresences = bot.guilds.get(guildID).presences.array();
// 	let games = [];
// 	let counts = [];
// 	let Stati = [0,0,0,0];
// 	guildPresences.forEach(element => {
// 		if (element !== null ){
// 			if (element.game !== null){
// 				if (element.game.name !== "Custom Status" && element.game.name !== "Twitch"){
// 					if (games.indexOf(element.game.name !== -1)){
// 						let index = games.indexOf(element.game.name);
// 						counts[index] = counts[index] + 1;
// 					}else{
// 						games.push(element.game.name);
// 						counts.push(1);
// 					}
// 				}
// 			}
// 			if (typeof element.status !== null && typeof element.status !== undefined){
// 				if (element.status === "online"){
// 					Stati[0] = Stati[0] + 1;
// 				}else
// 				if (element.status === "idle"){
// 					Stati[1] = Stati[1] + 1;
// 				}else{
// 					Stati[2] = Stati[2] + 1;
// 				}
// 			}
// 		}
// 	});
// 	let sortedLists = SortGamesBeingPlayed(games,counts);
// 	games = sortedLists[0];
// 	counts = sortedLists[1];
// 	let final = `Online: ${Stati[0]} idle: ${Stati[1]} dnd: ${Stati[2]}\nCurrent User Activities:\n` + "```\n";
// 	let final2 = "```";
// 	let final3 = "```";
// 	let final4 = "```";
// 	for (i=0;i<games.length;i++){
// 		if (final.length < 1900){
// 			final = final + `${games[i]} - ${counts[i]}\n`;
// 		}else
// 		if (final2.length < 1900){
// 			final2 = final2 + `${games[i]} - ${counts[i]}\n`;
// 		}else
// 		if (final3.length < 1900){
// 			final3 = final3 + `${games[i]} - ${counts[i]}\n`;
// 		}else
// 		if (final4.length < 1900){
// 			final4 = final4 + `${games[i]} - ${counts[i]}\n`;
// 		}
// 	}
// 	bot.channels.cache.get("692072102886637619").messages.fetch("692072288547373117").then(msg => {
// 		if (final.length < 6){
// 			msg.edit(final +"-```");
// 		}else{
// 			msg.edit(final + "```");
// 		}
// 	});
// 	bot.channels.cache.get("692072102886637619").messages.fetch("692072290879406140").then(msg => {
// 		if (final2.length < 6){
// 			msg.edit(final2 +"-```");
// 		}else{
// 			msg.edit(final2 + "```");
// 		}
// 	});
// 	bot.channels.cache.get("692072102886637619").messages.fetch("692072292607590513").then(msg => {
// 		if (final3.length < 6){
// 			msg.edit(final3 +"-```");
// 		}else{
// 			msg.edit(final3 + "```");
// 		}
// 	});
// 	bot.channels.cache.get("692072102886637619").messages.fetch("692084228803788861").then(msg => {
// 		if (final4.length < 6){
// 			msg.edit(final4 +"-```");
// 		}else{
// 			msg.edit(final4 + "```");
// 		}
// 	});
// 	return;
// }

// function SortGamesBeingPlayed(games,counts){
// 	games = ApplyCharacterLimits(games);
// 	for (i=0;i<counts.length;i++){
// 		for (s=0;s<counts.length;s++){
// 			if (counts[i] > counts[s]){
// 				let temp = games[i];
// 				games[s] = games[i];
// 				games[i] = temp;

// 				let counttemp = counts[s];
// 				counts[s] = counts[i];
// 				counts[i] = counttemp;
// 			}else{
// 				if (counts[i] === counts[s]){
// 					let templist = [];
// 					templist.push(games[i]);
// 					templist.push(games[s]);
// 					let templist2 = templist;
// 					templist2.sort();

// 					if (templist2 !== templist){
// 						let temp = games[i];
// 						games[s] = games[i];
// 						games[i] = temp;

// 						let counttemp = counts[s];
// 						counts[s] = counts[i];
// 						counts[i] = counttemp;
// 					}
// 				}
// 			}
// 		}
// 	}
// 	return [games,counts];
// }

// function ApplyCharacterLimits(games){
// 	for (i=0;i<games.length;i++){
// 		if (games[i].length > userActivitiesLimits.Name){
// 			games[i] = games[i].slice(0,userActivitiesLimits.Name)
// 		}else
// 		if (games[i].length < userActivitiesLimits.Name){
// 			let x = userActivitiesLimits.Name - games[i].length;
// 			games[i] = games[i] + new Array(x + 1).join(' ');
// 		}
// 	}
// 	return games;
// }