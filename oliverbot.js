const config = require("./config.json");
const { Client, Intents, MessageEmbed } = require('discord.js');
const bot = new Client({intents: returnIntents(), partials: ['CHANNEL']});

const commands = require("./commandHandler.js");
const startup = require("./startupHandler.js");
const interactions = require("./interactionHandler.js");
const events = require("./eventHandler.js");

let serverStatus = {
	"active" : false,
	"msg" : null,
	"channel" : "663524428092538920"
};

let cooldowns = {
	"steamApi" : true,
	"quiz" : {
		"allowed" : true,
		"timeoutLength" : 120000
	}
};

function returnIntents(){
	return [

	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	Intents.FLAGS.GUILD_INTEGRATIONS,
	Intents.FLAGS.GUILD_WEBHOOKS,
	Intents.FLAGS.GUILD_INVITES,
	Intents.FLAGS.GUILD_VOICE_STATES,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.GUILD_PRESENCES,

	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,

	]
}

/////////////////////////////////////////////APIS

function GetMarsWeatherData(message){
	fetch(`https://api.nasa.gov/insight_weather/?api_key=${config.apiKeys.nasa}&feedtype=json&ver=1.0`).then(res => res.json()).then(response => {
		let marsWeatherEmbed = new MessageEmbed()
			.setTitle("Mars Weather Data");
			text="";

		//let temparray = response[[0..num]];

		let i = 0;

		temparray.forEach(element => {
			text = text+`Sol: ${response.sol_keys[i]}\n`
					+`Atmospheric Termperature: "av" ${element.AT.av}, "ct" ${element.AT.ct}, "mn" ${element.AT.mn}, "mx"${element.AT.mx}.\n`
					+`Horizontal Wind Speed: "av" ${element.HWS.av}, "ct" ${element.HWS.ct}, "mn" ${elementHWS.mn}, "mx"${element.HWS.mx}.\n`
					+`Pressure Data: "av" ${element.PRE.av}, "ct" ${element.PRE.ct}, "mn" ${element.PRE.mn}, "mx"${element.PRE.mx}.\n`
					+`Season: ${element.Season}.\n`
					+"\n";
			i++;
		});

		marsWeatherEmbed.addField("",`${text}`);
		message.channel.send(marsWeatherEmbed);
	});
}

async function getUserFromID(ID){
	let id = await bot.users.cache.get(ID);
	return id;
}

//WIP
function customizeShip(ID,args,message){
	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		let sql;
		if(rows.length < 1){
			message.channel.send("You are not currently in the database! Send a few messages to be entered.");
		} else {
			let inventory = rows[0].inventory;
			let notFound = true;
			let canBeCustomized = false;
			let shipInInventory = 0;

			for (i=0;i<inventory.length;i++){
				if (inventory[i].name === args[0]){
					shipInInventory = i;
					notFound = false;
					canBeCustomized = inventory[i].customizable;
				}
			}


			if(notFound){
				message.channel.send("You cannot customize something you do not own!");
			}else{
				if (canBeCustomized){
					if (args[0] === "sailPattern"){
						if (inventory[shipInInventory]){}
					}else if(args[0] === "sailColour"){}
				}else{
					message.channel.send("This item cannot be customized!");
				}
			}
		}
		mainDatabaseConnectionPool.query(sql);
	});
}

allowedCommands = ["savequote"];

bot.once("ready", () => {
	commands.init(bot);
	startup.init(bot);
	interactions.init(bot);
	events.init(bot);
	console.log('Bot '+bot.user.username+' is ready!');
});

bot.on("messageCreate", async message => {
	try{

	if (message.partial){
		message = await message.fetch();
	}

	//dont respond to bots
	if (message.author.bot) return;
	//if (message.channel.type === "dm") return;

	//this is situation specific, if running your own just remove
	if (message.guild){
		if (message.guild.id === "704649927975763969" && message.channel.id !== "705742490833256469") return;
	}

	// Random + intentional interactions + reactions
	interactions.handler(message);

	if (!message.content.startsWith(config.prefix)) return;

	let messagearray = message.content.split(/[ ]+/);
	let command = messagearray[0].substring(1);
	command = command.toLowerCase();

	// Certain commands are allowed in all channels
	let isNotAllowed = true;
	for (let i = 0; i< allowedCommands.length;i++){
		if (allowedCommands[i] === command){
			isNotAllowed = false;
		}
	}
	
	if (config.serverInfo.channels.allowedChannels.indexOf(message.channel.id) === -1 && message.author.id != config.ownerID && isNotAllowed && message.guild !== null){
		return;
	}

	//Split messages into the command and arguments
	let args = messagearray.slice(1);

	commands.handler(message, true, command, args);

	}catch(e){
		console.log("###########################################################");
		console.log("##################### START OF ERROR ######################");
		console.log("###########################################################");
		console.log(e);
		console.log("###########################################################");
		console.log("##################### END OF ERROR ########################");
		console.log("###########################################################");
	}
});

async function manageJoinReaction(event){
	if (event.d.emoji.name === config.serverInfo.emojiNames.initialJoinReactionConfirmation){
		member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
		let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(config.serverInfo.roles.defaultRole);
		member.roles.add(role);
	}else{
		bot.channels.cache.get(config.serverInfo.channels.initialJoinReactionConfirmation).messages.fetch(config.serverInfo.messages.initialJoinReactionConfirmation).then( msg => {
			let userReactions = msg.reactions.cache.filter(reaction => reaction.users.cache.has(event.d.user_id));
			try {
				for (let reaction of userReactions.values()) {
					if (reaction._emoji.name !== config.serverInfo.emojiNames.initialJoinReactionConfirmation)
					{
						reaction.users.remove(event.d.user_id);
					}
				}
			} catch (error) {
				console.error('Failed to remove reactions.');
			}
		});
	}
	return;
}

bot.on("interactionCreate", async interaction => {
	if (interaction.isCommand()){
		await interaction.deferReply();

		let args = [];
		for (let i=0; i < interaction.options._hoistedOptions.length; i++){
			args.push(interaction.options._hoistedOptions[i].value);
		}
		commands.handler(interaction, false, interaction.commandName, args);
	}else if (interaction.isSelectMenu() || interaction.isButton()){
		await interaction.deferUpdate();
		const data = interaction.values[0].split(' ');
		if (data.length < 1) return;
		const command = data[0];
		data.shift();
		commands.handler(interaction, false, command, data);
	}else{
		return;
	}
});

//Pure Logging of events for administrative purposes
bot.on('raw', async event => {
	if (event.d && event.d.type !== 'dm'){
		events.handler(event);
	}
});

// bot.on('presenceUpdate', (oldMember, newMember) => {
// 	if (oldMember.guild.id){
// 		console.log("------");
// 		if (oldMember.presence.game["streaming"]){
// 			console.log(oldMember.presence.game.streaming);
// 			console.log("------");
// 		}
		
// 		if (newMember.presence.game["streaming"]){
// 			console.log(newMember.presence.game.streaming);
// 			console.log("------");
// 		}
		
// 	}
// });


bot.on('error', console.error);
//bot.on('debug', console.log)
bot.on("warn", (e) => console.warn(e));
/*
bot.on("messageDelete", function(message){
	if (message.channel.id === "562013905426317322" || message.channel.id === "522864242626658305") return;
	let msgDeleteEmbed = new MessageEmbed()
		.setTitle(`${message.author}`)
		.setDescription(`${message.content}`)
		.setFooter(`From: ${message.channel}`)
		.setTimestamp();
    bot.channels.cache.get("732318686186045440").send(msgDeleteEmbed);
});
*/
bot.login(config.token);
