const {reply} = require("./_combinedResponses");

module.exports = {
	name: "magic",
	help: "Magic!",
	executeGlobal: (event,args,isMessage) => {
		reply(event,"https://giphy.com/gifs/magical-KFNQuuT1qx7I4",isMessage);
	}
}