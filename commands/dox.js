module.exports = {
	name: "dox",
	args: [1,10],
	help: "Doxxes the given target",
	usage: "<target>",
	category: "Meme",
	execute: (message,args) => {
		message.channel.send(`Doxing ${args.join(" ")}...`);
	}
}