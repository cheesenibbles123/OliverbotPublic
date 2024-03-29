const db = require("./../../startup/database.js");
const { MODERATOR } = require("./../../structs/roles");

let bot;

module.exports = {
	name: "createcommand",
	args: 2,
	help: "Creates a command",
	roles: [ MODERATOR ],
	category: "Mod",
	guildOnly: true,
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (bot.commands[args[0]]){
			message.channel.send("That command already exists!");
		}else{
			db.configurationDatabaseConnectionPool.query(`INSERT INTO CustomCommands VALUES ('${args[0]}' , '${args.slice(1)}' )`, (err) => {
				if (err) return console.log(err);
				let command = {
					name: args[0],
					help: "Custom Command",
					category: "Custom",
					execute: (message,content) => {
						message.channel.send(args.slice(1).join(' '));
					}
				}
				bot.commands[args[0]] = command;
				message.reply("Your command is ready to go!");
			});
		}
	}
}