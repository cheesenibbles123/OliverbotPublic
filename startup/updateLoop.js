const events = require("./../structs/events.js").events;

let bot;

module.exports = {
	enabled: false,
	init: (botInstance) => {
		bot = botInstance;
		
		setInterval(() => {
			bot.emit(events.UPDATE);
		},180000); // 30min
	}
}
