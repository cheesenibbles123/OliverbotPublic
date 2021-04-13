const Discord = require("discord.js");
const config = require("./../config.json");

exports.handler = function handler(message,command,args){
   switch (command){
      case "listcommands":
         listTheCommands(message);
         break;
      case "help":
         help(message,args);
         break;
   }
}

function listTheCommands(message){
   let embed = new Discord.MessageEmbed()
      .setTitle("General Commands")
      .setColor(0x008000)
      .addField(`Prefix:`,`;`)
      .addField(`Translate:`,`translate en (words) --- this translates from russian to english\ntranslate ru (words) --- this translates from english to russian`)
      .addField(`Listcommands:`,`Lists all the available commands`)
      .addField(`Suggest:`,`Use this command to suggest something to the admin/mod team, if it gets apporved it will be put into #voting where it will be voted on`)
      .addField(`Help:`,`Get help on how to use a command! Currently only works on a few commands, use ";help list" to view all available`)
      .addField(`Quote:`,`Get a random quote from someone`)
      .addField(`Rankcard:`,`using this command shows you your current level and the amount of XP you have`)
      .addField(`User Commands`,` - Em\n - Jakka\n - Extra\n - Emjakka\n - Torden\n - Spartan\n - Metz\n - Oli\n - Edward`,true)
      .addField(`Misc Commands`,` - Nerds\n - Hangover\n - Russia\n - Ew\n - Dog\n - Cat\n - Art\n - Dance\n - Playdie\n - Rolldie\n - Rollcustom\n - Coinflip\n - Dad\n - Nootnoot\n - Urban\n - Today`,true)
      .addField(`Meme Commands`,` - France\n - Assemble\n - Memegen\n - Random\n - Insult\n - Trump\n - 8Ball\n - Execute\n - Frustration\n - Magic\n - Pong\n - Ping\n - Advice\n - yodish\n - Beg\n - Quiz`,true)
      .addField(`Music Commands`,` - PlayAudio\n - RandomSong`,true)
      .addField(`Nerd Commands`,` - APOD\n - MarsWeather\n - NumTrivia\n - ExchangeRates`,true)
      .addField(`Economy Commands`,` - Work\n - GiftCoins\n - Purchase\n - Sell\n - Inventory`,true)
      .setTimestamp();
   message.author.send(embed);

   let embed2 = new Discord.MessageEmbed()
      .setTitle("Blackwake Commands")
      .setColor(0x008000)
      .addField(`Main Features`,`Used in the following context:\n\`;Blackwake\` \`Feature\` \`SteamID\`\n - Overview\n - Weaponstats\n - Maintenance\n - ShipWeaponry\n - ShipStats\n - Compare\n - Monthly\n - Elo\n - Alternion`)
      .addField(`Alternion Features`,`Used in the following context:\n\`;Alternion\` \`Feature\`\n - ListBadges\n - ListSails\n - ListMainSails\n - ListCannons\n - ListWeapons\n - Overview\n - Assign\n - Help`)
      .setTimestamp();
   message.author.send(embed2);

   let dembed = new Discord.MessageEmbed()
      .setTitle("Currently Unavailable Commands")
      .setColor(0x008000)
      .addField(`Misc:`,` - math`)
      .setTimestamp();
   message.author.send(dembed);

   if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator)){

      let Membed = new Discord.MessageEmbed()
         .setTitle("Moderator Commands")
         .setColor(0xeecd17)
         .addField(`Mute::`,`Mute @user`)
         .addField(`Unmute:`,`Unmute @user`)
         .addField(`Tempmute:`,`Tempmute @user`)
         .addField(`Warn:`,`Warn @user **Reason**`)
         .addField(`Totalusers:`,`Shows the total number of people`)
         .addField(`UserInfo`,`Use without any arguments for information about yourself, Use:\n - ;UserInfo @user\nTo get specific information on one person`)
         .addField(`Misc`,` - savequote *messageID*\n`)
         .setTimestamp();
      message.author.send(Membed); //Mods

   }

   if (message.member.roles.cache.has(config.serverInfo.roles.serverAdministrator)){

      let Aembed = new Discord.MessageEmbed()
         .setTitle("Admin Commands")
         .setColor(0xdb1a1a)
         .addField(`Ban:`,`Ban @user`)
         .addField(`ServerInfo:`,`Gives information about the server`)
         .addField(`ChannelInfo:`,`Gives information about a channel`)
         .addField(`Reaction Roles:`,` - **CreateRole** \`@role\` ***:emoji:***\n(Adds a role to the reaction role menu)\n  - **DeleteRole** ***:emoji:***\n(Removes a role to the reaction role menu)`, true)
         .addField(`Custom Commands:`,` - **CreateCommand** \`Command\` ***Stuff the command outputs***\n(Creates a command that anyone can use)\n - **DeleteCommand** \`Command\`\n(Deletes a custom made command permanently)`, true)
         .setTimestamp();
      message.author.send(Aembed); //Admins
   }
}

function help(message,args){
   let supportedQueries = ["listcommands","list","memegen","random","apod","marsweather","rankcard","translate","exchangerates","today","urban","quote","yodish","dad","8ball","blackwake","payday2","trump"];
   if (args[0]){
      let term = args[0].toLowerCase();
      switch (term){
         case "listcommands":
            message.channel.send("Sends you a list of all my commands that you can use :)");
            break;         
         case "list":
            message.author.send(`Commands I can help with:\n ${supportedQueries.join("\n - ")}`);
            message.channel.send("Check your DM's ;)");
            break;
         case "memegen":
            message.channel.send("Currently available formats and the website version can be found at https://memegen.link/");
            break;
         case "random":
            message.channel.send("Why not try and find out?");
            break;
         case "apod":
            message.channel.send("Nasa's Astronomy Picture of the Day.");
            break;
         case "marsweather":
            message.channel.send("Get the weather data of several points on mars.\n"
               +" - av: Average of samples over the Sol (°F for AT; m/s for HWS; Pa for PRE)\n"
               +" - ct: Total number of recorded samples over the Sol\n"
               +" - mn: Minimum data sample over the sol (same units as av)\n"
               +" - mx: Maximum data sample over the sol (same units as av)\n");
            break;
         case "rankcard":
            message.channel.send("Display your rankcard");
            break;
         case "translate":
            message.channel.send("Use: `translate ru *words to translate*` to translate to russian.\nUse: `translate eu *words to translate*` to translate the words to english.");
            break;
         case "exchangerates":
            message.channel.send("Convert the currency you wish to another currency, a full list of supported currencies is at: https://www.exchangerate-api.com/docs/supported-currencies");
            break;
         case "today":
            message.channel.send("Usage of the command is as followed: `;today *term*`\nTerms Allowed are:\n - Events\n - Births\n - Deaths");
            break;
         case "urban":
            message.channel.send("Usage of the command is as followed: `;urban *word to search*`");
            break;
         case "quote":
            message.channel.send("Sends a random quote!");
            break;
         case "yodish":
            message.channel.send("Returns your words in yosidh format.");
            break;
         case "dad":
            message.channel.send("Get a dad quote!");
            break;
         case "8ball":
            message.channel.send("Get a yes/no awnser to your question!");
            break;
         case "insult":
            message.channel.send("insult whoever you wish!");
            message.react("🙊");
            break;
         case "me":
            message.channel.send("What can i help you with?");
            message.react("🤔");
            break;
         case "blackwake":
            message.channel.send("There are several actions for the Blackwake command, currently the supported options are:\n`Overview` `WeaponStats` `ShipStats` `Maintenance` `ShipWeaponry` `Monthly`\nNotes:\n- Requires your profile to be set to public.\n- `Monthly` may take a while to load.");
            break;
         case "alternion":
            message.channel.send("There are several actions for the Alternion command, currently the supported options for individuals are:\n`Overview` `LiastBadges` `ListSails` `ListMainSails` `Assign` `WhatsMyID` `ListCannons` `ListFlags` `ListWeapons`\nTeam Leader commands:\n`Manage` `ListMembers` `ForceUpdate` `ForceUpdateUser` `SearchUser`\nNotes:\n- Requires your profile to be set to public.\n- `Monthly` and `elo` may take a while to load.");
            break;
         case "payday2":
            message.channel.send("Currently supported options are: `overview`\nNote: requires your profile to be set to public!");
            break;
         case "trump":
            message.channel.send("Find out trumps opinion of the individual/group/company your specify!");
            break;
         //Non Public Commands
         case "userinfo":
            if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
               message.channel.send("Displays information about a user.");
            }
            break;
         case "channelinfo":
            if (message.member.roles.cache.has(config.serverInfo.roles.serverModerator) && adjustableConfig.misc.moderatorCommands){
               message.channel.send("Displays information about the currently viewed channel.");
            }
            break;
         default:
            message.reply("That command currently either has no help section or is detailed in the commands list.");
            message.react("448435180286509066");
            break;
      }
   }else{
      message.channel.send("I currently have help for:\n`"
         +`${supportedQueries.join("` `")}`+"`");
   }
}