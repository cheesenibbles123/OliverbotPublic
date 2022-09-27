module.exports = {
	name: 'ready',
	once: true,
	execute(bot) {
		console.log(`Ready! Logged in as ${bot.user.tag}`);
	}
}