const fetch = require('node-fetch');

module.exports = {
	enabled : 0,
	init : (bot) => {
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
	}
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