const db = require("./../_databaseSetup.js");
const glob = require("./../_globalFunctions.js");

module.exports = {
	name: "beg",
	args: 0,
	help: "Beg for coins",
	execute: async (message,args) => {

		let num = glob.getRandomInt(300);
		if (num == 243){
			let amount = glob.getRandomInt(20);
			db.giveUserMoney(parseFloat(amount).toFixed(2) * 1);
			message.channel.send(`Considering how desperate you are, I think I can spare you ${amount}GC, consider yourself lucky.`);
		}else{
			glob.loadDataFromFile("beg","",message);
		}
	}
}
