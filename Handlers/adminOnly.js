const db = require("./databaseSetup");
const glob = require("./globalFunctions");
const Discord = require("discord.js");
const { bot } = require("./../oliverbot.js");
const config = require("./../config.json");

exports.handler = function handler(message,command,args){
	if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
		switch (command){
			case "config":
				updateDBConfig(message,args);
				break;
			case "nwordcount":
				getNwordCount(message,args);
				break;
			case "createrole":
				createRole(message,args);
				break;
			case "deleterole":
				deleteRole(message,args);
				break;
			case "refreshroles":
				displayReactionRoles();
				break;
			case "botinfo":
				displayBotInfo(message,args);
				break;
		}
	}else{
		message.channel.send(issueEmbed.grabEmbed(0,null));
	}
}

async function updateDBConfig(message,args){

	let commandName = args[0];
	let newValue = args[1];

	await db.configurationDatabaseConnectionPool.query(`SELECT * FROM config`, (err,rows, fields) =>{
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
				db.configurationDatabaseConnectionPool.query(`update config set currentval='${newValue}' where name='${commandName}'`, (err) => {
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

	db.loadConfigFromDB();
}

function getNwordCount(message,args){
	if (Array.isArray(args)){
		try
		{
			let user;
			if (isNaN(parseInt(args[0]))){
				user = glob.getUserFromMention(args[0]);
			}
			mainDatabaseConnectionPool.query(`SELECT * FROM nWordCount WHERE ID='${user.id}'`, (err,rows, fields) => {
				if (rows.length === 0){
					message.channel.send("This user has not said the NWord yet.");
				}else{
					let nWordEmbed = new Discord.MessageEmbed()
						.setTitle("N Word Count")
						.setDescription(`User ${user.username} has said the N word ${rows[0].count} times!`);
					message.channel.send(nWordEmbed);
				}
			});
		}catch(e)
		{
			message.channel.send("Please ensure you entered the user correctly.");
		}
	}else{
		message.channel.send("Please ensure you entered a user.");
	}
}

function createRole(message,args){
	if (args[0].indexOf(":") !== -1){
		let emojiID = args[0].split(":")[2].toString();
		emojiID = emojiID.slice(0, emojiID.length - 1);
		configurationDatabaseConnectionPool.query(`insert into reactionRoles values ('${args[0].split(":")[1]}' , '${emojiID}' , 'NA' , '${args[1].slice(3,args[1].length - 1)}' )`);
	}else{
		configurationDatabaseConnectionPool.query(`insert into reactionRoles values ('${args[0]}' , 'NA' , 'unicode' , '${args[1].slice(3,args[1].length - 1)}' )`);
	}
	db.loadReactionRolesFromDB();
	message.channel.send("Role added!");
}

function deleteRole(message,args){
	if (args[0].indexOf(":") !== -1){
		deleteReactionRole(message,args[0].split(":")[1]);
		configurationDatabaseConnectionPool.query(`delete from reactionRoles where emojiName='${args[0].split(":")[1]}'`);
	}else{
		deleteReactionRole(message,args[0]);
		configurationDatabaseConnectionPool.query(`delete from reactionRoles where emojiName='${args[0]}'`);
	}
	db.loadReactionRolesFromDB();
	message.channel.send("Role removed!");
}

exports.displayReactionRoles = function displayReactionRoles(){
	db.mainDatabaseConnectionPool.query('SELECT * FROM reactionRoleMessages', (err,rows, fields) => {
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
				db.mainDatabaseConnectionPool.query(`INSERT INTO reactionRoleMessages VALUES (${rows[0].channelID} ${newMsgs[i]})`);
			}
		}

	});
}

function displayBotInfo(message,args){
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
}