const issueEmbed = require("./issueEmbed");
const config = require("./../config.json");
const db = require("./databaseSetup");

exports.handler = function handler(message,command,args){
	if (message.author.id === config.ownerId){
		switch (command){
			case "restart":
				restart(message);
				break;
			case "do":
				execute(message);
				break;
			case "database":
				datbase(message,args);
				break;
		}
	}else{
		message.channel.send(issueEmbed.grabEmbed(0,null));
	}
}

async function restart(message){
	await message.channel.send("Restarting....");
	db.mainDatabaseConnectionPool.end(function (err){
		if (err) console.log(err);
	});
	db.configurationDatabaseConnectionPool.end(function (err){
		if (err) console.log(err);
	});
	process.exit();
}

async function execute(message){
	try{
		let code = args.join(" ");
		let evaled = eval(code);
		if (typeof evaled !== "string"){
				evaled = require("util").inspect(evaled);
		}
		message.channel.send(clean(evaled), {code:"xl"});
	} catch (err) {
		message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	}
}

function clean(text) {
  	if (typeof(text) === "string"){
    	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	}
  	else{
  		return text;
  	}
}

function database(message,args){
	try{
		if (args[0].startsWith("$")){
			let databaseName = args[0].split(1, args[0].length);
			args = args.shift();
			runDatabaseCommand(message, databaseName, args.join(" "));
		}else if (args[0] === "help"){
			message.channel.send("Current flags:\n `$`database");
		}else{
			runDatabaseCommand(message, mysqlLoginData.database, args.join(" "));
		}
	}catch (err) {
		message.channel.send(err);
	}
}

function runDatabaseCommand(message,database,query){

	db.mainDatabaseConnectionPool.query(query, (err,rows) => {
		if (err){
			message.channel.send(err);
		}
		else{
			let count = 0;
			let responseMsg = "```\n";
			let hasNotSent = true;
			for (let i = 0; i < rows.length; i++){
				if (responseMsg.length >= 1500){
					message.channel.send(responseMsg + "```");
					message.channel.send(`Covers: ${count} / ${rows.length} rows.`);
					hasNotSent = false;
					break;
				}else{
					for (var key of Object.keys(rows[i]))
					{
						if (rows[i].hasOwnProperty(key)){
							if (count < rows.length - 1)
							{
								responseMsg += `${rows[i][key]}, `;
							}else{
								responseMsg += `${rows[i][key]}`;
							}
						}
					}
					responseMsg += "\n";
					count += 1;
				}
			}

			if (hasNotSent){
				message.channel.send(responseMsg);
			}
		}
	});
}