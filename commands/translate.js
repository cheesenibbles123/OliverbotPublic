const fetch = require("node-fetch");
const config = require("./../config.json");

module.exports = {
	name: "translate",
	args: [1,200],
	help: "Translates between RU and EN using yandex",
	execute: (message,args) => {
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
	}
}

async function translating(msg,args,lang1,lang2){
	for (i=0;i<args.length;){
		args[i] = encodeURIComponent(args[i]);
		i++;
	}
	let query = `https://translate.yandex.net/api/v1.5/tr.json/translate?lang=${lang1}-${lang2}&key=${config.apiKeys.yandex}&text=${args.join('%20')}`;
	let  translation = await fetch(query).then(response => response.json()).then(result =>{
		if (result.code === 404){
			return "Command is on cooldown";
		}
		if (result.text.length === 0){
			result.text = "Translation failed.";
		}
		return result.text;
	});
	msg.channel.send(translation);
}