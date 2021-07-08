const config = require("./../config.json");

module.exports = {
	enabled : 0,
	init : (bot) => {
		if(serverStatus.msg === null){
			bot.channels.cache.get(serverStatus.channel).send("Getting Updates").then((msg)=>{
				serverStatus.msg = msg;
			});
		}
		setInterval(function(){
	  		fetch(`https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${config.apiKeys.steam}&format=json&limit=50&filter=\\appid\\420290`).then(res=>res.json()).then(resp=>{ //fetch the server list through the steam API, convert the result into a json object (makes it easier to access)
	    		let serverlist = resp.response.servers; 
	    		if (typeof serverlist === undefined){
	      			console.log("Got an empty response"); 
	    		}else{
	    	  		let finalmsg = "```md\n"; 
	      			let active = new Array(); 
	      			for (i in serverlist){ 
	       	 			if(parseInt(serverlist[i].players) > 0){ 
	       	 				active.push(serverlist[i]); 
	       	 			}
	      			}
	      			active = serversort(active); 
	      			for (i in active){
	       			 	let serverinfo = `[${active[i].players}/${active[i].max_players}][${active[i].name.split("d::")[0].replace(/]/g,"\\").substr(8)}]\n`;
	       	 			finalmsg = finalmsg+serverinfo;
	      			}
	      			finalmsg = finalmsg + "```";
	      			serverStatus.msg.edit(finalmsg); 
	    		}
	  		});
	  	},5000);
	}
}

function serversort(servers){
	for (var i = 1; i < servers.length; i++){
    	for (var j = 0; j < i; j++){
       		if (parseInt(servers[i].players) < parseInt(servers[j].players)){ //if there are less players in the left server, then swap them (basic sorting algorithm using two for loops)
    	    	var x = servers[i];
    	   		servers[i] = servers[j];
    	   		servers[j] = x;
    		}
    	}
	}
	return servers.reverse(); //return the sorted array
}