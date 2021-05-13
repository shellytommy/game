window.ryyl = window.ryyl || {};

ryyl.baseclass = cc.Component.extend({

    /**
     * @param event
     * @param type UI编辑器传参 有值就不做按钮连点过滤
     * @Explain Button点击事件统一调用
     */
    OnClickButton(event, type) {
        let buttonName = event.target.name;
        let buttonNode = event.target;
        if (!type) {
            if (this.curClickState) return;
            this.curClickState = true;
            this.allCurTimeout = this.allCurTimeout || [];
            this.allCurTimeout.push(setTimeout(() => {
                this.curClickState = false;
            }, 300));
        }
        //console.log(`点击了button -> ${buttonName}`);
        // switch (buttonName) {
        //     case "close":
        //         ryyl.audio.playSoundEffectByPath("resources/prefab/public/res/audio/close");
        //         break;
        //     case "discard":
        //         ryyl.audio.playSoundEffectByPath("resources/prefab/public/res/audio/putcard");
        //         break;
        //     case "setting":
        //         ryyl.audio.playSoundEffectByPath("resources/prefab/public/res/audio/menu");
        //         break;
        //     default: ryyl.audio.playSoundEffectByPath("resources/prefab/public/res/audio/click");
        // }
        this.onClick(buttonName, buttonNode);
        if( null != this.touchCb ){
            this.touchCb(buttonName, buttonNode);
        }
    },      
    registerTouch(_cb){
        this.touchCb = _cb;
    },
    /**
     * @param event
     * @Explain Toggle点击事件统一调用
     */
    OnClickToggle(event) {
        let buttonName = event.target.name;
        let buttonNode = event.target;
        //console.log(`点击了toggle -> ${buttonName}`);
        // ryyl.audio.playSoundEffectByPath("resources/prefab/public/res/audio/select");
        this.onClick(buttonName, buttonNode);
    },
    /**
     * @param ButtonName
     * @param ButtonNode
     * @Explain 子类需要重写这个接口来触发点击事件
     */
    onClick(ButtonName, ButtonNode) { },

    OnSlider(event) {
        let node = event.node;
        let process = event.progress;
        this.onSliderProcess(node, process);
    },
    onSliderProcess(node, process) { },

    // 组件启用时,每帧调用
    update() { },
    // 同update一样
    lateUpdate() { },
    // 当附加到一个激活的节点上或者其节点第一次激活时候调用。因此只会在刚创建的时候被调用一次后面都不在调用
    onLoad() { },
    // 如果该组件第一次启用，则在所有组件的 update 之前调用。
    start() { },
    // 当该组件被启用，并且它的节点也激活时。
    onEnable() { },
    // 当该组件被禁用或节点变为无效时调用。
    onDisable() { },
    // 当该组件被销毁时调用
    onDestroy() {
        this.OnDestroy();
        this.clearCurTimeout();
        if (!cc.isValid(this.node)) this.node.removeFromParent();
    },
    // 子类重写此销毁函数
    OnDestroy() { 

    },
    /**
     * 销毁自己
     */
    remove() {
        if(this.node && this.node.destroy)this.node.destroy();
    },
    
    clearCurTimeout() {
        if (!this.allCurTimeout) return;
        let count = this.allCurTimeout.length;
        for (let i = 0; i < count; i++) {
            clearTimeout(this.allCurTimeout[i]);
        }
    },

    /**
     * 给予适配比例
     */
    fitScreen() {
        // let nowSize = cc.winSize,
        //     cutSize = cc.view.getDesignResolutionSize(),
        //     nowRatio = nowSize.width / nowSize.height,
        //     cutRatio = cutSize.width / cutSize.height;

        // if (nowRatio < cutRatio) {
        //     cc.view.setDesignResolutionSize(cutSize.width, cutSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
        // } else {
        //     cc.view.setDesignResolutionSize(cutSize.width, nowSize.height, cc.ResolutionPolicy.FIXED_HEIGHT);
        // }
    }

});
