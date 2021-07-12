const config = require("./../../config.json");
const Discord = require("discord.js");
const mysql = require("mysql");
const shared = require("./_sharedFunctions.js");
const db = require('./../../startup/database.js');

var dbSetup = mysql.createPool({
	connectionLimit : 10,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : "Economy"
});

let bot;

module.exports = {
	name: "status",
	args: 2,
	help: "Search for an item by its ID",
	users: ["337541914687569920"],
	category: "Economy2",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		
		dbSetup.query(`SELECT * FROM Player WHERE ID='${message.author.id}'`, (err,player) => {
			if (player.length > 1 || player.length === 0){
				message.channel.send("Error fetching player data.");
				console.log(player);
			}else{
				let inv = JSON.parse(player[0].Inventory);
				let notFound = true;

				for (let i=0; i<inv.length;i++){				
					if (inv[i].TypeID === 0){
						message.channel.send(`Current status:\n${shared.getShipStatus(inv[i].status)}`);
						notFound = false;
						break;
					}
				}

				if (notFound){
					message.channel.send("You do not currently own a ship.");
				}
			}
		});
	}
}