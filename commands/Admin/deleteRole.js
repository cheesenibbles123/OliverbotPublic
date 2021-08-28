const db = require("./../../startup/database.js");
const { ADMINISTRATOR } = require("./../../structs/roles");

module.exports = {
	name: "deleterole",
	args: 1,
	help: "Deletes a reaction role",
	roles: [ ADMINISTRATOR ],
	category: "Admin",
	execute: (message,args) => {
		if (args[0].indexOf(":") !== -1){
			//db.deleteReactionRole(message,args[0].split(":")[1]);
			db.configurationDatabaseConnectionPool.query(`DELETE FROM reactionRoles WHERE emojiName='${args[0].split(":")[1]}'`);
		}else{
			//db.deleteReactionRole(message,args[0]);
			db.configurationDatabaseConnectionPool.query(`DELETE FROM reactionRoles WHERE emojiName='${args[0]}'`);
		}
		db.loadReactionRolesFromDB();
		message.channel.send("Role removed!");
	}
}