const glob = require("./_globalFunctions");

module.exports = {
	name: "rollcustom",
	args: 2,
	help: "Rolls a custom die",
	usage: "<min> <max>",
	interactionSupport: true,
	options: [
		{
			name: "min",
			description: "Minimum value",
			type: 4,
			required: true
		},{
			name: "max",
			description: "Maximum value",
			type: 4,
			required: true
		}
	],
	execute: (message,args) => {
		mainHandler(message,args,true);
	},
	executeInteraction: (interaction,args) => {
		mainHandler(interaction,args,false);
	}
}

function mainHandler(event,args,isMessage){
	let min = parseInt(args[0]);
	let max = parseInt(args[1]);
	if (parseInt(args[0]) < 1){
		glob.reply(event,"Please use a starting number greater than 0.",isMessage);
	}else
	if (min >= max){
		glob.reply(event,"Please use a maximum value greater than the minimum.",isMessage);
	}else
	if (isNaN(min)){
		glob.reply(event,"Please enter a number.",isMessage);
	}else
	if (parseInt(args[1]) > 1){
		glob.reply(event,glob.getRandomBetweenInt(min,max),isMessage);
	}else{
		glob.reply(event,glob.getRandomInt(parseInt(args[0])+1),isMessage);
	}
}