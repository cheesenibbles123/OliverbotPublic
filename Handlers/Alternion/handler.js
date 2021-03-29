const Discord = require("discord.js");
const displays = require("./display");
const teamLeader = require("./teamLeader");
const user = require("./user");
const globalImp = require("./global");

exports.alternionMainhandler = function alternionHandler(message,command,args){
	let alternionHandlerEmbed = new Discord.MessageEmbed();
	if (args[0]){
		switch (args[0].toLowerCase()){

			case "listbadges":
				alternionHandlerEmbed.setTitle("Available Restricted Badges")
					.setFooter("The formatting is: - `badge_id` : Badge Name -");
				displays.getBadges(message,message.author.id,args[1],alternionHandlerEmbed);
				break;

			case "help":
				if (args[1]){
					switch (args[1].toLowerCase()){
						case "listbadges":
							alternionHandlerEmbed.setDescription("Lists all limited badges that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listsails":
							alternionHandlerEmbed.setDescription("Lists all limited sails that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listmainsails":
							alternionHandlerEmbed.setDescription("Lists all limited main sails that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listcannons":
							alternionHandlerEmbed.setDescription("Lists all limited cannons that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listweapons":
							alternionHandlerEmbed.setDescription("Lists all limited weapon skins that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listflags":
							alternionHandlerEmbed.setDescription("Lists all limited weapon skins that you have access to.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;

						case "assign":
							alternionHandlerEmbed.setDescription("Assign an asset to be used.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "overview":
							alternionHandlerEmbed.setDescription("Lists your currently selected setup.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "whatsmyid":
							alternionHandlerEmbed.setDescription("Lists your Alternion ID")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;

						case "manage":
							alternionHandlerEmbed.setDescription("Lets team leaders manage members of their team.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "listmembers":
							alternionHandlerEmbed.setDescription("Lets team leaders view all members of their team.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "forceupdate":
							alternionHandlerEmbed.setDescription("Lets team leaders update all members of their team in one go.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "forceupdateuser":
							alternionHandlerEmbed.setDescription("Lets team leaders update a specific member of their team.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;
						case "searchuser":
							alternionHandlerEmbed.setDescription("Lets team leaders search for a specific users Alternion ID.")
								.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
							sendAlternionEmbed(message,alternionHandlerEmbed,false);
							break;

						default:
							break;
					}
				}else{
					alternionHandlerEmbed.setTitle("Help Menu")
						.setDescription("Default usage:\n`;Alternion` `Feature`\nCurrently supported features:\n- Help\n- ListBadges\n- ListSails\n- ListMainSails\n- ListWeapons\n- Assign\n- Overview\nUse **;Blackwake Alternion Help** `FEATURE` for more help on each feature")
						.setFooter("Note: Requires your discord_ID to be linked to your Steam_ID in the database, contact Archie for more information.");
					sendAlternionEmbed(message,alternionHandlerEmbed,false);
				}
				break;

			case "assign":
				alternionHandlerEmbed.setTitle("Assigning Item");
				user.assignItemSkin(message,args,alternionHandlerEmbed);
				break;

			case "whatsmyid":
				alternionHandlerEmbed.setTitle("Your ID");
				displays.getUserID(message,alternionHandlerEmbed);
				break;

			case "overview":
				displays.getAlternionOverview(message,alternionHandlerEmbed);
				break;

			case "listsails":
				alternionHandlerEmbed.setTitle("Available Restricted Sails")
					.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
				displays.getNormalSails(message,message.author.id,args[1],alternionHandlerEmbed);
				break;

			case "listmainsails":
				alternionHandlerEmbed.setTitle("Available Restricted Main Sails")
					.setFooter("The formatting is: - `Sail_ID` : Sail Name -");
				displays.getMainSails(message,message.author.id,args[1],alternionHandlerEmbed);
				break;

			case "listcannons":
				alternionHandlerEmbed.setTitle("Available Restricted Cannons")
					.setFooter("The formatting is: - `Cannon_ID` : Cannon Name -");
				displays.getCannons(message,message.author.id,args[1],alternionHandlerEmbed);
				break;

			case "listflags":
				alternionHandlerEmbed.setTitle("Available Restricted Flags Skins")
					.setFooter("The formatting is: - `Skin_ID` : Skin Name -");
				displays.getFlags(message,message.author.id,args[1],alternionHandlerEmbed);
				break;

			case "listweapons":
				alternionHandlerEmbed.setTitle("Available Restricted Weapon Skins")
					.setFooter("The formatting is: - `Skin_ID` : Skin Name -");
				displays.getWeaponSkins(message,message.author.id,alternionHandlerEmbed);
				break;

			case "manage":
				alternionHandlerEmbed.setTitle("Managing User...");
				teamLeader.teamLeaderHandler(message,args[1].toLowerCase(),args[2],alternionHandlerEmbed);
				break;

			case "listmembers":
				teamLeader.teamLeaderFetchList(message,message.author.id,alternionHandlerEmbed);
				break;

			case "forceupdate":
				teamLeader.teamLeaderForceLoadout(message,message.author.id,args[1].toLowerCase(),args[2],alternionHandlerEmbed);
				break;

			case "forceupdateuser":
				teamLeader.teamLeaderForceLoadoutUser(message,message.author.id,args[1].toLowerCase(),args[2],args[3],alternionHandlerEmbed);
				break;

			case "searchuser":
				teamLeader.teamLeaderSearch(message,args[1],args[2],alternionHandlerEmbed);
				break;

			default:
				alternionHandlerEmbed.setDescription("You have entered an incorrect command, please try again.\nUse `;Alternion Help` to get a list of supported commands!");
				globalImp.sendAlternionEmbed(message,alternionHandlerEmbed,false);
				break;
		}
	}else{
		message.channel.send("Please ensure you have entered the correct terms!")
	}
}