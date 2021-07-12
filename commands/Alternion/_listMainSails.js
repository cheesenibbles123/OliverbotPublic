const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");

module.exports = {
	name: "listmainsails",
	args: 2,
	execute: (message, args) => {

		let id = message.author.id;
		let pubPriv = true;
		if (args[1]){
			pubPriv = (args[1].toLowerCase() !== "public");
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Main Sails - ")
			.setFooter("The formatting is: - `sail_id` : Sail Name -");

		if (pubPriv){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${message.author.id}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT MainSail.Name, MainSail.Display_Name FROM LimitedMainSails INNER JOIN User ON User_ID = User.ID INNER JOIN MainSail ON Allowed_Main_Sail_ID = MainSail.ID WHERE User.Discord_ID='${message.author.id}') UNION (SELECT Name,Display_Name FROM MainSail WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Main Sails"));
					message.channel.send(embed);

				});
			});
		}else{
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM MainSail WHERE Limited!=1`, (err,rows) => {
				
				embed.setDescription(shared.iterateOver(rows,"Main Sails"));
				message.channel.send(embed);

			});
		}
	}
}