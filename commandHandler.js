const fs = require('fs');
const db = require('./startup/database.js');
const config = require('./config.json');
const { reply } = require('./commands/_globalFunctions.js');
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
	return new Promise((resolve,reject) => {
		db.configurationDatabaseConnectionPool.query(`SELECT * FROM CustomCommands`,(err,rows) => {
			for (let i = 0; i < rows.length; i++){
				if (!bot.commands[rows[i].command]){
					let command = {
						name: rows[i].command,
						help: "Custom Command",
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
	});
}

module.exports = {
	init: async (botInstance) => {
		botInstance['loadedCommands'] = false;
		botInstance['commands'] = {};
		bot = botInstance;
		let folder = "/commands";

		loopOverFolders(folder);
		await loadFromDatabase();
		bot.loadedCommands = true;
	},
	handler: async (event,isMessage,command,args) => {

		if (bot.commands[command]){

			let missingRole = true;
			let allowedUser = false;

			// Check arguments
			if (bot.commands[command].args){
				let msg = "Please check your argument length";

				if (typeof(bot.commands[command].args) === typeof([])){
					// if arguments are a range between [min,max]
					if (bot.commands[command].args[0] > args || bot.commands[command].args[1] < args){
						if (bot.commands[command].usage){
							msg += `\nExample usage: \`${config.prefix}${bot.commands[command].name} ${bot.commands[command].usage}\``;
						}
						return reply(event,msg,isMessage);
					}
				// if arguments are a fixed length
				}else if (bot.commands[command].args < args.length || bot.commands[command].args > args.length){
					if (bot.commands[command].usage){
							msg += `\nExample usage: \`${config.prefix}${bot.commands[command].name} ${bot.commands[command].usage}\``;
						}
					return reply(event,msg,isMessage);
				}
			}

			// Check permissions
			if (bot.commands[command].roles){
				let roles = bot.commands[command].roles;

				// Loop over all allowed roles
				for (let i=0; i<roles.length; i++){
					if (event.member.roles.cache.has(roles[i])){
						missingRole = false;
					}
				}
			}

			// Check Users
			if (bot.commands[command].users){
				let users = bot.commands[command].users;

				for (let i=0; i < users.length; i++){
					if (users[i] === isMessage ? event.author.id : event.member.user.id){
						allowedUser = true;
					}
				}
			}

			// Check if server only
			if (bot.commands[command].guildOnly && (isMessage ? event.channel.type === "DM" : bot.channels.get(channelIf).type === "DM")){
				return reply(event,"I can't execute that command within DMs!",isMessage);
			}

			if ((bot.commands[command].roles && !missingRole) || ((!bot.commands[command].roles && missingRole) && !bot.commands[command].users) || allowedUser){

				if (typeof(bot.commands[command].executeGlobal) === "function"){ // If the combined function exists call it
					bot.commands[command].executeGlobal(event,args,isMessage);
					db.updateTracking(command);
				}else
				if (isMessage){
					bot.commands[command].execute(event,args); // If command supports text responses
					db.updateTracking(command);
				}else if (bot.commands[command].interactionSupport){ // If command supports slash responses
					bot.commands[command].executeInteraction(event,args);
					db.updateTracking(command);
				}else{
					reply(event,"Invalid slash command.",isMessage); // Slash command is invalid (e.g. incorrect registration occured)
				}
			}else{
				reply(event,"You do not have permission to use this command!",isMessage);
			}
		}else if (isMessage){
			event.react("🤔");
		}
	},
}