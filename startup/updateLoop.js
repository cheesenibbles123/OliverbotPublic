const events = require("./../structs/events.js");

let bot;

module.exports = {
	enabled: 0,
	init: (botInstance) => {
		bot = botInstance;
		
		setInterval(() => {
			bot.emit(events.UPDATE);
		},600000);
	}
}