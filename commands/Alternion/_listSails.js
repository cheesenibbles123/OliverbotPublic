const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "listsails",
	args: 2,
	execute: (event, args, isMessage) => {

		let ID = event.member.user.id;
		let pubPriv = true;
		if (args[1]){
			pubPriv = (args[1].toLowerCase() !== "public");
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Secondary Sails - " + pubPriv)
			.setFooter("The formatting is: - `sail_id` : Sail Name -");

		if (pubPriv){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT NormalSail.Name, NormalSail.Display_Name FROM LimitedSails INNER JOIN User ON User_ID = User.ID INNER JOIN NormalSail ON Allowed_Sail_ID = NormalSail.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM NormalSail WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Sails"));
					reply(event,{embeds:[embed]},isMessage);

				});
			});
		}else{
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM NormalSail WHERE Limited!=1`, (err,rows) => {

				embed.setDescription(shared.iterateOver(rows,"Sails"));
				reply(event,{embeds:[embed]},isMessage);

			});
		}
	}
}