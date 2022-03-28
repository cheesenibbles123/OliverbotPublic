const glob = require("./_globalFunctions");
const db = require("./../startup/database.js");
const Discord = require("discord.js");
const { reply } = require("./_combinedResponses.js");

let bot;
let isNotLocked = true;

module.exports = {
	name: "quiz",
	args: [0,1],
	help: "Displays a quiz question for you to answer",
	usage: "<income>",
	options : [
		{
			name : "income",
			description : "Provides income up to 5GC for 1st place, has a cooldown.",
			type : 3,
			required : false,
			choices : [
				{
					name : "type",
					value: "income"
				}
			]
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {
		if (isNotLocked){
			switch(args[0]){
				case "income":
					checkQuizAllowances(event,args,isMessage);
					break;
				default:
					getRandomQuizQuestion(event,false,isMessage);
					break;
			}
		}
	}
}

function checkQuizAllowances(event,args,isMessage){
	const id = isMessage ? event.author.id : event.member.user.id;
	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT where ID='${id}'`, (err,rows,fields) => {

		db.mainDatabaseConnectionPool.query("SELECT * FROM cooldowns WHERE name='quiz'", (err,rows2,fields) => {

			if (rows[0].lastQuiz === null){

				getRandomQuizQuestion(event,true,isMessage);
				db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${id}'`);

			}else if ((parseInt(rows[0].lastQuiz) + rows2[0].duration) < (new Date().getTime())){

				getRandomQuizQuestion(event,true,isMessage);
				db.mainDatabaseConnectionPool.query(`UPDATE inventoryGT SET lastQuiz='${new Date().getTime()}' WHERE ID='${id}'`);

			}else{
				reply(event,`Please wait, your income on this command is currently on a ${parseInt(rows2[0].duration / 1000)}sec cooldown.`,isMessage);
			}

		});

	});
}

function getRandomQuizQuestion(event,isGainingIncome,isMessage){
	db.mainDatabaseConnectionPool.query("SELECT * FROM quiz", (err,rows,fields) => {
		const num = glob.getRandomInt(rows.length - 1);
		if (rows[num].format === "text"){
			textQuizQuestions(event,rows[num].question,JSON.parse(rows[num].awnsers),rows[num].timeFactor,rows[num].worthFactor,rows[num].maxAttempts,isGainingIncome,isMessage);
		}
	});
}

function checkAnswer(answers, input){
	input = input.toLowerCase();

	for (let i=0; i < answers.length; i++){
		if (answers[i] === input && answers[i].length === input.length){
			return true;
		}
	}
	return false;
}

async function textQuizQuestions(event,question,answers,timeFactor,worthFactor,maxAttempts,isGainingIncome,isMessage){
	const baseIncome = 5;
	isNotLocked = false;
	const channel = isMessage ? event.channel : bot.channels.cache.get(event.channelId);
	let quizEmbed = new Discord.MessageEmbed()
		.setTitle("Quiz Question")
		.setDescription(question)
		.addField("Max Attempts", `${maxAttempts}`, true);

	if (isGainingIncome){
		quizEmbed.addField("Reward", `${baseIncome * worthFactor}`,true);
	}
	channel.send({ embeds: [quizEmbed] }).then(() => {

		let list = [];
		let attempts = {};

		let filter = response => {
			if (response.author.bot) return false;
			if (list.indexOf(response.author) !== -1) return false;
			
			if (attempts[response.author.id]){
				attempts[response.author.id] += 1;
			}else{
				attempts[response.author.id] = 1;
			}

			if (response.attachments.size > 0){
				response.channel.send("Attachments are not supported as answers.");
				return false;
			}else if (attempts[response.author.id] <= maxAttempts && list.indexOf(response.author) === -1 && checkAnswer(answers, response.content) ){
				return true;
			}else{
				if (attempts[response.author.id] > maxAttempts && attempts[response.author.id] < maxAttempts + 2){
					response.channel.send("You have reached the max number of attempts you can make!");
				}
				try{
					response.react("❎");
				}catch(e){
					// ignore, just here incase interactions dont like it
				}
				return false;
			}
		};

		const collector = channel.createMessageCollector({filter, time: 15000 * timeFactor });

		collector.on('collect', msg => {
			if (list.indexOf(msg.author) === -1 && !msg.author.bot){
				list.push(msg.author);
				msg.delete();
				channel.send(`${msg.author} got the correct answer!`);
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
				channel.send({embeds : [embed]});
			}else{
				channel.send('Sadly, right now, is not the moment we find out the answer to this question.');
			}

			isNotLocked = true;
			attempts = {};
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