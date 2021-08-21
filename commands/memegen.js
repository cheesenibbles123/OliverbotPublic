const fetch = require("node-fetch");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "memegen",
	args: [1,100],
	help: "Generates a meme based off the input",
  usage: "<template>,<caption1>,<caption2>",
  options: [
    {
      name : "input",
      description : "3 fields that contain 1) meme template, 2) top text, 3) bottom text",
      required : true,
      type : 3
    }
  ],
	executeGlobal: (event,args,isMessage) => {
		let contents = args[0].split(",");
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
    let URL = `https://memegen.link/images/${contents[0]}/${contents[1]}/${contents[2]}.jpg`;
    fetch(URL).then(response =>{
        reply(event,response.url,isMessage);
    });
	}
}
