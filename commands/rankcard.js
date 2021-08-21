const Canvas = require("canvas");
const db = require("./../startup/database.js");
const {reply} = require("./_combinedResponses");
const Discord = require("discord.js");
const config = require("./../config.json");

module.exports = {
	name : "rankcard",
	args : [0,1],
	help : "Displays your rank",
	usage : "@user",
	guildOnly : true,
	options : [
		{
			name : "user",
			description : "View someone elses rankcard",
			required : false,
			type : 6
		}
	],
	executeGlobal: async (event,args,isMessage) => {
		let UserID;
		let member;

		if (args[0]){
			let matches = args[0].match(/^<@!?(\d+)>$/);
			if (!matches){
				return reply(event,"Please ensure you have used a ping.",isMessage);
			}else{
				UserID = matches[1];
				member = await bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(UserID);
			}
		}else{
			UserID = isMessage ? event.author.id : event.member.user.id;
			member = event.member;
		}

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${UserID}'`, (err,rows) => {
			if(err) console.log(err);
			if(rows.length !== 1){
				createDefaultRankCard(event, member, UserID, isMessage);
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
					createDefaultRankCard(event, member, UserID, isMessage);
				}else{
					createRankCanvas(event, member, shipName, UserID, isMessage);
				}

			}
		});
	}
}

function createDefaultRankCard(event,member,id,isMessage){

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
		let rankcard = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`${member.user.username}`)
			.setAuthor(`Rank card`)
			.setThumbnail(`${member.user.displayAvatarURL()}`)
			.setDescription(`xp ${rnxp} / ${xpneeded}. lvl ${level}`);
		reply(event, {embeds: [rankcard]},isMessage);
	});

	return null;
}

function createRankCanvas(event,member,ship,ID,isMessage){
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
		
		creatingCanvas(event, member, ship, level, rnxp, xpneeded, isMessage);
		
	});
}

async function creatingCanvas(event,member,ship,level,rnxp,xpneeded,isMessage){

	let canvas = Canvas.createCanvas(860,540);
	let ctx = canvas.getContext('2d');

	//Add Background
	let background = await Canvas.loadImage(`./shipsForRankcards/${ship}.png`);
	ctx.drawImage(background, 0, 0, canvas.width, 540);

	//Something
	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	//Display Name
	ctx.font = applyText(canvas, member.displayName);;
	ctx.fillStyle = '#ffffff';
	ctx.fillText(member.displayName, canvas.width / 2, 62.5);
	ctx.shadowBlue = 5;

	//Level and XP
	ctx.font = '30px monospace';
	ctx.fillStyle = '#aaa9ad';
	ctx.fillText(`Lvl: ${level}`, canvas.width / 1.5, 125);
	ctx.fillText(`XP: ${rnxp}/${xpneeded}`, canvas.width / 1.5, 187.5);

	//Display Avatar
	ctx.beginPath();
	ctx.arc(118, 118, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({format : 'jpg'}));
	ctx.drawImage(avatar, 18, 18, 200, 200);

	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rankcard.png');
	reply(event,{embdes:[attachment]},isMessage);
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