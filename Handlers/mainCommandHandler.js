const rankcard = require("./rankcard");
const help = require("./help");
const audio = require("./audio")
const miscCommands = require("./smallCommands");
const glob = require("./globalFunctions");
const ownerOnly = require("./ownerOnly");
const quiz = require("./quizQuestions");
const economy = require("./economySystem");
const modCommands = require("./modOnly");
const adminCommands = require("./adminOnly");
const payday2 = require("./payday2");
const random = require("./randomStuff");
const blackwake = require("./blackwake");

const db = require("./databaseSetup");

exports.handler = function handler(message,command,args){
	//main command block
	switch (command){
		case "rankcard":
			rankcard.rankcardCreation(message);
			break;
		case "listcommands":
		case "help":
			help.handler(messagecommand,args);
			break;
		case "playaudio":
    	case "stopaudio":
    		audio.handler(message,command,args);
    		break;
    	case "payday2":
			payday2.getPayday2Information(message,args);
			break;
		case "delete-administrators":
		case "dox":
		case "magic":
		case "pong":
		case "execute":
		case "apod":
		case "8ball":
		case "yodish":
		case "nerds":
		case "trump":
		case "cat":
		case "rolldie":
		case "numtrivia":
		case "advice":
		case "bacon":
		case "chuck":
		case "dictionary":
		case "coinflip":
		case "today":
		case "today":
		case "playdie":
		case "rollcustom":
		case "translate":
		case "inspire":
		case "urban":
		case "memegen":
		case "insult":
			miscCommands.handler(message,command,args);
			break;
		case "quote":
		case "nootnoot":
		case "randomsong":
		case "dad":
		case "dance":
			glob.loadFromDatafile(command,"",message);
			break;
		case "marsweather":
			//GetMarsWeatherData(message);
			message.channel.send("This command is currently not working :(");
			break;
		case "database":
		case "do":
		case "restart":
			ownerOnly.handler(message,command,args);
			break;
		case "quiz":
			quiz.handler(message,command,args);
			break;
		case "gamble":
		case "giftcoins":
		case "sell":
		case "inventory":
		case "beg":
		case "work":
		case "purchase":
		case "search":
			economy.handler(message,command,args);
			break;
		case "createcommand":
		case "deletecommand":
		case "userinfo":
		case "mute":
		case "unmute":
		case "totalusers":
			modCommands.handler(message,command,args);
			break;
		case "nWordCount":
		case "config":
		case "createrole":
		case "deleterole":
		case "refreshroles":
		case "botinfo":
		case "serverinfo":
		case "channelinfo":
		case "ban":
			adminCommands.handler(message,command,args);
			break;
        case "random":
        	random.handleRandomCommand(message,3);
        	break;
		case "blackwake":
			blackwake.handler(message,command,args);
			break;
		case "tempmute":
			if (serverid === config.serverInfo.serverId && adjustableConfig.misc.moderatorCommands){
				let tempmuteMember = message.guild.members.find('id',message.mentions.users.first().id);
				if (tempmuteMember.roles.has(config.serverInfo.roles.serverModerator)){
					try{
						let tempmuteAwnser = rolecheckformutes(tempmuteMember, message);
						if (tempmuteAwnser){
							message.channel.send("You can't mute someone higher than, or at your current role.");
						}else{
							let tempmuteGo = false;
							if (typeof args[1] === "undefined"){
								time = 86400000;
								tempmuteGo = true;
							}else{
								try{
									time = parseInt(args[1]);
									tempmuteGo = true;
								}catch(e){
									message.channel.send("Please enter a correct number of hours.");
								}
							}
							if (tempmuteGo){
								let delayTemp = (parseInt(args[1])*1000*60*60);
								mute(tempmuteMember,message);
								bot.channels.cache.get("512331083493277706").send("User: "+tempmuteMember+" has been temporarily muted for "+time+" hour(s) by "+message.member.user.username+".\n"
																	+"Reason: "+(args.slice(2)).join(" "));
								setTimeout(() => {
									unmute(tempmuteMember,message)
								}, delay);
							}
						}
					}catch(e){
						message.channel.send("Error, please check you pinged an individual/ used the command correctly.");
					}
				}else{
					message.channel.send("You cannot use this command");
				}	
			}else{
				lackingPermissions(message);
			}
			break;
		case "warn":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				let member = getUserFromMention(args[0]);

				let warningEmbed = new Discord.MessageEmbed()
					.setTitle(`Warning from ${message.guild.name}`)
					.setDescription(`${(args.slice(1)).join(" ")}`);

				let loggingWarningEmbed = new Discord.MessageEmbed()
					.setTitle(`Warning to ${member.username}`)
					.setDescription(`${(args.slice(1)).join(" ")}`)
					.setFooter(`ID: ${member.id}`);

				if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
					loggingWarningEmbed.setColor(config.embedColours.warningAdmin);
					warningEmbed.setColor(config.embedColours.warningAdmin);
				}else{
					loggingWarningEmbed.setColor(config.embedColours.warningMod);
					warningEmbed.setColor(config.embedColours.warningMod);
				}

				try{
					member.send(warningEmbed).catch(() => message.channel.send("This user does not have open DMs."));
					bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(loggingWarningEmbed);
				}catch(e){
					message.reply("This isnt working currently. Tell archie to go look at the logs.");
					console.log(e);
				}

			}else{
				lackingPermissions(message);
			}
			break;
		case "savequote":
			if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
				if (typeof args[0] !== null && Number.isInteger(parseInt(args[0]))){
					saveQuote(message.channel,args[0]);
					message.reply("Done!");
				}else{
					message.reply("Please make sure you have entered the correct message ID :)");
				}
			}else{
				lackingPermissions(message);
			}
			break;

		// Alternion
		case "registeruser":
			if (message.author.id === config.ownerId){
				if (args.length > 3 || args.length < 3){
					message.channel.send("Please check your input:\n`;Register` `Feature` `steamID/discordID` `discordID/steamID`");
				}else{
					handleAlternionRegistration(message,args[0],args[1],args[2]);
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "finduser":
			if (message.author.id === config.ownerId){
				if (args[0].toLowerCase() === "steam"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE Steam_ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}else if (args[0].toLowerCase() === "discord"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}else if (args[0].toLowerCase() === "id"){
					alternionConnectionPool.query(`SELECT * FROM User WHERE ID="${args[1]}"`, (err,rows) => {
						message.channel.send(`\`${rows[0].ID}\`, \`${rows[0].steam_id}\`, \`${rows[0].discord_id}\``);
					});
				}
			}else{
				lackingPermissions(message);
			}
			break;
		case "assignuser":
			if (message.author.id === config.ownerId){
				// args[0] = type, args[1] = Alternion ID, args[2] ID to assign
				switch (args[0].toLowerCase()){

					case "steamid":
						alternionConnectionPool.query(`UPDATE User SET Steam_ID=${args[2]} WHERE ID=${parseInt(args[1])}`);
						message.channel.send("Complete.");
						break;

					case "discordid":
						alternionConnectionPool.query(`UPDATE User SET Discord_ID=${args[2]} WHERE ID=${parseInt(args[1])}`);
						message.channel.send("Complete.");
						break;

					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 1){
								alternionConnectionPool.query(`UPDATE User SET Badge_ID=${parseInt(args[2])} WHERE ID=${parseInt(args[1])}`);
								message.channel.send("Complete.");
							}else if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (rows.length > 1){
								message.channel.send("There appears to be more than one item with that ID!");
							}
						});
						break;

					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 1){
								alternionConnectionPool.query(`UPDATE User SET Main_Sail_ID=${parseInt(args[2])} WHERE ID=${parseInt(args[1])}`);
								message.channel.send("Complete.");
							}else if (rows.length === 0){
								message.channel.send("That MainSail does not exist!");
							}else if (rows.length > 1){
								message.channel.send("There appears to be more than one item with that ID!");
							}
						});
						break;

					default:
						message.channel.send("That is not a valid item to assign to!");
				}

			}else{
				lackingPermissions(message);
			}
			break;
		case "grantuser":
			if (message.author.id === config.ownerId){
				// args[0] = type, args[1] = Alternion User ID, args[2] Item ID
				let notFound = true;
				switch (args[0].toLowerCase()){

					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That badge is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple badges with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedBadges WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedBadges VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that badge!");
									}
								});
							}
						});
						break;
					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That MainSail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That MainSail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple MainSails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Main_Sail_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedMainSails VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that MainSail!");
									}
								});
							}
						});
						break;
					case "sail":
						alternionConnectionPool.query(`SELECT * FROM NormalSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("Those Sails do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("Those Sails are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Sails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Sail_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedSails VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that Sail!");
									}
								});
							}
						});
						break;
					case "weapon":
						alternionConnectionPool.query(`SELECT * FROM WeaponSkin WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That WeaponSkin do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That WeaponSkin are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple weapon skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Weapon_Skin_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedWeaponSkins VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that weapon skin!");
									}
								});
							}
						});
						break;
					case "cannon":
						alternionConnectionPool.query(`SELECT * FROM Cannon WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That Cannon do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That Cannon are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Cannons with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedCannons WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Cannon_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedCannons VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that cannon!");
									}
								});
							}
						});
						break;
					case "goldmask":
						alternionConnectionPool.query(`SELECT * FROM GoldMask WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That GoldMask do not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That GoldMask are public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple Gold Masks skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedGoldMask WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Gold_Mask_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										alternionConnectionPool.query(`INSERT INTO LimitedGoldMask VALUES (${parseInt(args[1])},${parseInt(args[2])})`)
									}else{
										message.channel.send("This user already has access to that weapon skin!");
									}
								});
							}
						});
						break;
					default:
						message.channel.send("That is not a valid item to assign to!");
				}

			}else{
				lackingPermissions(message);
			}
			break;
		case "revokeuser":
			if (message.author.id === config.ownerId){
				let notFound = true;
				switch (args[0].toLowerCase()){
					case "badge":
						alternionConnectionPool.query(`SELECT * FROM Badge WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That badge does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That badge is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple badges with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedBadges WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that badge!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedBadges WHERE User_ID=${parseInt(args[1])} AND Allowed_Badge_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "mainsail":
						alternionConnectionPool.query(`SELECT * FROM MainSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That mainsail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That mainsail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple mainsails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that mainsail!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedMainSails WHERE User_ID=${parseInt(args[1])} AND Allowed_Main_Sail_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "sail":
						alternionConnectionPool.query(`SELECT * FROM NormalSail WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That sail does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That sail is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple sails with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedSails WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that Sail!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedSails WHERE User_ID=${parseInt(args[1])} AND Allowed_Sail_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					case "weapon":
						alternionConnectionPool.query(`SELECT * FROM WeaponSkin WHERE ID=${parseInt(args[2])}`, (err,rows) => {
							if (rows.length === 0){
								message.channel.send("That weapon skin does not exist!");
							}else if (parseInt(rows[0].Limited) !== 1){
								message.channel.send("That weapon skin is public!");
							}else if (rows.length > 1){
								message.channel.send("There seem to be multiple weapon skins with that ID.");
							}else{
								alternionConnectionPool.query(`SELECT * FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])}`, (err,rows) => {
									for (let i=0; i < rows.length; i++){
										if (rows[i].Allowed_Badge_ID === parseInt(args[2])){
											notFound = false;
										}
									}
									if (notFound){
										message.channel.send("This user doesn't have access to that weapon skin!");
									}else{
										alternionConnectionPool.query(`DELETE FROM LimitedWeaponSkins WHERE User_ID=${parseInt(args[1])} AND Allowed_Weapon_Skin_ID=${parseInt(args[2])}`);
									}
								});
							}
						});
						break;
					default:
						message.channel.send("Not a valid parameter.");
						break;
				}
			}else{
				lackingPermissions(message);
			}
			break;

    	default:
    		message.react("🤔");
    		break;
	}
}