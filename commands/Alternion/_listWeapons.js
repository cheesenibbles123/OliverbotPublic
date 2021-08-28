const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "listweapons",
	args: 2,
	execute: (event, args, isMessage) => {

		let ID = event.member.user.id;
		let pubPriv = args[1].toLowerCase();
		let embed = new Discord.MessageEmbed()
			.setTitle("Available Weapon Skins - " + pubPriv)
			.setFooter("The formatting is: - `Skin_id` : Skin Name -");

		if (!pubPriv){
			pubPriv = "private";
		}
		if (pubPriv.toLowerCase() === "private"){
			db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
				db.alternionConnectionPool.query(`(SELECT WeaponSkin.Name, WeaponSkin.Display_Name FROM LimitedWeaponSkins INNER JOIN User ON User_ID = User.ID INNER JOIN WeaponSkin ON Allowed_Weapon_Skin_ID = WeaponSkin.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM WeaponSkin WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,"Flags"));
					reply(event,{embeds:[embed]},isMessage);

				});
			});
		}else{
			reply(event,"Please ensure you have entered valid terms. Currently supported: `Private`.",isMessage);
		}
	}
}