const Discord = require("discord.js");
const config = require("./../config.json");
var bot;

var embedColours = {
	"channels" : config.embedColours.channels,
	"bans" : config.embedColours.bans,
	"roles" : config.embedColours.roles
}

exports.embedColours = embedColours;

exports.init = function init(){
	bot = require("./../oliverbot").bot;
}

exports.manageRawEmbeds = async function manageRawEmbeds(event){

	if (event.d.guild_id !== config.serverInfo.serverId) return;

	let rawEmbed = new Discord.MessageEmbed()
		.setTimestamp();

	let flag = true;
	let entry;

	switch (event.t){
		case "CHANNEL_CREATE":
			let createChannel = bot.channels.cache.get(event.d.id);
			if (event.d.type !== 'dm'){

				rawEmbed.setColor(embedColours.channels)
					.setTitle("Channel Created")
					.addField("Info:",`Name: ${event.d.name}\n<#${event.d.id}>`);
			}
			break;
		case "CHANNEL_DELETE":
			rawEmbed.setColor(embedColours.channels)
				.addField(`Name:`,`${event.d.name}`,true)
  				.addField(`ID:`,`${event.d.id}`,true);

			switch (event.d.type){
				case 0:
  					rawEmbed.setTitle("Text Channel Deleted");
 					break;
 				case 2:
 					rawEmbed.setTitle("Voice Channel Deleted");
 					break;
 				case 4:
 					rawEmbed.setTitle("Category Deleted");
 					break;
 				default:
 					rawEmbed.setTitle("Channel Deleted");
 					break;
			}

			break;
		case "CHANNEL_PINS_UPDATE":
			rawEmbed.setColor(embedColours.channels)
				.setTitle(`Message Pinned`)
				.setDescription(`Channel: <#${event.d.channel_id}>\nID: ${event.d.channel_id}`);
			break;
		case "GUILD_BAN_ADD":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				rawEmbed.setColor(embedColours.bans)
					.setTitle("User Banned")
					.addField("User",`${entry.target}`)
					.addField("Executor",`${entry.executor}`)
					.addField("Reason",`${entry.reason}`)
					.setThumbnail(`${entry.target.displayAvatarUR()}`);
			}
			break;
		case "GUILD_BAN_REMOVE":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
			rawEmbed.setColor(embedColours.bans)
				.setTitle("User Unbanned")
				.addField("User",`${entry.target}`)
				.addField("Executor",`${entry.executor}`)
				.setThumbnail(`${entry.target.displayAvatarURL()}`);
			break;
		case "GUILD_MEMBER_REMOVE":
			try{
				entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
				if (entry.createdTimestamp > (Date.now() - 5000)){
					rawEmbed.setColor(embedColours.bans)
						.setTitle("User Kicked")
						.addField("User",`${entry.target}`)
						.addField("Executor",`${entry.executor}`)
						.addField("Reason",`${entry.reason}`)
						.setThumbnail(`${entry.target.displayAvatarURL()}`);
				}else{
					flag = false;
				}
			}catch(e){
				console.log("Someone left :(");
				flag = false;
			}
			break;
		case "GUILD_ROLE_CREATE":
			rawEmbed.setTitle("Role Created")
				.setColor(embedColours.roles)
				.addField("Role:",`${event.d.role.name}\n<@&${event.d.role.id}>`);
			break;
		case "GUILD_ROLE_DELETE":
			entry = await bot.guilds.cache.get(config.serverInfo.serverId).fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
			if (entry.createdTimestamp > (Date.now() - 5000)){
				rawEmbed.setTitle("Role Deleted")
					.setColor(embedColours.roles)
					.setDescription(`${entry.changes[0].old}\nby: ${entry.executor}`);
			}
			break;
		default:
		flag = false;
			//console.log("EVENT START");
			//console.log(event);
			//console.log("EVENT END");
			//rawEmbed.setTitle(event.t)
			//	.setDescription(event.d.toString());
			break;
	}

	if (flag){
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(rawEmbed);
	}
}