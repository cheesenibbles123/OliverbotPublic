const alt = require("./../Alternion/_sharedFunctions.js");
const { ARCHIE } = require("./../../structs/users.js");

module.exports = {
	name: "updatealternion",
	help: "Force Runs Alternion update for all users",
	args: 0,
	users: [ ARCHIE ],
	category: "Owner",
	execute: (message,args) => {
		alt.globalJsonUpdate();
	}
}