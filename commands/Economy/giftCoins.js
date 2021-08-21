const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");
const {reply} = require("./../_combinedResponses");
let bot;

module.exports = {
	name: "giftcoins",
	args: 2,
	help: "Gift another user coins",
	usage: "@user <amount>",
	category: "Economy",
	options: [
		{
			name : "user",
			description : "User to gift coins to",
			type : 6,
			required : true
		},
		{
			name : "amount"
			description : "Amount of coins to gift",
			type : 4,
			required : true
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {

		let user = glob.getUserFromMention(args[0]);
		let gifterID = event.member.user.id;
		let recieverID = user.id;
		let amount = args[1];

		if (args.length < 3){

			if (isNaN(amount)){
				return reply(event,"Please enter a correct value!",isMessage);
			}else if (amount < 5){
				return reply(event,"You must gift atleast 5 coins!",isMessage);
			}

			db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${gifterID}'`, (err,rows) => {
				if(err) console.log(err);
				let sql;
				if(rows.length < 1){
					reply(event,"You are not in the database! Please send a few messages to get entered!",isMessage);
				} else if(amount > (rows[0].giraffeCoins * 1)){
					reply(event,"You cannot gift money you do not have!",isMessage);
				}else{
					db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${recieverID}'`, (err,rows2) => {
						let giftCoinsEmbed = new Discord.MessageEmbed().setTitle("Coins Gifted");
						if (rows2.length < 1){
							db.mainDatabaseConnectionPool.query(`INSERT INTO inventoryGT (ID,giraffeCoins,inventory) VALUES ('${recieverID}','${amount}','[]')`);
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
							giftCoinsEmbed.setDescription(`Added user <@${recieverID}> to the database\nGifted user: ${amount}GC from <@${gifterID}>`);
						}else{
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows2[0].giraffeCoins * 1) + (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${recieverID}'`);
							db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET giraffeCoins='${(rows[0].giraffeCoins * 1) - (parseFloat(amount).toFixed(2) * 1)}' WHERE ID='${gifterID}'`);
							giftCoinsEmbed.setDescription(`<@${gifterID}> gifted user <@${recieverID}>, amount: ${amount}GC`);
						}
						reply(event,{embeds:[giftCoinsEmbed]},isMessage);
						if ((parseFloat(amount).toFixed(2) * 1) >= 1000)
						{
							db.configurationDatabaseConnectionPool.query("SELECT * FROM economyInformation", (err,rows) => {
								for (let i = 0; i < rows.length; i++)
								{
									if (rows[i].name == "bigTransactionLoggingChannel")
									{
										bot.channels.cache.get(rows[i].channelID).send({embeds:[giftCoinsEmbed]});
										// displayRichestUsers();
									}
								}
							});
						}
					});
				}
			});

		}else{
			reply(event,"Please enter the correct format:\n`;giftCoins` `@userToGiftTo` `amount`",isMessage);
		}
	}
}
