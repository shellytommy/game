window.__require = function o(e, t, n) {
function a(r, u) {
if (!t[r]) {
if (!e[r]) {
var c = r.split("/");
c = c[c.length - 1];
if (!e[c]) {
var _ = "function" == typeof __require && __require;
if (!u && _) return _(c, !0);
if (i) return i(c, !0);
throw new Error("Cannot find module '" + r + "'");
}
r = c;
}
var l = t[r] = {
exports: {}
};
e[r][0].call(l.exports, function(o) {
return a(e[r][1][o] || o);
}, l, l.exports, o, e, t, n);
}
return t[r].exports;
}
for (var i = "function" == typeof __require && __require, r = 0; r < n.length; r++) a(n[r]);
return a;
}({
LobbyConst: [ function(o, e, t) {
"use strict";
cc._RF.push(e, "27fe1uYokJIMYFrKpxPCezS", "LobbyConst");
e.exports = {
testv: "lobbytest_v"
};
cc._RF.pop();
}, {} ],
LobbyRoot: [ function(o, e, t) {
"use strict";
cc._RF.push(e, "db61cI7621CF4KaPW1dwhIj", "LobbyRoot");
var n = function() {
for (var o, e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
(o = cc).log.apply(o, [ "[LobbyRoot]" ].concat(t));
};
cc.Class({
extends: cc.Component,
properties: {},
initModule: function() {
n("initModule");
},
onBtn_loadGame_1: function() {
var o = this;
n("onBtn_loadGame_1");
this.removeGame_1();
this.loadSubGame("ABSubGame1", function(e) {
e.getABObj().load("root/Scene/SubGame1", cc.Prefab, function(e, t) {
n("load_game1_prefab_:", JSON.stringify(e));
var a = cc.instantiate(t);
o.node.addChild(a, 100);
o._game1 = a;
a.getComponent("SubGame_1").initModule({
lobbyRoot: o
});
});
});
},
removeGame_1: function() {
this._game1 && this._game1.destroy();
this._game1 = null;
},
onBtn_loadGame_2: function() {
var o = this;
n("onBtn_loadGame_2");
this.removeGame_2();
this.loadSubGame("ABSubGame2", function(e) {
e.getABObj().load("root/Scene/SubGame2", cc.Prefab, function(e, t) {
n("load_game2_prefab_:", JSON.stringify(e));
var a = cc.instantiate(t);
o.node.addChild(a, 100);
o._game2 = a;
a.getComponent("SubGame_2").initModule({
lobbyRoot: o
});
});
});
},
removeGame_2: function() {
this._game2 && this._game2.destroy();
this._game2 = null;
},
loadSubGame: function(o, e) {
_G_moduleMag.hotUpdateMultiModule([ o ], function() {
console.log(" loadSubGame ", o);
_G_moduleMag.addModule(o, function(o) {
console.log(" loadSubGame ", o);
e(o);
});
});
}
});
cc._RF.pop();
}, {} ]
}, {}, [ "LobbyConst", "LobbyRoot" ]);