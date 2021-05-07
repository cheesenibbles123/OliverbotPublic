const db = require("./../_databaseSetup.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");

module.exports = {
	name: "forceupdateteam",
	args: 3,
	help: "Forces all team members to equip a given item.",
	execute: async (message,args) => {

		let isTL = await shared.checkIfTL(message);

		if (isTL){

			let embed = new Discord.MessageEmbed();

			teamLeaderForceLoadout(message,message.author.id,args[1].toLowerCase(),args[2],embed);
		}
	}
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
			field = "Sail_ID";
			table = "NormalSail";
			break;
		case "navyflag":
			field = "Flag_Navy_ID";
			table = "Flag";
			break;
		case "pirateflag":
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
									db.alternionConnectionPool.query(`UPDATE User SET ${field}=${rows3[s].ID} WHERE ID=${rows2[i].ID}`);
								}
								shared.globalJsonUpdate();

								db.alternionConnectionPool.query(`SELECT * FROM team WHERE ID=${rows[0].Team_ID}`,(err,rows4) => {

									alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
										.setDescription(`Set all members of team \`${rows4[0].Name}\`\nNew ${item}: ${rows3[s].Display_Name}`);

									message.channel.send(alternionHandlerEmbed);
								});
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