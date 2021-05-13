

let JS_LOG = function(...arg){ 
    console.log("[SubGame_1]",...arg) ; 
}

ryyl.baseclass.extend({

    properties:{
        SlotMachine:cc.Prefab,
    },

    initModule(args){
        console.log("initModule")
        let { lobbyRoot } = args
        this._lobbyRoot = lobbyRoot
    },

    onLoad(){
        JS_LOG("SubGame_1 onLoad")
        ryyl.panel.showPanel(this.SlotMachine, this.node);
    },

    onBtn_close(){
        JS_LOG("btn_close");
        this._lobbyRoot.removeGame_1();
        this.remove();
    },

    onBtn_payTableClicked(){
        JS_LOG("btn_close");
    },

    
});