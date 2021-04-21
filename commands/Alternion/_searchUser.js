const db = require("./../_databaseSetup.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");

module.exports = {
	name: "search",
	args: 3,
	help: "Searches for a user by steamID or discordID",
	execute: async (message,args) => {

		let isTL = await shared.checkIfTL(message);

		if (isTL){

			let embed = new Discord.MessageEmbed();

			teamLeaderSearch(message,args[1],args[2],embed);
		}
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
								message.channel.send(alternionHandlerEmbed);
							}
						}else{
							message.channel.send("No rows found.");
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
								message.channel.send(alternionHandlerEmbed);
							}
						}else{
							message.channel.send("No rows found.");
						}
					});
				}
			}
		}else{
			message.channel.send("No rows found.");
		}
	});
}