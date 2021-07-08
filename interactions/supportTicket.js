const config = require("./../config.json");
const db = require("./../commands/_databaseSetup.js");

let bot;

module.exports = {
	init : (botInstance) => {  // If you do not need a reference to bot, simply remove this function
		bot = botInstance;
	},
	execute : (message) => { // Main event code that will be executed on call
		return false;
		// If in a server
		if (message.guild){

			//If enabled creates support tickets
			if (message.channel.id === config.serverInfo.channels.supportTicketChannel && db.adjustableConfig.misc.SupportTickets === true){
				let d = new Date();
				let date = d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear();
				message.guild.createChannel(`${message.author.username}-${date}`,{type: "text", permissionOverwrites: [
					{
						id : config.serverInfo.serverId,
						deny : ['VIEW_CHANNEL'],
					},
					{
						id : `${message.author.id}`,
						allow : ["VIEW_CHANNEL"],
					},
					{
						id : config.serverInfo.roles.serverAdministrator,
						allow : ["VIEW_CHANNEL"],
					},	
				], reason: 'New Support Ticket Created!'}).then(channel => {
					channel.send("Query is: ```" + message.content + "``` - please wait for an administrator to respond to your ticket.");
				});
				message.delete({timeout: 0, reason: "Support ticket creation."});
			}
		}
	}
}
