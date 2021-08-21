const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const displays = require("./_displays");
const {reply} = require("./../_combinedResponses");

let bot;

module.exports = {
	name: "sell",
	args: 1,
	help: "Sell an item",
	usage: "<itemID>",
	category: "Economy",
	options: [
		{
			name : "itemid",
			description : "ID of the item you wish to sell",
			type : 3,
			required : true
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {
		if (args[0] && args.length < 2){
			
			let ID = event.member.user.id;
			let item = args[0];

			if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
				reply(event,"Please enter an appropriate search term!",isMessage);
			}

			db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
				if(err) return console.log(err);
				if(rows.length < 1){
					reply(event,"You are not yet stored on the system! Please send a few messages so that you are added to the database.",isMessage);
				}else if(rows.length > 1){
					reply(event,`Something has gone wrong, please message Archie`,isMessage);
					console.log(rows);
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
								.setDescription(`Item: ${itemInfo.name} has been sold for ${worth}.\nSold by: ${bot.members.cache.get(ID).user}`);
							reply(event,{embeds:[sellEmbed]},isMessage);
							if (worth > 10000){
								bot.channels.cache.get("718232760388550667").send({embeds:[sellEmbed]});
							}
							displays.handler(0);
							// displayRichestUsers();
						});
					}

					if (notFound){
						reply(event,"You cannot sell this item as you do not own it!",isMessage);
					}
				}
			});

		}else{
			reply(event,"Please enter the correct format:\n`;sell` `Item_ID`",isMessage);
		}
	}
}
