const mysql = require("mysql");
const config = require("./../config.json");
const Discord = require("discord.js");
const adminCommands = require("./adminOnly");

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

var customCommandList = [];
var miniCommands = [];
var reactionRoles = [];

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
}

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
}

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

exports.giveUserMoney = function giveUserMoney(amount,ID){
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