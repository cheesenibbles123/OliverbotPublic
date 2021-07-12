const db = require("./../../startup/database.js");

exports.handler = function handler(message,args){
	if (!args){
		message.channel.send("Please enter a valid option!");
		return;
	}
	switch(args[0]){
		case "amount":
			getCurrentAmount(message);
			break;
		default:
			addUpdate(message,args);
			break;
	}
}

function addUpdate(message,args){
	let validOptions = ["af","cc","cf","crss","gt","se","uc","goi"];
	if (new Date().getTime() <= 1616259600000){
		if (Array.isArray(args) && args.length === 2){
			let amount = parseInt(args[0]);
			if (!isNaN(amount) && amount > 0){
				db.mainDatabaseConnectionPool.query(`SELECT giraffeCoins from inventoryGT where ID='${message.author.id}'`, (err,rows) => {
					if (amount > parseFloat(rows[0].giraffeCoins).toFixed(2)){
						message.channel.send("You cannot bet more than you have!");
					}else if (validOptions.indexOf(args[1].toLowerCase()) !== -1){
						db.mainDatabaseConnectionPool.query(`SELECT * FROM shittyTempBets WHERE user=${message.author.id}`, (err,rows) => {
							if (rows.length < 1){
								db.mainDatabaseConnectionPool.query(`INSERT INTO shittyTempBets values ('${message.author.id}',${amount},'${args[1]}')`);
								message.channel.send(`Your bet has been added.\n\`${args[1].toUpperCase()}\` : \`${amount}\``);
							}else if (rows.length > 1){
								message.channel.send("It seems you are duplicated, contact Archie.");
							}else{
								if (rows[0].amount <= amount){
									db.mainDatabaseConnectionPool.query(`UPDATE shittyTempBets SET amount=${amount}, team='${args[1]}' WHERE user='${message.author.id}'`);
									message.channel.send(`Your bet has been updated.\n\`${args[1].toUpperCase()}\` : \`${amount}\``);
								}else{
									message.channel.send("You cannot place a lower bet than you already had placed!");
								}
							}
						});
					}else{
						message.channel.send("Please enter a valid team!\n`AF,CC,CF,CRSS,GOI,GT,SE,UC`");
					}
				});
			}else{
				message.channel.send("Please enter a valid amount!");
			}
		}else{
			message.channel.send("Please enter the valid terms!\n`;bet {amount} {team}`");
		}
	}else{
		message.channel.send("Betting has closed.");
	}
}

function getCurrentAmount(message){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM shittyTempBets WHERE user=${message.author.id}`, (err,rows) => {
		message.channel.send(`Your current bet is:\n\`${rows[0].team}\` : \`${rows[0].amount}\``)
	});
}