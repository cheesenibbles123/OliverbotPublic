const db = require("./../databaseSetup");
const issueEmbed = require("./../issueEmbed");

exports.getAlternionOverview = function getAlternionOverview(message,alternionHandlerEmbed){

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

exports.getWeaponSkins = function getWeaponSkins(message,ID,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
		db.alternionConnectionPool.query(`(SELECT WeaponSkin.Name, WeaponSkin.Display_Name FROM LimitedWeaponSkins INNER JOIN User ON User_ID = User.ID INNER JOIN WeaponSkin ON Allowed_Weapon_Skin_ID = WeaponSkin.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM WeaponSkin WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
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

exports.getCannons = function getCannons(message,ID,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Cannon.Name, Cannon.Display_Name FROM LimitedCannons INNER JOIN User ON User_ID = User.ID INNER JOIN Cannon ON Allowed_Cannon_ID = Cannon.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM Cannon WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
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

exports.getNormalSails = function getNormalSails(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT NormalSail.Name, NormalSail.Display_Name FROM LimitedSails INNER JOIN User ON User_ID = User.ID INNER JOIN NormalSail ON Allowed_Sail_ID = NormalSail.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name, Display_Name FROM NormalSail WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
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

exports.getMainSails = function getMainSails(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT MainSail.Name, MainSail.Display_Name FROM LimitedMainSails INNER JOIN User ON User_ID = User.ID INNER JOIN MainSail ON Allowed_Main_Sail_ID = MainSail.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM MainSail WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
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

exports.getBadges = function getBadges(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Badge.Name, Badge.Display_Name FROM LimitedBadges INNER JOIN User ON User_ID = User.ID INNER JOIN Badge ON Allowed_badge_ID = Badge.ID WHERE User.Discord_ID='${ID}') UNION ( SELECT Name,Display_Name FROM Badge WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
				console.log(rows);
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

exports.getFlags = function getFlags(message,ID,pubPriv,alternionHandlerEmbed){
	if (!pubPriv){
		pubPriv = "private";
	}
	if (pubPriv.toLowerCase() === "private"){
		db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
			db.alternionConnectionPool.query(`(SELECT Flag.Name, Flag.Display_Name FROM LimitedFlags INNER JOIN User ON User_ID = User.ID INNER JOIN Flag ON Allowed_Flag_ID = Flag.ID WHERE User.Discord_ID='${ID}') UNION (SELECT Name,Display_Name FROM Flag WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
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

exports.getUserID = function getUserID(message,embed){
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