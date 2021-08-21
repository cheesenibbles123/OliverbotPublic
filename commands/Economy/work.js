const db = require("./../../startup/database.js");
const glob = require("./../_globalFunctions.js");
const {reply} = require("./../_combinedResponses");
const Discord = require("discord.js");

module.exports = {
	name: "work",
	help: "Work for coins",
	category: "Economy",
	executeGlobal: (event,args,isMessage) => {
		let ID = isMessage ? event.author.id : event.member.user.id;
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID='${ID}'`, (err,rows,fields) =>{
			let result = glob.getRandomInt(30);
			let workingEmbed = new Discord.MessageEmbed().setTimestamp()
				.setTitle("Check");
			let inv = JSON.parse(rows[0].inventory);

			if (rows.length != 0 && rows.length < 2){
				if (rows[0].lastWorked === null){
					db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${ID}'`);
					let income = 10;
					if (rows[0].inventory.length){
						for (let i = 0; i < inv.length; i++){
							if (inv[i].type === 'income'){
								income += inv[i].value;
							}
						}
					}
					db.giveUserMoney(income, ID);
					if (rows[0].giraffeCoins){
						workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(income * 100)) / 100).toFixed(2)}`);
					}else{
						workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${income}`);
					}

				}else{
					let timeDelay = 82800000;
					if ( (parseInt(rows[0].lastWorked) + timeDelay) < (new Date().getTime()) ){
						let income = 10;
						for (let i = 0; i < inv.length; i++){
							if (inv[i].type === 'income'){
								income += inv[i].value;
							}
						}
						db.giveUserMoney(income, ID);
						db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastWorked='${new Date().getTime()}' WHERE ID='${ID}'`);
						workingEmbed.setDescription(`You have earnt: ${income}GC!\nCurrent Balance: ${parseFloat((parseInt(rows[0].giraffeCoins * 100) + parseInt(income * 100)) / 100).toFixed(2)}`);
					}
					else{
						let days = [
	 				 		'Sun',
	 				 		'Mon',
					 		'Tue',
	 						'Wed',
	 				 		'Thu',
	 				 		'Fri',
	 				 		'Sat'
						]

						let time = new Date(parseInt(rows[0].lastWorked)).getTime() + timeDelay;
						let date = new Date(time);
						let timeLeft = new Date(time - new Date());

						let hrs = checkIfLessThan10(date.getHours());
						let min = checkIfLessThan10(date.getMinutes());
						let sec = checkIfLessThan10(date.getSeconds());
						
						let hrsLeft = checkIfLessThan10(timeLeft.getHours());
						let minLeft = checkIfLessThan10(timeLeft.getMinutes());
						let secLeft = checkIfLessThan10(timeLeft.getSeconds());

						let finalDate = `${days[date.getDay()]} ${hrs} : ${min} : ${sec}`;
						let remainingTime = `${hrsLeft} : ${minLeft} : ${secLeft}`;
						workingEmbed.setDescription(`You cannot work yet! You must wait until ${finalDate} CEST\nTime Remaining:  ${remainingTime}`);
					}
				}
				reply(event,{embeds : [workingEmbed]},isMessage);
				//displayRichestUsers();
			}else{
				reply(event,"Ping archie. Errors go brrr.",isMessage);
				console.log(rows);
			}
		});
	}
}

function checkIfLessThan10(input){
	let returnResult = "";
	if (parseInt(input) < 10)
	{
		returnResult += '0' + input;
	}else{
		returnResult += input;
	}

	return returnResult;
}