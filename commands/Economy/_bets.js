const economySystem = require("./economySystem");
const db = require("./../../startup/database.js");
const Discord = require("discord.js");

let delay = 7200000;

exports.init = function init(){
	setInteverval(() => {
		trailBets();
	}, delay);
}

function trailBets(){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM Bets WHERE Closes<${new Date().getTime()} AND payoutGiven=0`, (err,rows) => {

	});
}

exports.handler = function handler(message,args){
	switch (args[0].toLowerCase()){
		case "list":
			listAllBets(message);
			break;
		default:
			betHandler(message,args);
			break;
	}
}

function createBet(userID,betID,amount,isNew){
	if (isNew){
		db.mainDatabaseConnectionPool.query(`INSERT INTO UserBets VALUES (${userID},${amount},${betID})`);
	}else{
		db.mainDatabaseConnectionPool.query(`UPDATE UserBets SET Amount=${amount} WHERE Bet_ID=${betID} AND User_ID=${userID}`);
	}
}

function checkExistingBet(userID,amount,betID,betInfo,message,embed){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM UserBets WHERE User_ID=${userID} AND Bet_ID=${betID} AND Closes>${new Date().getTime()}`, (err,rows) => {
		if (rows.length < 1){
			createBet(userID,betID,amount,true);
			embed.setDescription(`Created bet with worth of : \`${amount}\``);
			message.channel.send(embed);
		}else if (parseInt(amount) > parseInt(rows[0].Amount)){
			createBet(userID,betID,amount,false);
			embed.setDescription(`Updated existing bet to : \`${amount}\`\nFrom : \`${parseInt(rows[0].Amount)}\``);
			message.channel.send(embed);
		}
	});
}

function betHandler(message,args){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM Bets WHERE type=${args[0]} AND Closes>${new Date().getTime()}`, (err,rows) => {
		if (rows.length < 1){
			message.channel.send("No running bets found of that type!");
		}else if (rows.length > 1){
			let ID = parseInt(args[1]);
			let hasNotFound = true;
			if (isNaN(ID)){
				for (i=0;i<rows.length;i++){
					if (ID === rows[0].ID){
						hasNotFound = false;
						let embed = new Discord.MessageEmbed()
							.setTitle("Bet placement");
						let amount = parseInt(args[1]);

						if (isNaN(amount)){
							checkExistingBet(message.author.id,amount,rows[0].ID,message,embed);
						}else{
							message.channel.send("Please ensure you entered a valid amount!");
						}
						break;
					}
				}
				if (hasNotFound){
					message.channel.send(`Could not find Bet with ID: \`${ID}\``)
				}
			}
		}else{
			let embed = new Discord.MessageEmbed()
				.setTitle("Bet placement");
			let amount = parseInt(args[1]);

			if (isNaN(amount)){
				checkExistingBet(message.author.id,amount,rows[0].ID,message,embed);
			}else{
				message.channel.send("Please ensure you entered a valid amount!");
			}
		}

	});
}

function listAllBets(message){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM Bets WHERE Closes>${new Date().getTime()}`, (err,rows) => {
		let embed = new Discord.MessageEmbed()
			.setTitle("All Running Bets");

		if (rows.length >= 1){
			let allBets = "";
			for (i=0;i<rows.length;i++){
				let betInfo = JSON.parse(rows[i].Info);
				allBets += `\`${rows[i].ID}\` : ${betInfo.name}\n`;
			}
			embed.setDescription(allBets);
		}else{
			embed.setDescription("There are currently no bets running!");
		}

		message.channel.send(embed);
	});
}
