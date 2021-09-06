const Discord = require("discord.js");
const {reply} = require("./../_combinedResponses");
const { ARCHIE } = require("./../../structs/users.js");

let bot;

module.exports = {
	name: "test",
	help: "Lists all commands",
	users: [ ARCHIE ],
	category: "Owner",
	init: (botInstance) => {
		bot = botInstance;
	},
	execute: async (event,args,isMessage) => {
		let row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageSelectMenu()
					.setCustomId('helpMenu')
					.setPlaceholder('Option...')
					.addOptions([
						{
							label: 'Option A',
							description: 'Option letter A',
							value: 'a'
						},
						{
							label: 'Option B',
							description: 'Option letter B',
							value: 'b'
						}
					])
			);
		reply(event,{content: 'Please select an option below', components: [row]},isMessage);
	}
}