const commandHandler = require("./../../commandHandler");
const db = require("./../../startup/database");
const fs = require("fs");
const { ADMINISTRATOR } = require("./../../structs/roles");
const config = require("./../../config");

let bot;

function loopOverFolders(root,folder,commandToFind){
	let commandNotFound = true;
	fs.readdirSync(root + folder).forEach((file) => {

		let path = root + folder + "/" + file;

		if (fs.statSync(path).isDirectory()){
			let commandNotFound = loopOverFolders(root,folder + "/" + file,commandToFind);
		}

		if (file.startsWith("_") || !file.endsWith(".js")) return;

		delete require.cache[path];

		let command = require(path);

		if (command.name === commandToFind){
			if (typeof(command.init) === 'function'){
				command.init(bot);
			}
			bot.commands[command.name.toLowerCase()] = command;
			commandNotFound = false;
			console.log("Found command: " + command.name);
		}
	});

	if (commandNotFound){
		db.configurationDatabaseConnectionPool.query(`SELECT * FROM CustomCommands`, (err,rows) => {
			for (let i = 0; i < rows.length; i++){
				if (rows[i].command === commandToFind){
					let command = {
						name: rows[i].command,
						category: "Custom",
						execute: (message,args) => {
							message.channel.send(rows[i].response);
						}
					}
					bot.commands[commandToFind] = command;
					commandNotFound = false;
				}
			}
		});
	}

	return commandNotFound;
}

module.exports ={
	name: "reload",
	args: [0,1],
	help: "Reloads a given command, or if none given, reloads all.",
	roles: [ ADMINISTRATOR ],
	users: [ config.ownerId ],
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (args.length < 1){
			commandHandler.init(bot);
		}else if (bot.commands[args[0]]){
			let root = process.cwd();
			let folder = "/commands";
			let notFound = loopOverFolders(root, folder, args[0]);
			if (!notFound){
				message.channel.send("Command reloaded!");
			}else{
				message.channel.send("Command not found.");
			}
		}else{
			message.channel.send("Command not found.");
		}
	}
}