const db = require("./../../startup/database.js");

module.exports = {
	name: "deletecommand",
	args: 1,
	help: "Deletes a command",
	roles: ["440514569849536512"],
	category: "Mod",
	execute: (message,args) => {
		let commandToDelete = "";
		if (Array.isArray(args)){
			commandToDelete = args[0];
		}else{
			commandToDelete = args;
		}
		if (bot.commands[commandToDelete]){
			db.configurationDatabaseConnectionPool.query(`delete from CustomCommands where command='${commandToDelete}'`);
			delete bot.commands[commandToDelete];
			message.reply("Command deleted!");
		}else{
			message.channel.send("That command does not exist.");
		}
	}
}