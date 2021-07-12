const db = require("./../../startup/database.js");

let bot;

module.exports = {
	name: "config",
	args: 0,
	help: "Alteres the active commands config",
	roles: ["665939545371574283"],
	category: "Admin",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let commandName = args[0];
		let newValue = args[1];

		db.configurationDatabaseConnectionPool.query(`SELECT * FROM config`, (err,rows, fields) =>{
			let notFound = true;
			let type;
			for (i=0;i<rows.length;i++){
				if (rows[i].name === commandName){
					notFound = false;
					type = rows[i].boolInt;
				}
			}

			let correctInput = false;
			if (notFound){
				message.channel.send("Config option not found!");
			}else{
				if (type === 'int'){
					newValue = parseInt(newValue);
					if (!isNaN(newValue)){
						correctInput = true;
					}else{
						message.channel.send("Please check you have entered it correcty.");
					}
				}else
				if (type === 'bool'){
					if (newValue === 'false' || newValue === 'true'){
						correctInput = true;
					}else{
						message.channel.send("Please check you have entered it correcty.");
					}
				}

				if (correctInput){
					db.configurationDatabaseConnectionPool.query(`update config set currentval='${newValue}' where name='${commandName}'`, (err) => {
						if (err){
							message.channel.send("ERROR, please check you entered the correct information!");
							console.log("An ERROR has occured with updating the config!\n" + err);
						}else{
							message.channel.send("Done!");
						}
						db.loadConfigFromDB();
					});
				}
			}
		});
	}
}