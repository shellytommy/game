

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
        lineKuang       : cc.Node,
        slotTableArrow  : [cc.SpriteFrame],
        slotTableLine   : [cc.SpriteFrame],
        slotTableKuang  : [cc.SpriteFrame],
        lineWin : {
            default: null,
            type: cc.AudioClip,
        },
        liuguan: cc.Material,

    },


    onLoad(){

        this.SlotFruitLogic = require('SlotFruitLogic').getInstance();
        this.effectMap    = [];
        this.showLineNode = [];
        this.lineNode     = [];

        this.arrowSize  = this.lineArrow.getContentSize();
        this.scrollSize = this.topContainer.getContentSize();
        this.maxLine    = SlotConst.eSlotConmonData.kSlotMaxMultiPerLine;

        this.regisrterEvent();
    },

    regisrterEvent(){
        ryyl.emitter.on(SlotConst.CTCEvent.initLayer,       this.initLayer,             this);
        ryyl.emitter.on(SlotConst.CTCEvent.selectLine,      this.changeSelectedLine,    this);
        ryyl.emitter.on(SlotConst.CTCEvent.onProcess,       this.onProcess,             this);
        ryyl.emitter.on(SlotConst.CTCEvent.showWinLine,     this.resultLinesShow,       this);
        ryyl.emitter.on(SlotConst.CTCEvent.showFreeLine,    this.showFreeLine,          this);
        ryyl.emitter.on(SlotConst.CTCEvent.showScatter,     this.showScatter,          this);
    },

    unregisrterEvent(){
        ryyl.emitter.off(SlotConst.CTCEvent.initLayer,      this);
        ryyl.emitter.off(SlotConst.CTCEvent.selectLine,     this);
        ryyl.emitter.off(SlotConst.CTCEvent.onProcess,      this);
        ryyl.emitter.off(SlotConst.CTCEvent.showWinLine,    this);
        ryyl.emitter.off(SlotConst.CTCEvent.showFreeLine,   this);
        ryyl.emitter.off(SlotConst.CTCEvent.showScatter,    this);

    },

    OnDestroy(){
        this.unregisrterEvent();
    },

    onProcess(data){
        let _process            = data.process;
        let eSlotCallbackType   = SlotConst.eSlotCallbackType;

        switch (_process) {
            case eSlotCallbackType.sendStart:
                this.hideSelectedLine();
                break;
            case eSlotCallbackType.slotStop:
                break;
        }

    },

    changeSelectedLine(betLineNum) {
        this.removeResultLineAndNode()
        this.updateLines()
    },

    resultLinesShow(data){
        JS_LOG("resultLinesShow")

        let winLines = data.winLines;
        let itemList = data.itemList;
        let eSpinState = SlotConst.eSpinState;

        if(!winLines || winLines.length <= 0){
            JS_ERROR('resultLinesShow winLines is null');
            return;
        }

        ryyl.audio.playSoundEffect(this.lineWin);

        //show win select lines
        let step1 = function(_winLines, _lineNode){
            for (var i = 0; i < _winLines.length; i++) {
                let lines = _winLines[i];
                let node  = _lineNode[lines.index];

                if(node) node.active = true;

                let _items = lines.items;
                for (var j = 0; j < _items.length; j++) {
                    let index = _items[j]
                    this.playIconEffect(index, itemList)
                }
            }
        }.bind(this);

        //winAnimation CCCallFuncN
        let showTimes = 0;
        let nextShowCal = function(_winLines, _lineNode){
            if(showTimes < _winLines.length){
                let lines = _winLines[showTimes];
                let node  = _lineNode[lines.index];

                let _items = lines.items;
                for (var j = 0; j < _items.length; j++) {
                    let index = _items[j]
                    this.playIconEffect(index, itemList)
                }

                if(node){
                    node.active = true;
                    node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function() {node.active = false;}.bind(this))));
                }
            }

            showTimes = showTimes + 1;
            if(showTimes >= _winLines.length){
                showTimes = showTimes % (_winLines.length);
            }

            setTimeout(function(){ 
                if(!this.resultWinLine) return;
                nextShowCal(_winLines, _lineNode);
            }.bind(this), SlotConst.showOneTime * 1000);

        }.bind(this);

        step1(winLines, this.lineNode);

        //win lines animations
        setTimeout(function(){ 

            this.hideSelectedLine();
            this.drawShowLine(winLines);

            if(this.SlotFruitLogic)this.SlotFruitLogic.set("state", eSpinState.stop);

            this.resultWinLine = true;
            nextShowCal(winLines, this.showLineNode);
        }.bind(this), SlotConst.showOneTime * 1000);

    },

    showFreeLine(data){
        JS_LOG("showFreeLine");

        let _winBouns = data.winBouns;
        let _itemList = data.itemList;

        this.resultBonusShow(_winBouns, _itemList);
    },

    showScatter(data){
        JS_LOG("showScatter");

        let _scatter  = data.scatter;
        let _itemList = data.itemList;

        this.resultScatterShow(_scatter, _itemList);
    },

    initLayer(data){
        this.pointArray = data.pointArray;
        this.spIcons    = data.spIcons; 
        this.iconNode   = data.iconNode;
        JS_LOG("this.pointArray = ", this.pointArray);
        this.updateLines();
    },

    updateLines() {
        JS_LOG("updateLines");

        //achieve all points
        let pointss = [];
        let defaultLines = SlotConst.LD_SlotLines;

        for (var i = 0; i < defaultLines.length; i++) {
            let item = [];
            let element = defaultLines[i];
            // JS_LOG("updateLines i ", i, element);
            for (var j = 0; j < element.length; j++) {
                let _te = element[j];
                item[j] = this.pointArray[_te].center
            }
            pointss[i] = item
        }

        JS_LOG("updateLines pointss = ", pointss);

        //draw a select line
        let arrT  = this.slotTableArrow;
        let draws = function (lineNum){
            // JS_LOG('updateLines draws lineNum = ', lineNum);

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
                let pos         = cc.v2( -arrowSize.width/6, pointcpp[0].y);
                let arrow       = cc.instantiate(this.lineArrow);
                arrow.getComponent(cc.Sprite).spriteFrame = arrT[index];
                arrow.parent = node;
                arrow.setPosition(pos);
                arrow.zIndex = 1;
                
                let _lineNode = this.drawLine(pos, pointcpp[0], line);
                _lineNode.parent = node;


                for (var i = 0; i < pointcpp.length - 1; i++) {
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

        // JS_LOG("updateLines this.maxLine = ", this.maxLine);
        // JS_LOG("updateLines this.lineNode = ", this.lineNode);

        //update and creat all select lines
        let _betLineNum = this.SlotFruitLogic.get("betLineNum");
        for (var i = 0; i < this.maxLine; i++) {
            let node = this.lineNode[i];
            if(i < _betLineNum){
                if(node == null) {
                    draws(i);
                }
                else {
                    node.stopAllActions();
                    node.active = true;
                }
            }
            else{
                if(node != null)node.active = false;
            }
            
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
                line.angle = degree;
                contendSizeX  = Math.sqrt(Math.pow(point2.y-point1.y, 2) + Math.pow(point2.x-point1.x, 2)) + 1.5;  //Math.pow(point2.x-point1.x, 2) 3的二次方
            }
        }
        else{
            contendSizeX = Math.sqrt(Math.pow(point2.y-point1.y, 2) + Math.pow(point2.x-point1.x, 2)) + 1.5
            if(point2.y > point1.y) 
                line.angle = 90;
            else if(point2.y < point1.y)
                line.angle = -90;

        }

        line.setContentSize(cc.size(contendSizeX, 7));
        line.setPosition(point1);

        return line;
    },

    //remove all result Show lines and actions
    removeResultLineAndNode(){

        for (var i = 0; i < this.showLineNode.length; i++) {
            let v = this.showLineNode[i];
            if(!v)continue;
            v.stopAllActions()
            v.removeFromParent()
        }

        for (var i = 0; i < this.effectMap.length; i++) {
            let effect = this.effectMap[i];
            if(!effect) continue;
            effect.removeFromParent()
            // this.callback(i, true)
        }

        this.resultWinLine = false;

        this.effectMap      = [];
        this.showLineNode   = [];
    },

    resultBonusShow(bonusList, itemList){
        JS_LOG("resultBonusShow ", bonusList);

        for (var i = 0; i < bonusList.length; i++) {
            let v = bonusList[i];
            let t = [];
            for (var j = 0; j < v.length; j++) {
                t.push(v[j].index);
            }
            this.resultScatterShow(t, itemList, true)
        }
        
    },

    resultScatterShow(scatterList, itemList, isBonus){
        JS_LOG("resultScatterShow scatterList = ", scatterList);

        if(!scatterList){
            JS_ERROR('resultScatterShow scatterList null');
            return;
        }

        for (var i = 0; i < scatterList.length; i++) {
            let v = scatterList[i];
            this.playIconEffect(v, itemList, isBonus);
        }
    },

    playIconEffect(index, itemList, isBonus){
        if(!itemList) {
            JS_ERROR("should not here");
            return;
        }

        let iconIndex = itemList[index];

        let addEffIcon = function(_iconIndex, _index){
            if(!this.iconNode) return;
            let icon = this.effectMap[_index];
            if(!icon){
                icon = cc.instantiate(this.iconNode);
                icon.getComponent(cc.Sprite).spriteFrame = this.spIcons[_iconIndex];
                let _pos = this.pointArray[_index].center;
                icon.x = -this.scrollSize.width / 2 + _pos.x;
                icon.y = -this.scrollSize.height / 2 + _pos.y;
                icon.parent   = this.topContainer;
            }

            this.effectMap[_index] = icon;
            return icon;
        }.bind(this)


        let _effName = SlotConst.iconEffect[iconIndex];

        // JS_LOG("iconIndex ", iconIndex);
        // JS_LOG("_effName ", _effName);

        if(_effName){
            let _icon     = addEffIcon(iconIndex, index);
            if(!_icon) return;
            let _effect   = _icon.getComponent(cc.Animation);
            let animState = _effect.play(_effName);
            animState.repeatCount = 1;

            this.playLiuGuang(_icon, 0.8);
            
        }
        
    },

    //hide all select lines
    hideSelectedLine(){
        JS_LOG("hideSelectedLine");

        let _lineNode = this.lineNode;
        if(!_lineNode) return;
        for (var i = 0; i < _lineNode.length; i++) {
            if(_lineNode[i])_lineNode[i].active = false
        }
    },

    //draw show lines
    drawShowLine(lines, visible){
         JS_LOG("drawShowLine lines = ", lines);

        if(!lines) return;

        if(visible == null) visible = false;

        let arrT = this.slotTableArrow;

        // JS_LOG("drawShowLine 1111111");

        let draws = function(winLineInfo){

            JS_LOG("drawShowLine draws winLineInfo = ", winLineInfo);

            let index = winLineInfo.index
            let items = winLineInfo.items

            let pointss = [];
            let defaultLines = SlotConst.LD_SlotLines;
            let _vertical    = SlotConst.eSlotShap.vertical;
            let _pointArray  = this.pointArray;

            if(!_pointArray || !defaultLines) {
                JS_ERROR("_pointArray or defaultLines null");
                return;
            }
            for (var i = 0; i < _vertical; i++) {
                let de = defaultLines[index][i];
                if(de == null) continue;
                let po = _pointArray[de];
                if(po == null) continue;
                pointss.push(po);
            }

            let node = new cc.Node();
            node.x = -this.scrollSize.width / 2;
            node.y = -this.scrollSize.height / 2;
            node.parent = this.topContainer;

            if(arrT){
                let child  = this.slotTableLine[index];
                let childk = this.slotTableKuang[index];

                // _index = index
                // if(_index > arrT.length) _index = 1;

                if(!pointss[0]) return;

                let arrowSize   = this.arrowSize;
                let pos         = cc.v2( -arrowSize.width/6, pointss[0].center.y)
                let arrow       = cc.instantiate(this.lineArrow);
                arrow.getComponent(cc.Sprite).spriteFrame = arrT[index];
                arrow.parent = node;
                arrow.setPosition(pos);
                arrow.zIndex = 1;

                let _line = this.drawLine(pos, pointss[0].left, child);
                _line.parent = node;

                let _len  = pointss.length;
                let _iLen = items.length;
                for (var i = 0; i < _len; i++) {
                    if(i < _iLen){
                        let center = pointss[i].center;
                        let nextPo = pointss[i+1];

                        if(nextPo && i + 1 < _iLen){
                            let nextCenter = nextPo.center;
                            let startPoint = pointss[i].right;

                            if(nextCenter.y == center.y){
                                startPoint      = pointss[i].right;
                                nextCenter      = nextPo.left;
                            }
                            else if(nextCenter.y < center.y){
                                startPoint      = pointss[i].right;
                                nextCenter      = nextPo.leftUp;
                                nextCenter.y    = nextCenter.y;
                                startPoint      = cc.v2(startPoint.x, startPoint.y);
                            }
                            else {
                                startPoint      = pointss[i].right;
                                nextCenter      = nextPo.leftDown;
                                nextCenter.y    = nextCenter.y;
                                startPoint      = cc.v2(startPoint.x, startPoint.y);
                            }

                            if(i+1 > _iLen){
                                nextCenter = nextPo.center
                            }
                            
                            let _line2 = this.drawLine(startPoint, nextCenter, child);
                            _line2.parent = node;
                        }

                        let kuang = cc.instantiate(this.lineKuang);
                        kuang.getComponent(cc.Sprite).spriteFrame = childk;
                        kuang.setPosition(cc.v2(center.x, center.y));
                        kuang.parent = node;
                    }
                    else {
                        let _in = i - 1;
                        let pointPro = pointss[_in];
                        if(!pointPro) break;

                        let startPoint = (i == _iLen) ? pointPro.right : pointPro.center;
                        let nextPoint  = pointss[i].center;

                        let _line2 = this.drawLine(startPoint, nextPoint, child);
                        _line2.parent = node; 
                    }
                }

                //尾巴部分的线
                if(_len != _iLen){
                    let _pLen       = _len - 1;
                    let lastPoint   = pointss[_pLen];
                    let startPoint  = lastPoint.center;
                    let endPoint    = lastPoint.right;

                    let _line3 = this.drawLine(startPoint, endPoint, child);
                    _line3.parent = node; 
                }

                node.active = visible;

                //node:runAction(CCSequence:createWithTwoActions(CCDelayTime:create(1), CCHide:create()))
                this.showLineNode[index] = node;
            }
        }.bind(this);


        let _showLineNode = this.showLineNode;
        if(!_showLineNode) _showLineNode = [];
        for (var i = 0; i < _showLineNode.length; i++) {
            let node = _showLineNode[i];
            if(!node) continue;
            node.stopAllActions();
            node.removeFromParent();
        }
     
        this.showLineNode = [];


        for (var i = 0; i < lines.length; i++) {
            let winLineInfo = lines[i];
            draws(winLineInfo);
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