const fs = require('fs');

let bot;

function loopOverFolders(folder){
	fs.readdirSync(__dirname + folder).forEach((file) => {

		// Check if file is a folder/directory
		if (fs.statSync(__dirname + folder + "/" + file).isDirectory()){
			// Loop through folder
			loopOverFolders(folder + "/" + file);
		}

		// Only load if it is a js file, and does not start with an underscore
		if (file.startsWith("_") || !file.endsWith(".js")) return;

		// Load startup stuff
		let startupStuff = require(__dirname + folder + "/" + file);

		if (startupStuff.enabled){
			startupStuff.init(bot);
		}
	});
}

module.exports = {
	init: (botInstance) => {
		bot = botInstance; // Save bot reference

		let folder = "/startup"; // Specifies which folder the interactions are in

		loopOverFolders(folder); // Load all interactions in folder
	}
}