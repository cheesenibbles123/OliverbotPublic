const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "search",
	args: 3,
	help: "Searches for a user by steamID or discordID",
	execute: async (event,args,isMessage) => {

		let isTL = await shared.checkIfTL(event);

		if (isTL){

			let embed = new Discord.MessageEmbed();

			teamLeaderSearch(event,args[1],args[2],embed,isMessage);
		}
	}
}

function teamLeaderSearch(event, type, ID, alternionHandlerEmbed, isMessage){
	db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Discord_ID='${event.member.user.id}'`, (err,rows) => {
		if (rows){
			if (rows.length < 1){
				reply(event,"You are currently not in the database.",isMessage);
			}else if (rows.length > 1){
				reply(event,"There seems to be an issue, you are recorded multiple times.",isMessage);
			}else if (rows[0].Team_Leader === 0){
				reply(event,"You must be a team leader to use this command!",isMessage);
			}else{
				if (type === "discord"){
					db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Discord_ID='${ID}'`, (err,rows) => {
						if (rows){
							if (rows.length < 1){
								reply(event,"User is currently not in the database.",isMessage);
							}else if (rows.length > 1){
								reply(event,"There seems to be an issue, this user is recorded multiple times.",isMessage);
							}else{
								alternionHandlerEmbed.setDescription("`" + rows[0].ID + "`");
								reply(event,{embeds:[alternionHandlerEmbed]},isMessage);
							}
						}else{
							reply(event,"No rows found.",isMessage);
						}
					});
				}else if (type === "steam"){
					db.alternionConnectionPool.query(`SELECT ID FROM User WHERE Steam_ID='${ID}'`, (err,rows) => {
						if (rows){
							if (rows.length < 1){
								reply(event,"User is currently not in the database.",isMessage);
							}else if (rows.length > 1){
								reply(event,"There seems to be an issue, this user is recorded multiple times.",isMessage);
							}else{
								alternionHandlerEmbed.setDescription("`" + rows[0].ID + "`");
								reply(event,{embeds:[alternionHandlerEmbed]},isMessage);
							}
						}else{
							reply(event,"No rows found.",isMessage);
						}
					});
				}
			}
		}else{
			reply(event,"No rows found.",isMessage);
		}
	});
}