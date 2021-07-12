class ship {
	constructor(data){
		this.hold = data.Hold; // List
		this.name = data.Name; // String
		this.#stats = data.stats; // Object
		this.itemID = data.ItemID; // Int
		this.typeID = data.TypeID; // Int
		this.status = data.status; // Object
		this.upgrades = data.upgrades; // List
		this.maxCarryWeight = data.maxDisplacement; // Int
	}
	
	get getStats(){
		let updatedStats = this.#stats;
		for (let i=0; i<this.upgrades.length; i++){
			if (updatedStats[this.upgrades[i].AffectsStat]){
				updatedStats[this.upgrades[i].AffectsStat] += this.#stats[this.upgrades[i].AffectsStat].Factor;
			}
		}
		return updatedStats;
	}

	get getDisplacement(){
		let currentDisplacement = 0;
		for (let i=0; i<this.hold.length; i++){
			currentDisplacement += this.hold[i].Weight;
		}
		return currentDisplacement;
	}
}

exports.ship = ship;