const db = require("./../_databaseSetup");

module.exports = {
	name: "deletecommand",
	args: 1,
	help: "Deletes a command",
	roles: ["440514569849536512"],
	execute: (message,args) => {
		let commandToDelete = "";
		if (Array.isArray(args)){
			commandToDelete = args[0];
		}else{
			commandToDelete = args;
		}
		db.configurationDatabaseConnectionPool.query(`delete from CustomCommands where command='${commandToDelete}'`);
		setTimeout(function(){
			db.loadCustomCommandsFromDB();
		}, 1000);
		message.reply("Command deleted!");
	}
}