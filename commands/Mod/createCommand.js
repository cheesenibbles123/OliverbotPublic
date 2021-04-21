const db = require("./../_databaseSetup");

module.exports = {
	name: "createcommand",
	args: 2,
	help: "Creates a command",
	roles: ["440514569849536512"],
	category: "Mod",
	execute: (message,args) => {
		db.configurationDatabaseConnectionPool.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
		setTimeout(function(){
			db.loadCustomCommandsFromDB();
		}, 1000);
		message.reply("Your command is ready to go!");
	}
}