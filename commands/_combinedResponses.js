module.exports = {
	reply: async (event, contents, isMessage) => {
		isMessage ? event.reply(contents) : await event.editReply(contents);
	},
	edit: async (event, contents, isMessage) => {
		isMessage ? event.edit(contents) : await event.editReply(contents);
	},
	new: async (event, contents, isMessage) => {
		isMessage ? event.channel.send(contents) : await event.followUp(contents);
	},
}