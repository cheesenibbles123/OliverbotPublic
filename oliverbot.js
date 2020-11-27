const config = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();

const fetch = require("node-fetch");
const fs = require("fs");
const mysql = require("mysql");
const btoa = require("btoa");
const ytdl = require("ytdl-core");
const Canvas = require("canvas");

var serverStatus = {
	"active" : false,
	"msg" : null,
	"channel" : "663524428092538920"
};

var cooldowns = {
	"steamApi" : true,
	"quiz" : {
		"allowed" : true,
		"timeoutLength" : 120000
	}
};

var isAllowed = true;

const leaderboardlimits = {
	"listsizelimit" : 30,
	"rank" : 2,
	"username" : 16,
	"level" : 7,
	"xp" : 10,
	"usernameEco" : 20
};

const xpdetails = {
	"max" : 0
};

var mainDatabaseConnectionPool = mysql.createPool({
	connectionLimit : 30,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : config.databaseInfo.database
});

var configurationDatabaseConnectionPool = mysql.createPool({
	connectionLimit : 10,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : "oliverbotConfigs"
});

var adjustableConfig = {
	"reactions" : {
		"randomReactions" : true,
	},
	"quotes" : {
		"active" : true,
	},
	"misc" : {
		"nWordFilter" : true,
	},
	"music" : {
		"pingCommand" : true,
	},
	"apis" : {
		"checkNudity" : true,
	}
};

const autoQuoteNotAllowedCategories = [408407982926331904,440525688248991764,665972605928341505,585042086542311424,632107333933334539,692084502184329277];
var isPlaying = false;
var currentDispatcher = null;

var customCommandList = [];
var miniCommands = [];
var reactionRoles = [];

function LoadDataFromDatabase(){
	loadConfigFromDB();
	loadCustomCommandsFromDB();
	loadXpDataFromDB();
	loadPermanentCommandsFromDB();
	loadReactionRolesFromDB();
	return;
}

//Loading Data
function loadXpDataFromDB(){
	configurationDatabaseConnectionPool.query(`SELECT * FROM xpGainData`, (err,rows,fields) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				xpdetails[`${rows[i].factorName}`] = rows[i].val;
			}
		}
	});
	return;
}

function loadConfigFromDB(){
	configurationDatabaseConnectionPool.query(`SELECT * FROM config`, (err,rows,fields) => {
		if (rows.length < 1){
			console.log("------ERROR LOADING CONFIG------");
		}else{
			for (i=0;i<rows.length;i++){

				if (rows[i].category === 'reactions'){
					//Determines if the data for the specific reaction type is a bool or int, for example some are singular true/false events, some are a X in Y chance event
					if (rows[i].boolInt === 'bool'){
						adjustableConfig.reactions[`${rows[i].name}`] = checkIfBool(rows[i].currentval);
					}else{
						adjustableConfig.reactions[`${rows[i].name}`] = parseInt(rows[i].currentval);
					}
				}else
				if (rows[i].category === 'quotes'){
					if (rows[i].boolInt === 'bool'){
						adjustableConfig.quotes[`${rows[i].name}`] = checkIfBool(rows[i].currentval);
					}else{
						adjustableConfig.quotes[`${rows[i].name}`] = parseInt(rows[i].currentval);
					}
				}else
				if (rows[i].category === 'misc'){
					if (rows[i].boolInt === 'bool'){
						adjustableConfig.misc[`${rows[i].name}`] = checkIfBool(rows[i].currentval);
					}else{
						adjustableConfig.misc[`${rows[i].name}`] = parseInt(rows[i].currentval);
					}
				}else
				if (rows[i].category === 'music'){
					if (rows[i].boolInt === 'bool'){
						adjustableConfig.music[`${rows[i].name}`] = checkIfBool(rows[i].currentval);
					}else{
						adjustableConfig.music[`${rows[i].name}`] = parseInt(rows[i].currentval);
					}
				}else
				if (rows[i].category === 'apis'){
					if (rows[i].boolInt === 'bool'){
						adjustableConfig.apis[`${rows[i].name}`] = checkIfBool(rows[i].currentval);
					}else{
						adjustableConfig.apis[`${rows[i].name}`] = parseInt(rows[i].currentval);
					}
				}

			}
		}
	});
	return;
}

function checkIfBool(toCheck){
	let val = false;
	if (toCheck === 'true'){
		val = true;
	}
	return val;
}

//Ones that can be created and deleted by select individuals
function loadCustomCommandsFromDB(){
	customCommandList = [];
	configurationDatabaseConnectionPool.query(`SELECT * FROM CustomCommands`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				customCommandList.push( {"command" : rows[i].command, "response" : rows[i].response} );
			}
		}
	});
	return;
}

//Ones that the owner makes, and thus only the owner can remove
function loadPermanentCommandsFromDB(){
	miniCommands = [];
	configurationDatabaseConnectionPool.query(`SELECT * FROM permanentCommands`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				miniCommands.push( {"command" : rows[i].commandName, "response" : rows[i].content} );
			}
		}
	});
	return;
}

function loadReactionRolesFromDB(){
	reactionRoles = [];
	configurationDatabaseConnectionPool.query(`SELECT * FROM reactionRoles`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				reactionRoles.push( {"EmojiName" : rows[i].emojiName, "EmojiID" : rows[i].emojiID, "EmojiType" : rows[i].emojiType, "RoleID" : rows[i].RoleID} );
			}
		}
	});
	displayReactionRoles();
	return;
}

function loadFromDatafile(commandUsed,data,message){
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
		case "random":
			p = getRandomInt(10);
				if (p === 0){
					message.channel.send(file.Responses.gif[getRandomInt(file.Responses.gif.length)]);
				}else
				if (p === 1){
					let item =getRandomInt(file.Responses.vid.length);
					message.channel.send(file.Responses.vid[item]);
				}else
				if (p === 2){
					let item = getRandomInt(file.Responses.img.length);
					message.channel.send(file.Responses.img[item]);
				}else
				//if (p === 3){
				//	getRandomNonsenseWord();
				//}else
				if (p === 3){
					getRandomMeme(message);
				}else
				if (p === 4){
					getRandomMeme2(message);
				}else
				if (p === 5){
					getRandomGeekJoke(message);
				}else
				if (p === 6){
					getRandomCorpPhrase(message);
				}else
				if (p === 7){
					getRandomBlankMyBlank(message);
				}else
				if (p === 8){
					getRandomStartupIdea(message);
				}else
				if (adjustableConfig.apis.randomUselessFactAPI){
					RandomUselessFactAPI(message);
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
	}catch(e){
		console.log("###########################################");
		console.log(e);
		console.log("###########################################");
	}
}

//Altering Config

async function updateDBConfig(message,args){

	let commandName = args[0];
	let newValue = args[1];

	await configurationDatabaseConnectionPool.query(`SELECT * FROM config`, (err,rows, fields) =>{
		let notFound = true;
		let type;
		for (i=0;i<rows.length;i++){
			if (rows[i].name === commandName){
				notFound = false;
				type = rows[i].boolInt;
			}
		}

		let correctInput = false;
		if (notFound){
			message.reply("Config option not found!");
		}else{
			if (type === 'int'){
				newValue = parseInt(newValue);
				if (!isNaN(newValue)){
					correctInput = true;
				}
			}else
			if (type === 'bool'){
				if (newValue === 'false' || newValue === 'true'){
					correctInput = true;
				}
			}

			if (correctInput){
				configurationDatabaseConnectionPool.query(`update config set currentval='${newValue}' where name='${commandName}'`, (err) => {
					if (err){
						message.channel.send("ERROR, please check you entered the correct information!");
						console.log("An ERROR has occured with updating the config!\n" + err);
					}else{
						message.channel.send("Done!");
					}
				});
			}
		}
	});

	loadConfigFromDB();

	return;
}

//Custom Commands
//Ones that can be created and deleted by select individuals
function customCommands(message,command){
	if (customCommandList.length < 1){return;}
	else{
		for (i=0;i<customCommandList.length;i++){
			if (customCommandList[i].command === command){
				message.channel.send(customCommandList[i].response);
			}
		}
	}
	return;
}
//Ones that the owner makes, and thus only the owner can remove
function permanentCommands(message,command){
	if (miniCommands.length < 1){return;}
	else{
		for (i=0;i<miniCommands.length;i++){
			if (miniCommands[i].command === command){
				message.channel.send(miniCommands[i].response);
			}
		}
	}
	return;
}

async function createCustomCommands(message,args){
	configurationDatabaseConnectionPool.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
	setTimeout(function(){
		loadCustomCommandsFromDB();
	}, 1000);
	return;
}

async function deleteCustomCommands(message,args){
	let commandToDelete = "";
	if (Array.isArray(args)){
		commandToDelete = args[0];
	}else{
		commandToDelete = args;
	}
	configurationDatabaseConnectionPool.query(`delete from CustomCommands where command='${commandToDelete}'`);
	setTimeout(function(){
		loadCustomCommandsFromDB();
	}, 1000);
	return;
}

//Reaction Roles

async function createReactionRole(message,name,emojiID,emojiType,roleID){
	configurationDatabaseConnectionPool.query(`insert into reactionRoles values ('${name}' , '${emojiID}' , '${emojiType}' , '${roleID}' )`);
	loadReactionRolesFromDB();
	message.channel.send("Role added!");
	return;
}

async function deleteReactionRole(message,name){
	configurationDatabaseConnectionPool.query(`delete from reactionRoles where emojiName='${name}'`);
	loadReactionRolesFromDB();
	message.channel.send("Role removed!");
	return;
}

//////////////////////////////////////////////////////////////////XP

function updateleaderboard(msg){
	let delay = 30000;
	setInterval(function(){
		mainDatabaseConnectionPool.query(`SELECT * FROM xp order by level desc, xp desc limit 31`, (err,rows,fields) =>{
			let length = 0;
			if (rows.length<leaderboardlimits.listsizelimit){
				length = rows.length;
			}else{
				length = leaderboardlimits.listsizelimit; 
			}
			let finalmsg = "```diff\n"
							+"-XP LeaderBoard\n"
							+"+Rank  Username          level     XP\n";
			for (i=0;i<length;){
				let rank = (i+1).toString();
				if (rank.length > leaderboardlimits.rank){
					conosle.log("EXPAND SIZE");
				}else{
					let x = leaderboardlimits.rank - rank.length;
					rank = rank + new Array(x + 1).join(' ');
				}
				let user;
				let username = "";
				try{
					user = bot.users.cache.get(rows[i].id);
					username = user.username;
				}catch(e){
					username = rows[i].id;
				}
				if (username.length > leaderboardlimits.username){
					username = username.slice(0,leaderboardlimits.username);
				}else{
					let x = leaderboardlimits.username - username.length;
					username = username + new Array(x + 1).join(' ');
				}
				let level = rows[i].level.toString();
				if (level.length > leaderboardlimits.level){
					level.slice(0,leaderboardlimits.level);
				}else{
					let x = leaderboardlimits.level - level.length;
					level = level + new Array(x + 1).join(' ');
				}
				let xp = rows[i].xp.toString();
				if (xp.length > leaderboardlimits.xp){
					score.slice(0,leaderboardlimits.xp);
				}else{
					let x = leaderboardlimits.xp - xp.length;
					xp = xp + new Array(x + 1).join(' ');
				}
				finalmsg = finalmsg + `${rank} | ${username} | ${level} | ${xp}\n`;
				i++;
			}
			finalmsg = finalmsg+"```";
			bot.channels.cache.get(config.serverInfo.channels.xpLeaderboard).messages.fetch(config.serverInfo.messages.xpLeaderboard).then(msg => {msg.edit(finalmsg);});
		});
	},delay);
}

function levelsystem(xp,currentlevel){
	if (currentlevel === 0 & xp > 400){
		return true;
	}else{
		if ( xp >= (currentlevel*xpdetails.levelupfactor)){
			return true;
		}else{
			return false;
		}
	}
}

function genXp(){
	return Math.floor(Math.random()*(xpdetails.max+xpdetails.min+1))+xpdetails.max;
}

////////////////////////////////////////////////////////////////MUTES
function rolecheckformutes(member,msg){
	let response = true;
	//if commander just do
	if (msg.member.roles.cache.has("401925172094959616")){
		response = false;
	}
	// if admin mutes, target non admin
	if (msg.member.roles.cache.has("402120143364423682") & !(member.roles.cache.has("402120143364423682"))){
		response = false;
	}
	//if mode mutes, target non mod
	if ( (msg.member.roles.cache.has("440514569849536512") & !(msg.member.roles.cache.has("402120143364423682"))) & !(member.roles.cache.has("440514569849536512"))){
		response = false;
	}
	return response;
}

async function mute(member,message){
	try{
		member.roles.add(config.serverInfo.roles.muted);
		message.channel.send(member+" has been muted");
	}catch (e) {
		console.log(e);
		message.channel.send("Can't mute this person right now, something doesnt seem to be working");
	}
	return;
}

async function unmute(member,message){
	try{
		member.roles.remove(config.serverInfo.roles.muted);
		message.channel.send(member+" has been unmuted");
	}catch (e) {
		message.channel.send("Can't unmute "+member+"right now, something doesnt seem to be working");
	}
	return;
}
///////////////////////////////////////////////////////////////GETTING A NUMBER
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};
function getRandomBetweenInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};
//////////////////////////////////////////////////////////////level check
function levelchecker(msg,reqlvl){
	let response = true;
	mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id='${msg.author.id}'`, (err,rows) => {
		if (rows.length < 1){
			response = false;
		}else if (parseInt(rows[0].level) < reqlvl){
			response = false;
		}
	});
	return response;
}

///////////////////////////////////////////////////////////////RANDOM RESPONSES
function randomgif(message,content){
	let yay = getRandomInt(5);
	if ( yay === 1){
		switch(true){
			case (content.includes("roll")):
				message.channel.send("https://makeagif.com/gif/2-person-forward-roll-race-vrEaaK");
				break;
			case (content.includes("jump")):
				message.channel.send("https://giphy.com/gifs/filmeditor-will-ferrell-elf-l2YWvhSnfdWR8nRBe");
				break;
			case (content.includes("wave")):
				message.channel.send("https://giphy.com/gifs/elf-TDWwXnAZbp0xW");
				break;
			case (content.includes("happy")):
				message.channel.send("https://giphy.com/gifs/butterfly-penguins-otnqsqqzmsw7K");
				break;
			case (content.includes("excited")):
				message.channel.send("https://giphy.com/gifs/happy-car-home-rdma0nDFZMR32");
				break;
			case (content.includes("ritual")):
				message.channel.send("https://giphy.com/gifs/woohoo-R8e3MbbggNBjq");
				break;
			case (content.includes("alien")):
				message.channel.send("https://giphy.com/gifs/alien-area-51-stormarea51-WqEmD7ycGVIzzNMxya");
				break;
			case (content.includes("ree")):
				message.channel.send("https://giphy.com/gifs/justin-g-mad-u-camron-xTcnSOEKegBnYhGahW");
				break;
			case (content.includes("no way")):
				message.channel.send("https://giphy.com/gifs/6OpusTwW1csaQ");
				break;
			default:
				break;
		}
	}
	return;
}

function randomresponse(message,content,serverid){
	if (content.includes("bot")){
		message.react("👋");
	}
	if (content.includes("help")){
		message.react("😟");
	}
	if (content.includes("oliver")){
		message.react("👌");
	}
	if (content.includes("smoke")){
		message.react("🚬");
	}
	if (content.includes("no u")){
		message.channel.send("no u");
	}
	if (content.includes("family")){
		message.react("👪");
	}
	if (content.includes("food")){
		message.react("😋");
	}
	if (content.includes("happy")){
		message.react("🙂");
	}
	if (content.includes("jarvis")){
		message.react("🤖");
	}
	if (content.includes("wave")){
		message.react("👋");
	}
	if (content.includes("goose")){
		message.react("690138132343160854");
	}
	if (content.includes("minecraft")){
		message.react("690139912313241629");
	}
	if (content.includes("praise")){
		message.react("690140280434851922");
	}
	if (content.includes("confused")){
		message.react("690140617715875874");
	}
	if (content.includes("dab")){
		message.react("690140909030866957");
	}
	if (content.includes("youtube")){
		message.react("690141366323511297");
	}
	if (content.includes("russia")){
		message.react("690141739050467345");
		message.react("692399362739011595");
	}
	if (content.includes("soviet")){
		message.react("690143238392512531");
	}
	if (content.includes("tank")){
		message.react("690141956327735318");
	}
	if (content.includes("yes")){
		message.react("690144439460429825");
	}
	if (content.includes("alien")){
		message.react("690144106785144857");
	}
	if (content.includes("coffee")){
		message.react("690144192890273912");
	}
	if (content.includes("negative")){
		message.react("690144528312696969");
	}
	if (content.includes("correct")){
		message.react("690144528153575433");
	}
	if (content.includes("dyno")){
		message.react("690145143416029224");
	}
	if (content.includes("love")){
		message.react("690145216883327022");
	}
	if (message.channel.id === 552871633266933811 && content.includes("thissmerk") && adjustableConfig.reactions.smirks){
		message.channel.send("553339106516533251");
	}
	if (message.channel.id === 552871633266933811 && content.includes("thatsmerk") && adjustableConfig.reactions.smirks){
		message.channel.send("553339063315333147");
	}
	if (content.includes("fortnite")){
		message.react("690145056413188214");
	}
	if (content.includes("caught")){
		if (getRandomInt(2) === 1){
			message.react("690145450547871794");
		}else{
			message.react("690145450325835810");
		}
	}
	if (content.includes("uk")){
		message.react("🇬🇧");
	}
	if (content.includes("america")){
		message.react("692397018932314163");
		message.react("🇺🇸");
	}
	if (content.includes("undertale")){
		message.react("692397521120526376");
	}
	if (content.includes("minecraft")){
		message.react("692397796896014458");
	}
	if (content.includes("hidden")){
		message.react("692397796937957417");
	}
	if (content.includes("detected")){
		message.react("692397796505944096");
	}
	if (content.includes("wtf")){
		message.react("692398281925328946");
	}
	if (content.includes("tea")){
		message.react("692398282256941086");
	}
	if (content.includes("sweat")){
		message.react("692398281988243503");
	}
	if (content.includes("water")){
		message.react("692398572108251228");
	}
	if (content.includes("lava")){
		message.react("692398572121096293");
	}
	if (content.includes("beef")){
		message.react("692399061738717284");
	}
	if (content.includes("illegal")){
		message.react("692399062292627476");
	}
	if (content.includes("honk")){
		message.react("692399606587195473");
	}
	if (content.includes("frog") || content.includes("🐸")){
		message.channel.send("🐸");
	}
	if (serverid === "401924028627025920" && adjustableConfig.reactions.gtSpecific){
		if (content.includes("sad")){
			message.react("598649992931967011");
		}
		if (content.includes("archie")){
			message.react("588057977827622923");
		}
		if (content.includes("stealyoursoul")){
			message.react(":verhappyblob:");
		}
		if (content.includes("hidethepain")){
			message.react("452068438500966400");
		}
		if (content.includes("eat")){
			message.react("612253237814493194");
		}
		if (content.includes("pirate")){
			message.react("590116558915764224");
		}
		if (content.includes("ban")){
			message.react("552540975138865163");
		}
		if (content.includes("stop")){
			message.react("588054782569086990");
		}
		if (content.includes("spartanthinking")){
			message.react("609059663325036545");
		}else
		if (content.includes("spartanturtle")){
			message.react("552534938952663040");
		}else
		if (content.includes("spartan")){
			message.react("609053537464352788");
		}
		if (content.includes("🤔")){
			message.react("602978268689334275");
		}
		if (content.includes("salt")){
			message.react("552533703876804611");
		}
		if (content.includes("yay")){
			message.react("588062673703403521");
		}
		if (message.member.roles.cache.has("616589349638635572") && adjustableConfig.reactions.giraffeReactions && (message.author.id !== "305802257172135947")){
			message.react("526899241495429140");
		}
	}else
	if (serverid === "447133697293156372"){
		bot.channels.cache.get("564810900461322260").send("Fuck you "+message.author);
	}
	return;
}

function randompirateshit(msg,content){

	switch(true){
		case (content.includes("yarr")):
			msg.channel.send("Yarr");
			break;
		case (content.includes("pirates") || content.includes("pirate")):
			msg.channel.send("Ahoy, Me Hearties!");
			break;
		case (content.includes("hello")):
			msg.channel.send("Ahoy, Matey!");
			break;
		case (content.includes("enemy") || content.includes("enemies")):
			let num = getRandomInt(2);
			if (num === 0){
				msg.channel.send("All Hand Hoy!");
			}else
			if (num === 1){
				msg.channel.send("Bloody Buccaneers!");
			}else{
				msg.channel.send("Lets Get us Those Dubloons!");
			}
			break;
		case (content.includes("storm")):
			msg.channel.send("A storm ye say? Batten Down The Hatches!");
			break;
		case (content.includes("treasure")):
			msg.channel.send("Now ye ain't hiding da booty from us now are ye?");
			break;
		case (content.includes("run")):
			msg.channel.send("I want me a Clap O' Thunder!");
			break;
		case (content.includes("traitor")):
			msg.channel.send("There be a traitor? Cleave Him to the Brisket.");
			break;
		case (content.includes("sword")):
			msg.channel.send("Me fav sword's me Cutlass");
			break;
		case (content.includes("loot")):
			msg.channel.send("What rewards we be having?");
			break;
		default:
			break;
	}

	return;
}

/////////////////////////////////////////////Rankcard Generation

function rankcardCreation(message){

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${message.author.id}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			createDefaultRankCard(message);
		}else if(rows.length > 1){
			createDefaultRankCard(message);
		}else{
			let inventory = JSON.parse(rows[0].inventory);
			let notFound = true;
			let shipName = "";
			for (i=0; i < inventory.length; i++){
				if (inventory[i].type === "largeShips"){
					shipName = inventory[i].name;
					notFound = false;
				}
			}

			if (notFound){
				createDefaultRankCard(message);
			}else{
				createRankCanvas(message.channel,message.member,shipName,message.author.id);
			}

		}
	});

	return;
}

function createDefaultRankCard(message){

	mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${message.author.id}'` , (err,rows) => {
		let xpneeded;
		let rnxp;
		let level;
		if (parseInt(rows[0].level) === 0){
			xpneeded = 400;
		}else{
			xpneeded = xpdetails.levelupfactor * parseInt(rows[0].level);
		}

		rnxp = parseInt(rows[0].xp);
		level = rows[0].level;
		mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = ${message.author.id}`, (err,rows) => {
			let rankcard = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${message.member.user.username}`)
				.setAuthor(`Rank card`)
				.setThumbnail(`${message.author.displayAvatarURL()}`)
				.setTimestamp();
			if (rows.length >0){
				rankcard.setDescription(`xp ${rnxp} / ${xpneeded}. lvl ${level}\n Giraffe Coins: ${parseFloat(rows[0].giraffeCoins).toFixed(2)}`);
			}else{
				rankcard.setDescription(`xp ${rnxp} / ${xpneeded}. lvl ${level}`);
			}
			message.channel.send(rankcard);
		});
	});

	return;
}

async function createRankCanvas(channel,member,ship, ID){
	mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${ID}'` , (err,rows) => {
		let xpneeded;
		let rnxp;
		let level;
		if (parseInt(rows[0].level) === 0){
			xpneeded = 400;
		}else{
			xpneeded = xpdetails.levelupfactor * parseInt(rows[0].level);
		}

		rnxp = parseInt(rows[0].xp);
		level = rows[0].level;
		mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = ${ID}`, (err,rows) => {
			if (rows.length > 0 ){
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, rows[0].giraffeCoins);
			}else{
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, "N/A");
			}
		});
	});

	return;
}

async function creatingCanvas(channel,member,ship,level,rnxp,xpneeded, gCoins){

	let canvas = Canvas.createCanvas(1920,950);
	let ctx = canvas.getContext('2d');

	//Add Background
	let background = await Canvas.loadImage(`./shipsForRankcards/${ship}.png`);
	ctx.drawImage(background, 0, 0, canvas.width, 1080);

	//Something
	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	//Display Name
	ctx.font = applyText(canvas, member.displayName);;
	ctx.fillStyle = '#ffffff';
	ctx.fillText(member.displayName, canvas.width / 2, 125);
	ctx.shadowBlue = 5;

	//Level and XP
	ctx.font = '60px monospace';
	ctx.fillStyle = '#aaa9ad';
	ctx.fillText(`Lvl: ${level}`, canvas.width / 1.5, 250);
	ctx.fillText(`XP: ${rnxp}/${xpneeded}`, canvas.width / 1.5, 375);
	ctx.fillText(`GC: ${gCoins}`, canvas.width / 1.5, 500);

	//Display Avatar
	ctx.beginPath();
	ctx.arc(225, 225, 200, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({format : 'jpg'}));
	ctx.drawImage(avatar, 25, 25, 400, 400);

	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rankcard.png');
	channel.send(attachment);

	return;
}

const applyText = (canvas, text) => {
	let ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};

/////////////////////////////////////////////APIS
function AstronomyPictureoftheDay(message){
	fetch(`https://api.nasa.gov/planetary/apod?api_key=${config.apiKeys.nasa}`).then(res => res.json()).then(response => {
		let explanation = response.explanation;
		if (explanation.length > 1024){
			explanation = explanation.slice(0,1021);
			explanation = explanation + "...";
		}
		let aspdembed = new Discord.MessageEmbed()
					.setTitle("Astronomy Picture of the Day")
					.addField(`${response.title}`,`${explanation}`);
		let linkURL = response.url.toString();
		if (linkURL.substr(response.url.length -3) === "jpg" || linkURL.substr(response.url.length -3) === "png" || linkURL.substr(response.url.length -3) === "jpeg"){
			aspdembed.setImage(`${response.url}`);
		}else{
			aspdembed.addField("URL:",`${response.url}`)
		}
		aspdembed.setFooter(`Date: ${response.date}`)	
				.setTimestamp();
		message.channel.send(aspdembed);
	});
	return;
}

function ISSLocation(){
	try {
		fetch("http://api.open-notify.org/iss-now.json").then(res => res.json()).then(response => {
			let date = new Date(response.timestamp * 1000);
			date = date.toString().replace(/T/g," ");
			date = date.replace(/Z/g,"");
			let ISSembed = new Discord.MessageEmbed()
						.setTitle("ISS Location")
						.addField("Data:",`LAT: ${response.iss_position.latitude}\nLON: ${response.iss_position.longitude}`)
						.setFooter(`Date: ${date}`)
						.setTimestamp();
			bot.channels.cache.get("641373050281132034").messages.fetch("668646281752739851").then(msg => { msg.edit(ISSembed);});
		});
	}catch(e){
		console.log(e);
	}
	return;
}

function GetMarsWeatherData(message){
	fetch(`https://api.nasa.gov/insight_weather/?api_key=${config.apiKeys.nasa}&feedtype=json&ver=1.0`).then(res => res.json()).then(response => {
		let marsWeatherEmbed = new Discord.MessageEmbed()
			.setTitle("Mars Weather Data");
			text="";

		//let temparray = response[[0..num]];

		let i = 0;

		temparray.forEach(element => {
			text = text+`Sol: ${response.sol_keys[i]}\n`
					+`Atmospheric Termperature: "av" ${element.AT.av}, "ct" ${element.AT.ct}, "mn" ${element.AT.mn}, "mx"${element.AT.mx}.\n`
					+`Horizontal Wind Speed: "av" ${element.HWS.av}, "ct" ${element.HWS.ct}, "mn" ${elementHWS.mn}, "mx"${element.HWS.mx}.\n`
					+`Pressure Data: "av" ${element.PRE.av}, "ct" ${element.PRE.ct}, "mn" ${element.PRE.mn}, "mx"${element.PRE.mx}.\n`
					+`Season: ${element.Season}.\n`
					+"\n";
			i++;
		});

		marsWeatherEmbed.addField("",`${text}`);
		message.channel.send(marsWeatherEmbed);
	});
	return;
}

function ExchangeRates(message,currency){
	fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`).then(res => res.json()).then(response => {
		if (response.result === "error"){
			message.channel.send("Please enter a valid currency, use `;help ExchangeRates` for a list");
		}else{
			let text = JSON.stringify(response.rates).replace(/,/g,"\n");
			message.author.send("```"+text+"```");
		}
	});
	return;
}

function Advice(message){
	fetch(`https://api.adviceslip.com/advice`).then(res => res.json()).then(response => {
		let Advice = new Discord.MessageEmbed()
			.setDescription(`${response.slip.advice} ID:${response.slip.id}`);
		message.channel.send(Advice);
	});
	return;
}

function NumbersTrivia(message){
	fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
		message.channel.send("```"+`${response}`+"```");
	});
	return;
}

function Cat(message){
	fetch("https://api.thecatapi.com/v1/images/search").then(res => res.text()).then(response =>{
		message.channel.send(response[0].url);
	});
	return;
}

function underground(message){
	let fileUnderground = fs.readFileSync("./datafile.json").toString();
	fileUnderground = JSON.parse(fileUnderground);
	let a = getRandomInt(fileUnderground.Responses.underground.length+1);
	message.channel.send(fileUnderground.Responses.underground[a]);
	return;
}

async function yodish(message,args){
	let conversion = encodeURIComponent(args.join(" "));
	var resp = await fetch(`http://yoda-api.appspot.com/api/v1/yodish?text=${conversion}`).then(response => response.json()).then(result =>{
		return result;
	});;
 	message.channel.send(resp.yodish);
 	return;
}

//Status lists

function updateMClist(){ 
	let delay = 25000;
	var interval = setInterval(function(){
		fetch('https://api.mcsrvstat.us/2/158.69.5.237:25625').then(response => response.json()).then(json => {
			let playercount = json.players.online;
			let version = json.version;
			let players = json.players.list;
			if (typeof players === "undefined"){
				players = "";
			}
			let online = "";
			try{
				if (json.online = "true"){
					online = "Online";
				}else{
					online = "Offline";
				}
			}catch(e){
				online = "Unable to get status";
			}
			let msg = ("```GT MC Server Status\n"
								+"Status: "+online+"\n"
								+"Version: "+version+"\n"
								+"Players: "+playercount+"/30\n"
								+players+"```");
			bot.channels.cache.get("683030732817694773").messages.fetch("683031127857823873").then(message => {message.edit(msg)});
		});
	},delay);
}

// // OLD
// function update7DTDlist(msg){
// 	let delay = 25000;
// 	var interval = setInterval(function(){
// 		let site = "https://7daystodie-servers.com/api/?object=servers&element=detail&key=INSERTKEY";
// 		fetch('https://7daystodie-servers.com/api/?object=servers&element=detail&key=INSERTKEY').then(response => response.json()).then(json => {
// 			let is_online = json.is_online;
// 			let online = "";
// 			if (is_online === 1){
// 				online = "Online";
// 			}else{
// 				online = "Offline";
// 			}
// 			let players = json.players;
// 			let version = json.version;
// 			let map = json.map;
// 			fetch("https://www.battlemetrics.com/servers/7dtd/4209109").then(m =>m.text()).then(m => {
// 				let time = "";
// 				try{
// 					let time = m.split("<tr")[4].split("<td>")[1].split("</td>")[0];
// 				}catch(e){
// 					time = "unable to get";
// 				}
// 				msg.edit("```7DTD Server Status\n"
// 								+"Server status: "+online+"\n"
// 								+"Current Map: "+map+"\n"
// 								+"Current players: "+players+"/8\n"
// 								+"Current Version: "+version+"\n"
// 								+"Current Time: "+time+"\n"
// 								+"Password Hint: "+"What was it again? 🤔"+"\n```");
// 			})
// 			bot.channels.cache.get("615206706103975936").setName("7dtd-status:-"+players+"--8");
// 		});
// 	},delay);
// }
// NEW
function update7DTDlistNew(){
	fetch('https://www.battlemetrics.com/servers/7dtd/6591807').then(response => response.text()).then(body => {
		try{
		let content = JSON.parse(body.split("<div>")[0].split(`json">`)[1].split(`</script><script`)[0]);
		let server = content.servers.servers["6591807"];
		let sevenDaysToDieServerEmbed = new Discord.MessageEmbed()
			.setTitle(` --- ${server.name} --- `)
			.addField(`Connection Info`,`IP: ${server.ip}\nPort: ${server.port}\nStatus: ${server.status}\nCountry: ${server.country}`,true)
			.addField(`Players`,`Online: ${server.players}/${server.maxPlayers}\nUptime:\n 7 days: ${server.uptime7 * 100}%\n30 days: ${server.uptime30 * 100}%`,true)
			.setTimestamp();
		bot.channels.cache.get("701389896555692062").messages.fetch("701389998162837564").then(msg => {msg.edit(sevenDaysToDieServerEmbed);});
		}catch(e){}
	});
	return;
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
	return;
}

async function translating(msg,args,lang1,lang2){
	for (i=0;i<args.length;){
		args[i] = encodeURIComponent(args[i]);
		i++;
	}
	let query = `https://translate.yandex.net/api/v1.5/tr.json/translate?lang=${lang1}-${lang2}&key=${config.apiKeys.yandex}&text=${args.join('%20')}`;
	let  translation = await fetch(query).then(response => response.json()).then(result =>{
		return result.text;
	});
	msg.channel.send(translation);
	return;
}

function getUserFromMention(mention) {
	let matches = mention.match(/^<@!?(\d+)>$/);
	if (!matches) return;
	let id = matches[1];
	return bot.users.cache.get(id);
}

function displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,user){

	let message_count;
	mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${userID}'`, (err,rows) => {
		if (rows.length < 1){
			message_count = 0;
		}else{
			message_count = rows[0].message_count;
		}
		let nitroInfo = "Nitro Tier: ";
		if (user.premium_type === 1){
			nitroInfo += "Classic";
		}else if (user.premium_type === 20){
			nitroInfo += "Full";
		}else{
			nitroInfo += "N/A";
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("User Info")
   			.setColor(0x008000)
   			.setThumbnail(`${avatar}`)
   			.addField(`User:`,`<@${userID}>`)
   			.addField(`ID:`,`${userID}`,true)
   			.addField(`Account created at:`,`${userCreatedAt}`,true)
   			.addField(`Joined the server at:`,`${userJoinedAt}`,true)
   			.addField(`Server Details:`,`Server Deafened: ${serverDeaf}\nServer Muted: ${serverMute}\nMessages Sent: ${message_count}`,true)
   			.addField(`Nitro info`,`${nitroInfo}`,true)
   			.addField(`Avatar`,`[Link](${avatar})`)
   			.setTimestamp();

   		console.log("FLAGS");
   		console.log(user.flags);
   		console.log("PUBLIC FLAGS");
   		console.log(user.public_flags);
   		console.log("USER");
   		console.log(user);
  		message.channel.send(embed);
	});

  	return;
}
/////////
//Do command

function clean(text) {
  	if (typeof(text) === "string"){
    	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	}
  	else{
  		return text;
  	}
}

function runDatabaseCommand(message,database,query){

	mainDatabaseConnectionPool.query(query, (err,rows) => {
		if (err){
			message.channel.send(err);
		}
		else{
			let count = 0;
			let responseMsg = "```\n";
			let hasNotSent = true;
			for (let i = 0; i < rows.length; i++){
				if (responseMsg.length >= 1500){
					message.channel.send(responseMsg + "```");
					message.channel.send(`Covers: ${count} / ${rows.length} rows.`);
					hasNotSent = false;
					break;
				}else
				{
					for (var key of Object.keys(rows[i]))
					{
						if (rows[i].hasOwnProperty(key)){
							if (count < rows.length - 1)
							{
								responseMsg += `${rows[i][key]}, `;
							}else{
								responseMsg += `${rows[i][key]}`;
							}
						}
					}
					responseMsg += "\n";
					count += 1;
				}
			}

			if (hasNotSent){
				message.channel.send(responseMsg);
			}
		}
	});

	return;
}

/////////

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

function BwServerStatus(){
	if(serverStatus.msg === null){
		bot.channels.cache.get(serverStatus.channel).send("Getting Updates").then((msg)=>{
			serverStatus.msg = msg;
		});
	}
	setInterval(function(){
  		fetch(`https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${config.apiKeys.steam}&format=json&limit=50&filter=\\appid\\420290`).then(res=>res.json()).then(resp=>{ //fetch the server list through the steam API, convert the result into a json object (makes it easier to access)
    		let serverlist = resp.response.servers; 
    			if (typeof serverlist === undefined){
      			console.log("Got an empty response"); 
    		}else{
    	  		let finalmsg = "```markdown\n"; 
      			let active = new Array(); 
      			for (i in serverlist){ 
       	 			if(parseInt(serverlist[i].players) > 0){ 
       	 				active.push(serverlist[i]); 
       	 			}
      			}
      			active = serversort(active); 
      			for (i in active){
       			 	let serverinfo = `[${active[i].players}/${active[i].max_players}][${active[i].name.split("d::")[0].replace(/]/g,"\\").substr(8)}]\n`;
       	 			finalmsg = finalmsg+serverinfo;
      			}
      			finalmsg = finalmsg + "```";
      			serverStatus.msg.edit(finalmsg); 
    		}
  		});
  	},5000);
}

function serversort(servers){
	for (var i = 1; i < servers.length; i++){
    	for (var j = 0; j < i; j++){
       		if (parseInt(servers[i].players) < parseInt(servers[j].players)){ //if there are less players in the left server, then swap them (basic sorting algorithm using two for loops)
    	    	var x = servers[i];
    	   		servers[i] = servers[j];
    	   		servers[j] = x;
    		}
    	}
	}
	return servers.reverse(); //return the sorted array
}

function TodayInHistory(message,argument){
	let date = new Date();
	fetch(`http://history.muffinlabs.com/date/${parseInt(date.getMonth()) + 1}/${date.getDate()}`).then(res => res.json()).then(response => {
		if (argument === "events"){
	 		let num = getRandomInt(response.data.Events.length);
			message.channel.send("```"+`${response.data.Events[num].year} - ${response.data.Events[num].text}`+"```");
		}else if (argument === "births"){
			let num = getRandomInt(response.data.Births.length);
			message.channel.send("```"+`${response.data.Births[num].year} - ${response.data.Births[num].text}`+"```");
		}else if (argument === "deaths"){
			let num = getRandomInt(response.data.Deaths.length);
			message.channel.send("```"+`${response.data.Deaths[num].year} - ${response.data.Deaths[num].text}`+"```");
		}
	});
	return;
}

function RandomUselessFactAPI(message){
	let randomFactEmbed = new Discord.MessageEmbed();
	fetch("https://uselessfacts.jsph.pl//random.json?language=en").then(resp => resp.json()).then(response => {
		if (typeof response.text !== undefined){
			randomFactEmbed.setTitle(`${response.text}`);
		}
		if (typeof response.id !== undefined){
			randomFactEmbed.setDescription(`${response.id}`,"-");
		}
		randomFactEmbed.setTimestamp();
		message.channel.send(randomFactEmbed);
	});
	return;
}

function BaconIpsum(message){
	let opt = getRandomInt(2);
	let content = "";
	if (opt === 0){
		content += "https://baconipsum.com/api/?type=meat-and-filler";
	}else
	if (opt === 1){
		content += "https://baconipsum.com/api/?type=meat-and-filler&start-with-lorem=1";
	}
	fetch(content).then(res => res.json()).then(response => {
		let BaconEmbed = new Discord.MessageEmbed()
			.setDescription(`${response[getRandomInt(response.length)]}`)
			.setTimestamp();
		message.channel.send(BaconEmbed);
	});
	return;
}

function chuckNorrisAPI(message){
	fetch("https://api.chucknorris.io/jokes/random").then(res => res.json()).then(response => {
		let ChuckNorrisEmbed = new Discord.MessageEmbed()
			.setDescription(`${response.value}`)
			.setThumbnail("https://s3.amazonaws.com/mf-cnorris/assets/uploads/2016/10/19123509/timeline-05.jpg")
			.setTimestamp();
		message.channel.send(ChuckNorrisEmbed);
	});
	return;
}

function wordsAPI(message,args){
	if (args.length > 1){
		message.channel.send("The API only works with one word at a time :(");
	}else
	if (args.length === 0){
		message.channel.send("Please enter a word to look up.");
	}else{
		fetch(`https://wordsapiv1.p.mashape.com/words/${args[0]}/definitions`).then(resp => resp.json()).then(response => {
			let definitions = "";
			for(let i = 0; i < response.definitions.length-1; i++) {
			    definitions = definitions +`${response.definitions[i].definition} - ${response.definitions[i].partOfSpeech}\n"`;
			}
			let wordsAPIEmbed = new Discord.MessageEmbed()
				.addTitle(`${args[0]}`)
				.setDescription(`${definitions}`)
				.setThumbnail("https://www.programmableweb.com/sites/default/files/styles/facebook_scale_width_200/public/WordsAPI%20Logo2.png?itok=vfPp_WC1")
				.setTimestamp();
			message.channel.send(wordsAPIEmbed);
		});
	}
	return;
}

function saveQuote(channel,id){
	try{
	bot.channels.cache.get(channel.id).messages.fetch(id).then(message => {
		let Quote = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}`)
			.setDescription(`${message.content}`)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`Sent in: #${channel.name} `)
			.setTimestamp();
		let hasNotAddedImage = true;
		message.attachments.forEach(attachment => {
    		if (message.attachments.size === 1) {
      			if (attachment.url && hasNotAddedImage){
      				Quote.setImage(`${attachment.url}`);
      				hasNotAddedImage = false;
      			}
    		}
  		});
		bot.channels.cache.get(config.serverInfo.channels.quotes).send(Quote);
	});
	}catch(e){
		channel.send("Please make sure you have entered it correctly!");
	}
	return;
}

function saveQuoteAutomatic(message){
	try{
		let AutoQuote = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}`)
			.setDescription(`${message.content}`)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`Sent in: #${message.channel.name} `)
			.setTimestamp();
		let hasNotAddedImage = true;
		message.attachments.forEach(attachment => {
    		if (message.attachments.size === 1) {
      			if (attachment.url && hasNotAddedImage){
      				AutoQuote.setImage(`${attachment.url}`);
      				hasNotAddedImage = false;
      			}
    		}
  		});
		bot.channels.cache.get(config.serverInfo.channels.quotes).send(AutoQuote);
	}catch(e){
		console.log("I CANNOT DO THIS, PLEASE HELP!");
		console.log(e);
	}
	return;
}
//Not yet added handling for the above two functions

function convertToRoman(num) {
  let roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let str = '';

  for (var i of Object.keys(roman)) {
    var q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }

  return str;
}

function getRandomNonsenseWord(){
	fetch("https://www.thisworddoesnotexist.com/").then(resp => resp.text()).then(response => {
		console.log(response.split("body>")[1]);
	});
	return;
}

///////STEAM API
function getSteamGroupData(){
	fetch("https://steamcommunity.com/groups/greattortuga/memberslistxml/?xml=1").then(resp=>resp.text()).then(response => {
		let finalMessage = "```hs\n";
		let groupName = response.split("groupName>")[1].slice(9,-6);
		let memberCount = response.split("memberCount>")[1].slice(0,response.split("memberCount>")[1].length-2);
		let membersInGame = response.split("membersInGame>")[1].slice(0,-2);
		let membersOnline = response.split("membersOnline>")[1].slice(0,-2);
		finalMessage = finalMessage + "STEAM GROUP DATA\n"
			+`${groupName}\n`
			+`Online: ${membersOnline}/${memberCount}\n`
			+`Ingame: ${membersInGame}` +"```";
		bot.channels.cache.get("663524428092538920").messages.fetch("689332199190822968").then(message => {message.edit(finalMessage);});
	});
	return;
}

function scoreAdjustPrestige(score, prestige){
	score -= prestige * 172873;
	if (prestige != 10)
	{
		score = Mathf.Min(score, 172873);
	}
	return score;
}

function levelProgress(score, prestige){
	score = scoreAdjustPrestige(score, prestige);
	for (let i = 0; i < 1000; i++)
	{
		if (score <= i * i * 72)
		{
			return i;
		}
	}
}

async function getBlackwakeStats(message,args){
		fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=420290&steamid=${args[1]}`).then(resp => resp.text()).then(response => {

			if (response.includes("500 Internal Server Error")){
				message.channel.send("Steam API error, code 500");
			}else if (response.includes("Unknown problem determining WebApi request destination.")) {
				message.channel.send("Please ensure you have entered the correct terms! Terms can be found using `;help` `blackwake`.\nThe format is as followed:\n`;blackwake` `term` `steamID64`");
			}else if(response[0] == '<') {
				console.log("BW RESPONSE ISSUE");
				console.log(response);
				console.log("END OF RESPONSE");
				message.channel.send("Error - Please ping @Archie so he checks the console in time!");
			}else{
				let bwStatsEmbed = new Discord.MessageEmbed().setTimestamp();
				response = JSON.parse(response);
				let stats = response.playerstats.stats;

				let weapons = ["acc_mus","acc_blun","acc_nock","acc_ann","acc_rev","acc_pis","acc_duck","acc_mpis","acc_cut","acc_dag","acc_bot","acc_tomo","acc_gren","acc_rap"];
				let substituteNames = ["Musket","Blunderbuss","Nockgun","Annley","Revolver","Pistol","Duckfoot","Short Pistol","Cutlass","Dagger","Bottle","Tomohawk","Grenade","Rapier"];
				let allWeaponStats = [];

				let shipWeaponry = ["acc_can","acc_swiv","acc_grape","acc_arson","acc_ram"];
				let shipWeaponrySubNames = ["Cannonball","Swivel","Grapeshot","Fireshot","Ramming"];
				let shipWeaponryStats = [];

				let ships = ["acc_winHoy","acc_winJunk","acc_winSchoon","acc_cutt","acc_bombk","acc_carr","acc_gunb","acc_winGal","acc_brig","acc_xeb","acc_cru","acc_bombv"];
				let subShipNames = ["Hoy","Junk","Schooner","Cutter","Bomb Ketch","Carrack","Gunboat","Galleon","Brig","Xebec","Cruiser","Bomb Vessel"];
				let shipStats = [];

				let maintenance = ["acc_rep","acc_pump","acc_sail","acc_noseRep"];
				let subMaintain = ["Hole Repairs","Pumping","Sail Repairs","Nose Repairs"];
				let maintain = [];

				let unassigned = true;
				let faveWeap = {}; //"name" : "", "value": ""
				let kills = 0;
				let deaths = 0;
				let captainWins = 0;
				let captainLosses = 0;
				let score = 0;
				let rating = 0;
				let statScoreGs = 0;
				let prestige = 0;

				for (i=0;i<stats.length;i++){

					// fav weapon
					if (weapons.indexOf(stats[i].name) !== -1){
						if (unassigned){
							faveWeap = stats[i];
							unassigned = false;
						}else{
							if (faveWeap.value < stats[i].value){
								faveWeap = stats[i];
							}
						}
						allWeaponStats.push(stats[i]);
					}
					
					switch (stats[i].name){
						case "acc_kills":
							kills = stats[i].value;
							break;
						case "acc_deaths":
							deaths = stats[i].value;
							break;
						case "acc_capWins":
							captainWins = stats[i].value;
							break;
						case "acc_capLose":
							captainLosses = stats[i].value;
							break;
						case "stat_score":
							score = stats[i].value;
							break;
						case "stat_rating":
							rating = stats[i].value;
							break;
						case "stat_score_gs":
							statScoreGs = stats[i].value;
							break;
						case "stat_pres":
							prestige = stats[i].value;
							break;
						default:
							break;
					}

					if (ships.indexOf(stats[i].name) !== -1){
						shipStats.push(stats[i]);
					}

					if (maintenance.indexOf(stats[i].name) !== -1){
						maintain.push(stats[i]);
					}

					if (shipWeaponry.indexOf(stats[i].name) !== -1){
						shipWeaponryStats.push(stats[i]);
					}

				}

				let BwShipsEmbed;
				switch (args[0]){
					case "overview":
						let achieves = "";
						if (JSON.stringify(response).includes("achievements")){
							achieves = response.playerstats.achievements.length.toString();
						}else{
							achieves = "NA";
						}

						let level = levelProgress(score, prestige);

						let playerStatsCombined = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nLevel: (${prestige}) ${level}\nAchievements: ${achieves}/39`;
						if (statScoreGs != 0){
							playerStatsCombined = playerStatsCombined +`\nScore Gs: ${statScoreGs}`;
						}
						fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[1]}`).then(resp => resp.json()).then(response2 =>{
							response2 = response2.response.games;
							for (i=0;i<response2.length;i++){
								if (parseInt(response2[i].appid) === 420290){
									playerStatsCombined = playerStatsCombined + `\n${(response2[i].playtime_forever)/60}hrs`;
								}
							}	
							bwStatsEmbed.setTitle(`${args[1]}`)
								.addField(`General`,`${playerStatsCombined}`,true)
								.addField(`Captain Stats`,`${captainWins} wins\n${captainLosses} losses\nRatio: ${captainWins/captainLosses}`,true)
								.addField(`Fav Weapon`,`${substituteNames[weapons.indexOf(faveWeap.name)]}\n${faveWeap.value} kills`,true);
							sendBWStatsEmbed(message,bwStatsEmbed);
						});
						break;
					case "weaponstats":
						let WeaponStats = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills");
						bwStatsEmbed.setTitle(`${args[1]}`)
							.setDescription(WeaponStats);
						sendBWStatsEmbed(message,bwStatsEmbed);
						break;
					case "shipstats":
						let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins");
						let untrackedWins = parseInt(captainWins) - parseInt(ShipStats.split("Total: ")[1]);
						bwStatsEmbed.setTitle(`${args[1]}`)
							.addField("Ships",`${ShipStats}`,true)
							.addField("General",`Wins: ${captainWins}\n - Untracked: ${untrackedWins}\nLosses: ${captainLosses}\nWin Rate: ${captainWins/captainLosses}`,true);
						sendBWStatsEmbed(message,bwStatsEmbed);
						break;
					case "shipweaponry":
						let shipWeap = WeaponTextGenerator(WeaponSorter(shipWeaponryStats),shipWeaponrySubNames,shipWeaponry,"kills");
						bwStatsEmbed.setTitle(`${args[1]}`)
							.setDescription(`${shipWeap}`);
						sendBWStatsEmbed(message,bwStatsEmbed);
						break;
					case "maintenance":
						let maintainStats = WeaponTextGenerator(WeaponSorter(maintain),subMaintain,maintenance,"");
						bwStatsEmbed.setTitle(`${args[1]}`)
							.setDescription(maintainStats);
						sendBWStatsEmbed(message,bwStatsEmbed);
						break;
					case "compare":
						let playerStatsCombinedP1 = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nCap Wins: ${captainWins}\nCap Losses: ${captainLosses}\nRating: ${rating}`;
						if (statScoreGs != 0){
							playerStatsCombinedP1 = playerStatsCombinedP1 +`\nScore Gs: ${statScoreGs}`;
						}
						fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[1]}`).then(resp => resp.json()).then(response2 =>{
							response2 = response2.response.games;
							for (i=0;i<response2.length;i++){
								if (parseInt(response2[i].appid) === 420290){
									playerStatsCombinedP1 = playerStatsCombinedP1 + `\n${(response2[i].playtime_forever)/60}hrs`;
								}
							}
							fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=420290&steamid=${args[2]}`).then(resp=>resp.json()).then(response => {
								stats = response.playerstats.stats;
								for (i=0;i<stats.length;i++){

									switch (stats[i].name){
										case "acc_kills":
											kills = stats[i].value;
											break;
										case "acc_deaths":
											deaths = stats[i].value;
											break;
										case "acc_capWins":
											captainWins = stats[i].value;
											break;
										case "acc_capLose":
											captainLosses = stats[i].value;
											break;
										case "stat_score":
											score = stats[i].value;
											break;
										case "stat_score_gs":
											statScoreGs = stats[i].value;
											break;
										case "stat_rating":
											rating = stats[i].value;
											break;
										default:
											break;
									}

								}

								let playerStatsCombinedP2 = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nCap Wins: ${captainWins}\nCap Losses: ${captainLosses}\nRating: ${rating}`;
								if (statScoreGs != 0){
									playerStatsCombinedP2 = playerStatsCombinedP2 +`\nScore Gs: ${statScoreGs}`;
								}
								fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[2]}`).then(resp => resp.json()).then(response2 =>{
									response2 = response2.response.games;
									for (i=0;i<response2.length;i++){
										if (parseInt(response2[i].appid) === 420290){
											playerStatsCombinedP2 = playerStatsCombinedP2+ `\n${(response2[i].playtime_forever)/60}hrs`;
										}
									}
									bwStatsEmbed.setTitle(`${args[1]} VS ${args[2]}`)
										.addField(`${args[1]}`,`${playerStatsCombinedP1}`,true)
										.addField(`${args[2]}`,`${playerStatsCombinedP2}`,true);
									sendBWStatsEmbed(message,bwStatsEmbed);
								});
							});
						});
						break;
					default:
						message.reply("Please enter a valid option! You can find valid options by using `;help blackwake`.");
						break;
				}
				setSteamApiNotAllowed();
			}
		}).catch(err => {
			if (err) {
				console.error(err);
				message.channel.send("Please make sure you have entered a correct Steam ID and the profile is set to public! :slight_smile:");
			};
		});
	return;
}

function sendBWStatsEmbed(message,embed){
    message.channel.send(embed);
    return;
}

function blackwakeCommandHandler(message,args){
	if (isAllowed){
		switch (args[0].toLowerCase())
		{
			case "monthly":
				fetchEloStuff(message, args[1], args[0]);
				break;
			case "elo":
				fetchEloStuff(message, args[1], args[0]);
				break;
			case "alternion":
				checkifInDatabase(message,args);
				break;
			default:
				getBlackwakeStats(message,args);
				break;
		}
	}else{
		message.reply("This command is currently on cooldown due to steam API limitations, try again soon!");
	}
}

async function fetchEloStuff(message,steamID,type){

	fetch(config.eloBoardURL).then(resp => resp.json()).then(response => {

		let eloStatsEmbed = new Discord.MessageEmbed()
			.setFooter(`This data is taken from the ahoycommunity LB, it only gets updated if your profile is public and you play on GT.`)
			.setTimestamp();
		let user;

		switch (type)
		{
			case "elo":

				user = response.elo[steamID];

				let results = calculateEloPosition(steamID, response, user.matches, user.rating);

				let elo = results[0];
				let matches = results[1];
				let desc;

				if (parseFloat(user.rating) === 1000.00)
				{
					eloStatsEmbed.addField("You", `Rating: ${user.rating}\nMatches: ${user.matches}\nPosition: 1`, true)
						.addField("2nd Place", `Rating: ${elo[2]}\nMatches: ${matches[2]}\nPosition: 2`, true);
					//desc = `Rating: ${user.rating}\nMatches: ${user.matches}\nPosition: 1\n2nd Place: ${elo[2].rating}`;
				}else{
					let positions = results[2];
					eloStatsEmbed.addField("Target", `Rating: ${elo[0]}\nMatches: ${matches[0]}\nPosition: ${positions[0]}`, true)
						.addField("You", `Rating: ${elo[1]}\nMatches: ${matches[1]}\nPosition: ${positions[1]}`, true)
						.addField("Chaser", `Rating: ${elo[2]}\nMatches: ${matches[2]}\nPosition: ${positions[2]}`, true)
				}

				eloStatsEmbed.setTitle(steamID);
				sendBWStatsEmbed(message,eloStatsEmbed);
				break;
			case "monthly":
				user = response.monthly[steamID];
				if (user === undefined){
					message.channel.send("You are not on the monthly leaderboard. Play a game or two on the GT server to be added.");
					break;
				}
				
				let weapons = ["acc_mus","acc_blun","acc_nock","acc_ann","acc_rev","acc_pis","acc_duck","acc_mpis","acc_cut","acc_dag","acc_bot","acc_tomo","acc_gren","acc_rap"];
				let substituteNames = ["Musket","Blunderbuss","Nockgun","Annley","Revolver","Pistol","Duckfoot","Short Pistol","Cutlass","Dagger","Bottle","Tomohawk","Grenade","Rapier"];
				let allWeaponStats = [];

				let shipWeaponry = ["acc_can","acc_swiv","acc_grape","acc_arson","acc_ram"];
				let shipWeaponrySubNames = ["Cannonball","Swivel","Grapeshot","Fireshot","Ramming"];
				let shipWeaponryStats = [];

				let ships = ["acc_winHoy","acc_winJunk","acc_winSchoon","acc_cutt","acc_bombk","acc_carr","acc_gunb","acc_winGal","acc_brig","acc_xeb","acc_cru","acc_bombv"];
				let subShipNames = ["Hoy","Junk","Schooner","Cutter","Bomb Ketch","Carrack","Gunboat","Galleon","Brig","Xebec","Cruiser","Bomb Vessel"];
				let shipStats = [];

				let maintenance = ["acc_rep","acc_pump","acc_sail","acc_noseRep"];
				let subMaintain = ["Hole Repairs","Pumping","Sail Repairs","Nose Repairs"];
				let maintain = [];

				let unassigned = true;
				let faveWeap = {}; //"name" : "", "value": ""
				let kills = 0;
				let deaths = 0;
				let captainWins = 0;
				let captainLosses = 0;
				let score = 0;
				let rating = 0;
				let statScoreGs = 0;
				let prestige = 0;

				for (var [key, value] of Object.entries(user))
				{
					switch (key)
					{
						// Totals
						case "acc_kills":
							kills = value;
							break;
						case "acc_deaths":
							deaths = value;
							break;
						case "acc_capWins":
							captainWins = value;
							break;
						case "acc_capLose":
							captainLosses = value;
							break;
						case "stat_score":
							score = value;
							break;
						// PLAYER WEAPONS
						case "acc_mus":
							allWeaponStats.push({ "name" : key , "value" : value});
							break;
						case "acc_blun":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_nock":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_ann":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_rev":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_pis":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_duck":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_mpis":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cut":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_dag":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bot":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_tomo":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_gren":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_rap":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						// SHIP WEAPONRY
						case "acc_can":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_swiv":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_grape":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_arson":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_ram":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						// SHIPS
						case "acc_winHoy":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winJunk":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winSchoon":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cutt":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bombk":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_carr":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_gunb":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winGal":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_brig":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_xeb":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cru":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bombv":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						// MAINTENANCE
						case "acc_rep":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_pump":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_sail":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_noseRep":
							maintain.push({ "name" : key , "value" : value});;
							break;
						// If none of the above
						default:
							console.log("New entry found! -" + key + "-");
							break;
					}
				}

				let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins");
				let shipWeap = WeaponTextGenerator(WeaponSorter(shipWeaponryStats),shipWeaponrySubNames,shipWeaponry,"kills");
				let WeaponStats = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills");
				let maintainStats = WeaponTextGenerator(WeaponSorter(maintain),subMaintain,maintenance,"");

				eloStatsEmbed.setTitle(steamID)
					.addField(`Overview`, `Kills: ${kills}, Deaths: ${deaths} => K/D ratio: ${kills/deaths}\nCap Wins: ${captainWins}, Cap Losses: ${captainLosses} => W/L ratio: ${captainWins/captainLosses}\nScore: ${score}`)
					.addField(`Ship Stats`, ShipStats, true)
					.addField(`Ship Weaponry`, shipWeap, true)
					.addField(`Weapon Stats`, WeaponStats, true)
					.addField(`Maintenance`, maintainStats, true);
				sendBWStatsEmbed(message,eloStatsEmbed);
				break;
		}
	});
}

function calculateEloPosition(steamID,response,userMatches,userRating){
	// Infront, User, Behind
	let elo = [1000.0,userRating,0.0];
	let matches = [0,userMatches,0];
	let position = [0,0,0];
	let allRatings = [];
	let allUsers = Object.values(response.elo);

	for (let i = 0; i < allUsers.length; i++)
	{
		let rating = allUsers[i].rating;
		if (rating != NaN)
		{
			if (rating > userRating && rating < elo[0]){

				elo[0] = rating;
				matches[0] = allUsers[i].matches;

			}else if (rating < userRating && rating > elo[2]){

				elo[2] = rating;
				matches[2] = allUsers[i].matches;

			}
			allRatings.push(rating);
		}
	};

	allRatings.sort(function(a, b){return b - a});
	position[0] = allRatings.indexOf(elo[0]);
	position[1] = position[0] + 1;
	position[2] = position[0] + 2;

	return [elo,matches,position];
}

function setSteamApiNotAllowed(){
	isAllowed = false;
	setTimeout(function(){
		isAllowed = true;
	},3000);
	return;
}

function WeaponSorter(weaponsArray){
	for (i=0;i < weaponsArray.length;i++){
		for (s=0;s < weaponsArray.length;s++){
			if (weaponsArray[i].value > weaponsArray[s].value){
				let tempVar = weaponsArray[i];
				weaponsArray[i] = weaponsArray[s];
				weaponsArray[s] = tempVar;
			}
		}
	}
	return weaponsArray;
}

function WeaponTextGenerator(weaponsArray,substituteNames,weapons,type){
	let returnMsg = "";
	let count = 0;
	for (i=0; i < weaponsArray.length;i++){
		if (weapons.indexOf(weaponsArray[i].name) != -1)
		{
			returnMsg = returnMsg + `${substituteNames[weapons.indexOf(weaponsArray[i].name)]} - ${weaponsArray[i].value} ${type}\n`;
			count += weaponsArray[i].value;
		}
	}

	returnMsg += `Total: ${count}`;
	return returnMsg;
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

function displayBotInfo(){
	try{
	//emojis
	bot.channels.cache.get("692403714048131185").messages.fetch("692403984836853862").then(msg => {
		msg.edit("```js\n" + `Main:\n1. randomReactions: ${adjustableConfig.reactions.randomReactions}\n2. chanceofRandomReactions: 1 in ${adjustableConfig.reactions.chanceofRandomReactions}\n3. gtSpecific: ${adjustableConfig.reactions.gtSpecific}\n4. giraffeReactions: ${adjustableConfig.reactions.giraffeReactions}\n5. smirks: ${adjustableConfig.reactions.smirks}\n6. reactionMenu: ${adjustableConfig.reactions.reactionMenu}` + "```");
	});
	//misc
	bot.channels.cache.get("692403714048131185").messages.fetch("692403986518638663").then(msg => {
		msg.edit("```js\n" +`Misc:\n1. active (Quotes): ${adjustableConfig.quotes.active}\n2. chanceOfBeingQuoted: 1 in ${adjustableConfig.quotes.chanceOfBeingQuoted}\n3. nWordFilter: ${adjustableConfig.misc.nWordFilter}\n4. supporTickets: ${adjustableConfig.misc.supporTickets}\n5. moderatorCommands: ${adjustableConfig.misc.moderatorCommands}\n6. generalAudio (music commands): ${adjustableConfig.music.generalAudio}\n7. pingCommand: ${adjustableConfig.music.pingCommand}\n8. trackingCommandUsage: ${adjustableConfig.misc.trackingCommandUsage}` +"```");
	});
	//apis
	bot.channels.cache.get("692403714048131185").messages.fetch("692403988426915941").then(msg => {
		msg.edit("```js\n" + `API Commands/features:\n1. checkNudity: ${adjustableConfig.apis.checkNudity}\n2. inspire: ${adjustableConfig.apis.inspire}\n3. translate: ${adjustableConfig.apis.translate}\n4. urban: ${adjustableConfig.apis.urban}\n5. yodish: ${adjustableConfig.apis.yodish}\n6. randomUselessFactAPI: ${adjustableConfig.apis.randomUselessFactAPI}\n7. memegen: ${adjustableConfig.apis.memegen}\n8. apod: ${adjustableConfig.apis.apod}\n9. numTrivia: ${adjustableConfig.apis.numTrivia}\n10. exchangeRates: ${adjustableConfig.apis.exchangeRates}\n11. advice: ${adjustableConfig.apis.advice}\n12. today: ${adjustableConfig.apis.today}\n14. bacon: ${adjustableConfig.apis.bacon}\n15. chuck: ${adjustableConfig.apis.chuck}\n16. dictionary: ${adjustableConfig.apis.dictionary}\n17. payday2: ${adjustableConfig.apis.payday2}\n18. blackwake: ${adjustableConfig.apis.blackwake}` + "```");
	});
	//tooltip
	bot.channels.cache.get("692403714048131185").messages.fetch("692419941248270407").then(msg => {
		msg.edit("```\nTo edit the config:\n Command = config, first argument is the command name, second is true/false/number\nA few Examples:\n - ;config memegen true\n - ;config nWordFilter true\n - ;config chanceofRandomReactions 27\n```");
	});
	}catch(e){
		console.log(e);
	}
	return;
}

function getRandomMeme(message){
	fetch("https://meme-api.herokuapp.com/gimme/memes").then(resp=>resp.json()).then(response => {
		message.channel.send(response.postLink);
	});
	return;
}
function getRandomMeme2(message){
	fetch("https://some-random-api.ml/meme").then(resp=>resp.json()).then(response => {
		message.channel.send(response.image);
	});
	return;
}
function getRandomGeekJoke(message){
	fetch(`https://geek-jokes.sameerkumar.website/api`).then(resp=>resp.text()).then(response => {
		message.channel.send(response);
	});
	return;
}
function getRandomCorpPhrase(message){
	fetch(`https://corporatebs-generator.sameerkumar.website/`).then(resp=>resp.json()).then(response => {
		message.channel.send(response.phrase);
	});
	return;
}
function getRandomBlankMyBlank(message){
	fetch(`https://api.chew.pro/trbmb`).then(resp=>resp.json()).then(response => {
		message.channel.send(response[0]);
	});
	return;
}
function getRandomStartupIdea(message){
	fetch(`http://itsthisforthat.com/api.php?json`).then(resp=>resp.json()).then(response => {
		let startupIdea = new Discord.MessageEmbed()
			.setTitle("New Startup Idea!")
			.addField("Make:",`${response.this}`,true)
			.addField("For:",`${response.that}`,true)
			.setTimestamp();
		message.channel.send(startupIdea);
	});
	return;
}

//economy

function updateShopWindow(){
	mainDatabaseConnectionPool.query(`SELECT * FROM shop`, (err,rows) => {
		let newShopListing = new Discord.MessageEmbed().setTitle("Shop Channel");

		let melee = "";
		let secondary = "";
		let primary = "";

		let smallShips = "";
		let bigShips = "";
		let megaShips = "";

		let swivelTypes = "";
		let cannons = "";

		let incomeSmall = "";
		let incomeMed = "";
		let incomeLarge = "";

		let birds = "";
		let Reptiles = "";
		let Mammals = "";

		let basicMaterials = "";
		let advancedMaterials = "";
		for (i=0;i<rows.length;i++){
			let itemInfo = JSON.parse(rows[i].info);
			switch(itemInfo.type){
				case "megaShips":
					megaShips = megaShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "smallShips":
					smallShips = smallShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "largeShips":
					bigShips = bigShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "primary":
					primary = primary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "secondary":
					secondary = secondary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "melee":
					melee = melee + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "swivelType":
					swivelTypes = swivelTypes + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "cannons":
					cannons = cannons + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "income":
					switch(itemInfo.size)
					{
						case "Small":
							incomeSmall += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Medium":
							incomeMed += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Large":
							incomeLarge += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						default:
							break;
					}
					break;
				case "pet":
					switch(itemInfo.petType)
					{
						case "Bird":
							birds += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Reptile":
							Reptiles += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Mammal":
							Mammals += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				case "constructionResources":
					switch (itemInfo.materialType)
					{
						case "basicMaterial":
							basicMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "advancedMaterial":
							advancedMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		}
		setTimeout(function(){

			configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {

				let shopWindowChannel = "";

				let shopInformationMessage = "";
				let shopIncomeMessage = "";
				let shopWeaponsMessage = "";
				let shopShipsMessage = "";
				let shopPetsMessage = "";
				let shopConstructionMessage = "";
				let shopShipsArnamentMessage = "";

				for (let s = 0; s < rows2.length; s++)
				{
					switch (rows2[s].name)
					{
						case "shopWindowChannel":
							shopWindowChannel = rows2[s].channelID;
							break;
						case "shopInformationMessage":
							shopInformationMessage = rows2[s].messageID;
						case "shopIncomeMessage":
							shopIncomeMessage = rows2[s].messageID;
							break;
						case "shopWeaponsMessage":
							shopWeaponsMessage = rows2[s].messageID;
							break;
						case "shopShipsMessage":
							shopShipsMessage = rows2[s].messageID;
							break;
						case "shopPetsMessage":
							shopPetsMessage = rows2[s].messageID;
							break;
						case "shopShipsArnamentMessage":
							shopShipsArnamentMessage = rows2[s].messageID;
							break;
						case "shopConstructionMessage":
							shopConstructionMessage = rows2[s].messageID;
							break;
						default:
							break;
					}
				}
				setTimeout(function(){
					let shopInfoEmbed = new Discord.MessageEmbed()
						.setTitle("Shop Window")
						.setDescription("Items that can be purchased are listed containers below in the following format:\n> Item Name - `ITEMID`\nNote: you do not need to make it a `code block`, you can simply type out the itemID")
						.addField('Search', "To search for an item you search based off the `ITEMID` of the item you wish to search, for example:\n;search long9pounder",true)
						.addField('Purchase', "To purchase an item, you purchase based off the `ITEMID` of the item you wish to purchase, for example:\n ;purchase jeanbart",true);
					editMsg(shopInfoEmbed, shopWindowChannel, shopInformationMessage);

					let shopIncomeEmbed = new Discord.MessageEmbed()
						.setTitle("Income")
						.addField('Small', `${incomeSmall}`,true)
						.addField('Medium', `${incomeMed}`,true)
						.addField('Large', `${incomeLarge}`,true);
					editMsg(shopIncomeEmbed, shopWindowChannel, shopIncomeMessage);

					let shopWeaponsEmbed = new Discord.MessageEmbed()
						.setTitle("Weapons")
						.addField('Primary', `${primary}`,true)
						.addField('Secondary', `${secondary}`,true)
						.addField('Melee', `${melee}`,true);
					editMsg(shopWeaponsEmbed, shopWindowChannel, shopWeaponsMessage);

					let shopShipsEmbed = new Discord.MessageEmbed()
						.setTitle("Ships")
						.addField('Small', `${smallShips}`,true)
						.addField('Big', `${bigShips}`,true)
						.addField('Mega', `${megaShips}`,true);
					editMsg(shopShipsEmbed, shopWindowChannel, shopShipsMessage);

					let shopShipsArnamentEmbed = new Discord.MessageEmbed()
						.setTitle("Ship Arnament")
						.addField('Swivels', `${swivelTypes}`,true)
						.addField('Cannons', `${cannons}`,true);
					editMsg(shopShipsArnamentEmbed, shopWindowChannel, shopShipsArnamentMessage);

					let shopPetsEmbed = new Discord.MessageEmbed()
						.setTitle("Pets")
						.addField('Birds', `${birds}`,true)
						.addField('Mammals', `${Mammals}`,true)
						.addField('Reptiles', `${Reptiles}`,true);
					editMsg(shopPetsEmbed, shopWindowChannel, shopPetsMessage);

					let shopConstructionEmbed = new Discord.MessageEmbed()
						.setTitle("Construction Materials")
						.addField('Basic', `${basicMaterials}`,true)
						.addField('Advanced', `${advancedMaterials}`,true);
					editMsg(shopConstructionEmbed, shopWindowChannel, shopConstructionMessage);

					return;
				},9000);
			});
						
		},6000);
	});
	
	return;
}

function displayRichestUsers(){
	
	return;

	configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {
		let economyBoardsChannel;
		let richetsUsersMesg;
		let poorestUsersMsg;
		for (let s = 0; s < rows2.length; s++)
		{
			if (rows2[s].name == "shopBoardsChannel")
			{
				economyBoardsChannel = rows2[s].channelID;
			}else if (rows2[s].name == "richestUsers")
			{
				richetsUsersMesg = rows2[s].messageID;
			}else if (rows2[s].name == "poorestUsers")
			{
				poorestUsersMsg = rows2[s].messageID;
			}
		}
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 desc limit 30`, (err,rows) => {
		let newRichest = "```TEXT\nThe Richest Users!\nUsername            |Coins in Bank\n";
		let factor = 100;
		for (i=0;i<30;i++){
			let name;

			try
			{
				let member = bot.guilds.cache.get("401924028627025920").members.cache.get(rows[i].ID).user;
				if (rows[i].ID === 'thereserve'){
					name = "Federal Reserve";
				}else if (member.user === undefined){
					name = "REPLACEMENT";
				}else{
					name = member.user.username;
				}
			}catch(e)
			{
				console.log("Richest: " + e);
				name = "REPLACEMENT";
			}

			if (name.length < leaderboardlimits.usernameEco){
				let x = leaderboardlimits.usernameEco - name.length;
				name = name + new Array(x + 1).join(' ');
			}else{
				name = name.split(0,leaderboardlimits.usernameEco);
			}
			let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
			if (coins >= (1000000000 * factor)){
				coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
			}else if (coins >= (1000000 * factor)){
				coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
			}else if (coins >= (1000 * factor)){
				coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
			}else{
				coins = coins / factor;
			}
			newRichest = newRichest + name +"|"+ coins +"\n";
		}
		newRichest += "```";
		bot.channels.cache.get(economyBoardsChannel).messages.fetch(richetsUsersMesg).then(msg => {
			msg.edit(newRichest);
		});
	});

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 limit 30`, (err,rows) => {
		let newPoorest = "```TEXT\nThe Poorest Users!\nUsername            |Coins in Bank\n";
		let factor = 100;
		for (i=0;i<30;i++){
			let name;

			try
			{
				let member = bot.guilds.cache.get("401924028627025920").members.cache.get(rows[i].ID).user;
				if (rows[i].ID === 'thereserve'){
					name = "Federal Reserve";
				}else if (member.user === undefined){
					name = "REPLACEMENT";
				}else{
					name = member.user.username;
				}
			}catch(e)
			{
				console.log("Poorest: " + e);
				name = "REPLACEMENT";
			}

			if (name.length < leaderboardlimits.usernameEco){
				let x = leaderboardlimits.usernameEco - name.length;
				name = name + new Array(x + 1).join(' ');
			}else{
				name = name.split(0,leaderboardlimits.usernameEco);
			}
			let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
			if (coins >= (1000000000 * factor)){
				coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
			}else if (coins >= (1000000 * factor)){
				coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
			}else if (coins >= (1000 * factor)){
				coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
			}else{
				coins = coins / factor;
			}
			newPoorest = newPoorest + name +"|"+ coins +"\n";
		}
		newPoorest += "```";
		bot.channels.cache.get(economyBoardsChannel).messages.fetch(poorestUsersMsg).then(msg => {
			msg.edit(newPoorest);
		});
	});
	});
	return;
}
function giveUserMoney(amount,ID){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			sql = `INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${ID}','${amount}','[]')`;
		} else {
			sql = `UPDATE inventoryGT SET giraffeCoins = '${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(amount * 100)) / 100).toFixed(2)}' WHERE ID = '${ID}'`;
		}
		mainDatabaseConnectionPool.query(sql);
		displayRichestUsers();
	});

	return;
}

function purchaseItem(ID,item,message,args){

	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if (rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}
		mainDatabaseConnectionPool.query(`SELECT * FROM shop WHERE name='${item}'`, (err2, rows2) => {
			if (rows2.length < 1){
				message.channel.send( "Please make sure you entered the correct name!");
			}else if(rows2.length > 1){
				message.channel.send(`Could you be a bit more specific? Using your search term I have ${rows.length} results.`);
			}else if (parseFloat(rows[0].giraffeCoins) < rows2[0].value){
				message.channel.send(`You have insufficient coins to afford this item! You need another ${rows2[0].value - rows[0].giraffeCoins}GC`);
			}else if(parseInt(rows2[0].inStock) <= 0){
				message.channel.send( "This item is currently out of stock! Try get someone else to sell theirs so you can buy it, or wait for the next increase in stock!");
			}else{

				let inventory = JSON.parse(rows[0].inventory);
				let itemInfo = JSON.parse(rows2[0].info);
				let continueAnyway = true;
				mainDatabaseConnectionPool.query(`SELECT * FROM shopTypeLimits WHERE type='${itemInfo.type}'`, (err,rows3) => {
					let counter = 0;
					let maxCount = rows3[0].maxCount;
					if (itemInfo.type === "constructionResources")
					{
						resourceAmountPurchased = parseInt(args[1]);
						if (isNaN)
						{
							message.channel.send("Please enter a valid amount!");
							continueAnyway = false;
						}else
						{
							if ((rows2[0].value * resourceAmountPurchased) > parseFloat(rows[0].giraffeCoins))
							{
								message.channel.send(`You have insufficient coins to afford this item! You need another ${(rows2[0].value * resourceAmountPurchased) - rows[0].giraffeCoins}GC`);
								continueAnyway = false;
							}
						}
					}
					for (i=0; i< inventory.length ; i++){
						if (continueAnyway){
							if (inventory[i].name === rows2[0].name){
								message.channel.send("You already own that item!");
								continueAnyway = false;
							}else if(inventory[i].type === itemInfo.type){
								counter = counter + 1;
								if (counter >= maxCount){
									message.channel.send("You already own an item of this type!");
									continueAnyway = false;
								}
							}
						}
					}
					if (continueAnyway){
						let fancyPurchaseEmbed = new Discord.MessageEmbed()
							.setTitle("Item Purchased")
							.setDescription(`${itemInfo.desc}`);

						if (itemInfo.type.toString().toLowerCase().includes("megaship")){
							fancyPurchaseEmbed.addField("Basic",`Name: ${itemInfo.name}\nCrew: ${itemInfo.crew}`,true)
									.addField("Detail",`Type: ${itemInfo.cannons}\nNationality: ${itemInfo.nationality}`,true);
						}else if (itemInfo.type.toString().toLowerCase().includes("ship")){
							fancyPurchaseEmbed.addField("Info",`Name: ${itemInfo.name}\nCrew: ${itemInfo.crew}`,true)
									.addField("Detail",`Cannons: ${itemInfo.cannons}\nType: ${itemInfo.type}`,true);
						}else{
							fancyPurchaseEmbed.addField("Info", `Name: ${itemInfo.name}`);
						}

						fancyPurchaseEmbed.setTimestamp();
						let customizable = false;
						if (itemInfo.customizable === "yes"){
							customizable = true;
						}
						if (itemInfo.type === "constructionResources")
						{
							inventory.push( {"name" : rows2[0].name, "type" : itemInfo.type, "value" : (rows2[0].value / 2), "properName" : itemInfo.name, "amount" : amount} );
						}else{
							inventory.push( {"name" : rows2[0].name, "type" : itemInfo.type, "customizable" : customizable, "value" : (rows2[0].value / 2), "properName" : itemInfo.name} );
						}
						mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${rows[0].giraffeCoins - rows2[0].value}', inventory='${JSON.stringify(inventory)}' where ID = '${ID}'`);
						mainDatabaseConnectionPool.query(`update shop set inStock = ${rows2[0].inStock - 1} where name='${item}'`);
						message.channel.send(fancyPurchaseEmbed);
						if (parseInt(rows2[0].value) > 5000){
							let logEmbed = new Discord.MessageEmbed()
								.setTitle("Transaction Occured")
								.setDescription(`${itemInfo.name}\nPurchased by <@${message.author}> for ${rows2[0].value}GC`);
							bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(logEmbed);
						}
						updateShopWindow();
						displayRichestUsers();
					}
				});	
			}
		});
	});
	
	return;
}

function searchForItem(item,message){
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	if (Array.isArray(item)){
		item = item.join(' ');
	}
	item = item.toLowerCase().replace(/ /g,"");

	mainDatabaseConnectionPool.query(`SELECT * FROM shop WHERE name LIKE '%${item}%'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("That item does not exist.");
		} else if(rows.length > 1 && rows.length < 10){
			let allNames = "Results:\n```\n";
			for (i=0; i< rows.length; i++){
				allNames = allNames + rows[i].name + "\n";
			}
			message.channel.send(allNames+"```");
		}else if( rows.length >= 10){
			message.channel.send("Could you be more specific? Using your term I got " + rows.length + " results.");
		}else{
			let itemInfo = JSON.parse(rows[0].info);
			let searchEmbed = new Discord.MessageEmbed()
				.setTitle(`${itemInfo.name}`)
				.setDescription(`${itemInfo.desc}`);
			if (itemInfo.type.includes("megaShip")){
				searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}\nNationality: ${itemInfo.nationality}`,true)
					.addField(`More Info`,`[More historical information about this ship can be found here](${itemInfo.link})`,true);
			}else if (itemInfo.type.includes("Ship")){
				searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}`);
			}else{
				searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}`);
			}

			searchEmbed.addFields({name : `Value`, value: `Cost: ${rows[0].value}`,inline: true},{name : `To Purchase`, value: "`"+`;purchase`+"` `"+`${rows[0].name}`+"`", inline: true});
			message.channel.send(searchEmbed);
		}
	});

	return;
}

function sellItem(ID,item,message){

	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send(`Something has gone wrong, please message <@${config.ownerId}>`);
		}else{
			let inventory = JSON.parse(rows[0].inventory);
			let notFound = true;
			let tempList = [];
			let worth;
			for (i=0; i < inventory.length; i++){
				if (inventory[i].name !== item){
					tempList.push(inventory[i]);
				}else{
					notFound = false;
					worth = inventory[i].value;
				}
			}

			if (!notFound){
				mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
					let itemInfo = JSON.parse(rows2[0].info);
					let sellEmbed = new Discord.MessageEmbed().setTitle("Item Sold").setDescription(`Item: ${itemInfo.name} has been sold for ${worth}.\nSold by: ${message.author}`).setTimeStamp();
					message.channel.send(sellEmbed);
					bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(sellEmbed);
					updateShopWindow();
					displayRichestUsers();
				});
			}

			if (notFound){
				message.channel.send("You cannot sell this item as you do not own it!");
			}
		}
	});

	return;
}

async function listInventory(ID,message){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);

		if(rows.length === 0){
			message.channel.send("You are not in the database.");
		}else if(rows.length > 1){
			message.channel.send("An error has occured, please contact Archie.");
		}else{
			let inv = JSON.parse(rows[0].inventory);
			let response = ""
			if (inv.length > 0){
				for (i=0;i<inv.length;i++){
					response = response + inv[i].properName + "\n";
				}
			}else{
				response = "N/A";
			}

			let inventoryEmbed = new Discord.MessageEmbed()
				.setTitle(`Inventory for ${message.author.username}`)
				.setDescription(`${response}`);

			message.channel.send(inventoryEmbed);
		}
	});

	return;
}

function giftUserItem(gifterID,reciever,item,message){
	let user = getUserFromMention(reciever);
	user = user.id;
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate item!");
	}

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send(`Something has gone wrong, please message <@${config.ownerId}>`);
		}else{
			let inventory = JSON.parse(rows[0].inventory);
			let notFound = true;
			let tempList = [];
			let worth;
			for (i=0; i < inventory.length; i++){
				if (inventory[i].name !== item){
					tempList.push(inventory[i]);
				}else{
					notFound = false;
				}
			}

			if (!notFound){
				mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
					let itemInfo = JSON.parse(rows2[0].info);
					message.channel.send(`Item: ${itemInfo.name} has been sold for ${worth}.`);
					updateShopWindow();
				});
			}

			if (notFound){
				message.channel.send("You cannot gift this item as you do not own it!");
			}
		}
	});

	return;
}

function giftUserCoins(gifterID,recieverID,amount,message){

	if (isNaN(amount)){
		message.channel.send("Please enter a correct value!");
		return;
	}else if (amount < 5){
		message.channel.send("You must gift atleast 5 coins!");
		return;
	}

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${gifterID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("You are not in the database! Please send a few messages to get entered!");
		} else if(amount > (rows[0].giraffeCoins * 1)){
			message.channel.send("You cannot gift money you do not have!");
		}else{
			mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${recieverID}'`, (err,rows2) => {
				let giftCoinsEmbed = new Discord.MessageEmbed().setTitle("User Gifted");
				if (rows2.length < 1){
					mainDatabaseConnectionPool.query(`INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${recieverID}','${amount}','[]')`);
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
					giftCoinsEmbed.setDescription(`Added user <@${recieverID}> to the database\nGifted user: ${amount}GC from <@${gifterID}>`);
				}else{
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows2[0].giraffeCoins * 1) + (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${recieverID}'`);
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
					giftCoinsEmbed.setDescription(`<@${gifterID}> gifted user <@${recieverID}>, amount: ${amount}GC`);
				}
				message.channel.send(giftCoinsEmbed);
				if ((parseFloat(amount).toFixed(2) * 1) >= 1000)
				{
					configurationDatabaseConnectionPool.query("SELECT * FROM economyInformation", (err,rows) => {
						for (let i = 0; i < rows.length; i++)
						{
							if (rows[i].name == "bigTransactionLoggingChannel")
							{
								bot.channels.cache.get(rows[i].channelID).send(giftCoinsEmbed);
								displayRichestUsers();
							}
						}
					});
				}
			});
		}
	});

	return;
}

function gambleMoney(amount,message){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
		if (isNaN(amount)){
			message.channel.send("Please enter a correct value!");
		}else if (amount > parseFloat(rows[0].giraffeCoins)){
			message.channel.send("You cannot gamble more than you have!");
		}else if (amount < 5){
			message.channel.send("You must gamble a minimum of 5 coins!");
		}else{
			let result = getRandomInt(30);
			switch(true){
				case result < 20:
					income = -0.7;
					break;
				case result < 24:
					income = 1;
					break;
				case result < 26:
					income = 1.2;
					break;
				case result < 28:
					income = 1.4;
					break;
				case result < 30:
					income = 2;
					break;
			}
			if ((income * amount) !== amount){
				mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(((rows[0].giraffeCoins * 100) + (((income * amount) - amount) * 100)) / 100).toFixed(2)}' where ID='${message.author.id}'`);
				});
			}
			if (((income * amount) - amount).toFixed(2) < 0){
				mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='thereserve'`, (err,rows) =>{
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${Math.abs((((rows[0].giraffeCoins * 100) + ((income * amount) * 100)) / 100).toFixed(2))}' where ID='thereserve'`);
				});
			}
			let gambleEmbed = new Discord.MessageEmbed()
				.setTitle("Gamble")
				.setDescription(`Income: ${((income * amount) - amount).toFixed(2)}`)
				.setTimestamp();
			message.channel.send(gambleEmbed);	
			displayRichestUsers();
		}
	});

	return;
}

//WIP
function customizeShip(ID,args,message){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("You are not currently in the database! Send a few messages to be entered.");
		} else {
			let inventory = rows[0].inventory;
			let notFound = true;
			let canBeCustomized = false;
			let shipInInventory = 0;

			for (i=0;i<inventory.length;i++){
				if (inventory[i].name === args[0]){
					shipInInventory = i;
					notFound = false;
					canBeCustomized = inventory[i].customizable;
				}
			}


			if(notFound){
				message.channel.send("You cannot customize something you do not own!");
			}else{
				if (canBeCustomized){
					if (args[0] === "sailPattern"){
						if (inventory[shipInInventory]){}
					}else if(args[0] === "sailColour"){}
				}else{
					message.channel.send("This item cannot be customized!");
				}
			}
		}
		mainDatabaseConnectionPool.query(sql);
	});

	return;
}

//Income Methods

function checkQuizAllowances(message,args){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT where ID='${message.author.id}'`, (err,rows,fields) => {

		mainDatabaseConnectionPool.query("SELECT * FROM cooldowns WHERE name='quiz'", (err,rows2,fields) => {

			if (args[0] === "income"){
				if (rows[0].lastQuiz === null){

					quizQuestions(message,true);
					mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${message.author.id}'`);

				}else if ((parseInt(rows[0].lastQuiz) + rows2[0].duration) < (new Date().getTime())){

					quizQuestions(message,true);
					mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${message.author.id}'`);

				}else{
					message.channel.send(`Please wait, your income on this command is currently on a ${parseInt(rows2[0].duration / 1000)}sec cooldown.`);
				}
			}else{
				quizQuestions(message,false);
			}

		});

	});

	return;
}

function quizQuestions(message,isGainingIncome){
	mainDatabaseConnectionPool.query("SELECT * FROM quiz", (err,rows,fields) => {
		let num = getRandomInt(rows.length - 1);
		if (rows[num].format === "text"){
			textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,rows[num].maxAttempts,isGainingIncome);
		}
	});
	return;
}

async function textQuizQuestions(message,question,awnsers,timeFactor,worthFactor,maxAttempts,isGainingIncome){
	let baseIncome = 5;
	let filter = response => {
		return (awnsers.indexOf(response.content.toLowerCase()) !== -1);
	};
	message.channel.send(question).then(() => {
		message.channel.awaitMessages(filter, {max: 1, time: (15000 * timeFactor), errors: ['time']})
			.then(collected => {
				if (isGainingIncome){
					message.channel.send(`${collected.first().author} got the correct awnser and have earned themselves ${baseIncome * worthFactor}GC!`);
					giveUserMoney(baseIncome * worthFactor, collected.first().author.id);
				}else{
					message.channel.send(`${collected.first().author} got the correct awnser!`);
				}
			})
			.catch(collected => {
				message.channel.send('Sadly, right now, is not the moment we find out the answer to this question.');
			});
	});
}

function specificQuiz(message,type){
	switch (type)
	{
		case "flags":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='flags'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "blackwake":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='blackwake'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "science":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='science'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "sports":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='sports'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "geography":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='geography'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "show/music":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='show/music'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "tech":
			mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='tech'", (err,rows,fields) => {
				let num = getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		default:
			break;
	}
}

function economyWork(message){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows,fields) =>{
		let result = getRandomInt(30);
		let workingEmbed = new Discord.MessageEmbed().setTimestamp();
		let inv = JSON.parse(rows[0].inventory);
		workingEmbed.setTitle("Result");

		if (rows.length != 0 && rows.length < 2)
		{
			if (rows[0].lastWorked === null)
			{
				mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${message.author.id}'`);
				let income = 10;
				if (rows[0].inventory.length)
				{
					let count = 0;
					for (let i = 0; i < inv.length; i++)
					{
						if (inv[i].type === 'income')
						{
							income += inv[i].value;
							count += 1;
						}
					}
				}
				giveUserMoney(income, message.author.id);
				workingEmbed.setDescription(`You have earnt: ${income}GC!`);

			}else
			{
				if ( (parseInt(rows[0].lastWorked) + 86400000) < (new Date().getTime()) )
				{
					let income = 10;
					for (let i = 0; i < inv.length; i++)
					{
						if (inv[i].type === 'income')
						{
							income += inv[i].value;
						}
					}
					giveUserMoney(income, message.author.id);
					mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${message.author.id}'`);
					workingEmbed.setDescription(`You have earnt: ${income}GC!`);
				}
				else
				{
					let days = [
 				 		'Sun',
 				 		'Mon',
				 		'Tue',
 						'Wed',
 				 		'Thu',
 				 		'Fri',
 				 		'Sat'
					]

					let time = new Date(parseInt(rows[0].lastWorked)).getTime() + 86400000;
					let date = new Date(time);
					let hrs = date.getHours();
					if (parseInt(hrs) < 10)
					{
						hrs = '0' + hrs;
					}
					let min = date.getMinutes();
					if (parseInt(min) < 10)
					{
						min = '0' + min;
					}
					let sec = date.getSeconds();
					if (parseInt(sec) < 10)
					{
						sec = '0' + sec;
					}
					let finalDate = `${days[date.getDay()]} ${hrs} : ${min} : ${sec}`;
					workingEmbed.setDescription(`You cannot work yet! You must wait until ${finalDate} CEST`);
				}
			}
		}else{
			workingEmbed.setDescription("Something went wrong, please notify Archie");
		}
		message.channel.send(workingEmbed);
		displayRichestUsers();
	});

	return;
}
//Not yet complete

function listTheCommands(message){
		let embed = new Discord.MessageEmbed()
			.setTitle("General Commands")
   			.setColor(0x008000)
   			.addField(`Prefix:`,`;`)
   			.addField(`Translate:`,`translate en (words) --- this translates from russian to english\ntranslate ru (words) --- this translates from english to russian`)
   			.addField(`Listcommands:`,`Lists all the available commands`)
   			.addField(`Suggest:`,`Use this command to suggest something to the admin/mod team, if it gets apporved it will be put into #voting where it will be voted on`)
   			.addField(`Help:`,`Get help on how to use a command! Currently only works on a few commands, use ";help list" to view all available`)
   			.addField(`Quote:`,`Get a random quote from someone`)
   			.addField(`Rankcard:`,`using this command shows you your current level and the amount of XP you have`)
   			.addField(`User Commands`,` - Em\n - Jakka\n - Extra\n - Emjakka\n - Torden\n - Spartan\n - Metz\n - Oli\n - Edward`,true)
   			.addField(`Misc Commands`,` - Nerds\n - Hangover\n - Russia\n - Ew\n - Dog\n - Cat\n - Art\n - Dance\n - Playdie\n - Rolldie\n - Rollcustom\n - Coinflip\n - Dad\n - Nootnoot\n - Urban\n - Today`,true)
   			.addField(`Meme Commands`,` - France\n - Assemble\n - Memegen\n - Random\n - Insult\n - Trump\n - 8Ball\n - Execute\n - Frustration\n - Magic\n - Pong\n - Ping\n - Advice\n - yodish\n - Beg\n - Quiz`,true)
   			.addField(`Music Commands`,` - PlayAudio\n - RandomSong`,true)
   			.addField(`Nerd Commands`,` - APOD\n - MarsWeather\n - NumTrivia\n - ExchangeRates`,true)
   			.addField(`Economy Commands`,` - work\n - GiftCoins\n - Purchase\n - Sell\n - Inventory`,true)
   			.setTimestamp();
   		message.author.send(embed);

   		let dembed = new Discord.MessageEmbed()
			.setTitle("Currently Unavailable Commands")
   			.setColor(0x008000)
   			.addField(`Misc:`,` - math`)
   			.setTimestamp();
   		message.author.send(dembed);

   		if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator)){

   			let Membed = new Discord.MessageEmbed()
				.setTitle("Moderator Commands")
   				.setColor(0xeecd17)
   				.addField(`Mute::`,`Mute @user`)
   				.addField(`Unmute:`,`Unmute @user`)
   				.addField(`Tempmute:`,`Tempmute @user`)
   				.addField(`Warn:`,`Warn @user **Reason**`)
   				.addField(`Totalusers:`,`Shows the total number of people`)
   				.addField(`UserInfo`,`Use without any arguments for information about yourself, Use:\n - ;UserInfo @user\nTo get specific information on one person`)
   				.addField(`Misc`,` - savequote *messageID*\n`)
   				.setTimestamp();
   			message.author.send(Membed); //Mods

   		}

   		if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){

   			let Aembed = new Discord.MessageEmbed()
				.setTitle("Admin Commands")
   				.setColor(0xdb1a1a)
   				.addField(`Ban:`,`Ban @user`)
   				.addField(`ServerInfo:`,`Gives information about the server`)
   				.addField(`ChannelInfo:`,`Gives information about a channel`)
   				.addField(`Reaction Roles:`,` - **CreateRole** \`@role\` ***:emoji:***\n(Adds a role to the reaction role menu)\n  - **DeleteRole** ***:emoji:***\n(Removes a role to the reaction role menu)`, true)
   				.addField(`Custom Commands:`,` - **CreateCommand** \`Command\` ***Stuff the command outputs***\n(Creates a command that anyone can use)\n - **DeleteCommand** \`Command\`\n(Deletes a custom made command permanently)`, true)
   				.setTimestamp();
   			message.author.send(Aembed); //Admins
   		}
}

function getUserInformation(message,args){
	let userInformation;
	let userID;
	let userCreatedAt;
	let userJoinedAt;
	let avatar;
	let serverDeaf;
	let serverMute;

	if (typeof args[0] !== undefined && args.length < 1){
		userInformation = message.guild.members.cache.get(message.author.id);	
		userID = userInformation.user.id;

		let usertimestamp = (new Date(userInformation.user.createdTimestamp)).toString().split(" ");
		userCreatedAt = `${usertimestamp[2]}/${usertimestamp[1]}/${usertimestamp[3]}\n${usertimestamp[4]} CEST`;

		let temp = (new Date(userInformation.joinedTimestamp)).toString().split(" ");
		userJoinedAt = `${temp[2]}/${temp[1]}/${temp[3]}\n${temp [4]} CEST`;

		avatar = userInformation.user.displayAvatarURL();

		serverDeaf = userInformation.serverDeaf;
		serverMute = userInformation.serverMute;

		displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,userInformation.user);

	}else{
		if (!message.mentions.users.size) {
			message.reply('You need to ping member to get their info!');
		}else{
			userInformation = bot.guilds.cache.get(message.guild.id).members.cache.get(getUserFromMention(args[0]).id);	
			userID = userInformation.user.id;
			let usertimestamp = (new Date(userInformation.user.createdTimestamp)).toString().split(" ");
			userCreatedAt = `${usertimestamp[2]}/${usertimestamp[1]}/${usertimestamp[3]}\n${usertimestamp[4]} CEST`;

			let temp = (new Date(userInformation.joinedTimestamp)).toString().split(" ");
			userJoinedAt = `${temp[2]}/${temp[1]}/${temp[3]}\n${temp [4]} CEST`;

			avatar = userInformation.user.displayAvatarURL();

			serverDeaf = userInformation.serverDeaf;
			serverMute = userInformation.serverMute;

			displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,userInformation.user);
		}
	}
}

function displayReactionRoles(){
	mainDatabaseConnectionPool.query('SELECT * FROM reactionRoleMessages', (err,rows, fields) => {
		if (!rows)
		{
			return;
		}
		let characterCount = 0; // Amount of characters in each message, as discord has a 2000 character limit
		let msgCount = 0; // Amount of reaction role messages
		let finalMsg = ""; // Final message to be used
		let newMsgs = [];

		reactionRoles.forEach(roleInfo => {
			if (finalMsg.length > 1800){
				if (msgCount >= rows.length)
				{
					bot.channels.cache.get(rows[0].channelID).send("temp").then(msg => {
						editMsg(finalMsg, rows[0].channelID, msg.id);
						newMsgs.append(msg.id);
						finalMsg = "";
					});
				}
				editMsg(finalMsg, rows[0].channelID, rows[msgCount].messageID);
				msgCount += 1;
				finalMsg = "";
			}else{
				if (roleInfo.EmojiType == "unicode")
				{
					finalMsg += `${roleInfo.EmojiName}` + " `:` " + `<@&${roleInfo.RoleID}>\n`; // Unicode type just has default icon as raw unicode
				}else
				{
					finalMsg += `<:${roleInfo.EmojiName}:${roleInfo.EmojiID}>` + " `:` " + `<@&${roleInfo.RoleID}>\n`; // Custom emoji's must be displayed with ID
				}
			}
		});

		//Display final message
		if (finalMsg != "")
		{
			editMsg(finalMsg, rows[0].channelID, rows[msgCount].messageID);
		}

		if (newMsgs.length >= 1)
		{
			for (let i = 0; i < newMsgs.length; i++)
			{
				mainDatabaseConnectionPool.query(`INSERT INTO reactionRoleMessages VALUES (${rows[0].channelID} ${newMsgs[i]})`);
			}
		}

	});

	return;
}

function editMsg(contents,channelID,msgID){
	bot.channels.cache.get(channelID).messages.fetch(msgID).then( msg => {
		msg.edit(contents);
	});
}

function updateNWordCounter(message){
	mainDatabaseConnectionPool.query(`SELECT * FROM nWordCount WHERE ID='${message.author.id}'`, (err,rows, fields) => {
		if (rows.length === 0){
			mainDatabaseConnectionPool.query(`INSERT INTO nWordCount VALUES ('${message.author.id}', '1', '${message.guild.id}')`);
		}else{
			mainDatabaseConnectionPool.query(`UPDATE nWordCount SET counter='${parseInt(rows[0].counter) + 1}' WHERE ID='${message.author.id}'`);
		}
	});

	return;
}

// Alternion Mod integration

var alternionConnectionPool = mysql.createPool({
	connectionLimit : 30,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : "Alternion"
});

function alternionHandler(message, args){
	let alternionHandlerEmbed = new Discord.MessageEmbed();

	switch (args[1].toLowerCase()){

		case "listbadges":
			alternionHandlerEmbed.setTitle("Available Badges")
				.setFooter("The formatting is: - `badge_id` : Badge Name -");
			getBadges(message,message.author.id,alternionHandlerEmbed);
			break;

		case "help":
			if (args[2]){
				switch (args[2].toLowerCase()){
					case "listbadges":
						alternionHandlerEmbed.setDescription("Lists all limited badges that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listsails":
						alternionHandlerEmbed.setDescription("Lists all limited sails that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listmainsails":
						alternionHandlerEmbed.setDescription("Lists all limited main sails that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listcannons":
						alternionHandlerEmbed.setDescription("Lists all limited cannons that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listweapons":
						alternionHandlerEmbed.setDescription("Lists all limited weapon skins that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "assign":
						alternionHandlerEmbed.setDescription("Assign an asset to be used.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "overview":
						alternionHandlerEmbed.setDescription("Lists your currently selected setup.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					default:
						break;
				}
			}else{
				alternionHandlerEmbed.setTitle("Help Menu")
					.setDescription("Default usage:\n`;Blackwake` `Alternion` `Feature`\nCurrently supported features:\n- Help\n- ListBadges\n- ListSails\n- ListMainSails\n- ListWeapons\n- Assign\n- Overview\nUse **;Blackwake Alternion Help** `FEATURE` for more help on each feature")
					.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			}
			break;

		case "assign":
			alternionHandlerEmbed.setTitle("Assigning Item");
			assignItemSkin(message,args,alternionHandlerEmbed);
			break;

		case "overview":
			getAlternionOverview(message,alternionHandlerEmbed);
			break;

		case "listsails":
			alternionHandlerEmbed.setTitle("Available Sails")
				.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
			getNormalSails(message,message.author.id,alternionHandlerEmbed);
			break;

		case "listmainsails":
			alternionHandlerEmbed.setTitle("Available Main Sails")
				.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
			getMainSails(message,message.author.id,alternionHandlerEmbed);
			break;

		case "listcannons":
			alternionHandlerEmbed.setTitle("Available Cannons")
				.setFooter("The formatting is: - `Cannon_ID` : Cannon Name -");
			getCannons(message,message.author.id,alternionHandlerEmbed);
			break;

		case "listweapons":
			alternionHandlerEmbed.setTitle("Available Weapon Skins")
				.setFooter("The formatting is: - `Skin_ID` : Skin Name -");
			getWeaponSkins(message,message.author.id,alternionHandlerEmbed);
			break;

		default:
			alternionHandlerEmbed.setDescription("You have entered an incorrect command, please try again.\nUse `;Blackwake Alternion Help` to get a list of supported commands!");
			sendAlternionEmbed(message,alternionHandlerEmbed,false);
			break;

	}

	return;
}

function assignItemSkin(message,args,alternionHandlerEmbed){
	let table1Name = "";
	let table2Name = "";
	let fieldName = "";
	let table2Field = "";
	switch (args[2].toLowerCase()){
		case "badge":
			table1Name = "Badge";
			table2Name = "LimitedBadges";
			fieldName = "Badge_ID";
			table2Field = "Allowed_Badge_ID";
			break;
		case "sail":
			table1Name = "NormalSail";
			table2Name = "LimitedSails";
			fieldName = "Sail_ID";
			table2Field = "Allowed_Sail_ID";
			break;
		case "mainsail":
			table1Name = "MainSail";
			table2Name = "LimitedMainSails";
			fieldName = "Main_sail_ID";
			table2Field = "Allowed_Main_Sail_ID";
			break;
		case "goldmask":
			table1Name = "GoldMask";
			table2Name = "LimitedGoldMask";
			fieldName = "Mask_ID";
			table2Field = "Allowed_Gold_Mask_ID";
			break;
		case "cannon":
			table1Name = "Cannon";
			table2Name = "LimitedCannons";
			fieldName = "Cannon_ID";
			table2Field = "Allowed_Cannon_ID";
			break;
		case "musket":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Musket_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "blunderbuss":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Blunderbuss_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "nockgun":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Nockgun_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "handmortar":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Handmortar_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "pistol":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Standard_Pistol_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "shortpistol":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Short_Pistol_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "duckfoot":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Duckfoot_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "matchlock":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Matchlock_Revolver_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "annely":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Annely_Revolver_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "axe":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Axe_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "rapier":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Rapier_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "dagger":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Dagger_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "bottle":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Bottle_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "cutlass":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Cutlass_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "pike":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Pike_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "tomohawk":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Tomohawk_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "spyglass":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Spyglass_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "grenade":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Grenade_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "healitem":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "HealItem_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "hammer":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "Hammer_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		case "atlas":
			table1Name = "WeaponSkin";
			table2Name = "LimitedWeaponSkins";
			fieldName = "atlas01_ID";
			table2Field = "Allowed_Weapon_Skin_ID";
			break;
		default:
			message.channel.send("That is not a valid item to assign!");
			table1Name = "NA";
			break;
	}

	if (table1Name != "NA"){
		alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Display_Name, ${table1Name}.ID FROM ${table2Name} INNER JOIN User ON User_ID = User.ID INNER JOIN ${table1Name} ON ${table2Field} = ${table1Name}.ID WHERE User.Discord_ID="${message.author.id}"`, (err, rows) => {
				alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Display_Name, ${table1Name}.ID FROM ${table1Name} WHERE Limited!=True`, (err, rows2) => {
					let found = false;
					let assignedBadge = "";
					if (rows){
						for (let i = 0; i < rows.length; i++){
							if (args[3] === rows[i].Name){
								alternionConnectionPool.query(`UPDATE User SET ${fieldName}=${rows[i].ID} WHERE Discord_ID="${message.author.id}"`);
								console.log(`Setting: -${message.author.id}- ==> -${rows[i].Name}-`);
								assignedBadge = rows[i].Display_Name;
								found = true;
								break;
							}
						}
					}

					if (rows2){
						for (let i = 0; i < rows2.length; i++){
							if (args[3] === rows2[i].Name){
								alternionConnectionPool.query(`UPDATE User SET ${fieldName}=${rows2[i].ID} WHERE Discord_ID="${message.author.id}"`);
								console.log(`Setting: -${message.author.id}- ==> -${rows2[i].Name}-`);
								assignedBadge = rows2[i].Display_Name;
								found = true;
								break;
							}
						}
					}

					if (!found){
						alternionHandlerEmbed.setDescription("You cannot assign that Item!");
					}else{
						alternionHandlerEmbed.setDescription(`Assigned badge: **${assignedBadge}**`);
					}

					sendAlternionEmbed(message,alternionHandlerEmbed,true);

				});
			});
	}
}

function getAlternionOverview(message,alternionHandlerEmbed){

	// Prepare for an SQL nightmare

	alternionConnectionPool.query(`SELECT Badge.Display_Name AS bad, GoldMask.Display_Name AS mas, NormalSail.Display_Name AS sai, MainSail.Display_Name AS msa, Cannon.Display_Name AS can, Musket.Display_Name AS mus, Blunderbuss.Display_Name AS blu, Nockgun.Display_Name AS noc, HM.Display_Name AS han, Pis.Display_Name AS pis, Spis.Display_Name AS spi, Duck.Display_Name AS duc, Mat.Display_Name AS mat, Ann.Display_Name AS ann, Axe.Display_Name AS axe, Rap.Display_Name AS rap, Dag.Display_Name AS dag, Bot.Display_Name AS bot, Cut.Display_Name AS cut, Pik.Display_Name AS pik, Tom.Display_Name AS tom, Spy.Display_Name AS spy, Gre.Display_Name AS gre, Hea.Display_Name AS hea, Ham.Display_Name AS ham, Atl.Display_Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length === 0){
			message.channel.send("You are currently not in the database, please contact Archie.");
			return;
		} else if (rows[1]){
			message.channel.send("You have multiple entries, please contact Archie.");
			return;
		}else{
			let finalMsg = `Badge       : **${rows[0].bad}**\n`
						+	`Gold Mask   : **${rows[0].mas}**\n`
						+	`Sail        : **${rows[0].sai}**\n`
						+	`Mail Sail   : **${rows[0].msa}**\n`
						+	`Cannon      : **${rows[0].can}**\n`
						+	`Musket      : **${rows[0].mus}**\n`
						+	`Blunderbuss : **${rows[0].blu}**\n`
						+	`Nockgun     : **${rows[0].noc}**\n`
						+	`HandMortar  : **${rows[0].han}**\n`
						+	`Pistol      : **${rows[0].pis}**\n`
						+	`Short pistol: **${rows[0].spi}**\n`
						+	`Duckfoot    : **${rows[0].duc}**\n`
						+	`Matchlock   : **${rows[0].mat}**\n`
						+	`Annely      : **${rows[0].ann}**\n`
						+	`Axe         : **${rows[0].axe}**\n`
						+	`Rapier      : **${rows[0].rap}**\n`
						+	`Dagger      : **${rows[0].dag}**\n`
						+	`Bottle      : **${rows[0].bot}**\n`
						+	`Cutlass     : **${rows[0].cut}**\n`
						+	`Pike        : **${rows[0].pik}**\n`
						+	`Tomohawk    : **${rows[0].tom}**\n`
						+	`Spyglass    : **${rows[0].spy}**\n`
						+	`Grenade     : **${rows[0].gre}**\n`
						+	`Healing     : **${rows[0].hea}**\n`
						+	`Hammer      : **${rows[0].ham}**\n`
						+	`Atlas01     : **${rows[0].atl}**`;
			alternionHandlerEmbed.setDescription(finalMsg);
			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		}
	});
}

function checkifInDatabase(message,args){
	alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length > 1){
			message.channel.send("You appear to have two accounts linked to this discord account, please contact Archie.");
			return;
		}else if (rows.length == 0){
			message.channel.send("Your discord account is not linked to your steamID, please contact Archie.");
			return;
		}else{
			alternionHandler(message,args);
		}
	});
}

function getWeaponSkins(message,ID,alternionHandlerEmbed){
	alternionConnectionPool.query(`SELECT WeaponSkin.Name, WeaponSkin.Display_Name FROM LimitedWeaponSkins INNER JOIN User ON User_ID = User.ID INNER JOIN WeaponSkin ON Allowed_Weapon_Skin_ID = WeaponSkin.ID WHERE User.Discord_ID="${ID}"`, (err,rows) => {
		if (rows.length < 1){
			alternionHandlerEmbed.setDescription("No Weapon Skins found.");
		}else{
			let returnString = "";
			for (let i = 0; i < rows.length; i++){
				returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
			}
			alternionHandlerEmbed.setDescription(returnString);
		}

		sendAlternionEmbed(message,alternionHandlerEmbed,false);
	});
}

function getCannons(message,ID,alternionHandlerEmbed){
	alternionConnectionPool.query(`SELECT Cannon.Name, Cannon.Display_Name FROM LimitedCannons INNER JOIN User ON User_ID = User.ID INNER JOIN Cannon ON Allowed_Cannon_ID = Cannon.ID WHERE User.Discord_ID="${ID}"`, (err,rows) => {
		if (rows.length < 1){
			alternionHandlerEmbed.setDescription("No Cannons found.");
		}else{
			let returnString = "";
			for (let i = 0; i < rows.length; i++){
				returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
			}
			alternionHandlerEmbed.setDescription(returnString);
		}

		sendAlternionEmbed(message,alternionHandlerEmbed,false);
	});
}

function getNormalSails(message,ID,alternionHandlerEmbed){
	alternionConnectionPool.query(`SELECT NormalSail.Name, NormalSail.Display_Name FROM LimitedSails INNER JOIN User ON User_ID = User.ID INNER JOIN NormalSail ON Allowed_Sail_ID = NormalSail.ID WHERE User.Discord_ID="${ID}"`, (err,rows) => {
		if (rows.length < 1){
			alternionHandlerEmbed.setDescription("No Sails found.");
		}else{
			let returnString = "";
			for (let i = 0; i < rows.length; i++){
				returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
			}
			alternionHandlerEmbed.setDescription(returnString);
		}

		sendAlternionEmbed(message,alternionHandlerEmbed,false);
	});
}

function getMainSails(message,ID,alternionHandlerEmbed){
	alternionConnectionPool.query(`SELECT MainSail.Name, MainSail.Display_Name FROM LimitedMainSails INNER JOIN User ON User_ID = User.ID INNER JOIN MainSail ON Allowed_Main_Sail_ID = MainSail.ID WHERE User.Discord_ID="${ID}"`, (err,rows) => {
		if (rows.length < 1){
			alternionHandlerEmbed.setDescription("No Sails found.");
		}else{
			let returnString = "";
			for (let i = 0; i < rows.length; i++){
				returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
			}
			alternionHandlerEmbed.setDescription(returnString);
		}

		sendAlternionEmbed(message,alternionHandlerEmbed,false);
	});
}

function getBadges(message,ID,alternionHandlerEmbed){
	alternionConnectionPool.query(`SELECT Badge.Name, Badge.Display_Name FROM LimitedBadges INNER JOIN User ON User_ID = User.ID INNER JOIN Badge ON Allowed_badge_ID = Badge.ID WHERE User.Discord_ID="${ID}"`, (err,rows) => {
		if (rows.length < 1){
			alternionHandlerEmbed.setDescription("No badges found.");
		}else{
			let returnString = "";
			for (let i = 0; i < rows.length; i++){
				returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
			}
			alternionHandlerEmbed.setDescription(returnString);
		}

		sendAlternionEmbed(message,alternionHandlerEmbed,false);
	});
}

function sendAlternionEmbed(message,embed,needsUpdate){
	message.channel.send(embed);
	if (needsUpdate){
		getLocalJson(message.author.id);
	}
	return;
}

var alternionJsonFile = null;

function getLocalJson(discord_id){
	let filepath = config.alternion.jsonFilePath;
	if (alternionJsonFile === null){
		fs.readFile(filepath, function (err,data) {
			json = '{ "users" : [' + data.toString().replace(/&/g, ",") + ']}';
			alternionJsonFile = JSON.parse(`${json}`);
			updateLocalCache(discord_id,filepath);
		});
	}else{
		updateLocalCache(discord_id,filepath);
	}
	return;
}

function updateLocalCache(discord_id,filepath){
	alternionConnectionPool.query(`SELECT User.Steam_ID AS steam_ID, Badge.Name AS bad, GoldMask.Name AS mas, NormalSail.Name AS sai, MainSail.Name AS msa, Cannon.Name AS can, Musket.Name AS mus, Blunderbuss.Name AS blu, Nockgun.Name AS noc, HM.Name AS han, Pis.Name AS pis, Spis.Name AS spi, Duck.Name AS duc, Mat.Name AS mat, Ann.Name AS ann, Axe.Name AS axe, Rap.Name AS rap, Dag.Name AS dag, Bot.Name AS bot, Cut.Name AS cut, Pik.Name AS pik, Tom.Name AS tom, Spy.Name AS spy, Gre.Name AS gre, Hea.Name AS hea, Ham.Name AS ham, Atl.Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID WHERE Discord_ID="${discord_id}"`, (err,rows) => {
		for (let i = 0; i < alternionJsonFile.users.length; i++){
			if (alternionJsonFile.users[i].steamID === rows[0].steam_ID){
				console.log(`Found User: -${alternionJsonFile.users[i].steamID}- => -${discord_id}-`);
				alternionJsonFile.users[i].badgeName = rows[0].bad;
				alternionJsonFile.users[i].maskSkinName = rows[0].mas;
				alternionJsonFile.users[i].sailSkinName = rows[0].sai;
				alternionJsonFile.users[i].mainSailName = rows[0].msa;
				alternionJsonFile.users[i].cannonSkinName = rows[0].can;
				alternionJsonFile.users[i].musketSkinName = rows[0].mus.split("_")[1];
				alternionJsonFile.users[i].blunderbussSkinName = rows[0].blu.split("_")[1];
				alternionJsonFile.users[i].nockgunSkinName = rows[0].noc.split("_")[1];
				alternionJsonFile.users[i].handMortarSkinName = rows[0].han.split("_")[1];
				alternionJsonFile.users[i].standardPistolSkinName = rows[0].pis.split("_")[1];
				alternionJsonFile.users[i].shortPistolSkinName = rows[0].spi.split("_")[1];
				alternionJsonFile.users[i].duckfootSkinName = rows[0].duc.split("_")[1];
				alternionJsonFile.users[i].matchlockRevolverSkinName = rows[0].mat.split("_")[1];
				alternionJsonFile.users[i].annelyRevolverSkinName = rows[0].ann.split("_")[1];
				alternionJsonFile.users[i].axeSkinName = rows[0].axe.split("_")[1];
				alternionJsonFile.users[i].rapierSkinName = rows[0].rap.split("_")[1];
				alternionJsonFile.users[i].daggerSkinName = rows[0].dag.split("_")[1];
				alternionJsonFile.users[i].bottleSkinName = rows[0].bot.split("_")[1];
				alternionJsonFile.users[i].cutlassSkinName = rows[0].cut.split("_")[1];
				alternionJsonFile.users[i].pikeSkinName = rows[0].pik.split("_")[1];
				alternionJsonFile.users[i].tomohawkSkinName = rows[0].tom.split("_")[1];
				alternionJsonFile.users[i].spyglassSkinName = rows[0].spy.split("_")[1];
				alternionJsonFile.users[i].grenadeSkinName = rows[0].gre.split("_")[1];
				alternionJsonFile.users[i].healItemSkinName = rows[0].hea.split("_")[1];
				alternionJsonFile.users[i].hammerSkinName = rows[0].ham.split("_")[1];
				alternionJsonFile.users[i].atlas01SkinName = rows[0].atl.split("_")[1];
				break;
			}
		}

		updateJsonFile(filepath);
	});
	return;
}

function updateJsonFile(filepath){
	let writeString = "";
	for (let i = 0; i < alternionJsonFile.users.length; i++){
		if (i < alternionJsonFile.users.length - 1){
			writeString += JSON.stringify(alternionJsonFile.users[i]).toString() + "&";
		}else{
			writeString += JSON.stringify(alternionJsonFile.users[i]).toString();
		}
	}
	fs.writeFile(filepath, writeString.toString(), function(err){});
}

allowChannels = ["512331083493277706","577180597521350656","440525025452490752","663524428092538920","563478316120539147"];

bot.on("ready", () => {
	console.log('Bot '+bot.user.username+' is ready!');

	setInterval(() =>{
		Status();
	}, 30000000);
	//setInterval(() =>{
	//	displayBotInfo();
	//}, 6000);
	//setInterval(() =>{
	//	update7DTDlistNew();
	//}, 25000);
	setInterval(() =>{
		getSteamGroupData();
	}, 15000000);
	setInterval(() =>{
		ISSLocation();
	}, 10000);
	
	displayRichestUsers();
	updateShopWindow();
	LoadDataFromDatabase();
	updateleaderboard();
	getSteamGroupData();


	//setInterval(() =>{
	//	BwServerStatus();
	//}, 3000);
	// setInterval(() =>{
	// 	GetAllGamesBeingPlayed(config.serverInfo.serverId);
	// }, 20000);
	//updateMClist();
	return;
});


bot.on("message", async message => {


	try{

	//dont respond to bots
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;
	if (allowChannels.indexOf(message.channel.id) === -1 && message.author.id != "337541914687569920")
	{
		return;
	}

	//this situation specific, if running your own just remove
	if (message.guild.id === "704649927975763969" && message.channel.id !== "705742490833256469") return;

	if (adjustableConfig.reactions.randomReactions){
		let num = getRandomInt(adjustableConfig.reactions.chanceofRandomReactions);
		if (num in [3,4,5,6]){
			randomresponse(message,message.content.toLowerCase(),message.channel.guild.id);
		}else
		if (num in [15]){
			randomgif(message,message.content.toLowerCase());
		}else
		if (num in [28]){
			randompirateshit(message,message.content.toLowerCase());
		}
	}


	if (message.channel.id === config.serverInfo.channels.staffChannels.moderator || message.channel.id === config.serverInfo.channels.staffChannels.serverAdministrator || message.channel.id === config.serverInfo.channels.staffChannels.discordAdministrator){
		if (getRandomInt(1000) === 6){
			message.channel.send("Hmmm, yes, much discussion <:thonkhonk:690138132343160854>");
		}
	}

	//If enabled creates support tickets
	if (message.channel.id === config.serverInfo.channels.supportTicketChannel && adjustableConfig.misc.SupportTickets === true){
		let content = message.content;
		let d = new Date();
		let date = d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear();
		message.guild.createChannel(`${message.author.username}-${date}`,{type: "text", permissionOverwrites: [
			{
				id : config.serverInfo.serverId,
				deny : ['VIEW_CHANNEL'],
			},
			{
				id : `${message.author.id}`,
				allow : ["VIEW_CHANNEL"],
			},
			{
				id : config.serverInfo.roles.serverAdministrator,
				allow : ["VIEW_CHANNEL"],
			},	
		], reason: 'New Support Ticket Created!'}).then(channel => {
			channel.send("Query is: "+content+" - please wait for an administrator to respond to your ticket.");
		});
		message.delete({timeout: 0, reason: "Support ticket creation."});
	}

	//N word filter
	if (message.content.toLowerCase().includes('nigger') || message.content.toLowerCase().includes(" "+"nigger"+" ")){
		if ( message.member.roles.cache.has(config.serverInfo.roles.serverModerator) || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){}
		else if (message.guild.id === config.serverInfo.serverId && adjustableConfig.misc.nWordFilter){
			message.delete();
			message.channel.send(message.author+" Please dont use that language!");
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("Message: "+message.content+" , has been deleted. Author: <@"+message.author,id+">");
		}
		updateNWordCounter(message);
		return;
	}

	//Prevents autoquote from taking from sensitive channels
	if (adjustableConfig.quotes.active && message.guild.id === config.serverInfo.serverId){
		if (autoQuoteNotAllowedCategories.indexOf(parseInt(message.channel.parentID)) === -1){
			if (message.channel.name.toLowerCase().includes("support")){
			}else
			if (getRandomInt(adjustableConfig.quotes.chanceOfBeingQuoted) === 1){
				saveQuoteAutomatic(message);
			}else{
			}
		}
	}

	//XP Gain
	if (message.guild.id === config.serverInfo.serverId){
		try{
			mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${message.author.id}'`, (err,rows) => {
				if(err) console.log(err);
				let sql;
				if(rows.length < 1){
					sql = `INSERT INTO xp (id,username,xp,level,canget,message_count) VALUES ('${message.author.id}','${btoa(message.author.username)}', ${genXp()}, 0, '"n"', '1')`;
					mainDatabaseConnectionPool.query(sql);
				} else {
					let eligible = rows[0].canget;
					if (eligible === '"y"'){
						let level = parseInt(rows[0].level);
						let newxp = parseInt(rows[0].xp) + genXp();
						let go = levelsystem(newxp,level);
						if (go) {
							level = level+1;
							newxp = 0;
						}
						sql = `UPDATE xp SET xp = ${newxp}, level = ${level}, canget = '"n"', message_count='${parseInt(rows[0].message_count) + 1}' WHERE id = '${message.author.id}'`;
						mainDatabaseConnectionPool.query(sql);
						giveUserMoney(0.2,message.author.id);
					}else{
						mainDatabaseConnectionPool.query(`UPDATE xp SET message_count='${parseInt(rows[0].message_count) + 1}' WHERE id='${message.author.id}'`);
					}
				}
			});

			mainDatabaseConnectionPool.query(`SELECT * FROM channel_messages WHERE channel_id = '${message.channel.id}'`, (err,rows) => {
				if (rows.length < 1){
					mainDatabaseConnectionPool.query(`INSERT INTO channel_messages (channel_id,message_count) VALUES ('${message.channel.id}', '1')`);
				}else{
					mainDatabaseConnectionPool.query(`UPDATE channel_messages SET message_count='${parseInt(rows[0].message_count) + 1}' WHERE channel_id='${message.channel.id}'`);
				}
			});

			setTimeout(function(){
				mainDatabaseConnectionPool.query(`UPDATE xp SET canget = '"y"' WHERE id = '${message.author.id}'`);
			}, 180000);
		}catch (e){
			console.log(e);
		}
	}

	//Old larry reference (RIP Larry)
	if (message.content.startsWith("...") && message.content.length === 3){
		message.react("452064991688916995");
	}

	//Pre declaration for usage in the switch case below
	let TrackingCommand = false;
	let member;
	let awnser;

	//Ping Oliverbot
	if (message.content.startsWith("<@!556545106468012052>")){
		TrackingCommand = true;
		message.react("🤔");

		let voiceChannel = message.member.voice.channel;
		if (!voiceChannel){ return; }
		else if (isPlaying){ return message.reply("I am currently busy, please wait :)"); }
		else if (!adjustableConfig.music.pingCommand){
			message.reply("That command is currently disabled, please ask an admin to re-enable it!");
		}else{
			let file = fs.readFileSync("./datafile.json").toString();
			file = JSON.parse(file);
			isPlaying = true;
			let a = getRandomInt(file.pingedSounds.length);
			let randomsong = file.pingedSounds[a].toString();
			voiceChannel.join().then(connection => {
			currentDispatcher = connection
				.play(
           	 		ytdl(randomsong)
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
	}

	//check content of any pictures sent for nudity
	message.attachments.forEach(attachment => {
    	if (message.attachments.size > 0) {
      		if (attachment.url){
        		if (attachment.url.includes(".png") || attachment.url.includes(".jpg") || attachment.url.includes(".jpeg")){
          			let sightengine = require('sightengine')('1166252206', 'aSwRzSN88ndBsSHyrUWJ');
          			sightengine.check(['nudity']).set_url(`${attachment.url}`).then(function(result) {
            			if (result.nudity.raw > 0.65){
              				let nudityEmbed = new Discord.MessageEmbed()
                			  .addField("image posted containing possible nudity",`Nudity rating of ${result.nudity.raw * 100}%\nAuthor: ${message.author}     Channel: ${message.channel}\nImage Link: [link](${attachment.url})`);
             				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(nudityEmbed);
            			}
          			}).catch(function(err){
            			console.log(err);
          			});
        		}
      		}
    	}
  	});

	if (!message.content.startsWith(config.prefix)) return;

	//Split messages into the command and arguments
	let messagearray = message.content.split(" ");
	let command = messagearray[0].substring(1);
	command = command.toLowerCase();
	let args = messagearray.slice(1);
	let serverid = message.channel.guild.id;

	//main command block
	switch (command){
		case "delete-administrators":
			TrackingCommand = true;
			message.channel.send("Deleting the administrators.").then(msg => {
				setTimeout(function(){
					msg.edit("Deleting the administrators..");
					setTimeout(function(){
						msg.edit("Deleting the administrators...");
						setTimeout(function(){
							msg.edit("Administrators deleted.");
						},3000);
					},3000);
				},3000);
			});
			break;
		case "dox":
			TrackingCommand = true;
			message.channel.send(`Doxing ${args.join(" ")}...`);
			break;
		case "magic":
			TrackingCommand = true;
			message.channel.send("https://giphy.com/gifs/magical-KFNQuuT1qx7I4");
			break;
		case "pong":
			TrackingCommand = true;
			message.react("🏓");
			break;
		case "execute":
			TrackingCommand = true;
			if (typeof args[0] === undefined){
				message.channel.send("You need to say who to execute! 🤦");
			}else{
				message.channel.send(`Executing ${args[0]}\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`);
				TrackingCommand = true;
			}
			break;
		case "rankcard":
			TrackingCommand = true;
			rankcardCreation(message);
			break;
		case "listcommands":
			TrackingCommand = true;
			listTheCommands(message);
			break;
		case "apod":
			TrackingCommand = true;
			if (adjustableConfig.apis.apod){
				AstronomyPictureoftheDay(message);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "quote":
			TrackingCommand = true;
			loadFromDatafile(command,"",message);
			break;
		case "8ball":
			TrackingCommand = true;
			let option = getRandomInt(0,3);
			switch (option){
				case 0:
					message.channel.send("Yes");
					break;
				case 1:
					message.channel.send("No");
					break;
				case 2:
					message.channel.send("Im not sure 🤔");
					break;
			}
			break;
		case "nootnoot":
			TrackingCommand = true;
			loadFromDatafile(command,"",message);
			break;
		case "dad":
			TrackingCommand = true;
			loadFromDatafile(command,"",message);
			break;
		case "yodish":
			TrackingCommand = true;
			if (adjustableConfig.apis.yodish){
				yodish(message,args);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "nerds":
			if (message.member.roles.cache.has("639142448345513984")){
				TrackingCommand = true;
				message.channel.send("<@&639142448345513984> Assemble!");
			}
			break;
		case "cat":
			TrackingCommand = true;
			Cat(message);
			break;
		case "trump":
			fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
				message.channel.send(`${args.join(" ")} ${response.messages.personalized[getRandomInt(response.messages.personalized.length)]}`);
			});
			break;
		case "rolldie":
			TrackingCommand = true;
			message.channel.send(getRandomInt(7));
			break;
		case "marsweather":
			//GetMarsWeatherData(message);
			message.channel.send("This command is currently not working :(");
			break;
		case "numtrivia":
			TrackingCommand = true;
			if (adjustableConfig.apis.numTrivia){
				NumbersTrivia(message);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "advice":
			TrackingCommand = true;
			if (adjustableConfig.apis.advice){
				Advice(message);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "bacon":
			TrackingCommand = true;
			if (adjustableConfig.apis.bacon){
				BaconIpsum(message);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "chuck":
			TrackingCommand = true;
			if (adjustableConfig.apis.chuck){
				chuckNorrisAPI(message);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "dictionary":
			TrackingCommand = true;
			if (adjustableConfig.apis.dictionary){
				wordsAPI(message,args);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "restart":
			if (message.author.id === config.ownerId){
				await message.channel.send("Restarting....");
				mainDatabaseConnectionPool.end(function (err){
					if (err) console.log(err);
				});
				configurationDatabaseConnectionPool.end(function (err){
					if (err) console.log(err);
				})
				process.exit();
			}
			break;
		case "underground":
			if (message.guild.id === "341261290607607818"){
				underground(message);
			}
			else{
				message.reply("Im sorry, your too much of a normie to use this command.");
			}
			break;
		case "createcommand":
			if (message.member.roles.cache.has("615214073843548163")){
				createCustomCommands(message,args);
				message.reply("Your command is ready to go!");
			}else{
				message.reply("You do not have permission to use this!");
			}
			break;
		case "deletecommand":
			if (message.member.roles.cache.has("615214073843548163")){
				deleteCustomCommands(message,args[0]);
				message.reply("Command deleted!");
			}else{
				message.reply("You do not have permission to use this!");
			}
			break;
		case "createrole":
			if (args.length > 2){
				message.channel.send("Please use the following format:\n `;createrole <emoji> <role ping>`");
			}else{
				if (message.member.roles.cache.has("665939545371574283")){
					if (args[0].indexOf(":") !== -1){
						let emojiID = args[0].split(":")[2].toString();
						emojiID = emojiID.slice(0, emojiID.length - 1);
						createReactionRole(message,args[0].split(":")[1], emojiID ,"NA",args[1].slice(3,args[1].length - 1));
					}else{
						createReactionRole(message,args[0],"NA","unicode",args[1].slice(3,args[1].length - 1));
					}
				}else{
					message.reply("You don't have permission to use this command!");
				}
			}
			break;
		case "deleterole":
			if (args.length > 1){
				message.channel.send("Please use the following format:\n `;deleterole <emoji>`");
			}else{
				if (message.member.roles.cache.has("665939545371574283")){
					if (args[0].indexOf(":") !== -1){
						deleteReactionRole(message,args[0].split(":")[1]);
					}else{
						deleteReactionRole(message,args[0]);
					}
				}else{
					message.reply("You don't have permission to use this command!");
				}
			}
			break;
		case "refreshroles":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				displayReactionRoles();
			}else{
				message.reply("You don't have permission to use this command!");
			}
			break;
		case "purchase":
			if (args[0] && args.length < 2){
				purchaseItem(message.author.id,args[0],message,args);
			}else{
				message.channel.send("Please enter the correct format:\n`;purchase` `Item To Purchase`\nTo search for an item to get the purchasing info use the `;search` command!");
			}
			break;
		case "search":
			if (args){
				searchForItem(args,message);
			}else{
				message.channel.send("Please enter the correct format:\n`;search` `Item Name`");
			}
			break;
		case "sell":
			if (args[0] && args.length < 2){
				sellItem(message.author.id,args[0],message);
			}else{
				message.channel.send("Please enter the correct format:\n`;sell` `Item Name`");
			}
			break;
		case "inventory":
			if (args.length < 1){
				listInventory(message.author.id,message);
			}else{
				message.channel.send("Please enter the correct format:\n`;inventory`");
			}
			break;
		case "giftcoins":
			if (args.length < 3){
				let user = getUserFromMention(args[0]);
				giftUserCoins(message.author.id,user.id,args[1],message);
				user = null;
			}else{
				message.channel.send("Please enter the correct format:\n`;giftCoins` `@userToGiftTo` `amount`");
			}
			break;
		case "gamble":
			if (args[0] && (args.length === 1)){
				gambleMoney(args[0],message);
			}else{
				message.channel.send("Please use the correct format! `;gamble` `amount`");
			}
			break;
		case "quiz":
			checkQuizAllowances(message,args);
			break;
		case "beg":
			let num = getRandomInt(300);
			if (num == 243){
				let amount = getRandomInt(20);
				giveUserMoney(parseFloat(amount).toFixed(2) * 1);
				message.channel.send(`Considering how desperate you are, I think I can spare you ${amount}GC, consider yourself lucky.`);
			}else{
				loadFromDatafile(command,"",message);
			}
			break;
		case "work":
			economyWork(message);
			break;
		case "config":
			if (message.member.roles.cache.has("665939545371574283")){
				if (args.length > 2){
					message.reply("Please ensure you enter the correct number of arguments!");
				}else{
					updateDBConfig(message,args);
				}
			}else{
				lackingPermissions(message);
				message.react("690144528312696969");
			}
			break;
		case "do":
			if (message.author.id === config.ownerId){
				try{
					let code = args.join(" ");
					let evaled = eval(code);
					if (typeof evaled !== "string"){
       					evaled = require("util").inspect(evaled);
					}
					message.channel.send(clean(evaled), {code:"xl"});
    			} catch (err) {
      				message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    			}
			}else{
				lackingPermissions(message);
			}
			break;
		case "database":
			if (message.author.id === config.ownerId){
				try{
					if (args[0].startsWith("$"))
					{
						let databaseName = args[0].split(1, args[0].length);
						args = args.shift();
						runDatabaseCommand(message, databaseName, args.join(" "));
					}else if (args[0] === "help")
					{
						message.channel.send("Current flags:\n `$`database");
					}else
					{
						runDatabaseCommand(message, mysqlLoginData.database, args.join(" "));
					}
				}catch (err) {
					message.channel.send(err);
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "coinflip":
			TrackingCommand = true;
			let coin = getRandomInt(2);
			message.channel.send("💰").then((msg)=>{
				msg.edit("💰🤔").then((msg)=>{
					msg.edit("💰").then((msg)=>{
						msg.edit("😯");	
					});
				});
			});
			if (coin === 0){
				message.channel.send("Tails!");
			}else{
				message.channel.send("Heads!");
			}
			break;
		case "today":
			TrackingCommand = true;
			if (adjustableConfig.apis.today){
				if (args[0]){
					let allowedInputs = ["events","births","deaths"];
					if (allowedInputs.indexOf(args[0]) >= 0){
						TodayInHistory(message,args[0]);
					}else{
						message.channel.send("That type doesnt exist!");
					}
				}else{
					message.channel.send("You need to give the type!");
				}
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "exchangerates":
			TrackingCommand = true;
			if (adjustableConfig.apis.exchangeRates){
				let rate = "";
				if (args[0]){
					rate = args[0].toUpperCase();
				}else{
					rate = "GBP";
				}
				ExchangeRates(message,rate);
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "playdie":
			TrackingCommand = true;
			let user = getRandomInt(7);
			let botroll = getRandomInt(7);
			message.channel.send("🎲").then((msg)=>{
				msg.edit("..🎲").then((msg)=>{
					msg.edit("You: "+user+", Bot: "+botroll+" ....🎲");
					if (user>botroll){
						message.channel.send("You Win!");
					}else
					if (user<botroll){
						message.channel.send("You Lose!");
					}else{
						message.channel.send("Draw!");
					}
				});
			});
			break;
		case "rollcustom":
			TrackingCommand = true;
			let min = parseInt(args[0]);
			let max = parseInt(args[1]);
			if (parseInt(args[0]) < 1){
				message.channel.send("Please use a starting number greater than 0.");
			}else
			if (min >= max){
				message.channel.send("Please use a maximum value greater than the minimum.");
			}else
			if (isNaN(min)){
				message.channel.send("Please enter a number.");
			}else
			if (parseInt(args[1]) > 1){
				message.channel.send(getRandomBetweenInt(min,max));
			}else{
				message.channel.send(getRandomInt(parseInt(args[0])+1));
			}
			break;
		case "translate":
			TrackingCommand = true;
			if (adjustableConfig.apis.translate){
				let translate=" ";
				if (args[0] === "ru"){
					args = args.slice(1);
					translating(message,args,"en","ru");
				}else
				if (args[0] === "en"){
					args = args.slice(1);
					translating(message,args,"ru","en");
				}else{
					message.reply("The only supported languages are ru and en.");
				}
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "inspire":
			TrackingCommand = true;
			if(adjustableConfig.apis.inspire){
				fetch("http://inspirobot.me/api?generate=true").then(resp => resp.text()).then(picture => {
					let InspireImage = new Discord.MessageEmbed()
						.setImage(`${picture}`)
						.setTimestamp();
					message.channel.send(InspireImage);
				});
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "checknudity":
			TrackingCommand = true;
			if (adjustableConfig.apis.checkNudity){
				message.attachments.forEach(attachment => {
					if (message.attachments.size > 0) {
      					if (attachment.url){
        					if (attachment.url.includes(".png") || attachment.url.includes(".jpg") || attachment.url.includes(".jpeg")){
        		  				let sightengine = require('sightengine')('1166252206', 'aSwRzSN88ndBsSHyrUWJ');
        	  					sightengine.check(['nudity']).set_url(`${attachment.url}`).then(function(result) {
        	   	 	  			let nudityEmbed = new Discord.MessageEmbed()
        	   	 	    		  .addField("Rating",`Nudity rating of ${result.nudity.raw * 100}%\nAuthor: ${message.author}\nImage Link: [link](${attachment.url})`);
        	   	 	 				message.channel.send(nudityEmbed);
        	  					}).catch(function(err){
        	   	 					console.log(err);
        	  					});
       		 				}else{
        						message.channel.send("I can only use png, jpg or jpeg.");
        					}
      					}
    				}else{
    					message.channel.send("Must be an attachment!");
    				}
    			});
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "dance":
			if (levelchecker(message,3)){
				TrackingCommand = true;
				loadFromDatafile(command,"",message);
			}else{
    			message.reply("You are not a high enough level yet to use this command, you must be level 3, use ;rankcard to see your current level");
    		}
    		break;
    	case "playaudio":
    		TrackingCommand = true;
			let voiceChannel = message.member.voice.channel;
			if (!voiceChannel){
				message.reply("You must be in a voice channel!");
			}else if (!adjustableConfig.music.generalAudio){
				message.reply("That command is currently disabled, please ask an admin to re-enable it!");
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
						},songInfo.length_seconds*1000);
					});
				}else{
					message.reply("Please enter a valid youtube link!");
				}
			}
    		break;
    	case "stopaudio":
    		TrackingCommand = true;
			if (!adjustableConfig.music.generalAudio){
				message.reply("That command is currently disabled, please ask an admin to re-enable it!");
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
				isPlaying=false;
				message.react("🛑");
				message.channel.send("I have stopped");
			}
			break;
		case "randomsong":
			TrackingCommand = true;
			loadFromDatafile(command,"",message);
			break;
		case "urban":
			TrackingCommand = true;
			if (adjustableConfig.apis.urban){
    			let api = `http://api.urbandictionary.com/v0/define?term=${args[0]}`;
    			fetch(api).then(response => response.json()).then(resp => {
    				let option = resp.list[getRandomInt(resp.list.length)];
    				let embed = new Discord.MessageEmbed()
        			.setTitle("Urban Response")
        			.setColor(0x008000)
        			.addField(`Author:`,`${option.author}`)
        			.addField(`Permalink:`,`${option.permalink}`,true)
        			.addField(`Vote Ratio:`,`${option.thumbs_up} 👍\n${option.thumbs_down} 👎`,true)
        			.addField(`Word:`,`${option.word}`,true)
        			.addField(`Definition:`,`${option.definition}`)
        			.addField(`Example:`,`${option.example}`)
        			.setFooter(`Written: ${option.written_on}, Def_ID: ${option.defid}`)
        			.setTimestamp();
    				message.channel.send(embed);
    			});
    		}else{
    			message.reply("That command is currently disabled!");
    		}
    		break;
    	case "memegen":
    		if (levelchecker(message,4)){
				TrackingCommand = true;
				if (adjustableConfig.apis.memegen){
					let contents = message.content.split(",");
    		    	for (i=0;i<contents.length;){
    		        	let word = contents[i];
    		        	if (i === 0){
    		        	    word = word.slice(command.length+2);
    		        	}
    		        	word = word.replace(/_/g, "__");
    		        	word = word.replace(/-/g, "--");
    		   	    	word = word.replace(/ /g, "-");
    		   	    	word = word.replace(/\?/g, "~q");
    		   	     	word = word.replace(/%/g, "~p");
    		   	     	word = word.replace(/#/g, "~h");
    		   	     	word = word.replace(/''/g, `"`);
    		    	    word = word.replace(/\//g, "~s");
    		    	    contents[i] = word;
    		    	    i++;
    		    	}
        			let URL = `https://memegen.link/${contents[0]}/${contents[1]}/${contents[2]}.jpg`;
        			fetch(URL).then(response =>{
        			    message.channel.send(response.url);
        			});
        		}
        	}else{
        		message.channel.send("You are not a high enough level yet to use this command, you must be level 4, use ;rankcard to see your current level");
        	}
        	break;
        case "random":
        	if (levelchecker(message,4)){
				TrackingCommand = true;
				loadFromDatafile(command,"",message);
			}else{
    			message.reply("You are not a high enough level yet to use this command, you must be level 4, use ;rankcard to see your current level");
    		}
        	break;
        case "insult":
        	if (levelchecker(message,7)){
				TrackingCommand = true;
				let fine = true;
				for (i=0; i<args.length;){
					let mentionrole = message.guild.roles.cache.get(args[i]);
					if (!(typeof mentionrole === "undefined")){
						fine = false;
					}
					i++;
				}
				if (message.content.includes("@everyone")){
					message.channel.send("No.");
					fine = false;
				}
				if (message.content.includes("@here")){
					message.channel.send("No.");
					fine = false;
				}
				if (fine){
					loadFromDatafile(command,args.join(" "),message);
				}else{
					message.reply("Please enter a correct target. Please also refrain from insulting and pinging roles.");
				}
			}else{
				message.channel.send("You are not a high enough level yet to use this command, you must be level 7, use ;rankcard to see your current level");
			}
        	break;
        case "help":
        	TrackingCommand = true;
			let supportedQueries = ["listcommands","list","memegen","random","apod","marsweather","rankcard","translate","exchangerates","today","urban","quote","yodish","dad","8ball","blackwake","payday2","trump"];
			if (args[0]){
				let term = args[0].toLowerCase();
			switch (term){
				case "listcommands":
					message.channel.send("Sends you a list of all my commands that you can use :)");
					break;			
				case "list":
					message.author.send(`Commands I can help with:\n ${supportedQueries.join("\n - ")}`);
					message.channel.send("Check your DM's ;)");
					break;
				case "memegen":
					message.channel.send("Currently available formats and the website version can be found at https://memegen.link/");
					break;
				case "random":
					message.channel.send("Why not try and find out?");
					break;
				case "apod":
					message.channel.send("Nasa's Astronomy Picture of the Day.");
					break;
				case "marsweather":
					message.channel.send("Get the weather data of several points on mars.\n"
						+" - av: Average of samples over the Sol (°F for AT; m/s for HWS; Pa for PRE)\n"
						+" - ct: Total number of recorded samples over the Sol\n"
						+" - mn: Minimum data sample over the sol (same units as av)\n"
						+" - mx: Maximum data sample over the sol (same units as av)\n");
					break;
				case "rankcard":
					message.channel.send("Display your rankcard");
					break;
				case "translate":
					message.channel.send("Use: `translate ru *words to translate*` to translate to russian.\nUse: `translate eu *words to translate*` to translate the words to english.");
					break;
				case "exchangerates":
					message.channel.send("Convert the currency you wish to another currency, a full list of supported currencies is at: https://www.exchangerate-api.com/docs/supported-currencies");
					break;
				case "today":
					message.channel.send("Usage of the command is as followed: `;today *term*`\nTerms Allowed are:\n - Events\n - Births\n - Deaths");
					break;
				case "urban":
					message.channel.send("Usage of the command is as followed: `;urban *word to search*`");
					break;
				case "quote":
					message.channel.send("Sends a random quote!");
					break;
				case "yodish":
					message.channel.send("Returns your words in yosidh format.");
					break;
				case "dad":
					message.channel.send("Get a dad quote!");
					break;
				case "8ball":
					message.channel.send("Get a yes/no awnser to your question!");
					break;
				case "insult":
					message.channel.send("insult whoever you wish!");
					message.react("🙊");
					break;
				case "me":
					message.channel.send("What can i help you with?");
					message.react("🤔");
					break;
				case "blackwake":
					message.channel.send("There are several actions for the blackwake command, currently the supported options are: `overview` `weaponstats` `shipstats` `maintenance` `shipweaponry` `monthly` `elo`\nNotes:\n- Requires your profile to be set to public.\n- `Monthly` and `elo` may take a while to load.");
					break;
				case "payday2":
					message.channel.send("There are several actions for the payday2 command, currently the supported options are: `overview`\nNote: requires your profile to be set to public!");
					break;
				case "trump":
					message.channel.send("Find out trumps opinion of the individual/group/company your specify!");
					break;
				//Non Public Commands
				case "userinfo":
					if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
						message.channel.send("Displays information about a user.");
					}
					break;
				case "channelinfo":
					if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
						message.channel.send("Displays information about the currently viewed channel.");
					}
					break;
				default:
					message.reply("That command currently either has no help section or is detailed in the commands list.");
					message.react("448435180286509066");
					break;
				}
			}else{
				message.channel.send("I currently have help for:\n`"
					+`${supportedQueries.join("` `")}`+"`");
			}
			break;
		case "blackwake":
			TrackingCommand = true;
			if (adjustableConfig.apis.blackwake){
				if (!args){
					message.reply("Please enter the valid terms!");
				}else
				if (args.length < 2){
					message.reply("Please enter the valid terms!");
					}else{
				blackwakeCommandHandler(message,args);
				}
			}else{
				message.reply("That command is currently disabled!");
			}
			break;
		case "mute":
			if (serverid === config.serverInfo.roles.serverModerator && adjustableConfig.misc.moderatorCommands){
				let muteMember = message.guild.members.find('id',message.mentions.users.first().id);
				try{
					let muteAwnser = rolecheckformutes(muteMember, message);
					if (muteAwnser){
						message.channel.send("You can't use this command.");
					}else{
						mute(muteMember,message);
						bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+muteMember+" has been muted by "+message.member.user.username+".");
					}
				}catch(e){
					console.log(e);
					message.channel.send("error, please check you pinged an individual");
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "unmute":
			if (serverid === config.serverInfo.roles.serverModerator && adjustableConfig.misc.moderatorCommands){
				let unmuteMember = message.guild.members.find('id',message.mentions.users.first().id);
				try{
					let unmuteAwnser = rolecheckformutes(unmuteMember, message);
					if (awnser){
						message.channel.send("You can't use this command.");
					}else{
						unmute(unmuteMember,message);
						bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+unmuteMember+" has been unmuted by "+message.member.user.username+".");
					}
				}catch(e){
					console.log(e);
					message.channel.send("Error, please check you pinged an individual.");
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "tempmute":
			if (serverid === config.serverInfo.serverId && adjustableConfig.misc.moderatorCommands){
				let tempmuteMember = message.guild.members.find('id',message.mentions.users.first().id);
				if (tempmuteMember.roles.has(config.serverInfo.roles.serverModerator)){
					try{
						let tempmuteAwnser = rolecheckformutes(tempmuteMember, message);
						if (tempmuteAwnser){
							message.channel.send("You can't mute someone higher than, or at your current role.");
						}else{
							let tempmuteGo = false;
							if (typeof args[1] === "undefined"){
								time = 86400000;
								tempmuteGo = true;
							}else{
								try{
									time = parseInt(args[1]);
									tempmuteGo = true;
								}catch(e){
									message.channel.send("Please enter a correct number of hours.");
								}
							}
							if (tempmuteGo){
								let delayTemp = (parseInt(args[1])*1000*60*60);
								mute(tempmuteMember,message);
								bot.channels.cache.get("512331083493277706").send("User: "+tempmuteMember+" has been temporarily muted for "+time+" hour(s) by "+message.member.user.username+".\n"
																	+"Reason: "+(args.slice(2)).join(" "));
								setTimeout(() => {
									unmute(tempmuteMember,message)
								}, delay);
							}
						}
					}catch(e){
						message.channel.send("Error, please check you pinged an individual/ used the command correctly.");
					}
				}else{
					message.channel.send("You cannot use this command");
				}	
			}else{
				lackingPermissions(message);
			}
			break;
		case "botinfo":
			// If owner or admin
			if (message.author.id === config.ownerId || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				let totalSeconds = (bot.uptime / 1000);
				let days = Math.floor(totalSeconds / 86400);
				let hours = Math.floor(totalSeconds / 3600);
				totalSeconds %= 3600;
				let minutes = Math.floor(totalSeconds / 60);
				let seconds = (totalSeconds % 60).toString();
				seconds = seconds.slice(0,seconds.indexOf(".") + 3);

				hours -= days * 24;
				let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

				let used = process.memoryUsage();
				let ramusage = (parseInt(used.rss) * (10**-6) ).toString();
				ramusage = ramusage.slice(0,ramusage.indexOf(".") + 3);

				let memoryInformation = "";
				for (let key in used) {
				  memoryInformation = memoryInformation + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\n`;
				}
				if (memoryInformation.length < 1)
				{
					memoryInformation = "N/A";
				}

				let botInfo = new Discord.MessageEmbed()
					.addField(`Overview`,`Uptime: ${uptime}\nRam: ${ramusage}MB\nPlaying Audio: ${isPlaying}`)
					.setTimestamp();

				if (args[0] === "adv"){
					botInfo.addField("Memory Information", `${memoryInformation}`);
				}

				message.channel.send(botInfo);
			}else{
				lackingPermissions(message);
			}

			break;
		case "createwebhook":
			// If owner or admin
			if (message.author.id === config.ownerId || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				let name = args[0];
				let imgURL = args[1];
				message.channel.createWebhook(name,{
					avatar : imgURL,
				}).then(webhook => console.log(`Created webhook ${webhook}`)).catch(console.error);
			}else{
				lackingPermissions(message);
			}

			break;
		case "ban":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				if (typeof args[0] === "string"){
					try{
						let member = message.guild.members.find('id',message.mentions.users.first().id);
						if (member.roles.has(config.serverInfo.roles.serverAdministrator)){
							message.channel.send("You can't ban an admin!");
						}else{
							message.guild.members.ban(member);
							bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+member+", has been banned. Reason: "+(args.slice(2)).join(" ")+"\n"
																		+"Banned by: "+message.member.user.username+".");
						}
					}catch(e){
						message.channel.send("Please enter a correct member.");
					}
				}else{
					message.channel.send("Please enter a User.");
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "serverinfo":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				let features = "";
				if (!(message.guild.features.length > 0)){
					features = "-";
				}else{
					features = message.guild.features.join(", ");
				}
				let booster_role = message.guild.members.cache.filter(m => m.roles.cache.has(config.serverInfo.roles.serverbooster));
				let serverinfo = new Discord.MessageEmbed()
									.setColor('#00008b')
									.setTitle(`${message.guild.name}`)
									.setDescription(`Server Information`)	
									.addField('Basic', `Owner: ${message.guild.owner}\nDescription: ${message.guild.description}\nCreated on: ${message.guild.createdAt}\nAcronym: ${message.guild.nameAcronym}\nRegion: ${message.guild.region}\nID: ${message.guild.id}`)
									.addField('Total Members', `Real People: ${message.guild.members.cache.filter(member => !member.user.bot).size}\nBots: ${message.guild.members.cache.filter(member => member.user.bot).size}`)
									.addField('Additional Info', `Number of Roles:\nNumber of Bans:\nMFA Level Required:\nNumber of Webhooks:\nDefault Message Notifications:`,true)
									.addField('-----', `${message.guild.roles.size}\n${await message.guild.fetchBans().then(result => {return result.size})}\n${message.guild.mfaLevel}\n${await message.guild.fetchWebhooks().then(result => {return result.size})}\n${message.guild.defaultMessageNotifications}`,true)
									.addField('Nitro', `Boosters: ${booster_role.size}\nLevel: ${message.guild.premiumTier}\nVanity URL: ${message.guild.vanityURLCode}`,)
									.addField('Number of Channels', `Categories: ${message.guild.channels.cache.filter(channel => channel.type === "category").size}\nText: ${message.guild.channels.cache.filter(channel => channel.type === "text").size}\nVoice: ${message.guild.channels.cache.filter(channel => channel.type === "voice").size}`,true)
									.addField('Verification', `Level: ${message.guild.verificationLevel}\nStatus: ${message.guild.verified}`,true)
									.addField('Emoji Count', `${message.guild.emojis.size}`,true)
									.addField('Explicit content filter level', `${message.guild.explicitContentFilter}`,true)
									.addField('Features', `${features}`)
									.addField('AFK', `Channel: ${message.guild.afkChannel}\nTimeout: ${message.guild.afkTimeout}sec`,true)
									.setImage(`${message.guild.iconURL()}`)
									.setTimestamp();
				message.channel.send(serverinfo);
			}else{
				lackingPermissions(message);
			}
			break;
		case "channelinfo":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				getChannelInformation(message);
			}else{
				lackingPermissions(message);
			}
			break;
		case "warn":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				let member = getUserFromMention(args[0]);
				try{
					member.send(`Warning from ${message.guild.name}:\n${(args.slice(1)).join(" ")}.\nYou have been warned.`).catch(() => message.channel.send("This user does not have open DMs."));
					bot.channels.cache.get(config.channels.loggingChannel).send(`User <@${member.id}> has been warned for:\n${args.slice(1).join(" ")}`);
				}catch(e){
					message.reply("This isnt working currently. Tell archie to go look at the logs.");
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "totalusers":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				message.channel.send(message.guild.members.cache.filter(member => !member.user.bot).size);
			}else{
				lackingPermissions(message);
			}
			break;
		case "savequote":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				if (typeof args[0] !== null && Number.isInteger(parseInt(args[0]))){
					saveQuote(message.channel,args[0]);
					message.reply("Done!");
				}else{
					message.reply("Please make sure you have entered the correct message ID :)");
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "userinfo":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				getUserInformation(message,args);
			}else{
				lackingPermissions(message);
			}
			break;
		case "payday2":
			TrackingCommand = true;
			getPayday2Information(message,args);
			break;


		// Alternion
		case "registeruser":
			if (message.author.id === config.ownerId){
				if (args.length > 3 || args.length < 3){
					message.channel.send("Please check your input:\n`;Register` `Feature` `steamID/discordID` `discordID/steamID`");
				}else{
					handleAlternionRegistration(message,args[0],args[1],args[2]);
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "finduser":
			if (message.author.id === config.ownerId){
				if (args[0].toLowerCase() === "steam"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE Steam_ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}else if (args[0].toLowerCase() === "discord"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}else if (args[0].toLowerCase() === "id"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "assignuser":
			if (message.author.id === config.ownerId){
				// args[0] = type, args[1] = Alternion ID, args[2] ID to assign
				switch (args[0].toLowerCase()){

					case "steamid":
						alternionConnectionPool.query(`UPDATE User SET Steam_ID=${args[2]} WHERE ID=${parseInt(args[1])}`);
						message.channel.send("Complete.");
						break;

					case "discordid":
						alternionConnectionPool.query(`UPDATE User SET Discord_ID=${args[2]} WHERE ID=${parseInt(args[1])}`);
						message.channel.send("Complete.");
						break;

					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 1){
								alternionConnectionPool.query(`UPDATE User SET Badge_ID=${parseInt(args[2])} WHERE ID=${parseInt(args[1])}`);
								message.channel.send("Complete.");
							}else if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (rows.length > 1){
								message.channel.send("There appears to be more than one item with that ID!");
							}
						});
						break;

					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 1){
								alternionConnectionPool.query(`UPDATE User SET Main_Sail_ID=${parseInt(args[2])} WHERE ID=${parseInt(args[1])}`);
								message.channel.send("Complete.");
							}else if (rows.length === 0){
								message.channel.send("That MainSail does not exist!");
							}else if (rows.length > 1){
								message.channel.send("There appears to be more than one item with that ID!");
							}
						});
						break;

					default:
						message.channel.send("That is not a valid item to assign to!");
				}

			}else{
				lackingPermissions(message);
			}
			break;
		case "grantuser":
			if (message.author.id === config.ownerId){
				// args[0] = type, args[1] = Alternion User ID, args[2] Item ID
				let notFound = true;
				switch (args[0].toLowerCase()){

					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That badge is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple badges with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedBadges WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedBadges VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that badge!");
									}
								});
							}
						});
						break;
					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That MainSail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That MainSail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple MainSails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Main_Sail_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedMainSails VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that MainSail!");
									}
								});
							}
						});
						break;
					case "sail":
						alternionConnectionPool.query(`SELECT * FROM NormalSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("Those Sails do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("Those Sails are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Sails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Sail_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedSails VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that Sail!");
									}
								});
							}
						});
						break;
					case "weapon":
						alternionConnectionPool.query(`SELECT * FROM WeaponSkin WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That WeaponSkin do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That WeaponSkin are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple weapon skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Weapon_Skin_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedWeaponSkins VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that weapon skin!");
									}
								});
							}
						});
						break;
					case "cannon":
						alternionConnectionPool.query(`SELECT * FROM Cannon WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That Cannon do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That Cannon are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Cannons with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedCannons WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Cannon_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedCannons VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that cannon!");
									}
								});
							}
						});
						break;
					case "goldmask":
						alternionConnectionPool.query(`SELECT * FROM GoldMask WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That GoldMask do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That GoldMask are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Gold Masks skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedGoldMask WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Gold_Mask_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedGoldMask VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that weapon skin!");
									}
								});
							}
						});
						break;
					default:
						message.channel.send("That is not a valid item to assign to!");
				}

			}else{
				lackingPermissions(message);
			}
			break;
		case "revokeuser":
			if (message.author.id === config.ownerId){
				let notFound = true;
				switch (args[0].toLowerCase()){
					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That badge is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple badges with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedBadges WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that badge!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedBadges WHERE User_ID=${parseInt(args[1])} AND Allowed_Badge_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That mainsail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That mainsail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple mainsails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that mainsail!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])} AND Allowed_Main_Sail_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "sail":
						alternionConnectionPool.query(`SELECT * FROM NormalSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That sail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That sail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple sails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that Sail!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedSails WHERE User_ID=${parseInt(args[1])} AND Allowed_Sail_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "weapon":
						alternionConnectionPool.query(`SELECT * FROM WeaponSkin WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That weapon skin does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That weapon skin is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple weapon skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that weapon skin!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])} AND Allowed_Weapon_Skin_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					default:
						message.channel.send("Not a valid parameter.");
						break;
				}
			}else{
				lackingPermissions(message);
			}
			break;



    	default:
    		message.react("🤔");
    		break;
	}

	//If command is being tracked, update table
	if (TrackingCommand && adjustableConfig.misc.trackingCommandUsage){
		mainDatabaseConnectionPool.query(`SELECT * FROM commandUsageOliverBot WHERE command = '${command}'`, (err,rows) => {
			if(err) console.log(err);
			let sql;
			if(rows.length < 1){
				sql = `INSERT INTO commandUsageOliverBot (command,TimesUsed) VALUES ('${command}',1)`;
				mainDatabaseConnectionPool.query(sql);
			} else {
				let used = parseInt(rows[0].TimesUsed) + 1;
				sql = `UPDATE commandUsageOliverBot SET TimesUsed = ${used} WHERE command = '${command}'`;
				mainDatabaseConnectionPool.query(sql);
			}
		});
		TrackingCommand = false;
	}

	/////Custom Commands
	customCommands(message,command);
	permanentCommands(message,command);

	return;
	}catch(e){
		console.log("###########################################################");
		console.log("##################### START OF ERROR ######################");
		console.log("###########################################################");
		console.log(e);
		console.log("###########################################################");
		console.log("##################### END OF ERROR ########################");
		console.log("###########################################################");
	}
});

function handleAlternionRegistration(message,term,steamID,discordID){
	let registrationEmbed = new Discord.MessageEmbed().setTitle("Registration");
	let list = "";
	switch (term){
		case "steam":
			alternionConnectionPool.query(`SELECT * FROM User WHERE Steam_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that steamID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${steamID}, ${discordID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${steamID}\`, \`${discordID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		case "discord":
			alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that discordID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${discordID}, ${steamID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${discordID}\`, \`${steamID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		default:
			registrationEmbed.setDescription("Please check you entered a valid feature\n`discord` `steam`");
			sendAlternionEmbed(message,registrationEmbed,false);
			break;
	}
}

function getChannelInformation(message){
	mainDatabaseConnectionPool.query(`SELECT * FROM channel_messages WHERE channel_id = '${message.channel.id}'`, (err,rows) => {
		let message_count;
		if (rows.length < 1){
			message_count = 0;
		}else{
			message_count = rows[0].message_count;
		}

		let guild = bot.guilds.cache.get(message.guild.id);

		let channelinfo = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`${message.channel.name}`)
			.setAuthor(`Channel Info`)
			.addField('Type', `${message.channel.type}`,true)
			.addField('Created', `${message.channel.createdAt}`,true)
			.addField('Amount of people that can view', `${message.channel.members.size} / ${guild.members.cache.size}`,true)
			.addField('Nsfw', `-${message.channel.nsfw}`,true)
			.addField('Category', `-${message.channel.parent}`,true)
			.addField('Last Pin', `-${message.channel.lastPinAt}`,true)
			.addField('Topic', `-${message.channel.topic}`,true)
			.addField('Currently being typed in', `${message.channel.typing}`,true)
			.addField('Messages Sent', `${message_count}`,true)
			.setTimestamp();
		message.channel.send(channelinfo);
	});
	
	return;
}

function getPayday2Information(message, args){
	if (adjustableConfig.apis.payday2){
		if (isAllowed){
			if (args[0]){
				if (args[0] === "overview"){
					fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=218620&steamid=${args[1]}`).then(resp => resp.json()).then(response => {
						let achievements = response.playerstats.achievements;
						let stats = response.playerstats.stats;

						let unassignedUsed = true;
						let unassignedKills = true;
					
						let mostKills = {};
						let totalKills = 0;
						let faveWeapon = {};
					
						let infamyLevel = {};
						let playerLevel = 0;

						let successHeists = 0;
						let totalHeists = 0;

						let gageCoins = 0;
						for (i=0;i<stats.length;i++){

							//Fave Weapon
							if (stats[i].name.indexOf("weapon_used") !== -1){
								if (unassignedUsed){
									faveWeapon = stats[i];
									unassignedUsed = false;
								}else{
									if (faveWeapon.value < stats[i].value){
										faveWeapon = stats[i];
									}
								}
							}

							//Most Kills + Total Kills
							if (stats[i].name.indexOf("weapon_kills") !== -1){
								totalKills = totalKills + stats[i].value;
								if (unassignedKills){
									mostKills = stats[i];
									unassignedKills = false;
								}else{
									if (mostKills.value < stats[i].value){
										mostKills = stats[i];
									}
								}
							}

							//Infamy Level
							if (stats[i].name.indexOf("player_rank") !== -1){
								if (stats[i].value === 1){
									infamyLevel = stats[i];
								}
							}

							//Player Level
							if (stats[i].name === "player_level"){
								playerLevel = stats[i].value;
							}

							//Heist ratio
							if (stats[i].name === "heist_failed"){
								totalHeists = totalHeists + stats[i].value;
							}
							if (stats[i].name === "heist_success"){
								successHeists = successHeists + stats[i].value;
								totalHeists = totalHeists + stats[i].value;
							}	

							if (stats[i].name === "player_coins"){
								gageCoins = stats[i].value;
							}
						}	

						let OverviewEmbed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle(`${response.playerstats.gameName}`)
							.addField("Achievements",`${achievements.length} / 1160`,true)
							.addField("Weapon Stats",`Favourite Weapon: ${faveWeapon.name.slice(12).replace(/_/," ")} - used ${faveWeapon.value} time(s)\nMost Kills: ${mostKills.name.slice(13).replace(/_/," ")} - ${mostKills.value} kills\nTotal Kills: ${totalKills}`,true)
							.addField("Player stats",`Level: (${convertToRoman(parseInt(infamyLevel.name.slice(12)))}) ${playerLevel}\nHeisting Performance: ${successHeists}/${totalHeists}\nGage coins: ${gageCoins}`,true)
							.setTimestamp();
						message.channel.send(OverviewEmbed);
					});
					isAllowed = false;
					setTimeout(function(){
						isAllowed = true;
					},3000);
				}else{
					message.reply("Please enter a valid argument!\nCurrent valid arguments are: `overview STEAMID`");
				}
			}else{
				message.reply("Please enter an argument!");
			}
		}else{
			message.reply("This command is currently on cooldown due to steam API limitations, try again soon!");
		}
	}else{
		message.reply("That command is currently disabled!");
	}
	return;
}

function lackingPermissions(message){
	let lackingEmbed = new Discord.MessageEmbed()
		.setDescription("🛑 You do not have the right permissions to use this! 🛑")
		.setTimestamp();
	message.channel.send(lackingEmbed);
	return;
}

async function manageRawEmbeds(event){

	if (event.d.guild_id !== config.serverInfo.serverId) return;

	let rawEmbed = new Discord.MessageEmbed()
		.setTimestamp();

	let embedColours = {
		"channels" : config.embedColours.channels,
		"bans" : config.embedColours.bans,
		"roles" : config.embedColours.roles
	}

	let flag = true;
	let entry;

	switch (event.t){
		case "CHANNEL_CREATE":
			let createChannel = bot.channels.cache.get(event.d.id);
			if (event.d.type !== 'dm'){

				rawEmbed.setColor(embedColours.channels)
					.setTitle("Channel Created")
					.addField("Info:",`Name: ${event.d.name}\n<#${event.d.id}>`);
			}
			break;
		case "CHANNEL_DELETE":
			rawEmbed.setColor(embedColours.channels)
				.addField(`Name:`,`${event.d.name}`,true)
  				.addField(`ID:`,`${event.d.id}`,true);

			switch (event.d.type){
				case 0:
  					rawEmbed.setTitle("Text Channel Deleted");
 					break;
 				case 2:
 					rawEmbed.setTitle("Voice Channel Deleted");
 					break;
 				case 4:
 					rawEmbed.setTitle("Category Deleted");
 					break;
 				default:
 					rawEmbed.setTitle("Channel Deleted");
 					break;
			}

			break;
		case "CHANNEL_PINS_UPDATE":
			rawEmbed.setColor(embedColours.channels)
				.setTitle(`Message Pinned`)
				.setDescription(`Channel: <#${event.d.channel_id}>\nID: ${event.d.channel_id}`);
			break;
		case "GUILD_BAN_ADD":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				rawEmbed.setColor(embedColours.bans)
					.setTitle("User Banned")
					.addField("User",`${entry.target}`)
					.addField("Executor",`${entry.executor}`)
					.addField("Reason",`${entry.reason}`)
					.setThumbnail(`${entry.target.displayAvatarUR()}`);
			}
			break;
		case "GUILD_BAN_REMOVE":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
			rawEmbed.setColor(embedColours.bans)
				.setTitle("User Unbanned")
				.addField("User",`${entry.target}`)
				.addField("Executor",`${entry.executor}`)
				.setThumbnail(`${entry.target.displayAvatarURL()}`);
			break;
		case "GUILD_MEMBER_REMOVE":
			try{
				entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
				if (entry.createdTimestamp > (Date.now() - 5000)){
					rawEmbed.setColor(embedColours.bans)
						.setTitle("User Kicked")
						.addField("User",`${entry.target}`)
						.addField("Executor",`${entry.executor}`)
						.addField("Reason",`${entry.reason}`)
						.setThumbnail(`${entry.target.displayAvatarURL()}`);
				}else{
					flag = false;
				}
			}catch(e){
				console.log("Someone left :(");
				flag = false;
			}
			break;
		case "GUILD_ROLE_CREATE":
			rawEmbed.setTitle("Role Created")
				.setColor(embedColours.roles)
				.addField("Role:",`${event.d.role.name}\n<@&${event.d.role.id}>`);
			break;
		case "GUILD_ROLE_DELETE":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				rawEmbed.setTitle("Role Deleted")
					.setColor(embedColours.roles)
					.setDescription(`${entry.changes[0].old}\nby: ${entry.executor}`);
			}
			break;
		default:
			console.log("EVENT START");
			console.log(event);
			console.log("EVENT END");
			rawEmbed.setTitle(event.t)
				.setDescription(event.d.toString());
			break;
	}

	if (flag){
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(rawEmbed);
	}
	return;
}

async function manageJoinReaction(event){
	if (event.d.emoji.name === config.serverInfo.emojiNames.initialJoinReactionConfirmation){
		member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
		let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(config.serverInfo.roles.defaultRole);
		member.roles.add(role);
	}else{
		bot.channels.cache.get(config.serverInfo.channels.initialJoinReactionConfirmation).messages.fetch(config.serverInfo.messages.initialJoinReactionConfirmation).then( msg => {
			let userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(event.d.user_id));
			try {
				for (let reaction of userReactions.values()) {
					if (reaction._emoji.name !== config.serverInfo.emojiNames.initialJoinReactionConfirmation)
					{
						reaction.users.remove(event.d.user_id);
					}
				}
			} catch (error) {
				console.error('Failed to remove reactions.');
			}
		});
	}
	return;
}

//Pure Logging of events
bot.on('raw', async event => {
	if (event.d){
	if (event.d.guild_id){
	if (event.d.guild_id !== config.serverInfo.serverId) return;
	let member;

	switch (event.t){
		case "CHANNEL_CREATE":
			if (event.d.type !== 'dm'){
				manageRawEmbeds(event);
			}
			break;
		case "CHANNEL_DELETE":
			if (event.d.type !== 'dm'){
				manageRawEmbeds(event);
			}
			break;
		case "CHANNEL_PINS_UPDATE":
			manageRawEmbeds(event);
			break;
		case "GUILD_BAN_ADD":
			manageRawEmbeds(event);
			break;
		case "GUILD_BAN_REMOVE":
			manageRawEmbeds(event);
			break;
		case "GUILD_MEMBER_REMOVE":
			manageRawEmbeds(event);
			break;
		case "GUILD_ROLE_CREATE":
			manageRawEmbeds(event);
			break;
		case "GUILD_ROLE_DELETE":
			manageRawEmbeds(event);
			break;
		case "MESSAGE_REACTION_ADD":
			if (event.d.channel_id === "762401591180525608"){
				// manageJoinReaction(event);
			}else if (parseInt(event.d.channel_id) !== 607491352598675457 && adjustableConfig.reactions.reactionMenu){
        		break;
    		}
			member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
			reactionRoles.forEach(roleInfo => {
				if (event.d.emoji.name === roleInfo.EmojiName){ 
					let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
					member.roles.add(role);
				}
			});
			break;
		case "MESSAGE_REACTION_REMOVE":
			if (parseInt(event.d.channel_id) !== 607491352598675457 && adjustableConfig.reactions.reactionMenu){
        		break;; 
    		}
			member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
			reactionRoles.forEach(roleInfo => {
				if (event.d.emoji.name === roleInfo.EmojiName){ 
					let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
					member.roles.remove(role);
				}
			});
			break;
		default:
			break;
	}

	}
	}

	return;
});

// bot.on('presenceUpdate', (oldMember, newMember) => {
// 	if (oldMember.guild.id){
// 		console.log("------");
// 		if (oldMember.presence.game["streaming"]){
// 			console.log(oldMember.presence.game.streaming);
// 			console.log("------");
// 		}
		
// 		if (newMember.presence.game["streaming"]){
// 			console.log(newMember.presence.game.streaming);
// 			console.log("------");
// 		}
		
// 	}
// });


bot.on('error', console.error);
//bot.on('debug', console.log)
bot.on("warn", (e) => console.warn(e));

bot.on("messageDelete", function(message){
	if (message.channel.id === "562013905426317322" || message.channel.id === "522864242626658305") return;
	let msgDeleteEmbed = new Discord.MessageEmbed()
		.setTitle(`${message.author}`)
		.setDescription(`${message.content}`)
		.setFooter(`From: ${message.channel}`)
		.setTimestamp();
    bot.channels.cache.get("732318686186045440").send(msgDeleteEmbed);
    return;
});

bot.login(config.token);
