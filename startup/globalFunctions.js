const fetch = require('node-fetch');
const globCom = require('./../commands/_globalFunctions.js');

module.exports = {
	enabled : true,
	init : (bot) => {
		globCom.init(bot);
	}
}