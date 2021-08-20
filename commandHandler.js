const fs = require('fs');
const db = require('./startup/database.js');
const config = require('./config.json');

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

async function setupSlashCommands(){

	let rest = new REST({ version: '9' }).setToken(token);

	let timer = ms => new Promise( res => setTimeout(res, ms));

	for (let commandName in bot.commands){
		let command = bot.commands[commandName];
		console.log(command);
		if (!command.roles && !command.users){
			let data = {
				name : command.name,
				description : command['help'] ? command.help : "N/A",
			}

			if (command.options){
				data['options'] = command.options;
			}

			bot.api.applications(bot.user.id).guilds(config.serverInfo.serverId).commands.post({data});
			
			bot.api.applications(bot.user.id).commands.post({data});
		}
		await timer(500); // avoid getting rate-limited
	};
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
	handler: async (interaction) => {
		//if (!interaction.isCommand()) return;
		console.log(interaction);
		let command = interaction.data.name;
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
						return message.channel.send(msg);
					}
				// if arguments are a fixed length
				}else if (bot.commands[command].args < args.length || bot.commands[command].args > args.length){
					if (bot.commands[command].usage){
							msg += `\nExample usage: \`${config.prefix}${bot.commands[command].name} ${bot.commands[command].usage}\``;
						}
					return message.channel.send(msg);
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

			// Check if server only
			if (bot.commands[command].guildOnly && message.channel.type === 'DM'){
				return message.channel.send("I can't execute that command within DMs!");
			}

			if ((bot.commands[command].roles && !missingRole) || ((!bot.commands[command].roles && missingRole) && !bot.commands[command].users) || allowedUser){
				bot.commands[command].execute(message,args);
				db.updateTracking(command);
			}else{
				message.channel.send("You do not have permission to use this command!");
			}
		}else{
			message.react("🤔");
		}
	},
	slashHandler: (interaction) => {
		//if (!interaction.isCommand()) return;
		console.log(interaction);
		let command = interaction.data.name;
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
						return interaction.reply(msg);
					}
				// if arguments are a fixed length
				}else if (bot.commands[command].args < args.length || bot.commands[command].args > args.length){
					if (bot.commands[command].usage){
							msg += `\nExample usage: \`${config.prefix}${bot.commands[command].name} ${bot.commands[command].usage}\``;
						}
					return interaction.reply(msg);
				}
			}

			// Check permissions
			if (bot.commands[command].roles){
				let roles = bot.commands[command].roles;
				if (interaction.member && interaction.member.roles.includes(roles[i])){
					missingRole = false;
				}
			}

			// Check Users
			if (bot.commands[command].users){
				let users = bot.commands[command].users;

				let authorId = interaction.member ? interaction.member.user.id : interaction.user.id;

				for (let i=0; i < users.length; i++){
					if (users[i] === authorId){
						allowedUser = true;
					}
				}
			}

			// Check if server only
			if (bot.commands[command].guildOnly && !interaction.guild_id){
				return interaction.reply("I can't execute that command within DMs!");
			}

			if ((bot.commands[command].roles && !missingRole) || ((!bot.commands[command].roles && missingRole) && !bot.commands[command].users) || allowedUser){
				if (bot.commands[command].interactionSupport){
					interaction.reply("Completed commandHandler");
					//bot.commands[command].executeInteraction(interaction);
					//db.updateTracking(command);
				}else{
					interaction.reply("This command does not currently have support for slash commands.");
				}
			}else{
				interaction.reply("You do not have permission to use this command!");
			}
		}else{
			interaction.reply("This command doesn't seem to exist 🤔");
		}
	},
}