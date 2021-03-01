const db = require("./../databaseSetup");
const config = require("./../../config.json");
const glob = require("./../globalFunctions");
const issueEmbed = require("./../issueEmbed");
const displays = require("./displays");

const Discord = require("discord.js");
var bot;

exports.handler = function handler(message,command,args){
	switch (command){
		case "beg":
			beg();
			break;
		case "work":
			work(message);
			break;
		case "purchase":
			purchaseItem(message.author.id,args[0],message,args);
			break;
		case "inventory":
			listInventory(message.author.id,message,args);
			break;
		case "sell":
			sellItem(message.author.id,args[0],message);
			break;
		case "giftcoins":
			let user = glob.getUserFromMention(args[0]);
			giftUserCoins(message.author.id,user.id,args[1],message,args);
			break;
		case "gamble":
			gambleMoney(args[0],message,args);
			break;
		case "search":
			searchForItem(message,args);
			break;
	}
}

exports.initEconomy = function initEconomy(){
	displays.initDisplays();
	bot = require("./../../oliverbot.js").bot;
}

exports.levelsystem = function levelsystem(xp,currentlevel){
	if (currentlevel === 0 && xp > 400){
		return true;
	}else{
		if ( xp >= ( currentlevel * db.xpdetails.levelupfactor )){
			return true;
		}else{
			return false;
		}
	}
}

exports.genXp = function genXp(){
	return Math.floor(Math.random()*(db.xpdetails.max+db.xpdetails.min+1))+db.xpdetails.max;
}

function beg(message){
	let num = blob.getRandomInt(300);
	if (num == 243){
		let amount = glob.getRandomInt(20);
		db.giveUserMoney(parseFloat(amount).toFixed(2) * 1);
		message.channel.send(`Considering how desperate you are, I think I can spare you ${amount}GC, consider yourself lucky.`);
	}else{
		glob.loadFromDatafile(command,"",message);
	}
}

function work(message){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows,fields) =>{
		let result = glob.getRandomInt(30);
		let workingEmbed = new Discord.MessageEmbed().setTimestamp();
		let inv = JSON.parse(rows[0].inventory);
		workingEmbed.setTitle("Result");

		if (rows.length != 0 && rows.length < 2)
		{
			if (rows[0].lastWorked === null)
			{
				db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${message.author.id}'`);
				let income = 10;
				if (rows[0].inventory.length)
				{
					for (let i = 0; i < inv.length; i++)
					{
						if (inv[i].type === 'income')
						{
							income += inv[i].value;
						}
					}
				}
				db.giveUserMoney(income, message.author.id);
				if (rows[0].giraffeCoins){
					workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(income * 100)) / 100).toFixed(2)}`);
				}else{
					workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${income}`);
				}

			}else
			{
				let timeDelay = 82800000;
				if ( (parseInt(rows[0].lastWorked) + timeDelay) < (new Date().getTime()) )
				{
					let income = 10;
					for (let i = 0; i < inv.length; i++)
					{
						if (inv[i].type === 'income')
						{
							income += inv[i].value;
						}
					}
					db.giveUserMoney(income, message.author.id);
					db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${message.author.id}'`);
					workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(income * 100)) / 100).toFixed(2)}`);
				}
				else
				{
					let days = [
 				 		'Sun',
 				 		'Mon',
				 		'Tue',
 						'Wed',
 				 		'Thu',
 				 		'Fri',
 				 		'Sat'
					]

					let time = new Date(parseInt(rows[0].lastWorked)).getTime() + timeDelay;
					let date = new Date(time);
					let timeLeft = new Date(time - new Date());

					let hrs = checkIfLessThan10(date.getHours());
					let min = checkIfLessThan10(date.getMinutes());
					let sec = checkIfLessThan10(date.getSeconds());
					
					let hrsLeft = checkIfLessThan10(timeLeft.getHours());
					let minLeft = checkIfLessThan10(timeLeft.getMinutes());
					let secLeft = checkIfLessThan10(timeLeft.getSeconds());

					let finalDate = `${days[date.getDay()]} ${hrs} : ${min} : ${sec}`;
					let remainingTime = `${hrsLeft} : ${minLeft} : ${secLeft}`;
					workingEmbed.setDescription(`You cannot work yet! You must wait until ${finalDate} CEST\nTime Remaining:  ${remainingTime}`);
				}
			}
			message.channel.send(workingEmbed);
			//displayRichestUsers();
		}else{
			message.channel.send(issueEmbed.grabEmbed(3,`ERROR : Rows issue with economy work!\n - ${rows} -`));
		}
	});

	return;
}

function checkIfLessThan10(input){
	let returnResult = "";
	if (parseInt(input) < 10)
	{
		returnResult += '0' + input;
	}else{
		returnResult += input;
	}

	return returnResult;
}

function purchaseItem(ID,item,message,args){

	if (args[0] && args.length < 3){

		if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
			message.channel.send("Please enter an appropriate search term!");
		}

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
			if (rows.length < 1){
				message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
			}
			db.mainDatabaseConnectionPool.query(`SELECT * FROM shop WHERE name='${item}'`, (err2, rows2) => {
				if (rows2.length < 1){
					message.channel.send( "Please make sure you entered the correct name!");
				}else if(rows2.length > 1){
					message.channel.send(`Could you be a bit more specific? Using your search term I have ${rows.length} results.`);
				}else if (parseFloat(rows[0].giraffeCoins) < (rows2[0].value * (parseInt(rows2[0].inStock)) / rows2[0].initialStock)){
					message.channel.send(`You have insufficient coins to afford this item! You need another ${(rows2[0].value * (parseInt(rows2[0].inStock)) / rows2[0].initialStock) - rows[0].giraffeCoins}GC`);
				}else if(parseInt(rows2[0].inStock) <= 0){
					message.channel.send( "This item is currently out of stock! Try get someone else to sell theirs so you can buy it, or wait for the next increase in stock!");
				}else{

					let inventory = JSON.parse(rows[0].inventory);
					let itemInfo = JSON.parse(rows2[0].info);
					let continueAnyway = true;

					db.mainDatabaseConnectionPool.query(`SELECT * FROM shopTypeLimits WHERE type='${itemInfo.type}'`, (err,rows3) => {
						let counter = 0;
						let maxCount = rows3[0].maxCount;
						if (itemInfo.type === "constructionResources"){
							let resourceAmountPurchased = parseInt(args[1]);
							if (isNaN(resourceAmountPurchased)){
								message.channel.send("Please enter a valid amount!");
								continueAnyway = false;
							}else{
								if (((rows2[0].value * (parseInt(rows2[0].inStock)) / rows2[0].initialStock) * resourceAmountPurchased) > parseFloat(rows[0].giraffeCoins)){
									message.channel.send(`You have insufficient coins to afford this item! You need another ${((rows2[0].value * (parseInt(rows2[0].inStock))/ rows2[0].initialStock) * resourceAmountPurchased) - rows[0].giraffeCoins}GC`);
									continueAnyway = false;
								}
							}
						}
						if (continueAnyway){
							for (i=0; i< inventory.length; i++){
									if (inventory[i].name === rows2[0].name){
										if (inventory[i].type !== "constructionResources"){
											message.channel.send("You already own that item!");
											continueAnyway = false;
										}
									}else if(inventory[i].type === itemInfo.type){
										counter = counter + 1;
										if (counter >= maxCount){
											message.channel.send("You already own an item of this type!");
											continueAnyway = false;
										}
									}
								
							}
						}
						if (continueAnyway){
							let fancyPurchaseEmbed = new Discord.MessageEmbed()
								.setTitle("Item Purchased")
								.setDescription(`${itemInfo.desc}`);

							if (itemInfo.type.toString().toLowerCase().includes("megaship")){
								fancyPurchaseEmbed.addField("Basic",`Name: ${itemInfo.name}\nCrew: ${itemInfo.crew}`,true)
										.addField("Detail",`Type: ${itemInfo.cannons}\nNationality: ${itemInfo.nationality}`,true);
							}else if (itemInfo.type.toString().toLowerCase().includes("ship")){
								fancyPurchaseEmbed.addField("Info",`Name: ${itemInfo.name}\nCrew: ${itemInfo.crew}`,true)
										.addField("Detail",`Cannons: ${itemInfo.cannons}\nType: ${itemInfo.type}`,true);
							}else{
								fancyPurchaseEmbed.addField("Info", `Name: ${itemInfo.name}`);
							}

							fancyPurchaseEmbed.setTimestamp();
							let customizable = false;
							if (itemInfo.customizable === "yes"){
								customizable = true;
							}
							if (itemInfo.type === "constructionResources")
							{
								let doesntExist = true;

								for (i=0; i < inventory.length; i++){
									if (inventory[i].name === rows2[0].name){
										inventory[i].amount += parseInt(args[1]);
										doesntExist = false;
										break;
									}
								}
								if (doesntExist){
									inventory.push( {"name" : rows2[0].name, "type" : itemInfo.type, "value" : (rows2[0].value / 2), "properName" : itemInfo.name, "amount" : parseInt(args[1])} );
								}

								db.mainDatabaseConnectionPool.query(`update shop set inStock = ${rows2[0].inStock - parseInt(args[1])} where name='${item}'`);

							}else{
								inventory.push( {"name" : rows2[0].name, "type" : itemInfo.type, "customizable" : customizable, "value" : (rows2[0].value / 2), "properName" : itemInfo.name} );
								db.mainDatabaseConnectionPool.query(`update shop set inStock = ${rows2[0].inStock - 1} where name='${item}'`);
							}
							db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${rows[0].giraffeCoins - (rows2[0].value * (parseInt(rows2[0].inStock))/ rows2[0].initialStock)}', inventory='${JSON.stringify(inventory)}' where ID = '${ID}'`);
							message.channel.send(fancyPurchaseEmbed);
							if (parseInt(rows2[0].value) > 5000){
								let desc = "";
								if (itemInfo.type !== "constructionResources"){
									desc = `${itemInfo.name}\nPurchased by <@${message.author.id}> for ${rows2[0].value * (parseInt(rows2[0].inStock) / rows2[0].initialStock)}GC`;
								}else{
									desc = `${itemInfo.name} (${parseInt(args[1])})\nPurchased by <@${message.author.id}> for ${rows2[0].value * (parseInt(rows2[0].inStock) / rows2[0].initialStock)}GC`
								}
								let logEmbed = new Discord.MessageEmbed()
									.setTitle("Transaction Occured")
									.setDescription(desc);
								bot.channels.cache.get("718232760388550667").send(logEmbed);
							}
							updateShopWindow();
							// displayRichestUsers();
						}
					});	
				}
			});
		});

	}else{
		message.channel.send("Please enter the correct format:\n`;purchase` `Item To Purchase`\nTo search for an item to get the purchasing info use the `;search` command!");
	}
}

function searchForItem(message,args){
	if (typeof(args) !== 'string' && args.length >= 1){
		let item = args[0];
		if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
			message.channel.send("Please enter an appropriate search term!");
		}

		if (Array.isArray(item)){
			item = item.join(' ');
		}
		item = item.toLowerCase().replace(/ /g,"");

		db.mainDatabaseConnectionPool.query(`SELECT * FROM shop WHERE name LIKE '%${item}%'`, (err,rows) => {
			if(err) console.log(err);
			let sql;
			if(rows.length < 1){
				message.channel.send("That item does not exist.");
			} else if(rows.length > 1 && rows.length < 10){
				let allNames = "Results:\n```\n";
				for (i=0; i< rows.length; i++){
					allNames = allNames + rows[i].name + "\n";
				}
				message.channel.send(allNames+"```");
			}else if( rows.length >= 10){
				message.channel.send("Could you be more specific? Using your term I got " + rows.length + " results.");
			}else{
				let itemInfo = JSON.parse(rows[0].info);
				let searchEmbed = new Discord.MessageEmbed()
					.setTitle(`${itemInfo.name}`)
					.setDescription(`${itemInfo.desc}`);
				if (itemInfo.type.includes("megaShip")){
					searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}\nNationality: ${itemInfo.nationality}`,true)
						.addField(`More Info`,`[More historical information about this ship can be found here](${itemInfo.link})`,true);
				}else if (itemInfo.type.includes("Ship")){
					searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}`);
				}else{
					searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}`);
				}

				searchEmbed.addFields({name : `Value`, value: `Cost: ${rows[0].value * (parseInt(rows[0].inStock) / rows[0].initialStock)}\nIn Stock: ${rows[0].inStock}`,inline: true},{name : `To Purchase`, value: "`"+`;purchase`+"` `"+`${rows[0].name}`+"`", inline: true});
				message.channel.send(searchEmbed);
			}
		});
	}else{
		message.channel.send("Please enter the correct format:\n`;search` `Item {ID}/{Name}`");
	}
}

function listInventory(ID,message,args){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);

		if(rows.length === 0){
			message.channel.send("You are not in the database.");
		}else if(rows.length > 1){
			message.channel.send("An error has occured, please contact Archie.");
		}else{
			let inv = JSON.parse(rows[0].inventory);
			let response = "";
			let inventoryEmbed = new Discord.MessageEmbed();
			if (!args.length >= 1){
				if (inv.length > 0){
					for (i=0;i<inv.length;i++){
						response = response + inv[i].properName + "\n";
					}
				}else{
					response = "N/A";
				}

				inventoryEmbed.setTitle(`Inventory for ${message.author.username}`)
					.setDescription(`${response}`);
			}else{
				let notFound = true;
				for (let i=0;i<inv.length;i++){
					if (inv[i].name === args.join(" ") || inv[i].properName === args.join(" ")){
						notFound = false;
						inventoryEmbed.setTitle(inv[i].name);
						switch (inv[i].type){
							case "constructionResources":
								inventoryEmbed.setDescription(`Amount: ${inv[i].amount}`)
								break;
							default:
								inventoryEmbed.setDescription("Amount: 1");
								break;
						}
					}
				}
				if (notFound){
					inventoryEmbed.setDescription("Either you do not own this item, or you didn't type it correctly.");
				}
			}
			message.channel.send(inventoryEmbed);
		}
	});

	return;
}

function sellItem(ID,item,message){

	if (args[0] && args.length < 2){

		if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
			message.channel.send("Please enter an appropriate search term!");
		}

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
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
						worth = inventory[i].value;
					}
				}

				if (!notFound){
					db.mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
						if(err) console.log(err);
						if (JSON.stringify(inventory).includes("null")){
							inventory = '[]';
						}
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
						db.mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
						let itemInfo = JSON.parse(rows2[0].info);
						let sellEmbed = new Discord.MessageEmbed().setTitle("Item Sold").setDescription(`Item: ${itemInfo.name} has been sold for ${worth}.\nSold by: ${message.author}`).setTimeStamp();
						message.channel.send(sellEmbed);
						bot.channels.cache.get(config.serverInfo.channels.economy.bigTransactionLoggingChannel).send(sellEmbed);
						updateShopWindow();
						// displayRichestUsers();
					});
				}

				if (notFound){
					message.channel.send("You cannot sell this item as you do not own it!");
				}
			}
		});

	}else{
		message.channel.send("Please enter the correct format:\n`;sell` `Item Name`");
	}
}

function giftUserCoins(gifterID,recieverID,amount,message,args){

	if (args.length < 3){

		if (isNaN(amount)){
			message.channel.send("Please enter a correct value!");
			return;
		}else if (amount < 5){
			message.channel.send("You must gift atleast 5 coins!");
			return;
		}

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${gifterID}'`, (err,rows) => {
			if(err) console.log(err);
			let sql;
			if(rows.length < 1){
				message.channel.send("You are not in the database! Please send a few messages to get entered!");
			} else if(amount > (rows[0].giraffeCoins * 1)){
				message.channel.send("You cannot gift money you do not have!");
			}else{
				db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${recieverID}'`, (err,rows2) => {
					let giftCoinsEmbed = new Discord.MessageEmbed().setTitle("User Gifted");
					if (rows2.length < 1){
						db.mainDatabaseConnectionPool.query(`INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${recieverID}','${amount}','[]')`);
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
						giftCoinsEmbed.setDescription(`Added user <@${recieverID}> to the database\nGifted user: ${amount}GC from <@${gifterID}>`);
					}else{
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows2[0].giraffeCoins * 1) + (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${recieverID}'`);
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
						giftCoinsEmbed.setDescription(`<@${gifterID}> gifted user <@${recieverID}>, amount: ${amount}GC`);
					}
					message.channel.send(giftCoinsEmbed);
					if ((parseFloat(amount).toFixed(2) * 1) >= 1000)
					{
						db.configurationDatabaseConnectionPool.query("SELECT * FROM economyInformation", (err,rows) => {
							for (let i = 0; i < rows.length; i++)
							{
								if (rows[i].name == "bigTransactionLoggingChannel")
								{
									bot.channels.cache.get(rows[i].channelID).send(giftCoinsEmbed);
									// displayRichestUsers();
								}
							}
						});
					}
				});
			}
		});

	}else{
		message.channel.send("Please enter the correct format:\n`;giftCoins` `@userToGiftTo` `amount`");
	}
}

function giftUserItem(gifterID,reciever,item,message){
	let user = glob.getUserFromMention(reciever);
	user = user.id;
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate item!");
	}

	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
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
				db.mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					db.mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
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
}

function gambleMoney(amount,message,args){
	if (args[0] && (args.length === 1)){
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
			if (isNaN(amount)){
				message.channel.send("Please enter a correct value!");
			}else if (amount > parseFloat(rows[0].giraffeCoins)){
				message.channel.send("You cannot gamble more than you have!");
			}else if (amount < 5){
				message.channel.send("You must gamble a minimum of 5 coins!");
			}else{
				let result = glob.getRandomInt(30);
				switch(true){
					case result < 20:
						income = 0;
						break;
					case result < 24:
						income = 1;
						break;
					case result < 26:
						income = 1.2;
						break;
					case result < 28:
						income = 1.4;
						break;
					case result < 30:
						income = 2;
						break;
				}
				if ((income * amount) !== amount){
					db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${message.author.id}'`, (err,rows) =>{
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(((rows[0].giraffeCoins * 100) + (((income * amount) - amount) * 100)) / 100).toFixed(2)}' where ID='${message.author.id}'`);
					});
				}
				if (((income * amount) - amount).toFixed(2) < 0){
					db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='thereserve'`, (err,rows) =>{
						db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${Math.abs((((rows[0].giraffeCoins * 100) + ((income * amount) * 100)) / 100).toFixed(2))}' where ID='thereserve'`);
					});
				}
				let gambleEmbed = new Discord.MessageEmbed()
					.setTitle("Gamble")
					.setDescription(`Income: ${((income * amount) - amount).toFixed(2)}`)
					.setTimestamp();
				message.channel.send(gambleEmbed);	
				// displayRichestUsers();
			}
		});

	}else{
		message.channel.send("Please use the correct format! `;gamble` `amount`");
	}
}

function editMsg(contents,channelID,msgID){
	bot.channels.cache.get(channelID).messages.fetch(msgID).then( msg => {
		msg.edit(contents);
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