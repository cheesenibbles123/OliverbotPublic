module.exports = {
	name: "botinfo",
	args: 0,
	help: "Displays the bot information",
	roles: ["665939545371574283"],
	execute: (message,args) => {
		let totalSeconds = (bot.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = (totalSeconds % 60).toString();
		seconds = seconds.slice(0,seconds.indexOf(".") + 3);

		hours -= days * 24;
		let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

		let used = process.memoryUsage();
		let ramusage = (parseInt(used.rss) * (10**-6) ).toString();
		ramusage = ramusage.slice(0,ramusage.indexOf(".") + 3);

		let memoryInformation = "";
		for (let key in used) {
		  memoryInformation = memoryInformation + `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\n`;
		}
		if (memoryInformation.length < 1)
		{
			memoryInformation = "N/A";
		}

		let botInfo = new Discord.MessageEmbed()
			.addField(`Overview`,`Uptime: ${uptime}\nRam: ${ramusage}MB\nPlaying Audio: ${audio.isPlaying}`)
			.setTimestamp();

		if (args[0] === "adv"){
			botInfo.addField("Memory Information", `${memoryInformation}`);
		}

		message.channel.send(botInfo);
	}
}