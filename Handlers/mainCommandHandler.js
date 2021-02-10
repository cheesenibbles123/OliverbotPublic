const rankcard = require("./rankcard");
const help = require("./help");
const audio = require("./audio")
const miscCommands = require("./smallCommands");
const glob = require("./globalFunctions");
const ownerOnly = require("./ownerOnly");
const quiz = require("./quizQuestions");
const economy = require("./economySystem");
const modCommands = require("./modOnly");
const adminCommands = require("./adminOnly");
const payday2 = require("./payday2");
const random = require("./randomStuff");
const blackwake = require("./blackwake");
const alternion = require("./alternion");
const db = require("./databaseSetup");

exports.handler = function handler(message,command,args,isDm){

	let notFound = false;

	//main command block
	switch (command){
		case "rankcard":
			rankcard.rankcardCreation(message);
			break;
		case "listcommands":
		case "help":
			help.handler(message,command,args);
			break;
		case "playaudio":
    	case "stopaudio":
    		audio.handler(message,command,args);
    		break;
    	case "payday2":
			payday2.getPayday2Information(message,args);
			break;
		case "delete-administrators":
		case "dox":
		case "magic":
		case "pong":
		case "execute":
		case "apod":
		case "8ball":
		case "yodish":
		case "nerds":
		case "trump":
		case "cat":
		case "rolldie":
		case "numtrivia":
		case "advice":
		case "bacon":
		case "chuck":
		case "dictionary":
		case "coinflip":
		case "today":
		case "today":
		case "playdie":
		case "rollcustom":
		case "translate":
		case "inspire":
		case "urban":
		case "memegen":
			miscCommands.handler(message,command,args);
			break;
		case "quote":
		case "nootnoot":
		case "randomsong":
		case "dad":
		case "dance":
		case "insult":
			glob.loadDataFromFile(command,"",message);
			break;
		case "marsweather":
			//GetMarsWeatherData(message);
			message.channel.send("This command is currently not working :(");
			break;
		case "database":
		case "do":
		case "restart":
		case "updatealternion":
			ownerOnly.handler(message,command,args);
			break;
		case "quiz":
			quiz.handler(message,command,args);
			break;
		case "gamble":
		case "giftcoins":
		case "sell":
		case "inventory":
		case "beg":
		case "work":
		case "purchase":
		case "search":
			economy.handler(message,command,args);
			break;
		case "createcommand":
		case "deletecommand":
		case "userinfo":
		case "mute":
		case "unmute":
		case "totalusers":
		case "warn":
		case "savequote":
		case "tempmute":
			modCommands.handler(message,command,args);
			break;
		case "nWordCount":
		case "config":
		case "createrole":
		case "deleterole":
		case "refreshroles":
		case "botinfo":
		case "serverinfo":
		case "channelinfo":
		case "ban":
			adminCommands.handler(message,command,args);
			break;
        case "random":
        	random.handleRandomCommand(message,3);
        	break;
		case "blackwake":
			blackwake.handler(message,command,args);
			break;

		// Alternion
		case "alternion":
			alternion.alternionMainhandler(message,command,args,isDm);
			break;

    	default:
    		notFound = true;
    		break;
	}

	if (notFound && !db.handler(message,command)){
		message.react("🤔");
	}else{
		db.updateTracking(command);
	}
}