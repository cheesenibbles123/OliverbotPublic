const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");
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
	guildOnly: true,
	options: [
		{
			name : "assign",
			description : "The command you wish to run",
			type : 2,
			options : [
				{
					name : "type",
					description : "Type of item to assign to",
					type : 3,
					required : true
				},
				{
					name : "ID",
					description : "ID of the skin you wish to equip",
					type : 3,
					required : true
				}
			]

		},
		{
			name : "list",
			description : "List the skins of a certain type",
			type : 3,
			choices : [
				{
					name : "Main Sails",
					value : "listmainsails"
				},
				{
					name : "Badges",
					value : "listbadges"
				}
			]
		}
	],
	init: (botInstance) => {
		botInstance['alternionCommands'] = {};
		bot = botInstance;
		loadCommands();
	},
	executeGlobal: (event,args,isMessage) => {
		// Check arguments
		let command = args[0].toLowerCase();
		if (bot.alternionCommands[command]){
			if (bot.alternionCommands[command].args){
				if (typeof(bot.alternionCommands[command].args) === typeof([])){
					// if arguments are a range between [min,max]
					if (bot.alternionCommands[command].args[0] > args || bot.alternionCommands[command].args[1] < args){
						return reply(event,"Please check your argument length",isMessage);
					}
				// if arguments are a fixed length
				}else if (bot.alternionCommands[command].args.length < args.length || bot.alternionCommands[command].args.length > args.length){
					return reply(event,"Please check your argument length",isMessage);
				}
			}

			// Check permissions
			if (bot.alternionCommands[command].roles){
				let roles = bot.alternionCommands[command].roles;
				let missingRole = true;

				// Loop over all allowed roles
				for (let i=0; i<roles.length; i++){
					if (event.member.roles.cache.has(roles[i])){
						missingRole = false;
					}
				}

				if (missingRole){
					reply(event,"You do not have permission to use this command!");
					return;
				}
			}

			// Check Users
			if (bot.alternionCommands[command].users){
				let users = bot.alternionCommands[command].users;
				let notFound = true;

				for (let i=0; i < users.length; i++){
					if (users[i] === event.member.user.id){
						notFound = false;
					}
				}

				if (notFound){
					reply(event,"You do not have permission to use this command!",isMessage);
					return;
				}
			}

			bot.alternionCommands[args[0].toLowerCase()].execute(event,args,isMessage);
		}else{
			reply(event,'🤔',isMessage);
		}
	}
}