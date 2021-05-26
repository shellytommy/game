module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        rotateTime: 20,
        icon:cc.Node,
    },

    onLoad() {
        let repeat = cc.repeatForever(cc.sequence(cc.rotateBy(0.1, 30),cc.delayTime(0.01)));
        this.node.runAction(repeat);

        if(this.icon){
            let _sequence = cc.sequence(cc.scaleTo(0.3,0,1),cc.scaleTo(0.3,1,1),cc.delayTime(0.2));
            let _repeatForever = cc.repeatForever(_sequence);
            this.icon.runAction(_repeatForever);
        }
    },

});