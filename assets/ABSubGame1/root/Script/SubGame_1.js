

let JS_LOG = function(...arg){ 
    console.log("[SubGame_1]",...arg) ; 
}
let JS_ERROR = function(...arg){ 
    console.error("[SubGame_1]",...arg) ; 
}

let SlotConst = require("SlotConst");

ryyl.baseclass.extend({

    properties:{
        SlotMachine:cc.Prefab,
        SlotLineLayer:cc.Prefab,
        SlotControlLayer:cc.Prefab,
    },

    initModule(args){
        console.log("initModule")
        let { lobbyRoot } = args
        this._lobbyRoot = lobbyRoot
    },

    onLoad(){
        JS_LOG("SubGame_1 onLoad");

        try {
            this.slotLogic = require("SlotFruitLogic").getInstance();
            ryyl.panel.showPanel(this.SlotMachine,      this.node);
            ryyl.panel.showPanel(this.SlotLineLayer,    this.node);
            ryyl.panel.showPanel(this.SlotControlLayer,    this.node);
        } catch (e) {
            console.error(e);
            console.error(JSON.stringify(e));
        }
        
    },

    onBtn_close(){
        JS_LOG("btn_close");
        
        try {
            this.slotLogic.destroy();
            this._lobbyRoot.removeGame_1();
            this.remove();
        } catch (e) {
            console.error(e);
            console.error(JSON.stringify(e));
        }
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
                this.slotLogic.startGame();
                break;
             case "stopSpin":
                
                break;
            case "selectLine":
                this.slotLogic.selectLine();
                break;
        }

    },
    

    // updateSlotState(status){
        // if not status then return end
        // self.deskStatusMgr:updateLocalStatus( status )
    // },

    updateWinLabel(win){
        //if self.controlLayer then self.controlLayer:setWinLabel(win or "") end
    },

    

    
});