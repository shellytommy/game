

let JS_LOG = function(...arg){ 
    cc.log("[SubGame_1]",...arg) ; 
}

let LobbyConst = require("LobbyConst")
JS_LOG("game1_req_lobby_js_:", LobbyConst.testv)

cc.Class({
    extends: cc.Component, 
    properties: {

    },
    onLoad(){
        console.log(" ppppppppppppppppppp ")
    },
    initModule(args){
    	JS_LOG("initModule")
        console.log(" initModuleinitModuleinitModule ")
    	let { lobbyRoot } = args
    	this._lobbyRoot = lobbyRoot
    },

    onBtn_close(){
    	JS_LOG("btn_close")
        console.log(" btn_closebtn_closebtn_closebtn_closebtn_close ")
    	this._lobbyRoot.removeGame_1()
    },

});
