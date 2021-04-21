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

			console.log(list);
			//embed.setDescription(list);
			message.channel.send(embed);
		}

	}
}