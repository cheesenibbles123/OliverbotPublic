const events = require("./../structs/events.js");

let bot;

module.exports = {
	enabled: false,
	init: (botInstance) => {
		bot = botInstance;
		
		setInterval(() => {
			bot.emit(events.UPDATE);
		},600000);
	}
}