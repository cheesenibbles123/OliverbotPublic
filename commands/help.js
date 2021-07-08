const fs = require('fs');
const Discord = require("discord.js");

let bot;

function checkPerms(message,command){

	// Check permissions
	if (bot.commands[command.name].roles){
		let roles = bot.commands[command.name].roles;
		let missingRole = true;

		// Loop over all allowed roles
		for (let i=0; i<roles.length; i++){
			if (message.member.roles.cache.has(roles[i])){
				missingRole = false;
			}
		}

		if (missingRole){
			return false;
		}
	}

	// Check Users
	if (bot.commands[command.name].users){
		let users = bot.commands[command.name].users;
		let notFound = true;

		for (let i=0; i < users.length; i++){
			if (users[i] === message.author.id){
				notFound = false;
			}
		}

		if (notFound){
			return false;
		}
	}

	return true;
}

module.exports = {
	name: "help",
	args: [0,1],
	help: "",
	category: "help",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let embed = new Discord.MessageEmbed();

		if (args.length === 0){
			embed.setTitle("All commands");
			let list = {};

			let allCommands = Object.keys(bot.commands);

			for (let i = 0;	i < allCommands.length; i++){
				//console.log("Checking: " + allCommands[i]);
				let command = bot.commands[allCommands[i]];
				let isAllowed = checkPerms(message,command);

				if (isAllowed && command.category !== 'help'){

					if (list[command.category]){
						list[command.category] += `- ${command.name}\n`;
					}else{
						list[command.category] = `- ${command.name}\n`;
					}
				}
				
			}

			let categories = Object.keys(list);

			for (let i = 0; i < categories.length; i++){
				if (categories[i] === 'undefined'){
					embed.setDescription(list[categories[i]]);
				}else{
					embed.addField(categories[i], list[categories[i]], true);
				}
			}

			message.author.send(embed).then(msg => {
				message.channel.send("Check your DMs!");
			}).catch(e => {
				message.channel.send('It appears you currently can\'t receive Direct Messages.\nPlease enable \"Allow direct messages from server members\" under the Privacy & Safety tab in you user settings.');
			});
		}else{
			let cmd = args[0].toLowerCase();
			if (bot.commands[cmd]){

				let help;
				let usage;

				if (bot.commands[cmd].help){
					help = bot.commands[cmd].help;
				}else{
					help = "This command has no help section currently.";
				}

				if (bot.commands[cmd].usage){
					embed.addField("Usage",";" + cmd + " `" + bot.commands[cmd].usage + "`");
				}

				embed.setTitle("Help")
					.setDescription(help);

				message.channel.send(embed);
			}
		}

	}
}