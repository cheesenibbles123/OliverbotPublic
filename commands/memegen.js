const fetch = require("node-fetch");

module.exports = {
	name: "memegen",
	args: [0,100],
	help: "Generates a meme based off the input",
	execute: async (message,args) => {
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
}