const db = require("./../../startup/database.js");
const shared = require("./_sharedFunctions.js");
const Discord = require("discord.js");
const {reply} = require("./../_combinedResponses.js");

module.exports = {
	name: "listmembers",
	args: 1,
	help: "Displays your alternion team",
	execute: async (event,args,isMessage) => {
			let isTL = await shared.checkIfTL(event);
			let authorId = event.member ? event.member.user.id : event.user.id;
			if (isTL){

				let embed = new Discord.MessageEmbed();

				db.alternionConnectionPool.query(`SELECT Team_Leader, Team_ID FROM User WHERE discord_id=${authorId}`, (err,rows) => {
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
								embed.setTitle(rows3[0].Name)
									.setDescription(list);
								reply(event,{embeds: [embed]},isMessage);
							});
						});
					}else{
						reply(event,"This command is for Team Leaders only!",isMessage);
					}
				});
			}
	}
}