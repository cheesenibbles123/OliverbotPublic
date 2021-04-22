const db = require("./../_databaseSetup.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");

module.exports = {
	name: "listcannons",
	args: 2,
	execute: (message, args) => {

		let id = message.author.id;
		let pubPriv = args[1].toLowerCase();
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Cannons - " + pubPriv)
			.setFooter("The formatting is: - `cannon_id` : Cannon Name -");

		if (!pubPriv){
			pubPriv = "private";
		}
		if (pubPriv.toLowerCase() === "private"){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT Flag.Name, Flag.Display_Name FROM LimitedFlags INNER JOIN User ON User_ID = User.ID INNER JOIN Flag ON Allowed_Flag_ID = Flag.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM Flag WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Flags"));
					message.channel.send(embed);

				});
			});
		}else if (pubPriv.toLowerCase() === "public"){
			db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Flag WHERE Limited!=1`, (err,rows) => {

				embed.setDescription(shared.iterateOver(rows,"Flags"));
				message.channel.send(embed);

			});
		}else{
			message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
		}
	}
}