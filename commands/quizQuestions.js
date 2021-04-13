const glob = require("./_globalFunctions");
const db = require("./_databaseSetup");
const Discord = require("discord.js");

isNotLocked = true;

module.exports = {
	name: "quiz",
	args: [0,1],
	help: "Displays a quiz question for you to awnser",
	execute: (message,args) => {
		if (isNotLocked){
			switch (args[0]){
				case "income":
					checkQuizAllowances(message,args);
					break;
				default:
					getRandomQuizQuestion(message,false);
					break;
			}
		}
	}
}

function checkQuizAllowances(message,args){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT where ID='${message.author.id}'`, (err,rows,fields) => {

		db.mainDatabaseConnectionPool.query("SELECT * FROM cooldowns WHERE name='quiz'", (err,rows2,fields) => {

			if (rows[0].lastQuiz === null){

				getRandomQuizQuestion(message,true);
				db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${message.author.id}'`);

			}else if ((parseInt(rows[0].lastQuiz) + rows2[0].duration) < (new Date().getTime())){

				getRandomQuizQuestion(message,true);
				db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${message.author.id}'`);

			}else{
				message.channel.send(`Please wait, your income on this command is currently on a ${parseInt(rows2[0].duration / 1000)}sec cooldown.`);
			}

		});

	});
}

function getRandomQuizQuestion(message,isGainingIncome){
	db.mainDatabaseConnectionPool.query("SELECT * FROM quiz", (err,rows,fields) => {
		let num = glob.getRandomInt(rows.length - 1);
		if (rows[num].format === "text"){
			textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,rows[num].maxAttempts,isGainingIncome);
		}
	});
}

async function textQuizQuestions(message,question,awnsers,timeFactor,worthFactor,maxAttempts,isGainingIncome){
	let baseIncome = 5;
	isNotLocked = false;

	message.channel.send(question).then(() => {

		let list = [];

		let filter = response => {
			if (response.attachments.size > 0){
				response.channel.send("Attachments are not supported as awnsers.");
				return false;
			}else if ( awnsers.indexOf(response.content.toLowerCase()) !== -1 && list.indexOf(response.author) === -1 && !response.author.bot){
				return true;
			}else{
				return false;
			}
		};

		let collector = message.channel.createMessageCollector(filter, { max: maxAttempts, time: 15000 * timeFactor });

		collector.on('collect', msg => {
			// console.log('Got answer for: ' + msg.content);
			if (list.indexOf(msg.author) === -1){
				list.push(msg.author);
				msg.delete();
				message.channel.send(`${msg.author} got the correct awnser!`);
			}
		});

		collector.on('end', collected => {
			if (list.length > 0){
				let embed = new Discord.MessageEmbed();
				let worth = baseIncome * worthFactor;

				if (isGainingIncome){
					embed.setTitle(`Income`);
				}else{
					embed.setTitle(`Ranking`);
				}

				let allUsers = "";
				for (let i=0; i < list.length; i++){
					if (isGainingIncome){
						let income = parseFloat(worth * (1/(i + 1))).toFixed(2);
						allUsers += `${i + 1} : ${list[i]} : ${income}GC\n`;
						db.giveUserMoney(income, list[i].id);
					}else{
						allUsers += `${i + 1} : ${list[i]}\n`;
					}
				}
				embed.setDescription(allUsers);
				message.channel.send(embed);
			}else{
				message.channel.send('Sadly, right now, is not the moment we find out the answer to this question.');
			}

			isNotLocked = true;
		});
	});
}

function specificQuiz(message,type){
	switch (type){
		case "flags":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='flags'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "blackwake":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='blackwake'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "science":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='science'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "sports":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='sports'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "geography":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='geography'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "show/music":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='show/music'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		case "tech":
			glob.mainDatabaseConnectionPool.query("SELECT * FROM quiz WHERE type='tech'", (err,rows,fields) => {
				let num = glob.getRandomInt(rows.length - 1);
				if (rows[num].format === "text"){
					textQuizQuestions(message,rows[num].question,rows[num].awnsers,rows[num].timeFactor,rows[num].worthFactor,isGainingIncome);
				}
			});
			break;
		default:
			break;
	}
}