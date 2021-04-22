const glob = require("./_globalFunctions");

module.exports = {
	name: "coinflip",
	args: 0,
	help: "Flips a coin.",
	execute: (message,args) => {
		let coin = glob.getRandomInt(2);
		message.channel.send("💰").then((msg)=>{
			msg.edit("💰🤔").then((msg)=>{
				msg.edit("💰").then((msg)=>{
					msg.edit("😯");	
				});
			});
		});
		if (coin === 0){
			message.channel.send("Tails!");
		}else{
			message.channel.send("Heads!");
		}
	}
}