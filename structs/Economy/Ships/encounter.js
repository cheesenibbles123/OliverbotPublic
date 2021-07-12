const shared = require('./../../shared.js');

class EncounterShip {
	constructor(data){
		this.spotter = data.spotter; // Boolean
		this.shipID = data.shipID; // Int
		this.ship = data.ship; // Object
	}
	generateRandom(difficultyLevel){
		economy.query(`SELECT * FROM Upgrades WHERE Rarity<=${difficultyLevel}`, (err,upgrades) => {
			let affectedStats = [];

			for (let i=0; i<upgrades.length; i++){
				if (shared.getRandomInt(5) === 1 && !affectedStats.includes(upgrades[i].AffectsStat)){
					affectedStats.push(upgrades[i].AffectsStat);
					this.ship.upgrades.push(upgrades[i]);
				}
			}

		});
	}
}