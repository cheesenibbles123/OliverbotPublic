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
		// Load event
		let event = require(__dirname + folder + "/" + file);

		// Check if event name already exists
		if (!bot.events[event.name.toLowerCase()]){

			// Execute init function on event if it exists
			if (typeof(event.init) === 'function'){
				event.init(bot);
			}

			// Store event
			bot.events[event.name.toLowerCase()] = event;
		}else{
			console.log("Error loading event: " + event.name);
			console.log("From file: " + folder + "/" + file);
		}
	});
}

module.exports = {
	init: (botInstance) => {
		botInstance['events'] = {}; // Initialize an empty object to store the events
		bot = botInstance; // Save bot reference

		let folder = "/events";  // Specifies which folder the events are in

		loopOverFolders(folder); // Load all events in folder
	},
	handler: (event) => {

		// If the event response exists then execute
		if (bot && bot.events[event.t]){
			bot.events[event.t].execute(event);
		}
	}
}