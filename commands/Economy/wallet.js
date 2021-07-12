const Canvas = require("canvas");
const db = require("./../../startup/database.js");
const Discord = require("discord.js");

module.exports = {
	name: "wallet",
	help: "Displays your bank info.",
	execute: async (message,args) =>{
		let user = await getUserInfo(message,message.author.id);
		if (typeof(user) !== "boolean"){
			let image = await generateImage(user,message.member);
			message.channel.send(image);
		}
	}

}

function getUserInfo(message,id){
	return new Promise((resolve,reject) => {
		db.mainDatabaseConnectionPool.query(`SELECT * FROM inventoryGT WHERE ID=${id}`, (err,rows) => {
			if (rows){
				if (rows.length !== 1){
					message.channel.send("You are not in the database!");
					resolve(false);
				}else{
					let GC = rows[0].giraffeCoins;
					let inv = JSON.parse(rows[0].inventory);
					let assetCount = 0;
					let value = 0;
					let mostValuable = { Name: "", value: 0};
					let walletCard = null;

					inv.forEach(item => {
						assetCount += 1;
						value += item.value;
						if (item.value > mostValuable.value){
							mostValuable.Name = item.properName;
							mostValuable.value = item.value;
						}
						if (item.type === "wallet"){
							walletCard = item.name;
						}
					});

					resolve({ Gc: GC, Count: assetCount, Value: value, MostValuable: mostValuable, WalletCard: walletCard});

				}
			}else{
				message.channel.send("Invalid query detected. Please contact Archie.");
				resolve(false);
			}
		});
	});
}

async function generateImage(data,member){

	let height = 473;
	let width = 860;

	let canvas = Canvas.createCanvas(width,height);
	let ctx = canvas.getContext('2d');

	if (data.WalletCard !== null){
		let background = await Canvas.loadImage(`./walletImages/${data.WalletCard}.png`);
		ctx.drawImage(background, 0, 0, width, height);
	}else{
		let background = await Canvas.loadImage(`./walletImages/woodFrame.png`);
		ctx.drawImage(background, 0, 0, width, height);
	}

	//Display Name
	ctx.font = applyText(canvas, member.displayName);;
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = "center";
	ctx.fillText(member.displayName, width / 2, 90);


	let coins = `GC: ${data.Gc}`;
	let assetValue = `Asset Value: ${data.Value}`;

	//Amount and most valuable
	ctx.font = '40px monospace';
	ctx.fillStyle = '#aaa9ad';
	ctx.fillStyle = '#000000';

	let centre = 250;
	let gap = 70;

	ctx.fillText(coins, width / 2, centre - gap);
	ctx.fillText(assetValue, width / 2, centre);
	ctx.fillText("Most valuable Asset", width / 2, centre + gap);
	ctx.fillText(data.MostValuable.Name, width / 2, centre + gap + 50);

	// Curve edge
	ctx.beginPath();
	ctx.arc(100, 100, 70, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	// Display Avatar
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({format : 'jpg'}));
	ctx.drawImage(avatar, 25, 25, 150, 150);

	let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'wallet.png');
	return attachment;
}

const applyText = (canvas, text) => {
	let ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};

function getLocationsForCard(cardType){
	let showAvatar;
	let avatarpx;

	switch (cardType){
		// Default buisness 1
		case 1:
			showAvatar = true;
			break;
	}

	return {};
}