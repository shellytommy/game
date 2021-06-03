// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
let JS_LOG = function(...arg){ 
    console.log("[ModuleManager]",...arg) ; 
}

cc.Class({
    extends: cc.Component,

    properties: {
        // 获取包内路径; 需要分别绑定 resources 和 Texture 下资源文件;
        asset1: { default: null, type: cc.Asset }, 
        asset2: { default: null, type: cc.Asset },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        window._nativeRootPath = ""   // native ab根路径 , 以 / 结尾

        //Get resource root path.
        if(cc.sys.isNative){
            let absPath1 = jsb.fileUtils.fullPathForFilename(this.asset1.nativeUrl).replace("//","/")
            let absPath2 = jsb.fileUtils.fullPathForFilename(this.asset2.nativeUrl).replace("//","/")
            let testLen = absPath1.length>absPath2.length? absPath2.length : absPath1.length 

            for(let i=0;i<testLen;i++){
                if(absPath1[i] != absPath2[i]){
                    _nativeRootPath = absPath1.substring(0, i)
                    break
                }
            }
            JS_LOG("_nativeRootPath:", _nativeRootPath )
        }

        // let writablePath = jsb.fileUtils.getWritablePath() + "gamecaches/Update"
        let path_name = ""
        // if(jsb.fileUtils.isDirectoryExist(writablePath)){
        //     path_name = writablePath;
        // }else{
            path_name = 'Update'
        // }
        
        JS_LOG("path_name: ", path_name);

        cc.assetManager.loadBundle(path_name,  {}, (err, bundle)=> {

            if(!err){
                bundle.load('root/Prefab/Update', cc.Prefab, (err, prefab)=>{  // 使用模块资源 
                    let lobbyRoot = cc.instantiate(prefab);
                    lobbyRoot.parent = cc.director.getScene();

                    startGame();

                    _G_moduleMag.initCom({
                        useHotUpdate : cc.sys.isNative,     // 是否启用热更新 
                    }) 
                    
                    //-------------------
                    // 复制包内模块到可读写路径下,避免首次加载模块时从远程完整拉取
                    _G_moduleMag.execUnpackage(()=>{
                        _G_moduleMag.reqVersionInfo(()=>{ // 获取最新版本
                            // //到登录场景
                            this.reloadLoginRoot();
                        })
                    })
                })

                
            }else {
                console.error("error:", JSON.stringify(err));
            }
        });
        
    },

    reloadLoginRoot(){

        let loadAb = ['ABCommon', 'ABLogin', 'ABLobby']
        _G_moduleMag.hotUpdateMultiModule(loadAb,()=>{
            //更新完成，到登陆场景
            _G_moduleMag.addModule("ABLogin", (moduleObj)=>{
                let abObj = moduleObj.getABObj()
                abObj.loadScene('LoginScene',function (err,scene) {
                    if(err){
                        console.error(err.message,err.stack);
                        return;
                    }
                    cc.director.runScene(scene);
                })
            })
        })

    },

    start () {

    },

    onDestroy(){
        JS_LOG(" destory Scene")
    }

    // update (dt) {},
});
