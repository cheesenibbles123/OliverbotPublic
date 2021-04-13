const db = require("./../_databaseSetup");

module.exports = {
	name: "createrole",
	args: 2,
	help: "Creates a role that can be assigned through a reaction",
	roles: ["665939545371574283"],
	execute: (message,args) => {
		if (args[0].indexOf(":") !== -1){
			let emojiID = args[0].split(":")[2].toString();
			emojiID = emojiID.slice(0, emojiID.length - 1);
			db.configurationDatabaseConnectionPool.query(`insert into reactionRoles values ('${args[0].split(":")[1]}' , '${emojiID}' , 'NA' , '${args[1].slice(3,args[1].length - 1)}' )`);
		}else{
			db.configurationDatabaseConnectionPool.query(`insert into reactionRoles values ('${args[0]}' , 'NA' , 'unicode' , '${args[1].slice(3,args[1].length - 1)}' )`);
		}
		db.loadReactionRolesFromDB();
		message.channel.send("Role added!");
	}
}