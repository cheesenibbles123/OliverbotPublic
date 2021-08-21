const Discord = require("discord.js");
let bot;
const config = require("./../config.json");
const fetch = require("node-fetch");
let adjustableConfig;
const db = require("./../startup/database.js");
const bw = require('@cheesenibbles123/blackwakehandler');
const { reply } = require('./_globalFunctions.js');

module.exports = {
	name: "blackwake",
	args: [1,2],
	help: "Fetches blackwake data from your steam account.",
	usage: "<type> (SteamID64)",
	category: "Api",
	interactionSupport: true,
	options: [
		{
			name : "type",
			description : "type of data to display",
			type : 3,
			required : true,
			choices : [
				{
					name : "Monthly",
					value : "monthly"
				},
				{
					name : "Overview",
					value : "overview"
				},
				{
					name : "Weapon Stats",
					value : "weaponstats"
				},
				{
					name : "Ship Stats",
					value : "shipstats"
				},
				{
					name : "Ship Weaponry",
					value : "shipweaponry"
				},
				{
					name : "Maintenance",
					value : "maintenance"
				},
				{
					name : "Miscellaneous",
					value : "misc"
				}
			]
		},{
			name : "steamid64",
			description : "your steamid64",
			type : 3,
			required : false
		}
	],
	init: (botInstance) =>{
		bot = botInstance;
		adjustableConfig = db.adjustableConfig;
		bw.init(config.apiKeys.steam);
	},
	execute: (message,args) => {
		mainHandler(message,args,false);
	},
	executeInteraction: (interaction,args) => {
		mainHandler(message,args,true);
	}
}

async function mainHandler(event,args,isMessage){
	let steamID;
	if (args.length === 1){
		steamID = await checkifInDatabaseBWHandler(event,isMessage);
	}else if (!isNaN(parseInt(args[1]))){
		steamID = args[1];
	}

	if (args[0] === "monthly"){
		fetchEloStuff(events, steamID, args[0], isMessage);
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

				reply(event,{embeds : [embed]}, isMessage);

			}else{
				reply(event, "Invalid type and/or SteamID provided.", isMessage);
			}	
		}).catch(err => {
			reply(event, "Please ensure you entered a valid **SteamID64** and your profile is set to **Public**.", isMessage);
		});
	}
}

async function fetchEloStuff(event,steamID,type,isMessage){

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
				break;
		}

		reply(event,{embeds : [eloStatsEmbed]}, isMessage);
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

function checkifInDatabaseBWHandler(event,isMessage){
	return new Promise((resolve, reject) => {
		db.alternionConnectionPool.query(`SELECT Steam_ID FROM User WHERE Discord_ID="${message.author.id}"`, (err,rows) => {
			if (rows.length > 1){
				reply(event,"You appear to have two accounts linked to this discord account, please contact Archie.",isMessage);
				resolve(0);
			}else if (rows.length == 0){
				reply(event,"Your discord account is not linked to your steamID, please provide your steamID or contact Archie.",isMessage);
				resolve(0);
			}else{
				resolve(rows[0].Steam_ID);
			}
		});
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