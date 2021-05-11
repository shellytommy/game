window.__require = function o(e, t, n) {
function r(i, c) {
if (!t[i]) {
if (!e[i]) {
var s = i.split("/");
s = s[s.length - 1];
if (!e[s]) {
var a = "function" == typeof __require && __require;
if (!c && a) return a(s, !0);
if (u) return u(s, !0);
throw new Error("Cannot find module '" + i + "'");
}
i = s;
}
var _ = t[i] = {
exports: {}
};
e[i][0].call(_.exports, function(o) {
return r(e[i][1][o] || o);
}, _, _.exports, o, e, t, n);
}
return t[i].exports;
}
for (var u = "function" == typeof __require && __require, i = 0; i < n.length; i++) r(n[i]);
return r;
}({
SubGame1Const: [ function(o, e, t) {
"use strict";
cc._RF.push(e, "2b9a4CSJGBDlI69Jpbmr6iq", "SubGame1Const");
e.exports = {
testv: "subgame1_v"
};
cc._RF.pop();
}, {} ],
SubGame_1: [ function(o, e, t) {
"use strict";
cc._RF.push(e, "388f7WCQbVIgIHuG0rJG/Ah", "SubGame_1");
var n = function() {
for (var o, e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
(o = console).log.apply(o, [ "[SubGame_1]" ].concat(t));
};
cc.Class({
extends: cc.Component,
properties: {},
onLoad: function() {},
initModule: function(o) {
n("initModule");
var e = o.lobbyRoot;
this._lobbyRoot = e;
},
onBtn_close: function() {
n("btn_close");
this._lobbyRoot.removeGame_1();
}
});
cc._RF.pop();
}, {} ]
}, {}, [ "SubGame1Const", "SubGame_1" ]);