const fetch = require('node-fetch');

let weapons = ["acc_mus","acc_blun","acc_nock","acc_ann","acc_rev","acc_pis","acc_duck","acc_mpis","acc_cut","acc_dag","acc_bot","acc_tomo","acc_gren","acc_rap"];
let substituteNames = ["Musket","Blunderbuss","Nockgun","Annley","Revolver","Pistol","Duckfoot","Short Pistol","Cutlass","Dagger","Bottle","Tomohawk","Grenade","Rapier"];

let shipWeaponry = ["acc_can","acc_swiv","acc_grape","acc_arson","acc_ram"];
let shipWeaponrySubNames = ["Cannonball","Swivel","Grapeshot","Fireshot","Ramming"];

let ships = ["acc_winHoy","acc_winJunk","acc_winSchoon","acc_cutt","acc_bombk","acc_carr","acc_gunb","acc_winGal","acc_brig","acc_xeb","acc_cru","acc_bombv"];
let subShipNames = ["Hoy","Junk","Schooner","Cutter","Bomb Ketch","Carrack","Gunboat","Galleon","Brig","Xebec","Cruiser","Bomb Vessel"];

let maintenance = ["acc_rep","acc_pump","acc_sail","acc_noseRep"];
let subMaintain = ["Hole Repairs","Pumping","Sail Repairs","Nose Repairs"];

let miscList = ["acc_head","acc_sup"];
let subMiscList = ["Headshots","Supplies"];

let steamKey;

exports.init = function(obj){
	if (validateString([obj])){
		steamKey = obj;
	}else{
		throw new Error('Incorrect steamAPIKey type given. Should be a string.');
	}
}

function validateString(tests){
	for (i=0;i<tests.length;i++){
		if (typeof(tests[i]) !== "string"){
			return false;
		}
	}
	return true;
}

exports.handler = async function(type, steamID) {
	if (validateString([type,steamID])){
		let public = await checkIfPrivate(steamID);
		if (public){
			let data = await queryFor(type.toLowerCase(),steamID);
			if (data === null){
				data = {isValid : false, type : type, content : "Null Response"};
			}
			return data;
		}else{
			return {isValid : false, type : type, content : "User profile set to private"};;
		}
	}else{
		return {isValid : false, type : type, content : "Incorrect input type. Should be a string."};
	}
}

async function checkIfPrivate(steamID){
	return new Promise ((resolve,reject) => {
		fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamID}`).then(resp => resp.json()).then(response => {
			if (response.response.players.communityvisibilitystate === 1){
				resolve(false);
			}else{
				resolve(true);
			}
		});
	});
}

async function getType(type,stats){
	let responseData = {
		isValid : true,
		type : type,
		content : null
	};
	switch (type){
		case "overview":
			responseData.content = await overview(stats);
			break;
		case "shipstats":
			responseData.content = await shipstats(stats);
			break;
		case "shipweaponry":
			responseData.content = await shipweaponry(stats);
			break;
		case "weaponstats":
			responseData.content = await weaponstats(stats);
			break;
		case "maintenance":
			responseData.content = await maintenanceFunc(stats);
			break;
		case "misc":
			responseData.content = await misc(stats);
			break;
		default:
			responseData.isValid = false;
			responseData.content = "Invalid option";
			break;
	}
	return responseData;
}

async function queryFor(type, steamID){
	let promise = new Promise((resolve,reject) => {
		fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${steamKey}&appid=420290&steamid=${steamID}`).then(resp => resp.text()).then(response => {
			if (response.includes("500 Internal Server Error")){
				reject("Steam API error, code 500");
			}else if (response.includes("Unknown problem determining WebApi request destination.")) {
				reject("Please ensure you have entered the correct terms! Terms can be found using `;help` `blackwake`.\nThe format is as followed:\n`;blackwake` `term` `steamID64`");
			}else if(response[0] == '<') {
				reject("Error - Unknown issue");
			}else{
				let data = JSON.parse(response);
				let stats = data.playerstats.stats;
				let responseData = getType(type,stats);

				resolve(responseData);
			}
		});
	});

	let result = await promise;
	return result;
}

async function overview(data){
	return new Promise((resolve,reject) => {
		let unassigned = true;

		let returnData = {
			playerStats : {
				faveWeapon : {},
				kills : 0,
				deaths : 0,
				score : 0,
				prestige : 0,
				level : 0,
				formatted : null
			},
			captainStats : {
				captainWins : 0,
				captainLosses : 0,
				crewHits : 0,
				formatted: null
			}
		}

		for (i=0;i<data.length;i++){

			if (weapons.indexOf(data[i].name) !== -1){
				if (unassigned){
					returnData.playerStats.faveWeapon = data[i];
					unassigned = false;
				}else{
					if (returnData.playerStats.faveWeapon.value < data[i].value){
						returnData.playerStats.faveWeapon = data[i];
					}
				}
			}

			switch(data[i].name){
				case "acc_kills":
					returnData.playerStats.kills = data[i].value;
					break;
				case "acc_deaths":
					returnData.playerStats.deaths = data[i].value;
					break;
				case "stat_score":
					returnData.playerStats.score = data[i].value;
					break;
				case "stat_pres":
					returnData.playerStats.prestige = data[i].value;
					break;
				case "acc_capWins":
					returnData.captainStats.captainWins = data[i].value;
					break;
				case "acc_capLose":
					returnData.captainStats.captainLosses = data[i].value;
					break;
				case "acc_capHit":
					returnData.captainStats.crewHits = data[i].value;
					break;
				default:
					break;
			}
		}

		returnData.playerStats.level = levelProgress(returnData.playerStats.score, returnData.playerStats.prestige);
		console.log(returnData.playerStats.faveWeapon);
		returnData.playerStats.faveWeapon = { 
			ID : returnData.playerStats.faveWeapon.name,
			Amount : returnData.playerStats.faveWeapon.value,
			formatted : WeaponTextGenerator([returnData.playerStats.faveWeapon], substituteNames, weapons,"",false)
		}

		returnData.playerStats.formatted = `${returnData.playerStats.kills} kills\n${returnData.playerStats.deaths} deaths\nKD of ${returnData.playerStats.kills/returnData.playerStats.deaths}\nScore: ${returnData.playerStats.score}\nLevel: (${returnData.playerStats.prestige}) ${returnData.playerStats.level}`;
		returnData.captainStats.formatted = `${returnData.captainStats.captainWins} wins\n${returnData.captainStats.captainLosses} losses\nRatio: ${returnData.captainStats.captainWins/returnData.captainStats.captainLosses}\nCrew Hits: ${returnData.captainStats.crewHits}`;
		resolve(returnData);
	});
}

async function shipstats(data){
	return new Promise((resolve,reject) => {
		let shipStats = [];
		let returnData = {
			ships : {
				formatted : null
			},
			general : {
				captainWins : 0,
				untrackedWins : 0,
				captainLosses : 0,
				ratio : 0,
				formatted : null
			}
		}

		for (i=0;i<data.length;i++){
			if (ships.indexOf(data[i].name) !== -1){
				shipStats.push(data[i]);
				returnData.ships[data[i].name] = data[i].value;
			}else if (data[i].name === "acc_capWins"){
				returnData.general.captainWins = data[i].value;
			}else if (data[i].name === "acc_capLose"){
				returnData.general.captainLosses = data[i].value;
			}
		}

		let ShipStats = WeaponTextGenerator(WeaponSorter(shipStats),subShipNames,ships,"wins",true);
		returnData.general.untrackedWins = parseInt(returnData.general.captainWins) - parseInt(ShipStats.split("Total: ")[1]);

		returnData.general.ratio = returnData.general.captainWins/returnData.general.captainLosses;
		returnData.general.formatted = `Wins: ${returnData.general.captainWins}\n - Untracked: ${returnData.general.untrackedWins}\nLosses: ${returnData.general.captainLosses}\nWin Rate: ${returnData.general.ratio}`;
		returnData.ships.formatted = `${ShipStats}`;

		resolve(returnData);
	});
}

function shipweaponry(data){
	return new Promise((resolve,reject) => {
		let allShipWeaponry = [];
		let returnData = {
			individual : {},
			formatted : null
		}

		for (i=0;i<data.length;i++){
			if (shipWeaponry.indexOf(data[i].name) !== -1){
				returnData.individual[data[i].name] = data[i].value;
				allShipWeaponry.push(data[i]);
			}
		}

		returnData.formatted = WeaponTextGenerator(WeaponSorter(allShipWeaponry),shipWeaponrySubNames,shipWeaponry,"kills",true);
		resolve(returnData);
	});
}

function weaponstats(data){
	return new Promise((resolve,reject) => {
		let allWeaponStats = [];
		let returnData = {
			individual : {},
			formatted : null
		}

		for (i=0;i<data.length;i++){
			if (weapons.indexOf(data[i].name) !== -1){
				allWeaponStats.push(data[i]);
				returnData.individual[data[i].name] = data[i].value;
			}
		}

		returnData.formatted = WeaponTextGenerator(WeaponSorter(allWeaponStats),substituteNames,weapons,"kills",true);
		resolve(returnData);
	});
}

function maintenanceFunc(data){
	return new Promise((resolve,reject) => {
		let allStats = [];
		let returnData = {
			individual : {},
			formatted : null
		}

		for (i=0;i<data.length;i++){
			if (maintenance.indexOf(data[i].name) !== -1){
				allStats.push(data[i]);
				returnData.individual[data[i].name] = data[i].value;
			}
		}

		returnData.formatted = WeaponTextGenerator(WeaponSorter(allStats),subMaintain,maintenance,"kills",false);
		resolve(returnData);
	});
}

function misc(data){
	return new Promise((resolve,reject) => {
		let allMiscStats = [];
		let returnData = {
			individual : {},
			formatted : null
		}

		for (i=0;i<data.length;i++){
			if (miscList.indexOf(data[i].name) !== -1){
				allMiscStats.push(data[i]);
				returnData.individual[data[i].name] = data[i].value;
			}
		}

		returnData.formatted = WeaponTextGenerator(WeaponSorter(allMiscStats),subMiscList,miscList,"kills",false);
		resolve(returnData);
	});
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

function scoreAdjustPrestige(score, prestige){
	score -= prestige * 172873;
	if (prestige != 10)
	{
		score = Math.min(score, 172873);
	}
	return score;
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