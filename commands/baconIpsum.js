const fetch = require("node-fetch");
const Discord = require("discord.js");
const glob = require("./_globalFunctions");

module.exports = {
	name: "bacon",
	args: 0,
	help: "Grabs a random extract from bacon ipsum",
	execute: (message,args) => {
		let opt = glob.getRandomInt(2);
		let content = "";
		if (opt === 0){
			content += "https://baconipsum.com/api/?type=meat-and-filler";
		}else
		if (opt === 1){
			content += "https://baconipsum.com/api/?type=meat-and-filler&start-with-lorem=1";
		}
		fetch(content).then(res => res.json()).then(response => {
			let BaconEmbed = new Discord.MessageEmbed()
				.setDescription(`${response[glob.getRandomInt(response.length)]}`)
				.setTimestamp();
			message.channel.send(BaconEmbed);
		});
	}
}