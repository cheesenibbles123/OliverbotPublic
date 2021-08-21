const glob = require("./_globalFunctions");
const combinedResponses = require("./_combinedResponses.js");

module.exports = {
	name: "coinflip",
	help: "Flips a coin.",
	executeGlobal: (event,args,isMessage) => {
		let coin = glob.getRandomInt(2);
		combinedResponses.new(event,"💰",isMessage).then((msg)=>{
			combinedResponses.edit(msg,"💰🤔",isMessage).then((msg)=>{
				combinedResponses.edit(msg,"💰",isMessage).then((msg)=>{
					combinedResponses.edit(msg,"😯",isMessage);	
				});
			});
		});
		if (coin === 0){
			combinedResponses.new("Tails!");
		}else{
			combinedResponses.new("Heads!");
		}
	}
}