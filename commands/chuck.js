const fetch = require("node-fetch");
const Discord = require("discord.js");
const {reply} = require("./_globalFunctions.js");

module.exports = {
	name: "chuck",
	args: 0,
	help: "Gets a random certified chuck norris statement.",
	category: "Meme",
	interactionSupport: true,
	execute: (message,args) => {
		mainHandler(message,args,true);
	},
	executeInteraction: (interaction,args) => {
		mainHandler(message,args,false);
	}
}

function mainHandler(event,args,isMessage){
	fetch("https://api.chucknorris.io/jokes/random").then(res => res.json()).then(response => {
		let ChuckNorrisEmbed = new Discord.MessageEmbed()
			.setDescription(`${response.value}`)
			.setThumbnail("https://s3.amazonaws.com/mf-cnorris/assets/uploads/2016/10/19123509/timeline-05.jpg")
			.setTimestamp();
		reply(event,ChuckNorrisEmbed,isMessage);
	});
}