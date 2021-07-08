const alt = require("./../Alternion/_sharedFunctions.js");

module.exports = {
	name: "updatealternion",
	help: "Force Runs Alternion update for all users",
	args: 0,
	users: ["337541914687569920"],
	category: "Owner",
	execute: (message,args) => {
		alt.globalJsonUpdate();
	}
}