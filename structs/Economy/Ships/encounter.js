const shared = require('./../../shared.js');
const ship = require('./ship.js');

class EncounterShip {
	constructor(data){
		this.spotter = data.spotter; // Boolean
		this.shipID = data.shipID; // Int
		if (data.ship){
			this.ship = data.ship; // Object
		}else{
			this.ship = null;
		}
	}
	async generateRandom(difficultyLevel){
		return new Promise((resolve,reject) => {
			const genShip = new Promise((resolve,reject) => {
				economy.query(`SELECT * FROM DefaultLayouts where ID=${this.shipID}`, (err,rows) => {
					this.ship = new ship({
						rows[0].shipInfo
					});
					resolve();
				});
			});

			const getUpgrades = new Promise((resolve,reject) => {
				economy.query(`SELECT * FROM Upgrades WHERE Rarity<=${difficultyLevel}`, (err,upgrades) => {
					let affectedStats = [];
					for (let i=0; i<upgrades.length; i++){
						if (shared.getRandomInt(5) === 1 && !affectedStats.includes(upgrades[i].AffectsStat)){
							affectedStats.push(upgrades[i].AffectsStat);
							this.ship.upgrades.push(upgrades[i]);
						}
					}
					resolve();
				});
			});

			if (this.ship === null){
				await genShip();
			}

			await getUpgrades();
			
			resolve();
		});
	}
}

exports.EncounterShip = EncounterShip;