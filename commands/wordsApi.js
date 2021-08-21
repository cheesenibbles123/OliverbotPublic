const fetch = require("node-fetch");
const Discord = require("discord.js");
const {reply} = require("./_globalFunctions.js");

module.exports = {
	name: "words",
	args: 1,
	help: "Looks up the meaning behind a given word",
	usage: "<word>",
	options: [
		{
			name : "word",
			description : "Word to search for",
			type : 3,
			required : true
		}
	],
	executeGlobal: (event,args,isMessage) => {
		if (args.length > 1){
			reply(event,"The API only works with one word at a time :(",isMessage);
		}else
		if (args.length === 0){
			reply(event,"Please enter a word to look up.",isMessage);
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
				reply(event,{embeds: [wordsAPIEmbed]},isMessage);
			});
		}
	}
}