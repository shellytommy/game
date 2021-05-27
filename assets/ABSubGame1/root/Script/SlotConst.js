
let SlotConst = {

	CTCEvent:{
		startGame	: "startGame",


        onProcess  	: 'ccOnProcess',    //进度通知
        initLayer  	: 'initLayer',
        selectLine 	: 'selectLine',
        showWinLine	: 'showWinLine',
        showFreeLine: 'showFreeLine',
        showScatter : 'showScatter',

    },

	eSpinState : {
		stop 		: 1,
		spining 	: 2,
		stoping 	: 3,
		result 		: 4,
	},

	opacity 		: 30,    //透明度
 	frameRate 		: 60,  //帧率
 	showOneTime		: 1.2, //每条线展示时间

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

    eSlotConmonData : {
		maxPlayerNum 	: 5,
		
		kSlotTournament : 9,
		kSlotPlaceholder : -1,
	    kSlotMaxMultiPerLine : 9,
	    kSlotMinMultiPerLine : 1,

		kMaxItemType 	: 10,
		kMaxItemNum 	: 15,

		kWildItemType 	: 0,
		bonus : 2, //bonus元素
		kSlotScatter 	: 10,

	},

	LD_SlotLines : [   //每条线坐标,目前9条线
		[1,4,7,10,13],
		[2,5,8,11,14],
		[0,3,6,9,12],
		[1,4,6,10,14],
		[1,4,8,10,12],
		[2,5,7,9,12],
		[0,3,7,11,14],
		[1,5,7,9,13],
		[1,3,7,11,13],
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

	

	eSlotBonusLines : [//免费摇条件 连续3列 (原bonus，现改为free )
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[9, 10, 11],
		[12, 13, 14],
	],

	iconEffect : {
		0   : "wild",    	//eSlotConmonData.kWildItemType
		10  : "scatter",    //eSlotConmonData.kFruitsBar
		2	: "bonus",   	//bonus
	},


};


module.exports = SlotConst


