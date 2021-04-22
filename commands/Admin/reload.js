const commandHandler = require("./../../commandHandler.js");
const db = require("./../_databaseSetup.js");

let bot;

function loopOverFolders(commandToFind){
	let commandNotFound = true;

	fs.readdirSync(__dirname + folder).forEach((file) => {

		if (fs.statSync(__dirname + folder + "/" + file).isDirectory()){
			loopOverFolders(folder + "/" + file);
		}

		if (file.startsWith("_") || !file.endsWith(".js")) return;
		let command = require(__dirname + folder + "/" + file);

		if (command.name === commandToFind){
			if (typeof(command.init) === 'function'){
				command.init(bot);
			}
			bot.commands[command.name.toLowerCase()] = command;
			commandNotFound = false;
		}
	});

	if (commandNotFound){
		db.configurationDatabaseConnectionPool.query(`SELECT * FROM CustomCommands`, (err,rows) => {
			for (let i = 0; i < rows.length; i++){
				if (rows[i].command === commandToFind){
					let command = {
						name: rows[i].command,
						execute: (message,args) => {
							message.channel.send(rows[i].response);
						}
					}
					bot.commands[commandToFind] = command;
				}
			}
		});
	}
}

module.exports ={
	name: "reload",
	args: [0,1],
	help: "Reloads a given command, or if none given, reloads all.",
	roles: ["665939545371574283"],
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		if (args.length < 1){
			commandHandler.init(bot);
		}else if (bot.commands[args[0]]){
			loopOverFolders();
		}else{
			message.channel.send("Command not found");
		}
	}
}