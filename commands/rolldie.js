const glob = require("./_globalFunctions");
const {reply} = require("./_combinedResponses")
module.exports = {
	name: "rolldie",
	help: "Rolls a die",
	executeGlobal: (event,args,isMessage) => {
		reply(event,glob.getRandomInt(7),isMessage);
	}
}