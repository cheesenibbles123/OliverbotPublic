const fs = require('fs');
const Discord = require("discord.js");
const config = require("./../config.json");
const {reply} = require("./_combinedResponses.js");

let bot;

function checkPerms(event,command,isMessage){

	// Check permissions
	if (bot.commands[command.name].roles){
		let roles = bot.commands[command.name].roles;
		let missingRole = true;

		// Loop over all allowed roles
		for (let i=0; i<roles.length; i++){
			if (event.member.roles.cache.has(roles[i])){
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
			if (users[i] === (isMessage ? event.author.id : event.member.user.id)){
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
	help: "Provides help regarding to commands",
	category: "help",
	options: [
		{
			name : "command",
			description : "Command to recieve more information about",
			type : 3,
			required: false
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {
		let embed = new Discord.MessageEmbed();

		if (args.length === 0){
			embed.setTitle("All commands");
			let list = {};

			let allCommands = Object.keys(bot.commands);

			for (let i = 0;	i < allCommands.length; i++){
				let command = bot.commands[allCommands[i]];
				let isAllowed = checkPerms(event,command,isMessage);

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
			let author = isMessage ? event.author : event.member.user;

			author.send({embeds:[embed]}).then(msg => {
				reply(event,"Check your DMs!",isMessage);
			}).catch(e => {
				reply(event,'It appears you currently can\'t receive Direct Messages.\nPlease enable \"Allow direct messages from server members\" under the Privacy & Safety tab in you user settings.',isMessage);
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
					embed.addField("Usage",config.prefix + cmd + " `" + bot.commands[cmd].usage + "`");
				}

				embed.setTitle("Help")
					.setDescription(help);

				reply(event,{embeds:[embed]},isMessage);
			}
		}
	},
	/*executeGlobal: (event,args,isMessage) => {
		let categories = generateCategoriesRow(event,isMessage);
		reply(event,{content: `**Help ${isMessage ? "Message" : "Interaction"} Menu**`, components: [categories]},isMessage);
	},*/
	category: (interaction,args,isMessage) => {
		let commands = generateCommandsRow(event, isMessage);
		interaction.components.push(commands);
		reply(event,{content: interaction.message.content, components: [interaction.components]},isMessage);
	},
	command: (interaction,args,isMessage) => {
		console.log("COMMAND");
		console.log(args);
	}
}

function generateCategoriesRow(event, isMessage){

	let categoryObjects = [];
	let addedCategories = [];

	Object.keys(bot.commands).forEach(commandName => {
		if (addedCategories.indexOf(bot.commands[commandName].category) === -1 && bot.commands[commandName].category && checkPerms(event,bot.commands[commandName],isMessage)){
			categoryObjects.push({
				label: `${bot.commands[commandName].category}`,
				value: `help category ${bot.commands[commandName].category}`
			});
			addedCategories.push(bot.commands[commandName].category);
		}
	});
	
	return new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageSelectMenu()
				.setCustomId('help')
				.setPlaceholder('Category...')
				.addOptions(categoryObjects)
		);
}

function generateCommandsRow(event, isMessage){
	let addedCategories = [];
	let categoryObjects = [];

	Object.keys(bot.commands).forEach(commandName => {
		if (addedCategories.indexOf(commandName) === -1 && checkPerms(event,bot.commands[commandName],isMessage)){
			categoryObjects.push({
				label: `${bot.commands[commandName].displayName ? bot.commands[commandName].displayName : commandName}`,
				value: `help command ${commandName}`
			});
			addedCategories.push(bot.commands[commandName].category);
		}
	});

	return new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageSelectMenu()
				.setCustomId('help')
				.setPlaceholder('Command...')
				.addOptions(categoryObjects)
		);
}