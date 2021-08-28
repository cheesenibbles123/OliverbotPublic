const config = require("./../config.json");

module.exports = {
	MUTED : config.serverInfo.roles.muted, // Muted role
	MODERATOR : config.serverInfo.roles.serverModerator, // Server moderators
	ADMINISTRATOR : config.serverInfo.roles.serverAdministrator, // Server admins
	OWNER : config.serverInfo.roles.owner // Owners of the discord server
}