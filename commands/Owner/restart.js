const db = require("./../_databaseSetup.js");

module.exports = {
	name: "restart",
	args: 0,
	help: "Restarts the bot",
	users: ["337541914687569920"],
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