let JS_LOG = function(...arg){ 
    cc.log("[login_frame]",...arg) ; 
}

ryyl.baseclass.extend({
    properties: {
        otpNode: cc.Node,
        numNode: cc.Node,
        codeNode : cc.Node,

        phone_edit: cc.EditBox,
        phone_continue: cc.Button,

        otp_edit: cc.EditBox,
        otp_continue: cc.Button,
        otp_returnPhone: cc.RichText,
        phoneLabel : cc.Label,
        codeLabel : cc.Label,

        mask:cc.Node,

    },
    onLoad() {
        this._super();

        this.registerEvent();
        this.phone_continue.interactable = false;
        this.otp_continue.interactable = false;


        this.loginInTime = null;
        this.facebookSend = 0;
        
        this.otpNode.active = false;

        this.phone_edit.placeholder = ryyl.i18n.t("LOGIN.PHONENUMBER");
        
        this.otp_returnPhone.string = ryyl.i18n.t("LOGIN.RETURNPHONE");
        this.otp_edit.placeholder   = ryyl.i18n.t("LOGIN.OTPEDIT");
        
    },

    phoneEditChange(event)
    {
        let pattern = new RegExp("^[0-9]+$");
        //获取输入框中的值
        let content = event;
        let rs = "";
        for (var i = 0; i < content.length; i++) {
            var oneStr = content.substr(i, 1);
            if (pattern.test(oneStr)) {
                rs = rs + oneStr;
            }
        }

        this.phone_edit.string = rs;
        let ctr =  this.phone_continue.node.getComponent('sendVerificationCode');
        if( (this.phone_edit.string.length != 10 && ryyl.servercfg.language == g.getEnum().LANGUAGE.EN) || (this.phone_edit.string.length != 11 && ryyl.servercfg.language == g.getEnum().LANGUAGE.CN) )
        {
            this.phone_continue.interactable = false;
            this.phoneLabel.node.color = new cc.Color( 255, 255, 255);
        }else{
            this.phone_continue.interactable = true;
            this.phoneLabel.node.color = new cc.Color( 141, 73, 13);
        }
    },

    yzmEditChange(event)
    {
        let pattern = new RegExp("^[0-9]+$");
        //获取输入框中的值
        let content = event;
        let rs = "";
        for (var i = 0; i < content.length; i++) {
            var oneStr = content.substr(i, 1);
            if (pattern.test(oneStr)) {
                rs = rs + oneStr;
            }
        }
        this.otp_edit.string = rs;
        if( this.otp_edit.string.length != 4 )
        {
            this.otp_continue.interactable = false;
            this.codeLabel.node.color = new cc.Color( 255, 255, 255);
        }else{
            this.otp_continue.interactable = true;
            this.codeLabel.node.color = new cc.Color( 141, 73, 13);
        }
    },
   
    OnDestroy() {
        if(this.loginInTime) {
            clearTimeout(this.loginInTime);
            this.loginInTime = null;
        }
        this.unRegisterEvent();
    },

    registerEvent() {
        ryyl.emitter.on("closeForget", this.closeForget, this);
        ryyl.emitter.on("getFacebookUserInfoToLogin", this.getFacebookUserInfoToLogin, this);
        ryyl.emitter.on("pomeloOK", this.pomeloOK, this);
        ryyl.emitter.on("disconnect", this.disconnect, this);
        ryyl.emitter.on("errorCode", this.disconnect, this);
        ryyl.emitter.on("loginSucc", this.loginSucc, this);
        
    },

    unRegisterEvent() {
        ryyl.emitter.off("closeForget", this);
        ryyl.emitter.off("getFacebookUserInfoToLogin", this);
        ryyl.emitter.off("pomeloOK", this);
        ryyl.emitter.off("disconnect", this);
        ryyl.emitter.off("errorCode", this);
        ryyl.emitter.off("loginSucc");

    },

    /**
     *登陆返回
     */
    loginSucc(data) {
        console.log("login msg = ", data);
        let _roomUserInfo   = data.roomUserInfo;
        let _notice         = data.notices;
        let _uid            = data.uid;
        let _token          = data.token;
        let _code           = data.code;

        if(_notice){
            ryyl.storage.setItem("notice", {msg:_notice});
        }
    
        this.mask.active = false;
    },


    loading(){
        this.mask.active = true;
        this.loginInTime = setTimeout(()=>{ 
            ryyl.Toast.showToast("Login has timed out, please try again");
            if(this.mask)this.mask.active = false;
        }, 15000);
    },

    disconnect(){
        this.mask.active = false;
    },

    pomeloOK(){
        let loginCache = ryyl.storage.getItem("loginCache");
        if (!loginCache || !loginCache.token) return; //自动登录屏蔽层
        this.loading();
    },

    closeForget() {
        let dy = cc.delayTime(1);
        let cb = cc.callFunc(() => {
        })
        this.node.runAction(cc.sequence(dy, cb));
    },

    // 按钮点击事件
    onClick(name, node) {
        switch (name) {
            case "btn_back":
            case "btn_close":
                break;
            case "password_login":
                ryyl.panel.showAsynPanelByName("loginPhone");
                break;
            case "login_facebook":
                return this.facebookLogin();
                // this.getFacebookUserInfoToLogin({fbId:"sssssssss", fbName:"sssssss", fbHeadImg:"http://ssssssss.png"})
                break;
            case "login_guest":
                // this.loading();
                // ryyl.logon.reqTouLogin();

                ryyl.emitter.emit("gotoLobby");
                break;
            case "login_phone":
                this.otpNode.active = true;
                this.codeNode.active = false;
                this.numNode.active = true;
                this.phone_edit.string = "";
                let loginPhone = ryyl.storage.getItem("loginPhone");
                // if( loginPhone && loginPhone.phone )
                // {
                //     this.phone_edit.string = loginPhone.phone;
                //     this.phone_continue.interactable = true;
                // }
                // else{
                    this.phone_continue.interactable = false;
                    this.phoneLabel.node.color = new cc.Color( 255, 255, 255);
                    this.phone_edit.focus();
                // }
                break;
            case "btn_phone":
                this.numNode.active = false;
                this.codeNode.active = true;
                this.click_phone();
                this.otp_edit.string = "";
                this.codeLabel.node.color = new cc.Color( 255, 255, 255);
                this.otp_edit.focus();
                break;
            case "btn_opt":
                this.click_opt();
                break;
            case "returnPhone":
                
                this.otpNode.active = true;
                this.codeNode.active = false;
                this.numNode.active = true;
                this.phone_edit.focus();

                break;
            case "optclose":
               this.otpNode.active = false;
                break;
            default:
                console.error("no find button name -> %s", name);
        }
    },

    click_opt()
    {
        
        this.acctionLogin();
    },

    click_phone()
    {
        //是否开启验证码
        // if( ryyl.servercfg.getVByK('code_open_status') == 1 )
        // {
        //     ryyl.panel.showFangShua(()=>{
        //         this.otpNode.active = true;
        //         let ctr =  this.phone_continue.node.getComponent('sendVerificationCode');
        //         ctr.doSendVerificationCode({phone: this.phone_edit.string, type: 7});
        //         ryyl.gameNet.send_msg('http.ReqZUserJudge', {"phone": this.phone_edit.string, "type": 1, "deviceID": ryyl.servercfg.getDeviceID()}, (route, data) => {
        //             this.isNewUser = data.is_new == 0;
        //             if(this.isNewUser){
        //                 if(data.is_new_old == 0){
        //                     ryyl.platform.commonTrackEvents("Registration_old", " phone uid = " + data.uid + " channel = " + ryyl.servercfg.getChannelId());
        //                 }
        //                 else{
        //                     ryyl.platform.commonTrackEvents("Registration Complete", "phone");
        //                 }
        //             }
        //         }, true);
        //     });
        // }else{
            this.otpNode.active = true;
            let ctr =  this.phone_continue.node.getComponent('sendVerificationCode');
            ctr.doSendVerificationCode({phone: this.phone_edit.string, type: 7});
            //判断该手机是否是新用户
            // ryyl.gameNet.send_msg('http.ReqZUserJudge', {"phone": this.phone_edit.string, "type": 1, "deviceID": ryyl.servercfg.getDeviceID()}, (route, data) => {
            //     this.isNewUser = data.is_new == 0;

            //     if(this.isNewUser){
            //         if(data.is_new_old == 0){
            //             ryyl.platform.commonTrackEvents("Registration_old", " phone uid = " + data.uid + " channel = " + ryyl.servercfg.getChannelId());
            //         }
            //         else{
            //             ryyl.platform.commonTrackEvents("Registration Complete", "phone");
            //         }
            //     }
            // }, true);
        // }
    },

    // facebook登陆调取fb
    facebookLogin(name, node) {
        if(!cc.sys.isNative){
            ryyl.Toast.showToast(ryyl.i18n.t("PLAZE.COMINGSOON"), node);
            return;
        }
        this.facebookSend = 0;
        ryyl.platform.loginToFacebook(true);
    },

    //fb信息回调， 先判断是否是新用户在去登录
    getFacebookUserInfoToLogin(data)
    {
        if(!data){
            console.error('getFacebookUserInfoToLogin data is null');
            return
        }
        if(this.facebookSend > 0) return;
        this.facebookSend = 1;
        this.loading();
        setTimeout(()=>{ 
            ryyl.logon.reqFaceBookAccLogin(data.fbId, data.fbName, data.fbHeadImg);
        }, 2000);
    },

    // 账号登陆
    acctionLogin() {
        let acc = this.phone_edit.string;
        let psw = this.otp_edit.string;

        if(!acc || !psw){
            ryyl.Toast.showToast("The phone number or verification code cannot be blank");
            return;
        }
        this.loading();
        ryyl.logon.reqAccLogin({
            phone: acc,
            code: psw,
        });
    },

});