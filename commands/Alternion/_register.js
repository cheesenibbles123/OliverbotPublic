const db = require("./../_databaseSetup.js");
const shared = require("./_sharedFunctions.js");

module.exports = {
	name: "register",
	args: 3,
	help: "Allows a user to be registered into the database",
	users: ["337541914687569920"],
	execute: (message,args) => {

		message.channel.send("Not currently active.");
	}
}

function handleAlternionRegistration(message,term,steamID,discordID){
	let registrationEmbed = new Discord.MessageEmbed().setTitle("Registration");
	let list = "";
	switch (term){
		case "steam":
			db.alternionConnectionPool.query(`SELECT * FROM User WHERE Steam_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that steamID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					db.alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						db.alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${steamID}, ${discordID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${steamID}\`, \`${discordID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		case "discord":
			db.alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${steamID}"`, (err,rows) => {

				if (rows.length > 1){

					for (let i = 0; i < rows.length; i++){
						list += `${rows[i].ID}: ${rows[i].steam_id} - ${rows[i].discord_id}\n`;
					}

					registrationEmbed.addField("Heres a list of users with that discordID", list);
					sendAlternionEmbed(message,registrationEmbed,false);

				}else if (rows.length < 1){
					// Create user
					db.alternionConnectionPool.query(`SELECT Count(*) FROM User`, (err,countRows) => {
						db.alternionConnectionPool.query(`INSERT INTO User (ID,Steam_ID,Discord_ID) VALUES (${countRows.count}, ${discordID}, ${steamID})`);
						registrationEmbed.setDescription(`Added user into the database!\n\`${countRows.count}\`, \`${discordID}\`, \`${steamID}\``);
						sendAlternionEmbed(message,registrationEmbed,false);
					});
				}else if (rows.length === 1){
					// Already exists, output ID and discord_id
					registrationEmbed.setDescription(`User already exists!\n\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					sendAlternionEmbed(message,registrationEmbed,false);
				}

			});
			break;
		default:
			registrationEmbed.setDescription("Please check you entered a valid feature\n`discord` `steam`");
			sendAlternionEmbed(message,registrationEmbed,false);
			break;
	}
}