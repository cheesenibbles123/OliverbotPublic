const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const displays = require("./_displays");

let bot;

module.exports = {
	name: "sell",
	args: 1,
	help: "Sell an item",
	category: "Economy",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: async (message,args) => {

		if (args[0] && args.length < 2){
			
			let ID = message.author.id;
			let item = args[0];

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
							let sellEmbed = new Discord.MessageEmbed()
								.setTitle("Item Sold")
								.setDescription(`Item: ${itemInfo.name} has been sold for ${worth}.\nSold by: ${message.author}`);
							message.channel.send(sellEmbed);
							if (worth > 10000){
								bot.channels.cache.get("718232760388550667").send(sellEmbed);
							}
							displays.handler(0);
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
}
