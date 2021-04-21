let bot;

module.exports = {
	name: "help",
	args: [0,2],
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: (message,args) => {
		let embed = new Discord.MessageEmbed()
			.setTitle("Help");

		
	}
}