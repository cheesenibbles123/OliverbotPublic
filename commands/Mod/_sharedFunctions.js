const { MODERATOR, ADMINISTRATOR, OWNER } = require("./../../structs/roles");

exports.roleCheckForMutes = function roleCheckForMutes(member,msg){
	let response = true;
	//if commander just do
	if (msg.member.roles.cache.has(OWNER)){
		response = false;
	}
	// if admin mutes, target non admin
	if (msg.member.roles.cache.has(ADMINISTRATOR) & !(member.roles.cache.has(ADMINISTRATOR))){
		response = false;
	}
	//if mode mutes, target non mod
	if ( (msg.member.roles.cache.has(MODERATOR) & !(msg.member.roles.cache.has(ADMINISTRATOR))) & !(member.roles.cache.has(MODERATOR))){
		response = false;
	}
	return response;
}