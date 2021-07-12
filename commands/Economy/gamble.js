const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");

let bot;

module.exports = {
	name: "gamble",
	args: 1,
	help: "Search for an item by its ID",
	category: "Economy",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: async (message,args) => {

		if (args[0] && (args.length === 1)){
			let amount = args[0];
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
						.setDescription(`Profit: ${((income * amount) - amount).toFixed(2)}`)
						.setTimestamp();
					message.channel.send(gambleEmbed);	
					// displayRichestUsers();
				}
			});

		}else{
			message.channel.send("Please use the correct format! `;gamble` `amount`");
		}
	}
}
