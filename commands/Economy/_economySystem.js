const db = require("./../../startup/database.js");
const config = require("./../../config.json");
const glob = require("./../globalFunctions");
const issueEmbed = require("./../issueEmbed");
const displays = require("./displays");
const bets = require("./tempTWBets");

const Discord = require("discord.js");
var bot;

exports.handler = function handler(message,command,args){
	switch (command){
		case "bet":
			bets.handler(message,args);
			break;
		default:
			break;
	}
}

exports.initEconomy = function initEconomy(){
	displays.initDisplays();
	bot = require("./../../oliverbot.js").bot;
}

function giftUserItem(gifterID,reciever,item,message){
	let user = glob.getUserFromMention(reciever);
	user = user.id;
	if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
		message.channel.send("Please enter an appropriate item!");
	}

	db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID = '${ID}'`, (err,rows) => {
		if(err) console.log(err);
		if(rows.length < 1){
			message.channel.send("You are not yet stored on the system! Please send a few messages so that you are added to the database.");
		}else if(rows.length > 1){
			message.channel.send(`Something has gone wrong, please message <@${config.ownerId}>`);
		}else{
			let inventory = JSON.parse(rows[0].inventory);
			let notFound = true;
			let tempList = [];
			let worth;
			for (i=0; i < inventory.length; i++){
				if (inventory[i].name !== item){
					tempList.push(inventory[i]);
				}else{
					notFound = false;
				}
			}

			if (!notFound){
				db.mainDatabaseConnectionPool.query(`select * from shop where name='${item}'`, (err,rows2) => {
					if(err) console.log(err);
					if (JSON.stringify(inventory).includes("null")){
						inventory = '[]';
					}
					db.mainDatabaseConnectionPool.query(`update inventoryGT set giraffeCoins='${parseFloat(rows[0].giraffeCoins).toFixed(2) + worth}', inventory='${JSON.stringify(tempList)}' where ID='${ID}'`);
					db.mainDatabaseConnectionPool.query(`update shop set inStock=${rows2[0].inStock + 1} where name='${item}'`);
					let itemInfo = JSON.parse(rows2[0].info);
					message.channel.send(`Item: ${itemInfo.name} has been sold for ${worth}.`);
					displays.handler(0);
				});
			}

			if (notFound){
				message.channel.send("You cannot gift this item as you do not own it!");
			}
		}
	});
}

function editMsg(contents,channelID,msgID){
	bot.channels.cache.get(channelID).messages.fetch(msgID).then( msg => {
		msg.edit(contents);
	});
}

function checkOrRemoveResources(check,list,checkForName,checkForAmount){
	if (check){
		for (let s=0; s<list.length;s++){
			if (list[i].type === "constructionResources" && list[i].name === checkForName){
				if (list[i].amount < checkForAmount){
					return 0;
				}else{
					return 1;
				}
			}
		}
		return 2;
	}else{
		for (let s=0; s<list.length;s++){
			if (list[i].type === "constructionResources" && list[i].name === checkForName){
				list[i].amount -= checkForAmount
			}
		}
		return list;
	}
}