const glob = require("./_globalFunctions");

module.exports = {
	name: "eightball",
	args: 0,
	help: "NA",
	execute: (message,args) => {
		let option = glob.getRandomInt(0,3);
		switch (option){
			case 0:
				message.channel.send("Yes");
				break;
			case 1:
				message.channel.send("No");
				break;
			case 2:
				message.channel.send("Im not sure 🤔");
				break;
			default:
				message.channel.send("Effort.");
				break;
		}
	}
}