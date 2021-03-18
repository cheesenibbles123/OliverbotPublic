const config = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();

const commands = require("./Handlers/mainCommandHandler");
const glob = require("./Handlers/globalFunctions");
const db = require("./Handlers/databaseSetup");
const raw = require("./Handlers/rawEvents");
const initialSetup = require("./Handlers/initialSetup");
const random = require("./Handlers/randomStuff");
const audio = require("./Handlers/audio");

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

exports.bot = bot;

const autoQuoteNotAllowedCategories = [408407982926331904,440525688248991764,665972605928341505,585042086542311424,632107333933334539,692084502184329277];

var adjustableConfig;

exports.initDBStuff = function initDBStuff(){
	adjustableConfig = require("./Handlers/databaseSetup").adjustableConfig;
}

/////////////////////////////////////////////APIS

function GetMarsWeatherData(message){
	fetch(`https://api.nasa.gov/insight_weather/?api_key=${config.apiKeys.nasa}&feedtype=json&ver=1.0`).then(res => res.json()).then(response => {
		let marsWeatherEmbed = new Discord.MessageEmbed()
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
	return;
}

function saveQuoteAutomatic(message){
	try{
		let AutoQuote = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}`)
			.setDescription(`${message.content}`)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`Sent in: #${message.channel.name} `)
			.setTimestamp();
		let hasNotAddedImage = true;
		message.attachments.forEach(attachment => {
    		if (message.attachments.size === 1) {
      			if (attachment.url && hasNotAddedImage){
      				AutoQuote.setImage(`${attachment.url}`);
      				hasNotAddedImage = false;
      			}
    		}
  		});
		bot.channels.cache.get(config.serverInfo.channels.quotes).send(AutoQuote);
	}catch(e){
		console.log("I CANNOT DO THIS, PLEASE HELP!");
		console.log(e);
	}
	return;
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

	return;
}

function craftItem(message,args){
	let craftEmbed = new Discord.MessageEmbed();
	mainDatabaseConnectionPool.query(`SELECT * FROM crafting WHERE Name=${args[0]}`, (err,craftingRows) => {
		if (craftingRows[0]){
			mainDatabaseConnectionPool.query(`SELECT * FROM skills WHERE id=${ID}`, (err,skillRows) => {
				let requirements = JSON.parse(craftingRows[0].Requirements);
				let requiredSkills = [];
				let requiredMaterials = [];
				let missingSkills = "";
				for (i=0;i<requirements.length;i++){
					if (requirements[i].type === "skill"){
						requiredSkills.push({"name" : requirements[i].name, "level" : requirements[i].level});
					}else if (requirements[i].type === "material"){	
						requiredMaterials.push({"name" : requirements[i].name, "amount" : requirements[i].amount})
					}
				}
				for (let s=0; s<requiredSkills.length;s++){
					if (skillRows[requiredSkills[s].name] < requiredSkills[s].level){
						missingSkills += `${missingSkills[i].name} : ${missingSkills[i].level}\n`;
					}
				}

				if (missingSkills.length < 1){
					mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${ID}'`,(err,inventoryRows) => {
						if (inventoryRows.length){
							if (inventoryRows.length === 1){
								let inv = JSON.parse(inventoryRows[0].inventory);
								let possible = true;
								let missingResources = "";
								for (let s=0; s<requiredMaterials.length;s++){
									let val = checkOrRemoveResources(true,inv,requiredMaterials[s].name,requiredMaterials[s].amount);
									if (val === 0 || val === 2){
										missingResources += `${requiredMaterials[s].name} : ${requiredMaterials[s].amount}\n`;
										possible = false;
									}
								}

								if (possible){

									//remove the resources
									for (let s=0;s<requiredMaterials.length;s++){
										inv = checkOrRemoveResources(false,inv,requiredMaterials[s].name,requiredMaterials[s].amount);
									}

									let doesntExist = true;
									for (let i=0;i<inv.length;i++){
										if (inv[i].name === args[0]){
											inv[i].amount += 1;
											doesntExist = false;
											break;
										}
									}

									if (doesntExist){
										if (craftingRows[0].canBeUsedForCrafting === 1){
											inv.push({"name" : `${args[0]}`, "amount" : 1, "type" : "constructionResources"});
										}else{
											inv.push({"name" : `${args[0]}`, "amount" : 1, "type" : "finalCraft"});
										}
									}

									craftEmbed.setTitle("Item crafted")
										.setDescription(`Crafted: ${craftingRows[0].properName}`);
										message.channel.send(craftEmbed);

								}else{
									craftEmbed.setTitle("Missing Resources")
										.setDescription(missingResources);
									message.channel.send(craftEmbed);
								}
							}
						}
					});
				}else{
					craftEmbed.setTitle("Missing Skills")
						.setDescription(missingSkills);
					message.channel.send(craftEmbed);
				}
			});
		}else{
			craftEmbed.setDescription("Unable to find that item.");
			message.channel.send(craftEmbed);
		}
	});
}

allowedCommands = ["savequote"];

bot.on("ready", () => {
	initialSetup.init();
	console.log('Bot '+bot.user.username+' is ready!');
});

bot.on("message", async message => {

	try{

	//dont respond to bots
	if (message.author.bot) return;
	//if (message.channel.type === "dm") return;

	//this is situation specific, if running your own just remove
	if (message.guild){
		if (message.guild.id === "704649927975763969" && message.channel.id !== "705742490833256469") return;
	}

	random.handleRandomReactions(message);

	// If in a server
	if (message.guild){

		// random staff channel message
		if (message.channel.id === config.serverInfo.channels.staffChannels.moderator || message.channel.id === config.serverInfo.channels.staffChannels.serverAdministrator || message.channel.id === config.serverInfo.channels.staffChannels.discordAdministrator){
			if (glob.getRandomInt(1000) === 6){
				message.channel.send("Hmmm, yes, much discussion <:thonkhonk:690138132343160854>");
			}
		}

		//If enabled creates support tickets
		if (message.channel.id === config.serverInfo.channels.supportTicketChannel && db.adjustableConfig.misc.SupportTickets === true){
			let d = new Date();
			let date = d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear();
			message.guild.createChannel(`${message.author.username}-${date}`,{type: "text", permissionOverwrites: [
				{
					id : config.serverInfo.serverId,
					deny : ['VIEW_CHANNEL'],
				},
				{
					id : `${message.author.id}`,
					allow : ["VIEW_CHANNEL"],
				},
				{
					id : config.serverInfo.roles.serverAdministrator,
					allow : ["VIEW_CHANNEL"],
				},	
			], reason: 'New Support Ticket Created!'}).then(channel => {
				channel.send("Query is: " + message.content + " - please wait for an administrator to respond to your ticket.");
			});
			message.delete({timeout: 0, reason: "Support ticket creation."});
		}


		//N word filter
		if (message.content.toLowerCase().includes('nigger') || message.content.toLowerCase().includes(" "+"nigger"+" ") && db.adjustableConfig.misc.nWordFilter){
			if ( message.member.roles.cache.has(config.serverInfo.roles.serverModerator) || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
				// Ignore
			}else if (message.guild.id === config.serverInfo.serverId && adjustableConfig.misc.nWordFilter){
				message.delete();
				message.channel.send(message.author+" Please dont use that language!");
				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("Message: "+message.content+" , has been deleted. Author: <@"+message.author,id+">");
			}
			db.updateNWordCounter(message);
			return;
		}

		//Prevents autoquote from taking from sensitive channels
		if (db.adjustableConfig.quotes.active && message.guild.id === config.serverInfo.serverId){
			if (autoQuoteNotAllowedCategories.indexOf(parseInt(message.channel.parentID)) === -1){
				if (message.channel.name.toLowerCase().includes("support")){
					// Ignore
				}else
				if (glob.getRandomInt(db.adjustableConfig.quotes.chanceOfBeingQuoted) === 1){
					saveQuoteAutomatic(message);
				}
			}
		}

		//XP Gain
		if (message.guild.id === config.serverInfo.serverId){
			db.xpGainHandler(message);
		}

		//Ping Oliverbot
		if (message.content.startsWith("<@!556545106468012052>")){
			TrackingCommand = true;
			message.react("🤔");
			if(message.member.voice.channel){
				audio.handler(message, "play", null);
			}
		}

		//check content of any pictures sent for nudity
		message.attachments.forEach(attachment => {
	    	if (message.attachments.size > 0) {
	      		if (attachment.url){
	        		if (attachment.url.includes(".png") || attachment.url.includes(".jpg") || attachment.url.includes(".jpeg")){
	          			let sightengine = require('sightengine')('1166252206', 'aSwRzSN88ndBsSHyrUWJ');
	          			sightengine.check(['nudity']).set_url(`${attachment.url}`).then(function(result) {
	            			if (result.nudity.raw > 0.65){
	              				let nudityEmbed = new Discord.MessageEmbed()
	                			  .addField("image posted containing possible nudity",`Nudity rating of ${result.nudity.raw * 100}%\nAuthor: ${message.author}     Channel: ${message.channel}\nImage Link: [link](${attachment.url})`);
	             				bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(nudityEmbed);
	            			}
	          			}).catch(function(err){
	            			console.log(err);
	          			});
	        		}
	      		}
	    	}
	  	});
	}

	//Old larry reference (RIP Larry)
	if (message.content.startsWith("...") && message.content.length === 3){
		message.react("452064991688916995");
	}

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

	commands.handler(message,command,args);

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

//Pure Logging of events for administrative purposes
bot.on('raw', async event => {
	if (event.d){
		if (event.d.guild_id){
			if (event.d.guild_id !== config.serverInfo.serverId) return;
			let member;

			if ((event.t === "CHANNEL_CREATE" && event.d.type !== 'dm') || (event.t === "CHANNEL_DELETE" && event.d.type !== 'dm') || (event.t !== "CHANNEL_CREATE" && event.t !== "CHANNEL_DELETE")){
				raw.manageRawEmbeds(event);
			}

			switch (event.t){
				case "MESSAGE_REACTION_ADD":
					if (event.d.channel_id === "762401591180525608"){
						// manageJoinReaction(event);
					}else if ((parseInt(event.d.channel_id) !== 607491352598675457 && db.adjustableConfig.reactions.reactionMenu) || event.d.user_id === config.botID){
		        		break;
		    		}
					member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
					adjustableConfig.reactionRoles.forEach(roleInfo => {
						if (event.d.emoji.name === roleInfo.EmojiName){ 
							let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
							member.roles.add(role);
						}
					});
					break;
				case "MESSAGE_REACTION_REMOVE":
					if ((parseInt(event.d.channel_id) !== 607491352598675457 && db.adjustableConfig.reactions.reactionMenu) || event.d.user_id === config.botID){
		        		break;
		    		}
					member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
					adjustableConfig.reactionRoles.forEach(roleInfo => {
						if (event.d.emoji.name === roleInfo.EmojiName){ 
							let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
							member.roles.remove(role);
						}
					});
					break;
				default:
					break;
			}

		}
	}

	return;
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

bot.on("messageDelete", function(message){
	if (message.channel.id === "562013905426317322" || message.channel.id === "522864242626658305") return;
	let msgDeleteEmbed = new Discord.MessageEmbed()
		.setTitle(`${message.author}`)
		.setDescription(`${message.content}`)
		.setFooter(`From: ${message.channel}`)
		.setTimestamp();
    bot.channels.cache.get("732318686186045440").send(msgDeleteEmbed);
});

bot.login(config.token);
