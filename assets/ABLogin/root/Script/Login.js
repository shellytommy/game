
let JS_LOG = function(...arg){ 
    cc.log("[login]",...arg) ; 
}


require("global");

cc.Class({
    extends: cc.Component,

    properties: {
        
        // UpdatePrefab: cc.Prefab,

        LoginPrefab: cc.Prefab,

        moduleLayer : cc.Node , 
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        JS_LOG("login");

        initGlobal();

        //add update prefab
        // let newPrefabLayer = cc.instantiate(this.UpdatePrefab);
        // newPrefabLayer.parent = cc.director.getScene();
        // this._updatePrefab = newPrefabLayer;

        ryyl.emitter.on("gotoLobby", this.reloadLobbyRoot, this);


        this.openLogin();
        
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

    reloadLobbyRoot(){

        if(this._loginPrefab) this._loginPrefab.active = false;
        
        cc.assetManager.loadBundle("ABLobby",  {}, (err, bundle)=> {
            
            if(!err){
                JS_LOG("loadAB_OK_:", this._ABName )
                let abObj = bundle 
                
                abObj.load('root/Scene/LobbyRoot', cc.Prefab, (err, prefab)=>{  // 使用模块资源 

                    if(this._lobbyRootNode){
                        this._lobbyRootNode.destroy()
                    }
                    let lobbyRoot = cc.instantiate(prefab) 
                    this._lobbyRootNode = lobbyRoot
                    this.moduleLayer.addChild(lobbyRoot, 100)
                    lobbyRoot.getComponent("LobbyRoot").initModule()    

                }) 
            }else {
                JS_LOG("load_ab_Err_:", this._ABName, JSON.stringify(err)) 
                
            }
        });

        // _G_moduleMag.addModule("ABLobby", (moduleObj)=>{ // 加载模块

        //     let abObj = moduleObj.getABObj();
        
        //     abObj.load('root/Scene/LobbyRoot', cc.Prefab, (err, prefab)=>{  // 使用模块资源 

        //         // JS_LOG("load_lobby_prefab_:", JSON.stringify(err) )
        //         if(this._lobbyRootNode){
        //             this._lobbyRootNode.destroy()
        //         }
        //         let lobbyRoot = cc.instantiate(prefab) 
        //         this._lobbyRootNode = lobbyRoot
        //         this.moduleLayer.addChild(lobbyRoot, 100)
        //         lobbyRoot.getComponent("LobbyRoot").initModule()    

        //     }) 
        // })
       
    }

    // update (dt) {},
});
