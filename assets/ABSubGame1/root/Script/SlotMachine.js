

let JS_LOG = function(...arg){ 
    console.log("[SlotMachine]",...arg) ; 
}

let JS_ERROR = function(...arg){ 
    console.error("[SlotMachine]",...arg) ; 
}

let SlotConst = require("SlotConst")

ryyl.baseclass.extend({

    properties:{
        itemsNet    : cc.Node,
        iconNode    : cc.Node,
        spIcons     : [cc.SpriteFrame],
        audio_loop  : {
            default: null,
            type: cc.AudioClip,
        },
        audio_stop  : [cc.AudioClip],

    },

    onLoad(){
        JS_LOG("SlotMachine");

        this._slotColGroup  = [];
        this.pointArray     = [];
        this._resultList    = [];
        this._size          = this.itemsNet.getContentSize();   //动画区域size
        this._state         = SlotConst.eSpinState.stop;        //滚动状态还原
        this._oneRoundTime  = 0.18;
        this._eSlotShap     = SlotConst.eSlotShap;
        this._itemNum       = SlotConst.itemNum;
        this._invisibleGroup= [2, 2, 2, 2, 2, 2];

        if(!this._eSlotShap) {
            JS_ERROR("SlotConst.eSlotShap is must not nill");
            return;
        }

        this.regisrterEvent();

    },

    regisrterEvent(){
        ryyl.emitter.on(SlotConst.CTCEvent.onProcess,     this.onProcess,     this);
    },

    unregisrterEvent(){
        ryyl.emitter.off(SlotConst.CTCEvent.onProcess,    this);
    },

    start() { 

        this.itemsNet.stopAllActions();
        this.itemsNet.removeAllChildren();
        this.setUpView(this.itemsNet);

    },

    OnDestroy(){
        this.unregisrterEvent();
    },

    setUpView(view){
        if(this._itemNum < 1){
            JS_ERROR("setUpView error, slot has no items.")
            return;
        }

        let eSlotShap   = this._eSlotShap;
        let itemNum     = this._itemNum;
        let spIcons     = this.spIcons;
        let vertical    = eSlotShap.vertical;
        let plate       = eSlotShap.Plate;
        let horizontal  = eSlotShap.horizontal;
        let _size       = this._size;

        let iconSize = this.iconNode.getContentSize();
        let gap = {
            x : (_size.width - iconSize.width * vertical) / (vertical + 1), 
            y : (_size.height - iconSize.height * horizontal) / (horizontal + 1),
        }

        for (var col = 1; col <= vertical; col++) {

            this._slotColGroup[col] = [];

            for (var group = 1; group <= plate; group++){

                let groupLayer = new cc.Node();
                groupLayer.parent = view;
                groupLayer.y = (group - 1) * _size.height - _size.height / 2;
                groupLayer.x = -_size.width / 2;

                for (var row = 1; row <= horizontal; row++){

                    let icon = cc.instantiate(this.iconNode);
                    let _ra = Math.floor(1 + Math.random() * itemNum);
                    icon.parent = groupLayer;

                    icon.getComponent(cc.Sprite).spriteFrame = spIcons[_ra];
                    
                    icon.tags = row;
                    this.setIcon(icon, col, row, gap, iconSize, group)
                }

                this._slotColGroup[col][group] = groupLayer
            }
        }
    },

    setIcon(icon, col, row, gap, iconSize, group){
        let x = (col - 0.5) * iconSize.width + col * gap.x
        let y = (row - 0.5) * iconSize.height + row * gap.y
        icon.setPosition(cc.v2(x, y));

        let contentSizeWidth    = 100;
        let contentSizeHeight   = 100;
        let kSlotTablePoints    = {
            center      : cc.v2(x, y),
            left        : cc.v2(x- contentSizeWidth/2, y),
            right       : cc.v2(x+ contentSizeWidth/2, y),
            leftUp      : cc.v2(x- contentSizeWidth/2 + 4, y+ contentSizeHeight / 2 - 4),
            leftDown    : cc.v2(x- contentSizeWidth/2 + 4, y- contentSizeHeight / 2 + 4),
            rightUp     : cc.v2(x+ contentSizeWidth/2 - 4, y+ contentSizeHeight / 2 - 4),
            rightDown   : cc.v2(x+ contentSizeWidth/2 - 4, y- contentSizeHeight / 2 + 4),
        }

        let eSlotShap = this._eSlotShap;
        this.pointArray[(col-1) * eSlotShap.horizontal + row] = kSlotTablePoints
    },

    slotStopAnimation(recv, callback){
        let eSpinState = SlotConst.eSpinState;

        this._spinRecv = recv;
        this.itemList  = recv.itemList;
        this._stopCol  = 1;
        this._spinFinishCallback = callback;

        if(this._state == eSpinState.spining){
            this._state = eSpinState.stoping;
        }
    },


    onProcess(data){
        let _process            = data.process;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;
        let recv                = data.recv;

        switch (_process) {
            case eSlotCallbackType.sendStart:
                this.runSlot();
                break;
            case eSlotCallbackType.slotStop:
                this.slotStopAnimation(recv);
                break;
        }

    },

    runSlot(callback){
        let eSlotShap           = this._eSlotShap;
        let eSpinState          = SlotConst.eSpinState;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;

        if(this._state != eSpinState.stop){
            if(callback) callback(eSlotCallbackType.statusError);
            JS_ERROR("should not here");
            return;
        }

        this._state = eSpinState.spining;

        let _resultList = this._resultList;
        for (var i = 0; i < _resultList.length; i++) { // show all icons which was invisible when showing line.
            if(_resultList[i]) _resultList[i].active = true; 
        }
        

        for (var col = 1; col <= eSlotShap.vertical; col++) {
            this.startRollPrepare(col);
        }
        
    },

    startRollPrepare(col){
        let eSlotShap = this._eSlotShap;
        let slotGroup = this._slotColGroup[col];

        for (var group = 1; group <= eSlotShap.Plate; group++) {
            let biggerEase = cc.moveBy(this._oneRoundTime, cc.v2(0, -this._size.height)).easing(cc.easeBackIn());
            slotGroup[group].runAction(biggerEase);
        }

        setTimeout(()=>{ 
            this.rolling(col);
        }, this._oneRoundTime*1.5 * 1000);


        let invisibleIdx = this._invisibleGroup[col];
        let icons        = slotGroup[invisibleIdx].children;

        for (var row = 1; row <= eSlotShap.horizontal; row++) {
            for (var i = 0; i < icons.length; i++) {
                let _icon = icons[i];
                if(_icon && _icon.tags == row) {
                    _icon.stopAllActions();
                    this.resetIconBeforeStart(_icon, col, row);
                    break;
                }
            }
        }
    },

    rolling(col){

        let eSlotShap       = this._eSlotShap;
        let visibleIdx      = this._invisibleGroup[col];
        let horizontal      = eSlotShap.horizontal;
        let invisibleIdx    = this._invisibleGroup[col];
        let eSpinState      = SlotConst.eSpinState;

        this.changeInvisibleGroup(col);
        this.invisibleGroupChangeFrame(col)

        this._slotColGroup[col][invisibleIdx].y = this._size.height;
        this._slotColGroup[col][visibleIdx].y   = 0;

        let child = this._slotColGroup[col][invisibleIdx].children;

        if (!(this._state == eSpinState.stoping && this._stopCol == col)) {
            for (var row = 0; row <= horizontal; row++) {
                let icon;
                for (var i = 0; i < child.length; i++) {
                    if(child[i] && child[i].tags == row) {
                        icon = child[i];
                        break;
                    }
                }

                if(!icon) continue;

                icon.stopAllActions();
                this.resetIconBeforeRoll(icon, col, row);

                if (row == 1){
                    this.iconRollingAction(icon, col, row);
                }
                else if(row == 2){
                    icon.runAction(cc.sequence(
                        cc.delayTime(this._oneRoundTime/horizontal),
                        cc.callFunc(function() {this.iconRollingAction(icon, col, row)}, this),
                    ));
                }
                else if(row == horizontal-1){
                    icon.runAction(cc.sequence(
                        cc.delayTime(this._oneRoundTime/horizontal*2),
                        cc.callFunc(function(){this.iconRollingAction(icon, col, row), this}),
                    ));
                }
            }
        }

        if (this._state == eSpinState.stoping) {
            ryyl.audio.playSoundEffect(this.audio_loop);

            if (this._stopCol == col){
                this.stop(col);
                return;
            }
        }

        let slotGroup = this._slotColGroup[col];

        for (var group = 1; group <= eSlotShap.Plate; group++) {
            slotGroup[group].stopAllActions();
            slotGroup[group].runAction(cc.moveBy(this._oneRoundTime, cc.v2(0, -this._size.height)))
        }

        setTimeout(()=>{ 
            this.rolling(col);
        }, this._oneRoundTime * 1000);
    },

    stop(col){
        let eSlotShap  = this._eSlotShap;
        let eSpinState = SlotConst.eSpinState;
        let eSlotCallbackType = SlotConst.eSlotCallbackType;

        ryyl.audio.playSoundEffect(this.audio_stop[col]);

        let group, actions;
        for (var idx = 1; idx <= eSlotShap.Plate; idx++) {
            group = this._slotColGroup[col][idx]
            if(idx == 1){
                actions = cc.sequence(
                    cc.moveBy(SlotConst.kSlotTableStop, cc.v2(0, -this._size.height / 2)).easing(cc.easeBackOut()),
                    cc.callFunc(function(){
                        this.changeInvisibleGroup(col);
                        let invisibleIdx = this._invisibleGroup[col];
                        this._slotColGroup[col][invisibleIdx].y = -this._size.height/2;
                        
                        this.stopCal(col);

                        this._stopCol = this._stopCol + 1;

                        if(this._state == eSpinState.stoping && col == eSlotShap.vertical) {
                            this._state = eSpinState.stop;
                            this.endCal(eSlotCallbackType.succ);
                        }
                    }, this),
                )
            }
            else{
                actions = cc.moveBy(SlotConst.kSlotTableStop, cc.v2(0, -this._size.height / 2)).easing(cc.easeBackOut())
            }
            
            group.stopAllActions();
            group.runAction(actions);
        }

        let invisibleIdx = this._invisibleGroup[col];
        let icons = this._slotColGroup[col][invisibleIdx].children;
        for (var row = 1; row <= eSlotShap.horizontal; row++) {
            for (var i = 0; i < icons.length; i++) {
                let icon = icons[i];
                if(icon && icon.tags == row){
                    icon.stopAllActions();
                    this.resetIconBeforeStop(icon, col, row);
                    break;
                }
            }
        }
    },

    resetIconBeforeStart(icon, col, row){
        icon.opacity = 255;
    },

    resetIconBeforeStop(icon, col, row){
        icon.opacity = 255;
    },

    resetIconBeforeRoll(icon, col, row){
        icon.opacity = SlotConst.opacity;
    },

    changeInvisibleGroup(col){
        let eSlotShap = this._eSlotShap;

        this._invisibleGroup[col] = (this._invisibleGroup[col] != eSlotShap.Plate ? (eSlotShap.Plate - 1) : eSlotShap.Plate);
    },

    iconRollingAction(icon, col, row){
        let eSlotShap    = this._eSlotShap;
        let oneRoundTime = this._oneRoundTime/eSlotShap.horizontal;

        icon.runAction(cc.sequence(
            cc.fadeTo(oneRoundTime*1.1, 255),
            cc.delayTime(oneRoundTime*1.8),
            cc.fadeTo(oneRoundTime*1.1, SlotConst.opacity)
        ));
    },

    stopCal(col) {

    },

    endCal(...arg){
        if(this._spinFinishCallback){
            this._spinFinishCallback(...arg)
            this._spinFinishCallback = nil
        }
    },

    invisibleGroupChangeFrame(col) {
        let eSlotShap       = this._eSlotShap;
        let spIcons         = this.spIcons;
        let eSpinState      = SlotConst.eSpinState;
        let invisibleIdx    = this._invisibleGroup[col];
        let invisibleGroup  = this._slotColGroup[col][invisibleIdx];
        let child           = invisibleGroup.children;

        for (var row = 1; row <= eSlotShap.horizontal; row++) {
            let icon, frame;
            for (var i = 0; i < child.length; i++) {
                if(child[i] && child[i].tags == row) {
                    icon = child[i];
                    break;
                }
            }
            if(!icon) continue;

            if (this._state == eSpinState.stoping && this._stopCol == col && this.itemList != null) {
                let idx = (col-1)*eSlotShap.horizontal + row - 1;
                frame = spIcons[this.itemList[idx]];
                this._resultList[idx] = icon;
            }
            else{
                let _ra = Math.floor(1 + Math.random() * this._itemNum);
                frame = spIcons[_ra];
            }
            

            icon.getComponent(cc.Sprite).spriteFrame = frame;
        }
    },


    //result show and animations
    resultShow(slotSpanRev, msgCallback, animaCallback){
        let eSpinState      = SlotConst.eSpinState;

        let call = function (t){
            this.updateSlotState(eSlotState.selectLine)
            this.updateWinLabel(0)
            animaCallback()
            msgCallback()
        }
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
        let delayTime = slotSpanRev.delayTime ? slotSpanRev.delayTime : this.noAwardDelay;
        let freeTimes = slotSpanRev.freeTimes ? slotSpanRev.freeTimes : 0
        let freeTotalWin = slotSpanRev.freeTotalWin ? slotSpanRev.freeTotalWin : 0
        let potWin   = slotSpanRev.potWin ? slotSpanRev.potWin : 0

        let topWin = linesWin + scatterWin + potWin;
        if(topWin <= 0 && bonusFree <= 0 && freeTotalWin <= 0) {
            call();
            return;
        }

        let winInfo  = this.getWinInfo(itemList);
        let winLines = winInfo.winLines;
        let scatter  = winInfo.winScatters;
        let winBouns = winInfo.winBouns;

        //scatter Animation
        if(scatterWin > 0){
            // this.slotLineLayer.resultScatterShow(scatter, itemList)
        }

       
        if(bonusFree>0 && winBouns.length > 0){
            // this.slotLineLayer.resultBonusShow(winBouns, itemList)
        }


        setTimeout(()=>{ 
            animaCallback();
        }, delayTime * 1000);

        msgCallback();

    },

    updateSlotState(status){
        // if not status then return end
        // self.deskStatusMgr:updateLocalStatus( status )
    },

    updateWinLabel(win){
        //if self.controlLayer then self.controlLayer:setWinLabel(win or "") end
    },

    getWinInfo(itemList){
        if(!itemList || itemList.length <= 0) {
            JS_ERROR("should not here") 
            return {};
        }
        if(itemList.length != SlotConst.eSlotConmonData.kMaxItemNum){
            JS_ERROR("upsupport item number") 
            return {};
        } 

        return this.getBaseWinInfo(itemList);
    },

    getBaseWinInfo(itemList){
        let wildItemType = SlotConst.eSlotConmonData.kWildItemType
        let scatterType  = SlotConst.eSlotConmonData.kSlotScatter
        let defaultLines = SlotConst.LD_SlotLines ? SlotConst.LD_SlotLines : [];
        let multipleList = SlotConst.LD_SlotMultiple ? SlotConst.LD_SlotMultiple : [];
        let winLines = [];

        //lines
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