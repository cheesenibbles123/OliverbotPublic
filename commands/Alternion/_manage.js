const db = require("./../_databaseSetup.js");
const shared = require("./_sharedFunctions.js");

module.exports = {
	name: "manage",
	args: 2,
	help: "Allows TLs to add/remove members from their team.",
	execute: async (message,args) => {

		let isTL = await shared.checkIfTL(message);

		if (isTL){

			let action = args[1];

			if (action === "remove"){
				teamLeaderUpdateUser(message,0,rows[0].tl_ID,args[2],action);
			}else if (action === "add"){
				teamLeaderUpdateUser(message,rows[0].tl_ID,null,args[2],action);
			}else{
				message.channel.send("Invalid action");
			}
		}
	}
}

function teamLeaderUpdateUser(message,team,tlTeam,userID,action,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT ID,Team_ID FROM User WHERE ID='${userID}'`, (err,rows) => {
		if (rows.length < 1){
			message.channel.send("That user is not in the database!");
		}else if (action === "remove" && tlTeam !== rows[0].Team_ID){
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