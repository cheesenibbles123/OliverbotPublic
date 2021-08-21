const db = require("./../../startup/database.js");
const glob = require("./../_globalFunctions.js");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "beg",
	help: "Beg for coins",
	category: "Economy",
	executeGlobal: (event,args,isMessage) => {

		let num = glob.getRandomInt(300);
		if (num == 243){
			let amount = glob.getRandomInt(20);
			db.giveUserMoney(parseFloat(amount).toFixed(2) * 1,event.member.user.id);
			reply(event,`Considering how desperate you are, I think I can spare you ${amount}GC, consider yourself lucky.`,isMessage);
		}else{
			glob.loadDataFromFile(event,isMessage,"beg",null);
		}
	}
}
