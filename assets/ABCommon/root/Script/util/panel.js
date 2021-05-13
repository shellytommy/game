
let Panel = function () { this.resetData(); }, panel = Panel.prototype, g_instance = null
    
panel.resetData = function () {
    this.curScenePrefabDict = {};
    this.publicPanelDict    = {};
    this.otherPanelDict     = {};

    this.curScenePrefab     = {};
    this.publicPrefab       = {};
    this.otherAsynPrefab    = {};
    this.releasePrefab      = {};

    this.iconList = {};

    this.pngMap = {};
};
/**
 * @param prefab 界面预制
 * @Explain 打开一个界面
 */
panel.showPanel = function (prefab, _fatherNode, tag) {
    try{
        if(!_fatherNode) _fatherNode = cc.director.getScene();
        if(!_fatherNode.name) return;
        let newPrefabLayer = cc.instantiate(prefab);
        newPrefabLayer.parent = _fatherNode;
        if (tag) {
            let script = newPrefabLayer.getComponent(newPrefabLayer.name);
            script.set("fromTag", tag);
        }

        // let _name = newPrefabLayer.name; 
        // console.log("_name_name_name_name = ", _name)
        // if(_name)this.curScenePrefab[_name] = prefab;

        // console.log("showPanel newPrefabLayer = ", newPrefabLayer)
        return newPrefabLayer;
    }
    catch (e){
        console.error("实例化预制体异常！", e);
        console.error("prefab name", prefab.name);
        console.error("prefab", prefab);
        console.error("_fatherNode", _fatherNode);
    }

};

/**
 * @param panelName 界面预制名称
 * @Explain 打开一个界面
 */
panel.showPanelByName = function (panelName, parent, tag) {

    parent = parent || cc.director.getScene();

    return new Promise((resolve, reject) => {
        if (this.publicPrefab.hasOwnProperty(panelName)) {
            let prefab = this.publicPrefab[panelName];
            resolve(this.showPanel(prefab, parent, tag)); 
        }
        else if (this.curScenePrefab.hasOwnProperty(panelName)) {
            let prefab = this.curScenePrefab[panelName];
            resolve(this.showPanel(prefab, parent, tag)); 
        }
        else if (this.otherAsynPrefab.hasOwnProperty(panelName)) {
            let prefab = this.otherAsynPrefab[panelName];
            resolve(this.showPanel(prefab, parent, tag)); 
        }

        else if (this.curScenePrefabDict.hasOwnProperty(panelName)) {
            ryyl.fileutil.readPrefab( this.curScenePrefabDict[panelName] ).then(prefab => {
                this.curScenePrefab[panelName] = prefab;
                resolve(this.showPanel(prefab, parent, tag)); 
            });
        }
        else if (this.publicPanelDict.hasOwnProperty(panelName)) {
            ryyl.fileutil.readPrefab( this.publicPanelDict[panelName] ).then(prefab => {
                this.publicPrefab[panelName] = prefab;
                resolve(this.showPanel(prefab, parent, tag)); 
            });
        }
        else if (this.otherPanelDict.hasOwnProperty(panelName)) {
            ryyl.fileutil.readPrefab( this.otherPanelDict[panelName] ).then(prefab => {
                this.otherAsynPrefab[panelName] = prefab;
                resolve(this.showPanel(prefab, parent, tag)); 
            });
        }

        else{
            console.error("panel.showAsynPanelByName not find panelName", panelName)
            reject();
        }

    });
};

/**
 * @param prafab 界面预制
 * @Explain 关闭一个界面
 */
panel.closePanel = function (prafab) {
    let curScene = cc.director.getScene();
    let prefabLayer = curScene.getChildByName(prafab.name);
    if (!prefabLayer) return console.error("无法关闭没有打开的界面");
    if (!cc.isValid(prefabLayer)) prefabLayer.destroy();
};

/**异步实例化预设 */
panel.showAsynPanelByName = function (_panelName, parent, tag) {
    // console.log("panel.showAsynPanelByName");
    parent = parent || cc.director.getScene();
    return new Promise((resolve, reject) => {
        this.showPanelByName(_panelName, parent, tag).then(panel => {
            console.log("showAsynPanelByName panel = ", panel)
            resolve(panel);    
        });
    });
};

/**
 * @param fromTag
 * @param parent
 * @Explain 删除一个子节点
 */
panel.closeChildPanel = function (fromTag, parent) {
    let children = parent.children;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        let script = child.getComponent(child.name);
        if (!script) continue;
        let childTag = script.get("fromTag");
        if (childTag === fromTag) {
            return child.destroy();
        }
    }
};
/**
 * 切换 prefab 加载路径
 * @param sceneName
 */
panel.switchPrefabPath = function (nextSceneInfo) {
    // console.log('switchPrefabPath = ', nextSceneInfo);

    if(!nextSceneInfo) return;

    let cur = this.curScenePrefab;
    for (let key in cur) {
        this.releasePrefab[key] = cur[key];
    }

    this.otherPanelDict = [];
    let _asynPrefab = nextSceneInfo.asynPrefab || {}; //异步加载
    for (let key in _asynPrefab) {
        this.otherPanelDict[key] = _asynPrefab[key];
    }

    this.curScenePrefabDict = [];
    let _prefab = nextSceneInfo.prefab || {}; //同步加载
    for (let key in _prefab) {
        this.curScenePrefabDict[key] = _prefab[key];
    }

    let _commonfab = nextSceneInfo.commonfab || {}; //公共加载
    for (let key in _commonfab) {
        this.publicPanelDict[key] = _commonfab[key];
    }


    return new Promise((resolve, reject) => {
        this.preloadMode(_commonfab, this.publicPrefab).then(function(){
            this.preloadMode(_prefab, this.curScenePrefab).then(function(){
                resolve();
            }.bind(this));
        }.bind(this));;
    });

};

/**
 * 进入前需要预加载的优先模块
 */
panel.preloadMode = function (publicPaths, dicts) {
    // console.log('preloadMode', publicPaths)
    
    return new Promise((resolve, reject) => {
        if (!publicPaths) {
            console.log(`preloadMode publicPaths 还没有配置动态加载资源的文件`);
            resolve();
        }

        //预加载基数
        var preload_count = Object.keys(publicPaths).length;

        console.log("preload_count = ", preload_count)
        if(preload_count <= 0){
           resolve(); 
        }

        //预加载回调
        let ofend = (resolve) => {
            preload_count--;
            if (preload_count <= 0) resolve();
        };

        for (let key in publicPaths) {
            ryyl.fileutil.readPrefab(publicPaths[key]).then(prefab => {
                if(dicts)dicts[key] = prefab;

                this.referenceCount(prefab);

                if(this.releasePrefab[key]) delete this.releasePrefab[key];
                ofend(resolve);
            });
        }
    });
};

/**
 * 释放当前场景 load 进来的 prefab 引用资源
 */
panel.releaseCurPrefabAllRes = function () {
    console.log('releaseCurPrefabAllRes:', this.releasePrefab);
    if (!this.releasePrefab) return;

    // console.log('pngMap:', this.pngMap);

    let _res = this.releasePrefab || [];
    for (let key in _res) {
        if(!_res[key])continue;
        let deps = cc.loader.getDependsRecursively(_res[key]);

        for (var i = 0; i < deps.length; i++) {
            let _s = deps[i];
            if(!_s) continue;
            let _key = _s.substr(_s.lastIndexOf("/") + 1); 
            if(this.pngMap[_key]) {
                this.pngMap[_key] = this.pngMap[_key]- 1;
            }
            if(this.pngMap[_key] && this.pngMap[_key] > 0) delete deps[i];
        }
        // console.log('deps = ', deps);
        cc.loader.release(deps);
        delete this.releasePrefab[key];
    }

    this.releasePrefab = [];
};

panel.referenceCount = function (prefab) {
    if(!prefab) return;

    let deps = cc.loader.getDependsRecursively(prefab);
    // console.log("deps", deps);
    if(!deps) return;
    let _s
    for (var i = 0; i < deps.length; i++) {
        _s = deps[i];
        if(!_s) continue;
        let _key = _s.substr(_s.lastIndexOf("/") + 1); 
        // console.log("_key = ", _key)
        if(!this.pngMap[_key]) this.pngMap[_key] = 1;
        else this.pngMap[_key] = this.pngMap[_key] + 1;
    }
};

// /**
//  * @param title 标题
//  * @param content 内容
//  * @param next 确定后的回调
//  */
// // ryyl.panel.showMsgBox("示例标题", "示例内容", ()=>{console.log("确定");})
// panel.showFangShua = function (next) {

//     this.showAsynPanelByName('fangshua').then( panel=>{ 
//         panel.getComponent(panel.name).showUI(next);
//     });
// };

// /**
//  * @param title 标题
//  * @param content 内容
//  * @param next 确定后的回调
//  */
// // ryyl.panel.showMsgBox("示例标题", "示例内容", ()=>{console.log("确定");})
// panel.showMsgBox = function (title, content, next, confirm_label = null, isShowSingeBtn = true) {
//     if(content == null) content == "";

//     this.showAsynPanelByName('confirmbox').then( panel=>{ 
//         panel.getComponent(panel.name).showMsg(title, content, true, next, null, null, confirm_label, isShowSingeBtn);
//     });
// };

// panel.showWarmBox = function (title, content, next) {
//     if(content == null) content == "";

//     this.showAsynPanelByName('confirmbox').then( panel=>{ 
//         let _child = panel.getComponent(panel.name);
//         _child.showMsg(title, content, true, next, null, null, null, true);
//         _child.visibleClose(false);
//     });
// };

// // ryyl.panel.showDialog("示例标题", "示例内容...", ()=>{console.log("确定")}, ()=>{console.log("取消")})
// panel.showDialog = function (title, content, next, cancel, cancel_label, confirm_label) {
//     if(content == null) content == "";

//     this.showAsynPanelByName('confirmbox').then( panel=>{ 
//         panel.getComponent(panel.name).showMsg(title, content, false, next, cancel, cancel_label, confirm_label);
//     });

// };

// /**
//  * 错误内容显示
//  */
// panel.showMsgDataErrorBox = function (content) {
//     if(!!content){
//         if( !!loginVersionInfo && !!loginVersionInfo.getChannelId() ){
//             let title = "prompt";
//             let next =  () => {}
//             this.showMsgBox(title,content, next)
//         }   
//     }
// };

// /**
//  * @param content 提示内容
//  */
// panel.showTip = function (content,time) { 
//     this.showAsynPanelByName('labeltip').then( panel=>{ 
//         console.log("panel.showTip 11111111");
//         panel.getComponent(panel.name).showTip(content,time);
//     } );  
// };

// panel.showErrorTip = function (content, next) { 
//     this.showAsynPanelByName('labeltip').then( panel=>{ 
//         if(panel)panel.getComponent(panel.name).showErrorTip(content,next);
//     } );  
// };
// /**
//  * 显示设置界面
//  * @param bool
//  */
// panel.showSetting = function (bool = true) {

//     this.showAsynPanelByName('setting').then( panel=>{ 
//         if (bool) panel.getComponent(panel.name).updateUI();
//     }); 
// };


// /**
//  * 显示游戏规则界面(new)
//  * @param gameName
//  */
// panel.showNewGameRule = function (type) {

//     let msg = {type : type};
//     ryyl.gameNet.send_msg("http.reqRuleLink", msg, (route, data) => {
//         this.showAsynPanelByName('gamerule').then( panel=>{ 
//             panel.getComponent(panel.name).updateUI(data.url, data.type);
//         }); 

//     });
// };

// /**
//  * 显示子游戏菜单界面
//  * @param logic
//  */
// panel.showGameMenu = function (sceneTag, logic, hideChange) {
//     console.log("panel.showGameMenu")
//     this.showAsynPanelByName('gamemenu').then( panel=>{ 
//         // console.log("panel.showGameMenu 1111111")
//         panel.getComponent(panel.name).showMenu(sceneTag, logic, hideChange);
//     }); 
// };

// /**
//  * 显示新游戏记录界面
//  * @param gameID
//  */
// panel.showNewGameRecord = function (gameID) {
//     console.log("panel.showNewGameRecord");
//     this.showAsynPanelByName('record').then( panel=>{ 
//         panel.getComponent(panel.name).updateUI(gameID);
//     }); 
     
// }; 
  

// /**
//  * 显示debug面板
//  */
// panel.showDebugPanel = function () {

//     this.showAsynPanelByName("debugpanel");

// };


// /**
//  * 显示加载进度条
//  */
// panel.showLoading = function () {
//     return new Promise(function(resolve,reject){
//         this.showAsynPanelByName('loading').then( panel=>{ 
//             let act = cc.sequence( [cc.delayTime(0.3), cc.fadeIn(0.5)]);
//             panel.runAction(act);
//             resolve(panel);
//         }); 
//     }.bind(this));
        
//     // async function fn() {
//     //     const result = await p1();
//     //     console.log(" ///////// ",result);

//     //     return result;
//     // }


// };

// /**
//  * 显示加载进度条(进入房间后的loading遮罩)
//  */
// panel.showRoomLoading = function () {

//     if(null ==  this.loadingDic  ){
//         this.loadingDic = [];
//     }
//     this.showAsynPanelByName("loading");
// };


// /**
//  * 关闭加载
//  */
// panel.closeLoading = function () { 
//     if( null != this.loadingDic  ){
//         let len = this.loadingDic.length;
//         for( let i  = 0 ; i < len;++i ){
//            if( null != this.loadingDic[i] ){
//                if( null != this.loadingDic[i].destroy ){
//                     this.loadingDic[i].destroy();
//                }
//            } 
//         }
//         this.loadingDic = [];
//     }
//     let loading = cc.director.getScene().getChildByName("loading");
//     if (!loading) return;
//     loading.destroy();
// };

// /**
//  * 显示滚动公告界面
//  */
// panel.showNotice = function () {
//     // console.log("panel.showNotice");
//     this.showAsynPanelByName("notice");
// };

/**
 * 
 */
// panel.showShopNew = function () {
//     this.showAsynPanelByName("shopNative");
// };

// panel.showShop = function (type = 2) {
//     //type 1充值特惠  2充值
//     ryyl.gameNet.send_msg('http.ReqZRechargeUrl', null, (route, msg) => {
//         ryyl.scene.enterNextScene().then(()=>{
//             let url;
//             switch(type)
//             {
//                 case 1:
//                     url = msg.first_url;
//                     break;
//                 case 2:
//                     url = msg.normal_url;
//                     break;
//                 case 3:
//                     url = msg.first_ten_url;
//                     break;
//                 case 4:
//                     url = msg.bigcash_url;
//                     break;
//             }
//             ryyl.emitter.emit("paywebUrl",{ url: url });
//         });
//     });
// };

// panel.showRemoteImageAll = function (node, url,_cb){
//     // cc.loader.load({
//     //     url: url,
//     //     type: 'png'
//     // }, function(err, tex) {
//     //     if (err) {
//     //         return;
//     //     }
//     //     var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
//     //     node.getComponent(cc.Sprite).spriteFrame=spriteFrame;
//     // }.bind(this));
//     this.showRemoteImage(node, url,_cb)
// };


// panel.showRemoteImageAllJPG = function (node, url,_cb){

//     this.showRemoteImage(node, url,_cb);
// };

// panel.isWxHeadUrl = function(_url){
//     if( !!_url ){
//         if( -1 ==_url.indexOf('.jpg') && -1 ==_url.indexOf('.png') ){
//             // this.showTip('微信头像'+_url);
//             return true;
//         }
//         return false;
//     }
//     return false;
// };

/**
 * 加载远程图片
 */
// panel.showRemoteImage = function (node, url,cb) {
//     if (!node || !url) {
//         if(!!cb){
//             cb('node or url is null');
//         } 
//         return;
//     } 
//     if( !!this.isWxHeadUrl(url) ){
//         cc.loader.load({
//             url: url,
//             type: 'jpg'
//         },  (err, tex)=> {  
//             if( !!cb){
//                 cb();
//             }   
//             if( !!err ){
//                 console.error(err);
//                 for (var i = 0; i < err.length; i++) {
//                     console.error('Error url [' + err[i] + ']: ' + results.getError(err[i]));
//                 }
//                 return;
//             } 
//             var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
//             node.getComponent(cc.Sprite).spriteFrame=spriteFrame; 
             
//         });
//         return;
//     }
// 	console.log('pre url==>' + url);
//     /**找到http */
//     if( url.indexOf('http')  == -1 ){
//         url=ryyl.servercfg.getVByK('headImgUrl') + url;
//     }
	
//     let headStr = "/headimg/head_";
//     if(url.indexOf(headStr) >= 0 ) { //判断url地址中是否包含headimg字符串
//         let starpos = url.indexOf(headStr);
//         url=ryyl.servercfg.getVByK('headImgUrl')+url.substring(starpos);
//     }
	
// 	console.log('after url==>'+url);
	
//     let showcion = function (pathUrl,cb) {
//         if (!node) {
//             if(!!cb){
//                 cb('node is null');
//             } 
//             cc.error( 'load img node is null' )
//             return;
//         }

//         if( !this.iconList ){
//             this.iconList = {};
//         }
//         if (this.iconList[pathUrl] != null) {
//             node.getComponent(cc.Sprite).spriteFrame = this.iconList[pathUrl];
//             node.getComponent(cc.Sprite).type = cc.Sprite.Type.SIMPLE;
//             node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
//             // console.log("存在showRemoteImageURL:", pathUrl) 
//             if( !!cb ){
//                 cb();
//             } 
//             return;
//         }
//         // console.log("不存在showRemoteImageURL:", pathUrl)
//         ryyl.loader.remoteLoad(pathUrl).then(data => {
//             this.iconList[pathUrl] = data;
//             node.getComponent(cc.Sprite).spriteFrame = data;
//             node.getComponent(cc.Sprite).type = cc.Sprite.Type.SIMPLE;
//             node.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
//             if( !!cb ){
//                 cb();
//             } 
//         })
//     }
//     if (cc.sys.isNative) { 
//         ryyl.loader.loadUrlpic(url).then(path => {
//             showcion.bind(this)(path,cb);
//         })
//     } else {
//         showcion.bind(this)(url,cb);
//     }
// };

module.exports = function () {
    if (!g_instance) {
        g_instance = new Panel();
    }
    return g_instance;
};
