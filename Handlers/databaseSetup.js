const mysql = require("mysql");
const config = require("./../config.json");
const Discord = require("discord.js");
const adminCommands = require("./adminOnly");
const main = require("./../oliverbot");
const economy = require("./economySystem");
const btoa = require("btoa");

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

var alternionConnectionPool = mysql.createPool({
	connectionLimit : 30,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : "Alternion"
});

var xpdetails = {
	"max" : 0
}

const adjustableConfig = {
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

let customCommandList;
let miniCommands;
let reactionRoles;

exports.adjustableConfig = adjustableConfig;

exports.customCommandList = customCommandList;
exports.miniCommands = miniCommands;
exports.reactionRoles = reactionRoles;

exports.adjustableConfig = adjustableConfig;

exports.xpdetails = xpdetails;

exports.configurationDatabaseConnectionPool = configurationDatabaseConnectionPool;
exports.alternionConnectionPool = alternionConnectionPool;
exports.mainDatabaseConnectionPool = mainDatabaseConnectionPool;

exports.setupDatabase = function setupDatabase(){
	loadXpDataFromDB();
	loadConfigFromDB();
	loadPermanentCommandsFromDB();
	loadCustomCommandsFromDB();
	loadReactionRolesFromDB();
	setTimeout(function(){
		main.initDBStuff();
	},6000);
}

function loadXpDataFromDB(){
	configurationDatabaseConnectionPool.query(`SELECT * FROM xpGainData`, (err,rows) =>{
		if (rows.length < 1){
			return;
		}else{
			for (i=0;i<rows.length;i++){
				xpdetails[`${rows[i].factorName}`] = rows[i].val;
			}
		}
	});
}

function loadConfigFromDB(){
	configurationDatabaseConnectionPool.query(`SELECT * FROM config`, (err,rows) => {
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
}

exports.loadConfigFromDB = loadConfigFromDB;

function checkIfBool(toCheck){
	let val = false;
	if (toCheck.toLowerCase() === 'true'){
		val = true;
	}
	return val;
}

exports.levelChecker = function levelChecker(msg,reqlvl){
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
		//displayRichestUsers();
	});
}

exports.giveUserMoney = giveUserMoney;

exports.handler = function handler(message,command,args){
	if (!customCommands(message,command)){
		if (!permanentCommands(message,command)){
			return false;
		}
	}
	return true;
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
	adminCommands.displayReactionRoles();
}

function customCommands(message,command){
	if (customCommandList.length < 1){return false;}
	else{
		for (i=0;i<customCommandList.length;i++){
			if (customCommandList[i].command === command){
				message.channel.send(customCommandList[i].response);
				return true;
			}
		}
	}
	return false;
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
}

exports.updateNWordCounter = function updateNWordCounter(message){
	mainDatabaseConnectionPool.query(`SELECT * FROM nWordCount WHERE ID='${message.author.id}'`, (err,rows, fields) => {
		if (rows.length === 0){
			mainDatabaseConnectionPool.query(`INSERT INTO nWordCount VALUES ('${message.author.id}', '1', '${message.guild.id}')`);
		}else{
			mainDatabaseConnectionPool.query(`UPDATE nWordCount SET counter='${parseInt(rows[0].counter) + 1}' WHERE ID='${message.author.id}'`);
		}
	});
}

exports.updateTracking = function updateTracking(command){
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
}

exports.xpGainHandler = function xpGainHandler(message){
	try{
		if (!message.content.startsWith(";work")){
			mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${message.author.id}'`, (err,rows) => {
				if(err) console.log(err);
				let sql;
				if(rows.length < 1){
					sql = `INSERT INTO xp (id,username,xp,level,canget,message_count) VALUES ('${message.author.id}','${btoa(message.author.username)}', ${economy.genXp()}, 0, '"n"', '1')`;
					mainDatabaseConnectionPool.query(sql);
				} else {
					let eligible = rows[0].canget;
					if (eligible === '"y"'){
						let level = parseInt(rows[0].level);
						let newxp = parseInt(rows[0].xp) + economy.genXp();
						let go = economy.levelsystem(newxp,level);
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
		}
	}catch (e){
		console.log(e);
	}
}