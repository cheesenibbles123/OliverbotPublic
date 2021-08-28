const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "listmortars",
	args: 2,
	execute: (event, args, isMessage) => {

		let ID = event.member.user.id;
		let pubPriv = false;
		if (args[1]){
			pubPriv = args[1].toLowerCase();
		}else{
			pubPriv = "private";
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Mortar Skins - ")
			.setFooter("The formatting is: - `mortar_id` : Mortar Name -");
		
		if (pubPriv.toLowerCase() === "private"){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT Mortar.Name, Mortar.Display_Name FROM LimitedMortars INNER JOIN User ON User_ID = User.ID INNER JOIN Mortar ON Allowed_Mortar_ID = Mortar.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM Mortar WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Mortars"));
					reply(event,{embeds:[embed]},isMessage);

				});
			});
		}else if (pubPriv.toLowerCase() === "public"){
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Mortar WHERE Limited!=1`, (err,rows) => {

				embed.setDescription(shared.iterateOver(rows,"Mortars"));
				reply(event,{embeds:[embed]},isMessage);

			});
		}else{
			reply(event,"Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.",isMessage);
		}
	}
}