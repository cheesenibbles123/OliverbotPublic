const fetch = require('node-fetch');

module.exports = {
	enabled : 0,
	init : (bot) => {
		let delay = 25000;
	  	var interval = setInterval(function(){
	    fetch('https://api.mcsrvstat.us/2/158.69.5.237:25625').then(response => response.json()).then(json => {
	      let playercount = json.players.online;
	      let version = json.version;
	      let players = json.players.list;
	      if (typeof players === "undefined"){
	        players = "";
	      }
	      let online = "";
	      try{
	        if (json.online = "true"){
	          online = "Online";
	        }else{
	          online = "Offline";
	        }
	      }catch(e){
	        online = "Unable to get status";
	      }
	      let msg = ("```GT MC Server Status\n"
	                +"Status: "+online+"\n"
	                +"Version: "+version+"\n"
	                +"Players: "+playercount+"/30\n"
	                +players+"```");
	      bot.channels.cache.get("683030732817694773").messages.fetch("683031127857823873").then(message => {message.edit(msg)});
	    });
	  },delay);
	}
}