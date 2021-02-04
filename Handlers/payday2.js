const config = require("./../config.json");
const fetch = require("node-fetch");
var { adjustableConfig } = require("./databaseSetup.js");
const Discord = require("discord.js");
const embedGrabber = require("./issueEmbed");

function convertToRoman(num) {
  let roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let str = '';

  for (var i of Object.keys(roman)) {
    var q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }

  return str;
}

var isAllowed = true;


exports.checkIfAllowed = function checkIfAllowed(){
	if (isAllowed){
		getPayday2Information(message,args);
	}else{
		message.channel.send(embedGrabber.grabEmbed(1,null));
	}
}

function getPayday2Information(message, args){
	if (adjustableConfig.apis.payday2){
		if (isAllowed){
			if (args[0]){
				if (args[0] === "overview"){
					fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2?key=${config.apiKeys.steam}&appid=218620&steamid=${args[1]}`).then(resp => resp.json()).then(response => {
						let achievements = response.playerstats.achievements;
						let stats = response.playerstats.stats;

						let unassignedUsed = true;
						let unassignedKills = true;
					
						let mostKills = {};
						let totalKills = 0;
						let faveWeapon = {};
					
						let infamyLevel = {};
						let playerLevel = 0;

						let successHeists = 0;
						let totalHeists = 0;

						let gageCoins = 0;
						for (i=0;i<stats.length;i++){

							//Fave Weapon
							if (stats[i].name.indexOf("weapon_used") !== -1){
								if (unassignedUsed){
									faveWeapon = stats[i];
									unassignedUsed = false;
								}else{
									if (faveWeapon.value < stats[i].value){
										faveWeapon = stats[i];
									}
								}
							}

							//Most Kills + Total Kills
							if (stats[i].name.indexOf("weapon_kills") !== -1){
								totalKills = totalKills + stats[i].value;
								if (unassignedKills){
									mostKills = stats[i];
									unassignedKills = false;
								}else{
									if (mostKills.value < stats[i].value){
										mostKills = stats[i];
									}
								}
							}

							//Infamy Level
							if (stats[i].name.indexOf("player_rank") !== -1){
								if (stats[i].value === 1){
									infamyLevel = stats[i];
								}
							}

							//Player Level
							if (stats[i].name === "player_level"){
								playerLevel = stats[i].value;
							}

							//Heist ratio
							if (stats[i].name === "heist_failed"){
								totalHeists = totalHeists + stats[i].value;
							}
							if (stats[i].name === "heist_success"){
								successHeists = successHeists + stats[i].value;
								totalHeists = totalHeists + stats[i].value;
							}	

							if (stats[i].name === "player_coins"){
								gageCoins = stats[i].value;
							}
						}	

						let OverviewEmbed = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle(`${response.playerstats.gameName}`)
							.addField("Achievements",`${achievements.length} / 1160`,true)
							.addField("Weapon Stats",`Favourite Weapon: ${faveWeapon.name.slice(12).replace(/_/," ")} - used ${faveWeapon.value} time(s)\nMost Kills: ${mostKills.name.slice(13).replace(/_/," ")} - ${mostKills.value} kills\nTotal Kills: ${totalKills}`,true)
							.addField("Player stats",`Level: (${convertToRoman(parseInt(infamyLevel.name.slice(12)))}) ${playerLevel}\nHeisting Performance: ${successHeists}/${totalHeists}\nGage coins: ${gageCoins}`,true)
							.setTimestamp();
						message.channel.send(OverviewEmbed);
					});

					isAllowed = false;
					setTimeout(function(){
						isAllowed = true;
					}, 3000);
				}else{
					message.reply("Please enter a valid argument!\nCurrent valid arguments are: `overview STEAMID`");
				}
			}else{
				message.reply("Please enter an argument!");
			}
		}else{
			message.reply("This command is currently on cooldown due to steam API limitations, try again soon!");
		}
	}else{
		message.reply("That command is currently disabled!");
	}
	return;
}