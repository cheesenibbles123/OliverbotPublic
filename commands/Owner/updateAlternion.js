const alt = require("./../Alternion/_sharedFunctions.js");

module.exports = {
	name: "updatealternion",
	help: "Force Runs Alternion update for all users",
	users: ["337541914687569920"],
	category: "Owner",
	execute: (message,args) => {
		alt.globalJsonUpdate();
	}
}