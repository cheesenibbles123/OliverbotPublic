const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "update",
	execute: async (event,args,isMessage) => {
		const ID = isMessage ? event.author.id : event.user.id;
		const isTL = await shared.checkIfTL(ID);

		if (!isTL) return reply(event,"This command is for Team Leaders only.",isMessage);

		const type = args[0].toLowerCase();
		let embed = new Discord.MessageEmbed();

		if (type === "team"){
			teamLeaderForceLoadout(event,ID,args[1].toLowerCase(),args[2],embed,isMessage);
		}else{
			teamLeaderForceLoadoutUser(event,ID,args[1].toLowerCase(),args[2],args[3],embed,isMessage);
		}
	}
}

function teamLeaderForceLoadout(event,tlID,item,itemID,alternionHandlerEmbed,isMessage){
	
	let { field, table } = getFieldAndTable(item);

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
									db.alternionConnectionPool.query(`UPDATE User SET ${field}=${rows3[s].ID} WHERE ID=${rows2[i].ID}`);
								}
								shared.globalJsonUpdate();

								db.alternionConnectionPool.query(`SELECT * FROM team WHERE ID=${rows[0].Team_ID}`,(err,rows4) => {

									alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
										.setDescription(`Set all members of team \`${rows4[0].Name}\`\nNew ${item}: ${rows3[s].Display_Name}`);

									reply(event,{embeds:[alternionHandlerEmbed]},isMessage);
								});
								break;
							}
						}

						if (hasNotFound){
							reply(event,`Could not find any **${item}(s)** with ID \`${itemID}\``,isMessage);
						}
					});
				});
			}else{
				reply(event,"This command is for Team Leaders only!",isMessage);
			}
		});
	}else{
		reply(event,"Incorrect input, double check your inputs.",isMessage);
	}
}

function teamLeaderForceLoadoutUser(event,tlID,item,itemID,targetID,alternionHandlerEmbed,isMessage){

	let { field, table } = getFieldAndTable(item);

	if (field != "NA"){
		db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id='${tlID}'`, (err,rows) => {
			if (rows.length === 1 && rows[0].Team_Leader !== 0){
				db.alternionConnectionPool.query(`SELECT Team_ID, discord_id FROM User WHERE ID=${targetID}`, (err,rows2) => {
					if (rows.length === 1 && rows[0].Team_Leader === rows2[0].Team_ID){
						db.alternionConnectionPool.query(`SELECT ID, Name, Display_Name FROM ${table} WHERE Team_ID=${rows[0].Team_ID}`, (err,rows3) => {
							let hasNotFound = true;
							for (let s=0; s < rows3.length; s++){
								if (rows3[s].Name === itemID){
									hasNotFound = false;
									for (let i=0; i < rows2.length; i++){
										db.alternionConnectionPool.query(`UPDATE User SET ${field}=${rows3[s].ID} WHERE ID=${targetID}`);
									}

									shared.getLocalJson(rows2[0].discord_id);

									alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
										.setDescription(`Updated member <@${rows2[0].discord_id}> of team \`${rows[0].Team_ID}\`\nNew ${item}: **${rows3[0].Display_Name}**`);

									reply(event,{embeds : [alternionHandlerEmbed]},isMessage);
									break;
								}
							}

							if (hasNotFound){
								reply(event,`Could not find any **${item}(s)** with ID \`${itemID}\``,isMessage);
							}
						});
					}else{
						reply(event,`This user is not part of your team!`,isMessage);
					}
				});
			}else{
				reply(event,"This command is for Team Leaders only!",isMessage);
			}
		});
	}else{
		reply(event,"Incorrect input, double check your inputs.",isMessage);
	}
}

function getFieldAndTable(input){
	let field;
	let table;

	switch(input){
		case "badge":
			field = "Badge_ID";
			table = "Badge";
			break;
		case "mainsail":
			field = "Main_Sail_ID";
			table = "MainSail";
			break;
		case "sail":
			field = "Sail_ID";
			table = "NormalSail";
			break;
		case "pirateflag":
			field = "Flag_ID";
			table = "Flag";
			break;
		case "navyflag":
			field = "Flag_Navy_ID";
			table = "Flag";
			break;
		case "cannon":
			field = "Cannon_ID";
			table = "Cannon";
			break;
		case "mortar":
			field = "Mortar_ID";
			table = "Mortar";
			break;
		case "swivel":
			field = "Swivel_ID";
			table = "Swivel";
			break;
		default:
			field = "NA";
			break;
	}

	return { field, table};
}