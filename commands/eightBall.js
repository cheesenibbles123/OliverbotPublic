const glob = require("./_globalFunctions");
const {reply} = require("./_combinedResponses");

module.exports = {
	name: "eightball",
	help: "Find out the awnser to any question",
	executeGlobal: (message,args) => {
		let option = glob.getRandomInt(0,3);
		switch (option){
			case 0:
				reply(event,"Yes",isMessage);
				break;
			case 1:
				reply(event,"No",isMessage);
				break;
			case 2:
				reply(event,"Im not sure 🤔",isMessage);
				break;
			default:
				reply(event,"Effort.",isMessage);
				break;
		}
	}
}
