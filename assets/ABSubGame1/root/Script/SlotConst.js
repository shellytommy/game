
let SlotConst = {

	eSpinState : {
		stop 		: 1,
		spining 	: 2,
		stoping 	: 3,
		spinError 	: 4,
	},

	opacity 		: 30,    //透明度
 	frameRate 		: 60,  //帧率

 	itemNum 		: 9,

 	eSlotShap : {	//--台机结构， 3行5列2个面板
		horizontal 	: 3,
		vertical 	: 5,
		Plate 		: 2,
	},

	eSlotCallbackType : { //台机本地状态
		succ 	  : 1,
		dataError : 2,
		sendStart : 3,
		SlotNoRev : 4,
		hideLine  : 5,
		slotStop  : 6,
		result    : 7,
	},

	kSlotTableStop : 0.5,

	CTCEvent:{
        onProcess  : 'ccOnProcess',    //进度通知
    },

};


module.exports = SlotConst


