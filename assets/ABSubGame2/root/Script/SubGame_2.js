
let JS_LOG = function(...arg){ 
    console.log("[SubGame_2]",...arg) ; 
}

cc.Class({
    extends: cc.Component, 
    properties: {

    },

    onLoad(){
        JS_LOG(" 添加的测试信息 ")
    },

    initModule(args){
    	JS_LOG("initModule")
    	let { lobbyRoot } = args
    	this._lobbyRoot = lobbyRoot
    },
    onBtn_close(){
    	JS_LOG("btn_close")
    	this._lobbyRoot.removeGame_2()

    },

});