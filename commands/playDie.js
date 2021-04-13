const glob = require("./_globalFunctions");

module.exports = {
	name: "playdie",
	args: 0,
	help: "Rolls a normal die against the bot",
	execute: (message,args) => {
		let user = glob.getRandomInt(7);
		let botroll = glob.getRandomInt(7);
		message.channel.send("🎲").then((msg)=>{
			msg.edit("..🎲").then((msg)=>{
				msg.edit("You: "+user+", Bot: "+botroll+" ....🎲");
				if (user>botroll){
					message.channel.send("You Win!");
				}else
				if (user<botroll){
					message.channel.send("You Lose!");
				}else{
					message.channel.send("Draw!");
				}
			});
		});
	}
}