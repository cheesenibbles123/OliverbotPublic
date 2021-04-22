const db = require("./../_databaseSetup.js");
const glob = require("./../_globalFunctions.js");
const Discord = require("discord.js");
const displays = require("./_displays");

let bot;

module.exports = {
	name: "purchase",
	args: 1,
	help: "Purchase an item",
	category: "Economy",
	init: (botInstance) => {
		bot = botInstance;
		displays.initDisplays(botInstance);
	},
	execute: async (message,args) => {

		if (args[0] && args.length < 3){

			let item = args[0];
			let ID = message.author.id;

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
								displays.handler(0);
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
}