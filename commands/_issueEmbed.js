const Discord = require("discord.js");

exports.grabEmbed = function grabEmbed(message,type,additionalInfo){
	let embed;
	switch(type){
		case 0:
			embed.setDescription("🛑 You do not have the right permissions to use this! 🛑");
			break;
		case 1:
			embed.setDescription("Due to steamAPI limitations this command has a small cooldown. Please try again shortly.");
			break;
		case 2:
			embed = lackingLevel(embed,additionalInfo);
			break;
		case 3:
			embed = generalError(embed,additionalInfo);
			break;
		case 4:
			embed.setDescription("This command is currently disabled.");
			break;
		case 5:
			embed = somethingWentWrong(embed,additionalInfo);
			break;
		case 6:
			embed.setDescription("Undefined rows.");
			break;
		case 7:
			embed = incorrectRowLength(embed,additionalInfo);
			break;
		case 8:
			embed = incorrectRowLength(embed,additionalInfo);
			break;
		case 9:
			return "9 is a success code!";
		default:
			embed.setDescription(`Unknown error at location\`${additionalInfo}\``);
			break;
	}

	message.channel.send(embed);
}

function incorrectRowLength(embed, info){
	embed.setDescription(`Incorrect row length: ${info.length}.\nHandler: ${info.location}`);
	return embed;
}

function lackingLevel(embed,level){
	embed.setDescription(`You do not have the right level to use this!\n You must be level ${level}!`);
	return embed;
}

function generalError(embed,info){
	embed.setDescription("Something has gone wrong, please notify Archie!");
	console.log(info);
	return embed;
}

function somethingWentWrong(embed,info){
	embed.setDescription("Something went wrong, please notify Archie.");
	console.log(info);
	return embed;
}

function unknownError(embed,location){
	embed.setDescription(`Unknown error at location\`${location}\``);
	return embed;
}