
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

    eSlotConmonData : {
		maxPlayerNum 	: 5,
		kSlotScatter 	: 11,
		kSlotTournament : 9,
		kSlotPlaceholder : -1,
	    kSlotMaxMultiPerLine : 9,

		kMaxItemType 	: 11,
		kMaxItemNum 	: 15,
		kWildItemType 	: 1,

		kFruitsBarItems : [10],
		kFruitsBar		: 10,
		KFruitsScale	: 0.8,
		kBonusCount		: 3,
		
	},

	LD_SlotLines : [   //每条线坐标,目前9条线
		[2,5,8,11,14],
		[3,6,9,12,15],
		[1,4,7,10,13],
		[3,5,7,11,15],
		[1,5,9,11,13],
		[3,6,8,10,13],
		[1,4,8,12,15],
		[2,4,8,12,14],
		[2,6,8,10,14],
	],

	LD_SlotMultiple : [  //默认元素奖励倍数配置
		[],
		[0,1,3,15,75],
		[0,0,15,30,150],
		[0,0,20,40,250],
		[0,0,25,50,400],
		[0,0,30,70,550],
		[0,0,35,80,650],
		[0,0,45,100,800],
		[0,0,75,175,1250],
		[0,0,100,200,1750],
		[0,0,5,15,100],
	],

	bonus : 3, //bonus元素

	eSlotBonusLines : [//免费摇条件 连续3列 (原bonus，现改为free )
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[10, 11, 12],
		[13, 14, 15],
	],


};


module.exports = SlotConst


