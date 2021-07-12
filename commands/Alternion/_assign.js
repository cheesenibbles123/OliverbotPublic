const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");

module.exports = {
	name: "assign",
	args: 4,
	help: "Assigns an item to your loadout",
	execute: (message,args) => {

		let embed = new Discord.MessageEmbed()
			.setTitle("Assign");

		let dbData = getTablesAndFields(args[1].toLowerCase());
		let table1Name = dbData.tbl1N;
		let table2Name = dbData.tbl2N;
		let fieldName = dbData.field1Name;
		let table2Field = dbData.field2Name;

		if (table1Name != "NA"){
			db.alternionConnectionPool.query(`SELECT Team_ID FROM User WHERE Discord_ID=${message.author.id}`, (err,userRow) => {
				db.alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Display_Name, ${table1Name}.ID, ${table1Name}.Value FROM ${table2Name} INNER JOIN User ON User_ID = User.ID INNER JOIN ${table1Name} ON ${table2Field} = ${table1Name}.ID WHERE User.Discord_ID='${message.author.id}'`, (err, rows) => {
					db.alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Team_ID, ${table1Name}.Display_Name, ${table1Name}.ID, ${table1Name}.Value FROM ${table1Name} WHERE Limited!=True OR ( Team_ID=${userRow[0].Team_ID} AND IF ( ${userRow[0].Team_ID} != 0, 1, 0) = 1 )`, (err, rows2) => {
						let found = false;
						let assignedBadge = "";
						if (rows){
							for (let i = 0; i < rows.length; i++){
								if (args[2] === rows[i].Name){
									db.alternionConnectionPool.query(`UPDATE User SET ${fieldName}=${rows[i].ID} WHERE Discord_ID='${message.author.id}'`);
									console.log(`Setting: -${message.author.id}- ==> -${rows[i].Name}-`);
									assignedBadge = rows[i].Display_Name;
									found = true;
									break;
								}
							}
						}

						if (rows2 && !found){
							for (let i = 0; i < rows2.length; i++){
								if (args[2] === rows2[i].Name){
									db.alternionConnectionPool.query(`UPDATE User SET ${fieldName}=${rows2[i].ID} WHERE Discord_ID='${message.author.id}'`);
									console.log(`Setting: -${message.author.id}- ==> -${rows2[i].Name}-`);
									assignedBadge = rows2[i].Display_Name;
									found = true;
									break;
								}
							}
						}

						if (!found){
							embed.setDescription("You cannot assign that Item!");
						}else{
							embed.setDescription(`Assigned skin: **${assignedBadge}**`);
							shared.globalJsonUpdate();
						}

						message.channel.send(embed);
					});
				});
			});
		}else{
			message.channel.send("That is not a valid item to assign!");
		}
	}
}

function getTablesAndFields(inputType){
	let table1Name = "";
	let table2Name = "";
	let fieldName = "";
	let table2Field = "";

	switch (inputType){
			case "badge":
				table1Name = "Badge";
				table2Name = "LimitedBadges";
				fieldName = "Badge_ID";
				table2Field = "Allowed_Badge_ID";
				break;
			case "sail":
				table1Name = "NormalSail";
				table2Name = "LimitedSails";
				fieldName = "Sail_ID";
				table2Field = "Allowed_Sail_ID";
				break;
			case "mainsail":
				table1Name = "MainSail";
				table2Name = "LimitedMainSails";
				fieldName = "Main_sail_ID";
				table2Field = "Allowed_Main_Sail_ID";
				break;
			case "goldmask":
				table1Name = "GoldMask";
				table2Name = "LimitedGoldMask";
				fieldName = "Mask_ID";
				table2Field = "Allowed_Gold_Mask_ID";
				break;
			case "cannon":
				table1Name = "Cannon";
				table2Name = "LimitedCannons";
				fieldName = "Cannon_ID";
				table2Field = "Allowed_Cannon_ID";
				break;
			case "swivel":
				table1Name = "Swivel";
				table2Name = "LimitedSwivels";
				fieldName = "Swivel_ID";
				table2Field = "Allowed_Swivel_ID";
				break;
			case "navyflag":
				table1Name = "Flag";
				table2Name = "LimitedFlags";
				fieldName = "Flag_Navy_ID";
				table2Field = "Allowed_Flag_ID";
				break;
			case "pirateflag":
				table1Name = "Flag";
				table2Name = "LimitedFlags";
				fieldName = "Flag_ID";
				table2Field = "Allowed_Flag_ID";
				break;
			case "musket":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Musket_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "blunderbuss":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Blunderbuss_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "nockgun":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Nockgun_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "handmortar":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Handmortar_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "pistol":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Standard_Pistol_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "shortpistol":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Short_Pistol_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "duckfoot":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Duckfoot_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "matchlock":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Matchlock_Revolver_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "annely":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Annely_Revolver_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "axe":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Axe_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "rapier":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Rapier_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "dagger":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Dagger_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "bottle":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Bottle_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "cutlass":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Cutlass_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "pike":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Pike_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "tomahawk":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Tomohawk_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "spyglass":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Spyglass_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "grenade":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Grenade_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "healitem":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "HealItem_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "teacup":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "TeaCup_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "teawater":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "TeaWater_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "bucket":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Bucket_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "hammer":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "Hammer_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			case "atlas":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				fieldName = "atlas01_ID";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			default:
				table1Name = "NA";
				break;
		}

		return {tbl1N : table1Name, tbl2N : table2Name, field1Name : fieldName, field2Name : table2Field};
}