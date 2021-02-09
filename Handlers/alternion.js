const db = require("./databaseSetup");
const Discord = require("discord.js");
const config = require("./../config.json");
const fs = require('fs');
const issueEmbed = require("./issueEmbed");

var alternionJsonFile = null;

exports.alternionMainhandler = function alternionHandler(message,command,args){
	let alternionHandlerEmbed = new Discord.MessageEmbed();
	switch (args[0].toLowerCase()){

		case "listbadges":
			alternionHandlerEmbed.setTitle("Available Restricted Badges")
				.setFooter("The formatting is: - `badge_id` : Badge Name -");
			getBadges(message,message.author.id,args[1],alternionHandlerEmbed);
			break;

		case "help":
			if (args[1]){
				switch (args[1].toLowerCase()){
					case "listbadges":
						alternionHandlerEmbed.setDescription("Lists all limited badges that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listsails":
						alternionHandlerEmbed.setDescription("Lists all limited sails that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listmainsails":
						alternionHandlerEmbed.setDescription("Lists all limited main sails that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listcannons":
						alternionHandlerEmbed.setDescription("Lists all limited cannons that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listweapons":
						alternionHandlerEmbed.setDescription("Lists all limited weapon skins that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "listflags":
						alternionHandlerEmbed.setDescription("Lists all limited weapon skins that you have access to.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "assign":
						alternionHandlerEmbed.setDescription("Assign an asset to be used.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					case "overview":
						alternionHandlerEmbed.setDescription("Lists your currently selected setup.")
							.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
						sendAlternionEmbed(message,alternionHandlerEmbed,false);
						break;
					default:
						break;
				}
			}else{
				alternionHandlerEmbed.setTitle("Help Menu")
					.setDescription("Default usage:\n`;Alternion` `Feature`\nCurrently supported features:\n- Help\n- ListBadges\n- ListSails\n- ListMainSails\n- ListWeapons\n- Assign\n- Overview\nUse **;Blackwake Alternion Help** `FEATURE` for more help on each feature")
					.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			}
			break;

		case "assign":
			alternionHandlerEmbed.setTitle("Assigning Item");
			assignItemSkin(message,args,alternionHandlerEmbed);
			break;

		case "whatsmyid":
			alternionHandlerEmbed.setTitle("Your ID");
			getUserID(message,alternionHandlerEmbed);
			break;

		case "overview":
			getAlternionOverview(message,alternionHandlerEmbed);
			break;

		case "listsails":
			alternionHandlerEmbed.setTitle("Available Restricted Sails")
				.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
			getNormalSails(message,message.author.id,args[1],alternionHandlerEmbed);
			break;

		case "listmainsails":
			alternionHandlerEmbed.setTitle("Available Restricted Main Sails")
				.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
			getMainSails(message,message.author.id,args[1],alternionHandlerEmbed);
			break;

		case "listcannons":
			alternionHandlerEmbed.setTitle("Available Restricted Cannons")
				.setFooter("The formatting is: - `Cannon_ID` : Cannon Name -");
			getCannons(message,message.author.id,args[1],alternionHandlerEmbed);
			break;

		case "listflags":
			alternionHandlerEmbed.setTitle("Available Restricted Flags Skins")
				.setFooter("The formatting is: - `Skin_ID` : Skin Name -");
			getFlags(message,message.author.id,args[1],alternionHandlerEmbed);
			break;

		case "listweapons":
			alternionHandlerEmbed.setTitle("Available Restricted Weapon Skins")
				.setFooter("The formatting is: - `Skin_ID` : Skin Name -");
			getWeaponSkins(message,message.author.id,alternionHandlerEmbed);
			break;

		case "manage":
			alternionHandlerEmbed.setTitle("Managing User...");
			teamLeaderHandler(message,args[1].toLowerCase(),args[2],alternionHandlerEmbed);
			break;

		case "listmembers":
			teamLeaderFetchList(message,message.author.id,alternionHandlerEmbed);
			break;

		case "forceupdate":
			teamLeaderForceLoadout(message,message.author.id,args[1].toLowerCase(),args[2],alternionHandlerEmbed);
			break;

		case "searchuser":
			teamLeaderSearch(message,args[1],args[2],alternionHandlerEmbed);
			break;

		default:
			alternionHandlerEmbed.setDescription("You have entered an incorrect command, please try again.\nUse `;Alternion Help` to get a list of supported commands!");
			sendAlternionEmbed(message,alternionHandlerEmbed,false);
			break;
	}
}

function getUserID(message,embed){
	db.alternionConnectionPool.query(`SELECT ID FROM User WHERE discord_ID='${message.author.id}'`, (err,rows) => {
		if (rows){
			if (rows.length < 1){
				message.channel.send("You are currently not in the database.");
			}else if (rows.length > 1){
				message.channel.send("There seems to be an issue, you are recorded multiple times.");
			}else{
				embed.setDescription("`" + rows[0].ID + "`");
				sendAlternionEmbed(message,embed,false);
			}
		}else{
			message.channel.send(issueEmbed.grabEmbed(5,"GETUSERID : No rows found."));
		}
	});
}

function assignItemSkin(message,args,alternionHandlerEmbed){
	let table1Name = "";
	let table2Name = "";
	let fieldName = "";
	let table2Field = "";
	switch (args[1].toLowerCase()){
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
		case "flag":
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
			message.channel.send("That is not a valid item to assign!");
			table1Name = "NA";
			break;
	}

	if (table1Name != "NA"){
		db.alternionConnectionPool.query(`SELECT Team_ID FROM User WHERE Discord_ID=${message.author.id}`, (err,userRow) => {
			db.alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Display_Name, ${table1Name}.ID, ${table1Name}.Value FROM ${table2Name} INNER JOIN User ON User_ID = User.ID INNER JOIN ${table1Name} ON ${table2Field} = ${table1Name}.ID WHERE User.Discord_ID='${message.author.id}'`, (err, rows) => {
				db.alternionConnectionPool.query(`SELECT ${table1Name}.Name, ${table1Name}.Team_ID, ${table1Name}.Display_Name, ${table1Name}.ID, ${table1Name}.Value FROM ${table1Name} WHERE Limited!=True OR Team_ID=${userRow[0].Team_ID}`, (err, rows2) => {
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

					if (rows2){
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
						alternionHandlerEmbed.setDescription("You cannot assign that Item!");
					}else{
						alternionHandlerEmbed.setDescription(`Assigned skin: **${assignedBadge}**`);
					}

					sendAlternionEmbed(message,alternionHandlerEmbed,true);
				});
			});
		});
	}
}

function getAlternionOverview(message,alternionHandlerEmbed){

	// Prepare for an SQL nightmare

	db.alternionConnectionPool.query(`SELECT Badge.Display_Name AS bad, GoldMask.Display_Name AS mas, NormalSail.Display_Name AS sai, Tea.Display_Name as tea, Bucket.Display_Name as buc, TeaWater.Display_Name as tew, MainSail.Display_Name AS msa, Cannon.Display_Name AS can, Flag.Display_Name AS flg, Musket.Display_Name AS mus, Blunderbuss.Display_Name AS blu, Nockgun.Display_Name AS noc, HM.Display_Name AS han, Pis.Display_Name AS pis, Spis.Display_Name AS spi, Duck.Display_Name AS duc, Mat.Display_Name AS mat, Ann.Display_Name AS ann, Axe.Display_Name AS axe, Rap.Display_Name AS rap, Dag.Display_Name AS dag, Bot.Display_Name AS bot, Cut.Display_Name AS cut, Pik.Display_Name AS pik, Tom.Display_Name AS tom, Spy.Display_Name AS spy, Gre.Display_Name AS gre, Hea.Display_Name AS hea, Ham.Display_Name AS ham, Atl.Display_Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN Flag ON Flag_ID = Flag.ID INNER JOIN WeaponSkin AS TeaWater ON TeaWater_ID = TeaWater.ID INNER JOIN WeaponSkin AS Tea ON TeaCup_ID = Tea.ID INNER JOIN WeaponSkin AS Bucket ON Bucket_ID = Bucket.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length === 0){
			message.channel.send("You are currently not in the database, please contact Archie.");
			return;
		} else if (rows[1]){
			message.channel.send("You have multiple entries, please contact Archie.");
			return;
		}else{
			let finalMsg = `Badge       : **${rows[0].bad}**\n`
						+	`Gold Mask   : **${rows[0].mas}**\n`
						+	`Sail        : **${rows[0].sai}**\n`
						+	`Mail Sail   : **${rows[0].msa}**\n`
						+	`Cannon      : **${rows[0].can}**\n`
						+	`Flag        : **${rows[0].flg}**\n`
						+	`Musket      : **${rows[0].mus}**\n`
						+	`Blunderbuss : **${rows[0].blu}**\n`
						+	`Nockgun     : **${rows[0].noc}**\n`
						+	`HandMortar  : **${rows[0].han}**\n`
						+	`Pistol      : **${rows[0].pis}**\n`
						+	`Short pistol: **${rows[0].spi}**\n`
						+	`Duckfoot    : **${rows[0].duc}**\n`
						+	`Matchlock   : **${rows[0].mat}**\n`
						+	`Annely      : **${rows[0].ann}**\n`
						+	`Axe         : **${rows[0].axe}**\n`
						+	`Rapier      : **${rows[0].rap}**\n`
						+	`Dagger      : **${rows[0].dag}**\n`
						+	`Bottle      : **${rows[0].bot}**\n`
						+	`Cutlass     : **${rows[0].cut}**\n`
						+	`Pike        : **${rows[0].pik}**\n`
						+	`Tomahawk    : **${rows[0].tom}**\n`
						+	`Spyglass    : **${rows[0].spy}**\n`
						+	`Grenade     : **${rows[0].gre}**\n`
						+	`Rum         : **${rows[0].hea}**\n`
						+	`Tea         : **${rows[0].tea}**\n`
						+	`Tea Water   : **${rows[0].tew}**\n`
						+	`Bucket      : **${rows[0].buc}**\n`
						+	`Hammer      : **${rows[0].ham}**\n`
						+	`Atlas01     : **${rows[0].atl}**`;
			alternionHandlerEmbed.setDescription(finalMsg);
			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		}
	});
}

function checkifInDatabase(message,args){
	db.alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length > 1){
			message.channel.send("You appear to have two accounts linked to this discord account, please contact Archie.");
			return;
		}else if (rows.length == 0){
			message.channel.send("Your discord account is not linked to your steamID, please contact Archie.");
			return;
		}else{
			alternionHandler(message,args);
		}
	});
}

function getWeaponSkins(message,ID,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
		db.alternionConnectionPool.query(`(SELECT WeaponSkin.Name, WeaponSkin.Display_Name FROM LimitedWeaponSkins INNER JOIN User ON User_ID = User.ID INNER JOIN WeaponSkin ON Allowed_Weapon_Skin_ID = WeaponSkin.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM WeaponSkin WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No Weapon Skins found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	});
}

function getCannons(message,ID,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Cannon.Name, Cannon.Display_Name FROM LimitedCannons INNER JOIN User ON User_ID = User.ID INNER JOIN Cannon ON Allowed_Cannon_ID = Cannon.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM Cannon WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
				if (rows.length < 1){
					alternionHandlerEmbed.setDescription("No Cannons found.");
				}else{
					let returnString = "";
					for (let i = 0; i < rows.length; i++){
						returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
					}
					alternionHandlerEmbed.setDescription(returnString);
				}

				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			});
		});
	}else if (pubPriv.toLowerCase() === "public"){
		db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Cannon WHERE Limited!=1`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No Cannons found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	}else{
		message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
	}
}

function getNormalSails(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT NormalSail.Name, NormalSail.Display_Name FROM LimitedSails INNER JOIN User ON User_ID = User.ID INNER JOIN NormalSail ON Allowed_Sail_ID = NormalSail.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM NormalSail WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
				if (rows.length < 1){
					alternionHandlerEmbed.setDescription("No Sails found.");
				}else{
					let returnString = "";
					for (let i = 0; i < rows.length; i++){
						returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
					}
					alternionHandlerEmbed.setDescription(returnString);
				}

				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			});
		});
	}else if (pubPriv.toLowerCase() === "public"){
		db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM NormalSail WHERE Limited!=1`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No Sails found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
				alternionHandlerEmbed.setTitle("Available Public Sails");
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	}else{
		message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
	}
}

function getMainSails(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT MainSail.Name, MainSail.Display_Name FROM LimitedMainSails INNER JOIN User ON User_ID = User.ID INNER JOIN MainSail ON Allowed_Main_Sail_ID = MainSail.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM MainSail WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
				if (rows.length < 1){
					alternionHandlerEmbed.setDescription("No Sails found.");
				}else{
					let returnString = "";
					for (let i = 0; i < rows.length; i++){
						returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
					}
					alternionHandlerEmbed.setDescription(returnString);
				}

				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			});
		});
	}else if (pubPriv.toLowerCase() === "public"){
		db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM MainSail WHERE Limited!=1`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No Sails found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
				alternionHandlerEmbed.setTitle("Available Public Main Sails");
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	}else{
		message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
	}
}

function getBadges(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Badge.Name, Badge.Display_Name FROM LimitedBadges INNER JOIN User ON User_ID = User.ID INNER JOIN Badge ON Allowed_badge_ID = Badge.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM Badge WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
				if (rows.length < 1){
					alternionHandlerEmbed.setDescription("No badges found.");
				}else{
					let returnString = "";
					for (let i = 0; i < rows.length; i++){
						returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
					}
					alternionHandlerEmbed.setDescription(returnString);
				}

				sendAlternionEmbed(message,alternionHandlerEmbed,false);	
			});
		});
	}else if (pubPriv.toLowerCase() === "public"){
		db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Badge where Limited!=1`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No badges found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
				alternionHandlerEmbed.setTitle("Available Public Badges");
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	}else{
		message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
	}
}

function getFlags(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Flag.Name, Flag.Display_Name FROM LimitedFlags INNER JOIN User ON User_ID = User.ID INNER JOIN Flag ON Allowed_Flag_ID = Flag.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM Flag WHERE Team_ID=${rows1[0].Team_ID})`, (err,rows) => {
				if (rows.length < 1){
					alternionHandlerEmbed.setDescription("No Flags found.");
				}else{
					let returnString = "";
					for (let i = 0; i < rows.length; i++){
						returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
					}
					alternionHandlerEmbed.setDescription(returnString);
				}

				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			});
		});
	}else if (pubPriv.toLowerCase() === "public"){
		db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM Flag where Limited!=1`, (err,rows) => {
			if (rows.length < 1){
				alternionHandlerEmbed.setDescription("No Flags found.");
			}else{
				let returnString = "";
				for (let i = 0; i < rows.length; i++){
					returnString += `\`${rows[i].Name}\` : ${rows[i].Display_Name}\n`;
				}
				alternionHandlerEmbed.setDescription(returnString);
				alternionHandlerEmbed.setTitle("Available Public Flags");
			}

			sendAlternionEmbed(message,alternionHandlerEmbed,false);
		});
	}else{
		message.channel.send("Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.");
	}
}

function sendAlternionEmbed(message,embed,needsUpdate){
	message.channel.send(embed);
	if (needsUpdate){
		getLocalJson(message.author.id);
	}
}

function teamLeaderHandler(message,action,user_id,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT Team_Leader as tl_ID from User where discord_ID='${message.author.id}'`, (err,rows) => {
		if (rows){
			if (rows[0].tl_ID === 0){
				message.channel.send("You are not a team leader!");
			}else if (rows.length > 1){
				message.channel.send("Something went wrong, you appear to be in the DB twice.");
			}else{
				if (action === "remove"){
					teamLeaderUpdateUser(message,0,rows[0].tl_ID,user_id,action,alternionHandlerEmbed);
				}else if (action === "add"){
					teamLeaderUpdateUser(message,rows[0].tl_ID,null,user_id,action,alternionHandlerEmbed);
				}else{
					message.channel.send("Invalid action");
				}
			}
		}else{
			message.channel.send("You are not in the database, please contact Archie.");
		}
	});
}

function teamLeaderUpdateUser(message,team,tlTeam,userID,action,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT ID,Team_ID FROM User WHERE ID='${userID}'`, (err,rows) => {
		console.log(rows);
		if (rows.length < 1){
			message.channel.send("That user is not in the database!");
		}else if (action === "remove" && tlTeam !== rows[0].Team_ID){
			console.log(`Team: ${tlTeam}, ID: ${rows[0].Team_ID}`);
			message.channel.send("You cannot remove members that are not on your team!");
		}else if (action === "add" && rows[0].Team_ID !== 0){
			message.channel.send("You cannot add members that are on a team!");
		}else{
			db.alternionConnectionPool.query(`UPDATE User SET Team_ID=${team} WHERE ID=${rows[0].ID}`);
			if (team === 0){
				alternionHandlerEmbed.setDescription(`User of ID \`${rows[0].ID}\` updated!\nThey are now free (for the time being)`);
				removeAllEquipped(rows[0].ID,tlTeam);
				sendAlternionEmbed(message,alternionHandlerEmbed,false);
			}else{
				db.alternionConnectionPool.query(`SELECT Name FROM team WHERE ID=${team}`, (err,rows2) => {
					alternionHandlerEmbed.setDescription(`User of ID \`${userID}\` updated!\nNew Team: **${rows2[0].Name}**`);
					sendAlternionEmbed(message,alternionHandlerEmbed,false);
				});
			}
		}
	});
}

function teamLeaderFetchList(message,tlID,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id=${tlID}`, (err,rows) => {
		if (rows.length === 1 && rows[0].Team_Leader !== 0){
			db.alternionConnectionPool.query(`SELECT ID, Discord_ID FROM User WHERE Team_ID=${rows[0].Team_ID}`, (err,rows2) => {
				let list = "";
				for (let i=0; i < rows2.length; i++){
					list += `\`${rows2[i].ID}\` <@${rows2[i].Discord_ID}>\n`;
				}
				db.alternionConnectionPool.query(`SELECT Name FROM team WHERE ID=${rows[0].Team_ID}`, (err,rows3) => {
					alternionHandlerEmbed.setTitle(rows3[0].Name)
						.setDescription(list);
					sendAlternionEmbed(message,alternionHandlerEmbed,false);
				});
			});
		}else{
			message.channel.send("This command is for Team Leaders only!");
		}
	});
}

function teamLeaderForceLoadout(message,tlID,item,itemID,alternionHandlerEmbed){
	let field;
	let table;
	switch (item){
		case "badge":
			field = "Badge_ID";
			table = "Badge";
			break;
		case "mainsail":
			field = "Main_Sail_ID";
			table = "MainSail";
			break;
		case "sail":
			field = "Sails_ID";
			table = "NormalSail";
			break;
		case "flag":
			field = "Flag_ID";
			table = "Flag";
			break;
		default:
			field = "NA";
			break;
	}
	if (field != "NA"){
		db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id='${tlID}'`, (err,rows) => {
			if (rows.length === 1 && rows[0].Team_Leader !== 0){
				db.alternionConnectionPool.query(`SELECT ID, Discord_ID FROM User WHERE Team_ID=${rows[0].Team_ID}`, (err,rows2) => {
					db.alternionConnectionPool.query(`SELECT ID, Name, Display_Name FROM ${table} WHERE Team_ID=${rows[0].Team_ID}`, (err,rows3) => {
						let hasNotFound = true;
						for (let s=0; s < rows3.length; s++){
							if (rows3[s].Name === itemID){
								hasNotFound = false;
								for (let i=0; i < rows2.length; i++){
									db.alternionConnectionPool.query(`UPDATE User SET ${field}=${rows3[0].ID} WHERE ID=${rows2[i].ID}`);
								}

								alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
									.setDescription(`Set all members of team \`${rows[0].Team_ID}\`\nNew ${item}: ${rows3[0].Display_Name}`);

								sendAlternionEmbed(message,alternionHandlerEmbed,false);
								break;
							}
						}

						if (hasNotFound){
							message.channel.send(`Could not find any **${item}(s)** with ID \`${itemID}\``);
						}
					});
				});
			}else{
				message.channel.send("This command is for Team Leaders only!");
			}
		});
	}else{
		message.channel.send("Incorrect input, double check your inputs.");
	}
}

function teamLeaderSearch(message, type, ID, alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Discord_ID='${message.author.id}'`, (err,rows) => {
		if (rows){
			if (rows.length < 1){
				message.channel.send("You are currently not in the database.");
			}else if (rows.length > 1){
				message.channel.send("There seems to be an issue, you are recorded multiple times.");
			}else if (rows[0].Team_Leader === 0){
				message.channel.send("You must be a team leader to use this command!");
			}else{
				if (type === "discord"){
					db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Discord_ID='${ID}'`, (err,rows) => {
						if (rows){
							if (rows.length < 1){
								message.channel.send("User is currently not in the database.");
							}else if (rows.length > 1){
								message.channel.send("There seems to be an issue, this user is recorded multiple times.");
							}else{
								alternionHandlerEmbed.setDescription("`" + rows[0].ID + "`");
								sendAlternionEmbed(message,alternionHandlerEmbed,false);
							}
						}else{
							message.channel.send(issueEmbed.grabEmbed(5,"GETUSERID : No rows found."));
						}
					});
				}else if (type === "steam"){
					db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Steam_ID='${ID}'`, (err,rows) => {
						if (rows){
							if (rows.length < 1){
								message.channel.send("User is currently not in the database.");
							}else if (rows.length > 1){
								message.channel.send("There seems to be an issue, this user is recorded multiple times.");
							}else{
								alternionHandlerEmbed.setDescription("`" + rows[0].ID + "`");
								sendAlternionEmbed(message,alternionHandlerEmbed,false);
							}
						}else{
							message.channel.send(issueEmbed.grabEmbed(5,"GETUSERID : No rows found."));
						}
					});
				}
			}
		}else{
			message.channel.send(issueEmbed.grabEmbed(5,"GETUSERID : No rows found."));
		}
	});
}

function removeAllEquipped(userID,teamID){
	db.alternionConnectionPool.query(`SELECT Badge_ID,Sail_ID,Main_Sail_ID,Flag_ID FROM User WHERE ID=${userID}`,(err,rows) => {
		console.log("Removing stuff from " + userID);
		db.alternionConnectionPool.query(`SELECT Team_ID FROM Badge WHERE ID=${rows[0].Badge_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Badge_ID=0 WHERE ID=${userID}`);
				console.log("Reset badge");
			}
		});

		db.alternionConnectionPool.query(`SELECT Team_ID FROM NormalSail WHERE ID=${rows[0].Sail_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Sail_ID=0 WHERE ID=${userID}`);
				console.log("Reset Sail");
			}
		});

		db.alternionConnectionPool.query(`SELECT Team_ID FROM MainSail WHERE ID=${rows[0].Main_Sail_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Main_Sail_ID=0 WHERE ID=${userID}`);
				console.log("Reset MainSail");
			}
		});

		db.alternionConnectionPool.query(`SELECT Team_ID FROM Flag WHERE ID=${rows[0].Flag_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Flag_ID=0 WHERE ID=${userID}`);
				console.log("Reset Flag");
			}
		});

	});
}

function getLocalJson(discord_id){
	let filepath = config.alternion.jsonFilePath;
	if (alternionJsonFile === null){
		fs.readFile(filepath, function (err,data) {
			json = '{ "users" : [' + data.toString().replace(/&/g, ",") + ']}';
			alternionJsonFile = JSON.parse(`${json}`);
			updateLocalCache(discord_id,filepath);
		});
	}else{
		updateLocalCache(discord_id,filepath);
	}
	return;
}

function updateLocalCache(discord_id,filepath){
	let notFoundUser = true;
	db.alternionConnectionPool.query(`SELECT User.steam_ID, Badge.Name AS bad, GoldMask.Name AS mas, NormalSail.Name AS sai, Tea.Name as tea, Bucket.Name as buc, TeaWater.Name as tew, MainSail.Name AS msa, Cannon.Name AS can, Flag.Name AS flg, Musket.Name AS mus, Blunderbuss.Name AS blu, Nockgun.Name AS noc, HM.Name AS han, Pis.Name AS pis, Spis.Name AS spi, Duck.Name AS duc, Mat.Name AS mat, Ann.Name AS ann, Axe.Name AS axe, Rap.Name AS rap, Dag.Name AS dag, Bot.Name AS bot, Cut.Name AS cut, Pik.Name AS pik, Tom.Name AS tom, Spy.Name AS spy, Gre.Name AS gre, Hea.Name AS hea, Ham.Name AS ham, Atl.Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN Flag ON Flag_ID = Flag.ID INNER JOIN WeaponSkin AS TeaWater ON TeaWater_ID = TeaWater.ID INNER JOIN WeaponSkin AS Tea ON TeaCup_ID = Tea.ID INNER JOIN WeaponSkin AS Bucket ON Bucket_ID = Bucket.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID WHERE Discord_ID="${discord_id}"`, (err,rows) => {
		for (let i = 0; i < alternionJsonFile.users.length; i++){
			if (alternionJsonFile.users[i].steamID === rows[0].steam_ID){
				console.log(`Found User: -${alternionJsonFile.users[i].steamID}- => -${discord_id}-`);
				console.log(alternionJsonFile.users[i]);
				alternionJsonFile.users[i].badgeName = rows[0].bad;
				alternionJsonFile.users[i].maskSkinName = rows[0].mas;
				alternionJsonFile.users[i].sailSkinName = rows[0].sai;
				alternionJsonFile.users[i].mainSailName = rows[0].msa;
				alternionJsonFile.users[i].cannonSkinName = rows[0].can;
				alternionJsonFile.users[i].flagSkinName = rows[0].flg;
				alternionJsonFile.users[i].musketSkinName = rows[0].mus.split("_")[1];
				alternionJsonFile.users[i].blunderbussSkinName = rows[0].blu.split("_")[1];
				alternionJsonFile.users[i].nockgunSkinName = rows[0].noc.split("_")[1];
				alternionJsonFile.users[i].handMortarSkinName = rows[0].han.split("_")[1];
				alternionJsonFile.users[i].standardPistolSkinName = rows[0].pis.split("_")[1];
				alternionJsonFile.users[i].shortPistolSkinName = rows[0].spi.split("_")[1];
				alternionJsonFile.users[i].duckfootSkinName = rows[0].duc.split("_")[1];
				alternionJsonFile.users[i].matchlockRevolverSkinName = rows[0].mat.split("_")[1];
				alternionJsonFile.users[i].annelyRevolverSkinName = rows[0].ann.split("_")[1];
				alternionJsonFile.users[i].axeSkinName = rows[0].axe.split("_")[1];
				alternionJsonFile.users[i].rapierSkinName = rows[0].rap.split("_")[1];
				alternionJsonFile.users[i].daggerSkinName = rows[0].dag.split("_")[1];
				alternionJsonFile.users[i].bottleSkinName = rows[0].bot.split("_")[1];
				alternionJsonFile.users[i].cutlassSkinName = rows[0].cut.split("_")[1];
				alternionJsonFile.users[i].pikeSkinName = rows[0].pik.split("_")[1];
				alternionJsonFile.users[i].tomohawkSkinName = rows[0].tom.split("_")[1];
				alternionJsonFile.users[i].spyglassSkinName = rows[0].spy.split("_")[1];
				alternionJsonFile.users[i].grenadeSkinName = rows[0].gre.split("_")[1];
				alternionJsonFile.users[i].healItemSkinName = rows[0].hea.split("_")[1];
				alternionJsonFile.users[i].teaCupSkinName = rows[0].tea.split("_")[1];
				alternionJsonFile.users[i].teaWaterSkinName = rows[0].tew.split("_")[1];
				alternionJsonFile.users[i].bucketSkinName = rows[0].buc.split("_")[1];
				alternionJsonFile.users[i].hammerSkinName = rows[0].ham.split("_")[1];
				alternionJsonFile.users[i].atlas01SkinName = rows[0].atl.split("_")[1];
				notFoundUser = false;
				break;
			}
		}

		if (notFoundUser){
			let user = {};
			user["steamID"] = rows[0].steam_ID;
			user["badgeName"] = rows[0].bad;
			user["maskSkinName"] = rows[0].mas;
			user["sailSkinName"] = rows[0].sai;
			user["mainSailName"] = rows[0].msa;
			user["cannonSkinName"] = rows[0].can;
			user["flagSkinName"] = rows[0].flg;
			user["musketSkinName"] = rows[0].mus.split("_")[1];
			user["blunderbussSkinName"] = rows[0].blu.split("_")[1];
			user["nockgunSkinName"] = rows[0].noc.split("_")[1];
			user["handMortarSkinName"] = rows[0].han.split("_")[1];
			user["standardPistolSkinName"] = rows[0].pis.split("_")[1];
			user["shortPistolSkinName"] = rows[0].spi.split("_")[1];
			user["duckfootSkinName"] = rows[0].duc.split("_")[1];
			user["matchlockRevolverSkinName"] = rows[0].mat.split("_")[1];
			user["annelyRevolverSkinName"] = rows[0].ann.split("_")[1];
			user["axeSkinName"] = rows[0].axe.split("_")[1];
			user["rapierSkinName"] = rows[0].rap.split("_")[1];
			user["daggerSkinName"] = rows[0].dag.split("_")[1];
			user["bottleSkinName"] = rows[0].bot.split("_")[1];
			user["cutlassSkinName"] = rows[0].cut.split("_")[1];
			user["pikeSkinName"] = rows[0].pik.split("_")[1];
			user["tomohawkSkinName"] = rows[0].tom.split("_")[1];
			user["spyglassSkinName"] = rows[0].spy.split("_")[1];
			user["grenadeSkinName"] = rows[0].gre.split("_")[1];
			user["healItemSkinName"] = rows[0].hea.split("_")[1];
			user["teaCupSkinName"] = rows[0].tea.split("_")[1];
			user["teaWaterSkinName"] = rows[0].tew.split("_")[1];
			user["bucketSkinName"] = rows[0].buc.split("_")[1];
			user["hammerSkinName"] = rows[0].ham.split("_")[1];
			user["atlas01SkinName"] = rows[0].atl.split("_")[1];

			alternionJsonFile.users.push(user);
			console.log("Setup new user! -" + rows[0].steam_ID + "- => -" + discord_id + "-");
		}

		updateJsonFile(filepath);
	});
	return;
}

function updateJsonFile(filepath){
	let writeString = "";
	for (let i = 0; i < alternionJsonFile.users.length; i++){
		if (i < alternionJsonFile.users.length - 1){
			writeString += JSON.stringify(alternionJsonFile.users[i]).toString() + "&";
		}else{
			writeString += JSON.stringify(alternionJsonFile.users[i]).toString();
		}
	}
	fs.writeFile(filepath, writeString.toString(), function(err){});
}

exports.globalJsonUpdate = function globalJsonUpdate(){
	getLocalJson("337541914687569920");
	db.alternionConnectionPool.query("SELECT User.steam_ID, Badge.Name AS bad, GoldMask.Name AS mas, NormalSail.Name AS sai, Tea.Name as tea, Bucket.Name as buc, TeaWater.Name as tew, MainSail.Name AS msa, Cannon.Name AS can, Flag.Name AS flg, Musket.Name AS mus, Blunderbuss.Name AS blu, Nockgun.Name AS noc, HM.Name AS han, Pis.Name AS pis, Spis.Name AS spi, Duck.Name AS duc, Mat.Name AS mat, Ann.Name AS ann, Axe.Name AS axe, Rap.Name AS rap, Dag.Name AS dag, Bot.Name AS bot, Cut.Name AS cut, Pik.Name AS pik, Tom.Name AS tom, Spy.Name AS spy, Gre.Name AS gre, Hea.Name AS hea, Ham.Name AS ham, Atl.Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN Flag ON Flag_ID = Flag.ID INNER JOIN WeaponSkin AS TeaWater ON TeaWater_ID = TeaWater.ID INNER JOIN WeaponSkin AS Tea ON TeaCup_ID = Tea.ID INNER JOIN WeaponSkin AS Bucket ON Bucket_ID = Bucket.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID", (err,rows) => {
		for (let s = 0; s < rows.length; s++){
			let notFoundUser = true;
			for (let i = 0; i < alternionJsonFile.users.length; i++){
				if (alternionJsonFile.users[i].steamID === rows[s].steam_ID){
					alternionJsonFile.users[i].badgeName = rows[s].bad;
					alternionJsonFile.users[i].maskSkinName = rows[s].mas;
					alternionJsonFile.users[i].sailSkinName = rows[s].sai;
					alternionJsonFile.users[i].mainSailName = rows[s].msa;
					alternionJsonFile.users[i].cannonSkinName = rows[s].can;
					alternionJsonFile.users[i].flagSkinName = rows[s].flg;
					alternionJsonFile.users[i].musketSkinName = rows[s].mus.split("_")[1];
					alternionJsonFile.users[i].blunderbussSkinName = rows[s].blu.split("_")[1];
					alternionJsonFile.users[i].nockgunSkinName = rows[s].noc.split("_")[1];
					alternionJsonFile.users[i].handMortarSkinName = rows[s].han.split("_")[1];
					alternionJsonFile.users[i].standardPistolSkinName = rows[s].pis.split("_")[1];
					alternionJsonFile.users[i].shortPistolSkinName = rows[s].spi.split("_")[1];
					alternionJsonFile.users[i].duckfootSkinName = rows[s].duc.split("_")[1];
					alternionJsonFile.users[i].matchlockRevolverSkinName = rows[s].mat.split("_")[1];
					alternionJsonFile.users[i].annelyRevolverSkinName = rows[s].ann.split("_")[1];
					alternionJsonFile.users[i].axeSkinName = rows[s].axe.split("_")[1];
					alternionJsonFile.users[i].rapierSkinName = rows[s].rap.split("_")[1];
					alternionJsonFile.users[i].daggerSkinName = rows[s].dag.split("_")[1];
					alternionJsonFile.users[i].bottleSkinName = rows[s].bot.split("_")[1];
					alternionJsonFile.users[i].cutlassSkinName = rows[s].cut.split("_")[1];
					alternionJsonFile.users[i].pikeSkinName = rows[s].pik.split("_")[1];
					alternionJsonFile.users[i].tomohawkSkinName = rows[s].tom.split("_")[1];
					alternionJsonFile.users[i].spyglassSkinName = rows[s].spy.split("_")[1];
					alternionJsonFile.users[i].grenadeSkinName = rows[s].gre.split("_")[1];
					alternionJsonFile.users[i].healItemSkinName = rows[s].hea.split("_")[1];
					alternionJsonFile.users[i].teaCupSkinName = rows[s].tea.split("_")[1];
					alternionJsonFile.users[i].teaWaterSkinName = rows[s].tew.split("_")[1];
					alternionJsonFile.users[i].bucketSkinName = rows[s].buc.split("_")[1];
					alternionJsonFile.users[i].hammerSkinName = rows[s].ham.split("_")[1];
					alternionJsonFile.users[i].atlas01SkinName = rows[s].atl.split("_")[1];
					notFoundUser = false;
					break;
				}
			}
			if (notFoundUser){
				let user = {};
				user["steamID"] = rows[s].steam_ID;
				user["badgeName"] = rows[s].bad;
				user["maskSkinName"] = rows[s].mas;
				user["sailSkinName"] = rows[s].sai;
				user["mainSailName"] = rows[s].msa;
				user["cannonSkinName"] = rows[s].can;
				user["flagSkinName"] = rows[0].flg;
				user["musketSkinName"] = rows[s].mus.split("_")[1];
				user["blunderbussSkinName"] = rows[s].blu.split("_")[1];
				user["nockgunSkinName"] = rows[s].noc.split("_")[1];
				user["handMortarSkinName"] = rows[s].han.split("_")[1];
				user["standardPistolSkinName"] = rows[s].pis.split("_")[1];
				user["shortPistolSkinName"] = rows[s].spi.split("_")[1];
				user["duckfootSkinName"] = rows[s].duc.split("_")[1];
				user["matchlockRevolverSkinName"] = rows[s].mat.split("_")[1];
				user["annelyRevolverSkinName"] = rows[s].ann.split("_")[1];
				user["axeSkinName"] = rows[s].axe.split("_")[1];
				user["rapierSkinName"] = rows[s].rap.split("_")[1];
				user["daggerSkinName"] = rows[s].dag.split("_")[1];
				user["bottleSkinName"] = rows[s].bot.split("_")[1];
				user["cutlassSkinName"] = rows[s].cut.split("_")[1];
				user["pikeSkinName"] = rows[s].pik.split("_")[1];
				user["tomohawkSkinName"] = rows[s].tom.split("_")[1];
				user["spyglassSkinName"] = rows[s].spy.split("_")[1];
				user["grenadeSkinName"] = rows[s].gre.split("_")[1];
				user["healItemSkinName"] = rows[s].hea.split("_")[1];
				user["teaCupSkinName"] = rows[s].tea.split("_")[1];
				user["teaWaterSkinName"] = rows[s].tew.split("_")[1];
				user["bucketSkinName"] = rows[s].buc.split("_")[1];
				user["hammerSkinName"] = rows[s].ham.split("_")[1];
				user["atlas01SkinName"] = rows[s].atl.split("_")[1];

				alternionJsonFile.users.push(user);
				console.log(`Pushed new user ${s}`);
			}
		}

		console.log(`Complete global Update`);
		updateJsonFile(config.alternion.jsonFilePath);
	});
}

function handleAlternionRegistration(message,term,steamID,discordID){
	let registrationEmbed = new Discord.MessageEmbed().setTitle("Registration");
	let list = "";
	switch (term){
		case "steam":
			db.alternionConnectionPool.query(`SELECT * FROM User WHERE Steam_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that steamID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					db.alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						db.alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${steamID}, ${discordID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${steamID}\`, \`${discordID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		case "discord":
			db.alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that discordID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					db.alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						db.alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${discordID}, ${steamID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${discordID}\`, \`${steamID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		default:
			registrationEmbed.setDescription("Please check you entered a valid feature\n`discord` `steam`");
			sendAlternionEmbed(message,registrationEmbed,false);
			break;
	}
}
