const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");
let bot;

module.exports = {
	name: "giftcoins",
	args: 2,
	help: "Gift another user coins",
	usage: "@user <amount>",
	category: "Economy",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: async (message,args) => {

		let user = glob.getUserFromMention(args[0]);
		let gifterID = message.author.id;
		let recieverID = user.id;
		let amount = args[1];

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
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
							giftCoinsEmbed.setDescription(`Added user <@${recieverID}> to the database\nGifted user: ${amount}GC from <@${gifterID}>`);
						}else{
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows2[0].giraffeCoins * 1) + (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${recieverID}'`);
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
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
}
