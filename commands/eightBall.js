const glob = require("./_globalFunctions");

module.exports = {
	name: "eightball",
	help: "NA",
	interactionSupport: true,
	execute: (message,args) => {
		mainHandler(message,true);
	},
	executeInteraction: (interaction,args) => {
		mainHandler(interaction,false);
	}
}

function mainHandler(event,isMessage){
	let option = glob.getRandomInt(0,3);
	switch (option){
		case 0:
			glob.reply(event,"Yes",isMessage);
			break;
		case 1:
			glob.reply(event,"No",isMessage);
			break;
		case 2:
			glob.reply(event,"Im not sure 🤔",isMessage);
			break;
		default:
			glob.reply(event,"Effort.",isMessage);
			break;
	}
}