const Discord = require("discord.js");
var bot;
const config = require("./../config.json");
const fetch = require("node-fetch");
var adjustableConfig;
//const issueEmbeds = require("./issueEmbed");
const db = require("./_databaseSetup");

const bw = require('@cheesenibbles123/blackwakehandler');

module.exports = {
	name: "blackwake",
	args: [1,2],
	help: "Fetches blackwake data from your steam account.",
	category: "Api",
	init: () =>{
		bw.init(config.apiKeys.steam);
	},
	execute: async (message,args) => {
		let steamID;
		if (args.length === 1){
			steamID = await checkifInDatabaseBWHandler(message);
		}else if (!isNaN(parseInt(args[1]))){
			steamID = args[1];
		}

		if (args[0] === "monthly"){
			fetchEloStuff(message, steamID, args[0]);
		}else{

			bw.handler(args[0], steamID).then(data => {
				if (data.isValid){

					let embed = new Discord.MessageEmbed()
						.setTitle(data.type);

					switch (data.type){
						case "overview":
							embed.addField("General",data.content.playerStats.formatted,true)
								.addField("Captain Stats",data.content.captainStats.formatted,true)
								.addField("Fav Weapon",data.content.playerStats.faveWeapon.formatted,true);
							break;
						case "weaponstats":
							embed.setDescription(data.content.formatted);
							break;
						case "shipstats":
							embed.addField("Ships",data.content.ships.formatted,true)
								.addField("General",data.content.general.formatted,true);
							break;
						case "shipweaponry":
							embed.setDescription(data.content.formatted);
							break;
						case "maintenance":
							embed.setDescription(data.content.formatted);
							break;
						case "misc":
							embed.setDescription(data.content.formatted);
							break;
						default:
							break;
					}

					message.channel.send(embed);

				}else{
					message.channel.send("Invalid type and/or SteamID provided.");
				}	
			}).catch(err => {
				message.channel.send("Please ensure you entered a valid **SteamID64** and your profile is set to **Public**.");
			});
		}
	}
}

exports.init = function init(){
	bot = require("./../oliverbot.js").bot;
	adjustableConfig = require("./databaseSetup.js").adjustableConfig;
}

exports.handler = function handler(message,command,args){
	if (adjustableConfig.apis.blackwake){
		if (!args){
			message.reply("Please enter the valid terms!");
		}else
		if (args.length < 1){
			message.reply("Please enter the valid terms!");
		}else{
			switch (args[0].toLowerCase()){
				case "monthly":
					if (!isNaN(parseInt(args[1])))
					{
						fetchEloStuff(message, args[1], args[0]);
					}else{
						checkifInDatabaseBW(message,args,"elo");
					}
					break;
				case "elo":
					message.channel.send("This command is currently disabled.");
					break;
					if (!isNaN(parseInt(args[1])))
					{
						fetchEloStuff(message, args[1], args[0]);
					}else{
						checkifInDatabaseBW(message,args,"elo");
					}
					break;
				default:
					if (!isNaN(parseInt(args[1])))
					{
						getBlackwakeStats(message,args);
					}else{
						checkifInDatabaseBW(message,args);
					}
					break;
			}
		}
	}else{
		message.channel.send("Command disabled");
	}
}

async function fetchEloStuff(message,steamID,type){

	fetch(config.eloBoardURL).then(resp => resp.json()).then(response => {

		let eloStatsEmbed = new Discord.MessageEmbed()
			.setFooter(`This data is taken from the ahoycommunity LB, it only gets updated if your profile is public and you play on GT.`);
		let user;

		switch (type)
		{
			case "elo":

				user = response.elo[steamID];

				let results = calculateEloPosition(steamID, response, user.matches, user.rating);

				let elo = results[0];
				let matches = results[1];
				let desc;

				if (parseFloat(user.rating) === 1000.00)
				{
					eloStatsEmbed.addField("You", `Rating: ${user.rating}\nMatches: ${user.matches}\nPosition: 1`, true)
						.addField("2nd Place", `Rating: ${elo[2]}\nMatches: ${matches[2]}\nPosition: 2`, true);
					//desc = `Rating: ${user.rating}\nMatches: ${user.matches}\nPosition: 1\n2nd Place: ${elo[2].rating}`;
				}else{
					let positions = results[2];
					eloStatsEmbed.addField("Target", `Rating: ${elo[0]}\nMatches: ${matches[0]}\nPosition: ${positions[0]}`, true)
						.addField("You", `Rating: ${elo[1]}\nMatches: ${matches[1]}\nPosition: ${positions[1]}`, true)
						.addField("Chaser", `Rating: ${elo[2]}\nMatches: ${matches[2]}\nPosition: ${positions[2]}`, true)
				}

				eloStatsEmbed.setTitle(steamID);
				sendBWStatsEmbed(message,eloStatsEmbed);
				break;
			case "monthly":
				user = response.monthly[steamID];
				if (user === undefined){
					message.channel.send("You are not on the monthly leaderboard. Play a game or two on the GT server to be added.");
					break;
				}
				
				let weapons = ["acc_mus","acc_blun","acc_nock","acc_ann","acc_rev","acc_pis","acc_duck","acc_mpis","acc_cut","acc_dag","acc_bot","acc_tomo","acc_gren","acc_rap"];
				let substituteNames = ["Musket","Blunderbuss","Nockgun","Annley","Revolver","Pistol","Duckfoot","Short Pistol","Cutlass","Dagger","Bottle","Tomohawk","Grenade","Rapier"];
				let allWeaponStats = [];

				let shipWeaponry = ["acc_can","acc_swiv","acc_grape","acc_arson","acc_ram"];
				let shipWeaponrySubNames = ["Cannonball","Swivel","Grapeshot","Fireshot","Ramming"];
				let shipWeaponryStats = [];

				let ships = ["acc_winHoy","acc_winJunk","acc_winSchoon","acc_cutt","acc_bombk","acc_carr","acc_gunb","acc_winGal","acc_brig","acc_xeb","acc_cru","acc_bombv"];
				let subShipNames = ["Hoy","Junk","Schooner","Cutter","Bomb Ketch","Carrack","Gunboat","Galleon","Brig","Xebec","Cruiser","Bomb Vessel"];
				let shipStats = [];

				let maintenance = ["acc_rep","acc_pump","acc_sail","acc_noseRep"];
				let subMaintain = ["Hole Repairs","Pumping","Sail Repairs","Nose Repairs"];
				let maintain = [];

				let unassigned = true;
				let faveWeap = {}; //"name" : "", "value": ""
				let kills = 0;
				let deaths = 0;
				let captainWins = 0;
				let captainLosses = 0;
				let score = 0;
				let rating = 0;
				let statScoreGs = 0;
				let prestige = 0;

				for (var [key, value] of Object.entries(user))
				{
					switch (key)
					{
						// Totals
						case "acc_kills":
							kills = value;
							break;
						case "acc_deaths":
							deaths = value;
							break;
						case "acc_capWins":
							captainWins = value;
							break;
						case "acc_capLose":
							captainLosses = value;
							break;
						case "stat_score":
							score = value;
							break;
						// PLAYER WEAPONS
						case "acc_mus":
							allWeaponStats.push({ "name" : key , "value" : value});
							break;
						case "acc_blun":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_nock":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_ann":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_rev":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_pis":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_duck":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_mpis":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cut":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_dag":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bot":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_tomo":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_gren":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_rap":
							allWeaponStats.push({ "name" : key , "value" : value});;
							break;
						// SHIP WEAPONRY
						case "acc_can":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_swiv":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_grape":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_arson":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_ram":
							shipWeaponryStats.push({ "name" : key , "value" : value});;
							break;
						// SHIPS
						case "acc_winHoy":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winJunk":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winSchoon":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cutt":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bombk":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_carr":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_gunb":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_winGal":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_brig":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_xeb":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_cru":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						case "acc_bombv":
							shipStats.push({ "name" : key , "value" : value});;
							break;
						// MAINTENANCE
						case "acc_rep":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_pump":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_sail":
							maintain.push({ "name" : key , "value" : value});;
							break;
						case "acc_noseRep":
							maintain.push({ "name" : key , "value" : value});;
							break;
						// If none of the above
						default:
							console.log("New entry found! -" + key + "-");
							break;
					}
				}

				let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins");
				let shipWeap = WeaponTextGenerator(WeaponSorter(shipWeaponryStats),shipWeaponrySubNames,shipWeaponry,"kills");
				let WeaponStats = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills");
				let maintainStats = WeaponTextGenerator(WeaponSorter(maintain),subMaintain,maintenance,"");

				if (ShipStats.length < 1){
					ShipStats = "-";
				}

				eloStatsEmbed.setTitle(steamID)
					.addField(`Overview`, `Kills: ${kills}, Deaths: ${deaths} => K/D ratio: ${kills/deaths}\nCap Wins: ${captainWins}, Cap Losses: ${captainLosses} => W/L ratio: ${captainWins/captainLosses}\nScore: ${score}`);
				if (ShipStats.length > 1){
					eloStatsEmbed.addField(`Ship Stats`, ShipStats, true);
				}
				if (shipWeap.length > 1){
					eloStatsEmbed.addField(`Ship Weaponry`, shipWeap, true);
				}
				if (WeaponStats.length > 1){
					eloStatsEmbed.addField(`Weapon Stats`, WeaponStats, true);
				}
				if (maintainStats.length > 1){
					eloStatsEmbed.addField(`Maintenance`, maintainStats, true);
				}
				sendBWStatsEmbed(message,eloStatsEmbed);
				break;
		}
	});
}

function calculateEloPosition(steamID,response,userMatches,userRating){
	// Infront, User, Behind
	let elo = [1000.0,userRating,0.0];
	let matches = [0,userMatches,0];
	let position = [0,0,0];
	let allRatings = [];
	let allUsers = Object.values(response.elo);

	for (let i = 0; i < allUsers.length; i++)
	{
		let rating = allUsers[i].rating;
		if (rating != NaN)
		{
			if (rating > userRating && rating < elo[0]){

				elo[0] = rating;
				matches[0] = allUsers[i].matches;

			}else if (rating < userRating && rating > elo[2]){

				elo[2] = rating;
				matches[2] = allUsers[i].matches;

			}
			allRatings.push(rating);
		}
	};

	allRatings.sort(function(a, b){return b - a});
	position[0] = allRatings.indexOf(elo[0]);
	position[1] = position[0] + 1;
	position[2] = position[0] + 2;

	return [elo,matches,position];
}

function sendBWStatsEmbed(message,embed){
    message.channel.send(embed);
}

function checkifInDatabaseBWHandler(message){
	return new Promise((resolve, reject) => {
		db.alternionConnectionPool.query(`SELECT Steam_ID FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
			if (rows.length > 1){
				message.channel.send("You appear to have two accounts linked to this discord account, please contact Archie.");
				resolve(0);
			}else if (rows.length == 0){
				message.channel.send("Your discord account is not linked to your steamID, please provide your steamID or contact Archie.");
				resolve(0);
			}else{
				resolve(rows[0].Steam_ID);
			}
		});
	});
}

function checkifInDatabaseBW(message,args,type){
	db.alternionConnectionPool.query(`SELECT * FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
		if (rows.length > 1){
			message.channel.send("You appear to have two accounts linked to this discord account, please contact Archie.");
			return;
		}else if (rows.length == 0){
			message.channel.send("Your discord account is not linked to your steamID, please provide your steamID or contact Archie.");
			return;
		}else{
			args.push(rows[0].steam_id)
			if (type === "elo"){
				fetchEloStuff(message, args[1], args[0]);
			}else{
				getBlackwakeStats(message,args);
			}
		}
	});
}

async function getBlackwakeStats(message,args){
	fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=420290&steamid=${args[1]}`).then(resp => resp.text()).then(response => {

		if (response.includes("500 Internal Server Error")){
			message.channel.send("Steam API error, code 500");
		}else if (response.includes("Unknown problem determining WebApi request destination.")) {
			message.channel.send("Please ensure you have entered the correct terms! Terms can be found using `;help` `blackwake`.\nThe format is as followed:\n`;blackwake` `term` `steamID64`");
		}else if(response[0] == '<') {
			console.log("BW RESPONSE ISSUE");
			console.log(response);
			console.log("END OF RESPONSE");
			message.channel.send("Error - Please ping @Archie so he checks the console in time!");
		}else{
			let bwStatsEmbed = new Discord.MessageEmbed().setTimestamp();
			response = JSON.parse(response);
			let stats = response.playerstats.stats;

			let weapons = ["acc_mus","acc_blun","acc_nock","acc_ann","acc_rev","acc_pis","acc_duck","acc_mpis","acc_cut","acc_dag","acc_bot","acc_tomo","acc_gren","acc_rap"];
			let substituteNames = ["Musket","Blunderbuss","Nockgun","Annley","Revolver","Pistol","Duckfoot","Short Pistol","Cutlass","Dagger","Bottle","Tomohawk","Grenade","Rapier"];
			let allWeaponStats = [];

			let shipWeaponry = ["acc_can","acc_swiv","acc_grape","acc_arson","acc_ram"];
			let shipWeaponrySubNames = ["Cannonball","Swivel","Grapeshot","Fireshot","Ramming"];
			let shipWeaponryStats = [];

			let ships = ["acc_winHoy","acc_winJunk","acc_winSchoon","acc_cutt","acc_bombk","acc_carr","acc_gunb","acc_winGal","acc_brig","acc_xeb","acc_cru","acc_bombv"];
			let subShipNames = ["Hoy","Junk","Schooner","Cutter","Bomb Ketch","Carrack","Gunboat","Galleon","Brig","Xebec","Cruiser","Bomb Vessel"];
			let shipStats = [];

			let maintenance = ["acc_rep","acc_pump","acc_sail","acc_noseRep"];
			let subMaintain = ["Hole Repairs","Pumping","Sail Repairs","Nose Repairs"];
			let maintain = [];

			let miscList = ["acc_head","acc_sup"];
			let subMiscList = ["Headshots","Supplies"];
			let misc = [];

			let unassigned = true;
			let faveWeap = {}; //"name" : "", "value": ""
			let kills = 0;
			let deaths = 0;
			let captainWins = 0;
			let captainLosses = 0;
			let crewHits = 0;
			let score = 0;
			let rating = 0;
			let statScoreGs = 0;
			let prestige = 0;

			for (i=0;i<stats.length;i++){

				// fav weapon
				if (weapons.indexOf(stats[i].name) !== -1){
					if (unassigned){
						faveWeap = stats[i];
						unassigned = false;
					}else{
						if (faveWeap.value < stats[i].value){
							faveWeap = stats[i];
						}
					}
					allWeaponStats.push(stats[i]);
				}
				
				if (ships.indexOf(stats[i].name) !== -1){
					shipStats.push(stats[i]);
				}else
				if (maintenance.indexOf(stats[i].name) !== -1){
					maintain.push(stats[i]);
				}else
				if (shipWeaponry.indexOf(stats[i].name) !== -1){
					shipWeaponryStats.push(stats[i]);
				}else
				if (miscList.indexOf(stats[i].name) !== -1){
					misc.push(stats[i]);
				}

				switch (stats[i].name){
					case "acc_kills":
						kills = stats[i].value;
						break;
					case "acc_deaths":
						deaths = stats[i].value;
						break;
					case "acc_capWins":
						captainWins = stats[i].value;
						break;
					case "acc_capLose":
						captainLosses = stats[i].value;
						break;
					case "stat_score":
						score = stats[i].value;
						break;
					case "stat_rating":
						rating = stats[i].value;
						break;
					case "stat_score_gs":
						statScoreGs = stats[i].value;
						break;
					case "stat_pres":
						prestige = stats[i].value;
						break;
					case "acc_capHit":
						crewHits = stats[i].value;
						break;
					default:
						break;
				}
			}

			let BwShipsEmbed;
			switch (args[0]){
				case "overview":
					let achieves = "";
					if (JSON.stringify(response).includes("achievements")){
						achieves = response.playerstats.achievements.length.toString();
					}else{
						achieves = "NA";
					}

					let level = levelProgress(score, prestige);

					let playerStatsCombined = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nLevel: (${prestige}) ${level}\nAchievements: ${achieves}/39`;
					if (statScoreGs != 0){
						playerStatsCombined = playerStatsCombined +`\nScore Gs: ${statScoreGs}`;
					}
					fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[1]}`).then(resp => resp.json()).then(response2 =>{
						response2 = response2.response.games;
						for (i=0;i<response2.length;i++){
							if (parseInt(response2[i].appid) === 420290){
								playerStatsCombined = playerStatsCombined + `\n${(response2[i].playtime_forever)/60}hrs`;
							}
						}	
						bwStatsEmbed.setTitle(`${args[1]}`)
							.addField(`General`,`${playerStatsCombined}`,true)
							.addField(`Captain Stats`,`${captainWins} wins\n${captainLosses} losses\nRatio: ${captainWins/captainLosses}\nCrew Hits: ${crewHits}`,true)
							.addField(`Fav Weapon`,`${substituteNames[weapons.indexOf(faveWeap.name)]}\n${faveWeap.value} kills`,true);
						sendBWStatsEmbed(message,bwStatsEmbed);
					});
					break;
				case "weaponstats":
					let WeaponStats = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills",true);
					bwStatsEmbed.setTitle(`${args[1]}`)
						.setDescription(WeaponStats);
					sendBWStatsEmbed(message,bwStatsEmbed);
					break;
				case "shipstats":
					let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins",true);
					let untrackedWins = parseInt(captainWins) - parseInt(ShipStats.split("Total: ")[1]);
					bwStatsEmbed.setTitle(`${args[1]}`)
						.addField("Ships",`${ShipStats}`,true)
						.addField("General",`Wins: ${captainWins}\n - Untracked: ${untrackedWins}\nLosses: ${captainLosses}\nWin Rate: ${captainWins/captainLosses}`,true);
					sendBWStatsEmbed(message,bwStatsEmbed);
					break;
				case "shipweaponry":
					let shipWeap = WeaponTextGenerator(WeaponSorter(shipWeaponryStats),shipWeaponrySubNames,shipWeaponry,"kills",true);
					bwStatsEmbed.setTitle(`${args[1]}`)
						.setDescription(`${shipWeap}`);
					sendBWStatsEmbed(message,bwStatsEmbed);
					break;
				case "maintenance":
					let maintainStats = WeaponTextGenerator(WeaponSorter(maintain),subMaintain,maintenance,"",false);
					bwStatsEmbed.setTitle(`${args[1]}`)
						.setDescription(maintainStats);
					sendBWStatsEmbed(message,bwStatsEmbed);
					break;
				case "misc":
					let miscStats = WeaponTextGenerator(WeaponSorter(misc),subMiscList,miscList,"",false);
					bwStatsEmbed.setTitle(`${args[1]}`)
						.addField("Misc",`${miscStats}`,true);
					sendBWStatsEmbed(message,bwStatsEmbed);
					break;
				case "compare":
					let playerStatsCombinedP1 = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nCap Wins: ${captainWins}\nCap Losses: ${captainLosses}\nRating: ${rating}`;
					if (statScoreGs != 0){
						playerStatsCombinedP1 = playerStatsCombinedP1 +`\nScore Gs: ${statScoreGs}`;
					}
					fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[1]}`).then(resp => resp.json()).then(response2 =>{
						response2 = response2.response.games;
						for (i=0;i<response2.length;i++){
							if (parseInt(response2[i].appid) === 420290){
								playerStatsCombinedP1 = playerStatsCombinedP1 + `\n${(response2[i].playtime_forever)/60}hrs`;
							}
						}
						fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=420290&steamid=${args[2]}`).then(resp=>resp.json()).then(response => {
							stats = response.playerstats.stats;
							for (i=0;i<stats.length;i++){

								switch (stats[i].name){
									case "acc_kills":
										kills = stats[i].value;
										break;
									case "acc_deaths":
										deaths = stats[i].value;
										break;
									case "acc_capWins":
										captainWins = stats[i].value;
										break;
									case "acc_capLose":
										captainLosses = stats[i].value;
										break;
									case "stat_score":
										score = stats[i].value;
										break;
									case "stat_score_gs":
										statScoreGs = stats[i].value;
										break;
									case "stat_rating":
										rating = stats[i].value;
										break;
									default:
										break;
								}

							}

							let playerStatsCombinedP2 = `${kills} kills\n${deaths} deaths\n KD of ${kills/deaths}\nScore: ${score}\nCap Wins: ${captainWins}\nCap Losses: ${captainLosses}\nRating: ${rating}`;
							if (statScoreGs != 0){
								playerStatsCombinedP2 = playerStatsCombinedP2 +`\nScore Gs: ${statScoreGs}`;
							}
							fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.apiKeys.steam}&steamid=${args[2]}`).then(resp => resp.json()).then(response2 =>{
								response2 = response2.response.games;
								for (i=0;i<response2.length;i++){
									if (parseInt(response2[i].appid) === 420290){
										playerStatsCombinedP2 = playerStatsCombinedP2+ `\n${(response2[i].playtime_forever)/60}hrs`;
									}
								}
								bwStatsEmbed.setTitle(`${args[1]} VS ${args[2]}`)
									.addField(`${args[1]}`,`${playerStatsCombinedP1}`,true)
									.addField(`${args[2]}`,`${playerStatsCombinedP2}`,true);
								sendBWStatsEmbed(message,bwStatsEmbed);
							});
						});
					});
					break;
				default:
					message.reply("Please enter a valid option! You can find valid options by using `;help blackwake`.");
					break;
			}
		}
	}).catch(err => {
		if (err) {
			console.error(err);
			message.channel.send("Please make sure you have entered a correct Steam ID and the profile is set to public! :slight_smile:");
		};
	});
}

function WeaponSorter(weaponsArray){
	for (i=0;i < weaponsArray.length;i++){
		for (s=0;s < weaponsArray.length;s++){
			if (weaponsArray[i].value > weaponsArray[s].value){
				let tempVar = weaponsArray[i];
				weaponsArray[i] = weaponsArray[s];
				weaponsArray[s] = tempVar;
			}
		}
	}
	return weaponsArray;
}

function WeaponTextGenerator(weaponsArray,substituteNames,weapons,type,enableTotal){
	let returnMsg = "";
	let count = 0;
	for (i=0; i < weaponsArray.length;i++){
		if (weapons.indexOf(weaponsArray[i].name) != -1)
		{
			returnMsg = returnMsg + `${substituteNames[weapons.indexOf(weaponsArray[i].name)]} - ${weaponsArray[i].value} ${type}\n`;
			count += weaponsArray[i].value;
		}
	}
	if (enableTotal){
		returnMsg += `Total: ${count}`;
	}
	return returnMsg;
}

function scoreAdjustPrestige(score, prestige){
	score -= prestige * 172873;
	if (prestige != 10)
	{
		score = Math.min(score, 172873);
	}
	return score;
}

function levelProgress(score, prestige){
	score = scoreAdjustPrestige(score, prestige);
	for (let i = 0; i < 2000; i++)
	{
		if (score <= i * i * 72)
		{
			return i;
		}
	}
}