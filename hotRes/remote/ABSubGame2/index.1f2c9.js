window.__require = function e(o, r, n) {
function t(u, c) {
if (!r[u]) {
if (!o[u]) {
var _ = u.split("/");
_ = _[_.length - 1];
if (!o[_]) {
var a = "function" == typeof __require && __require;
if (!c && a) return a(_, !0);
if (i) return i(_, !0);
throw new Error("Cannot find module '" + u + "'");
}
u = _;
}
var f = r[u] = {
exports: {}
};
o[u][0].call(f.exports, function(e) {
return t(o[u][1][e] || e);
}, f, f.exports, e, o, r, n);
}
return r[u].exports;
}
for (var i = "function" == typeof __require && __require, u = 0; u < n.length; u++) t(n[u]);
return t;
}({
SubGame_2: [ function(e, o, r) {
"use strict";
cc._RF.push(o, "16dbaOjhHVEBJ6LqISL1bOQ", "SubGame_2");
var n = function() {
for (var e, o = arguments.length, r = new Array(o), n = 0; n < o; n++) r[n] = arguments[n];
(e = console).log.apply(e, [ "[SubGame_2]" ].concat(r));
};
cc.Class({
extends: cc.Component,
properties: {},
initModule: function(e) {
n("initModule");
var o = e.lobbyRoot;
this._lobbyRoot = o;
},
onBtn_close: function() {
n("btn_close");
this._lobbyRoot.removeGame_2();
}
});
cc._RF.pop();
}, {} ]
}, {}, [ "SubGame_2" ]);