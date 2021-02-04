const glob = require("./globalFunctions");
var adjustableConfig;
const Discord = require("discord.js");
const fetch = require("node-fetch");
const db = require("./databaseSetup");
const issueEmbeds = require("./issueEmbed");
const fs = require("fs");

exports.init = function init(){
	adjustableConfig = require("./databaseSetup.js").adjustableConfig;
}

function randomGif(message,content){
	let yay = glob.getRandomInt(5);
	if ( yay === 1){
		switch(true){
			case (content.includes("roll")):
				return "https://makeagif.com/gif/2-person-forward-roll-race-vrEaaK";
			case (content.includes("jump")):
				return "https://giphy.com/gifs/filmeditor-will-ferrell-elf-l2YWvhSnfdWR8nRBe";
			case (content.includes("wave")):
				return "https://giphy.com/gifs/elf-TDWwXnAZbp0xW";
			case (content.includes("happy")):
				return "https://giphy.com/gifs/butterfly-penguins-otnqsqqzmsw7K";
			case (content.includes("excited")):
				return "https://giphy.com/gifs/happy-car-home-rdma0nDFZMR32";
			case (content.includes("ritual")):
				return "https://giphy.com/gifs/woohoo-R8e3MbbggNBjq";
			case (content.includes("alien")):
				return "https://giphy.com/gifs/alien-area-51-stormarea51-WqEmD7ycGVIzzNMxya";
			case (content.includes("ree")):
				return "https://giphy.com/gifs/justin-g-mad-u-camron-xTcnSOEKegBnYhGahW";
			case (content.includes("no way")):
				return "https://giphy.com/gifs/6OpusTwW1csaQ";
			default:
				return null;
		}
	}
	return null;
}

function randomResponse(message,content,serverid){
	let returnEmojis = [];
	if (content.includes("bot")){
		returnEmojis.push("👋");
	}
	if (content.includes("help")){
		returnEmojis.push("😟");
	}
	if (content.includes("oliver")){
		returnEmojis.push("👌");
	}
	if (content.includes("smoke")){
		returnEmojis.push("🚬");
	}
	if (content.includes("no u")){
		returnEmojis.push("no u");
	}
	if (content.includes("family")){
		returnEmojis.push("👪");
	}
	if (content.includes("food")){
		returnEmojis.push("😋");
	}
	if (content.includes("happy")){
		returnEmojis.push("🙂");
	}
	if (content.includes("jarvis")){
		returnEmojis.push("🤖");
	}
	if (content.includes("wave")){
		returnEmojis.push("👋");
	}
	if (content.includes("goose")){
		returnEmojis.push("690138132343160854");
	}
	if (content.includes("minecraft")){
		returnEmojis.push("690139912313241629");
	}
	if (content.includes("praise")){
		returnEmojis.push("690140280434851922");
	}
	if (content.includes("confused")){
		returnEmojis.push("690140617715875874");
	}
	if (content.includes("dab")){
		returnEmojis.push("690140909030866957");
	}
	if (content.includes("youtube")){
		returnEmojis.push("690141366323511297");
	}
	if (content.includes("russia")){
		returnEmojis.push("690141739050467345");
		returnEmojis.push("692399362739011595");
	}
	if (content.includes("soviet")){
		returnEmojis.push("690143238392512531");
	}
	if (content.includes("tank")){
		returnEmojis.push("690141956327735318");
	}
	if (content.includes("yes")){
		returnEmojis.push("690144439460429825");
	}
	if (content.includes("alien")){
		returnEmojis.push("690144106785144857");
	}
	if (content.includes("coffee")){
		returnEmojis.pusht("690144192890273912");
	}
	if (content.includes("negative")){
		returnEmojis.push("690144528312696969");
	}
	if (content.includes("correct")){
		returnEmojis.push("690144528153575433");
	}
	if (content.includes("dyno")){
		returnEmojis.push("690145143416029224");
	}
	if (content.includes("love")){
		returnEmojis.push("690145216883327022");
	}
	if (message.channel.id === 552871633266933811 && content.includes("thissmerk") && adjustableConfig.reactions.smirks){
		returnEmojis.push("553339106516533251");
	}
	if (message.channel.id === 552871633266933811 && content.includes("thatsmerk") && adjustableConfig.reactions.smirks){
		returnEmojis.push("553339063315333147");
	}
	if (content.includes("fortnite")){
		returnEmojis.push("690145056413188214");
	}
	if (content.includes("caught")){
		if (getRandomInt(2) === 1){
			returnEmojis.push("690145450547871794");
		}else{
			returnEmojis.push("690145450325835810");
		}
	}
	if (content.includes("uk")){
		returnEmojis.push("🇬🇧");
	}
	if (content.includes("america")){
		returnEmojis.push("692397018932314163");
		returnEmojis.push("🇺🇸");
	}
	if (content.includes("undertale")){
		returnEmojis.push("692397521120526376");
	}
	if (content.includes("minecraft")){
		returnEmojis.push("692397796896014458");
	}
	if (content.includes("hidden")){
		returnEmojis.push("692397796937957417");
	}
	if (content.includes("detected")){
		returnEmojis.push("692397796505944096");
	}
	if (content.includes("wtf")){
		returnEmojis.push("692398281925328946");
	}
	if (content.includes("tea")){
		returnEmojis.push("692398282256941086");
	}
	if (content.includes("sweat")){
		returnEmojis.push("692398281988243503");
	}
	if (content.includes("water")){
		returnEmojis.push("692398572108251228");
	}
	if (content.includes("lava")){
		returnEmojis.push("692398572121096293");
	}
	if (content.includes("beef")){
		returnEmojis.push("692399061738717284");
	}
	if (content.includes("illegal")){
		returnEmojis.push("692399062292627476");
	}
	if (content.includes("honk")){
		returnEmojis.push("692399606587195473");
	}
	if (content.includes("frog") || content.includes("🐸")){
		returnEmojis.push("🐸");
	}
	if (serverid === "401924028627025920" && adjustableConfig.reactions.gtSpecific){
		if (content.includes("sad")){
			returnEmojis.push("598649992931967011");
		}
		if (content.includes("archie")){
			returnEmojis.push("588057977827622923");
		}
		if (content.includes("stealyoursoul")){
			returnEmojis.push(":verhappyblob:");
		}
		if (content.includes("hidethepain")){
			returnEmojis.push("452068438500966400");
		}
		if (content.includes("eat")){
			returnEmojis.push("612253237814493194");
		}
		if (content.includes("pirate")){
			returnEmojis.push("590116558915764224");
		}
		if (content.includes("ban")){
			returnEmojis.push("552540975138865163");
		}
		if (content.includes("stop")){
			returnEmojis.push("588054782569086990");
		}
		if (content.includes("spartanthinking")){
			returnEmojis.push("609059663325036545");
		}else
		if (content.includes("spartanturtle")){
			returnEmojis.push("552534938952663040");
		}else
		if (content.includes("spartan")){
			returnEmojis.push("609053537464352788");
		}
		if (content.includes("🤔")){
			returnEmojis.push("602978268689334275");
		}
		if (content.includes("salt")){
			returnEmojis.push("552533703876804611");
		}
		if (content.includes("yay")){
			returnEmojis.push("588062673703403521");
		}
		if (message.member.roles.cache.has("616589349638635572") && adjustableConfig.reactions.giraffeReactions && (message.author.id !== "305802257172135947")){
			returnEmojis.push("526899241495429140");
		}
	}else
	if (serverid === "447133697293156372"){
		returnEmojis.push("Fuck you " + message.author);
	}
	return returnEmojis;
}

function randomPirateShit(msg,content){
	switch(true){
		case (content.includes("yarr")):
			return "Yarr";
		case (content.includes("pirates") || content.includes("pirate")):
			return "Ahoy, Me Hearties!";
		case (content.includes("hello")):
			return "Ahoy, Matey!";
		case (content.includes("enemy") || content.includes("enemies")):
			let num = glob.getRandomInt(2);
			if (num === 0){
				return "All Hand Hoy!";
			}else
			if (num === 1){
				return "Bloody Buccaneers!";
			}else{
				return "Lets Get us Those Dubloons!";
			}
		case (content.includes("storm")):
			return "A storm ye say? Batten Down The Hatches!";
		case (content.includes("treasure")):
			return "Now ye ain't hiding da booty from us now are ye?";
		case (content.includes("run")):
			return "I want me a Clap O' Thunder!";
		case (content.includes("traitor")):
			return "There be a traitor? Cleave Him to the Brisket.";
		case (content.includes("sword")):
			return "Me fav sword's me Cutlass";
		case (content.includes("loot")):
			return "What rewards we be having?";
		default:
			return null;
	}
}

exports.handleRandomReactions = function handleRandomReactions(message){
	if (adjustableConfig.reactions.randomReactions){
		let num = glob.getRandomInt(300);
		if (num in [3,4,5,6]){
			let reactions = randomResponse(message,message.content.toLowerCase(),message.channel.guild.id);
			reactions.forEach(reaction => {
				message.react(reaction);
			});
		}else
		if (num in [15]){
			let content = randomGif(message,message.content.toLowerCase());
			if (content != null){
				message.channel.send(content);
			}
		}else
		if (num in [28]){
			let content = randomPirateShit(message,message.content.toLowerCase());
			if (content != null){
				message.channel.send(content);
			}
		}
	}
}

exports.handleRandomCommand = function handleRandomCommand(message,level){
	let item;
	let file;
	if (db.levelChecker(message,level)){
		type = glob.getRandomInt(10);
		switch (type){
			case 0:
				getRandomMeme(message);
				break;
			case 1:
				getRandomMeme2(message);
				break;
			case 2:
				getRandomGeekJoke(message);
				break;
			case 3:
				getRandomCorpPhrase(message);
				break;
			case 4:
				getRandomBlankMyBlank(message);
				break;
			case 5:
				getRandomStartupIdea(message);
				break;
			case 6:
				message.channel.send(file.Responses.gif[getRandomInt(file.Responses.gif.length)]);
				break;
			case 7:
				fs.readFileSync("./datafile.json").toString();
				file = JSON.parse(file);
				item = glob.getRandomInt(file.Responses.vid.length);
				message.channel.send(file.Responses.vid[item]);
				break;
			case 8:
				fs.readFileSync("./datafile.json").toString();
				file = JSON.parse(file);
				item = glob.getRandomInt(file.Responses.img.length);
				message.channel.send(file.Responses.img[item]);
				break;
			default:
				if (adjustableConfig.apis.randomUselessFactAPI){
					RandomUselessFactAPI(message);
				}
				break;
		}
	}else{
		issueEmbeds.grabEmbed(2,level);
	}
}

function RandomUselessFactAPI(message){
	let randomFactEmbed = new Discord.MessageEmbed();
	fetch("https://uselessfacts.jsph.pl//random.json?language=en").then(resp => resp.json()).then(response => {
		if (typeof response.text !== undefined){
			randomFactEmbed.setTitle(`${response.text}`);
		}
		if (typeof response.id !== undefined){
			randomFactEmbed.setDescription(`${response.id}`,"-");
		}
		randomFactEmbed.setTimestamp();
		message.channel.send(randomFactEmbed);
	});
	return;
}

function getRandomMeme(message){
	fetch("https://meme-api.herokuapp.com/gimme/memes").then(resp=>resp.json()).then(response => {
		message.channel.send(response.postLink);
	});
}
function getRandomMeme2(message){
	fetch("https://some-random-api.ml/meme").then(resp=>resp.json()).then(response => {
		message.channel.send(response.image);
	});
}
function getRandomGeekJoke(message){
	fetch(`https://geek-jokes.sameerkumar.website/api`).then(resp=>resp.text()).then(response => {
		message.channel.send(response);
	});
}
function getRandomCorpPhrase(message){
	fetch(`https://corporatebs-generator.sameerkumar.website/`).then(resp=>resp.json()).then(response => {
		message.channel.send(response.phrase);
	});
}
function getRandomBlankMyBlank(message){
	fetch(`https://api.chew.pro/trbmb`).then(resp=>resp.json()).then(response => {
		message.channel.send(response[0]);
	});
}
function getRandomStartupIdea(message){
	fetch(`http://itsthisforthat.com/api.php?json`).then(resp=>resp.json()).then(response => {
		let startupIdea = new Discord.MessageEmbed()
			.setTitle("New Startup Idea!")
			.addField("Make:",`${response.this}`,true)
			.addField("For:",`${response.that}`,true)
			.setTimestamp();
		message.channel.send(startupIdea);
	});
}