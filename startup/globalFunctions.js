const fetch = require('node-fetch');
const globCom = require('./../commands/_globalFunctions.js');

module.exports = {
	enabled : 0,
	init : (bot) => {
		globCom.init(bot);
	}
}