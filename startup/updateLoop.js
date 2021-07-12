const events = require("./../structs/events.js");

let bot;

module.exports = {
	init: (botInstance) => {
		bot = botInstance;
		
		setInterval(() => {
			bot.emit(events.UPDATE);
		},600000);
	}
}