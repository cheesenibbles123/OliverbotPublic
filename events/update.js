const config = require("./../config.json");
const events = require("./../structs/events.js");

let bot;

module.exports = {
	name : events.UPDATE, // This is the event name (event.t) and is what will be used in the eventHandler
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (event) => { // Main event code that will be executed on call

		console.log("Update fired at " + Date.now());

	}
}

function checkForEncounters(){
	dbSetup.quert(`SELECT * FROM Player WHERE Location=999`, (err,players) => {
		for (let i=0; i<players.length; i++){
			let num = glob.getRandomInt(100);
			if (num === 50){
				spawnEncounter(players[i].ID);
			}
		}
	});
}

function getRandomEncounter(){
	let num = glob.getRandomInt(5);
	switch (num){
		case 0:
			return {};
		case 1:
			return {};
		default:
			return null;
	}
}

function spawnEncounter(UserID){
	let member = bot.guilds.cache.get(config.serverInfo.serverID).members.cache.get(UserID);
	let encounter = getRandomEncounter();
	if (encounter !== null){
		let msg = "";

		if (encounter.Spotter){
			msg += "You have spotted a ship!\n";
		}else{
			msg += "A ship has approached us!\n";
		}

		dbSetup.query(`SELECT * FROM DefaultLayout WHERE ID=${encounter.ShipID}`, (err,shipData) => {

		});

		member.user.send(`An encounter has occured!\nYour ship has spotted a `);
	}
}