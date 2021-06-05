

let JS_LOG = function(...arg){ 
    console.log("[SlotLineLayer]",...arg) ; 
}

let JS_ERROR = function(...arg){ 
    console.error("[SlotLineLayer]",...arg) ; 
}

let SlotConst = require("SlotConst")

ryyl.baseclass.extend({

    properties:{
        
    },


    onLoad(){
        this.autoNum = 0;
        this.SlotFruitLogic = require('SlotFruitLogic').getInstance();

        this.regisrterEvent();
    },

    regisrterEvent(){
        ryyl.emitter.on("longPress", this.longPress, this);
        
    },

    unregisrterEvent(){
        ryyl.emitter.off("longPress", this);

    },

    OnDestroy(){
        this.unregisrterEvent();
    },


    onClick(name, node){
        JS_LOG("name");

        switch (name) {
             case "slotSpin":
                this.slotLogic.startGame();
                break;
             case "slotbet":
                
                break;
            case "slotbetLine":
                this.slotLogic.selectLine();
                break;
        }

    },

    setAuto(auto){
        if(auto) this.autoNum = 1;
        else this.autoNum = 0;

        JS_ERROR("this.autoNum = ", this.autoNum)
    },


    longPress(msg){

        JS_ERROR("longPress msg = ", msg);
        let _tag = msg.eventTag;

        if(_tag != "autoSpin") return;

        if(msg.touchHold){
            this.setAuto(true);

            JS_ERROR("11111")
        }
        else{
            if(this.autoNum == 1) {
                this.autoNum = 2;
                return;
            }

            this.setAuto(false);
           JS_ERROR("22222222222")
        }   

    },
    
});