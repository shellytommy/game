
cc.Class({
    extends: cc.Component,

    properties: {
        
        UpdatePrefab: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("login");

        //add update prefab
        let newPrefabLayer = cc.instantiate(this.UpdatePrefab);
        newPrefabLayer.parent = cc.director.getScene();

        ryyl.emitter.on("login.updateend", this.openLogin, this);
        
    },

    onDestory(){
        ryyl.emitter.off("login.updateend",this); 
    },
    
    openLogin() {
        
        ryyl.panel.showAsynPanelByName('login_frame');
        
        ryyl.logon.loginPomelo();
    },


    // update (dt) {},
});
