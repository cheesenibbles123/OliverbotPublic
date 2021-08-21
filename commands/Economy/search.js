const db = require("./../../startup/database.js");
const Discord = require("discord.js");
const {reply} = require("./../_combinedResponses");

let bot;

module.exports = {
	name: "search",
	args: 1,
	help: "Search for an item by its ID",
	usage: "<itemID>",
	category: "Economy",
	options: [
		{
			name : "itemid",
			description : "ID of the item you wish to search for",
			type : 3,
			required : true
		}
	],
	init: (botInstance) => {
		bot = botInstance;
	},
	executeGlobal: (event,args,isMessage) => {

		if (typeof(args) !== 'string' && args.length >= 1){
			let item = args[0];
			if (item.includes("drop") || item.includes("tables") || item.includes("delete") || item.includes("select" || item.includes("*"))){
				reply(event,"Please enter an appropriate search term!",isMessage);
			}

			if (Array.isArray(item)){
				item = item.join(' ');
			}
			item = item.toLowerCase().replace(/ /g,"");

			db.mainDatabaseConnectionPool.query(`SELECT * FROM shop WHERE name LIKE '%${item}%'`, (err,rows) => {
				if(err) console.log(err);
				let sql;
				if(rows.length < 1){
					reply(event,"That item does not exist.",isMessage);
				} else if(rows.length > 1 && rows.length < 10){
					let allNames = "Results:\n```\n";
					for (i=0; i< rows.length; i++){
						allNames = allNames + rows[i].name + "\n";
					}
					reply(event,allNames+"```",isMessage);
				}else if( rows.length >= 10){
					reply(event,"Could you be more specific? Using your term I got " + rows.length + " results.",isMessage);
				}else{
					let itemInfo = JSON.parse(rows[0].info);
					let searchEmbed = new Discord.MessageEmbed()
						.setTitle(`${itemInfo.name}`)
						.setDescription(`${itemInfo.desc}`);
					if (itemInfo.type.includes("megaShip")){
						searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}\nNationality: ${itemInfo.nationality}`,true)
							.addField(`More Info`,`[More historical information about this ship can be found here](${itemInfo.link})`,true);
					}else if (itemInfo.type.includes("Ship")){
						searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}\nCannon Layout: ${itemInfo.cannons}\nCrew: ${itemInfo.crew}`);
					}else{
						searchEmbed.addField(`Info`,`Name: ${itemInfo.name}\nType: ${itemInfo.type}`);
					}

					searchEmbed.addFields({name : `Value`, value: `Cost: ${rows[0].value * (parseInt(rows[0].inStock) / rows[0].initialStock)}\nIn Stock: ${rows[0].inStock}`,inline: true},{name : `To Purchase`, value: "`"+`;purchase`+"` `"+`${rows[0].name}`+"`", inline: true});
					reply(event,{embeds:[searchEmbed]},isMessage);
				}
			});
		}else{
			reply(event,"Please enter the correct format:\n`;search` `Item {ID}/{Name}`",isMessage);
		}
	}
}
