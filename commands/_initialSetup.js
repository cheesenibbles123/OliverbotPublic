
const db = require("./_databaseSetup");
const fetch = require("node-fetch");
const Discord = require("discord.js");
const blackwake = require("./blackwake");
const glob = require("./_globalFunctions");

var bot;

exports.init = function init(){
	statusHandler.initStatus();
	db.setupDatabase();
	
	glob.init();

	bot = require("./../oliverbot.js").bot;

	setInterval(() =>{
		getSteamGroupData();
	}, 15000000);
	/*setInterval(() =>{
		ISSLocation();
	}, 20000);*/
	//setInterval(() =>{
	//	displayBotInfo();
	//}, 6000);
	//setInterval(() =>{
	//	update7DTDlistNew();
	//}, 25000);
	//setInterval(() =>{
	//	BwServerStatus();
	//}, 3000);
	// setInterval(() =>{
	// 	GetAllGamesBeingPlayed(config.serverInfo.serverId);
	// }, 20000);
	//updateMClist();
}

///////STEAM API
function getSteamGroupData(){
	fetch("https://steamcommunity.com/groups/greattortuga/memberslistxml/?xml=1").then(resp=>resp.text()).then(response => {
		let finalMessage = "```hs\n";
		let groupName = response.split("groupName>")[1].slice(9,-6);
		let memberCount = response.split("memberCount>")[1].slice(0,response.split("memberCount>")[1].length-2);
		let membersInGame = response.split("membersInGame>")[1].slice(0,-2);
		let membersOnline = response.split("membersOnline>")[1].slice(0,-2);
		finalMessage = finalMessage + "STEAM GROUP DATA\n"
			+`${groupName}\n`
			+`Online: ${membersOnline}/${memberCount}\n`
			+`Ingame: ${membersInGame}` +"```";
		bot.channels.cache.get("663524428092538920").messages.fetch("689332199190822968").then(message => {message.edit(finalMessage);});
	});
}

function ISSLocation(){
	try {
		fetch("http://api.open-notify.org/iss-now.json").then(res => res.json()).then(response => {
			let date = new Date(response.timestamp * 1000);
			date = date.toString().replace(/T/g," ");
			date = date.replace(/Z/g,"");
			let ISSembed = new Discord.MessageEmbed()
						.setTitle("ISS Location")
						.addField("Data:",`LAT: ${response.iss_position.latitude}\nLON: ${response.iss_position.longitude}`)
						.setFooter(`Date: ${date}`)
						.setTimestamp();
			bot.channels.cache.get("641373050281132034").messages.fetch("668646281752739851").then(msg => { msg.edit(ISSembed);});
		});
	}catch(e){
		//console.log(e);
	}
}