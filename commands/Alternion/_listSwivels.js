const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "listswivels",
	args: 2,
	execute: (event, args, isMessage) => {

		let ID = event.member.user.id;
		let pubPriv = true;
		if (args[1]){
			pubPriv = (args[1].toLowerCase() !== "public");
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Swivel Skins - ")
			.setFooter("The formatting is: - `swivel_id` : Swivel Name -");

		if (pubPriv){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT Swivel.Name, Swivel.Display_Name FROM LimitedSwivels INNER JOIN User ON User_ID = User.ID INNER JOIN Swivel ON Allowed_Swivel_ID = Swivel.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM Swivel WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Cannons"));
					reply(event,{embeds:[embed]},isMessage);

				});
			});
		}else{
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Swivel WHERE Limited!=1`, (err,rows) => {
				
				embed.setDescription(shared.iterateOver(rows,"Cannons"));
				reply(event,{embeds:[embed]},isMessage);

			});
		}
	}
}