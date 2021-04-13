Simple npm package to allow easier access and usage of blackwake data.

## Install

```text
npm install @cheesenibbles123/blackwakehandler
```

## Usage

```js
const bw = require('@cheesenibbles123/blackwakehandler');
bw.init(/*Your steamAPI key here*/);
let data = await bw.handler('type','steamID64');
```

## Types

- [Overview](#overview)
- [WeaponStats](#weaponstats)
- [ShipStats](#shipstats)
- [ShipWeaponry](#shipweaponry)
- [Maintenance](#maintenance)
- [Misc](#misc)

## Example Usage

```js
const Discord = require("discord.js");
const client = new Discord.Client();
const bw = require('@cheesenibbles123/blackwakehandler');

client.on('ready', () => {
	bw.init(config.steamAPIKey);
});

client.on('message', async message => {
	// Where message.content is a steamID
	let data = await bw.handler('overview', message.content);
});
```

## Response Format + Examples

Success

```js
{
	isvalid : true,
	type : type,
	content : {
		// Resulting Content
	}
}
```

Fail

```js
{
	isvalid : false,
	type : type,
	content : "Error Message"
}
```

### Overview

```js
{
	isValid : true,
	type : 'overview',
	content: {
		playerStats: {
			faveWeapon: { ID: 'acc_nock', Amount: 7146, formatted: 'Nockgun - 7146 \n' },
	    	kills: 60904,
			deaths: 18725,
			score: 53463365,
			prestige: 10,
			level: 848,
			formatted: '60904 kills\n' +
				'18725 deaths\n' +
				'KD of 3.252550066755674\n' +
				'Score: 53463365\n' +
				'Level: (10) 848'
			},
		captainStats: {
			captainWins: 1824,
			captainLosses: 683,
			crewHits: 100342,
			formatted: '1824 wins\n683 losses\nRatio: 2.670571010248902\nCrew Hits: 100342'
		}
  	}
}
```

### WeaponStats

```js
{
	isValid : true,
	type : 'weaponstats',
	content : {
		individual: {
		    acc_mus: 3254,
		    acc_blun: 247,
		    acc_nock: 7146,
		    acc_ann: 231,
		    acc_rev: 1,
		    acc_pis: 713,
		    acc_duck: 4642,
		    acc_mpis: 170,
		    acc_cut: 159,
		    acc_dag: 158,
		    acc_bot: 153,
		    acc_tomo: 158,
		    acc_gren: 287,
		    acc_rap: 2016
		},
		formatted: 'Nockgun - 7146 kills\n' +
		    'Duckfoot - 4642 kills\n' +
		    'Musket - 3254 kills\n' +
		    'Rapier - 2016 kills\n' +
		    'Pistol - 713 kills\n' +
		    'Grenade - 287 kills\n' +
		    'Blunderbuss - 247 kills\n' +
		    'Annley - 231 kills\n' +
		    'Short Pistol - 170 kills\n' +
		    'Cutlass - 159 kills\n' +
		    'Dagger - 158 kills\n' +
		    'Tomohawk - 158 kills\n' +
		    'Bottle - 153 kills\n' +
		    'Revolver - 1 kills\n' +
		    'Total: 19335'
	}
}
```

### ShipStats

```js
{
	isValid : true,
	type : 'shipstats',
	content : {
		ships: {
		    formatted: 'Schooner - 277 wins\n' +
		      'Brig - 135 wins\n' +
		      'Cruiser - 113 wins\n' +
		      'Galleon - 104 wins\n' +
		      'Cutter - 103 wins\n' +
		      'Xebec - 101 wins\n' +
		      'Junk - 68 wins\n' +
		      'Hoy - 62 wins\n' +
		      'Carrack - 35 wins\n' +
		      'Bomb Vessel - 21 wins\n' +
		      'Gunboat - 19 wins\n' +
		      'Bomb Ketch - 9 wins\n' +
		      'Total: 1047',
		    acc_winHoy: 62,
		    acc_winJunk: 68,
		    acc_winGal: 104,
		    acc_winSchoon: 277,
		    acc_brig: 135,
		    acc_xeb: 101,
		    acc_cru: 113,
		    acc_bombv: 21,
		    acc_cutt: 103,
		    acc_bombk: 9,
		    acc_carr: 35,
		    acc_gunb: 19
		  },
		general: {
		    captainWins: 1824,
		    untrackedWins: 777,
		    captainLosses: 683,
		    ratio: 2.670571010248902,
		    formatted: 'Wins: 1824\n - Untracked: 777\nLosses: 683\nWin Rate: 2.670571010248902'
		}
	}
}
```

### ShipWeaponry

```js
{
	isValid : true,
	type : 'shipweaponry',
	content : {
		individual: {
		    acc_can: 14608,
		    acc_grape: 664,
		    acc_arson: 141,
		    acc_ram: 2236,
		    acc_swiv: 7414
		},
		formatted: 'Cannonball - 14608 kills\n' +
		    'Swivel - 7414 kills\n' +
		    'Ramming - 2236 kills\n' +
		    'Grapeshot - 664 kills\n' +
		    'Fireshot - 141 kills\n' +
		    'Total: 25063'
	}
}
```

### Maintenance

```js
{
  isValid: true,
  type: 'maintenance',
  content: {
    individual: {
      acc_rep: 40319,
      acc_pump: 89393,
      acc_sail: 6332,
      acc_noseRep: 4419
    },
    formatted: 'Pumping - 89393 kills\n' +
      'Hole Repairs - 40319 kills\n' +
      'Sail Repairs - 6332 kills\n' +
      'Nose Repairs - 4419 kills\n'
  }
}
```

### Misc

```js
{
  isValid: true,
  type: 'misc',
  content: {
    individual: { acc_head: 2891, acc_sup: 12236 },
    formatted: 'Supplies - 12236 kills\nHeadshots - 2891 kills\n'
  }
}
```