const db = require("./../../startup/database.js");
const Discord = require("discord.js");

module.exports = {
	name: "inventory",
	args: 0,
	help: "List your inventory",
	category: "Economy",
	execute: async (message,args) => {

		let ID = message.author.id;

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
	}
}
