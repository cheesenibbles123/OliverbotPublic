const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "overview",
	args: 1,
	help: "Displays your alternion loadout",
	execute: (event,args,isMessage) => {

		let embed = new Discord.MessageEmbed()
			.setTitle("Overview");
		const ID = isMessage ? event.author.id : event.user.id;
		// Prepare for an SQL nightmare

		db.alternionConnectionPool.query(`SELECT Badge.Display_Name AS bad, GoldMask.Display_Name AS mas, NormalSail.Display_Name AS sai, Tea.Display_Name as tea, Bucket.Display_Name as buc, TeaWater.Display_Name as tew, MainSail.Display_Name AS msa, Cannon.Display_Name AS can, Swivel.Display_Name as swi, Flag.Display_Name AS flg, Flag_Navy.Display_Name AS flg2, Musket.Display_Name AS mus, Blunderbuss.Display_Name AS blu, Nockgun.Display_Name AS noc, HM.Display_Name AS han, Pis.Display_Name AS pis, Spis.Display_Name AS spi, Duck.Display_Name AS duc, Mat.Display_Name AS mat, Ann.Display_Name AS ann, Axe.Display_Name AS axe, Rap.Display_Name AS rap, Dag.Display_Name AS dag, Bot.Display_Name AS bot, Cut.Display_Name AS cut, Pik.Display_Name AS pik, Tom.Display_Name AS tom, Spy.Display_Name AS spy, Gre.Display_Name AS gre, Hea.Display_Name AS hea, Ham.Display_Name AS ham, Atl.Display_Name AS atl FROM User INNER JOIN Badge ON Badge_ID = Badge.ID INNER JOIN GoldMask ON Mask_ID = GoldMask.ID INNER JOIN NormalSail ON Sail_ID = NormalSail.ID INNER JOIN MainSail ON Main_Sail_ID = MainSail.ID INNER JOIN Cannon ON Cannon_ID = Cannon.ID INNER JOIN Swivel ON Swivel_ID = Swivel.ID INNER JOIN Flag AS Flag ON Flag_ID = Flag.ID INNER JOIN Flag AS Flag_Navy ON Flag_Navy_ID = Flag_Navy.ID INNER JOIN WeaponSkin AS TeaWater ON TeaWater_ID = TeaWater.ID INNER JOIN WeaponSkin AS Tea ON TeaCup_ID = Tea.ID INNER JOIN WeaponSkin AS Bucket ON Bucket_ID = Bucket.ID INNER JOIN WeaponSkin AS Musket ON Musket_ID = Musket.ID INNER JOIN WeaponSkin AS Blunderbuss ON Blunderbuss_ID = Blunderbuss.ID INNER JOIN WeaponSkin AS Nockgun ON Nockgun_ID = Nockgun.ID INNER JOIN WeaponSkin AS HM ON Handmortar_ID = HM.ID INNER JOIN WeaponSkin AS Pis ON Standard_Pistol_ID = Pis.ID INNER JOIN WeaponSkin AS Spis ON Short_Pistol_ID = Spis.ID INNER JOIN WeaponSkin AS Duck ON Duckfoot_ID = Duck.ID INNER JOIN WeaponSkin AS Mat ON Matchlock_Revolver_ID = Mat.ID INNER JOIN WeaponSkin AS Ann ON Annely_Revolver_ID = Ann.ID INNER JOIN WeaponSkin AS Axe ON Axe_ID = Axe.ID INNER JOIN WeaponSkin AS Rap ON Rapier_ID = Rap.ID INNER JOIN WeaponSkin AS Dag ON Dagger_ID = Dag.ID INNER JOIN WeaponSkin AS Bot ON Bottle_ID = Bot.ID INNER JOIN WeaponSkin AS Cut ON Cutlass_ID = Cut.ID INNER JOIN WeaponSkin AS Pik ON Pike_ID = Pik.ID INNER JOIN WeaponSkin AS Tom ON Tomohawk_ID = Tom.ID INNER JOIN WeaponSkin AS Spy ON Spyglass_ID = Spy.ID INNER JOIN WeaponSkin AS Gre ON Grenade_ID = Gre.ID INNER JOIN WeaponSkin AS Hea ON HealItem_ID = Hea.ID INNER JOIN WeaponSkin AS Ham ON Hammer_ID = Ham.ID INNER JOIN WeaponSkin AS Atl ON atlas01_ID = Atl.ID WHERE Discord_ID="${ID}"`, (err,rows) => {
			if (rows.length < 1){
				reply(event,"You are currently not in the database, please contact Archie.",isMessage);
			} else if (rows.length > 1){
				reply(event,"You have multiple entries, please contact Archie.",isMessage);
			}else{
				let finalMsg = `Badge       : **${rows[0].bad}**\n`
							+	`Gold Mask   : **${rows[0].mas}**\n`
							+	`Sail        : **${rows[0].sai}**\n`
							+	`Main Sail   : **${rows[0].msa}**\n`
							+	`Cannon      : **${rows[0].can}**\n`
							+	`Swivel      : **${rows[0].swi}**\n`
							+	`Flag Navy   : **${rows[0].flg2}**\n`
							+	`Flag Pirates: **${rows[0].flg}**\n`
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
				embed.setDescription(finalMsg);
				reply(event,{embeds:[embed]},isMessage);
			}
		});
	}
}