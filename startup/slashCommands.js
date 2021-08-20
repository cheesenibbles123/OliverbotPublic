const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./../config.json');

module.exports = {
	enabled: true,
	init: async (bot) => {
		console.log('Entered init');
		let timer = ms => new Promise( res => setTimeout(res, ms));
		let commandsNotFound = false;
		while (commandsNotFound){
			console.log('Looping while');
			await timer(500);
			if (bot.loadedCommands){
				break;
			}
		}

		let rest = new REST({ version: '9' }).setToken(config.token);

		let slashCommands = [];
		console.log('Entering for loop');
		for (let commandName in bot.commands){
			let command = bot.commands[commandName];
			if (!command.roles && !command.users){
				let data = {
					name : command.name,
					description : command['help'] ? command.help : "N/A",
				}

				if (command.options){
					data['options'] = command.options;
				}

				slashCommands.push(data);

				//bot.api.applications(bot.user.id).guilds(config.serverInfo.serverId).commands.post({data});
				
				//bot.api.applications(bot.user.id).commands.post({data});
			}
		};

		try{
			console.log('Beginning slash registration');
			await rest.put(
				Routes.applicationGuildCommands(config.botID, config.serverInfo.serverId),
				{body : slashCommands},
			);
			console.log('Finished slash registration');
		}catch(e){
			console.error(e);
		}
		
	}
}