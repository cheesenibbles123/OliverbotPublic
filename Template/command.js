/*
Remove any command attributes that are not in use.
*/

let bot;

module.exports = {
	name : "INSERT_NAME",

	args : [X,Y], // Range between X and Y
	args : X, // Specific argument count

	help : "DOES_THING_X",
	usage : "(optional) <required>",
	category : "CATEGORY",

	interactionSupport : true, // Only required if using executeInteraction()

	options : [], // Array of options for usage with slash commands

	guildOnly : true, // Only required if a command is only to be used within a server

	roles : [], // Role ID's of all roles allowed to access the command
	users : [], // User ID's of users that are allowed to access the command

	init : (botInstance) => {
		// Runs once on initialization with bot user reference
	},
	execute : (message, args) => {
		// Runs for text commands only
	},
	executeInteraction : (interaction, args) => {
		// Runs for slash commands only
	},
	executeGlobal : (event, args, isMessage) => {
		// Runs for both slash and text
	}
}