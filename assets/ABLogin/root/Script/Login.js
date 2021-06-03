
let JS_LOG = function(...arg){ 
    console.log("[login]",...arg) ; 
}


require("global");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        JS_LOG("login");

        initGlobal();


        ryyl.emitter.on("gotoLobby", this.reloadLobbyRoot, this);




        // this.openLogin();
        
    },

    initModule(){
        JS_LOG("initModule")

    },

    onDestory(){
        ryyl.emitter.off("login.updateend",this); 
        ryyl.emitter.off("gotoLobby",this); 
    },

    openLogin() {
        JS_LOG("openLogin");

        // if(this._updatePrefab) this._updatePrefab.active = false;
        
        let newPrefabLayer = cc.instantiate(this.LoginPrefab);
        newPrefabLayer.parent = cc.director.getScene();
        this._loginPrefab = newPrefabLayer;
        
        // ryyl.logon.loginPomelo();

    },

    update (dt) {

    },
});
