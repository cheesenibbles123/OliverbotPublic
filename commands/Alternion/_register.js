const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const { reply } = require("./../_combinedResponses.js");

module.exports = {
	name: "register",
	args: 3,
	help: "Allows a user to be registered into the database\n;Alternion Register `{steamid}` `{discordid}`",
	users: ["337541914687569920"],
	execute: (event,args,isMessage) => {

		if (!isNaN(parseInt(args[1]))){
			if (!args[2] || !isNaN(parseInt(args[2]))){
				if (!args[2]){
					args[2] = null;
				}
				handleAlternionRegistration(event,args[1],args[2],isMessage);
			}
		}

	}
}

function handleAlternionRegistration(event,steamID,discordID,isMessage){
	let registrationEmbed = new Discord.MessageEmbed()
		.setTitle("Registration");
	
	let list = "";

	db.alternionConnectionPool.query(`SELECT ID,Steam_ID,Discord_ID FROM User WHERE Steam_ID='${steamID}'`, (err,rows) => {

		if (rows.length > 1){

			for (let i = 0; i < rows.length; i++){
				list += `${rows[i].ID}: ${rows[i].Steam_ID} - <@${rows[i].Discord_ID}>\n`;
			}

			registrationEmbed.addField("Heres a list of users with that steamID", list);
			reply(event,{embeds:[registrationEmbed]},isMessage);

		}else if (rows.length < 1){
			// Create user
			db.alternionConnectionPool.query(`SELECT Count(*) as count FROM User`, (err,countRows) => {
				db.alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows[0].count}, ${steamID}, ${discordID})`);
				registrationEmbed.setDescription(`Added user into the database!\n\`${countRows[0].count}\`, \`${steamID}\`, \`${discordID}\``);
				reply(event,{embeds:[registrationEmbed]},isMessage);
			});
		}else if (rows.length === 1){
			// Already exists, output ID and discord_id
			registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].Steam_ID}\`, \`${rows[0].Discord_ID}\``);
			reply(event,{embeds:[registrationEmbed]},isMessage);
		}

	});
}