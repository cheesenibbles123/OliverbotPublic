const Discord = require("discord.js");

module.exports = {
	name: "serverinfo",
	args: 0,
	help: "Displays the server information",
	roles: ["665939545371574283"],
	category: "Admin",
	guildOnly: true,
	execute: (message,args) => {
		let features = "";
		if (!(message.guild.features.length > 0)){
			features = "-";
		}else{
			features = message.guild.features.join(", ");
		}
		let booster_role = message.guild.members.cache.filter(m => m.roles.cache.has(config.serverInfo.roles.serverbooster));
		let serverinfo = new Discord.MessageEmbed()
							.setColor('#00008b')
							.setTitle(`${message.guild.name}`)
							.setDescription(`Server Information`)	
							.addField('Basic', `Owner: ${message.guild.fetchOwner()}\nDescription: ${message.guild.description}\nCreated on: ${message.guild.createdAt}\nAcronym: ${message.guild.nameAcronym}\nRegion: ${message.guild.region}\nID: ${message.guild.id}`)
							.addField('Total Members', `Real People: ${message.guild.members.cache.filter(member => !member.user.bot).size}\nBots: ${message.guild.members.cache.filter(member => member.user.bot).size}`)
							.addField('Additional Info', `Number of Roles:\nNumber of Bans:\nMFA Level Required:\nNumber of Webhooks:\nDefault Message Notifications:`,true)
							//.addField('-----', `${message.guild.roles.size}\n${await message.guild.fetchBans().then(result => {return result.size})}\n${message.guild.mfaLevel}\n${await message.guild.fetchWebhooks().then(result => {return result.size})}\n${message.guild.defaultMessageNotifications}`,true)
							.addField('Nitro', `Boosters: ${booster_role.size}\nLevel: ${message.guild.premiumTier}\nVanity URL: ${message.guild.vanityURLCode}`,)
							.addField('Number of Channels', `Categories: ${message.guild.channels.cache.filter(channel => channel.type === "category").size}\nText: ${message.guild.channels.cache.filter(channel => channel.type === "text").size}\nVoice: ${message.guild.channels.cache.filter(channel => channel.type === "voice").size}`,true)
							.addField('Verification', `Level: ${message.guild.verificationLevel}\nStatus: ${message.guild.verified}`,true)
							.addField('Emoji Count', `${message.guild.emojis.size}`,true)
							.addField('Explicit content filter level', `${message.guild.explicitContentFilter}`,true)
							.addField('Features', `${features}`)
							.addField('AFK', `Channel: ${message.guild.afkChannel}\nTimeout: ${message.guild.afkTimeout}sec`,true)
							.setImage(`${message.guild.iconURL()}`);
		message.channel.send(serverinfo);
	}
}