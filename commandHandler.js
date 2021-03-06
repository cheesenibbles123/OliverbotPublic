const fs = require('fs');
const db = require('./commands/_databaseSetup.js');
let bot;

function loopOverFolders(folder){
	fs.readdirSync(__dirname + folder).forEach((file) => {

		if (fs.statSync(__dirname + folder + "/" + file).isDirectory()){
			loopOverFolders(folder + "/" + file);
		}

		if (file.startsWith("_") || !file.endsWith(".js")) return;
		let command = require(__dirname + folder + "/" + file);

		if (!bot.commands[command.name.toLowerCase()]){
			if (typeof(command.init) === 'function'){
				command.init(bot);
			}
			bot.commands[command.name.toLowerCase()] = command;
		}else{
			console.log("Error loading command: " + command.name);
			console.log("From file: " + folder + "/" + file);
		}
	});
}

function loadFromDatabase(){
	db.configurationDatabaseConnectionPool.query(`SELECT * FROM CustomCommands`,(err,rows) => {
		for (let i = 0; i < rows.length; i++){
			if (!bot.commands[rows[i].command]){
				let command = {
					name: rows[i].command,
					category: "Custom",
					execute: (message,args) => {
						message.channel.send(rows[i].response);
					}
				}
				bot.commands[command.name] = command;
			}else{
				console.log("Error loading db command: " + command.name);
			}
		}
	});
}

module.exports = {
	init: (botInstance) => {
		botInstance['commands'] = {};

		bot = botInstance;
		let folder = "/commands";

		loopOverFolders(folder);
		loadFromDatabase();
	},
	handler: (message,command,args) => {
		if (bot.commands[command]){

			let missingRole = true;
			let allowedUser = false;

			// Check arguments
			if (bot.commands[command].args){
				if (typeof(bot.commands[command].args) === typeof([])){
					// if arguments are a range between [min,max]
					if (bot.commands[command].args[0] > args || bot.commands[command].args[1] < args){
						message.channel.send("Please check your argument length");
						return;
					}
				// if arguments are a fixed length
				}else if (bot.commands[command].args.length < args.length || bot.commands[command].args.length > args.length){
					message.channel.send("Please check your argument length");
					return;
				}
			}

			// Check permissions
			if (bot.commands[command].roles){
				let roles = bot.commands[command].roles;

				// Loop over all allowed roles
				for (let i=0; i<roles.length; i++){
					if (message.member.roles.cache.has(roles[i])){
						missingRole = false;
					}
				}
			}

			// Check Users
			if (bot.commands[command].users){
				let users = bot.commands[command].users;

				for (let i=0; i < users.length; i++){
					if (users[i] === message.author.id){
						allowedUser = true;
					}
				}
			}

			if ((bot.commands[command].roles && !missingRole) || (!bot.commands[command].roles && missingRole) || allowedUser){
				bot.commands[command].execute(message,args);
				db.updateTracking(command);
			}else{
				message.channel.send("You do not have permission to use this command!");
			}
		}else{

			// Custom database commands



			message.react("🤔");
		}
	},
}