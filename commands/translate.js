const fetch = require("node-fetch");
const config = require("./../config.json");
const {reply} = require("./_globalFunctions.js");

module.exports = {
	name: "translate",
	args: [1,200],
	help: "Translates between RU and EN using yandex",
	usage: "<language> <text>",
	interactionSupport: true,
	options: [
		{
			name : "language",
			description : "Language to translate to",
			type : 3,
			required : true,
			choices : [
				{
					name : "Russian",
					value : "ru"
				},
				{
					name : "English",
					value : "en"
				}
			]
		},
		{
			name : "text",
			description : "Text to translate",
			type : 3,
			required : true
		}
	],
	execute: (message,args) => {
		translate(message,args,true);
	},
	executeInteraction: (interaction,args) => {
		translate(interaction,args,false);
	}
}

async function translate(event,args,isMessage){
	let lang1 = args[0];
	let lang2 = lang1 === "ru" ? "en" : "ru";

	args.shift();

	for (i=0;i<args.length;){
		args[i] = encodeURIComponent(args[i]);
		i++;
	}
	let query = `https://translate.yandex.net/api/v1.5/tr.json/translate?lang=${lang1}-${lang2}&key=${config.apiKeys.yandex}&text=${args.join('%20')}`;
	fetch(query).then(response => response.json()).then(result =>{
		if (result.code === 404){
			reply(event,"Command is on cooldown",isMessage);
		}else
		if (result.text.length === 0){
			reply(event,"Translation failed.",isMessage)
		}else{
			reply(event,result.text,isMessage);
		}
	}

}