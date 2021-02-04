const economy = require("./economySystem");
const statusHandler = require("./statusHandler");
const db = require("./databaseSetup");

exports.init = function init(){
	statusHandler.initStatus();
	economy.initEconomy();
	db.setupDatabase();
}