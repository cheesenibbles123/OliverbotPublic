const db = require("./../databaseSetup");
const config = require("./../config.json");
var bot;

var delays = {
	"xpLb" : 300000
}

exports.initDisplays = function initDisplays(){
	bot = require("./../oliverbot.js").bot;
	setInterval(function(){
		updateleaderboard();
	},delays.xpLb);
	updateShopWindow();
	displayRichestUsers();
}

async function updateleaderboard(){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM xp order by level desc, xp desc limit 31`, (err,rows,fields) =>{
		let length = 0;
		if (rows.length<leaderboardlimits.listsizelimit){
			length = rows.length;
		}else{
			length = leaderboardlimits.listsizelimit; 
		}
		let finalmsg = "```diff\n"
						+"-XP LeaderBoard\n"
						+"+Rank  Username              level     XP\n";
		for (i=0;i<length;){
			let rank = (i+1).toString();
			if (rank.length > leaderboardlimits.rank){
				console.log("EXPAND SIZE");
			}else{
				let x = leaderboardlimits.rank - rank.length;
				rank = rank + new Array(x + 1).join(' ');
			}
			var user;
			let username = "";
			try{
				user = bot.guilds.cache.get(config.serverInfo.serverId).members.cache.get(rows[i].id);
				username = user.username;
			}catch(e){
				username = rows[i].id;
				//console.log(user);
				//console.log(e);
			}
			if (username.length > leaderboardlimits.username){
				username = username.slice(0,leaderboardlimits.username);
			}else{
				let x = leaderboardlimits.username - username.length;
				username = username + new Array(x + 1).join(' ');
			}
			let level = rows[i].level.toString();
			if (level.length > leaderboardlimits.level){
				level.slice(0,leaderboardlimits.level);
			}else{
				let x = leaderboardlimits.level - level.length;
				level = level + new Array(x + 1).join(' ');
			}
			let xp = rows[i].xp.toString();
			if (xp.length > leaderboardlimits.xp){
				score.slice(0,leaderboardlimits.xp);
			}else{
				let x = leaderboardlimits.xp - xp.length;
				xp = xp + new Array(x + 1).join(' ');
			}
			finalmsg = finalmsg + `${rank} | ${username} | ${level} | ${xp}\n`;
			i++;
		}
		finalmsg = finalmsg+"```";
		bot.channels.cache.get(config.serverInfo.channels.xpLeaderboard).messages.fetch(config.serverInfo.messages.xpLeaderboard).then(msg => {msg.edit(finalmsg);});
	});
}

function updateShopWindow(){
	db.mainDatabaseConnectionPool.query(`SELECT * FROM shop`, (err,rows) => {
		let newShopListing = new Discord.MessageEmbed().setTitle("Shop Channel");

		let melee = "";
		let secondary = "";
		let primary = "";

		let smallShips = "";
		let bigShips = "";
		let megaShips = "";

		let swivelTypes = "";
		let cannons = "";

		let incomeSmall = "";
		let incomeMed = "";
		let incomeLarge = "";

		let birds = "";
		let Reptiles = "";
		let Mammals = "";

		let basicMaterials = "";
		let advancedMaterials = "";
		for (i=0;i<rows.length;i++){
			let itemInfo = JSON.parse(rows[i].info);
			switch(itemInfo.type){
				case "megaShips":
					megaShips = megaShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "smallShips":
					smallShips = smallShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "largeShips":
					bigShips = bigShips + `${itemInfo.name} - ${itemInfo.crew}crew\n` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "primary":
					primary = primary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "secondary":
					secondary = secondary + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "melee":
					melee = melee + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "swivelType":
					swivelTypes = swivelTypes + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "cannons":
					cannons = cannons + `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
					break;
				case "income":
					switch(itemInfo.size)
					{
						case "Small":
							incomeSmall += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Medium":
							incomeMed += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						case "Large":
							incomeLarge += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n"
							break;
						default:
							break;
					}
					break;
				case "pet":
					switch(itemInfo.petType)
					{
						case "Bird":
							birds += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Reptile":
							Reptiles += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "Mammal":
							Mammals += `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				case "constructionResources":
					switch (itemInfo.materialType)
					{
						case "basicMaterial":
							basicMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						case "advancedMaterial":
							advancedMaterials +=  `${itemInfo.name}` + " - `" + `${rows[i].name}` + "`\n";
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		}
			db.configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {

				let shopWindowChannel = "";

				let shopInformationMessage = "";
				let shopIncomeMessage = "";
				let shopWeaponsMessage = "";
				let shopShipsMessage = "";
				let shopPetsMessage = "";
				let shopConstructionMessage = "";
				let shopShipsArnamentMessage = "";

				for (let s = 0; s < rows2.length; s++)
				{
					switch (rows2[s].name)
					{
						case "shopWindowChannel":
							shopWindowChannel = rows2[s].channelID;
							break;
						case "shopInformationMessage":
							shopInformationMessage = rows2[s].messageID;
						case "shopIncomeMessage":
							shopIncomeMessage = rows2[s].messageID;
							break;
						case "shopWeaponsMessage":
							shopWeaponsMessage = rows2[s].messageID;
							break;
						case "shopShipsMessage":
							shopShipsMessage = rows2[s].messageID;
							break;
						case "shopPetsMessage":
							shopPetsMessage = rows2[s].messageID;
							break;
						case "shopShipsArnamentMessage":
							shopShipsArnamentMessage = rows2[s].messageID;
							break;
						case "shopConstructionMessage":
							shopConstructionMessage = rows2[s].messageID;
							break;
						default:
							break;
					}
				}
				let shopInfoEmbed = new Discord.MessageEmbed()
					.setTitle("Shop Window")
					.setDescription("Items that can be purchased are listed within the containers below in the following format:\n> Item Name - `ITEMID`\nNote: you do not need to make it a `code block`, you can simply type out the itemID")
					.addField('Search', "To search for an item you search based off the `ITEMID` of the item you wish to search, for example:\n;search long9pounder",true)
					.addField('Purchase', "To purchase an item, you purchase based off the `ITEMID` of the item you wish to purchase, for example:\n ;purchase jeanbart",true);
				editMsg(shopInfoEmbed, shopWindowChannel, shopInformationMessage);

				let shopIncomeEmbed = new Discord.MessageEmbed()
					.setTitle("Income")
					.addField('Small', `${incomeSmall}`,true)
					.addField('Medium', `${incomeMed}`,true)
					.addField('Large', `${incomeLarge}`,true);
				editMsg(shopIncomeEmbed, shopWindowChannel, shopIncomeMessage);

				let shopWeaponsEmbed = new Discord.MessageEmbed()
					.setTitle("Weapons")
					.addField('Primary', `${primary}`,true)
					.addField('Secondary', `${secondary}`,true)
					.addField('Melee', `${melee}`,true);
				editMsg(shopWeaponsEmbed, shopWindowChannel, shopWeaponsMessage);

				let shopShipsEmbed = new Discord.MessageEmbed()
					.setTitle("Ships")
					.addField('Small', `${smallShips}`,true)
					.addField('Big', `${bigShips}`,true)
					.addField('Mega', `${megaShips}`,true);
				editMsg(shopShipsEmbed, shopWindowChannel, shopShipsMessage);

				let shopShipsArnamentEmbed = new Discord.MessageEmbed()
					.setTitle("Ship Arnament")
					.addField('Swivels', `${swivelTypes}`,true)
					.addField('Cannons', `${cannons}`,true);
				editMsg(shopShipsArnamentEmbed, shopWindowChannel, shopShipsArnamentMessage);

				let shopPetsEmbed = new Discord.MessageEmbed()
					.setTitle("Pets")
					.addField('Birds', `${birds}`,true)
					.addField('Mammals', `${Mammals}`,true)
					.addField('Reptiles', `${Reptiles}`,true);
				editMsg(shopPetsEmbed, shopWindowChannel, shopPetsMessage);

				let shopConstructionEmbed = new Discord.MessageEmbed()
					.setTitle("Construction Materials")
					.addField('Basic', `${basicMaterials}`,true)
					.addField('Advanced', `${advancedMaterials}`,true);
				editMsg(shopConstructionEmbed, shopWindowChannel, shopConstructionMessage);

			});
	});
}

async function displayRichestUsers(){
	
	return;
	let guild = await bot.guilds.cache.get(config.serverInfo.serverId);

	db.configurationDatabaseConnectionPool.query(`SELECT * FROM economyInformation`, (err, rows2) => {
		let economyBoardsChannel;
		let richetsUsersMesg;
		let poorestUsersMsg;
		for (let s = 0; s < rows2.length; s++){
			if (rows2[s].name == "shopBoardsChannel")
			{
				economyBoardsChannel = rows2[s].channelID;
			}else if (rows2[s].name == "richestUsers")
			{
				richetsUsersMesg = rows2[s].messageID;
			}else if (rows2[s].name == "poorestUsers")
			{
				poorestUsersMsg = rows2[s].messageID;
			}
		}
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 desc limit 30`, (err,rows) => {
			let newRichest = "```TEXT\nThe Richest Users!\nUsername            |Coins in Bank\n";
			let factor = 100;
			for (i=0;i<30;i++){
				let name;
				bot.users.cache.get(rows[i].ID).then(user => {
					try
					{
						console.log("ID: " + rows[i].ID);
						if (rows[i].ID === 'thereserve'){
							name = "Federal Reserve";
						}else {
							
							//let member = getUserFromID(rows[i].ID);
							//console.log(member);
							if (user.username === undefined){
								name = "REPLACEMENT";
							}else{
								name = user.username;
							}
						}
					}catch(e)
					{
						console.log("Richest: " + e);
						name = "REPLACEMENT";
					}

					if (name.length < leaderboardlimits.usernameEco){
						let x = leaderboardlimits.usernameEco - name.length;
						name = name + new Array(x + 1).join(' ');
					}else{
						name = name.split(0,leaderboardlimits.usernameEco);
					}
					let coins = parseInt(parseFloat(rows[i].giraffeCoins).toFixed(2) * factor);
					if (coins >= (1000000000 * factor)){
						coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
					}else if (coins >= (1000000 * factor)){
						coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
					}else if (coins >= (1000 * factor)){
						coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
					}else{
						coins = coins / factor;
					}
					newRichest = newRichest + name +"|"+ coins +"\n";
				});
			}
			newRichest += "```";
			bot.channels.cache.get(economyBoardsChannel).messages.fetch(richetsUsersMesg).then(msg => {
				msg.edit(newRichest);
			});
		});

		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT order by giraffeCoins * 1 limit 30`, (err,rows) => {
			let newPoorest = "```TEXT\nThe Poorest Users!\nUsername            |Coins in Bank\n";
			let factor = 100;
			for (s=0;s<30;s++){
				let name;

				try
				{
					//let member = bot.guilds.cache.get("401924028627025920").members.cache.get(rows3[s].ID).user;
					let member = getUserFromID(rows[i].ID);
					if (rows[s].ID === 'thereserve'){
						name = "Federal Reserve";
					}else if (member.username === undefined){
						name = "REPLACEMENT";
					}else{
						name = member.username;
					}
				}catch(e)
				{
					console.log("Poorest: " + e);
					name = "REPLACEMENT";
				}

				if (name.length < leaderboardlimits.usernameEco){
					let x = leaderboardlimits.usernameEco - name.length;
					name = name + new Array(x + 1).join(' ');
				}else{
					name = name.split(0,leaderboardlimits.usernameEco);
				}
				let coins = parseInt(parseFloat(rows[s].giraffeCoins).toFixed(2) * factor);
				if (coins >= (1000000000 * factor)){
					coins = parseFloat(coins / (1000000000 * factor)).toFixed(2) + "B";
				}else if (coins >= (1000000 * factor)){
					coins = parseFloat(coins / (1000000 * factor)).toFixed(2) + "M";
				}else if (coins >= (1000 * factor)){
					coins = parseFloat(coins / (1000 * factor)).toFixed(2) + "K";
				}else{
					coins = coins / factor;
				}
				newPoorest = newPoorest + name +"|"+ coins +"\n";
			}
			newPoorest += "```";
			bot.channels.cache.get(economyBoardsChannel).messages.fetch(poorestUsersMsg).then(msg => {
				msg.edit(newPoorest);
			});
		});
	});
	return;
}