function BwServerStatus(){
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
    	  		let finalmsg = "```markdown\n"; 
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

//Status lists

function updateMClist(){ 
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

// // OLD
// function update7DTDlist(msg){
//  let delay = 25000;
//  var interval = setInterval(function(){
//    let site = "https://7daystodie-servers.com/api/?object=servers&element=detail&key=INSERTKEY";
//    fetch('https://7daystodie-servers.com/api/?object=servers&element=detail&key=INSERTKEY').then(response => response.json()).then(json => {
//      let is_online = json.is_online;
//      let online = "";
//      if (is_online === 1){
//        online = "Online";
//      }else{
//        online = "Offline";
//      }
//      let players = json.players;
//      let version = json.version;
//      let map = json.map;
//      fetch("https://www.battlemetrics.com/servers/7dtd/4209109").then(m =>m.text()).then(m => {
//        let time = "";
//        try{
//          let time = m.split("<tr")[4].split("<td>")[1].split("</td>")[0];
//        }catch(e){
//          time = "unable to get";
//        }
//        msg.edit("```7DTD Server Status\n"
//                +"Server status: "+online+"\n"
//                +"Current Map: "+map+"\n"
//                +"Current players: "+players+"/8\n"
//                +"Current Version: "+version+"\n"
//                +"Current Time: "+time+"\n"
//                +"Password Hint: "+"What was it again? 🤔"+"\n```");
//      })
//      bot.channels.cache.get("615206706103975936").setName("7dtd-status:-"+players+"--8");
//    });
//  },delay);
// }
// NEW
function update7DTDlistNew(){
  fetch('https://www.battlemetrics.com/servers/7dtd/6591807').then(response => response.text()).then(body => {
    try{
    let content = JSON.parse(body.split("<div>")[0].split(`json">`)[1].split(`</script><script`)[0]);
    let server = content.servers.servers["6591807"];
    let sevenDaysToDieServerEmbed = new Discord.MessageEmbed()
      .setTitle(` --- ${server.name} --- `)
      .addField(`Connection Info`,`IP: ${server.ip}\nPort: ${server.port}\nStatus: ${server.status}\nCountry: ${server.country}`,true)
      .addField(`Players`,`Online: ${server.players}/${server.maxPlayers}\nUptime:\n 7 days: ${server.uptime7 * 100}%\n30 days: ${server.uptime30 * 100}%`,true)
      .setTimestamp();
    bot.channels.cache.get("701389896555692062").messages.fetch("701389998162837564").then(msg => {msg.edit(sevenDaysToDieServerEmbed);});
    }catch(e){}
  });
  return;
}