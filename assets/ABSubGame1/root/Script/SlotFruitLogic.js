let JS_LOG = function(...arg){ 
    console.log("[slotFruitLogic]",...arg) ; 
}
let JS_ERROR = function(...arg){ 
    console.error("[slotFruitLogic]",...arg) ; 
}

let SlotConst = require("SlotConst");

let SlotFruitLogic = function(){
    this.initData();
    this.registerEvent();
},

fruit = SlotFruitLogic.prototype,
g_instance = null;

fruit.initData = function (){
    this.betLineNum  = SlotConst.eSlotConmonData.kSlotMinMultiPerLine;
    this.state       = SlotConst.eSpinState.stop;        //滚动状态还原
}

//网络事件监听
fruit.registerEvent = function(){
    // ryyl.emitter.on(SlotConst.CTCEvent.sendStart,  this.sendStart,        this);
    
};

fruit.unregisterEvent = function(){
    // ryyl.emitter.off(SlotConst.CTCEvent.sendStart,   this);
    
};

fruit.selectLine = function (){
    JS_LOG("selectLine");

    if(this.state  == SlotConst.eSpinState.spining) {
        JS_ERROR("selectLine slot spining");
    }


    this.betLineNum = (this.betLineNum + 1) % (SlotConst.eSlotConmonData.kSlotMaxMultiPerLine + 1);
    if(this.betLineNum < SlotConst.eSlotConmonData.kSlotMinMultiPerLine) this.betLineNum = SlotConst.eSlotConmonData.kSlotMinMultiPerLine;
    
    JS_LOG("this.betLineNum = ", this.betLineNum);
    
    ryyl.emitter.emit(SlotConst.CTCEvent.selectLine);
}

fruit.startGame = function (){
    JS_LOG("startGame");

    ryyl.emitter.emit(SlotConst.CTCEvent.onProcess, {process: SlotConst.eSlotCallbackType.sendStart});

    setTimeout(()=>{ 
        let spinRecv = {
            status      : 0,
            itemList    : [2, 10, 8, 2, 6, 5, 2, 3, 2, 1, 1, 8, 7, 5, 8],//[9, 10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 8, 7, 5, 8],
            scatterWin  : 0,
            linesWin    : 20,
            bonusFree   : 0,
        }

        let _cal = function(...arg){
            this.resultShow(...arg);
        }.bind(this);
        ryyl.emitter.emit(SlotConst.CTCEvent.onProcess, {process: SlotConst.eSlotCallbackType.slotStop, recv : spinRecv, callback: _cal});
    }, 1500);
}

 //result show and animations
fruit.resultShow = function (slotSpanRev) {
    JS_LOG("resultShow");

    let eSpinState      = SlotConst.eSpinState;

    let call = function (t){
        // this.updateSlotState(eSlotState.selectLine)
        //this.updateWinLabel(0) //更新赢钱数字，先注掉后实现
    }.bind(this);

    if(!slotSpanRev || !slotSpanRev.itemList){
        JS_ERROR("resultShow slotSpanRev nill");
        call();
        return
    }

    let scatterWin= slotSpanRev.scatterWin ? slotSpanRev.scatterWin : 0
    let linesWin  = slotSpanRev.linesWin ? slotSpanRev.linesWin : 0
    let bonusFree = slotSpanRev.bonusFree ? slotSpanRev.bonusFree : 0
    let itemList  = slotSpanRev.itemList;
    let fromPos   = slotSpanRev.fromPos ? slotSpanRev.fromPos : 0
    let freeTimes = slotSpanRev.freeTimes ? slotSpanRev.freeTimes : 0
    let freeTotalWin = slotSpanRev.freeTotalWin ? slotSpanRev.freeTotalWin : 0
    let potWin   = slotSpanRev.potWin ? slotSpanRev.potWin : 0

    let topWin = linesWin + scatterWin + potWin;
    if(topWin <= 0 && bonusFree <= 0 && freeTotalWin <= 0) {
        call();
        return;
    }

    let winInfo  = this.getWinInfo(itemList, linesWin);
    let winLines = winInfo.winLines;
    let scatter  = winInfo.winScatters;
    let winBouns = winInfo.winBouns;

    JS_LOG("resultShow winInfo = ", winInfo);

    if(winLines && winLines.length > 0){
        ryyl.emitter.emit(SlotConst.CTCEvent.showWinLine, {winLines: winLines, itemList: itemList});
    }

    //scatter Animation
    if(scatterWin && scatterWin.length > 0){
        // this.slotLineLayer.resultScatterShow(scatter, itemList)
    }

   
    if(bonusFree > 0 && winBouns && winBouns.length > 0){
        // this.slotLineLayer.resultBonusShow(winBouns, itemList)
    }

};

fruit.getWinInfo = function(itemList, linesWin){
    if(!itemList || itemList.length <= 0) {
        JS_ERROR("should not here") 
        return {};
    }
    if(itemList.length != SlotConst.eSlotConmonData.kMaxItemNum){
        JS_ERROR("upsupport item number") 
        return {};
    } 

    let wildItemType = SlotConst.eSlotConmonData.kWildItemType;
    let scatterType  = SlotConst.eSlotConmonData.kSlotScatter;
    let defaultLines = SlotConst.LD_SlotLines;
    let multipleList = SlotConst.LD_SlotMultiple;
    let winLines = [];

    if(!defaultLines || defaultLines.length <= 0 || !multipleList || multipleList.length <= 0){
        JS_ERROR("defaultLines or multipleList is null");
        return;
    }

    // JS_LOG("getWinInfo multipleList = ", multipleList);

    //lines
    if(linesWin > 0){
        for (var i = 0; i < defaultLines.length; i++) {
            let aWinLine    = [];
            aWinLine.items  = [];
            aWinLine.index  = i;

            let lineIndexs  = defaultLines[i]
            let itemType    = -1;
            for (var j = 0; j < lineIndexs.length; j++) {
                let index = lineIndexs[j];
                let thisItemType = itemList[index]
                if(thisItemType == scatterType || thisItemType <= 0) break;

                if (!this.isEqualWild(thisItemType)){
                    if(itemType == -1)
                        itemType = thisItemType;
                    else
                        if(thisItemType != itemType) break;
                }

                aWinLine.items.push(index);
            }

            // JS_LOG("aWinLine", aWinLine);

            let sameNum = aWinLine.items.length - 1;
            aWinLine.itemType = itemType

            if(sameNum < 0) sameNum = 0;

            let muarr    = multipleList[itemType];
            let multiple = (muarr && muarr.length > sameNum) ? muarr[sameNum] : 0;
            // JS_LOG("------------");
            // JS_LOG("itemType", itemType);
            // JS_LOG("sameNum", sameNum);
            // JS_LOG("multiple", multiple);
            // JS_LOG("i", i);
            // JS_LOG("this.betLineNum", this.betLineNum);
            // JS_LOG("------------");

            if(itemType > 0 && sameNum > 0 && multiple > 0 && i < this.betLineNum) {
                winLines.push(aWinLine)
            }
        }
    }

    let scatters = this.getScatter( itemList );
    let winBouns = this.getBonusInfo( itemList );

    return {winLines:winLines, winScatters:scatters, winBouns:winBouns};
}

fruit.isEqualWild = function(itemType){
    let wildItemType = SlotConst.eSlotConmonData.kWildItemType;
    if(wildItemType && itemType && itemType == wildItemType) return true;

    return false
};

fruit.getScatter = function(itemList){
    let winScatters     = [];
    let scatterType     = SlotConst.eSlotConmonData.kSlotScatter
    let multipleList    = SlotConst.LD_SlotMultiple

    for (var i = 0; i < itemList.length; i++) {
        if(itemList[i] == scatterType) winScatters.push(i);
    }

    let scatterNum = winScatters.length;
    if(scatterNum == 0 || multipleList[scatterType][Math.min(scatterNum, 5)] <=0) {
        winScatters = [];
    }

    return winScatters;
};

fruit.getBonusInfo = function(_itemList){
    let bonus       = SlotConst.bonus;
    let bonusLines  = SlotConst.eSlotBonusLines;
    let itemList    = _itemList;
    let ret         = [];

    for (var i = 0; i < bonusLines.length; i++) {
        let line    = bonusLines[i];
        let item    = [];
        let lineLen = line.length;
        for (var j = 0; j < lineLen; j++) {

            let v = line[j]
            let icon = itemList[v];
            item.push({icon:icon, index:v});
        }

        let newArr = item.filter((_item, index, arr)=>{
            return _item.icon == bonus;
        });
        
        // JS_LOG("newArr len = ", newArr.length);

        if(newArr.length >= lineLen) ret.push(item);
    }

    return ret;
};

fruit.get = function (key) {
    return this[key];
};

fruit.set = function (key, value) {
    this[key] = value;
};

fruit.destroy = function(){
    this.initData();
    this.unregisterEvent();
    g_instance = null;
    delete this;
};

module.exports.getInstance = function (){
    if (!g_instance) {
        g_instance = new SlotFruitLogic();
    }
    return g_instance;
};

module.exports.destroy = function () {
    if (g_instance) {
        console.log('销毁数据层');
        g_instance.destroy();
    }
};
