const db = require("./../../startup/database.js");
const { ARCHIE } = require("./../../structs/users.js");

module.exports = {
	name: "database",
	args: [1,200],
	help: "Queries the database",
	users: [ ARCHIE ],
	category: "Owner",
	execute: async (message,args) => {
		try{
			if (args[0].startsWith("$")){
				let databaseName = args[0].split(1, args[0].length);
				args = args.shift();
				runDatabaseCommand(message, databaseName, args.join(" "));
			}else if (args[0] === "help"){
				message.channel.send("Current flags:\n `$`database");
			}else{
				runDatabaseCommand(message, mysqlLoginData.database, args.join(" "));
			}
		}catch (err) {
			message.channel.send(err);
		}
	}
}


function runDatabaseCommand(message,database,query){

	db.mainDatabaseConnectionPool.query(query, (err,rows) => {
		if (err){
			message.channel.send(err);
		}
		else{
			let count = 0;
			let responseMsg = "```\n";
			let hasNotSent = true;
			for (let i = 0; i < rows.length; i++){
				if (responseMsg.length >= 1500){
					message.channel.send(responseMsg + "```");
					message.channel.send(`Covers: ${count} / ${rows.length} rows.`);
					hasNotSent = false;
					break;
				}else{
					for (var key of Object.keys(rows[i]))
					{
						if (rows[i].hasOwnProperty(key)){
							if (count < rows.length - 1)
							{
								responseMsg += `${rows[i][key]}, `;
							}else{
								responseMsg += `${rows[i][key]}`;
							}
						}
					}
					responseMsg += "\n";
					count += 1;
				}
			}

			if (hasNotSent){
				message.channel.send(responseMsg);
			}
		}
	});
}