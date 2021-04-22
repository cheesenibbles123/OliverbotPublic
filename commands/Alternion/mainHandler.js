const db = require(".././_databaseSetup");
const Discord = require("discord.js");
const fs = require('fs');

let bot;

function loadCommands(){
	fs.readdirSync(__dirname).forEach(file => {
		if (file === "mainHandler.js" || file === "_sharedFunctions.js") return;

		let command = require(__dirname + "/" + file);

		if (!bot.alternionCommands[command.name.toLowerCase()]){
			if (typeof(command.init) === "function"){
				command.init(botInstance);
			}
			bot.alternionCommands[command.name.toLowerCase()] = command;
		}else{
			console.log("Error loading command: " + command.name);
			console.log("From file: " + __dirname + "/" + file);
		}
	});
}

module.exports = {
	name: "alternion",
	args: [1,4],
	help: "Alternion command handler",
	category: "Api",
	init: (botInstance) => {
		botInstance['alternionCommands'] = {};
		bot = botInstance;
		loadCommands();
	},
	execute: (message,args) => {
		// Check arguments
		let command = args[0].toLowerCase();
		if (bot.alternionCommands[command]){
			if (bot.alternionCommands[command].args){
				if (typeof(bot.alternionCommands[command].args) === typeof([])){
					// if arguments are a range between [min,max]
					if (bot.alternionCommands[command].args[0] > args || bot.alternionCommands[command].args[1] < args){
						message.channel.send("Please check your argument length");
						return;
					}
				// if arguments are a fixed length
				}else if (bot.alternionCommands[command].args.length < args.length || bot.alternionCommands[command].args.length > args.length){
					message.channel.send("Please check your argument length");
					return;
				}
			}

			// Check permissions
			if (bot.alternionCommands[command].roles){
				let roles = bot.alternionCommands[command].roles;
				let missingRole = true;

				// Loop over all allowed roles
				for (let i=0; i<roles.length; i++){
					if (message.member.roles.cache.has(roles[i])){
						missingRole = false;
					}
				}

				if (missingRole){
					message.channel.send("You do not have permission to use this command!");
					return;
				}
			}

			// Check Users
			if (bot.alternionCommands[command].users){
				let users = bot.alternionCommands[command].users;
				let notFound = true;

				for (let i=0; i < users.length; i++){
					if (users[i] === message.author.id){
						notFound = false;
					}
				}

				if (notFound){
					message.channel.send("You do not have permission to use this command!");
					return;
				}
			}

			bot.alternionCommands[args[0].toLowerCase()].execute(message,args);
		}else{
			message.react('🤔');
		}
	}
}