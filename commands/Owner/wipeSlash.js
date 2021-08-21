const { REST } = require('@discordjs/rest');
const config = require('./../../config.json');
const { Routes } = require('discord-api-types/v9');

let bot;

module.exports = {
	name: "wipeslash",
	help: "Wipes all application commands",
	users: ["337541914687569920"],
	category: "Owner",
	init: (botInstance)=> {
		bot = botInstance;
	},
	execute: async (message,args) => {
		let allCommands = await bot.api.applications(bot.user.id).commands.get();//.delete();
		/*let rest = new REST({ version: '9' }).setToken(config.token);
		let data = await rest.get(
			Routes.applicationGuildCommands(Bot_ID, Guild_ID)
		);
		*/
		allCommands.forEach(async appCommand => {
			bot.api.applications(bot.user.id).commands(appCommand.id).delete();
			if (appCommand.guild_id){
				bot.api.applications(bot.user.id).guilds(appCommand.guild_id).commands(appCommand.id).delete();
			}
			/*await rest.delete(
				Routes.applicationGuildCommands(appCommand.application_id, appCommand.guild_id, appCommand.id)
			);*/
		});
	}
}
