const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");

module.exports = {
	name: "listcannons",
	args: 2,
	execute: (message, args) => {

		let id = message.author.id;
		let pubPriv = true;
		if (args[1]){
			pubPriv = (args[1].toLowerCase() !== "public");
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Cannon Skins - ")
			.setFooter("The formatting is: - `cannon_id` : Cannon Name -");

		if (pubPriv){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${message.author.id}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT Cannon.Name, Cannon.Display_Name FROM LimitedCannons INNER JOIN User ON User_ID = User.ID INNER JOIN Cannon ON Allowed_Cannon_ID = Cannon.ID WHERE User.Discord_ID='${message.author.id}') UNION (SELECT Name,Display_Name FROM Cannon WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Cannons"));
					message.channel.send(embed);

				});
			});
		}else{
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Cannon WHERE Limited!=1`, (err,rows) => {
				
				embed.setDescription(shared.iterateOver(rows,"Cannons"));
				message.channel.send(embed);

			});
		}
	}
}