

let JS_LOG = function(...arg){ 
    console.log("[SubGame_1]",...arg) ; 
}
let JS_ERROR = function(...arg){ 
    console.error("[SlotMachine]",...arg) ; 
}

let SlotConst = require("SlotConst");

ryyl.baseclass.extend({

    properties:{
        SlotMachine:cc.Prefab,
        SlotLineLayer:cc.Prefab,
    },

    initModule(args){
        console.log("initModule")
        let { lobbyRoot } = args
        this._lobbyRoot = lobbyRoot
    },

    onLoad(){
        JS_LOG("SubGame_1 onLoad");

        ryyl.panel.showPanel(this.SlotMachine,      this.node);
        ryyl.panel.showPanel(this.SlotLineLayer,    this.node);
    },

    onBtn_close(){
        JS_LOG("btn_close");
        this._lobbyRoot.removeGame_1();
        this.remove();
    },

    onBtn_payTableClicked(){
        JS_LOG("btn_close");
    },


    onClick(name, node){
        JS_LOG("name");

        switch (name) {
            case "slot_rule":
                break;
             case "startSpin":
                ryyl.emitter.emit(SlotConst.CTCEvent.onProcess, {process: SlotConst.eSlotCallbackType.sendStart});
                break;
             case "stopSpin":
                let spinRecv = {
                    status      : 0,
                    itemList    : [9, 10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 8, 7, 5, 8],
                    scatterWin  : 0,
                    linesWin    : 0,
                    bonusFree   : 0,
                }
                ryyl.emitter.emit(SlotConst.CTCEvent.onProcess, {process: SlotConst.eSlotCallbackType.slotStop, recv : spinRecv, callback:function(...arg){this.resultShow(...arg)}.bind(this)});
                break;
            case "selectLine":
                ryyl.emitter.emit(SlotConst.CTCEvent.selectLine);
                break;
        }

    },


     //result show and animations
    resultShow(slotSpanRev){
        JS_LOG("resultShow");

        let eSpinState      = SlotConst.eSpinState;

        let call = function (t){
            // this.updateSlotState(eSlotState.selectLine)
            this.updateWinLabel(0)
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

        if(winLines && winLines.length > 0){
            // this.slotLineLayer.resultScatterShow(scatter, itemList)
        }

        //scatter Animation
        if(scatterWin && scatterWin.length > 0){
            // this.slotLineLayer.resultScatterShow(scatter, itemList)
        }

       
        if(bonusFree > 0 && winBouns && winBouns.length > 0){
            // this.slotLineLayer.resultBonusShow(winBouns, itemList)
        }

    },

    // updateSlotState(status){
        // if not status then return end
        // self.deskStatusMgr:updateLocalStatus( status )
    // },

    updateWinLabel(win){
        //if self.controlLayer then self.controlLayer:setWinLabel(win or "") end
    },

    getWinInfo(itemList, linesWin){
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

        //lines
        if(linesWin > 0){
            for (var i = 1; i <= defaultLines.length; i++) {
                let aWinLine    = [];
                aWinLine.items  = [];
                aWinLine.index  = i;

                let lineIndexs = defaultLines[i]
                let itemType = 0
                for (var j = 0; j < lineIndexs.length; j++) {
                    let index = lineIndexs[j];
                    let thisItemType = itemList[index]
                    if(thisItemType == scatterType || thisItemType <= 0) break;

                    if (!this.isEqualWild(thisItemType)){
                        if(itemType == 0)
                            itemType = thisItemType;
                        else
                            if(thisItemType != itemType) break;
                    }

                    aWinLine.items.push(index);
                }

                let sameNum = aWinLine.items.length;
                aWinLine.itemType = itemType
                if(itemType > 0 && sameNum > 0 && multipleList[itemType][sameNum] > 0 && i <= this.betLineNum) {
                    winLines.push(aWinLine)
                }
            }
        }

        let scatters = this.getScatter( itemList );
        let winBouns = this.getBonusInfo( itemList );

        return {winLines:winLines, winScatters:scatters, winBouns:winBouns};
    },

    isEqualWild(itemType){

        let wildItemType = SlotConst.eSlotConmonData.kWildItemType;
        if(wildItemType && itemType && itemType == wildItemType) return true;

        return false
    },

    getScatter(itemList){
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
    },

    getBonusInfo( _itemList ){
        let bonus       = SlotConst.bonus;
        let bonusLines  = SlotConst.eSlotBonusLines;
        let itemList    = _itemList;
        let allTeam     = [];

        for (var i = 0; i < bonusLines.length; i++) {

            let line = bonusLines[i];
            let item = [];
            for (var j = 0; j < line.length; j++) {

                let v = line[j]
                let icon = itemList[v];
                if(itemList.length >= v) icon = itemList[v];
                item.push({icon:icon, index:v});
            }

            allTeam.push(item);
        }

        let isHaveBunus = function( item ){
            let bounsTeam = [];
            for (var i = 0; i < item.length; i++) {
                let v = item[i];
                if(v && v.icon == bonus){
                    bounsTeam.push(v.index);
                }
            }

            return bounsTeam;
        }

        let ret         = [];
        let _continue   = SlotConst.eSlotConmonData.kBonusCount - 1;
        let total       = SlotConst.eSlotShap.vertical - _continue;

        let insertItem = function( team ){
            for (var i = 0; i < team.length; i++) {
                let v = team[i];
                if(!v) continue;
                for (var j = 0; j < v.length; j++) {
                    ret.push(v[j]);
                }
            }
        }

        let unique = function (str) {
            var newArr = [],
                i = 0,
                len = str.length;
                     
            for(; i < len; i++) {
                var a = str[i];
                if(newArr.indexOf(a) !== -1) {
                    continue;
                }else {
                    newArr[newArr.length] = a;
                }
            }
             
            return newArr;            
        };

        for (var i = 1; i <= total; i++) {
            let item      = allTeam[i];
            let bounsTeam = isHaveBunus( item );
            if(bounsTeam.length > 0){
                let rBonus = [bounsTeam];
                for (var j = i+1; i <= (i + _continue); j++) {
                    let nextItem = allTeam[j];
                    let nextBounsTeam = isHaveBunus( nextItem )
                    if(nextBounsTeam.length > 0){
                        rBonus.push(nextBounsTeam);
                    }
                }

                if(rBonus.length >= SlotConst.eSlotConmonData.kBonusCount){
                    insertItem(rBonus);
                }
            }
        }

        return unique(ret);
    },

    
});