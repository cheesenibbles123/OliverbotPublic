exports.handler = function handler(channel,user,content,isDm){
	if (isDm){
		channel.send(content);
	}else{
		user.send(content);
	}
}