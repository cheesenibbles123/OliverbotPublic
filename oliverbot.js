require('dotenv').config();
//console.log(process.env);
const config = require("./config.json");

const { Client, GatewayIntentBits } = require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

const deploy = require("./deploy.js");

bot.once('ready', () => {
	console.log('Ready!');

	deploy.commands(bot).then(() => {
		console.log("Commands Deployed successfully!");
	}).catch(error => {
		console.log(error);
	});

	deploy.events(bot).then(() => {
		console.log("Events Deployed successfully!");
	}).catch(error => {
		console.log(error);
	});
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	await command.execute(interaction).catch(async error => {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command.", ephemeral: true});
	});

})

bot.login(process.env.DISCORD_TOKEN);