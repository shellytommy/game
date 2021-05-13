

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

    },

    onLoad(){
        JS_LOG("SlotMachine");

        this._slotColGroup  = {};
        this.pointArray     = {};
        this._size          = this.itemsNet.getContentSize();   //动画区域size
        this._state         = SlotConst.eSpinState.stop;        //滚动状态还原
        this._oneRoundTime  = 0.18 * SlotConst.frameRate;
        this._eSlotShap     = SlotConst.eSlotShap;
        this._itemNum       = SlotConst.itemNum;

        if(!this._eSlotShap) {
            JS_ERROR("SlotConst.eSlotShap is must not nill");
            return;
        }

    },

    start() { 

        this.itemsNet.stopAllActions();
        this.itemsNet.removeAllChildren();
        this.setUpView(this.itemsNet);

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

            this._slotColGroup[col] = {};

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
    }

});