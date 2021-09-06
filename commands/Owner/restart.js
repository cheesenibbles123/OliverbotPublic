const db = require("./../../startup/database.js");
const { ARCHIE } = require("./../../structs/users.js");

let bot;

module.exports = {
	name: "restart",
	args: 0,
	help: "Restarts the bot",
	users: [ ARCHIE ],
	category: "Owner",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: async (message,args) => {
		await message.channel.send("Restarting....");
		db.mainDatabaseConnectionPool.end(function (err){
			if (err) console.log(err);
		});
		db.configurationDatabaseConnectionPool.end(function (err){
			if (err) console.log(err);
		});
		process.exit();
	}
}