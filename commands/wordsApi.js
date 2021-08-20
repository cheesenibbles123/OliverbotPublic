const fetch = require("node-fetch");
const Discord = require("discord.js");

module.exports = {
	name: "words",
	args: [0,100],
	help: "Looks up the meaning behind a given word",
	usage: "<word>",
	execute: async (message,args) => {
		if (args.length > 1){
			message.channel.send("The API only works with one word at a time :(");
		}else
		if (args.length === 0){
			message.channel.send("Please enter a word to look up.");
		}else{
			fetch(`https://wordsapiv1.p.mashape.com/words/${args[0]}/definitions`).then(resp => resp.json()).then(response => {
				let definitions = "";
				for(let i = 0; i < response.definitions.length-1; i++) {
				    definitions = definitions +`${response.definitions[i].definition} - ${response.definitions[i].partOfSpeech}\n"`;
				}
				let wordsAPIEmbed = new Discord.MessageEmbed()
					.addTitle(`${args[0]}`)
					.setDescription(`${definitions}`)
					.setThumbnail("https://www.programmableweb.com/sites/default/files/styles/facebook_scale_width_200/public/WordsAPI%20Logo2.png?itok=vfPp_WC1")
					.setTimestamp();
				message.channel.send(wordsAPIEmbed);
			});
		}
	}
}