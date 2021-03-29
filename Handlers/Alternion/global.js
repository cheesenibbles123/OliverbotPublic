const db = require("./../databaseSetup");
const updating = require("./updating");

exports.checkifInDatabase = function checkifInDatabase(message,args){
	db.alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length > 1){
			message.channel.send("You appear to have two accounts linked to this discord account, please contact Archie.");
			return;
		}else if (rows.length == 0){
			message.channel.send("Your discord account is not linked to your steamID, please contact Archie.");
			return;
		}else{
			alternionHandler(message,args);
		}
	});
}

exports.sendAlternionEmbed = sendAlternionEmbed;

function sendAlternionEmbed(message,embed,needsUpdate){
	message.channel.send(embed);
	if (needsUpdate){
		updating.getLocalJson(message.author.id);
	}
}