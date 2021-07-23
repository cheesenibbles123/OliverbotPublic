const db = require("./../../startup/database.js");

exports.displayReactionRoles = function displayReactionRoles(){
	db.mainDatabaseConnectionPool.query('SELECT * FROM reactionRoleMessages', (err,rows, fields) => {
		if (!rows){
			return;
		}
		let characterCount = 0; // Amount of characters in each message, as discord has a 2000 character limit
		let msgCount = 0; // Amount of reaction role messages
		let finalMsg = ""; // Final message to be used
		let newMsgs = [];

		reactionRoles.forEach(roleInfo => { // ???????
			if (finalMsg.length > 1800){
				if (msgCount >= rows.length){
					bot.channels.cache.get(rows[0].channelID).send("temp").then(msg => {
						editMsg(finalMsg, rows[0].channelID, msg.id);
						newMsgs.append(msg.id);
						finalMsg = "";
					});
				}
				editMsg(finalMsg, rows[0].channelID, rows[msgCount].messageID);
				msgCount += 1;
				finalMsg = "";
			}else{
				if (roleInfo.EmojiType == "unicode"){
					finalMsg += `${roleInfo.EmojiName}` + " `:` " + `<@&${roleInfo.RoleID}>\n`; // Unicode type just has default icon as raw unicode
				}else{
					finalMsg += `<:${roleInfo.EmojiName}:${roleInfo.EmojiID}>` + " `:` " + `<@&${roleInfo.RoleID}>\n`; // Custom emoji's must be displayed with ID
				}
			}
		});

		//Display final message
		if (finalMsg != ""){
			editMsg(finalMsg, rows[0].channelID, rows[msgCount].messageID);
		}

		if (newMsgs.length >= 1){
			for (let i = 0; i < newMsgs.length; i++){
				db.mainDatabaseConnectionPool.query(`INSERT INTO reactionRoleMessages VALUES (${rows[0].channelID} ${newMsgs[i]})`);
			}
		}

	});
}