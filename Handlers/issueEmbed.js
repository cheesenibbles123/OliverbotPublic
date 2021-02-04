const Discord = require("discord.js");

exports.grabEmbed = function grabEmbed(type,additionalInfo){
	switch(type){
		case 0:
			return lackingPermissions();
		case 1:
			return apiTimeout();
		case 2:
			return lackingLevel(additionalInfo);
		case 3:
			return generalError(additionalInfo);
		case 4:
			return disabled();
		default:
			return null;
	}
}

function lackingPermissions(){
	let embed = new Discord.MessageEmbed()
		.setDescription("🛑 You do not have the right permissions to use this! 🛑");
	return embed;
}

function apiTimeout(){
	let embed = new Discord.MessageEmbed()
		.setDescription("Due to steamAPI limitations this command has a small cooldown. Please try again shortly.");
	return embed;
}

function lackingLevel(level){
	let embed = new Discord.MessageEmbed()
		.setDescription(`You do not have the right level to use this!\n You must be level ${level}!`);
	return embed;
}

function generalError(info){
	let embed = new Discord.MessageEmbed()
		.setDescription("Something has gone wrong, please notify Archie!");
	console.log(info);
	return embed;
}

function disabled(){
	let embed = new Discord.MessageEmbed()
		.setDescription("This command is currently disabled.");
	console.log(info);
	return embed;
}