const Canvas = require("canvas");
const db = require("./_databaseSetup");
const glob = require("./_globalFunctions");
const Discord = require("discord.js");

module.exports = {
	name : "rankcard",
	args : 0,
	help : "Displays your rank",
	execute: (message,args) => {
		let id = message.author.id;
		if (Array.isArray(args)){
			id = glob.getUserFromMention(args[0]).id;
		}
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${id}'`, (err,rows) => {
			if(err) console.log(err);
			if(rows.length < 1){
				createDefaultRankCard(message,id);
			}else if(rows.length > 1){
				createDefaultRankCard(message,id);
			}else{
				let inventory = JSON.parse(rows[0].inventory);
				let notFound = true;
				let shipName = "";
				for (let i = 0; i < inventory.length; i++){
					if (inventory[i].type === "largeShips"){
						shipName = inventory[i].name;
						notFound = false;
						break;
					}
				}

				if (notFound){
					createDefaultRankCard(message, message.author.id);
				}else{
					createRankCanvas(message.channel,message.member,shipName,id);
				}

			}
		});
	}
}

function createDefaultRankCard(message,id){

	db.mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${id}'` , (err,rows) => {
		let xpneeded;
		let rnxp;
		let level;
		if (parseInt(rows[0].level) === 0){
			xpneeded = 400;
		}else{
			xpneeded = db.xpdetails.levelupfactor * parseInt(rows[0].level);
		}

		rnxp = parseInt(rows[0].xp);
		level = rows[0].level;
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = ${id}`, (err,rows) => {
			let rankcard = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${message.member.user.username}`)
				.setAuthor(`Rank card`)
				.setThumbnail(`${message.author.displayAvatarURL()}`)
				.setTimestamp();
			if (rows.length >0){
				rankcard.setDescription(`xp ${rnxp} / ${xpneeded}. lvl ${level}\n Giraffe Coins: ${parseFloat(rows[0].giraffeCoins).toFixed(2)}`);
			}else{
				rankcard.setDescription(`xp ${rnxp} / ${xpneeded}. lvl ${level}`);
			}
			message.channel.send(rankcard);
		});
	});

	return null;
}

async function createRankCanvas(channel,member,ship, ID){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${ID}'` , (err,rows) => {
		let xpneeded;
		let rnxp;
		let level;
		if (parseInt(rows[0].level) === 0){
			xpneeded = 400;
		}else{
			xpneeded = db.xpdetails.levelupfactor * parseInt(rows[0].level);
		}

		rnxp = parseInt(rows[0].xp);
		level = rows[0].level;
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = ${ID}`, (err,rows) => {
			if (rows.length > 0 ){
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, rows[0].giraffeCoins);
			}else{
				creatingCanvas(channel, member, ship, level, rnxp, xpneeded, "N/A");
			}
		});
	});

	return;
}

async function creatingCanvas(channel,member,ship,level,rnxp,xpneeded, gCoins){

	let canvas = Canvas.createCanvas(1920,950);
	let ctx = canvas.getContext('2d');

	//Add Background
	let background = await Canvas.loadImage(`./shipsForRankcards/${ship}.png`);
	ctx.drawImage(background, 0, 0, canvas.width, 1080);

	//Something
	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	//Display Name
	ctx.font = applyText(canvas, member.displayName);;
	ctx.fillStyle = '#ffffff';
	ctx.fillText(member.displayName, canvas.width / 2, 125);
	ctx.shadowBlue = 5;

	//Level and XP
	ctx.font = '60px monospace';
	ctx.fillStyle = '#aaa9ad';
	ctx.fillText(`Lvl: ${level}`, canvas.width / 1.5, 250);
	ctx.fillText(`XP: ${rnxp}/${xpneeded}`, canvas.width / 1.5, 375);
	ctx.fillText(`GC: ${gCoins}`, canvas.width / 1.5, 500);

	//Display Avatar
	ctx.beginPath();
	ctx.arc(225, 225, 200, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({format : 'jpg'}));
	ctx.drawImage(avatar, 25, 25, 400, 400);

	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rankcard.png');
	channel.send(attachment);
}

const applyText = (canvas, text) => {
	let ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};