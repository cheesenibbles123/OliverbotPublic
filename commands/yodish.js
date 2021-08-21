const fetch = require("node-fetch");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "yodish",
	args: [2,100],
	help: "Converts the input text to yodish.",
	usage: "<text>",
	options: [
		{
			name : "text",
			description : "Input text",
			type : 3,
			required : true
		}
	],
	executeGlobal: (event,args,isMessage) => {
		let checkString = args.join(" ").toLowerCase();
		if (checkString.includes("everyone") || checkString.includes("here")){
			return reply("Nah.");
		}
		
		let conversion = encodeURIComponent(text);
		fetch(`http://yoda-api.appspot.com/api/v1/yodish?text=${conversion}`).then(response => response.json()).then(result =>{
			reply(event,result.yodish,isMessage);
		});;
		
	}
}