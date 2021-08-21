const glob = require("./_globalFunctions");

module.exports = {
	name: "coinflip",
	args: 0,
	help: "Flips a coin.",
	interactionSupport: true,
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
	},
	executeInteraction: (interaction,args) => {
		let coin = glob.getRandomInt(2);
		interaction.editReply("💰").then((msg)=>{
			interaction.editReply("💰🤔").then((msg)=>{
				interaction.editReply("💰").then((msg)=>{
					interaction.editReply("😯");	
					if (coin === 0){
						interaction.followUp("Tails!");
					}else{
						interaction.followUp("Heads!");
					}
				});
			});
		});
	}
}