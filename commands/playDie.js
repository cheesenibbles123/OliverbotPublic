const glob = require("./_globalFunctions");

let bot;

module.exports = {
	name: "playdie",
	help: "Rolls a normal die against the bot",
	interactionSupport: true,
	init: (botInstance) => {
		bot = botInstance;
	},
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
	},
	executeInteraction: (interaction,args) => {
		let user = glob.getRandomInt(7);
		let botroll = glob.getRandomInt(7);
		bot.channels.cache.get(interaction.channedId).send("🎲").then((msg)=>{
			msg.edit("..🎲").then((msg)=>{
				msg.edit("You: "+user+", Bot: "+botroll+" ....🎲");
				if (user>botroll){
					interaction.editReply("You Win!");
				}else
				if (user<botroll){
					interaction.editReply("You Lose!");
				}else{
					interaction.editReply("Draw!");
				}
			});
		});
	}
}