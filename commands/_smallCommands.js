const fetch = require("node-fetch");
const config = require("./../config.json");
const Discord = require("discord.js");
const issueEmbed = require("./issueEmbed");
var adjustableConfig;
const db = require("./databaseSetup");
const glob = require("./globalFunctions");

exports.init = function init(){
	adjustableConfig = require("./databaseSetup.js").adjustableConfig;
}

function wordsAPI(message,args){
	if (!adjustableConfig.apis.dictionary){
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}else
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

function memegen(message,args){
	if (db.levelchecker(message,4)){
		TrackingCommand = true;
		if (adjustableConfig.apis.memegen){
			let contents = message.content.split(",");
	    	for (i=0;i<contents.length;){
	        	let word = contents[i];
	        	if (i === 0){
	        	    word = word.slice(command.length+2);
	        	}
	        	word = word.replace(/_/g, "__");
	        	word = word.replace(/-/g, "--");
	   	    	word = word.replace(/ /g, "-");
	   	    	word = word.replace(/\?/g, "~q");
	   	     	word = word.replace(/%/g, "~p");
	   	     	word = word.replace(/#/g, "~h");
	   	     	word = word.replace(/''/g, `"`);
	    	    word = word.replace(/\//g, "~s");
	    	    contents[i] = word;
	    	    i++;
	    	}
			let URL = `https://memegen.link/${contents[0]}/${contents[1]}/${contents[2]}.jpg`;
			fetch(URL).then(response =>{
			    message.channel.send(response.url);
			});
		}
	}else{
		issueEmbed.grabEmbed(2,4);
	}
}

function insultUser(message,args){
	if (levelchecker(message,7)){
		let fine = true;
		for (i=0; i<args.length;){
			let mentionrole = message.guild.roles.cache.get(args[i]);
			if (!(typeof mentionrole === "undefined")){
				fine = false;
			}
			i++;
		}
		if (message.content.includes("@everyone") || message.content.includes("@here")){
			message.channel.send("No.");
			fine = false;
		}
		if (fine){
			glob.loadFromDatafile(command,args.join(" "),message);
		}else{
			message.reply("Please enter a correct target. Please also refrain from insulting and pinging roles.");
		}
	}else{
		issueEmbed.grabEmbed(2,7);
	}
}