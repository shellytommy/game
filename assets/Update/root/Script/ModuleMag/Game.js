

window.startGame = function () {
    
    let JS_LOG = function (...params) {
        console.log("[Game]", ...params)
    }
    
    let ModuleManager = require("./ModuleManager");

    window._G_AppCom = require("AppCom");

    window._G_moduleMag = new ModuleManager();


    JS_LOG("_G_moduleMag: ", _G_moduleMag);
}


