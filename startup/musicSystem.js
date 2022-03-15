module.exports = {
	enabled : true,
	init : (bot) => {
		bot['audio'] = {
			channel : null,
			isPlaying : false,
			connection : null,
			player : null,
			currentSongStart : null,
			songQueue : []
		}
		/*
		General structure : 
			{
				"songQueue" : [],
				"currentSong" : {
					"URL" : "",
					"Name" : "",
					"Duration" : XX,
					"ThumbnailURL" : ""
				}
			}
		*/
	}
}