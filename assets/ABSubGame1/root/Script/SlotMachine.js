

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

        liuguan: cc.Material,

    },

    onLoad(){
        JS_LOG("SlotMachine");

        this.SlotFruitLogic = require('SlotFruitLogic').getInstance();

        this._slotColGroup  = [];
        this.pointArray     = [];
        this._resultList    = [];
        this._size          = this.itemsNet.getContentSize();   //动画区域size
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
        ryyl.emitter.emit(SlotConst.CTCEvent.initLayer, {pointArray: this.pointArray, spIcons: this.spIcons, iconNode: this.iconNode});
    },

    OnDestroy(){
        this.unregisrterEvent();
    },


    onProcess(data){
        let _process            = data.process;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;
        let recv                = data.recv;
        let callback            = data.callback;

        switch (_process) {
            case eSlotCallbackType.sendStart:
                this.runSlot();
                break;
            case eSlotCallbackType.slotStop:
                this.slotStopAnimation(recv, callback);
                break;
        }

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
                    let _ra = Math.floor(Math.random() * itemNum);
                    icon.parent = groupLayer;

                    icon.getComponent(cc.Sprite).spriteFrame = spIcons[_ra];
                    
                    icon.tags = row;
                    this.setIcon(icon, col, row, gap, iconSize, group)

                    this.playLiuGuang(icon, 0.8);
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
            leftUp      : cc.v2(x- contentSizeWidth/2 + 4, y + contentSizeHeight / 2 - 4),
            leftDown    : cc.v2(x- contentSizeWidth/2 + 4, y - contentSizeHeight / 2 + 4),
            rightUp     : cc.v2(x+ contentSizeWidth/2 - 4, y + contentSizeHeight / 2 - 4),
            rightDown   : cc.v2(x+ contentSizeWidth/2 - 4, y - contentSizeHeight / 2 + 4),
        }

        let eSlotShap = this._eSlotShap;
        this.pointArray[(col-1) * eSlotShap.horizontal + row - 1] = kSlotTablePoints
    },

    slotStopAnimation(recv, callback){
        let eSpinState = SlotConst.eSpinState;

        this._spinRecv = recv;
        this.itemList  = recv.itemList;
        this._stopCol  = 1;
        this._spinFinishCallback = callback;

        if(this.SlotFruitLogic.get("state") == eSpinState.spining){
            this.SlotFruitLogic.set("state", eSpinState.stoping);
        }
    },

    runSlot(callback){
        let eSlotShap           = this._eSlotShap;
        let eSpinState          = SlotConst.eSpinState;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;

        if(this.SlotFruitLogic.get("state") != eSpinState.stop){
            if(callback) callback(eSlotCallbackType.statusError);
            JS_ERROR("should not here");
            return;
        }

        this.SlotFruitLogic.set("state", eSpinState.spining)

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

        let _invisibleGroup = this._invisibleGroup;
        if(!_invisibleGroup) return;
        let eSlotShap       = this._eSlotShap;
        let visibleIdx      = _invisibleGroup[col];
        let horizontal      = eSlotShap.horizontal;
        let invisibleIdx    = _invisibleGroup[col];
        let eSpinState      = SlotConst.eSpinState;

        this.changeInvisibleGroup(col);
        this.invisibleGroupChangeFrame(col)

        this._slotColGroup[col][invisibleIdx].y = this._size.height;
        this._slotColGroup[col][visibleIdx].y   = 0;

        let child = this._slotColGroup[col][invisibleIdx].children;

        if (!(this.SlotFruitLogic.get("state") == eSpinState.stoping && this._stopCol == col)) {
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

        if (this.SlotFruitLogic.get("state") == eSpinState.stoping) {
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

                        if(this.SlotFruitLogic.get("state") == eSpinState.stoping && col == eSlotShap.vertical) {
                            this.SlotFruitLogic.set("state", eSpinState.result)
                            this.endCal(this._spinRecv);
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
            this._spinFinishCallback = null;
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

            if (this.SlotFruitLogic.get("state") == eSpinState.stoping && this._stopCol == col && this.itemList != null) {
                let idx = (col-1)*eSlotShap.horizontal + row - 1;
                frame = spIcons[this.itemList[idx]];
                this._resultList[idx] = icon;
            }
            else{
                let _ra = Math.floor(Math.random() * this._itemNum);
                frame = spIcons[_ra];
            }
            
            icon.getComponent(cc.Sprite).spriteFrame = frame;
        }
    },


    
    playLiuGuang(node, time){
        node.getComponent(cc.Sprite).setMaterial(0, this.liuguan);

        let action = cc.sequence(
            cc.delayTime(time),
            cc.callFunc(function(){
                node.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'))

            }, this),
        )
        node.runAction(action);
    },

    

});