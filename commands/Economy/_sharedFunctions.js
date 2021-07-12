const db = require("./../../startup/database.js");

exports.levelsystem = function levelsystem(xp,currentlevel){
	if (currentlevel === 0 && xp > 400){
		return true;
	}else{
		if ( xp >= ( currentlevel * db.xpdetails.levelupfactor )){
			return true;
		}else{
			return false;
		}
	}
}

exports.genXp = function genXp(){
	return Math.floor(Math.random()*(db.xpdetails.max+db.xpdetails.min+1))+db.xpdetails.max;
}