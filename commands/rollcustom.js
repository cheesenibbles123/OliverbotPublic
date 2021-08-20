const glob = require("./_globalFunctions");

module.exports = {
	name: "rollcustom",
	args: 2,
	help: "Rolls a custom die",
	usage: "<min> <max>",
	execute: (message,args) => {
		let min = parseInt(args[0]);
		let max = parseInt(args[1]);
		if (parseInt(args[0]) < 1){
			message.channel.send("Please use a starting number greater than 0.");
		}else
		if (min >= max){
			message.channel.send("Please use a maximum value greater than the minimum.");
		}else
		if (isNaN(min)){
			message.channel.send("Please enter a number.");
		}else
		if (parseInt(args[1]) > 1){
			message.channel.send(glob.getRandomBetweenInt(min,max));
		}else{
			message.channel.send(glob.getRandomInt(parseInt(args[0])+1));
		}
	}
}