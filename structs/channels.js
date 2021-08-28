const config = require("./../config.json");

module.exports = {
	LOGGING_CHANNEL : config.serverInfo.channels.loggingChannel,
	QUOTES : config.serverInfo.channels.quotes,
}