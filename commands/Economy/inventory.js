const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const {reply} = require("./../_combinedResponses");

module.exports = {
	name: "inventory",
	help: "List your inventory",
	category: "Economy",
	executeGlobal: (event,args,isMessage) => {

		let ID = event.member.user.id;

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
			if(err) console.log(err);

			if(rows.length === 0){
				reply(event,"You are not in the database.",isMessage);
			}else if(rows.length > 1){
				reply(event,"An error has occured, please contact Archie.",isMessage);
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

					inventoryEmbed.setTitle(`Inventory for ${event.member.user.username}`)
						.setDescription(`${response}`);
				}else{
					let notFound = true;
					for (let i=0;i<inv.length;i++){
						let searchItem = args.join(" ");
						if (inv[i].name === searchItem || inv[i].properName === searchItem){
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
				reply(event,{embeds:[inventoryEmbed]},isMessage);
			}
		});
	}
}
