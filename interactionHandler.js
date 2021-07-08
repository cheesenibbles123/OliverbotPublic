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
		// Load interaction
		let interaction = require(__dirname + folder + "/" + file);

		if (!interaction.enabled || interaction.enabled === 1){

			// Execute init function on event if it exists
			if (typeof(interaction.init) === 'function'){
				interaction.init(bot);
			}
			
			// Store interaction
			bot.interactions.push(interaction);
		}
	});
}

module.exports = {
	init: (botInstance) => {
		botInstance['interactions'] = []; // Initialize empty list
		bot = botInstance; // Save bot reference

		let folder = "/interactions"; // Specifies which folder the interactions are in

		loopOverFolders(folder); // Load all interactions in folder
	},
	handler: (message) => {
		
		// Loop over interactions and execute them
		for (let i = 0; i < bot.interactions.length; i++){
			bot.interactions[i].execute(message);
		}
	}
}