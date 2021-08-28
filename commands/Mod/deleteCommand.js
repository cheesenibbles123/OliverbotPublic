const db = require("./../../startup/database.js");
const { MODERATOR } = require("./../../structs/roles");

module.exports = {
	name: "deletecommand",
	args: 1,
	help: "Deletes a command",
	roles: [ MODERATOR ],
	category: "Mod",
	execute: (message,args) => {
		let commandToDelete = "";
		if (Array.isArray(args)){
			commandToDelete = args[0];
		}else{
			commandToDelete = args;
		}
		if (bot.commands[commandToDelete]){
			db.configurationDatabaseConnectionPool.query(`DELETE FROM CustomCommands WHERE command='${commandToDelete}'`);
			delete bot.commands[commandToDelete];
			message.reply("Command deleted!");
		}else{
			message.channel.send("That command does not exist.");
		}
	}
}