var alternionJsonFile = null;
const db = require("./../databaseSetup");
const fs = require('fs');

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

exports.globalJsonUpdate = globalJsonUpdate;

function globalJsonUpdate(){
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