const db = require("./../databaseSetup");
const issueEmbed = require("./../issueEmbed");

//Relevant items in user object
let Inventory = {
	"Materials" : {
		"Basic" : {
			"Wood" : 100,
			"Stone" : 50
		},
		'Advanced' : {
			"Iron" : 20
		}
	},
	"Buildings" : [
		{
			"ID" : 1,
			"Amount" : 1,
			"MaxAmount" : 1
		},
		{
			"ID" : 2,
			"Amount" : 1,
			"MaxAmount" : 2
		}
	],
	"Outfits" : [
		{
			"ID" : 1,
			"Amount" : 10
		},
		{
			"ID" : 2,
			"Amount" : 2
		}
	]
}

exports.handler = function handler(message,command,args){
	let validCommand = true;
	switch (command){
		case "craft":
			craftItem(message,args);
			break;
		case "search":
			search(message,args);
		default:
			validCommand = false;
			break;
	}

	return validCommand;
}

async function search(message,args){
	let item = await findItem(message,args[0]);
	if (item !== null){
		let itemInfo = JSON.parse(item.Info);
		let embed = new Discord.MessageEmbed()
			.setTitle(`${itemInfo.Display_Name}`)
			.setDescription(`${itemInfo.Description}`)
			.addField(`Value`, `Cost: \`${item.Cost_GC}\``)
			.addField(`To Purchase`,`;Purchase \`${item.Name}\``);
		message.channel.send(embed);
	}else{
		message.channel.send(`I was unabled to find an Item with ID: **${args[0]}**`);
	}
}

async function findItem(message,itemToFind){

	let Item;
	let notFound = true;

	let tables = ['Basic_Materials','Complex_Materials','Refined_Materials','Advanced_Materials'];

	for (let table in tables){
		await db.craftingConnectionPool.query(`SELECT * FROM ${table}`, (err,rows) => {
			if (typeof(rows) !== undefined && rows.length > 1){
				for (let i=0; i < rows.length; i++){
					if (rows[i].Name === itemToFind){
						Item = rows[i];
						notFound = false;
						break;
					}
				}
			}
		});
		if (!notFound){
			break;
		}
	}

	if (notFound){
		return null;
	}else{
		return Item;
	}
}

function getInventory(userID){
	db.mainDatabaseConnection.query(`SELECT * FROM User WHERE ID='${userID}'`, (err,rows) => {
		if (typeof(rows) !== undefined && rows.length === 1){
			let inventory = JSON.parse(rows[0].inventory);
			return { "code" : 9, "inventory" : inventory };
		}else if (typeof(rows) === undefined){
			return { "code" : 6};
		}else if (rows.length !== 1){
			return { "code" : 7, "length" : rows.length};
		}else{
			return { "code" : -1};
		}
	});
}

function checkIfUserHas(inventory,itemID){
	for (let item in inventory){
		if (item.Name = itemID){
			return item;
		}
	}
	return null;
}

function checkIfUserMeetsRequirements(inventory, requirements){
	let missingItems = [];
	for (let requirement in requirements){
		let item = checkIfUserHas(inventory,requirement.Name)
		if (item === null){
			missingItems.push({"Name" : requirement.Name, "Amount" : requirement.Amount});
		}else if (item.Amount < requirement.Amount){
			missingItems.push({"Name" : requirement.Name, "Amount" : (requirement.Amount - item.Amount)});
		}	
	}
	return missingItems === [] ? null : missingItems;
}

function output(message,missingRequirements){
	let finalMsg = "Missing items!\n";
	for (let req in missingRequirements){
		finalMsg += `${req.Name} : ${req.Amount}\n`;
	}
	message.channel.send(finalMsg);
}

function removeAmountOfItems(inventory,items){
	for (let item in items){
		for (let i=0; i<inventory.length; i++){
			if (inventory[i].Name === item.Name){
				inventory[i].Amount -= item.Amount;
			}
		}
	}
	return inventory;
}

function giveUserItem(inventory,item){
	let newItem = true;

	for (let i=0; i<inventory.length; i++){
		if (inventory[i].Name === item.Name){
			inventory[i].Amount += 1;
			newItem = false;
		}
	}

	if (newItem){
		inventory.push(item);
	}

	return inventory;
}

async function craftItem(message,args){
	if (args[0]){
		let item = await findItem(message,args[0]);
		let response = await getInventory(message.author.id);

		if (response.code === 9 && item !== null){
			let inventory = response.inventory;

			let requirements = item.Requirements;
			let missingRequirements = checkIfUserMeetsRequirements(inventory,requirements);

			if (missingRequirements === null){

				newInventory = removeAmountOfItems(inventory, requirements);
			}else{
				output(message,missingRequirements);
			}

		}else{
			issueEmbed.grabEmbed(message,response.code,"Crafting item");
		}
	}
}