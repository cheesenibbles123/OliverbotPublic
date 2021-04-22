module.exports = {
	name: "delete-administrators",
	args: 0,
	help: "Deltes the administration team",
	category: "Meme",
	execute: (message,args) => {
		message.channel.send("Deleting the administrators.").then(msg => {
		setTimeout(function(){
			msg.edit("Deleting the administrators..");
			setTimeout(function(){
				msg.edit("Deleting the administrators...");
				setTimeout(function(){
					msg.edit("Administrators deleted.");
				},3000);
			},3000);
		},3000);
	});
	}
}