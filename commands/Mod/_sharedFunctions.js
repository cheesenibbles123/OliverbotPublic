exports.roleCheckForMutes = function roleCheckForMutes(member,msg){
	let response = true;
	//if commander just do
	if (msg.member.roles.cache.has("401925172094959616")){
		response = false;
	}
	// if admin mutes, target non admin
	if (msg.member.roles.cache.has("402120143364423682") & !(member.roles.cache.has("402120143364423682"))){
		response = false;
	}
	//if mode mutes, target non mod
	if ( (msg.member.roles.cache.has("440514569849536512") & !(msg.member.roles.cache.has("402120143364423682"))) & !(member.roles.cache.has("440514569849536512"))){
		response = false;
	}
	return response;
}