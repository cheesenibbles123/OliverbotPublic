const fetch = require("node-fetch");
const config = require("./../config.json");
const Discord = require("discord.js");
const issueEmbed = require("./issueEmbed");
var adjustableConfig;
const db = require("./databaseSetup");
const glob = require("./globalFunctions");

exports.init = function init(){
	adjustableConfig = require("./databaseSetup.js").adjustableConfig;
}

exports.handler = function handler(message,command,args){
	switch (command){
		case "delete-administrators":
			deleteAdministrators(message);
			break;
		case "dox":
			message.channel.send(`Doxing ${args.join(" ")}...`);
			break;
		case "magic":
			message.channel.send("https://giphy.com/gifs/magical-KFNQuuT1qx7I4");
			break;
		case "pong":
			message.react("🏓");
			break;
		case "execute":
			execute(message,args[0]);
			break;
		case "apod":
			AstronomyPictureoftheDay(message);
			break;
		case "yodish":
			yodish(message,args);
			break;
		case "nerds":
			nerds(message);
			break;
		case "cat":
			cat(message);
			break;
		case "trump":
			trump(message);
			break;
		case "rolldie":
			message.channel.send(glob.getRandomInt(7));
			break;
		case "numtrivia":
			NumbersTrivia(message);
			break;
		case "advice":
			Advice(message);
			break;
		case "bacon":
			BaconIpsum(message);
			break;
		case "chuck":
			chuckNorrisAPI(message);
			break;
		case "playdie":
			playDie(message);
			break;
		case "rollcustom":
			rollCustom(message);
			break;
		case "translate":
			translate(message,args);
			break;
		case "inspire":
			inspire(message);
			break;
		case "urban":
			urbanDict(message,args);
			break;
		default:
			break;
	}
}

function deleteAdministrators(message){
	message.channel.send("Deleting the administrators.").then(msg => {
		setTimeout(function(){
			msg.edit("Deleting the administrators..");
			setTimeout(function(){
				msg.edit("Deleting the administrators...");
				setTimeout(function(){
					msg.edit("Administrators deleted.");
				},3000);
			},3000);
		},3000);
	});
}

function execute(message, thingToExecute){
	if (typeof thingToExecute === undefined){
		message.channel.send("You need to say who to execute! 🤦");
	}else if (thingToExecute.toLowerCase().includes("everyone") || thingToExecute.toLowerCase().includes("here")){
		message.channel.send("Nah.");
	}else{
		message.channel.send(`Executing ${thingToExecute}...\n https://tenor.com/view/gun-to-head-doc-execution-shoot-gif-14690328`);
		TrackingCommand = true;
	}
}

function AstronomyPictureoftheDay(message){
	if (adjustableConfig.apis.apod){
		fetch(`https://api.nasa.gov/planetary/apod?api_key=${config.apiKeys.nasa}`).then(res => res.json()).then(response => {
			let explanation = response.explanation;
			if (explanation.length > 1024){
				explanation = explanation.slice(0,1021);
				explanation = explanation + "...";
			}
			let aspdembed = new Discord.MessageEmbed()
						.setTitle("Astronomy Picture of the Day")
						.addField(`${response.title}`,`${explanation}`);
			let linkURL = response.url.toString();
			if (linkURL.substr(response.url.length -3) === "jpg" || linkURL.substr(response.url.length -3) === "png" || linkURL.substr(response.url.length -3) === "jpeg"){
				aspdembed.setImage(`${response.url}`);
			}else{
				aspdembed.addField("URL:",`${response.url}`)
			}
			aspdembed.setFooter(`Date: ${response.date}`)	
					.setTimestamp();
			message.channel.send(aspdembed);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

async function yodish(message,args){
	if (thingToExecute.toLowerCase().includes("everyone") || thingToExecute.toLowerCase().includes("here")){
		message.channel.send("Nah.");
	}else if (adjustableConfig.apis.yodish){
		let conversion = encodeURIComponent(args.join(" "));
		var resp = await fetch(`http://yoda-api.appspot.com/api/v1/yodish?text=${conversion}`).then(response => response.json()).then(result =>{
			return result;
		});;
	 	message.channel.send(resp.yodish);
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function eightBall(message){
	let option = glob.getRandomInt(0,3);
	switch (option){
		case 0:
			message.channel.send("Yes");
			break;
		case 1:
			message.channel.send("No");
			break;
		case 2:
			message.channel.send("Im not sure 🤔");
			break;
		default:
			message.channel.send("Effort.");
			break;
	}
}

function nerds(message){
	if (message.member.roles.cache.has("639142448345513984")){
		message.channel.send("<@&639142448345513984> Assemble!");
	}
}

function cat(message){
	fetch("https://api.thecatapi.com/v1/images/search").then(res => res.text()).then(response =>{
		message.channel.send(response[0].url);
	});
}

function trump(message){
	if (message.content.includes("everyone") || message.content.includes("here"))
	{
		message.channel.send("nah.");
	}else{
		fetch(`https://api.whatdoestrumpthink.com/api/v1/quotes`).then(resp=>resp.json()).then(response => {
			message.channel.send(`${args.join(" ")} ${response.messages.personalized[getRandomInt(response.messages.personalized.length)]}`);
		});
	}
}

function NumbersTrivia(message){
	if (adjustableConfig.apis.numTrivia){
		fetch("http://numbersapi.com/random").then(res => res.text()).then(response =>{
			message.channel.send("```"+`${response}`+"```");
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function Advice(message){
	if (adjustableConfig.apis.advice){
		fetch(`https://api.adviceslip.com/advice`).then(res => res.json()).then(response => {
			let Advice = new Discord.MessageEmbed()
				.setDescription(`${response.slip.advice} ID:${response.slip.id}`);
			message.channel.send(Advice);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function BaconIpsum(message){
	if (adjustableConfig.apis.bacon){
		let opt = glob.getRandomInt(2);
		let content = "";
		if (opt === 0){
			content += "https://baconipsum.com/api/?type=meat-and-filler";
		}else
		if (opt === 1){
			content += "https://baconipsum.com/api/?type=meat-and-filler&start-with-lorem=1";
		}
		fetch(content).then(res => res.json()).then(response => {
			let BaconEmbed = new Discord.MessageEmbed()
				.setDescription(`${response[getRandomInt(response.length)]}`)
				.setTimestamp();
			message.channel.send(BaconEmbed);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function chuckNorrisAPI(message){
	if (adjustableConfig.apis.chuck){
		fetch("https://api.chucknorris.io/jokes/random").then(res => res.json()).then(response => {
			let ChuckNorrisEmbed = new Discord.MessageEmbed()
				.setDescription(`${response.value}`)
				.setThumbnail("https://s3.amazonaws.com/mf-cnorris/assets/uploads/2016/10/19123509/timeline-05.jpg")
				.setTimestamp();
			message.channel.send(ChuckNorrisEmbed);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function wordsAPI(message,args){
	if (!adjustableConfig.apis.dictionary){
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}else
	if (args.length > 1){
		message.channel.send("The API only works with one word at a time :(");
	}else
	if (args.length === 0){
		message.channel.send("Please enter a word to look up.");
	}else{
		fetch(`https://wordsapiv1.p.mashape.com/words/${args[0]}/definitions`).then(resp => resp.json()).then(response => {
			let definitions = "";
			for(let i = 0; i < response.definitions.length-1; i++) {
			    definitions = definitions +`${response.definitions[i].definition} - ${response.definitions[i].partOfSpeech}\n"`;
			}
			let wordsAPIEmbed = new Discord.MessageEmbed()
				.addTitle(`${args[0]}`)
				.setDescription(`${definitions}`)
				.setThumbnail("https://www.programmableweb.com/sites/default/files/styles/facebook_scale_width_200/public/WordsAPI%20Logo2.png?itok=vfPp_WC1")
				.setTimestamp();
			message.channel.send(wordsAPIEmbed);
		});
	}
}

function coinFlip(message){
	let coin = glob.getRandomInt(2);
	message.channel.send("💰").then((msg)=>{
		msg.edit("💰🤔").then((msg)=>{
			msg.edit("💰").then((msg)=>{
				msg.edit("😯");	
			});
		});
	});
	if (coin === 0){
		message.channel.send("Tails!");
	}else{
		message.channel.send("Heads!");
	}
}

function TodayInHistory(message,argument){
	if (adjustableConfig.apis.today){
		if (args[0]){
			let allowedInputs = ["events","births","deaths"];
			if (allowedInputs.indexOf(args[0]) >= 0){
				let date = new Date();
				fetch(`http://history.muffinlabs.com/date/${parseInt(date.getMonth()) + 1}/${date.getDate()}`).then(res => res.json()).then(response => {
					if (argument === "events"){
				 		let num = getRandomInt(response.data.Events.length);
						message.channel.send("```"+`${response.data.Events[num].year} - ${response.data.Events[num].text}`+"```");
					}else if (argument === "births"){
						let num = getRandomInt(response.data.Births.length);
						message.channel.send("```"+`${response.data.Births[num].year} - ${response.data.Births[num].text}`+"```");
					}else if (argument === "deaths"){
						let num = getRandomInt(response.data.Deaths.length);
						message.channel.send("```"+`${response.data.Deaths[num].year} - ${response.data.Deaths[num].text}`+"```");
					}
				});
			}else{
				message.channel.send("That type doesnt exist!");
			}
		}else{
			message.channel.send("You need to give the type!");
		}
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function playDie(message){
	let user = getRandomInt(7);
	let botroll = getRandomInt(7);
	message.channel.send("🎲").then((msg)=>{
		msg.edit("..🎲").then((msg)=>{
			msg.edit("You: "+user+", Bot: "+botroll+" ....🎲");
			if (user>botroll){
				message.channel.send("You Win!");
			}else
			if (user<botroll){
				message.channel.send("You Lose!");
			}else{
				message.channel.send("Draw!");
			}
		});
	});
}

function rollCustom(message,args){
	let min = parseInt(args[0]);
	let max = parseInt(args[1]);
	if (parseInt(args[0]) < 1){
		message.channel.send("Please use a starting number greater than 0.");
	}else
	if (min >= max){
		message.channel.send("Please use a maximum value greater than the minimum.");
	}else
	if (isNaN(min)){
		message.channel.send("Please enter a number.");
	}else
	if (parseInt(args[1]) > 1){
		message.channel.send(glob.getRandomBetweenInt(min,max));
	}else{
		message.channel.send(glob.getRandomInt(parseInt(args[0])+1));
	}
}

function translate(message,args){
	if (adjustableConfig.apis.translate){
		if (args[0] === "ru"){
			args = args.slice(1);
			translating(message,args,"en","ru");
		}else
		if (args[0] === "en"){
			args = args.slice(1);
			translating(message,args,"ru","en");
		}else{
			message.reply("The only supported languages are ru and en.");
		}
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}
async function translating(msg,args,lang1,lang2){
	for (i=0;i<args.length;){
		args[i] = encodeURIComponent(args[i]);
		i++;
	}
	let query = `https://translate.yandex.net/api/v1.5/tr.json/translate?lang=${lang1}-${lang2}&key=${config.apiKeys.yandex}&text=${args.join('%20')}`;
	let  translation = await fetch(query).then(response => response.json()).then(result =>{
		return result.text;
	});
	msg.channel.send(translation);
}

function inspire(message){
	if(adjustableConfig.apis.inspire){
		fetch("http://inspirobot.me/api?generate=true").then(resp => resp.text()).then(picture => {
			let InspireImage = new Discord.MessageEmbed()
				.setImage(`${picture}`)
				.setTimestamp();
			message.channel.send(InspireImage);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function urbanDict(message,args){
	if (adjustableConfig.apis.urban){
		let api = `http://api.urbandictionary.com/v0/define?term=${args[0]}`;
		fetch(api).then(response => response.json()).then(resp => {
			let option;
			if (resp.list.length > 1){
				option = resp.list[glob.getRandomInt(resp.list.length)];
			}else{
				option = resp.list[0];
			}
			let embed = new Discord.MessageEmbed()
			.setTitle("Urban Response")
			.setColor(0x008000)
			.addField(`Author:`,`${option.author}`)
			.addField(`Permalink:`,`${option.permalink}`,true)
			.addField(`Vote Ratio:`,`${option.thumbs_up} 👍\n${option.thumbs_down} 👎`,true)
			.addField(`Word:`,`${option.word}`,true)
			.addField(`Definition:`,`${option.definition}`)
			.addField(`Example:`,`${option.example}`)
			.setFooter(`Written: ${option.written_on}, Def_ID: ${option.defid}`)
			.setTimestamp();
			message.channel.send(embed);
		});
	}else{
		message.channel.send(issueEmbed.grabEmbed(4,null));
	}
}

function memegen(message,args){
	if (db.levelchecker(message,4)){
		TrackingCommand = true;
		if (adjustableConfig.apis.memegen){
			let contents = message.content.split(",");
	    	for (i=0;i<contents.length;){
	        	let word = contents[i];
	        	if (i === 0){
	        	    word = word.slice(command.length+2);
	        	}
	        	word = word.replace(/_/g, "__");
	        	word = word.replace(/-/g, "--");
	   	    	word = word.replace(/ /g, "-");
	   	    	word = word.replace(/\?/g, "~q");
	   	     	word = word.replace(/%/g, "~p");
	   	     	word = word.replace(/#/g, "~h");
	   	     	word = word.replace(/''/g, `"`);
	    	    word = word.replace(/\//g, "~s");
	    	    contents[i] = word;
	    	    i++;
	    	}
			let URL = `https://memegen.link/${contents[0]}/${contents[1]}/${contents[2]}.jpg`;
			fetch(URL).then(response =>{
			    message.channel.send(response.url);
			});
		}
	}else{
		issueEmbed.grabEmbed(2,4);
	}
}

function insultUser(message,args){
	if (levelchecker(message,7)){
		let fine = true;
		for (i=0; i<args.length;){
			let mentionrole = message.guild.roles.cache.get(args[i]);
			if (!(typeof mentionrole === "undefined")){
				fine = false;
			}
			i++;
		}
		if (message.content.includes("@everyone") || message.content.includes("@here")){
			message.channel.send("No.");
			fine = false;
		}
		if (fine){
			glob.loadFromDatafile(command,args.join(" "),message);
		}else{
			message.reply("Please enter a correct target. Please also refrain from insulting and pinging roles.");
		}
	}else{
		issueEmbed.grabEmbed(2,7);
	}
}