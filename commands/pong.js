module.exports = {
	name: "pong",
	args: 0,
	help: "Pong!",
	execute: (message,args) => {
		message.react("🏓");
	}
}