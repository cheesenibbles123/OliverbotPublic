const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

module.exports = {
	commands : async (bot) => {
		bot.commands = new Collection();
		const commands = [];
		const commandsPath = path.join(__dirname, 'commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		const clientId = '566193818865631234';
		const guilds = await bot.guilds.fetch();

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
		
			bot.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		}
		for (const guild of guilds){
			console.log("Registering: " + guild[0]);
			rest.put(Routes.applicationGuildCommands(clientId, guild[0]), {body : commands})
				.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
				.catch(console.error);
		}
	},
	events : async (bot) => {
		const eventsPath = path.join(__dirname, 'events');
		const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
		for (const file of eventFiles){
			const filePath = path.join(eventsPath, file);
			const event = require(filePath);
			if (event.once){
				bot.once(event.name, (...args) => event.execute(...args));
			}else{
				bot.on(event.name, (...args) => event.execute(...args));
			}
		}
	}
}