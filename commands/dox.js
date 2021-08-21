module.exports = {
	name: "dox",
	args: [1,10],
	help: "Doxxes the given target",
	usage: "<target>",
	category: "Meme",
	interactionSupport: true,
	options : [
		{
			name : "target",
			description : "Target to dox ;)",
			type : 3,
			required : true
		}
	],
	execute: (message,args) => {
		if (args.join(' ').includes("@everyone") || args.join(' ').includes("@here")){
			return message.channel.send("No.");
		}
		message.channel.send(`Doxing ${args.join(" ")}...`);
	},
	executeInteraction: (interaction,args) => {
		if (args.join(' ').includes("@everyone") || args.join(' ').includes("@here")){
			return interaction.editReply("No.");
		}
		interaction.editReply(`Doxing ${args.join(" ")}...`);
	}
}