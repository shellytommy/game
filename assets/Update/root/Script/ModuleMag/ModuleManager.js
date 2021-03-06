

// ModuleManager
let Module = require("Module") 
let ModuleConst = require("ModuleConst")


let JS_LOG = function(...arg){ 
    console.log("[ModuleManager]",...arg) ; 
}


let ModuleManager = class{
    
    // extends: cc.Component,
    // properties: {  
    //     // 获取包内路径; 需要分别绑定 resources 和 Texture 下资源文件;
    //     asset1: { default: null, type: cc.Asset }, 
    //     asset2: { default: null, type: cc.Asset },
    // },

    constructor(){
        this.onLoad();
    }

    onLoad(){

        var ModuleCom = require("./ModuleCom")
        var UnpackageHelper = require("./UnpackageHelper")

        this._unpackage     = new UnpackageHelper();
        this._ModuleCom     = new ModuleCom();

        // this._HotUIHelper   = this.getComponent("HotUIHelper") 

        this._nativeRootPath = _nativeRootPath;
        JS_LOG("this._nativeRootPath: ", this._nativeRootPath)

    }

    initCom(args){
        let { useHotUpdate } = args 
        this._unpackage.initCom(args)
        
        this._useHotUpdate = useHotUpdate 
        console.log("  this._useHotUpdate ", this._useHotUpdate);
        this._lastReq_VersionInfoTime = 0 //(new Date()).getTime()  // 最后一次检测版本时间
        this._detectNewVersionInterval = 30  // 自动检测版本间隔

        this.modules = {}

        this._local_data_key = ModuleConst.localVersionConfigKey //"_local_gameVersionData1"
        let versionData = cc.sys.localStorage.getItem(this._local_data_key)
        if(!versionData){ 
            versionData = this.createDefaultVersionData() 
        }else {
            versionData = JSON.parse(versionData)
        }
        this._local_Version = versionData

        this._romoteVersion = this.createDefaultVersionData()
        
    }

    execUnpackage(onComplate){
        this._unpackage.execUnpackage(onComplate)
    }

    getNativePath(){
        return this._nativeRootPath
    }

    getWritablePathCash(){
        let writablePath = jsb.fileUtils.getWritablePath() 
        let path_cache  = writablePath + "gamecaches/" //缓存可写路径
        return path_cache;
    }

    reqLoopVersionInfo(){
        if(this._useHotUpdate){
            if(this._reqLoopHandler){ return }
            this._reqLoopHandler = ()=>{
                console.log(" 定时器请求更新 ");
                this.reqVersionInfo()
            }
            this.schedule(this._reqLoopHandler, this._detectNewVersionInterval)
        }
    }

    // 更新AB版本号 , 新包安装解压资源后覆盖版本号
    setLocalAbVersion(verObj){

        let localMap = this._local_Version
        for(let abName in verObj){
            let verStr = verObj[abName]

            if(!localMap.modules[abName]){   // 运营中新增模块
                localMap.modules[abName] = {}
            }
            localMap.modules[abName].resVersion = verStr 
        } 

        cc.sys.localStorage.setItem(this._local_data_key, JSON.stringify(this._local_Version))
    }

    get_LocalVersion(){
        return this._local_Version
    }

    get_RomoteVersion(){
        return this._romoteVersion
    }

    createDefaultVersionData(){
        let ret = {
            clientMin : "1.0.0" , 
            modules : {}
        }   
        return ret 
    }
    
    // 更新所有模块
    hotUpdateAllModule(callback, isShowHotDetectAlert){
        if(!this._useHotUpdate){
            callback && callback();
            return false;
        }

        // 显示正在检测更新提示
        if(isShowHotDetectAlert){
            // this._HotUIHelper.checkNewVersionShow()
        }

        return this.hotUpdateMultiModule(Object.keys(this._romoteVersion.modules), ()=>{ 
            // this._HotUIHelper.checkNewVersionHide()
            callback()
        })

    }

    // 置顶更新模块
    hotUpdateMultiModule(moduleNameArr, callback){
        if(this.isNeedReq_versionInfo()){
            this.reqVersionInfo(()=>{
                this._doHotUpdateMulti(moduleNameArr, callback)
            })
        }else {
            this._doHotUpdateMulti(moduleNameArr, callback)
        } 
    }

    /** 更新 */
    // _doHotUpdateBundle(moduleNameArr,callback){
    //     if(!this._useHotUpdate){
    //         callback && callback();
    //         JS_LOG("Don't need update")
    //         return false;
    //     }
    //     let abUrl = ModuleConst.hotUrl + "remote/" + moduleNameArr[0]
    //     console.log(" abUrl :", abUrl)
    //     cc.assetManager.loadBundle(abUrl, {}, (err,bundle)=>{
    //         if(!err){
    //             console.log("bundle:",bundle)
    //         }
    //     })
    // },

    _doHotUpdateMulti(moduleNameArr, callback){

        if(!this._useHotUpdate){
            callback && callback();
            JS_LOG("Don't need update")
            return false;
        }

        // 大版本太旧
        if(-1 == this._ModuleCom.comVersion(_Gloabal.Client_Version, this._romoteVersion.clientMin )){
            // this._HotUIHelper.showAlertClientTooOld()
            console.log(" 大版本太旧 ")
            return 
        }
        JS_LOG("moduleName_ori:", moduleNameArr)
        moduleNameArr = this.getDependModule(moduleNameArr)
        JS_LOG("moduleName_dep:", moduleNameArr)
        
        /**
         * 
         */
        // isShowHotUI 
        let need_Update  = false 
        let need_Restart = false 

        // 所有module更新完成
        let onAllModuleHotFinish = ()=>{

            JS_LOG("所有module更新完成: ", JSON.stringify(this._local_Version));

            cc.sys.localStorage.setItem(this._local_data_key, JSON.stringify(this._local_Version));

            if(need_Restart){
                // this.scheduleOnce(()=>{ 
                //     // cc.sys.restartVM() 
                //     cc.game.restart();
                // }, 0.1)
                setTimeout(() => { 
                    JS_LOG("cc.game.restart")
                    cc.game.restart();
                }, 100);
            }else {
                callback && callback();
            }
        }

        // 下载 assets bundle 资源
        let needUpdateNames = []
        
        let preloadDir = ()=>{
            JS_LOG("preloadDir:",needUpdateNames)
            this._ModuleCom.sequenceMis(needUpdateNames, ()=>{
                JS_LOG("hot_update_-allPreloadFinish", JSON.stringify( needUpdateNames));
                // 所有任务完成
                onAllModuleHotFinish(); 
                // this._HotUIHelper.hideUpdating(onAllModuleHotFinish)

            }, (curMis, idx, onExec)=>{ 
                // 每个预加载任务
                let curMisIdx = idx+1
                let totalMis = needUpdateNames.length
                let moduleObj = this.modules[needUpdateNames[idx]]
                JS_LOG("needUpdateNames,idx:",needUpdateNames,idx)
                moduleObj.preloadModule((finish, total, item)=>{
                    JS_LOG("hot_update_-onProgress_info_:", curMisIdx, finish, total, item.url )
                    // this._HotUIHelper.onProgress( needUpdateNames[idx] , curMisIdx, totalMis, finish, total)
                }, (items)=>{
                    JS_LOG("hot_update_-preloadOK_:", needUpdateNames[idx])
                    onExec()
                })
            })
        }

        // ------------------------------------------- 顺序下载配置 
        this._ModuleCom.sequenceMis(moduleNameArr, ()=>{
            // 所有配置下载完成
            console.log("所有配置下载完成")
            if(need_Update){
                // this._HotUIHelper.showUpdating(1, needUpdateNames.length)
                // this._HotUIHelper.showHotAlert(need_Restart, ()=>{
                    console.log("preloadDir")
                    preloadDir()
                // })
            }else {
                console.log("onAllModuleHotFinish")
                onAllModuleHotFinish()
            }
            
        }, (curMis, idx, onExec)=>{ 
            // 每个预加载任务
            let moduleName = moduleNameArr[idx]
            let retTemp = {}
            JS_LOG("moduleName: ", moduleName, idx)
            retTemp = this._hotUpdateModule(moduleName, (hot_ret)=>{
                let {haveNewVer, needRestart} = hot_ret
                JS_LOG("moduleName,haveNewVer,needRestart ", moduleName, haveNewVer, needRestart)
                if(haveNewVer) { 
                    need_Update = true 
                    needUpdateNames.push(moduleName)
                }
                if(needRestart) { need_Restart = true }
                onExec()
            }) 
            // ------------------------------------------ 
        })
        
    }

    // 获取依赖模块, 并排序
    getDependModule(names, h){
        h = h || 1
        let rms = this._romoteVersion.modules 
        let ret = {}
        for(let idx in names){
            let n_1 = names[idx]
            ret[n_1] = { name:n_1, priority:rms[n_1].priority}

            let depends = this.getDependModule(rms[n_1].depend || [], h+1)
            for(let j in depends){
                let n_2 = depends[j]
                ret[n_2] = { name:n_2, priority:rms[n_2].priority}
            }
        }
        //排序, 优先级高的先更新 
        if(h==1){
            let minfos = Object.values(ret)
            minfos.sort(function(a,b){  
                if(a.priority > b.priority){ return -1}
                return 1;
            })
            ret = {}
            for(let idx in  minfos){
                ret[minfos[idx].name] = 1
            }
        }

        return Object.keys(ret)
    }

    // 更新到最新版本 
    _hotUpdateModule(moduleName, callback){

        if(!this._useHotUpdate){
            let ret = { haveNewVer:false, needRestart:false };
            callback && callback(ret);
            return ret;
        }

        let local_Ver = this._local_Version.modules[moduleName].resVersion
        let romoteVer = this._romoteVersion.modules[moduleName].resVersion
        let moduleObj = this.modules[moduleName]

        JS_LOG("version_info_data_-local:", JSON.stringify(this._local_Version) )
        JS_LOG("version_info_data_-remote:", JSON.stringify(this._romoteVersion) )

        let ret = { haveNewVer: (local_Ver != romoteVer), needRestart:false }

        let loadVerFunc = (mObj, ver, cb)=>{
            mObj.loadAB(()=>{
                if(local_Ver != romoteVer){
                    this._local_Version.modules[moduleName].resVersion = romoteVer
                    this._local_Version.modules[moduleName].showVer = this._romoteVersion.modules[moduleName].showVer
                    
                }
                cb && cb();
            }, ver)
        }
        if(!moduleObj){
            // 未加载过, 更新后不需要重启
            JS_LOG("未加载过, 更新后不需要重启:",moduleObj,moduleName)
            moduleObj = new Module()
            loadVerFunc( moduleObj.init(moduleName), romoteVer, ()=>{
                this.modules[moduleName] = moduleObj
                callback && callback(ret);
            }) 

        }else {
            // 已加载, 若有更新则更新后重启
            JS_LOG("已加载, 若有更新则更新后重启:",moduleObj,moduleName)
            if(local_Ver == romoteVer){
                callback && callback(ret);
            }else {
                ret.needRestart = true 
                loadVerFunc(moduleObj, romoteVer, ()=>{
                    callback && callback(ret);
                })
            }
        }
        return ret

    }
    // ------------------------------------------------------------
    getBundle(moduleName){
        // JS_LOG("ModuleMag_getbundle__:", moduleName)
        return this.modules[moduleName]._abObj
    }

    getModule(moduleName){
        return this.modules[moduleName]
    }

    addModule(moduleName, cb){
        let module = this.modules[moduleName]
        if(module){ 
            cb(module)
            return module
        }
        this.removeModule(moduleName)

        JS_LOG("load_AB____:", moduleName)

        let moduleObj = new Module()
        moduleObj.init(moduleName, this._useHotUpdate).loadAB(()=>{
            this.modules[moduleName] = moduleObj
            cb && cb(moduleObj)
        })

    }

    removeModule(moduleName){
        let moduleObj = this.modules[moduleName]
        if(!moduleObj){ return }
        moduleObj.releaseAB()
        delete this.modules[moduleName];
    }

    //------------------------------------------------------------------->> 查询新版本
    isNeedReq_versionInfo(){
        if(ModuleConst.reqVersionImmediately){
            return true 
        }

        let curTime = (new Date()).getTime()  
        JS_LOG("is_need_req_ver_:", curTime , this._lastReq_VersionInfoTime)
        if(curTime - this._lastReq_VersionInfoTime > this._detectNewVersionInterval*1000){ 
            return true 
        } 
        return false
    }

    reqVersionInfo(callback){

        if(!this._useHotUpdate){
            callback && callback();
            return false;
        }

        if(this._httpReqHandler){
            this._httpReqHandler.abort()
        }
        let verUrl = ModuleConst.hotUrl + "verconfig.json" + "?renew=" + this._ModuleCom.createUUID() 
        JS_LOG("req_version_url_:", verUrl)

        this._httpReqHandler = this._ModuleCom.makeXMLHttp({url: verUrl, callback:(_args)=>{
            let httpData = _args.retData
            if(!httpData){
                return ;
            }
            this._httpReqHandler = null
            this._romoteVersion = httpData

            JS_LOG("onReqVersion_Info_:", JSON.stringify(httpData) )
            let localMap = this._local_Version
            let remoteMap = httpData
            let needSave = false 

            for(let moduleName in remoteMap.modules){ 

                if(!localMap.modules[moduleName]){   // 运营中新增模块
                    localMap.modules[moduleName] = {}
                }
                if(!localMap.modules[moduleName].showVer){
                    needSave = true 
                    localMap.modules[moduleName].showVer = (remoteMap.modules[moduleName].showVer)
                }
            }

            if(needSave){
                cc.sys.localStorage.setItem(this._local_data_key, JSON.stringify(this._local_Version))
            }

            this._lastReq_VersionInfoTime = (new Date()).getTime()
            callback && callback();
        }}) 
        
    }
    

    //-------------------------------------------------------------------<< 查询新版本

}

module.exports = ModuleManager;