const config = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();

const fetch = require("node-fetch");
const fs = require("fs");
const mysql = require("mysql");
const btoa = require("btoa");
const ytdl = require("ytdl-core");
const Canvas = require('canvas');

var serverStatus = {
	"active" : false,
	"msg" : null,
	"channel" : "663524428092538920"
};

var cooldowns = {
	"steamApi" : true,
	"quiz" : {
		"allowed" : true,
		"timeoutLength" : 60000
	}
}

var isAllowed = true;

const leaderboardlimits = {
	"listsizelimit" : 30,
	"rank" : 2,
	"username" : 16,
	"level" : 7,
	"xp" : 10,
	"usernameEco" : 20
}

const xpdetails = {
	"max" : 0
}

const mysqlLoginData = {
	"host":config.databaseInfo.host,
	"user":config.databaseInfo.user,
	"password":config.databaseInfo.password,
	"database":config.databaseInfo.database,
}

// const userActivitiesLimits = {
// 	"Name" : 30
// }

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
}

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

function scheduleDbEvent(type,time,reason,query,affectedUserID){
	var scheduleEventCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database
	});
	scheduleEventCon.connect(err => {
		if(err) console.log(err);
	});
	scheduleEventCon.query(`SELECT COUNT(*) FROM eventcounts`, (err,length) =>{
		if (err) konsole(err);
		if (type === "oneUse"){
			scheduleEventCon.query(`CREATE EVENT ${length + 1} on SCHEDULE at CURRENT_TIMESTAMP + INTERVAL ${time} DO ${query}`);
		}else if (type === "repeating"){
			scheduleEventCon.query(`CREATE EVENT ${length + 1} on SCHEDULE at CURRENT_TIMESTAMP + INTERVAL ${time} ON COMPLETETION PRESERVE DO ${query}`);
		}
		scheduleEventCon.query(`INSERT INTO eventcounts (number,reason,type,userAffectedID) values ('${length + 1}','${reason}','${type}','${affectedUserID}`);
	});
	scheduleEventCon.end();
	scheduleEventCon = null;
	return;
}

//Loading Data
function loadXpDataFromDB(){
	var loadCustCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	loadCustCon.connect(err => {
		if(err) console.log(err);
	});
	loadCustCon.query(`SELECT * FROM xpGainData`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				xpdetails[`${rows[i].factorName}`] = rows[i].val;
			}
		}
	});
	loadCustCon.end();
	loadCustCon = null;
	return;
}

function loadConfigFromDB(){
	var setupCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	setupCon.connect(err => {
		if(err) console.log(err);
	});

	setupCon.query(`SELECT * FROM config`, (err,rows) => {
		if (rows.length < 1){
			console.log("------ERROR LOADING CONFIG------");
		}else{
			for (i=0;i<rows.length;i++){

				if (rows[i].category === 'reactions'){
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
	})
	setupCon.end();
	setupCon = null;
	return;
}

function checkIfBool(toCheck){
	let val = false;
	if (toCheck === 'true'){
		val = true;
	}
	return val;
}

function loadCustomCommandsFromDB(){
	customCommandList = [];
	var loadCustCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	loadCustCon.connect(err => {
		if(err) console.log(err);
	});
	loadCustCon.query(`SELECT * FROM CustomCommands`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				customCommandList.push( {"command" : rows[i].command, "response" : rows[i].response} );
			}
		}
	});
	loadCustCon.end();
	loadCustCon = null;
	return;
}

function loadPermanentCommandsFromDB(){
	miniCommands = [];
	var loadCustCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	loadCustCon.connect(err => {
		if(err) console.log(err);
	});
	loadCustCon.query(`SELECT * FROM permanentCommands`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				miniCommands.push( {"command" : rows[i].commandName, "response" : rows[i].content} );
			}
		}
	});
	loadCustCon.end();
	loadCustCon = null;
	return;
}

function loadReactionRolesFromDB(){
	reactionRoles = [];
	var loadReactCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	loadReactCon.connect(err => {
		if(err) console.log(err);
	});
	loadReactCon.query(`SELECT * FROM reactionRoles`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}
		else{
			for (i=0;i<rows.length;i++){
				reactionRoles.push( {"EmojiName" : rows[i].emojiName, "RoleID" : rows[i].RoleID} );
			}
		}
	});
	loadReactCon.end();
	loadReactCon = null;
	return;
}

//Altering Config

async function updateDBConfig(message,args){
	var alterConfigCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});

	alterConfigCon.connect(err => {
		if(err) console.log(err);
	});

	let commandName = args[0];
	let newValue = args[1];

	await alterConfigCon.query(`SELECT * FROM config`, (err,rows) =>{
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
				alterConfigCon.query(`update config set currentval='${newValue}' where name='${commandName}'`, (err) => {
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

	setTimeout(function(){
		alterConfigCon.end();
		alterConfigCon = null;
	},3000);

	loadConfigFromDB();

	return;
}

//Custom Commands

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
	var customCommand = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	customCommand.connect(err => {
		if(err) console.log(err);
	});
	customCommand.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
	await customCommand.end();
	setTimeout(function(){
		customCommand = null;
		loadCustomCommandsFromDB();
	},900);
	return;
}

async function deleteCustomCommands(message,args){
	let commandToDelete = "";
	if (Array.isArray(args)){
		commandToDelete = args[0];
	}else{
		commandToDelete = args;
	}
	var deletecustomCommand = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	deletecustomCommand.connect(err => {
		if(err) console.log(err);
	});
	deletecustomCommand.query(`delete from CustomCommands where command='${commandToDelete}'`);
	await deletecustomCommand.end();
	setTimeout(function(){
		deletecustomCommand = null;
		loadCustomCommandsFromDB();
	},900);
	return;
}

//Reaction Roles

async function createReactionRole(message,name,roleID){
	var reactionRolesCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	reactionRolesCon.connect(err => {
		if(err) console.log(err);
	});
	console.log(`insert into reactionRoles values ('${name}' , '${roleID}' )`);
	reactionRolesCon.query(`insert into reactionRoles values ('${name}' , '${roleID}' )`);
	await reactionRolesCon.end();
	setTimeout(function(){
		reactionRolesCon = null;
		loadReactionRolesFromDB();
	},900);
	message.channel.send("Role added!");
	return;
}

async function deleteReactionRole(message,name){
	var reactionRolesCon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : "oliverbotConfigs",
	});
	reactionRolesCon.connect(err => {
		if(err) console.log(err);
	});
	reactionRolesCon.query(`delete from reactionRoles where emojiName='${name}'`);
	await reactionRolesCon.end();
	setTimeout(function(){
		reactionRolesCon = null;
		loadReactionRolesFromDB();
	},900);
	message.channel.send("Role removed!");
	return;
}

//////////////////////////////////////////////////////////////////XP

function updateleaderboard(msg){
	let delay = 30000;
	setInterval(function(){
		var con = mysql.createConnection({
			host : mysqlLoginData.host,
			user : mysqlLoginData.user,
			password : mysqlLoginData.password,
			database : mysqlLoginData.database,
		});

		con.connect(err => {
			if(err) console.log(err);
		});
		con.query(`SELECT * FROM xp order by level desc, xp desc limit 31`, (err,rows) =>{
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
		con.end();
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
	var lvlcon = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	lvlcon.connect(err => {
		if(err) console.log(err);
	});
	let response = true
	lvlcon.query(`SELECT * FROM xp WHERE id='${msg.author.id}'`, (err,rows) => {
		if (rows.length < 1){
			response = false;
		}else if (parseInt(rows[0].level) < reqlvl){
			response = false;
		}
	});
	lvlcon.end()
	lvlcon = null;
	return response;
}

///////////////////////////////////////////////////////////////RANDOM RESPONSES
function randomgif(message,content){
	let yay = getRandomInt(5);
	if ( yay === 1){
		if (content.includes("roll")){
			message.channel.send("https://makeagif.com/gif/2-person-forward-roll-race-vrEaaK");
		}else
		if (content.includes("jump")){
			message.channel.send("https://giphy.com/gifs/filmeditor-will-ferrell-elf-l2YWvhSnfdWR8nRBe");
		}else
		if (content.includes("wave")){
			message.channel.send("https://giphy.com/gifs/elf-TDWwXnAZbp0xW");
		}else
		if (content.includes("happy")){
			message.channel.send("https://giphy.com/gifs/butterfly-penguins-otnqsqqzmsw7K");
		}else
		if (content.includes("excited")){
			message.channel.send("https://giphy.com/gifs/happy-car-home-rdma0nDFZMR32");
		}else
		if (content.includes("ritual")){
			message.channel.send("https://giphy.com/gifs/woohoo-R8e3MbbggNBjq");
		}else
		if (content.includes("alien")){
			message.channel.send("https://giphy.com/gifs/alien-area-51-stormarea51-WqEmD7ycGVIzzNMxya");
		}else
		if (content.includes("ree")){
			message.channel.send("https://giphy.com/gifs/justin-g-mad-u-camron-xTcnSOEKegBnYhGahW");
		}else 
		if (content.includes("no way")){
			message.channel.send("https://giphy.com/gifs/6OpusTwW1csaQ");
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
	if (content.includes("yarr")){
		msg.channel.send("Yarr");
	}else
	if (content.includes("pirates") || content.includes("pirate")){
		msg.channel.send("Ahoy, Me Hearties!");
	}else
	if (content.includes("hello")){
		msg.channel.send("Ahoy, Matey!");
	}else
	if (content.includes("enemy") || content.includes("enemies")){
		let num = getRandomInt(2);
		if (num === 0){
			msg.channel.send("All Hand Hoy!");
		}else
		if (num === 1){
			msg.channel.send("Bloody Buccaneers!");
		}else{
			msg.channel.send("Lets Get us Those Dubloons!");
		}
		return;
	}else
	if (content.includes("storm")){
		msg.channel.send("A storm ye say? Batten Down The Hatches!");
	}else
	if (content.includes("treasure")){
		msg.channel.send("Now ye ain't hiding da booty from us now are ye?");
	}else
	if (content.includes("run")){
		msg.channel.send("I want me a Clap O' Thunder!");
	}else
	if (content.includes("traitor")){
		msg.channel.send("There be a traitor? Cleave Him to the Brisket.");
	}else
	if (content.includes("sword")){
		msg.channel.send("Me fav sword's me Cutlass");
	}else
	if (content.includes("loot")){
		msg.channel.send("What rewards we be having?");
	}

	return;
}

/////////////////////////////////////////////Rankcard Generation

function rankcardCreation(message){

	var conCheckRankcard = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conCheckRankcard.connect(err => {
		if(err) console.log(err);
	});

	conCheckRankcard.query(`SELECT * FROM inventoryGT WHERE ID = '${message.author.id}'`, (err,rows) => {
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

	setTimeout(function(){
		conCheckRankcard.destroy();
		conCheckRankcard = null;
	},3000);

	return;
}

function createDefaultRankCard(message){

	var conDefaultRankcard = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conDefaultRankcard.connect(err => {
		if(err) console.log(err);
	});

	conDefaultRankcard.query(`SELECT * FROM xp WHERE id = '${message.author.id}'` , (err,rows) => {
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
		conDefaultRankcard.query(`SELECT * FROM inventoryGT WHERE ID = ${message.author.id}`, (err,rows) => {
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

	setTimeout(function(){
		conDefaultRankcard.destroy();
		conDefaultRankcard = null;
	},3000);
}

async function createRankCanvas(channel,member,ship, ID){
	var conCustomCanvas = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conCustomCanvas.connect(err => {
		if(err) console.log(err);
	});

	conCustomCanvas.query(`SELECT * FROM xp WHERE id = '${ID}'` , (err,rows) => {
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
		conCustomCanvas.query(`SELECT * FROM inventoryGT WHERE ID = ${ID}`, (err,rows) => {
			if (rows.length > 0 ){
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, rows[0].giraffeCoins);
			}else{
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, "N/A");
			}
		});
	});

	setTimeout(function(){
		conCustomCanvas.destroy();
		conCustomCanvas = null;
	},3000);
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
			.addField("",`${response.slip.advice} ID:${response.slip.slip_id}`);
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
	let file = fs.readFileSync("./datafile.json").toString();
	file = JSON.parse(file);
	let a = getRandomInt(file.Responses.underground.length+1);
	message.channel.send(file.Responses.underground[a]);
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
	if (a === 0){
		let b = getRandomInt(file.status.PLAYING.length+1);
		bot.user.setActivity(`${file.status.PLAYING[b]}`);
	}else
	if (a === 1){
		let b = getRandomInt(file.status.WATCHING.length+1);
		bot.user.setActivity(`${file.status.WATCHING[b]}`,{
			type : "WATCHING"
		});
	}else
	if (a === 2){
		let b = getRandomInt(file.status.STREAMING.length+1);
		bot.user.setActivity(`${file.status.STREAMING[b]}`,{
			type: "STREAMING"
		});
	}else
	if (a === 3){
		let b = getRandomInt(file.status.LISTENING.length+1);
		bot.user.setActivity(`${file.status.LISTENING[b]}`,{
			type: "LISTENING"
		});
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

function displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar){
	let embed = new Discord.MessageEmbed()
		.setTitle("User Info")
   		.setColor(0x008000)
   		.addField(`User:`,`<@${userID}>`)
   		.addField(`ID:`,`${userID}`,true)
   		.addField(`Account created at:`,`${userCreatedAt}`,true)
   		.addField(`Joined the server at:`,`${userJoinedAt}`,true)
   		.setThumbnail(`${avatar}`)
   		.addField(`Details:`,`Server Deafened: ${serverDeaf}\nServer Muted: ${serverMute}`)
   		.addField(`Avatar`,`[Link](${avatar})`)
   		.setTimestamp();
  	message.channel.send(embed);
  	return;
}

function clean(text) {
  	if (typeof(text) === "string"){
    	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	}
  	else{
  		return text;
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

function jeanieAPI(message,args){
	let content = encodeURIComponent(args.join(" "));
	fetch(`http://ask.pannous.com/api?input=${content}&locale=en`).then(resp => resp.json()).then(response => {
		let jeanieEmbed = new Discord.MessageEmbed()
			.setDescription("-",`${response.output[0].actions.say.text}`)
			.setFooter(`Response time: ${response.output[0].responseTime}ms`)
		message.channel.send(jeanieEmbed);
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
	if(args.lgenth === 0){
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
			.setThumbnail(message.author.displayAvatarURL)
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
			.setThumbnail(message.author.displayAvatarURL)
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

async function getBlackwakeStats(message,args){
	if (isAllowed){

		fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=420290&steamid=${args[1]}`).then(resp => resp.text()).then(response => {

			if (response.includes("500 Internal Server Error")){
				message.channel.send("Steam API error, code 500");
			}else{

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
			
					if (stats[i].name === "acc_kills"){
						kills = stats[i].value;
					}

					if (stats[i].name === "acc_deaths"){
						deaths = stats[i].value;
					}

					if (stats[i].name === "acc_capWins"){
						captainWins = stats[i].value;
					}

					if (stats[i].name === "acc_capLose"){
						captainLosses = stats[i].value;
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

					if (stats[i].name === "stat_score"){
						score = stats[i].value;
					}

					if (stats[i].name === "stat_score_gs"){
						statScoreGs = stats[i].value;
					}

					if (stats[i].name === "stat_rating"){
						rating = stats[i].value;
					}

				}
				if (args[0] === "overview"){
					let achieves = "";
					if (JSON.stringify(response).includes("achievements")){
						achieves = response.playerstats.achievements.length.toString();
					}else{
						achieves = "NA";
					}
					let playerStatsCombined = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nAchievements: ${achieves}/39`;
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
						let BwMaintainStats = new Discord.MessageEmbed()
							.setTitle(`${args[1]}`)
							.addField(`General`,`${playerStatsCombined}`,true)
							.addField(`Captain Stats`,`${captainWins} wins\n${captainLosses} losses\nRatio: ${captainWins/captainLosses}`,true)
							.addField(`Fav Weapon`,`${substituteNames[weapons.indexOf(faveWeap.name)]}\n${faveWeap.value} kills`,true)
							.setTimestamp();
						message.channel.send(BwMaintainStats);				
					});
				}else
				if (args[0] === "weaponstats"){
					let WeaponStats = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills");
					let BwWeaponsEmbed = new Discord.MessageEmbed()
						.setTitle(`${args[1]}`)
						.setDescription(WeaponStats)
						.setTimestamp();;
					message.channel.send(BwWeaponsEmbed);
					setSteamApiNotAllowed();
				}else
				if (args[0] === "shipstats"){
					let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins");
					let untrackedWins = parseInt(captainWins) - parseInt(ShipStats.split("Total: ")[1]);
					let BwShipsEmbed = new Discord.MessageEmbed()
						.setTitle(`${args[1]}`)
						.addField("Ships",`${ShipStats}`,true)
						.addField("General",`Wins: ${captainWins}\nUntracked: ${untrackedWins}\nLosses: ${captainLosses}\nWin Rate: ${captainWins/captainLosses}`,true)
						.setTimestamp();;
					message.channel.send(BwShipsEmbed);
					setSteamApiNotAllowed();
				}else
				if (args[0] === "shipweaponry"){
					let shipWeap = WeaponTextGenerator(WeaponSorter(shipWeaponryStats),shipWeaponrySubNames,shipWeaponry,"kills");
					let BwShipsEmbed = new Discord.MessageEmbed()
						.setTitle(`${args[1]}`)
						.setDescription(`${shipWeap}`)
						.setTimestamp();
					message.channel.send(BwShipsEmbed);
					setSteamApiNotAllowed();
				}else if(args[0] === "maintenance"){
					let maintainStats = WeaponTextGenerator(WeaponSorter(maintain),subMaintain,maintenance,"");
					let BwMaintainStats = new Discord.MessageEmbed()
						.setTitle(`${args[1]}`)
						.setDescription(maintainStats)
						.setTimestamp();
					message.channel.send(BwMaintainStats);
					setSteamApiNotAllowed();
				}else if(args[0] === "compare"){
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

								if (stats[i].name === "acc_kills") {
								    kills = stats[i].value;
								}

								if (stats[i].name === "acc_deaths") {
								    deaths = stats[i].value;
								}

								if (stats[i].name === "acc_capWins") {
								    captainWins = stats[i].value;
								}

								if (stats[i].name === "acc_capLose") {
								    captainLosses = stats[i].value;
								}

								if (stats[i].name === "stat_score") {
								    score = stats[i].value;
								}

								if (stats[i].name === "stat_score_gs") {
								    statScoreGs = stats[i].value;
								}

								if (stats[i].name === "stat_rating") {
								    rating = stats[i].value;
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
							let bwComparisonStats = new Discord.MessageEmbed()
								.setTitle(`${args[1]} VS ${args[2]}`)
								.addField(`${args[1]}`,`${playerStatsCombinedP1}`,true)
								.addField(`${args[2]}`,`${playerStatsCombinedP2}`,true)
								.setTimestamp();
							message.channel.send(bwComparisonStats);
							setSteamApiNotAllowed();
							});
						});
					});
				}else{
					message.reply("Please enter a valid option! You can find valid options by using `;help bwstats`.");
				}
			}
		}).catch(message.channel.send("Please make sure you have entered a correct Steam ID and the profile is set to public! :slight_smile:"));

	}else{
		message.reply("This command is currently on cooldown due to steam API limitations, try again soon!");
	}
	return;
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
		returnMsg = returnMsg + `${substituteNames[weapons.indexOf(weaponsArray[i].name)]} - ${weaponsArray[i].value} ${type}\n`;
		count += weaponsArray[i].value;
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
		msg.edit("```js\n" + `API Commands/features:\n1. checkNudity: ${adjustableConfig.apis.checkNudity}\n2. inspire: ${adjustableConfig.apis.inspire}\n3. translate: ${adjustableConfig.apis.translate}\n4. urban: ${adjustableConfig.apis.urban}\n5. yodish: ${adjustableConfig.apis.yodish}\n6. randomUselessFactAPI: ${adjustableConfig.apis.randomUselessFactAPI}\n7. memegen: ${adjustableConfig.apis.memegen}\n8. apod: ${adjustableConfig.apis.apod}\n9. numTrivia: ${adjustableConfig.apis.numTrivia}\n10. exchangeRates: ${adjustableConfig.apis.exchangeRates}\n11. advice: ${adjustableConfig.apis.advice}\n12. today: ${adjustableConfig.apis.today}\n13. jeanie: ${adjustableConfig.apis.jeanie}\n14. bacon: ${adjustableConfig.apis.bacon}\n15. chuck: ${adjustableConfig.apis.chuck}\n16. dictionary: ${adjustableConfig.apis.dictionary}\n17. payday2: ${adjustableConfig.apis.payday2}\n18. blackwake: ${adjustableConfig.apis.blackwake}` + "```");
	});
	//tooltip
	bot.channels.cache.get("692403714048131185").messages.fetch("692419941248270407").then(msg => {
		msg.edit("```\nTo edit the config:\n Command = config, first argument is the command name, second is true/false/number\nA few Examples:\n - ;config memegen true\n - ;config nWordFilter true\n - ;config chanceofRandomReactions 27\n```");
	});
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
	var conShopWindow = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conShopWindow.connect(err => {
		if(err) console.log(err);
	});

	conShopWindow.query(`SELECT * FROM shop`, (err,rows) => {
		let newShopListing = new Discord.MessageEmbed().setTitle("Shop Window");
		let melee = "";
		let secondary = "";
		let primary = "";
		let smallShips = "";
		let bigShips = "";
		let megaShips = "";
		let swivelTypes = "";
		let cannons = "";
		for (i=0;i<rows.length;i++){
			let itemInfo = JSON.parse(rows[i].info);
			if (itemInfo.type === "megaShips"){
				megaShips = megaShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "smallShips"){
				smallShips = smallShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "largeShips"){
				bigShips = bigShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "primary"){
				primary = primary + `${itemInfo.name}` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "secondary"){
				secondary = secondary + `${itemInfo.name}` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "melee"){
				melee = melee + `${itemInfo.name}` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "swivelType"){
				swivelTypes = swivelTypes + `${itemInfo.name}` + " - `" + `${rows[i].name}` +"`\n";
			}else if(itemInfo.type === "cannons"){
				cannons = cannons + `${itemInfo.name}` + " - `" + `${rows[i].name}` +"`\n";
			}
		}
		setTimeout(function(){
			newShopListing.addField("Melee",`${melee}`,true)
				.addField("Secondary",`${secondary}`,true)
				.addField("Primary",`${primary}`,true)
				.addField("Small Ships",`${smallShips}`,true)
				.addField("Large Ships",`${bigShips}`,true)
				.addField("Mega Ships",`${megaShips}`,true)
				.addField("Swivel Cannons",`${swivelTypes}`,true)
				.addField("Main Cannons",`${cannons}`,true)
				.addField("Info","For more indepth info for a given item use:\n;search `itemToSearch`")
				.setTimestamp();
			bot.channels.cache.get(config.serverInfo.channels.economy.shopWindowChannel).messages.fetch(config.serverInfo.messages.economy.mainShopWindowMessage).then(msg => {
				msg.edit(newShopListing);
			});
		},6000);
	});
	
	setTimeout(function(){
		conShopWindow.destroy();
		conShopWindow = null;
		return;
	},9000);
}

function displayRichestUsers(){
	var conRichestUsers = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conRichestUsers.connect(err => {
		if(err) console.log(err);
	});

	conRichestUsers.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 desc limit 30`, (err,rows) => {
		let newRichest = "```The Richest Users!\nUsername            |Coins in Bank\n";
		let factor = 100;
		for (i=0;i<30;i++){
			let user = bot.users.cache.get(rows[i].ID);
			if (rows[i].ID === 'thereserve'){
				name = "Federal Reserve";
			}else if (user === undefined){
				name = "REPLACEMENT";
			}else{
				name = user.username;
			}
			if (name.length < leaderboardlimits.usernameEco){
				let x = leaderboardlimits.usernameEco - name.length;
				name = name + new Array(x + 1).join(' ');
			}else{
				name = name.split(0,leaderboardlimits.usernameEco);
			}
			let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
			if (coins >= (1000000000 * factor)){
				coins = (coins / (1000000000 * factor)) + "B";
			}else if (coins >= (1000000 * factor)){
				coins = (coins / (1000000 * factor)) + "M";
			}else if (coins >= (1000 * factor)){
				coins = (coins / (1000 * factor)) + "K";
			}else{
				coins = coins / factor;
			}
			newRichest = newRichest + name +"|"+ coins +"\n";
		}
		bot.channels.cache.get(config.serverInfo.channels.economy.shopBoardsChannel).messages.fetch(config.serverInfo.messages.economy.richestUsersMessage).then(msg => {
			msg.edit(newRichest + "```");
		});
	});

	conRichestUsers.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 limit 30`, (err,rows) => {
		let newPoorest = "```The Poorest Users!\nUsername            |Coins in Bank\n";
		let factor = 100;
		for (i=0;i<30;i++){
			let user = bot.users.cache.get(rows[i].ID);
			if (rows[i].ID === 'thereserve'){
				name = "The Federal Reserve";
			}else if (user === undefined){
				name = "REPLACEMENT";
			}else{
				name = user.username;
			}
			if (name.length < leaderboardlimits.usernameEco){
				let x = leaderboardlimits.usernameEco - name.length;
				name = name + new Array(x + 1).join(' ');
			}else{
				name = name.split(0,leaderboardlimits.usernameEco);
			}
			let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
			if (coins >= (1000000000 * factor)){
				coins = (coins / (1000000000 * factor)) + "B";
			}else if (coins >= (1000000 * factor)){
				coins = (coins / (1000000 * factor)) + "M";
			}else if (coins >= (1000 * factor)){
				coins = (coins / (1000 * factor)) + "K";
			}else{
				coins = coins / factor;
			}
			newPoorest = newPoorest + name +"|"+ coins +"\n";
		}
		bot.channels.cache.get(config.serverInfo.channels.economy.shopBoardsChannel).messages.fetch(config.serverInfo.messages.economy.poorestUsersMessage).then(msg => {
			msg.edit(newPoorest + "```");
		});
	});
	
	setTimeout(function(){
		conRichestUsers.destroy();
		conRichestUsers = null;
	},6000);
}
function giveUserMoney(amount,ID){
	var conUserMoney = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conUserMoney.connect(err => {
		if(err) console.log(err);
	});

	conUserMoney.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			sql = `INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${ID}','${amount}','[]')`;
		} else {
			sql = `UPDATE inventoryGT SET giraffeCoins = '${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(amount * 100)) / 100).toFixed(2)}' WHERE ID = '${ID}'`;
		}
		conUserMoney.query(sql);
	});

	setTimeout(function(){
		conUserMoney.destroy();
		conUserMoney = null;
	},3000);
	return;
}

function purchaseItem(ID,item,message){

	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	var conpurchase = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conpurchase.connect(err => {
		if(err) console.log(err);
	});

	conpurchase.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if (rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}
		conpurchase.query(`SELECT * FROM shop WHERE name='${item}'`, (err2, rows2) => {
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
				conpurchase.query(`SELECT * FROM shopTypeLimits WHERE type='${itemInfo.type}'`, (err,rows3) => {
					let counter = 0;
					let maxCount = rows3[0].maxCount;
					for (i=0; i< inventory.length ; i++){
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
						inventory.push( {"name" : rows2[0].name, "type" : itemInfo.type, "customizable" : customizable, "value" : (rows2[0].value / 2), "properName" : itemInfo.name} );
						conpurchase.query(`update inventoryGT set giraffeCoins='${rows[0].giraffeCoins - rows2[0].value}', inventory='${JSON.stringify(inventory)}' where ID = '${ID}'`);
						conpurchase.query(`update shop set inStock = ${rows2[0].inStock - 1} where name='${item}'`);
						message.channel.send(fancyPurchaseEmbed);
						if (parseInt(rows2[0].value) > 5000){
							let logEmbed = new Discord.MessageEmbed()
								.setTitle("Transaction Occured")
								.setDescription(`${itemInfo.name}\nPurchased by <@${message.author}> for ${rows2[0].value}GC`);
							bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(logEmbed);
						}
						updateShopWindow();
					}
				});	
			}
		});
	});

	setTimeout(function(){
		conpurchase.destroy();
		conpurchase = null;
	},3000);
}

function searchForItem(item,message){
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	var conSearch = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conSearch.connect(err => {
		if(err) console.log(err);
	});
	if (Array.isArray(item)){
		item = item.join(' ');
	}
	item = item.toLowerCase().replace(/ /g,"");

	conSearch.query(`SELECT * FROM shop WHERE name LIKE '%${item}%'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("That item does not exist.");
		} else if(rows.length > 1 && rows.length < 10){
			let allNames = "Results:\n```\n";
			for (i=0; i< rows.length; i++){
				allNames = allnames + rows[i].name + "\n";
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

	setTimeout(function(){
		conSearch.destroy();
		conSearch = null;
	},3000);
}

function sellItem(ID,item,message){

	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate search term!");
	}

	var conSellItem = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conSellItem.connect(err => {
		if(err) console.log(err);
	});

	conSellItem.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send("Something has gone wrong, please message <@337541914687569920>");
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
				conSellItem.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					conSellItem.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					conSellItem.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
					let itemInfo = JSON.parse(rows2[0].info);
					let sellEmbed = new Discord.MessageEmbed().setTitle("Item Sold").setDescription(`Item: ${itemInfo.name} has been sold for ${worth}.\nSold by: ${message.author}`).setTimeStamp();
					message.channel.send(sellEmbed);
					bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(sellEmbed);
					updateShopWindow();
				});
			}

			if (notFound){
				message.channel.send("You cannot sell this item as you do not own it!");
			}
		}
	});

	setTimeout(function(){
		conSellItem.destroy();
		conSellItem = null;
	},3000);
}

async function listInventory(ID,message){
	var conlistInventory = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conlistInventory.connect(err => {
		if(err) console.log(err);
	});

	conlistInventory.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
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

	setTimeout(function(){
		conlistInventory.destroy();
		conlistInventory = null;
	},3000);
}

function giftUserItem(gifterID,reciever,item,message){
	let user = getUserFromMention(reciever);
	user = user.id;
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate item!");
	}

	var conGiftUser = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conGiftUser.connect(err => {
		if(err) console.log(err);
	});

	conGiftUser.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send("Something has gone wrong, please message <@337541914687569920>");
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
				conSellItem.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					conSellItem.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					conSellItem.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
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

	setTimeout(function(){
		conGiftUser.destroy();
		conGiftUser = null;
	},3000);
}

function giftUserCoins(gifterID,recieverID,amount,message){
	var conGiftUserCoins = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conGiftUserCoins.connect(err => {
		if(err) console.log(err);
	});

	if (isNaN(amount)){
		message.channel.send("Please enter a correct value!");
		return;
	}else if (amount < 5){
		message.channel.send("You must gift atleast 5 coins!");
		return;
	}

	conGiftUserCoins.query(`SELECT * FROM inventoryGT WHERE ID = '${gifterID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("You are not in the database! Please send a few messages to get entered!");
		} else if(amount > (rows[0].giraffeCoins * 1)){
			message.channel.send("You cannot gift money you do not have!");
		}else{
			conGiftUserCoins.query(`SELECT * FROM inventoryGT WHERE ID='${recieverID}'`, (err,rows2) => {
				let giftCoinsEmbed = new Discord.MessageEmbed().setTitle("User Gifted");
				if (rows2.length < 1){
					conGiftUserCoins.query(`INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${recieverID}','${amount}','[]')`);
					conGiftUserCoins.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
					giftCoinsEmbed.setDescription(`Added user <@${recieverID}> to the database\nGifted user: ${amount}GC from <@${gifterID}>`);
				}else{
					conGiftUserCoins.query(`update inventoryGT set giraffeCoins='${(rows2[0].giraffeCoins * 1) + (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${recieverID}'`);
					conGiftUserCoins.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
					giftCoinsEmbed.setDescription(`<@${gifterID}> gifted user <@${recieverID}>, amount: ${amount}GC`);
				}
				message.channel.send(giftCoinsEmbed);
				bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(giftCoinsEmbed);
			});
		}
	});

	setTimeout(function(){
		conGiftUserCoins.destroy();
		conGiftUserCoins = null;
	},3000);
	return;
}

function gambleMoney(amount,message){
	var conGamble = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});
	conGamble.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
		if (isNaN(amount)){
			message.channel.send("Please enter a correct value!");
		}else if (amount > parseFloat(rows[0].giraffeCoins)){
			message.channel.send("You cannot gamble more than you have!");
		}else if (amount < 5){
			message.channel.send("You must gamble a minimum of 5 coins!");
		}else{
			let result = getRandomInt(30);
			if (result < 15){
				income = -0.7;
			}else if (result < 23){
				income = 1;
			}else if (result < 26){
				income = 1.2;
			}else if (result < 28){
				income = 1.4;
			}else if (result < 30){
				income = 2;
			}
			if ((income * amount) !== amount){
				conGamble.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
					conGamble.query(`update inventoryGT set giraffeCoins='${(((rows[0].giraffeCoins * 100) + (((income * amount) - amount) * 100)) / 100).toFixed(2)}' where ID='${message.author.id}'`);
				});
			}
			if (((income * amount) - amount).toFixed(2) < 0){
				conGamble.query(`SELECT * FROM inventoryGT WHERE ID='thereserve'`, (err,rows) =>{
					conGamble.query(`update inventoryGT set giraffeCoins='${Math.abs((((rows[0].giraffeCoins * 100) + ((income * amount) * 100)) / 100).toFixed(2))}' where ID='thereserve'`);
				});
			}
			let gambleEmbed = new Discord.MessageEmbed()
				.setTitle("Gamble")
				.setDescription(`Income: ${((income * amount) - amount).toFixed(2)}`)
				.setTimestamp();
			message.channel.send(gambleEmbed);	
		}
	});
	setTimeout(function(){
		conGamble.destroy();
		conGamble = null;
	},3000);
	return;
}

function konsole(stuff){
	console.log(stuff);
}

//WIP
function customizeShip(ID,args,message){
	var conCustomShip = mysql.createConnection({
		host : mysqlLoginData.host,
		user : mysqlLoginData.user,
		password : mysqlLoginData.password,
		database : mysqlLoginData.database,
	});

	conCustomShip.connect(err => {
		if(err) console.log(err);
	});

	conCustomShip.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
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
		conCustomShip.query(sql);
	});

	setTimeout(function(){
		conCustomShip.destroy();
		conCustomShip = null;
	},3000);
}

//Income Methods

function quizQuestions(message){
	let file = require("./datafile.json");
	var item = file.quizQuestions[Math.floor(Math.random() * file.quizQuestions.length)];
	if (item.format === "text"){
		textQuizQuestions(message,item);
	}
	cooldowns.quiz.allowed = false;
	setTimeout(function(){
		cooldowns.quiz.allowed = true;
	},cooldowns.quiz.timeoutLength);
	return;

}

async function textQuizQuestions(message,item){
	var filter = response => {
		return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
	};
	message.channel.send(item.question).then(() => {
		message.channel.awaitMessages(filter, {max: 1, time: (30000 * item.timeFactor), errors: ['time']})
			.then(collected => {
				message.channel.send(`${collected.first().author} got the correct awnser and have earned themselves ${20 * item.worthFactor}GC!`);
				giveUserMoney(20 * item.worthFactor, collected.first().author.id);
				filter = undefined;
				delete filter;
			})
			.catch(collected => {
				message.channel.send('Sadly, right now, is not the moment we find out the answer to this question.');
				filter = undefined;
				delete filter;
			});
	});
}

function specificQuiz(message,type){
	if (type === "flags"){}else if (type === "blackwake"){}else if (type === "science"){}else if (type === "sports"){}else if (type === "geography"){}else if (type === "show/music"){}else if (type === "music"){}else if (type === "tech"){}else {}
}
//Not yet complete

//bot.on("guildMemberAdd", function(member){
//	bot.channels.cache.get("440517167440461825").send(`Welcome to Great Tortuga traveller${member.user.username}! Come say hello in <#402118654248091678> ! We play various games and organise game nights, check out <#607491352598675457> to get access to those game channels. Feel free to join us and get involved! If you have any issues feel free to contact us using  <#619651226551713843>`);
//	member.roles.add("401925484952420362").catch(console.error);		
//	member.send("Thank you for joining Great Tortuga!\n"
//				+"\n"
//				+"Welcome to our Blackwake Community. There are some great people here, and we all play Blackwake! so don't be shy ;-)\n"
//				+"\n"
//				+"If you are not a fan of notifications.. It is advised that you adjust your discord notification settings to a 'mention only' status.\n"
//				+"\n"
//				+"We have a number of channels you can explore, so please feel free to get involved with us. A good place to start would be in our Blackwake-chat ;-)\n"
//				+"\n"
//				+"Make sure to have a look at our rules in the Information section.\n"
//				+"\n"
//				+"Happy Sailing out there!"
//				+"\n"
//				+"-Spartan");
//});


bot.on("ready", () => {
	console.log('Bot '+bot.user.username+' is ready!');

	setInterval(() =>{
		Status();
	}, 30000000);
	setInterval(() =>{
		displayBotInfo();
	}, 6000);

	setInterval(() =>{
		update7DTDlistNew();
	}, 25000);

	updateleaderboard();

	updateMClist();
	getSteamGroupData();

	setInterval(() =>{
		getSteamGroupData();
	}, 15000000);
	// setInterval(() =>{
	// 	GetAllGamesBeingPlayed(config.serverInfo.serverId);
	// }, 20000);
	LoadDataFromDatabase();

	setInterval(() =>{
		BwServerStatus();
	}, 3000);
	setInterval(() =>{
		ISSLocation();
	}, 10000);

	setInterval(() =>{
		displayRichestUsers();
	}, 3600000);
	updateShopWindow();

//	bot.channels.cache.get("").send("7DTD Server-status, getting updates.").then((msg)=>{
//		update7DTDlist(msg);
//	});
	return;
});

bot.on("message", async message => {
	//dont respond to bots
	if (message.author.bot) return;

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
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("Message: "+message.content+" , has been deleted. Author: "+message.author);
		}
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
			var con = mysql.createConnection({
				host : mysqlLoginData.host,
				user : mysqlLoginData.user,
				password : mysqlLoginData.password,
				database : mysqlLoginData.database,
			});

			con.connect(err => {
				if(err) console.log(err);
			});

			con.query(`SELECT * FROM xp WHERE id = '${message.author.id}'`, (err,rows) => {
				if(err) console.log(err);
				let sql;
				if(rows.length < 1){
					sql = `INSERT INTO xp (id,username,xp,level,canget) VALUES ('${message.author.id}','${btoa(message.author.username)}', ${genXp()}, 0, '"n"')`;
					con.query(sql);
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
						sql = `UPDATE xp SET xp = ${newxp}, level = ${level}, canget = '"n"' WHERE id = '${message.author.id}'`;
						con.query(sql);
						giveUserMoney(0.2,message.author.id);
					}
				}
			});

			setTimeout(function(){
				con.destroy();
				con = null;
			},3000);

			setTimeout(function(){
				var con = mysql.createConnection({
					host : mysqlLoginData.host,
					user : mysqlLoginData.user,
					password : mysqlLoginData.password,
					database : mysqlLoginData.database,
				});
				con.connect(err => {
					if(err) console.log(err);
				});
				con.query(`UPDATE xp SET canget = '"y"' WHERE id = '${message.author.id}'`);
				setTimeout(function(){
					con.destroy();
					con = null;
				},3000);
			}, 180000);
		}catch (e){
			console.log(e);
		}
	}

	//Old larry reference (RIP Larry)
	if (message.content.startsWith("...") && message.content.length === 3){
		message.react("452064991688916995");
	}

	let TrackingCommand = false;

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

	//MEMEZ
	if (command === "delete-administrators"){
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
	}

	if (command === "dox"){
		TrackingCommand = true;
		message.channel.send(`Doxing ${args.join(" ")}...`);
	}

	if (command === "magic"){
		TrackingCommand = true;
		message.channel.send("https://giphy.com/gifs/magical-KFNQuuT1qx7I4");
	}

	if (command === "pong"){
		TrackingCommand = true;
		message.react("🏓");
	}

	if (command === "execute"){
		TrackingCommand = true;
		if (typeof args[0] === undefined){
			message.channel.send("You need to say who to execute! 🤦");
		}else{
			message.channel.send(`Executing ${args[0]}\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`);
			TrackingCommand = true;
		}
	}

	//Play music from YT URL
	if (command === "playaudio"){
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
					.setThumbnail(`${message.author.displayAvatarURL}`)
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
	}

	//stop any currently playing audio
	if (command === "stopaudio"){
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
	}

	//Grab random song from datafile
	if (command === "randomsong"){
		TrackingCommand = true;
		let voiceChannel = message.member.voice.channel;
		if (!voiceChannel){ return; }
		else if (isPlaying){ return; }
		else if (!adjustableConfig.music.generalAudio){
			message.reply("That command is currently disabled, please ask an admin to re-enable it!");
		}else{
		let file = fs.readFileSync("./datafile.json").toString();
		file = JSON.parse(file);
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
	}

	//Does what it says on the tin
	if (command === "checknudity"){
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
	}

	//MEMEZ
	if (command === "inspire"){
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
	}

	//Translate ENG <-> RUS
	if (command === "translate"){
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
	}

	//XP Rand Cards
	if (command === "rankcard"){
		TrackingCommand = true;
		rankcardCreation(message);
	}

	//Lists all commands to you, depending on your roles
	if (command === "listcommands"){
		TrackingCommand = true;
		let embed = new Discord.MessageEmbed()
			.setTitle("Commands")
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
   			.addField(`Meme Commands`,` - France\n - Assemble\n - Memegen\n - Random\n - Insult\n - Trump\n - 8Ball\n - Execute\n - Frustration\n - Magic\n - Pong\n - Ping\n - Advice\n - yodish`,true)
   			.addField(`Music Commands`,` - PlayAudio\n - RandomSong`,true)
   			.addField(`Nerd Commands`,` - APOD\n - MarsWeather\n - NumTrivia\n - ExchangeRates\n - Jeanie`,true)
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
   				.setTimestamp();
   			message.author.send(Aembed); //Admins
   		}
	}

	//Provides info on how to use certain commands
	if (command === "help"){
		TrackingCommand = true;
		let supportedQueries = ["listcommands","list","memegen","random","apod","marsweather","rankcard","translate","exchangerates","today","urban","quote","yodish","dad","8ball","bwstats","payday2","trump"];
		if (args[0]){
			let term = args[0].toLowerCase();
			if (term === "listcommands"){
				message.channel.send("Sends you a list of all my commands that you can use :)");
			}else
			if (term === "list"){
				message.author.send(`Commands I can help with:\n ${supportedQueries.join("\n - ")}`);
				message.channel.send("Check your DM's ;)");
			}else
			if (term === "memegen"){
				message.channel.send("Currently available formats and the website version can be found at https://memegen.link/");
			}else
			if (term === "random"){
				message.channel.send("Why not try and find out?");
			}else
			if (term === "apod"){
				message.channel.send("Nasa's Astronomy Picture of the Day.");
			}else
			if (term === "marsweather"){
				message.channel.send("Get the weather data of several points on mars.\n"
					+" - av: Average of samples over the Sol (°F for AT; m/s for HWS; Pa for PRE)\n"
					+" - ct: Total number of recorded samples over the Sol\n"
					+" - mn: Minimum data sample over the sol (same units as av)\n"
					+" - mx: Maximum data sample over the sol (same units as av)\n");
			}else
			if (term === "rankcard"){
				message.channel.send("Display your rankcard");
			}else
			if (term === "translate"){
				message.channel.send("Use: `translate ru *words to translate*` to translate to russian.\nUse: `translate eu *words to translate*` to translate the words to english.");
			}else
			if (term === "exchangerates"){
				message.channel.send("Convert the currency you wish to another currency, a full list of supported currencies is at: https://www.exchangerate-api.com/docs/supported-currencies");
			}else
			if (term === "today"){
				message.channel.send("Usage of the command is as followed: `;today *term*`\nTerms Allowed are:\n - Events\n - Births\n - Deaths");
			}else
			if (term === "urban"){
				message.channel.send("Usage of the command is as followed: `;urban *word to search*`");
			}else
			if (term === "quote"){
				message.channel.send("Sends a random quote!");
			}else
			if (term === "yodish"){
				message.channel.send("Returns your words in yosidh format.");
			}else
			if (term === "dad"){
				message.channel.send("Get a dad quote!");
			}else
			if (term === "8ball"){
				message.channel.send("Get a yes/no awnser to your question!");
			}else
			if (term === "insult"){
				message.channel.send("insult whoever you wish!");
				message.react("🙊");
			}else
			if (term === "me"){
				message.channel.send("What can i help you with?");
				message.react("🤔");
			}else
			if (term === "bwstats"){
				message.channel.send("There are several actions for the blackwake command, currently the supported options are: `overview` `weaponstats` `shipstats` `maintenance` `shipweaponry`\nNote: requires your profile to be set to public!");
			}else
			if (term === "payday2"){
				message.channel.send("There are several actions for the payday2 command, currently the supported options are: `overview`\nNote: requires your profile to be set to public!");
			}else{
				if (term === "trump"){
					message.channel.send("Find out trumps opinion of the individual/group/company your specify!");
				}else{
					message.reply("That command currently either has no help section or is detailed in the commands list.");
					message.react("448435180286509066");
				}
			}
		}else{
			message.channel.send("I currently have help for:\n`"
				+`${supportedQueries.join("` `")}`+"`");
		}
	}

	//Urban dictionary
	if (command === "urban"){
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
  	}

  	//Fetch random quote
	if (command === "quote"){
		TrackingCommand = true;
		let file = fs.readFileSync("./datafile.json").toString();
		file = JSON.parse(file);
		message.channel.send(file.quotes[getRandomInt(file.quotes.length+1)]);
	}
	if (command === "8ball"){
		TrackingCommand = true;
		let option = getRandomInt(0,3);
		if (option === 0){
			message.channel.send("Yes");
		}else if (option === 1){
			message.channel.send("No");
		}else if (option === 2){
			message.channel.send("Im not sure 🤔");
		}
	}
	if (command === "dad"){
		TrackingCommand = true;
		let file = fs.readFileSync("./datafile.json").toString();
		file = JSON.parse(file);
		message.channel.send(file.dadjokes[getRandomInt(file.dadjokes.length+1)]);
	}

	//Random pingu doing Noot Noot gif
	if (command === "nootnoot"){
		TrackingCommand = true;
		let file = fs.readFileSync("./datafile.json").toString();
		file = JSON.parse(file);
		message.channel.send(file.nootnoot[getRandomInt(file.nootnoot.length+1)]);
	}

	//Returns input text in yodish format
	if (command === "yodish"){
		TrackingCommand = true;
		if (adjustableConfig.apis.yodish){
			yodish(message,args);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	////Custom commands
	if (command === "nerds"){
		if (message.member.roles.cache.has("639142448345513984")){
			TrackingCommand = true;
			message.channel.send("<@&639142448345513984> Assemble!");
		}
	}
	if (command === "cat"){
		TrackingCommand = true;
		Cat(message);
	}

	if (command === "dance"){
		if (levelchecker(message,3)){
			TrackingCommand = true;
			let file = fs.readFileSync('./datafile.json').toString();
			file = JSON.parse(file);
			let p = getRandomInt(file.Responses.dance.length);
			message.channel.send(file.Responses.dance[p]);
		}else{
    		message.reply("You are not a high enough level yet to use this command, you must be level 3, use ;rankcard to see your current level");
    	}
	}

	if (command === "trump"){
		fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
			message.channel.send(`${args.join(" ")} ${response.messages.personalized[getRandomInt(response.messages.personalized.length)]}`);
		});
	}

	//Gets a random video/image/gif from the datafile
	if (command === "random"){
		if (levelchecker(message,4)){
			TrackingCommand = true;
			let file = fs.readFileSync('./datafile.json').toString();
			file = JSON.parse(file);
			let p = getRandomInt(10);
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
		}else{
    		message.reply("You are not a high enough level yet to use this command, you must be level 4, use ;rankcard to see your current level");
    	}
	}

	if (command === "memegen"){
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
    }

	if (command === "insult"){
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
				let member = args.join(" ");
				let file = fs.readFileSync("./datafile.json").toString();
				file = JSON.parse(file);
				let insult = file.insults[getRandomInt(file.insults.length+1)].toString();
				try{
					if (typeof member === "undefined"){
						message.reply("Please ensure you have use the correct syntax.");
					}else{
						insult = insult.replace("TARGET",`${member}`);
						message.channel.send(insult);
					}
				}catch(e){
					message.reply("Please ensure you have use the correct syntax.");
				}
			}else{
				message.reply("Please enter a correct target. Please also refrain from insulting and pinging roles.");
			}
		}else{
			message.channel.send("You are not a high enough level yet to use this command, you must be level 7, use ;rankcard to see your current level");
		}
	}

	if (command === "playdie"){
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
	}

	if (command === "rolldie"){
		TrackingCommand = true;
		message.channel.send(getRandomInt(7));
	}

	if (command === "rollcustom"){
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
	}

	if (command === "coinflip"){
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
	}

	//Astronomy picture of the day
	if (command === "apod"){
		TrackingCommand = true;
		if (adjustableConfig.apis.apod){
			AstronomyPictureoftheDay(message);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	//Not working yet
	if (command === "marsweather"){
		//GetMarsWeatherData(message);
		message.channel.send("This command is currently not working :(");
	}

	if (command === "numtrivia"){
		TrackingCommand = true;
		if (adjustableConfig.apis.numTrivia){
			NumbersTrivia(message);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	if (command === "exchangerates"){
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
	}

	if (command === "advice"){
		TrackingCommand = true;
		if (adjustableConfig.apis.advice){
			Advice(message);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	if (command === "today"){
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
	}

	if (command === "jeanie"){
		TrackingCommand = true;
		if (adjustableConfig.apis.jeanie){
			jeanieAPI(message,args);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	if (command === "bacon"){
		TrackingCommand = true;
		if (adjustableConfig.apis.bacon){
			BaconIpsum(message);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	//Random Chuck norris
	if (command === "chuck"){
		TrackingCommand = true;
		if (adjustableConfig.apis.chuck){
			chuckNorrisAPI(message);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	//Look up meaning for a word
	if (command === "dictionary"){
		TrackingCommand = true;
		if (adjustableConfig.apis.dictionary){
			wordsAPI(message,args);
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	//Mute + unmute for mods
	if (command === "mute" && serverid === config.serverInfo.roles.serverModerator && adjustableConfig.misc.moderatorCommands){
		let member = message.guild.members.find('id',message.mentions.users.first().id);
		try{
			let awnser = rolecheckformutes(member, message);
			if (awnser){
				message.channel.send("You can't use this command.");
			}else{
				mute(member,message);
				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+member+" has been muted by "+message.member.user.username+".");
			}
		}catch(e){
			console.log(e);
			message.channel.send("error, please check you pinged an individual");
		}
	}

	if (command === "unmute" && serverid === "401924028627025920" && adjustableConfig.misc.moderatorCommands){
		let member = message.guild.members.find('id',message.mentions.users.first().id);
		try{
			let awnser = rolecheckformutes(member, message);
			if (awnser){
				message.channel.send("You can't use this command.");
			}else{
				unmute(member,message);
				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+member+" has been unmuted by "+message.member.user.username+".");
			}
		}catch(e){
			console.log(e);
			message.channel.send("Error, please check you pinged an individual.");
		}
	}

	if (command === "tempmute" && serverid === config.serverInfo.serverId && adjustableConfig.misc.moderatorCommands){
		let member = message.guild.members.find('id',message.mentions.users.first().id);
		if (member.roles.has(config.serverInfo.roles.serverModerator)){
			try{
				let awnser = rolecheckformutes(member, message);
				if (awnser){
					message.channel.send("You can't mute someone higher than, or at your current role.");
				}else{
					let go = false;
					if (typeof args[1] === "undefined"){
						time = 86400000;
						go = true;
					}else{
						try{
							time = parseInt(args[1]);
							go = true;
						}catch(e){
							message.channel.send("Please enter a correct number of hours.");
						}
					}
					if (go){
						let delay = (parseInt(args[1])*1000*60*60);
						mute(member,message);
						bot.channels.cache.get("512331083493277706").send("User: "+member+" has been temporarily muted for "+time+" hour(s) by "+message.member.user.username+".\n"
																	+"Reason: "+(args.slice(2)).join(" "));
						setTimeout(() => {
							unmute(member,message)
						}, delay);
					}
				}
			}catch(e){
				message.channel.send("Error, please check you pinged an individual/ used the command correctly.");
			}
		}else{
			message.channel.send("You cannot use this command");
		}	
	}

	if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){ // if moderator
		if (command === "warn"){
			let member = message.guild.members.find('id',message.mentions.users.first().id);
			try{
				member.send("Warning: "+(args.slice(1)).join(" ")+", You have been warned");
			}catch(e){
				message.reply("This isnt working currently.");
			}
		}
		if (command === "totalusers"){
			message.channel.send(message.guild.members.filter(member => !member.user.bot).size);
		}
		if (command === "userinfo"){

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

				displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar);

			}else{
				if (!message.mentions.users.size) {
					message.reply('You need to ping member to get their info!');
				}else{
					userInformation = bot.guilds.cache.get(message.guild.id).cache.members.get(getUserFromMention(args[0]).id);	

					userID = userInformation.user.id;

					let usertimestamp = (new Date(userInformation.user.createdTimestamp)).toString().split(" ");
					userCreatedAt = `${usertimestamp[2]}/${usertimestamp[1]}/${usertimestamp[3]}\n${usertimestamp[4]} CEST`;

					let temp = (new Date(userInformation.joinedTimestamp)).toString().split(" ");
					userJoinedAt = `${temp[2]}/${temp[1]}/${temp[3]}\n${temp [4]} CEST`;

					avatar = userInformation.user.displayAvatarURL;

					serverDeaf = userInformation.serverDeaf;
					serverMute = userInformation.serverMute;

					displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar);
				}
			}
		}
		if (command === "savequote"){
			if (typeof args[0] !== null && Number.isInteger(parseInt(args[0]))){
				saveQuote(message.channel,args[0]);
				message.reply("Done!");
			}else{
				message.reply("Please make sure you have entered the correct message ID :)");
			}
		}
	}

	if (command === "botinfo" && (message.author.id === "337541914687569920" || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator))){ // if archie or admin
			let totalSeconds = (bot.uptime / 1000);
			let days = Math.floor(totalSeconds / 86400);
			let hours = Math.floor(totalSeconds / 3600);
			totalSeconds %= 3600;
			let minutes = Math.floor(totalSeconds / 60);
			let seconds = (totalSeconds % 60).toString();
			seconds = seconds.slice(0,seconds.indexOf(".") + 3);

			hours -= days * 24;
			let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
			let ramusage = (parseInt(process.memoryUsage().rss) * (10**-6) ).toString();
			ramusage = ramusage.slice(0,ramusage.indexOf(".") + 3);

			let botInfo = new Discord.MessageEmbed()
				.addField(`Stats`,`Uptime: ${uptime}\nRam: ${ramusage}MB\nPlaying Audio: ${isPlaying}`)
				.setTimestamp();

			message.channel.send(botInfo);
	}


	if (message.member.roles.cache.has("665939545371574283")){  // if admin
		if (command === "ban"){
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
		}	
		//Gets info about server command is sent in
		if (command === "serverinfo"){
			let features = "";
			if (!(message.guild.features.length > 0)){
				features = "-";
			}else{
				features = message.guild.features.join(", ");
			}
			let booster_role = message.guild.members.filter(m => m.roles.has(config.serverInfo.roles.serverbooster));
			let serverinfo = new Discord.MessageEmbed()
								.setColor('#00008b')
								.setTitle(`${message.guild.name}`)
								.setDescription(`Server Information`)	
								.addField('Basic', `Owner: ${message.guild.owner}\nDescription: ${message.guild.description}\nCreated on: ${message.guild.createdAt}\nAcronym: ${message.guild.nameAcronym}\nRegion: ${message.guild.region}\nID: ${message.guild.id}`)
								.addField('Total Members', `Real People: ${message.guild.members.filter(member => !member.user.bot).size}\nBots: ${message.guild.members.filter(member => member.user.bot).size}`)
								.addField('Additional Info', `Number of Roles:\nNumber of Bans:\nMFA Level Required:\nNumber of Webhooks:\nDefault Message Notifications:`,true)
								.addField('-----', `${message.guild.roles.size}\n${await message.guild.fetchBans().then(result => {return result.size})}\n${message.guild.mfaLevel}\n${await message.guild.fetchWebhooks().then(result => {return result.size})}\n${message.guild.defaultMessageNotifications}`,true)
								.addField('Nitro', `Boosters: ${booster_role.size}\nLevel: ${message.guild.premiumTier}\nVanity URL: ${message.guild.vanityURLCode}`,)
								.addField('Number of Channels', `Categories: ${message.guild.channels.filter(channel => channel.type === "category").size}\nText: ${message.guild.channels.filter(channel => channel.type === "text").size}\nVoice: ${message.guild.channels.filter(channel => channel.type === "voice").size}`,true)
								.addField('Verification', `Level: ${message.guild.verificationLevel}\nStatus: ${message.guild.verified}`,true)
								.addField('Emoji Count', `${message.guild.emojis.size}`,true)
								.addField('Explicit content filter level', `${message.guild.explicitContentFilter}`,true)
								.addField('Features', `${features}`)
								.addField('AFK', `Channel: ${message.guild.afkChannel}\nTimeout: ${message.guild.afkTimeout}sec`,true)
								.setImage(`${message.guild.iconURL}`)
								.setTimestamp();
			message.channel.send(serverinfo);
		}
		//Gets info about channel commmand is sent in
		if (command === "channelinfo"){
			let channelinfo = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle(`${message.channel.name}`)
							.setAuthor(`Channel Info`)
							.addField('Type', `${message.channel.type}`,true)
							.addField('Created', `${message.channel.createdAt}`,true)
							.addField('Amount of people that can view', `${message.channel.members.size} / ${message.guild.members.size}`,true)
							.addField('Nsfw', `-${message.channel.nsfw}`,true)
							.addField('Category', `-${message.channel.parent}`,true)
							.addField('Last Pin', `-${message.channel.lastPinAt}`,true)
							.addField('Topic', `-${message.channel.topic}`,true)
							.addField('Currently being typed in', `${message.channel.typing}`,true)
							.setTimestamp();
			message.channel.send(channelinfo);
		}

	}

	//restarts the bot
	if (command === "restart"){
		if (message.author.id === "337541914687569920"){
			await message.channel.send("Restarting....");
			process.exit();
		}
	}
	
	if (command === "underground"){
		if (message.guild.id === "341261290607607818"){
			underground(message);
		}
		else{
			message.reply("Im sorry, your too much of a normie to use this command.");
		}
	}

	//VERY DANGEROUS, GIVE ACCESS TO WITH CAUTION
	//Allows you to run code through a single command
	if (command === "do"){
		if (message.author.id === "337541914687569920"){
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
		}
	}

	if (command === "payday2"){
		TrackingCommand = true;
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
	}

	if (command === "blackwake"){
		TrackingCommand = true;
		if (adjustableConfig.apis.blackwake){
			if (!args){
				message.reply("Please enter the valid terms!");
			}else
			if (args.length < 2){
				message.reply("Please enter the valid terms!");
			}else{
				getBlackwakeStats(message,args);
			}
		}else{
			message.reply("That command is currently disabled!");
		}
	}

	//If command is being tracked, update table
	if (TrackingCommand && adjustableConfig.misc.trackingCommandUsage){
		var conCheckIfInTable = mysql.createConnection({
			host : mysqlLoginData.host,
			user : mysqlLoginData.user,
			password : mysqlLoginData.password,
			database : mysqlLoginData.database,
		});
			
		conCheckIfInTable.connect(err => {
			if(err) console.log(err);
		});

		conCheckIfInTable.query(`SELECT * FROM commandUsageOliverBot WHERE command = '${command}'`, (err,rows) => {
			if(err) console.log(err);
			let sql;
			if(rows.length < 1){
				sql = `INSERT INTO commandUsageOliverBot (command,TimesUsed) VALUES ('${command}',1)`;
				conCheckIfInTable.query(sql);
			} else {
				let used = parseInt(rows[0].TimesUsed) + 1;
				sql = `UPDATE commandUsageOliverBot SET TimesUsed = ${used} WHERE command = '${command}'`;
				conCheckIfInTable.query(sql);
			}
		});

		setTimeout(function(){
			conCheckIfInTable.end();
			conCheckIfInTable = null;
		},3000);
		TrackingCommand = false;
	}

	/////Custom Commands
	customCommands(message,command);
	permanentCommands(message,command);

	if (command === "createcommand"){
		if (message.member.roles.cache.has("615214073843548163")){
			createCustomCommands(message,args);
			message.reply("Your command is ready to go!");
		}else{
			message.reply("You do not have permission to use this!");
		}
	}

	if (command === "deletecommand"){
		if (message.member.roles.cache.has("615214073843548163")){
			deleteCustomCommands(message,args[0]);
			message.reply("Command deleted!");
		}else{
			message.reply("You do not have permission to use this!");
		}
	}

	//Reaction Role Commands
	if (command === "createrole"){
		if (args.length > 2){
			message.channel.send("Please use the following format:\n `;createrole <emoji> <role ping>`");
		}else{
			if (message.member.roles.cache.has("665939545371574283")){
				if (args[0].indexOf(":") !== -1){
					createReactionRole(message,args[0].split(":")[1],args[1].slice(3,args[1].length - 1));
				}else{
					createReactionRole(message,args[0],args[1].slice(3,args[1].length - 1));
				}
			}else{
				message.reply("You don't have permission to use this command!");
			}
		}
	}
	if (command === "deleterole"){
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
	}

	//Economy System
	if (command === "purchase"){
		if (args[0] && args.length < 2){
			purchaseItem(message.author.id,args[0],message);
		}else{
			message.channel.send("Please enter the correct format:\n`;purchase` `Item To Purchase`\nTo search for an item to get the purchasing info use the `;search` command!");
		}
	}

	if (command === "search"){
		if (args){
			searchForItem(args,message);
		}else{
			message.channel.send("Please enter the correct format:\n`;search` `Item Name`");
		}
	}

	if (command === "sell"){
		if (args[0] && args.length < 2){
			sellItem(message.author.id,args[0],message);
		}else{
			message.channel.send("Please enter the correct format:\n`;sell` `Item Name`");
		}
	}

	if (command === "inventory"){
		if (args.length < 1){
			listInventory(message.author.id,message);
		}else{
			message.channel.send("Please enter the correct format:\n`;inventory`");
		}
	}

	if (command === "giftcoins"){
		if (args.length < 3){
			let user = getUserFromMention(args[0]);
			giftUserCoins(message.author.id,user.id,args[1],message);
			user = null;
		}else{
			message.channel.send("Please enter the correct format:\n`;giftCoins` `@userToGiftTo` `amount`");
		}
	}

	//Income Methods
	if (command === "gamble"){
		if (args[0] && (args.length === 1)){
			gambleMoney(args[0],message);
		}else{
			message.channel.send("Please use the correct format! `;gamble` `amount`");
		}
	}

	if (command === "beg"){
		let num = getRandomInt(300);
		if (num == 243){
			let amount = getRandomInt(20);
			giveUserMoney(parseFloat(amount).toFixed(2) * 1);
			message.channel.send(`Considering how desperate you are, I think I can spare you ${amount}GC, consider yourself lucky.`);
		}else{
			let file = fs.readFileSync('./datafile.json').toString();
			file = JSON.parse(file);
			let p = getRandomInt(file.responses.beg.length);
			message.channel.send(file.repsonses.beg[p]);
		}
	}

	if (command === "quiz"){
		if (cooldowns.quiz.allowed){
			quizQuestions(message);
		}else{
			message.channel.send(`Please wait, this command is currently on a ${parseInt(cooldowns.quiz.timeoutLength / 1000)}sec cooldown.`);
		}
	}

	//Archiving Tickets
	//if (command === ""){}

	/////ADMIN CONFIG AREA
	if (command === "config"){
		if (message.member.roles.cache.has("665939545371574283")){
			if (args.length > 2){
				message.reply("Please ensure you enter the correct number of arguments!");
			}else{
				updateDBConfig(message,args);
			}
		}else{
			message.reply("You don't have permission to use this!");
			message.react("690144528312696969");
		}
	}

	return;
});

//Pure Logging of events
bot.on('raw', async event => {
	if (["CHANNEL_CREATE","CHANNEL_DELETE","CHANNEL_PINS_UPDATE","GUILD_BAN_ADD","GUILD_BAN_REMOVE","GUILD_BAN_REMOVE","GUILD_MEMBER_REMOVE","GUILD_ROLE_CREATE","GUILD_ROLE_DELETE","MESSAGE_REACTION_ADD","MESSAGE_REACTION_REMOVE","MESSAGE_DELETE"].indexOf(event.t) === -1){
		return;
	}else
    if ((event.t === "MESSAGE_REACTION_REMOVE" || event.t === "MESSAGE_REACTION_ADD") && parseInt(event.d.channel_id) !== 607491352598675457 && adjustableConfig.reactions.reactionMenu){
        return; 
    }	
	if (event.t === "CHANNEL_CREATE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let channel = bot.channels.cache.get(event.d.id);
		if (channel.type !== 'dm'){
			let CCembed = new Discord.MessageEmbed()
				.setColor(0x013220)
				.setTitle("Channel Created")
				.addField("Info:",`Name: ${event.d.name}\n<#${event.d.id}>`)
				.setTimestamp();
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(CCembed);
		}else{
			return;
		}
	}else
	if (event.t === "CHANNEL_DELETE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		if (event.d.type === 0){ //text
			let Cembed = new Discord.MessageEmbed()
  				.setTitle("Text Channel Deleted")
  				.setColor(0x013220)
  				.setTimestamp()
  				.addField(`Name:`,`${event.d.name}`,true)
  				.addField(`ID:`,`${event.d.id}`,true)
 				.setTimestamp();
    		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(Cembed);
    		Cembed = null;
		}
		else if (event.d.type === 2){ //voice
    		let Cembed = new Discord.MessageEmbed()
  				.setTitle("Voice Channel Deleted")
  				.setColor(0x013220)
  				.setTimestamp()
  				.addField(`Name:`,`${channel.name}`,true)
  				.addField(`ID:`,`${channel.id}`,true)
 				.setTimestamp();
    		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(Cembed);
    		Cembed = null;
		}
		else if (event.d.type === 4){ //category
    		let Cembed = new Discord.MessageEmbed()
  				.setTitle("Category Deleted")
  				.setColor(0x013220)
  				.setTimestamp()
  				.addField(`Name:`,`${channel.name}`,true)
  				.addField(`ID:`,`${channel.id}`,true)
 				.setTimestamp();
    		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(Cembed);
    		Cembed = null;
		}
		else{
			console.log("Channel Deleted");
			console.log(channel);
		}
	}else
	if (event.t === "CHANNEL_PINS_UPDATE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let pinsEmbed = new Discord.MessageEmbed()
			.setTitle(`Message Pinned`)
			.setDescription(`Channel: <#${event.d.channel_id}>\nID: ${event.d.channel_id}`);
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(pinsEmbed);
	}else
	if (event.t === "GUILD_BAN_ADD"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
  		if (entry.createdTimestamp > (Date.now() - 5000)){
  			let embed = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle("User Banned")
						.addField("User",`${entry.target}`)
						.addField("Executor",`${entry.executor}`)
						.addField("Reason",`${entry.reason}`)
						.setThumbnail(`${entry.target.displayAvatarURL}`)
						.setTimestamp();
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(embed);
		}
		entry = null;
	}else
	if (event.t === "GUILD_BAN_REMOVE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
  		let embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle("User UnBanned")
			.addField("User",`${entry.target}`)
			.addField("Executor",`${entry.executor}`)
			.setThumbnail(`${entry.target.displayAvatarURL}`)
			.setTimestamp();
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(embed);
	}else
	if (event.t === "GUILD_MEMBER_REMOVE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		try{
			let entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				let embed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle("User Kicked")
					.addField("User",`${entry.target}`)
					.addField("Executor",`${entry.executor}`)
					.addField("Reason",`${entry.reason}`)
					.setThumbnail(`${entry.target.displayAvatarURL}`)
					.setTimestamp();
				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(embed);
			}
		}catch(e){
			console.log("Someone left :(");
		}
	}else
	if (event.t === "GUILD_ROLE_CREATE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let roleCreateEmbed = new Discord.MessageEmbed()
			.setTitle("Role Created")
			.addField("Role:",`${event.d.role.name}\n<@&${event.d.role.id}>`)
			.setTimestamp();
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(roleCreateEmbed);
	}else
	if (event.t === "GUILD_ROLE_DELETE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
		if (entry.createdTimestamp > (Date.now() - 5000)){
			let roleDeleteEmbed = new Discord.MessageEmbed()
				.setTitle("Role Deleted")
				.setDescription(`${entry.changes[0].old}\nby: ${entry.executor}`)
				.setTimestamp();
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(roleDeleteEmbed);
		}
	}else
	if (event.t === "MESSAGE_REACTION_ADD"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
		reactionRoles.forEach(roleInfo => {
			if (event.d.emoji.name === roleInfo.EmojiName){ //ECO
				let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
				member.roles.add(role);
			}
		});
	}else
	if (event.t === "MESSAGE_REACTION_REMOVE"){
		if (event.d.guild_id !== config.serverInfo.serverId) return;
		let member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
		reactionRoles.forEach(roleInfo => {
			if (event.d.emoji.name === roleInfo.EmojiName){ //ECO
				let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
				member.roles.remove(role);
			}
		});
	}else{
		return;
	}
	event = undefined;
	delete event;
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
bot.on("warn", (e) => console.warn(e));

bot.on("messageDelete", function(message){
	if (message.channel.id === "562013905426317322" || message.channel.id === "522864242626658305") return;
	let msgDeleteEmbed = new Discord.MessageEmbed()
		.setTitle(`${message.author}`)
		.setDescription(`${message.content}`)
		.setFooter(`From: ${message.channel}`)
		.setTimestamp();
    bot.channels.cache.get("732318686186045440").send(msgDeleteEmbed);
    message = null;
});


bot.login(config.token);