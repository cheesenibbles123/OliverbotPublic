const issueEmbed = require("./issueEmbed");
const config = require("./../config.json");
const db = require("./databaseSetup");
const Discord = require("discord.js");
var bot;
const issueEmbeds = require("./issueEmbed");

exports.init = function init(){
	bot = require("../oliverbot.js").bot;
}

exports.handler = function handler(message,command,args){
	if (db.adjustableConfig.misc.moderatorCommands){
		if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator)){
			switch (command){
				case "createcommand":
					createCommand(message,args);
					break;
				case "deletecommand":
					deleteCommand(message,args);
					break;
				case "userinfo":
					getUserInformation(message,args);
					break;
				case "savequote":
					saveQuote(message.channel,args[0]);
					break;
				case "mute":
					mute(message);
					break;
				case "unmute":
					unmute(message);
					break;
				case "totalusers":
					message.channel.send(message.guild.members.cache.filter(member => !member.user.bot).size);
					break;
				case "warn":
					warn(message,args);
					break;
				case "tempmute":
					tempMute(message);
					break;
			}
		}else{
			message.channel.send(issueEmbeds.grabEmbed(0,null));
		}
	}else{
		message.channel.send(issueEmbeds.grabEmbed(4,null));
	}
}

function createCommand(message,args){
	configurationDatabaseConnectionPool.query(`insert into CustomCommands values ('${args[0]}' , '${args.slice(1)}' )`);
	setTimeout(function(){
		db.loadCustomCommandsFromDB();
	}, 1000);
	message.reply("Your command is ready to go!");
}

function deleteCommand(message,args){
	let commandToDelete = "";
	if (Array.isArray(args)){
		commandToDelete = args[0];
	}else{
		commandToDelete = args;
	}
	configurationDatabaseConnectionPool.query(`delete from CustomCommands where command='${commandToDelete}'`);
	setTimeout(function(){
		db.loadCustomCommandsFromDB();
	}, 1000);
	message.reply("Command deleted!");
}

function getUserInformation(message,args){
	let userInformation;
	let userID;
	let userCreatedAt;
	let userJoinedAt;
	let avatar;
	let serverDeaf;
	let serverMute;

	if (typeof args[0] !== undefined && args.length < 1){
		userInformation = message.guild.members.cache.get(message.author.id);	
		userID = userInformation.user.id;

		let usertimestamp = (new Date(userInformation.user.createdTimestamp)).toString().split(" ");
		userCreatedAt = `${usertimestamp[2]}/${usertimestamp[1]}/${usertimestamp[3]}\n${usertimestamp[4]} CEST`;

		let temp = (new Date(userInformation.joinedTimestamp)).toString().split(" ");
		userJoinedAt = `${temp[2]}/${temp[1]}/${temp[3]}\n${temp [4]} CEST`;

		avatar = userInformation.user.displayAvatarURL();

		serverDeaf = userInformation.serverDeaf;
		serverMute = userInformation.serverMute;

		displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,userInformation.user);

	}else{
		if (!message.mentions.users.size) {
			message.reply('You need to ping member to get their info!');
		}else{
			userInformation = bot.guilds.cache.get(message.guild.id).members.cache.get(glob.getUserFromMention(args[0]).id);	
			userID = userInformation.user.id;
			let usertimestamp = (new Date(userInformation.user.createdTimestamp)).toString().split(" ");
			userCreatedAt = `${usertimestamp[2]}/${usertimestamp[1]}/${usertimestamp[3]}\n${usertimestamp[4]} CEST`;

			let temp = (new Date(userInformation.joinedTimestamp)).toString().split(" ");
			userJoinedAt = `${temp[2]}/${temp[1]}/${temp[3]}\n${temp [4]} CEST`;

			avatar = userInformation.user.displayAvatarURL();

			serverDeaf = userInformation.serverDeaf;
			serverMute = userInformation.serverMute;

			displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,userInformation.user);
		}
	}
}

function displayUserInfo(message,userID,userCreatedAt,userJoinedAt,serverDeaf,serverMute,avatar,user){

	let message_count;
	db.mainDatabaseConnectionPool.query(`SELECT * FROM xp WHERE id = '${userID}'`, (err,rows) => {
		if (rows.length < 1){
			message_count = 0;
		}else{
			message_count = rows[0].message_count;
		}
		let nitroInfo = "Nitro Tier: ";
		if (user.premium_type === 1){
			nitroInfo += "Classic";
		}else if (user.premium_type === 20){
			nitroInfo += "Full";
		}else{
			nitroInfo += "N/A";
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("User Info")
   			.setColor(0x008000)
   			.setThumbnail(`${avatar}`)
   			.addField(`User:`,`<@${userID}>`)
   			.addField(`ID:`,`${userID}`,true)
   			.addField(`Account created at:`,`${userCreatedAt}`,true)
   			.addField(`Joined the server at:`,`${userJoinedAt}`,true)
   			.addField(`Server Details:`,`Server Deafened: ${serverDeaf}\nServer Muted: ${serverMute}\nMessages Sent: ${message_count}`,true)
   			.addField(`Nitro info`,`${nitroInfo}`,true)
   			.addField(`Avatar`,`[Link](${avatar})`)
   			.setTimestamp();

   		//console.log("FLAGS");
   		//console.log(user.flags);
   		//console.log("PUBLIC FLAGS");
   		//console.log(user.public_flags);
   		//console.log("USER");
   		//console.log(user);
  		message.channel.send(embed);
	});

  	return;
}

function saveQuote(channel,id){

	if (typeof id !== null && Number.isInteger(parseInt(id))){
		try{
			bot.channels.cache.get(channel.id).messages.fetch(id).then(message => {
				let dateSent = new Date(message.createdTimestamp);
				let quote = new Discord.MessageEmbed()
					.setTitle(`${message.author.username}`)
					.setDescription(`${message.content}`)
					.setThumbnail(message.author.displayAvatarURL())
					.setFooter(`Sent in: #${channel.name} ⚉ ${dateSent.getDay()}/${dateSent	.getDate()}/${dateSent.getFullYear()}`);
				let hasNotAddedImage = true;
				message.attachments.forEach(attachment => {
		    		if (message.attachments.size === 1) {
		      			if (attachment.url && hasNotAddedImage){
		      				quote.setImage(`${attachment.url}`);
		      				hasNotAddedImage = false;
		      			}
		    		}
		  		});
				bot.channels.cache.get(config.serverInfo.channels.quotes).send(quote);
			});
		}catch(e){
			channel.send("Please make sure you have entered it correctly!");
		}
		channel.send("Done!");
	}else{
		channel.send("Please make sure you have entered the correct message ID :)");
	}
}

////////////////////////////////////////////////////////////////MUTES
function rolecheckformutes(member,msg){
	let response = true;
	//if commander just do
	if (msg.member.roles.cache.has("401925172094959616")){
		response = false;
	}
	// if admin mutes, target non admin
	if (msg.member.roles.cache.has("402120143364423682") & !(member.roles.cache.has("402120143364423682"))){
		response = false;
	}
	//if mode mutes, target non mod
	if ( (msg.member.roles.cache.has("440514569849536512") & !(msg.member.roles.cache.has("402120143364423682"))) & !(member.roles.cache.has("440514569849536512"))){
		response = false;
	}
	return response;
}

async function mute(message){
	let member = message.guild.members.find('id',message.mentions.users.first().id);
	let pass = rolecheckformutes(muteMember, message);
	if (pass){
		message.channel.send("You can't use this command.");
	}else{
		try{
			member.roles.add(config.serverInfo.roles.muted);
			message.channel.send(member + " has been muted");
		}catch (e) {
			console.log(e);
			message.channel.send("Can't mute this person right now, something doesnt seem to be working");
		}
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: " + muteMember + " has been muted by " + message.member.user.username + ".");
	}
}

async function unmute(message){
	let member = message.guild.members.find('id',message.mentions.users.first().id);
	let pass = rolecheckformutes(muteMember, message);
	if (pass){
		message.channel.send("You can't use this command.");
	}else{
		try{
			member.roles.remove(config.serverInfo.roles.muted);
			message.channel.send(member + " has been unmuted");
		}catch (e) {
			console.log(e);
			message.channel.send("Can't unmute " + member + "right now, something doesnt seem to be working");
		}
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send("User: "+unmuteMember+" has been unmuted by " + message.member.user.username + ".");
	}
}

function warn(message,args){
	let member = glob.getUserFromMention(args[0]);

	let warningEmbed = new Discord.MessageEmbed()
		.setTitle(`Warning from ${message.guild.name}`)
		.setDescription(`${(args.slice(1)).join(" ")}`);

	let loggingWarningEmbed = new Discord.MessageEmbed()
		.setTitle(`Warning to ${member.username}`)
		.setDescription(`${(args.slice(1)).join(" ")}`)
		.setFooter(`ID: ${member.id}`);

	if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){
		loggingWarningEmbed.setColor(config.embedColours.warningAdmin);
		warningEmbed.setColor(config.embedColours.warningAdmin);
	}else{
		loggingWarningEmbed.setColor(config.embedColours.warningMod);
		warningEmbed.setColor(config.embedColours.warningMod);
	}

	try{
		member.send(warningEmbed).catch(() => message.channel.send("This user does not have open DMs."));
		bot.channels.cache.get(config.serverInfo.channels.loggingChannel).send(loggingWarningEmbed);
	}catch(e){
		message.reply("This isnt working currently. Tell archie to go look at the logs.");
		console.log(e);
	}
}

function tempMute(message){
	let member = message.guild.members.find('id',message.mentions.users.first().id);
	try{
		let tempmuteAwnser = rolecheckformutes(member, message);
		if (tempmuteAwnser){
			message.channel.send("You can't mute someone higher than, or at your current role.");
		}else{
			let tempmuteGo = false;
			if (typeof args[1] === "undefined"){
				time = 86400000;
				tempmuteGo = true;
			}else{
				try{
					time = parseInt(args[1]);
					tempmuteGo = true;
				}catch(e){
					message.channel.send("Please enter a correct number of hours.");
				}
			}
			if (tempmuteGo){
				let delayTemp = (parseInt(args[1]) * 1000 * 60 * 60);
				mute(message);
				bot.channels.cache.get("512331083493277706").send("User: "+member+" has been temporarily muted for "+time+" hour(s) by "+message.member.user.username+".\n"
													+"Reason: "+(args.slice(2)).join(" "));
				setTimeout(() => {
					unmute(message)
				}, delay);
			}
		}
	}catch(e){
		message.channel.send("Error, please check you pinged an individual/ used the command correctly.");
	}
}