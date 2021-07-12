const config = require("./../../config.json");
const Discord = require("discord.js");
const mysql = require("mysql");
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
	name: "travel",
	args: 2,
	help: "Search for an item by its ID",
	users: ["337541914687569920"],
	category: "Economy2",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let ship = args[0];
		let port = args.shift().join(" ").toLowerCase();
		
		dbSetup.query(`SELECT * FROM Player WHERE ID='${message.author.id}'`, (err,player) => {
			if (player.length > 1 || player.length === 0){
				message.channel.send("Error fetching player data.");
				console.log(player);
			}else{
				dbSetup.query(`SELECT * FROM Port`, (err,ports) => {
					let port1 = null;
					let port2 = null;

					for (let i=0; i < ports.length; i++){
						if (ports[i].Name.toLowerCase() === port){
							port2 = ports[i];
						}else if (ports[i].ID === player[0].Location){
							port1 = ports[i];
						}
						if (port1 !== null && port2 !== null){
							break;
						}
					}

					if (port1 !== null && port2 !== null){
						let loc1 = JSON.parse(port1.Location);
						let loc2 = JSON.parse(port2.Location);

						let A = Math.abs(loc1.x - loc2.x);
						let B = Math.abs(loc1.y - loc2.y);

						let C = Math.round( (Math.sqrt(A^2 + B^2) * 3.05 /*Scale factor (1129.74KM = 370)*/) * 100) / 100;
						let goods = Math.ceil(C);
						let inv = JSON.parse(player[0].Inventory);

						message.channel.send(`Distance to travel: ${C}KM\nCosting ${goods} goods.`);

						let speed = 9.26;

						// Usage of 1 Consumer Goods per 74K
						if (inv.goods >= Math.ceil(C)){
							message.channel.send(`Setting sail for ${port2.Name}`);
							let sql =`UPDATE Player SET Location=${port2.ID}, LastDeparture=${new Date().getTime()}, ArrivalTime=${Math.floor(new Date().getTime() + ((C/speed) * 3600000))} WHERE ID='${message.author.id}'`;
							console.log(sql);
							dbSetup.query(sql);
						}else{
							message.channel.send(`You are missing ${Math.ceil(C) - inv.goods} goods.`);
						}

					}else{
						message.channel.send("Port not found");
					}

				});
			}
		});
	}
}
