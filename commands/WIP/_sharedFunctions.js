module.exports = {
	getShipStatus: (status) => {
		switch (status.id){
			case 0:
				return "idle";
			case 1:
				return `travelling until ${new Date(staus.FinishAction)}`;
			case 2:
				return `unloading/loading cargo until ${new Date(staus.FinishAction)}`;
			case 3:
				return "Sailing the open ocean";
			default:
				return null;
		}
	}
}