const fs = require('fs');

module.exports = {
	init: (bot) => {
		bot['commands'] = {};
		let folder = "/commands";
		fs.readdirSync(__dirname + folder).forEach((file) => {

			if (file.startsWith("_") || !file.endsWith(".js") || file === "mainCommandHandler.js") return;

			let command = require(__dirname + folder + "/" + file);

			if (!bot.commands[command.name.toLowerCase()]){
				bot.commands[command.name.toLowerCase()] = command;
			}else{
				console.log("Error loading command: " + routeEndpoint.name);
				console.log("From file: " + folder + "/" + file);
			}
		});
	},
	handler: (message,command,args) => {
		command = command.toLowerCase();
		if (bot.commands[command]){

			let isValid = true;

			// Check arguments
			if (bot.commands[command].args){
				if (typeof(bot.commands[command].args) === typeof([])){
					// if arguments are a range between [min,max]
					if (bot.commands[command].args[0] > args || bot.commands[command].args[1] < args){
						message.channel.send("Please check your argument length");
						return;
					}
				// if arguments are a fixed length
				}else if (bot.commands[command].args.length < args.length || bot.commands[command].args.length > args.length){
					message.channel.send("Please check your argument length");
					return;
				}
			}

			// Check permissions
			if (bot.commands[command].roles){
				let roles = bot.commands[command].roles;
				let missingRole = true;

				// Loop over all allowed roles
				for (let i=0; i<roles.length; i++){
					if (message.member.roles.has(roles[i])){
						missingRole = false;
					}
				}

				if (missingRole){
					message.channel.send("You do not have permission to use this command!");
					return;
				}
			}


			bot.commands[command].execute(message,args);
			db.updateTracking(command);

		}else{
			message.react("🤔");
		}
	},
}