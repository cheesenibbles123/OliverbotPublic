const glob = require("./../_globalFunctions");
const Discord = require("discord.js");
const db = require("./../_databaseSetup");

module.exports = {
	name: "nwordcount",
	args: 1,
	help: "Displays number of n words said by the pinged individual",
	roles: ["665939545371574283"],
	execute: (message,args) => {
		if (Array.isArray(args)){
			try{
				let user;
				if (isNaN(parseInt(args[0]))){
					user = glob.getUserFromMention(args[0]);
				}
				db.mainDatabaseConnectionPool.query(`SELECT * FROM nWordCount WHERE ID='${user.id}'`, (err,rows, fields) => {
					if (rows.length === 0){
						message.channel.send("This user has not said the NWord yet.");
					}else{
						let nWordEmbed = new Discord.MessageEmbed()
							.setTitle("N Word Count")
							.setDescription(`User ${user.username} has said the N word ${rows[0].count} times!`);
						message.channel.send(nWordEmbed);
					}
				});
			}catch(e){
				message.channel.send("Please ensure you entered the user correctly.");
			}
		}else{
			message.channel.send("Please ensure you entered a user.");
		}
	}
}