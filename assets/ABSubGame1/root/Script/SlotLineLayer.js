

let JS_LOG = function(...arg){ 
    console.log("[SlotLineLayer]",...arg) ; 
}

let JS_ERROR = function(...arg){ 
    console.error("[SlotLineLayer]",...arg) ; 
}

let SlotConst = require("SlotConst")

ryyl.baseclass.extend({

    properties:{
        topContainer    : cc.Node,
        lineArrow       : cc.Node,
        lineDemo        : cc.Node,
        slotTableArrow  : [cc.SpriteFrame],
        slotTableLine   : [cc.SpriteFrame],

    },


    onLoad(){

        this.betLineNum   = SlotConst.eSlotConmonData.kSlotMinMultiPerLine;
        this.effectMap    = [];
        this.showLineNode = [];
        this.lineNode     = [];
        this._state       = SlotConst.eSpinState.stop;

        this.arrowSize  = this.lineArrow.getContentSize();
        this.scrollSize = this.topContainer.getContentSize();
        this.maxLine    = SlotConst.eSlotConmonData.kSlotMaxMultiPerLine;

        this.regisrterEvent();
    },

    regisrterEvent(){
        ryyl.emitter.on(SlotConst.CTCEvent.initLayer,       this.initLayer,             this);
        ryyl.emitter.on(SlotConst.CTCEvent.selectLine,      this.changeSelectedLine,    this);
        ryyl.emitter.on(SlotConst.CTCEvent.onProcess,       this.onProcess,             this);
    },

    unregisrterEvent(){
        ryyl.emitter.off(SlotConst.CTCEvent.initLayer,      this);
        ryyl.emitter.off(SlotConst.CTCEvent.selectLine,     this);
        ryyl.emitter.off(SlotConst.CTCEvent.onProcess,      this);
    },

    OnDestroy(){
        this.unregisrterEvent();
    },

    onProcess(data){
        let _process            = data.process;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;

        switch (_process) {
            case eSlotCallbackType.sendStart:
                this._state  = SlotConst.eSpinState.spining;
                this.hideSelectedLine();
                break;
            case eSlotCallbackType.slotStop:
                this._state  = SlotConst.eSpinState.stop;
                break;
        }

    },

    changeSelectedLine() {
        if(this._state  == SlotConst.eSpinState.spining) {
            JS_ERROR("slot spining");
            return;
        }

        this.betLineNum = (this.betLineNum + 1) % (SlotConst.eSlotConmonData.kSlotMaxMultiPerLine + 1);
        if(this.betLineNum < SlotConst.eSlotConmonData.kSlotMinMultiPerLine) this.betLineNum = SlotConst.eSlotConmonData.kSlotMinMultiPerLine;
        JS_ERROR("this.betLineNum = ", this.betLineNum);

        this.removeResultLineAndNode()
        this.updateLines()
    },

    initLayer(data){
        this.pointArray = data.pointArray;
        JS_LOG("this.pointArray = ", this.pointArray);
        this.updateLines();
    },

    updateLines() {
        //achieve all points
        let pointss = [];
        let defaultLines = SlotConst.LD_SlotLines;

        for (var i = 0; i < defaultLines.length; i++) {
            let item = [];
            let element = defaultLines[i];
            JS_LOG(element);
            for (var j = 0; j < element.length; j++) {
                let _te = element[j];
                item[j] = this.pointArray[_te].center
            }
            pointss[i] = item
        }

        //draw a select line
        let arrT  = this.slotTableArrow;
        let draws = function (lineNum){
            JS_LOG('updateLines draws lineNum = ', lineNum);

            let pointcpp = pointss[lineNum]
            if(!pointcpp) return;

            let node = new cc.Node();
            node.zIndex = lineNum;
            node.setPosition(cc.v2(-this.scrollSize.width / 2, -this.scrollSize.height/2));
            node.parent = this.topContainer;

            let index = lineNum;
            let line  = this.slotTableLine[index];
            if(arrT){

                if(index > arrT.length) index = 1;

                let arrowSize   = this.arrowSize;
                let pos         = cc.v2( -arrowSize.width/6, pointcpp[1].y);
                let arrow       = cc.instantiate(this.lineArrow);
                arrow.getComponent(cc.Sprite).spriteFrame = arrT[index];
                arrow.parent = node;
                arrow.setPosition(pos);
                arrow.zIndex = 1;
                
                let _lineNode = this.drawLine(pos, pointcpp[1], line);
                _lineNode.parent = node;


                for (var i = 1; i < pointcpp.length - 1; i++) {
                    let _lineNode1    = this.drawLine(pointcpp[i], pointcpp[i+1], line);
                    _lineNode1.parent = node;
                }

                let lastPoint  = pointcpp[pointcpp.length - 1];
                let extLen     = this.scrollSize.width / 10;
                let _lineNode2 = this.drawLine(lastPoint, cc.v2(lastPoint.x + extLen, lastPoint.y), line);
                _lineNode2.parent = node;
                this.lineNode[lineNum] = node;   //add one node control
            }
        }.bind(this)

        //update and creat all select lines
        for (var i = 0; i < this.maxLine; i++) {
            let node = this.lineNode[i];
            if(i <= this.betLineNum - 1){
                if(node == null) draws(i);
                else node.active = true;
            }
            else
                if(node != null)node.active = false;
            
        }
    },

    //弧度radian --> 角度degree 
    rad2deg(r) {
        var degree = r * 180 / Math.PI;
        return degree;
    },


    //draw one line(point to point)
    drawLine(point1, point2, imgName){
        if(point2.x < point1.x){
            let temp = point2
            point2 = point1
            point1 = temp
        }

        let contendSizeX = point2.x - point1.x + 2;
        let line = cc.instantiate(this.lineDemo);
        line.getComponent(cc.Sprite).spriteFrame = imgName;

        if(point1.x != point2.x){
            let degree = this.rad2deg(Math.atan((point2.y-point1.y)/(point2.x-point1.x)));
            if(point2.y != point1.y){
                line.rotation = -degree;
                contendSizeX  = Math.sqrt(Math.pow(point2.y-point1.y, 2) + Math.pow(point2.x-point1.x, 2)) + 1.5;  //Math.pow(point2.x-point1.x, 2) 3的二次方
            }
        }
        else{
            contendSizeX = Math.sqrt(Math.pow(point2.y-point1.y, 2) + Math.pow(point2.x-point1.x, 2)) + 1.5
            if(point2.y > point1.y) 
                line.rotation = -90;
            else if(point2.y < point1.y)
                line.rotation = 90;

        }

        line.setContentSize(cc.size(contendSizeX, 7));
        line.setPosition(point1);

        return line
    },

    //remove all result Show lines and actions
    removeResultLineAndNode(){

        for (var i = 0; i < this.showLineNode.length; i++) {
            let v = this.showLineNode[i];
            v:stopAllActions()
            v:removeFromParentAndCleanup(true)
        }

        for (var i = 0; i < this.effectMap.length; i++) {
            let effect = this.effectMap[i];
            effect:removeFromParentAndCleanup(true)
            // this.callback(i, true)
        }

        this.effectMap      = [];
        this.showLineNode   = [];
    },

    resultBonusShow(bonusList, itemList){
        this.resultScatterShow(bonusList, itemList, true)
    },

    resultScatterShow(scatterList, itemList, isBonus){
        if(!scatterList){
            JS_ERROR('resultScatterShow scatterList null');
            return;
        }

        for (var i = 0; i < scatterList.length; i++) {
            let v = scatterList[i];
            this.playIconEffect(v,itemList, isBonus);
        }
    },

    playIconEffect(index, itemList, isBonus){
        if(!itemList) {
            JS_ERROR("should not here");
            return;
        }

        // let _eff = this.effectMap[index];
        // if(!_eff){
        //     let iconIndex = itemList[index];
        //     if (iconIndex == SlotConst.bonus && !isBonus) return;

        //     let effMap  = this.iconEffect.map or {}
        //     let effName = this.iconEffect.effectName
        //     let effectAction = effMap[iconIndex]

        //     if effName and effectAction then
        //         let effect = LCEffectObject:create(effName)
        //         effect:setAutoPlay(false)
        //         effect:setAutoDelete(false)
        //         effect:play(effectAction)
        //         effect:setPosition(this.pointArray[index].center)
        //         if index==2 or index==5 or index==8 or index==11 or index==14 then
        //             effect:setScale(this.midScale)
        //         else
        //             effect:setScale(this.sideScale)
        //         end
        //         this.topContainer:addChild(effect)
        //         this.effectMap[index] = effect
        //         this.callback(index, false)
        //     end
        // }
    },

    //hide all select lines
    hideSelectedLine(){
        for (var i = 0; i < this.lineNode.length; i++) {
            this.lineNode[i].active = false
        }
    }
    
});