// window.md5 = function(str) {
//     const crypto = require("crypto");
//     return crypto.createHash('md5').update(str).digest('hex');
// };

window.ryyl = window.ryyl || {};

// 重启游戏接口
window.reStartGame = function() {
    
};


//定义一个深拷贝函数  接收目标target参数
window.deepClone = function(target) {
    let result;
    if (typeof target === 'object') {
        if (Array.isArray(target)) {
            result = []; 
            for (let i in target) {
                result.push(deepClone(target[i]))
            }
        } else if(target===null) {
            result = null;
        } else if(target.constructor === RegExp){
            result = target;
        }
        else {
            result = {};
            for (let i in target) {
                result[i] = deepClone(target[i]);
            }
        }
    } else {
        result = target;
    }
    return result;
};

window.ryyl = window.ryyl || {};

window.initGlobal = function() {

    // // 注册前后台切换事件
    // window.isShow = false;
    
    // cc.game.on(cc.game.EVENT_HIDE, () => {
    //     if (window.isShow) {
    //         ryyl.emitter.emit("EnterBackground");
    //         window.isShow = false;
    //         // 记录进入后台的时间点
    //         window.g_enterBackgroundTime = Date.now(); 
    //         console.warn('进入后台的时间：', window.g_enterBackgroundTime );
    //     }
    // });

    // cc.game.on(cc.game.EVENT_SHOW, () => {
    //     if (!window.isShow) {
    //         ryyl.emitter.emit("EnterForeground");
    //         window.isShow = true;
    //         if (!!window.g_enterBackgroundTime) {
    //             let tmpTime = Date.now() - window.g_enterBackgroundTime;
    //             console.warn('回到游戏的时间：',tmpTime);
    //             // 后台放2分中就自动重启
    //             if (tmpTime >= 2 * 6000) { 
    //                 if(!!cc.sys.isNative){
    //                     //console.warn('重启游戏'); 
    //                     reStartGame();
    //                 } 
    //             } 
    //         }
    //         window.g_enterBackgroundTime = null;
    //     }
    // });

    cc.debug.setDisplayStats(false);

    // if (isBrowser) ryyl.platform = require("web").getInstance();
    // else if (isAndroid) ryyl.platform = require("android").getInstance();
    // else if (isIos) ryyl.platform = require("ios").getInstance();
    // else ryyl.platform = require("default").getInstance();

    if (cc.sys.isNative) cc.game.setFrameRate(60);

    // ryyl.log = deepClone(console.log);
    // ryyl.fileutil = require("fileutil")(); // 文件操作管理
    ryyl.emitter = require("emitter")(); // 事件管理
    ryyl.storage = require("storage")(); // 缓存管理
    // ryyl.gameNet = require("GameNet")(); // 网络管理
    // ryyl.loader = require("loader")(); // 资源加载管理
    // ryyl.scene = require("scene")(); // 场景管理
    ryyl.panel = require("panel")(); // 界面管理
    // ryyl.waitPanel = require("waitPanel")(); // 界面管理
    // ryyl.assets = require("assets"); // 热跟新管理
    ryyl.audio = require("audio")(); // 声音管理

    // ryyl.servercfg = require("servercfg")(); // 服务器配置模块
    // ryyl.logon = require("logon")(); // 登陆数据模块
    // ryyl.user = require("user")(); // 玩家信息模块
    // ryyl.room = require("room")(); // 房间数据模块
    // ryyl.readyroom = require("readyroom")(); // 房间数据模块
    // ryyl.mathKit = require("mathKit")(); // math模块

    // ryyl.hint = require('hint')();

    // ryyl.utilmgr = require("utilmgr")(); // 工具模块
    
    // ryyl.lobbyMgr = require("lobbyMgr").Instance();
    // ryyl.Schedule = require("Schedule").Instance();
    
    // let Toast = require("Toast");
    // ryyl.Toast = new Toast();


    ryyl.i18n = ryyl.i18n || require('LanguageData');
    ryyl.i18n.init("en");
    
    
};