const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const {reply} = require("./../_combinedResponses.js");

module.exports = {
	name: "whatsmyid",
	args: 0,
	execute: (event, args,isMessage) => {

		let embed = new Discord.MessageEmbed()
			.setTitle("Your ID");
		const ID = isMessage ? event.author.id : event.user.id;
		db.alternionConnectionPool.query(`SELECT ID FROM User WHERE discord_ID='${ID}'`, (err,rows) => {
			if (rows){
				if (rows.length < 1){
					reply(event,"You are currently not in the database.",isMessage);
				}else if (rows.length > 1){
					reply(event,"There seems to be an issue, you are recorded multiple times.",isMessage);
				}else{
					embed.setDescription(`${rows[0].ID}`);
					reply(event,{embeds:[embed]},isMessage);
				}
			}else{
				reply(event,"Error getting users, ping archie.",isMessage);
				console.log(rows);
			}
		});
	}
}