
let JS_LOG = function(...arg){ 
    cc.log("[login]",...arg) ; 
}


require("global");

cc.Class({
    extends: cc.Component,

    properties: {
        
        UpdatePrefab: cc.Prefab,

        LoginPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        JS_LOG("login");

        initGlobal();

        //add update prefab
        let newPrefabLayer = cc.instantiate(this.UpdatePrefab);
        newPrefabLayer.parent = cc.director.getScene();
        this.upPrefab = newPrefabLayer;

        ryyl.emitter.on("login.updateend", this.openLogin, this);


        this.openLogin();
        
    },

    onDestory(){
        ryyl.emitter.off("login.updateend",this); 
    },
    
    openLogin() {
        JS_LOG("openLogin");

        if(this.upPrefab) this.upPrefab.active = false;
        
        let newPrefabLayer = cc.instantiate(this.LoginPrefab);
        newPrefabLayer.parent = cc.director.getScene();
        
        // ryyl.logon.loginPomelo();

    },

    // update (dt) {},
});
