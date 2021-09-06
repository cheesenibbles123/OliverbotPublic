const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const shared = require("./_sharedFunctions.js");
const {reply} = require("./../_combinedResponses.js");

let bot;

module.exports = {
	name : "list",
	description : "Lists all available skins of a given type",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (event,args,isMessage) => {
		const ID = isMessage ? event.author.id : event.user.id;

		const type = args[0].toLowerCase();

		if (type === "members"){
			listTeam(event,ID,isMessage);
		}else{
			const isPrivate = typeof(args[1]) !== "undefined" ? args[1].toLowerCase() === "private" : false;

			const tableData = fetchTables(type);

			let embed = new Discord.MessageEmbed()
				.setTitle(`Available ${tableData.table1 === "NA" ? `${args[0]}(s)` : `${tableData.table1}(s)`} - ${isPrivate ? "Private" : "Public"}`)
				.setFooter(`The formatting is: - ${type}_id : ${tableData.table1} Name -`);

			if (tableData.table1Name === "N/A"){
				reply(event,"Please ensure you have entered a valid type.",isMessage);
			}else if (isPrivate){
				db.alternionConnectionPool.query(`SELECT Team_ID from User where discord_id='${ID}'`, (err,rows1) => {
					db.alternionConnectionPool.query(`(SELECT ${tableData.table1}.Name, ${tableData.table1}.Display_Name FROM ${tableData.table2} INNER JOIN User ON User_ID = User.ID INNER JOIN ${tableData.table1} ON ${tableData.field} = ${tableData.table1}.ID WHERE User.Discord_ID='${ID}') UNION ( SELECT Name,Display_Name FROM ${tableData.table1} WHERE Team_ID=${rows1[0].Team_ID} AND IF ( ${rows1[0].Team_ID} != 0, 1, 0) = 1 )`, (err,rows) => {
						
						embed.setDescription(shared.iterateOver(rows,`${args[0]}(s)`));
						reply(event,{embeds:[embed]},isMessage);

					});
				});
			}else if (tableData.table1 !== "WeaponSkin"){
				db.alternionConnectionPool.query(`SELECT Name, Display_Name FROM ${tableData.table1} where Limited!=1`, (err,rows) => {
					
					embed.setDescription(shared.iterateOver(rows,`${args[0]}(s)`));
					reply(event,{embeds:[embed]},isMessage);

				});
			}else{
				reply(event,"Please ensure you have entered valid terms. Currently supported: `Private`, `Public`.",isMessage);
			}
		}

	}
}

async function listTeam(event,authorId,isMessage){
	const isTL = await shared.checkIfTL(authorId);
	if (isTL){

		let embed = new Discord.MessageEmbed();

		db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id=${authorId}`, (err,rows) => {
			if (rows.length === 1 && rows[0].Team_Leader !== 0){
				db.alternionConnectionPool.query(`SELECT ID, Steam_ID, Discord_ID FROM User WHERE Team_ID=${rows[0].Team_ID}`, (err,rows2) => {
					let list = "";
					for (let i=0; i < rows2.length; i++){
						if (rows2[i].Discord_ID != 'NULL'){
							list += `\`${rows2[i].ID}\` : <@${rows2[i].Discord_ID}>\n`;
						}else{
							list += `\`${rows2[i].ID}\` : \`${rows2[i].Steam_ID}\`\n`;
						}
					}
					db.alternionConnectionPool.query(`SELECT Name FROM team WHERE ID=${rows[0].Team_ID}`, (err,rows3) => {
						embed.setTitle(rows3[0].Name)
							.setDescription(list);
						reply(event,{embeds: [embed]},isMessage);
					});
				});
			}else{
				reply(event,"This command is for Team Leaders only!",isMessage);
			}
		});
	}
}

function fetchTables(input_type){
	let table1Name;
	let table2Name;
	let table2Field;

	switch (input_type){
			case "badge":
				table1Name = "Badge";
				table2Name = "LimitedBadges";
				table2Field = "Allowed_Badge_ID";
				break;
			case "sail":
				table1Name = "NormalSail";
				table2Name = "LimitedSails";
				table2Field = "Allowed_Sail_ID";
				break;
			case "mainsail":
				table1Name = "MainSail";
				table2Name = "LimitedMainSails";
				table2Field = "Allowed_Main_Sail_ID";
				break;
			case "goldmask":
				table1Name = "GoldMask";
				table2Name = "LimitedGoldMask";
				table2Field = "Allowed_Gold_Mask_ID";
				break;
			case "cannon":
				table1Name = "Cannon";
				table2Name = "LimitedCannons";
				table2Field = "Allowed_Cannon_ID";
				break;
			case "swivel":
				table1Name = "Swivel";
				table2Name = "LimitedSwivels";
				table2Field = "Allowed_Swivel_ID";
				break;
			case "mortar":
				table1Name = "Mortar";
				table2Name = "LimitedMortars";
				table2Field = "Allowed_Mortar_ID";
				break;
			case "navyflag":
				table1Name = "Flag";
				table2Name = "LimitedFlags";
				table2Field = "Allowed_Flag_ID";
				break;
			case "pirateflag":
				table1Name = "Flag";
				table2Name = "LimitedFlags";
				table2Field = "Allowed_Flag_ID";
				break;
			case "weapon":
				table1Name = "WeaponSkin";
				table2Name = "LimitedWeaponSkins";
				table2Field = "Allowed_Weapon_Skin_ID";
				break;
			default:
				table1Name = "NA";
				break;
		}

	return {table1 : table1Name, table2 : table2Name, field : table2Field};
}