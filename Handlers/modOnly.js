const issueEmbed = require("./issueEmbed");
const config = require("./../config.json");
const db = require("./databaseSetup");

exports.handler = function handler(message,command,args){
	if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator)){
		switch (command){
			case "createcommand":
				createCommand(message,args);
				break;
			case "deletecommand":
				deleteCommand(message,args);
				break;
		}
	}else{
		message.channel.send(embedGrabber.grabEmbed(0,null));
	}
}

function createCommand(message,args){
	configurationDatabaseConnectionPool.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
	setTimeout(function(){
		db.loadCustomCommandsFromDB();
	}, 1000);
	message.reply("Your command is ready to go!");
}

function deleteCommand(message,args){
	let commandToDelete = "";
	if (Array.isArray(args)){
		commandToDelete = args[0];
	}else{
		commandToDelete = args;
	}
	configurationDatabaseConnectionPool.query(`delete from CustomCommands where command='${commandToDelete}'`);
	setTimeout(function(){
		db.loadCustomCommandsFromDB();
	}, 1000);
	message.reply("Command deleted!");
}