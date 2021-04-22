const db = require("./../_databaseSetup");

module.exports = {
	name: "deleterole",
	args: 1,
	help: "Deletes a reaction role",
	roles: ["665939545371574283"],
	category: "Admin",
	execute: (message,args) => {
		if (args[0].indexOf(":") !== -1){
			//db.deleteReactionRole(message,args[0].split(":")[1]);
			db.configurationDatabaseConnectionPool.query(`delete from reactionRoles where emojiName='${args[0].split(":")[1]}'`);
		}else{
			//db.deleteReactionRole(message,args[0]);
			db.configurationDatabaseConnectionPool.query(`delete from reactionRoles where emojiName='${args[0]}'`);
		}
		db.loadReactionRolesFromDB();
		message.channel.send("Role removed!");
	}
}