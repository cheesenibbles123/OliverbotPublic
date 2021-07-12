const db = require("./../../startup/database.js");
const Discord = require("discord.js");

module.exports = {
	name: "whatsmyid",
	args: 0,
	execute: (message, args) => {

		let embed = new Discord.MessageEmbed()
			.setTitle("Your ID");
			
		db.alternionConnectionPool.query(`SELECT ID FROM User WHERE discord_ID='${message.author.id}'`, (err,rows) => {
			if (rows){
				if (rows.length < 1){
					message.channel.send("You are currently not in the database.");
				}else if (rows.length > 1){
					message.channel.send("There seems to be an issue, you are recorded multiple times.");
				}else{
					embed.setDescription("`" + rows[0].ID + "`");
					message.channel.send(embed);
				}
			}else{
				message.channel.send("Error getting users, ping archie.");
				console.log(rows);
			}
		});
	}
}