let bot;

module.exports = {
	init: (botInstance) => {
		bot = botInstance;
		
		setInterval(() => {
			bot.emit(events.UPDATE);
		},600000);
	}
}

const events = {
	UPDATE : 'update',
};