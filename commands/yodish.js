const fetch = require("node-fetch");

module.exports = {
	name: "yodish",
	args: [0,100],
	help: "Converts the input text to yodish.",
	execute: (message,args) => {
		let text = args.join(" ");
		if (text.toLowerCase().includes("everyone") || text.toLowerCase().includes("here")){
			message.channel.send("Nah.");
		}else{
			let conversion = encodeURIComponent(text);
			var resp = await fetch(`http://yoda-api.appspot.com/api/v1/yodish?text=${conversion}`).then(response => response.json()).then(result =>{
				return result;
			});;
		 	message.channel.send(resp.yodish);
		}
	}
}