const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./../config.json');

module.exports = {
	enabled: true,
	init: async (bot) => {
		const timer = ms => new Promise( res => setTimeout(res, ms));
		let commandsNotFound = false;
		while (commandsNotFound){
			await timer(500);
			if (bot.loadedCommands){
				break;
			}
		}

		const rest = new REST({ version: '9' }).setToken(config.token);

		let slashCommands = [];
		let addedCommands = [];

		for (let commandName in bot.commands){
			const command = bot.commands[commandName];
			
			if (/*!command.roles && !command.users &&*/ (command.interactionSupport || typeof(command.executeGlobal) === "function") && addedCommands.indexOf(command.name) === -1){
				let data = {
					name : command.name,
					description : command['help'] ? command.help : (command['description'] ? command.description : "N/A"),
				}

				if (command['default_permission']){
					command['default_permission'] = command.default_permission;
				}

				if (command.options){
					data['options'] = command.options;
				}

				slashCommands.push(data);
				addedCommands.push(command.name);
			}

		};

		try{
			// registering
			await rest.put(
				Routes.applicationGuildCommands(config.botID, config.serverInfo.serverId),
				{body : slashCommands},
			);
		}catch(e){
			console.error(e);
		}

		return; // todo : Need to learn more about permissions system for slash commands

		const commands = await rest.get(
			Routes.applicationGuildCommands(config.botID, config.serverInfo.serverId)
		);

		let permissionOverrides = [];

		await commands.forEach( command => {
			if (bot.commands[command.name].roles || bot.commands[command.name.users]){
				let commandObject = {
					id : command.id,
					permissions : [],
				}

				/*if (bot.commands[command.name].roles){
					bot.commands[command.name].roles.forEach(roleID => {
						let obj = {
							id : roleID,
							type : 1,
							permission : true
						}
						commandObject.permissions.push(obj);
					});
				}*/

				if (bot.commands[command.name].users){
					bot.commands[command.name].users.forEach(userID => {
						let obj = {
							id : userID,
							type : 2,
							permission : true
						}
						commandObject.permissions.push(obj);
					});
				}

				permissionOverrides.push(commandObject);

			}
		});


		try{
			// Permissions
			await rest.put(
				`/applications/${config.botID}/guilds/${config.serverInfo.serverId}/commands/permissions`,
				{body : permissionOverrides},
			);
		}catch(e){
			console.error(e);
		}
		
	}
}