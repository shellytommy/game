

let JS_LOG = function(...arg){ 
    console.log("[SubGame_1]",...arg) ; 
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
                ryyl.emitter.emit(SlotConst.CTCEvent.onProcess, {process: SlotConst.eSlotCallbackType.slotStop, recv : spinRecv});
                break;
            case "selectLine":
                ryyl.emitter.emit(SlotConst.CTCEvent.selectLine);
                break;
        }

    },


    
});