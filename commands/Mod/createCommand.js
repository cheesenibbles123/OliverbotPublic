const db = require("./../_databaseSetup");
let bot;

module.exports = {
	name: "createcommand",
	args: 2,
	help: "Creates a command",
	roles: ["440514569849536512"],
	category: "Mod",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (bot.commands[args[0]]){
			message.channel.send("That command already exists!");
		}else{
			db.configurationDatabaseConnectionPool.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
			let command = {
				name: args[0],
				execute: (message,args) => {
					message.channel.send(args.slice(1));
				}
			}
			bot.commands[args[0]] = command;
			message.reply("Your command is ready to go!");
		}
	}
}