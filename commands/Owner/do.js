module.exports = {
	name: "do",
	args: [1,200],
	help: "Runs provided text as code",
	users: ["337541914687569920"],
	execute: async (message,args) => {
		try{
			let code = args.join(" ");
			let evaled = eval(code);
			if (typeof evaled !== "string"){
					evaled = require("util").inspect(evaled);
			}
			message.channel.send(clean(evaled), {code:"xl"});
		} catch (err) {
			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
}

function clean(text) {
  	if (typeof(text) === "string"){
    	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	}
  	else{
  		return text;
  	}
}