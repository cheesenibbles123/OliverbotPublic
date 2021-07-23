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