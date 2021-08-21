const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const glob = require("./../_globalFunctions.js");
const {reply} = require("./../_combinedResponses");

let bot;

module.exports = {
	name: "gamble",
	args: 1,
	help: "Search for an item by its ID",
	usage: "<amount>",
	category: "Economy",
	options: [
		{
			name : "amount",
			description : "Amount of coins to gamble",
			type : 4,
			required : true
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {

		if (args[0] && (args.length === 1)){
			let amount = args[0];
			let ID = event.member.user.id;

			db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${ID}'`, (err,rows) =>{
				if (isNaN(amount)){
					reply(event,"Please enter a correct value!",isMessage);
				}else if (amount > parseFloat(rows[0].giraffeCoins)){
					reply(event,"You cannot gamble more than you have!",isMessage);
				}else if (amount < 5){
					reply(event,"You must gamble a minimum of 5 coins!",isMessage);
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
						db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${ID}'`, (err,rows) =>{
							db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${(((rows[0].giraffeCoins * 100) + (((income * amount) - amount) * 100)) / 100).toFixed(2)}' where ID='${ID}'`);
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
					reply(event,{embeds:[gambleEmbed]},isMessage);	
					// displayRichestUsers();
				}
			});

		}else{
			reply(event,"Please use the correct format! `;gamble` `amount`",isMessage);
		}
	}
}
