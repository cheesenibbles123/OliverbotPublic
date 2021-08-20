const fetch = require("node-fetch");
const glob = require("./_globalFunctions");
const Discord = require("discord.js");

module.exports = {
	name: "urban",
	args: 1,
	help: "Searches for the word on urban dictionary",
	usage: "<word>",
	execute: (message,args) => {
		let api = `http://api.urbandictionary.com/v0/define?term=${args[0]}`;
		fetch(api).then(response => response.json()).then(resp => {
			let option;
			if (resp.list.length > 1){
				option = resp.list[glob.getRandomInt(resp.list.length)];
			}else{
				option = resp.list[0];
			}

			if (typeof(option) === undefined){
				let embed = new Discord.MessageEmbed()
					.setTitle("Urban Response")
					.setColor(0x008000)
					.addField(`Author:`,`${option.author}`)
					.addField(`Permalink:`,`${option.permalink}`,true)
					.addField(`Vote Ratio:`,`${option.thumbs_up} 👍\n${option.thumbs_down} 👎`,true)
					.addField(`Word:`,`${option.word}`,true)
					.addField(`Definition:`,`${option.definition}`)
					.addField(`Example:`,`${option.example}`)
					.setFooter(`Written: ${option.written_on}, Def_ID: ${option.defid}`)
					.setTimestamp();
				message.channel.send(embed);
			}else{
				message.channel.send("No result found.");
			}
		});
	}
}