const db = require("./../databaseSetup");
const issueEmbed = require("./../issueEmbed");

exports.teamLeaderHandler = function teamLeaderHandler(message,action,user_id,alternionHandlerEmbed){
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

exports.teamLeaderUpdateUser = function teamLeaderUpdateUser(message,team,tlTeam,userID,action,alternionHandlerEmbed){
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

exports.teamLeaderFetchList = function teamLeaderFetchList(message,tlID,alternionHandlerEmbed){
	db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id=${tlID}`, (err,rows) => {
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

exports.teamLeaderForceLoadout = function teamLeaderForceLoadout(message,tlID,item,itemID,alternionHandlerEmbed){
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
									db.alternionConnectionPool.query(`UPDATE User SET ${field}=${rows3[s].ID} WHERE ID=${rows2[i].ID}`);
								}
								globalJsonUpdate();

								alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
									.setDescription(`Set all members of team \`${rows[0].Team_ID}\`\nNew ${item}: ${rows3[s].Display_Name}`);

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

exports.teamLeaderForceLoadoutUser = function teamLeaderForceLoadoutUser(message,tlID,item,itemID,targetID,alternionHandlerEmbed){
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

									getLocalJson(rows2[0].discord_id);

									alternionHandlerEmbed.setTitle("Setup " + item +"(s)")
										.setDescription(`Updated member <@${rows2[0].discord_id}> of team \`${rows[0].Team_ID}\`\nNew ${item}: **${rows3[0].Display_Name}**`);

									sendAlternionEmbed(message,alternionHandlerEmbed,false);
									break;
								}
							}

							if (hasNotFound){
								message.channel.send(`Could not find any **${item}(s)** with ID \`${itemID}\``);
							}
						});
					}else{
						message.channel.send(`This user is not part of your team!`);
					}
				});
			}else{
				message.channel.send("This command is for Team Leaders only!");
			}
		});
	}else{
		message.channel.send("Incorrect input, double check your inputs.");
	}
}

exports.teamLeaderSearch = function teamLeaderSearch(message, type, ID, alternionHandlerEmbed){
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

exports.removeAllEquipped = function removeAllEquipped(userID,teamID){
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