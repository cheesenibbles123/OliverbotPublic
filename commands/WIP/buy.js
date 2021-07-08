const config = require("./../../config.json");
const Discord = require("discord.js");
const mysql = require("mysql");

var dbSetup = mysql.createPool({
	connectionLimit : 10,
	host : config.databaseInfo.host,
	user : config.databaseInfo.user,
	password : config.databaseInfo.password,
	database : "Economy",
	multipleStatements: true
});

let bot;

module.exports = {
	name: "buy",
	args: 1,
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
			}else{
				dbSetup.query(`SELECT * FROM Port WHERE ID=${player[0].Location};SELECT count(*) AS count FROM Player WHERE Location=${player[0].Location}`, (err,portInfo) => {
					let port = portInfo[0][0];

					if (port.Items.includes(args[0])){

						message.channel.send(`Found item \`${args[0]}\`at port ${port.Name}!\nCurrently ${portInfo[1][0].count} players are docked there.`);
						let inv = JSON.parse(player[0].Inventory);

						dbSetup.query(`SELECT DefaultLayout.Info FROM DefaultLayout INNER JOIN Ship on Ship.ID=DefaultLayout.ID WHERE Ship.Type='${args[0]}'`, (err,rows) => {
							console.log(rows);
							console.log(inv);
							inv.push(JSON.parse(rows[0].Info));
							console.log(inv);
							let sql = `UPDATE Player SET Inventory='${JSON.stringify(inv)}' WHERE ID='${message.author.id}'`;
							console.log(sql);
							dbSetup.query(sql);
						});

					}else{
						message.channel.send(`Item \`${args[0]}\` not found at port ${port.Name}.\nCurrently ${portInfo[1][0].count} players are docked there.`);
					}
				});
			}
		});
	}
}
