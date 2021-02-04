const config = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client();

const btoa = require("btoa");

const commands = require("./Handlers/mainCommandHandler");
const glob = require("./Handlers/globalFunctions");
const db = require("./Handlers/databaseSetup");
const raw = require("./Handlers/rawEvents");
const initialSetup = require("./Handlers/initialSetup");
const random = require("./Handlers/randomStuff");
const economy = require("./Handlers/economySystem")

var serverStatus = {
	"active" : false,
	"msg" : null,
	"channel" : "663524428092538920"
};

var cooldowns = {
	"steamApi" : true,
	"quiz" : {
		"allowed" : true,
		"timeoutLength" : 120000
	}
};

var adjustableConfig = {
	"reactions" : {
		"randomReactions" : true,
	},
	"quotes" : {
		"active" : true,
	},
	"misc" : {
		"nWordFilter" : true,
	},
	"music" : {
		"pingCommand" : true,
	},
	"apis" : {
		"checkNudity" : true,
	}
};

global.bot = bot;
global.adjustableConfig = adjustableConfig;

const autoQuoteNotAllowedCategories = [408407982926331904,440525688248991764,665972605928341505,585042086542311424,632107333933334539,692084502184329277];

var { customCommandList,miniCommands,reactionRoles } = require("./Handlers/databaseSetup");

//Custom Commands
//Ones that can be created and deleted by select individuals
function customCommands(message,command){
	if (customCommandList.length < 1){return;}
	else{
		for (i=0;i<customCommandList.length;i++){
			if (customCommandList[i].command === command){
				message.channel.send(customCommandList[i].response);
			}
		}
	}
	return;
}
//Ones that the owner makes, and thus only the owner can remove
function permanentCommands(message,command){
	if (miniCommands.length < 1){return;}
	else{
		for (i=0;i<miniCommands.length;i++){
			if (miniCommands[i].command === command){
				message.channel.send(miniCommands[i].response);
			}
		}
	}
	return;
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

function NumbersTrivia(message){
	fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
		message.channel.send("```"+`${response}`+"```");
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

function displayBotInfo(){
	try{
	//emojis
	bot.channels.cache.get("692403714048131185").messages.fetch("692403984836853862").then(msg => {
		msg.edit("```js\n" + `Main:\n1. randomReactions: ${adjustableConfig.reactions.randomReactions}\n2. chanceofRandomReactions: 1 in ${adjustableConfig.reactions.chanceofRandomReactions}\n3. gtSpecific: ${adjustableConfig.reactions.gtSpecific}\n4. giraffeReactions: ${adjustableConfig.reactions.giraffeReactions}\n5. smirks: ${adjustableConfig.reactions.smirks}\n6. reactionMenu: ${adjustableConfig.reactions.reactionMenu}` + "```");
	});
	//misc
	bot.channels.cache.get("692403714048131185").messages.fetch("692403986518638663").then(msg => {
		msg.edit("```js\n" +`Misc:\n1. active (Quotes): ${adjustableConfig.quotes.active}\n2. chanceOfBeingQuoted: 1 in ${adjustableConfig.quotes.chanceOfBeingQuoted}\n3. nWordFilter: ${adjustableConfig.misc.nWordFilter}\n4. supporTickets: ${adjustableConfig.misc.supporTickets}\n5. moderatorCommands: ${adjustableConfig.misc.moderatorCommands}\n6. generalAudio (music commands): ${adjustableConfig.music.generalAudio}\n7. pingCommand: ${adjustableConfig.music.pingCommand}\n8. trackingCommandUsage: ${adjustableConfig.misc.trackingCommandUsage}` +"```");
	});
	//apis
	bot.channels.cache.get("692403714048131185").messages.fetch("692403988426915941").then(msg => {
		msg.edit("```js\n" + `API Commands/features:\n1. checkNudity: ${adjustableConfig.apis.checkNudity}\n2. inspire: ${adjustableConfig.apis.inspire}\n3. translate: ${adjustableConfig.apis.translate}\n4. urban: ${adjustableConfig.apis.urban}\n5. yodish: ${adjustableConfig.apis.yodish}\n6. randomUselessFactAPI: ${adjustableConfig.apis.randomUselessFactAPI}\n7. memegen: ${adjustableConfig.apis.memegen}\n8. apod: ${adjustableConfig.apis.apod}\n9. numTrivia: ${adjustableConfig.apis.numTrivia}\n10. exchangeRates: ${adjustableConfig.apis.exchangeRates}\n11. advice: ${adjustableConfig.apis.advice}\n12. today: ${adjustableConfig.apis.today}\n14. bacon: ${adjustableConfig.apis.bacon}\n15. chuck: ${adjustableConfig.apis.chuck}\n16. dictionary: ${adjustableConfig.apis.dictionary}\n17. payday2: ${adjustableConfig.apis.payday2}\n18. blackwake: ${adjustableConfig.apis.blackwake}` + "```");
	});
	//tooltip
	bot.channels.cache.get("692403714048131185").messages.fetch("692419941248270407").then(msg => {
		msg.edit("```\nTo edit the config:\n Command = config, first argument is the command name, second is true/false/number\nA few Examples:\n - ;config memegen true\n - ;config nWordFilter true\n - ;config chanceofRandomReactions 27\n```");
	});
	}catch(e){
		console.log(e);
	}
	return;
}

//economy

function updateShopWindow(){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM shop`, (err,rows) => {
		let newShopListing = new Discord.MessageEmbed().setTitle("Shop Channel");

		let melee = "";
		let secondary = "";
		let primary = "";

		let smallShips = "";
		let bigShips = "";
		let megaShips = "";

		let swivelTypes = "";
		let cannons = "";

		let incomeSmall = "";
		let incomeMed = "";
		let incomeLarge = "";

		let birds = "";
		let Reptiles = "";
		let Mammals = "";

		let basicMaterials = "";
		let advancedMaterials = "";
		for (i=0;i<rows.length;i++){
			let itemInfo = JSON.parse(rows[i].info);
			switch(itemInfo.type){
				case "megaShips":
					megaShips = megaShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "smallShips":
					smallShips = smallShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "largeShips":
					bigShips = bigShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "primary":
					primary = primary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "secondary":
					secondary = secondary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "melee":
					melee = melee + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "swivelType":
					swivelTypes = swivelTypes + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "cannons":
					cannons = cannons + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "income":
					switch(itemInfo.size)
					{
						case "Small":
							incomeSmall += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Medium":
							incomeMed += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Large":
							incomeLarge += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						default:
							break;
					}
					break;
				case "pet":
					switch(itemInfo.petType)
					{
						case "Bird":
							birds += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Reptile":
							Reptiles += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Mammal":
							Mammals += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				case "constructionResources":
					switch (itemInfo.materialType)
					{
						case "basicMaterial":
							basicMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "advancedMaterial":
							advancedMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		}
			db.configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {

				let shopWindowChannel = "";

				let shopInformationMessage = "";
				let shopIncomeMessage = "";
				let shopWeaponsMessage = "";
				let shopShipsMessage = "";
				let shopPetsMessage = "";
				let shopConstructionMessage = "";
				let shopShipsArnamentMessage = "";

				for (let s = 0; s < rows2.length; s++)
				{
					switch (rows2[s].name)
					{
						case "shopWindowChannel":
							shopWindowChannel = rows2[s].channelID;
							break;
						case "shopInformationMessage":
							shopInformationMessage = rows2[s].messageID;
						case "shopIncomeMessage":
							shopIncomeMessage = rows2[s].messageID;
							break;
						case "shopWeaponsMessage":
							shopWeaponsMessage = rows2[s].messageID;
							break;
						case "shopShipsMessage":
							shopShipsMessage = rows2[s].messageID;
							break;
						case "shopPetsMessage":
							shopPetsMessage = rows2[s].messageID;
							break;
						case "shopShipsArnamentMessage":
							shopShipsArnamentMessage = rows2[s].messageID;
							break;
						case "shopConstructionMessage":
							shopConstructionMessage = rows2[s].messageID;
							break;
						default:
							break;
					}
				}
				let shopInfoEmbed = new Discord.MessageEmbed()
					.setTitle("Shop Window")
					.setDescription("Items that can be purchased are listed within the containers below in the following format:\n> Item Name - `ITEMID`\nNote: you do not need to make it a `code block`, you can simply type out the itemID")
					.addField('Search', "To search for an item you search based off the `ITEMID` of the item you wish to search, for example:\n;search long9pounder",true)
					.addField('Purchase', "To purchase an item, you purchase based off the `ITEMID` of the item you wish to purchase, for example:\n ;purchase jeanbart",true);
				editMsg(shopInfoEmbed, shopWindowChannel, shopInformationMessage);

				let shopIncomeEmbed = new Discord.MessageEmbed()
					.setTitle("Income")
					.addField('Small', `${incomeSmall}`,true)
					.addField('Medium', `${incomeMed}`,true)
					.addField('Large', `${incomeLarge}`,true);
				editMsg(shopIncomeEmbed, shopWindowChannel, shopIncomeMessage);

				let shopWeaponsEmbed = new Discord.MessageEmbed()
					.setTitle("Weapons")
					.addField('Primary', `${primary}`,true)
					.addField('Secondary', `${secondary}`,true)
					.addField('Melee', `${melee}`,true);
				editMsg(shopWeaponsEmbed, shopWindowChannel, shopWeaponsMessage);

				let shopShipsEmbed = new Discord.MessageEmbed()
					.setTitle("Ships")
					.addField('Small', `${smallShips}`,true)
					.addField('Big', `${bigShips}`,true)
					.addField('Mega', `${megaShips}`,true);
				editMsg(shopShipsEmbed, shopWindowChannel, shopShipsMessage);

				let shopShipsArnamentEmbed = new Discord.MessageEmbed()
					.setTitle("Ship Arnament")
					.addField('Swivels', `${swivelTypes}`,true)
					.addField('Cannons', `${cannons}`,true);
				editMsg(shopShipsArnamentEmbed, shopWindowChannel, shopShipsArnamentMessage);

				let shopPetsEmbed = new Discord.MessageEmbed()
					.setTitle("Pets")
					.addField('Birds', `${birds}`,true)
					.addField('Mammals', `${Mammals}`,true)
					.addField('Reptiles', `${Reptiles}`,true);
				editMsg(shopPetsEmbed, shopWindowChannel, shopPetsMessage);

				let shopConstructionEmbed = new Discord.MessageEmbed()
					.setTitle("Construction Materials")
					.addField('Basic', `${basicMaterials}`,true)
					.addField('Advanced', `${advancedMaterials}`,true);
				editMsg(shopConstructionEmbed, shopWindowChannel, shopConstructionMessage);

				return;
			});
	});
	
	return;
}

async function getUserFromID(ID){
	let id = await bot.users.cache.get(ID);
	return id;
}

async function displayRichestUsers(){
	
	return;
	let guild = await bot.guilds.cache.get("401924028627025920");

	db.configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {
		let economyBoardsChannel;
		let richetsUsersMesg;
		let poorestUsersMsg;
		for (let s = 0; s < rows2.length; s++){
			if (rows2[s].name == "shopBoardsChannel")
			{
				economyBoardsChannel = rows2[s].channelID;
			}else if (rows2[s].name == "richestUsers")
			{
				richetsUsersMesg = rows2[s].messageID;
			}else if (rows2[s].name == "poorestUsers")
			{
				poorestUsersMsg = rows2[s].messageID;
			}
		}
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 desc limit 30`, (err,rows) => {
			let newRichest = "```TEXT\nThe Richest Users!\nUsername            |Coins in Bank\n";
			let factor = 100;
			for (i=0;i<30;i++){
				let name;
				bot.users.cache.get(rows[i].ID).then(user => {
					try
					{
						console.log("ID: " + rows[i].ID);
						if (rows[i].ID === 'thereserve'){
							name = "Federal Reserve";
						}else {
							
							//let member = getUserFromID(rows[i].ID);
							//console.log(member);
							if (user.username === undefined){
								name = "REPLACEMENT";
							}else{
								name = user.username;
							}
						}
					}catch(e)
					{
						console.log("Richest: " + e);
						name = "REPLACEMENT";
					}

					if (name.length < leaderboardlimits.usernameEco){
						let x = leaderboardlimits.usernameEco - name.length;
						name = name + new Array(x + 1).join(' ');
					}else{
						name = name.split(0,leaderboardlimits.usernameEco);
					}
					let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
					if (coins >= (1000000000 * factor)){
						coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
					}else if (coins >= (1000000 * factor)){
						coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
					}else if (coins >= (1000 * factor)){
						coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
					}else{
						coins = coins / factor;
					}
					newRichest = newRichest + name +"|"+ coins +"\n";
				});
			}
			newRichest += "```";
			bot.channels.cache.get(economyBoardsChannel).messages.fetch(richetsUsersMesg).then(msg => {
				msg.edit(newRichest);
			});
		});

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 limit 30`, (err,rows) => {
			let newPoorest = "```TEXT\nThe Poorest Users!\nUsername            |Coins in Bank\n";
			let factor = 100;
			for (s=0;s<30;s++){
				let name;

				try
				{
					//let member = bot.guilds.cache.get("401924028627025920").members.cache.get(rows3[s].ID).user;
					let member = getUserFromID(rows[i].ID);
					if (rows[s].ID === 'thereserve'){
						name = "Federal Reserve";
					}else if (member.username === undefined){
						name = "REPLACEMENT";
					}else{
						name = member.username;
					}
				}catch(e)
				{
					console.log("Poorest: " + e);
					name = "REPLACEMENT";
				}

				if (name.length < leaderboardlimits.usernameEco){
					let x = leaderboardlimits.usernameEco - name.length;
					name = name + new Array(x + 1).join(' ');
				}else{
					name = name.split(0,leaderboardlimits.usernameEco);
				}
				let coins = parseInt(parseFloat(rows[s].giraffeCoins).toFixed(2) * factor);
				if (coins >= (1000000000 * factor)){
					coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
				}else if (coins >= (1000000 * factor)){
					coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
				}else if (coins >= (1000 * factor)){
					coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
				}else{
					coins = coins / factor;
				}
				newPoorest = newPoorest + name +"|"+ coins +"\n";
			}
			newPoorest += "```";
			bot.channels.cache.get(economyBoardsChannel).messages.fetch(poorestUsersMsg).then(msg => {
				msg.edit(newPoorest);
			});
		});
	});
	return;
}

function giftUserItem(gifterID,reciever,item,message){
	let user = getUserFromMention(reciever);
	user = user.id;
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate item!");
	}

	mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send(`Something has gone wrong, please message <@${config.ownerId}>`);
		}else{
			let inventory = JSON.parse(rows[0].inventory);
			let notFound = true;
			let tempList = [];
			let worth;
			for (i=0; i < inventory.length; i++){
				if (inventory[i].name !== item){
					tempList.push(inventory[i]);
				}else{
					notFound = false;
				}
			}

			if (!notFound){
				mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
					let itemInfo = JSON.parse(rows2[0].info);
					message.channel.send(`Item: ${itemInfo.name} has been sold for ${worth}.`);
					updateShopWindow();
				});
			}

			if (notFound){
				message.channel.send("You cannot gift this item as you do not own it!");
			}
		}
	});

	return;
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

function checkOrRemoveResources(check,list,checkForName,checkForAmount){
	if (check){
		for (let s=0; s<list.length;s++){
			if (list[i].type === "constructionResources" && list[i].name === checkForName){
				if (list[i].amount < checkForAmount){
					return 0;
				}else{
					return 1;
				}
			}
		}
		return 2;
	}else{
		for (let s=0; s<list.length;s++){
			if (list[i].type === "constructionResources" && list[i].name === checkForName){
				list[i].amount -= checkForAmount
			}
		}
		return list;
	}
}

//Not yet complete

function editMsg(contents,channelID,msgID){
	bot.channels.cache.get(channelID).messages.fetch(msgID).then( msg => {
		msg.edit(contents);
	});
}

function updateNWordCounter(message){
	mainDatabaseConnectionPool.query(`SELECT * FROM nWordCount WHERE ID='${message.author.id}'`, (err,rows, fields) => {
		if (rows.length === 0){
			mainDatabaseConnectionPool.query(`INSERT INTO nWordCount VALUES ('${message.author.id}', '1', '${message.guild.id}')`);
		}else{
			mainDatabaseConnectionPool.query(`UPDATE nWordCount SET counter='${parseInt(rows[0].counter) + 1}' WHERE ID='${message.author.id}'`);
		}
	});

	return;
}

allowChannels = ["512331083493277706","577180597521350656","440525025452490752","663524428092538920","563478316120539147","722204531538002020"];
allowedCommands = ["savequote"];

bot.on("ready", () => {
	console.log('Bot '+bot.user.username+' is ready!');
	initialSetup.init();

	displayRichestUsers();
	updateShopWindow();
});

bot.on("message", async message => {


	try{

	//dont respond to bots
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	//this situation specific, if running your own just remove
	if (message.guild.id === "704649927975763969" && message.channel.id !== "705742490833256469") return;

	random.handleRandomReactions(message);


	if (message.channel.id === config.serverInfo.channels.staffChannels.moderator || message.channel.id === config.serverInfo.channels.staffChannels.serverAdministrator || message.channel.id === config.serverInfo.channels.staffChannels.discordAdministrator){
		if (glob.getRandomInt(1000) === 6){
			message.channel.send("Hmmm, yes, much discussion <:thonkhonk:690138132343160854>");
		}
	}

	//If enabled creates support tickets
	if (message.channel.id === config.serverInfo.channels.supportTicketChannel && adjustableConfig.misc.SupportTickets === true){
		let content = message.content;
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
			channel.send("Query is: "+content+" - please wait for an administrator to respond to your ticket.");
		});
		message.delete({timeout: 0, reason: "Support ticket creation."});
	}

	//N word filter
	if (message.content.toLowerCase().includes('nigger') || message.content.toLowerCase().includes(" "+"nigger"+" ")){
		if ( message.member.roles.cache.has(config.serverInfo.roles.serverModerator) || message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){}
		else if (message.guild.id === config.serverInfo.serverId && adjustableConfig.misc.nWordFilter){
			message.delete();
			message.channel.send(message.author+" Please dont use that language!");
			bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("Message: "+message.content+" , has been deleted. Author: <@"+message.author,id+">");
		}
		updateNWordCounter(message);
		return;
	}

	//Prevents autoquote from taking from sensitive channels
	if (adjustableConfig.quotes.active && message.guild.id === config.serverInfo.serverId){
		if (autoQuoteNotAllowedCategories.indexOf(parseInt(message.channel.parentID)) === -1){
			if (message.channel.name.toLowerCase().includes("support")){
			}else
			if (glob.getRandomInt(adjustableConfig.quotes.chanceOfBeingQuoted) === 1){
				saveQuoteAutomatic(message);
			}else{
			}
		}
	}

	//XP Gain
	if (message.guild.id === config.serverInfo.serverId){
		try{
			if (!message.content.startsWith(";work")){
				db.mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${message.author.id}'`, (err,rows) => {
					if(err) console.log(err);
					let sql;
					if(rows.length < 1){
						sql = `INSERT INTO xp (id,username,xp,level,canget,message_count) VALUES ('${message.author.id}','${btoa(message.author.username)}', ${economy.genXp()}, 0, '"n"', '1')`;
						db.mainDatabaseConnectionPool.query(sql);
					} else {
						let eligible = rows[0].canget;
						if (eligible === '"y"'){
							let level = parseInt(rows[0].level);
							let newxp = parseInt(rows[0].xp) + economy.genXp();
							let go = economy.levelsystem(newxp,level);
							if (go) {
								level = level+1;
								newxp = 0;
							}
							sql = `UPDATE xp SET xp = ${newxp}, level = ${level}, canget = '"n"', message_count='${parseInt(rows[0].message_count) + 1}' WHERE id = '${message.author.id}'`;
							db.mainDatabaseConnectionPool.query(sql);
							db.giveUserMoney(0.2,message.author.id);
						}else{
							db.mainDatabaseConnectionPool.query(`UPDATE xp SET message_count='${parseInt(rows[0].message_count) + 1}' WHERE id='${message.author.id}'`);
						}
					}
				});

				db.mainDatabaseConnectionPool.query(`SELECT * FROM channel_messages WHERE channel_id = '${message.channel.id}'`, (err,rows) => {
					if (rows.length < 1){
						db.mainDatabaseConnectionPool.query(`INSERT INTO channel_messages (channel_id,message_count) VALUES ('${message.channel.id}', '1')`);
					}else{
						db.mainDatabaseConnectionPool.query(`UPDATE channel_messages SET message_count='${parseInt(rows[0].message_count) + 1}' WHERE channel_id='${message.channel.id}'`);
					}
				});

				setTimeout(function(){
					db.mainDatabaseConnectionPool.query(`UPDATE xp SET canget = '"y"' WHERE id = '${message.author.id}'`);
				}, 180000);
			}
		}catch (e){
			console.log(e);
		}
	}

	//Old larry reference (RIP Larry)
	if (message.content.startsWith("...") && message.content.length === 3){
		message.react("452064991688916995");
	}

	//Pre declaration for usage in the switch case below
	let TrackingCommand = false;
	let member;
	let awnser;

	//Ping Oliverbot
	if (message.content.startsWith("<@!556545106468012052>")){
		TrackingCommand = true;
		message.react("🤔");

		let voiceChannel = message.member.voice.channel;
		if (!voiceChannel){ return; }
		else if (isPlaying){ return message.reply("I am currently busy, please wait :)"); }
		else if (!adjustableConfig.music.pingCommand){
			message.reply("That command is currently disabled, please ask an admin to re-enable it!");
		}else{
			let file = fs.readFileSync("./datafile.json").toString();
			file = JSON.parse(file);
			isPlaying = true;
			let a = glob.getRandomInt(file.pingedSounds.length);
			let randomsong = file.pingedSounds[a].toString();
			voiceChannel.join().then(connection => {
			currentDispatcher = connection
				.play(
           	 		ytdl(randomsong)
        		)
        		.on("finish",() =>{
        			voiceChannel.leave();
        			isPlaying = false;
        		})
        		.on("error",e=>{
        			console.error(e);
       		 		voiceChannel.leave();
       		 		isPlaying = false;
       		 	});
			});
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

	if (!message.content.startsWith(config.prefix)) return;

	let messagearray = message.content.split(" ");
	let command = messagearray[0].substring(1);
	command = command.toLowerCase();

	let isNotAllowed = true;
	for (let i = 0; i< allowedCommands.length;i++){
		if (allowedCommands[i] === command){
			isNotAllowed = false;
		}
	}
	
	if (allowChannels.indexOf(message.channel.id) === -1 && message.author.id != config.ownerID && isNotAllowed)
	{
		return;
	}

	//Split messages into the command and arguments
	let args = messagearray.slice(1);
	let serverid = message.channel.guild.id;
	TrackingCommand = true;

	commands.handler(message,command,args);

	//If command is being tracked, update table
	if (TrackingCommand && adjustableConfig.misc.trackingCommandUsage){
		mainDatabaseConnectionPool.query(`SELECT * FROM commandUsageOliverBot WHERE command = '${command}'`, (err,rows) => {
			if(err) console.log(err);
			let sql;
			if(rows.length < 1){
				sql = `INSERT INTO commandUsageOliverBot (command,TimesUsed) VALUES ('${command}',1)`;
				mainDatabaseConnectionPool.query(sql);
			} else {
				let used = parseInt(rows[0].TimesUsed) + 1;
				sql = `UPDATE commandUsageOliverBot SET TimesUsed = ${used} WHERE command = '${command}'`;
				mainDatabaseConnectionPool.query(sql);
			}
		});
	}

	/////Custom Commands
	customCommands(message,command);
	permanentCommands(message,command);

	return;
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
			}else if (parseInt(event.d.channel_id) !== 607491352598675457 && adjustableConfig.reactions.reactionMenu){
        		break;
    		}
			member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
			reactionRoles.forEach(roleInfo => {
				if (event.d.emoji.name === roleInfo.EmojiName){ 
					let role = bot.guilds.cache.get(event.d.guild_id).roles.cache.get(roleInfo.RoleID);
					member.roles.add(role);
				}
			});
			break;
		case "MESSAGE_REACTION_REMOVE":
			if (parseInt(event.d.channel_id) !== 607491352598675457 && adjustableConfig.reactions.reactionMenu){
        		break;; 
    		}
			member = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(event.d.user_id);
			reactionRoles.forEach(roleInfo => {
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
