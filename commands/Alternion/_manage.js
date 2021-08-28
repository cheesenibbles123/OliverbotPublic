const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "manage",
	args: 2,
	help: "Allows TLs to add/remove members from their team.",
	execute: async (event,args,isMessage) => {

		let isTL = await shared.checkIfTL(event);

		if (isTL){

			let action = args[1].toLowerCase();
			let team = await getTeamLeaderInfo(event.member.user.id);

			if (action === "remove"){
				teamLeaderUpdateUser(event,0,team,args[2],action,isMessage);
			}else if (action === "add"){
				teamLeaderUpdateUser(event,team,null,args[2],action,isMessage);
			}else{
				reply(event,"Invalid action",isMessage);
			}
		}
	}
}

function getTeamLeaderInfo(discord_id){
	return new Promise((resolve,reject) => {
		db.alternionConnectionPool.query(`SELECT Team_Leader,Team_ID FROM User WHERE Discord_ID='${discord_id}'`,(err,rows) =>{
			if (rows && rows.length === 1){
				resolve(rows[0].Team_Leader);
			}else{
				resolve(null);
			}
		});
	});
}

function teamLeaderUpdateUser(event,team,tlTeam,userID,action,isMessage){
	let alternionHandlerEmbed = new Discord.MessageEmbed()
		.setTitle(`${action}ing user`);

	db.alternionConnectionPool.query(`SELECT ID,Team_ID FROM User WHERE ID='${userID}'`, (err,rows) => {
		if (rows.length < 1){
			reply(event,"That user is not in the database!",isMessage);
		}else if (action === "remove" && tlTeam !== rows[0].Team_ID){
			reply(event,"You cannot remove members that are not on your team!",isMessage);
		}else if (action === "add" && rows[0].Team_ID !== 0){
			reply(event,"You cannot add members that are on a team!",isMessage);
		}else{
			db.alternionConnectionPool.query(`UPDATE User SET Team_ID=${team} WHERE ID=${rows[0].ID}`);
			if (team === 0){
				alternionHandlerEmbed.setDescription(`User of ID \`${rows[0].ID}\` updated!\nThey are now free (for the time being)`);
				removeAllEquipped(rows[0].ID,tlTeam);
				reply(event,{embeds:[alternionHandlerEmbed]},isMessage);
			}else{
				db.alternionConnectionPool.query(`SELECT Name FROM team WHERE ID=${team}`, (err,rows2) => {
					alternionHandlerEmbed.setDescription(`User of ID \`${userID}\` updated!\nNew Team: **${rows2[0].Name}**`);
					reply(event,{embeds:[alternionHandlerEmbed]},isMessage);
				});
			}
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

		db.alternionConnectionPool.query(`SELECT Team_ID FROM Flag WHERE ID=${rows[0].Flag_Navy_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Flag_Navy_ID=0 WHERE ID=${userID}`);
				console.log("Reset Flag");
			}
		});

		db.alternionConnectionPool.query(`SELECT Team_ID FROM Flag WHERE ID=${rows[0].Flag_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Flag_ID=0 WHERE ID=${userID}`);
				console.log("Reset Flag");
			}
		});

		db.alternionConnectionPool.query(`SELECT Team_ID FROM Swivel WHERE ID=${rows[0].Swivel_ID}`, (err,rows2) => {
			if (rows2[0].Team_ID === teamID){
				db.alternionConnectionPool.query(`UPDATE User SET Swivel_ID=0 WHERE ID=${userID}`);
				console.log("Reset Swivel");
			}
		});

	});
}