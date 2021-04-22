const fetch = require("node-fetch");
const Discord = require("discord.js");
const config = require("./../config.json");

module.exports ={
	name: "apod",
	args: 0,
	help: "Displays today astronomy picture of the day!",
	execute: (message,args) => {
		fetch(`https://api.nasa.gov/planetary/apod?api_key=${config.apiKeys.nasa}`).then(res => res.json()).then(response => {
			let explanation = response.explanation;
			if (explanation.length > 1024){
				explanation = explanation.slice(0,1021);
				explanation = explanation + "...";
			}
			let aspdembed = new Discord.MessageEmbed()
						.setTitle("Astronomy Picture of the Day")
						.addField(`${response.title}`,`${explanation}`);
			let linkURL = response.url.toString();
			if (linkURL.substr(response.url.length -3) === "jpg" || linkURL.substr(response.url.length -3) === "png" || linkURL.substr(response.url.length -3) === "jpeg"){
				aspdembed.setImage(`${response.url}`);
			}else{
				aspdembed.addField("URL:",`${response.url}`)
			}
			aspdembed.setFooter(`Date: ${response.date}`)	
					.setTimestamp();
			message.channel.send(aspdembed);
		});
	}
}