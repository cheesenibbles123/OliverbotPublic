const issueEmbed = require("./issueEmbed");
const config = require("./../config.json");
const db = require("./databaseSetup");
const Discord = require("discord.js");
const { bot } = require("../oliverbot.js");

exports.handler = function handler(message,command,args){
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
		}
	}else{
		message.channel.send(embedGrabber.grabEmbed(0,null));
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
	try{
	bot.channels.cache.get(channel.id).messages.fetch(id).then(message => {
		let Quote = new Discord.MessageEmbed()
			.setTitle(`${message.author.username}`)
			.setDescription(`${message.content}`)
			.setThumbnail(message.author.displayAvatarURL())
			.setFooter(`Sent in: #${channel.name} `)
			.setTimestamp();
		let hasNotAddedImage = true;
		message.attachments.forEach(attachment => {
    		if (message.attachments.size === 1) {
      			if (attachment.url && hasNotAddedImage){
      				Quote.setImage(`${attachment.url}`);
      				hasNotAddedImage = false;
      			}
    		}
  		});
		bot.channels.cache.get(config.serverInfo.channels.quotes).send(Quote);
	});
	}catch(e){
		channel.send("Please make sure you have entered it correctly!");
	}
}