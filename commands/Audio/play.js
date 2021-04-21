const glob = require("./_sharedFunctions.js");

module.exports = {
	name: "play",
	args: 1,
	help: "Plays a song or adds it to the queue",
	category: "Audio",
	execute: (message,args) => {
		glob.setupTune(message,args,false);
	}
}