/*!
 * CanJS - 2.1.2
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 15 Aug 2014 10:50:49 GMT
 * Licensed MIT
 * Includes: can/component/component.js,can/construct/construct.js,can/map/map.js,can/list/list.js,can/compute/compute.js,can/model/model.js,can/view/view.js,can/control/control.js,can/route/route.js,can/control/route/route.js,can/view/mustache/mustache.js,can/list/promise/promise.js,can/view/ejs/ejs.js,can/view/stache/stache.js,can/route/pushstate/pushstate.js,can/model/queue/queue.js,can/construct/super/super.js,can/construct/proxy/proxy.js,can/map/lazy/lazy.js,can/map/delegate/delegate.js,can/map/setter/setter.js,can/map/attributes/attributes.js,can/map/validations/validations.js,can/map/backup/backup.js,can/map/list/list.js,can/map/define/define.js,can/map/sort/sort.js,can/control/plugin/plugin.js,can/view/modifiers/modifiers.js,can/util/object/object.js,can/util/fixture/fixture.js
 * Download from: http://bitbuilder.herokuapp.com/can.custom.js?configuration=jquery&minify=true&plugins=can%2Fcomponent%2Fcomponent.js&plugins=can%2Fconstruct%2Fconstruct.js&plugins=can%2Fmap%2Fmap.js&plugins=can%2Flist%2Flist.js&plugins=can%2Fcompute%2Fcompute.js&plugins=can%2Fmodel%2Fmodel.js&plugins=can%2Fview%2Fview.js&plugins=can%2Fcontrol%2Fcontrol.js&plugins=can%2Froute%2Froute.js&plugins=can%2Fcontrol%2Froute%2Froute.js&plugins=can%2Fview%2Fmustache%2Fmustache.js&plugins=can%2Flist%2Fpromise%2Fpromise.js&plugins=can%2Fview%2Fejs%2Fejs.js&plugins=can%2Fview%2Fstache%2Fstache.js&plugins=can%2Froute%2Fpushstate%2Fpushstate.js&plugins=can%2Fmodel%2Fqueue%2Fqueue.js&plugins=can%2Fconstruct%2Fsuper%2Fsuper.js&plugins=can%2Fconstruct%2Fproxy%2Fproxy.js&plugins=can%2Fmap%2Flazy%2Flazy.js&plugins=can%2Fmap%2Fdelegate%2Fdelegate.js&plugins=can%2Fmap%2Fsetter%2Fsetter.js&plugins=can%2Fmap%2Fattributes%2Fattributes.js&plugins=can%2Fmap%2Fvalidations%2Fvalidations.js&plugins=can%2Fmap%2Fbackup%2Fbackup.js&plugins=can%2Fmap%2Flist%2Flist.js&plugins=can%2Fmap%2Fdefine%2Fdefine.js&plugins=can%2Fmap%2Fsort%2Fsort.js&plugins=can%2Fcontrol%2Fplugin%2Fplugin.js&plugins=can%2Fview%2Fmodifiers%2Fmodifiers.js&plugins=can%2Futil%2Fobject%2Fobject.js&plugins=can%2Futil%2Ffixture%2Ffixture.js
 */
(function(undefined) {
    var __m4 = function() {
            var t = window.can || {};
            ("undefined" == typeof GLOBALCAN || GLOBALCAN !== !1) && (window.can = t), t.k = function() {}, t.isDeferred = function(t) { return t && "function" == typeof t.then && "function" == typeof t.pipe; };
            var e = 0;
            return t.cid = function(t, n) { return t._cid || (e++, t._cid = (n || "") + e), t._cid; }, t.VERSION = "@EDGE", t.simpleExtend = function(t, e) {
                for (var n in e)t[n] = e[n];
                return t;
            }, t.frag = function(e) {
                var n;
                return e && "string" != typeof e ? 11 === e.nodeType ? e : "number" == typeof e.nodeType ? (n = document.createDocumentFragment(), n.appendChild(e), n) : "number" == typeof e.length ? (n = document.createDocumentFragment(), t.each(e, function(e) { n.appendChild(t.frag(e)); }), n) : (n = t.buildFragment("" + e, document.body), n.childNodes.length || n.appendChild(document.createTextNode("")), n) : (n = t.buildFragment(null == e ? "" : "" + e, document.body), n.childNodes.length || n.appendChild(document.createTextNode("")), n);
            }, t.__reading = function() {}, t;
        }(),
        __m5 = function(t) {
            var e = window.setImmediate || function(t) { return setTimeout(t, 0); },
                n = {
                    MutationObserver: window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
                    map: { "class": "className", value: "value", innerText: "innerText", textContent: "textContent", checked: !0, disabled: !0, readonly: !0, required: !0, src: function(t, e) { return null == e || "" === e ? (t.removeAttribute("src"), null) : (t.setAttribute("src", e), e); }, style: function(t, e) { return t.style.cssText = e || ""; } },
                    defaultValue: ["input", "textarea"],
                    set: function(e, r, i) {
                        var a;
                        n.MutationObserver || (a = n.get(e, r));
                        var s, o = ("" + e.nodeName).toLowerCase(), u = n.map[r];
                        "function" == typeof u ? s = u(e, i) : u === !0 ? (s = e[r] = !0, "checked" === r && "radio" === e.type && t.inArray(o, n.defaultValue) >= 0 && (e.defaultChecked = !0)) : u ? (s = e[u] = i, "value" === u && t.inArray(o, n.defaultValue) >= 0 && (e.defaultValue = i)) : (e.setAttribute(r, i), s = i), n.MutationObserver || s === a || n.trigger(e, r, a);
                    },
                    trigger: function(n, r, i) { return t.data(t.$(n), "canHasAttributesBindings") ? e(function() { t.trigger(n, { type: "attributes", attributeName: r, target: n, oldValue: i, bubbles: !1 }, []); }) : undefined; },
                    get: function(t, e) {
                        var r = n.map[e];
                        return"string" == typeof r && t[r] ? t[r] : t.getAttribute(e);
                    },
                    remove: function(t, e) {
                        var r;
                        n.MutationObserver || (r = n.get(t, e));
                        var i = n.map[e];
                        "function" == typeof i && i(t, undefined), i === !0 ? t[e] = !1 : "string" == typeof i ? t[i] = "" : t.removeAttribute(e), n.MutationObserver || null == r || n.trigger(t, e, r);
                    },
                    has: function() {
                        var t = document.createElement("div");
                        return t.hasAttribute ? function(t, e) { return t.hasAttribute(e); } : function(t, e) { return null !== t.getAttribute(e); };
                    }()
                };
            return n;
        }(__m4),
        __m6 = function(t) {
            return t.addEvent = function(t, e) {
                var n = this.__bindEvents || (this.__bindEvents = {}), r = n[t] || (n[t] = []);
                return r.push({ handler: e, name: t }), this;
            }, t.listenTo = function(e, n, r) {
                var i = this.__listenToEvents;
                i || (i = this.__listenToEvents = {});
                var a = t.cid(e), s = i[a];
                s || (s = i[a] = { obj: e, events: {} });
                var o = s.events[n];
                o || (o = s.events[n] = []), o.push(r), t.bind.call(e, n, r);
            }, t.stopListening = function(e, n, r) {
                var i = this.__listenToEvents, a = i, s = 0;
                if (!i)return this;
                if (e) {
                    var o = t.cid(e);
                    if ((a = {})[o] = i[o], !i[o])return this;
                }
                for (var u in a) {
                    var c, l = a[u];
                    e = i[u].obj, n ? (c = {})[n] = l.events[n] : c = l.events;
                    for (var f in c) {
                        var d = c[f] || [];
                        for (s = 0; d.length > s;)r && r === d[s] || !r ? (t.unbind.call(e, f, d[s]), d.splice(s, 1)) : s++;
                        d.length || delete l.events[f];
                    }
                    t.isEmptyObject(l.events) && delete i[u];
                }
                return this;
            }, t.removeEvent = function(t, e, n) {
                if (!this.__bindEvents)return this;
                for (var r, i = this.__bindEvents[t] || [], a = 0, s = "function" == typeof e; i.length > a;)r = i[a], (n ? n(r, t, e) : s && r.handler === e || !s && (r.cid === e || !e)) ? i.splice(a, 1) : a++;
                return this;
            }, t.dispatch = function(t, e) {
                var n = this.__bindEvents;
                if (n) {
                    "string" == typeof t && (t = { type: t });
                    var r = t.type, i = (n[r] || []).slice(0), a = [t];
                    e && a.push.apply(a, e);
                    for (var s = 0, o = i.length; o > s; s++)i[s].handler.apply(this, a);
                    return t;
                }
            }, t.one = function(e, n) {
                var r = function() { return t.unbind.call(this, e, r), n.apply(this, arguments); };
                return t.bind.call(this, e, r), this;
            }, t.event = { on: function() { return 0 === arguments.length && t.Control && this instanceof t.Control ? t.Control.prototype.on.call(this) : t.addEvent.apply(this, arguments); }, off: function() { return 0 === arguments.length && t.Control && this instanceof t.Control ? t.Control.prototype.off.call(this) : t.removeEvent.apply(this, arguments); }, bind: t.addEvent, unbind: t.removeEvent, delegate: function(e, n, r) { return t.addEvent.call(this, n, r); }, undelegate: function(e, n, r) { return t.removeEvent.call(this, n, r); }, trigger: t.dispatch, one: t.one, addEvent: t.addEvent, removeEvent: t.removeEvent, listenTo: t.listenTo, stopListening: t.stopListening, dispatch: t.dispatch }, t.event;
        }(__m4),
        __m7 = function(t) {
            var e = function(t) {
                var e = t.length;
                return"function" != typeof arr && (0 === e || "number" == typeof e && e > 0 && e - 1 in t);
            };
            return t.each = function(n, r, i) {
                var a, s, o, u = 0;
                if (n)
                    if (e(n))
                        if (t.List && n instanceof t.List)for (s = n.attr("length"); s > u && (o = n.attr(u), r.call(i || o, o, u, n) !== !1); u++);
                        else for (s = n.length; s > u && (o = n[u], r.call(i || o, o, u, n) !== !1); u++);
                    else if ("object" == typeof n)
                        if (t.Map && n instanceof t.Map || n === t.route) {
                            var c = t.Map.keys(n);
                            for (u = 0, s = c.length; s > u && (a = c[u], o = n.attr(a), r.call(i || o, o, a, n) !== !1); u++);
                        } else for (a in n)if (n.hasOwnProperty(a) && r.call(i || n[a], n[a], a, n) === !1)break;
                return n;
            }, t;
        }(__m4),
        __m8 = function(t) {
            t.inserted = function(e) {
                e = t.makeArray(e);
                for (var n, r, i = !1, a = t.$(document.contains ? document : document.body), s = 0; (r = e[s]) !== undefined; s++) {
                    if (!i) {
                        if (!r.getElementsByTagName)continue;
                        if (!t.has(a, r).length)return;
                        i = !0;
                    }
                    if (i && r.getElementsByTagName) {
                        n = t.makeArray(r.getElementsByTagName("*")), t.trigger(r, "inserted", [], !1);
                        for (var o, u = 0; (o = n[u]) !== undefined; u++)t.trigger(o, "inserted", [], !1);
                    }
                }
            }, t.appendChild = function(e, n) {
                var r;
                r = 11 === n.nodeType ? t.makeArray(n.childNodes) : [n], e.appendChild(n), t.inserted(r);
            }, t.insertBefore = function(e, n, r) {
                var i;
                i = 11 === n.nodeType ? t.makeArray(n.childNodes) : [n], e.insertBefore(n, r), t.inserted(i);
            };
        }(__m4),
        __m2 = function(t, e, n) {
            var r = function(t) { return t.nodeName && (1 === t.nodeType || 9 === t.nodeType) || t == window; };
            t.extend(e, t, {
                trigger: function(n, i, a, s) { r(n) ? t.event.trigger(i, a, n, !s) : n.trigger ? n.trigger(i, a) : ("string" == typeof i && (i = { type: i }), i.target = i.target || n, a && (a.length && "string" == typeof a ? a = [a] : a.length || (a = [a])), a || (a = []), e.dispatch.call(n, i, a)); },
                event: e.event,
                addEvent: e.addEvent,
                removeEvent: e.removeEvent,
                buildFragment: function(e, n) {
                    var r;
                    return e = [e], n = n || document, n = !n.nodeType && n[0] || n, n = n.ownerDocument || n, r = t.buildFragment(e, n), r.cacheable ? t.clone(r.fragment) : r.fragment || r;
                },
                $: t,
                each: e.each,
                bind: function(n, i) { return this.bind && this.bind !== e.bind ? this.bind(n, i) : r(this) ? t.event.add(this, n, i) : e.addEvent.call(this, n, i), this; },
                unbind: function(n, i) { return this.unbind && this.unbind !== e.unbind ? this.unbind(n, i) : r(this) ? t.event.remove(this, n, i) : e.removeEvent.call(this, n, i), this; },
                delegate: function(n, i, a) { return this.delegate ? this.delegate(n, i, a) : r(this) ? t(this).delegate(n, i, a) : e.bind.call(this, i, a), this; },
                undelegate: function(n, i, a) { return this.undelegate ? this.undelegate(n, i, a) : r(this) ? t(this).undelegate(n, i, a) : e.unbind.call(this, i, a), this; },
                proxy: function(t, e) { return function() { return t.apply(e, arguments); }; },
                attr: n
            }), e.on = e.bind, e.off = e.unbind, t.each(["append", "filter", "addClass", "remove", "data", "get", "has"], function(t, n) { e[n] = function(t) { return t[n].apply(t, e.makeArray(arguments).slice(1)); }; });
            var i = t.cleanData;
            t.cleanData = function(n) { t.each(n, function(t, n) { n && e.trigger(n, "removed", [], !1); }), i(n); };
            var a, s = t.fn.domManip;
            if (t.fn.domManip = function() {
                for (var t = 1; arguments.length > t; t++)
                    if ("function" == typeof arguments[t]) {
                        a = t;
                        break;
                    }
                return s.apply(this, arguments);
            }, t(document.createElement("div")).append(document.createElement("div")), t.fn.domManip = 2 === a ? function(t, n, r) {
                return s.call(this, t, n, function(t) {
                    var n;
                    11 === t.nodeType && (n = e.makeArray(t.childNodes));
                    var i = r.apply(this, arguments);
                    return e.inserted(n ? n : [t]), i;
                });
            } : function(t, n) {
                return s.call(this, t, function(t) {
                    var r;
                    11 === t.nodeType && (r = e.makeArray(t.childNodes));
                    var i = n.apply(this, arguments);
                    return e.inserted(r ? r : [t]), i;
                });
            }, e.attr.MutationObserver)
                t.event.special.attributes = {
                    setup: function() {
                        var t = this,
                            n = new e.attr.MutationObserver(function(n) {
                                n.forEach(function(n) {
                                    var r = e.simpleExtend({}, n);
                                    e.trigger(t, r, []);
                                });
                            });
                        n.observe(this, { attributes: !0, attributeOldValue: !0 }), e.data(e.$(this), "canAttributesObserver", n);
                    },
                    teardown: function() { e.data(e.$(this), "canAttributesObserver").disconnect(), t.removeData(this, "canAttributesObserver"); }
                };
            else {
                var o = t.attr;
                t.attr = function(t, n) {
                    var r, i;
                    arguments.length >= 3 && (r = o.call(this, t, n));
                    var a = o.apply(this, arguments);
                    return arguments.length >= 3 && (i = o.call(this, t, n)), i !== r && e.attr.trigger(t, n, r), a;
                };
                var u = t.removeAttr;
                t.removeAttr = function(t, n) {
                    var r = o.call(this, t, n), i = u.apply(this, arguments);
                    return null != r && e.attr.trigger(t, n, r), i;
                }, t.event.special.attributes = { setup: function() { e.data(e.$(this), "canHasAttributesBindings", !0); }, teardown: function() { t.removeData(this, "canHasAttributesBindings"); } };
            }
            return function() {
                var t = "<-\n>", n = e.buildFragment(t, document);
                if (t !== n.childNodes[0].nodeValue) {
                    var r = e.buildFragment;
                    e.buildFragment = function(t, e) {
                        var n = r(t, e);
                        return 1 === n.childNodes.length && 3 === n.childNodes[0].nodeType && (n.childNodes[0].nodeValue = t), n;
                    };
                }
            }(), t.event.special.inserted = {}, t.event.special.removed = {}, e;
        }(jQuery, __m4, __m5, __m6, __m7, __m8),
        __m10 = function(t) {
            var e = t.isFunction,
                n = t.makeArray,
                r = 1,
                i = function(t) {
                    var e = function() { return c.frag(t.apply(this, arguments)); };
                    return e.render = function() { return t.apply(t, arguments); }, e;
                },
                a = function(t, e) { if (!t.length)throw"can.view: No template or empty template:" + e; },
                s = function(e, n) {
                    var r, i, s, o = "string" == typeof e ? e : e.url, u = e.engine && "." + e.engine || o.match(/\.[\w\d]+$/);
                    if (o.match(/^#/) && (o = o.substr(1)), (i = document.getElementById(o)) && (u = "." + i.type.match(/\/(x\-)?(.+)/)[2]), u || c.cached[o] || (o += u = c.ext), t.isArray(u) && (u = u[0]), s = c.toId(o), o.match(/^\/\//) && (o = o.substr(2), o = window.steal ? steal.config().root.mapJoin("" + steal.id(o)) : o), window.require && require.toUrl && (o = require.toUrl(o)), r = c.types[u], c.cached[s])return c.cached[s];
                    if (i)return c.registerView(s, i.innerHTML, r);
                    var l = new t.Deferred;
                    return t.ajax({ async: n, url: o, dataType: "text", error: function(t) { a("", o), l.reject(t); }, success: function(t) { a(t, o), c.registerView(s, t, r, l); } }), l;
                },
                o = function(e) {
                    var n = [];
                    if (t.isDeferred(e))return[e];
                    for (var r in e)t.isDeferred(e[r]) && n.push(e[r]);
                    return n;
                },
                u = function(e) { return t.isArray(e) && "success" === e[1] ? e[0] : e; },
                c = t.view = t.template = function(t, n, r, i) {
                    e(r) && (i = r, r = undefined);
                    var a;
                    return a = e(t) ? t(n, r, i) : c.renderAs("fragment", t, n, r, i);
                };
            return t.extend(c, {
                frag: function(t, e) { return c.hookup(c.fragment(t), e); },
                fragment: function(e) {
                    if ("string" != typeof e && 11 === e.nodeType)return e;
                    var n = t.buildFragment(e, document.body);
                    return n.childNodes.length || n.appendChild(document.createTextNode("")), n;
                },
                toId: function(e) { return t.map(("" + e).split(/\/|\./g), function(t) { return t ? t : undefined; }).join("_"); },
                toStr: function(t) { return null == t ? "" : "" + t; },
                hookup: function(e, n) {
                    var r, i, a = [];
                    return t.each(e.childNodes ? t.makeArray(e.childNodes) : e, function(e) { 1 === e.nodeType && (a.push(e), a.push.apply(a, t.makeArray(e.getElementsByTagName("*")))); }), t.each(a, function(t) { t.getAttribute && (r = t.getAttribute("data-view-id")) && (i = c.hookups[r]) && (i(t, n, r), delete c.hookups[r], t.removeAttribute("data-view-id")); }), e;
                },
                hookups: {},
                hook: function(t) { return c.hookups[++r] = t, " data-view-id='" + r + "'"; },
                cached: {},
                cachedRenderers: {},
                cache: !0,
                register: function(e) {
                    this.types["." + e.suffix] = e, t[e.suffix] = c[e.suffix] = function(t, n) {
                        var r, a;
                        if (!n)
                            return a = function() { return r || (r = e.fragRenderer ? e.fragRenderer(null, t) : i(e.renderer(null, t))), r.apply(this, arguments); }, a.render = function() {
                                var n = e.renderer(null, t);
                                return n.apply(n, arguments);
                            }, a;
                        var s = function() { return r || (r = e.fragRenderer ? e.fragRenderer(t, n) : e.renderer(t, n)), r.apply(this, arguments); };
                        return e.fragRenderer ? c.preload(t, s) : c.preloadStringRenderer(t, s);
                    };
                },
                types: {},
                ext: ".ejs",
                registerScript: function(t, e, n) { return"can.view.preloadStringRenderer('" + e + "'," + c.types["." + t].script(e, n) + ");"; },
                preload: function(e, n) {
                    var r = c.cached[e] = (new t.Deferred).resolve(function(t, e) { return n.call(t, t, e); });
                    return r.__view_id = e, c.cachedRenderers[e] = n, n;
                },
                preloadStringRenderer: function(t, e) { return this.preload(t, i(e)); },
                render: function(e, n, r, i) { return t.view.renderAs("string", e, n, r, i); },
                renderTo: function(t, e, n, r) { return("string" === t && e.render ? e.render : e)(n, r); },
                renderAs: function(r, i, a, l, f) {
                    e(l) && (f = l, l = undefined);
                    var d, h, p, g, m, v = o(a);
                    if (v.length)
                        return h = new t.Deferred, p = t.extend({}, a), v.push(s(i, !0)), t.when.apply(t, v).then(function(e) {
                            var i, s = n(arguments), o = s.pop();
                            if (t.isDeferred(a))p = u(e);
                            else for (var c in a)t.isDeferred(a[c]) && (p[c] = u(s.shift()));
                            i = t.view.renderTo(r, o, p, l), h.resolve(i, p), f && f(i, p);
                        }, function() { h.reject.apply(h, arguments); }), h;
                    if (d = t.__clearReading(), g = e(f), h = s(i, g), d && t.__setReading(d), g)m = h, h.then(function(e) { f(a ? t.view.renderTo(r, e, a, l) : e); });
                    else {
                        if ("resolved" === h.state() && h.__view_id) {
                            var _ = c.cachedRenderers[h.__view_id];
                            return a ? t.view.renderTo(r, _, a, l) : _;
                        }
                        h.then(function(e) { m = a ? t.view.renderTo(r, e, a, l) : e; });
                    }
                    return m;
                },
                registerView: function(e, n, r, a) {
                    var s, o = "object" == typeof r ? r : c.types[r || c.ext];
                    return s = o.fragRenderer ? o.fragRenderer(e, n) : i(o.renderer(e, n)), a = a || new t.Deferred, c.cache && (c.cached[e] = a, a.__view_id = e, c.cachedRenderers[e] = s), a.resolve(s);
                }
            }), t;
        }(__m2),
        __m9 = function(t) {
            var e = t.view.attr = function(t, e) {
                    if (!e) {
                        var i = n[t];
                        if (!i)
                            for (var a = 0, s = r.length; s > a; a++) {
                                var o = r[a];
                                if (o.match.test(t)) {
                                    i = o.handler;
                                    break;
                                }
                            }
                        return i;
                    }
                    "string" == typeof t ? n[t] = e : r.push({ match: t, handler: e });
                },
                n = {},
                r = [],
                i = /[-\:]/,
                a = t.view.tag = function(t, e) {
                    if (!e) {
                        var n = s[t.toLowerCase()];
                        return!n && i.test(t) && (n = function() {}), n;
                    }
                    window.html5 && (window.html5.elements += " " + t, window.html5.shivDocument()), s[t.toLowerCase()] = e;
                },
                s = {};
            return t.view.callbacks = {
                _tags: s,
                _attributes: n,
                _regExpAttributes: r,
                tag: a,
                attr: e,
                tagHandler: function(e, n, r) {
                    var i, a = r.options.attr("tags." + n), o = a || s[n], u = r.scope;
                    if (o) {
                        var c = t.__clearReading();
                        i = o(e, r), t.__setReading(c);
                    } else i = u;
                    if (i && r.subtemplate) {
                        u !== i && (u = u.add(i));
                        var l = r.subtemplate(u, r.options), f = "string" == typeof l ? t.view.frag(l) : l;
                        t.appendChild(e, f);
                    }
                }
            }, t.view.callbacks;
        }(__m2, __m10),
        __m13 = function(t) {
            var e = /_|-/,
                n = /\=\=/,
                r = /([A-Z]+)([A-Z][a-z])/g,
                i = /([a-z\d])([A-Z])/g,
                a = /([a-z\d])([A-Z])/g,
                s = /\{([^\}]+)\}/g,
                o = /"/g,
                u = /'/g,
                c = /-+(.)?/g,
                l = /[a-z][A-Z]/g,
                f = function(t, e, n) {
                    var r = t[e];
                    return r === undefined && n === !0 && (r = t[e] = {}), r;
                },
                d = function(t) { return/^f|^o/.test(typeof t); },
                h = function(t) {
                    var e = null === t || t === undefined || isNaN(t) && "NaN" == "" + t;
                    return"" + (e ? "" : t);
                };
            return t.extend(t, {
                esc: function(t) { return h(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(o, "&#34;").replace(u, "&#39;"); },
                getObject: function(e, n, r) {
                    var i, a, s, o, u = e ? e.split(".") : [], c = u.length, l = 0;
                    if (n = t.isArray(n) ? n : [n || window], o = n.length, !c)return n[0];
                    for (l; o > l; l++) {
                        for (i = n[l], s = undefined, a = 0; c > a && d(i); a++)s = i, i = f(s, u[a]);
                        if (s !== undefined && i !== undefined)break;
                    }
                    if (r === !1 && i !== undefined && delete s[u[a - 1]], r === !0 && i === undefined)for (i = n[0], a = 0; c > a && d(i); a++)i = f(i, u[a], !0);
                    return i;
                },
                capitalize: function(t) { return t.charAt(0).toUpperCase() + t.slice(1); },
                camelize: function(t) { return h(t).replace(c, function(t, e) { return e ? e.toUpperCase() : ""; }); },
                hyphenate: function(t) { return h(t).replace(l, function(t) { return t.charAt(0) + "-" + t.charAt(1).toLowerCase(); }); },
                underscore: function(t) { return t.replace(n, "/").replace(r, "$1_$2").replace(i, "$1_$2").replace(a, "_").toLowerCase(); },
                sub: function(e, n, r) {
                    var i = [];
                    return e = e || "", i.push(e.replace(s, function(e, a) {
                        var s = t.getObject(a, n, r === !0 ? !1 : undefined);
                        return s === undefined || null === s ? (i = null, "") : d(s) && i ? (i.push(s), "") : "" + s;
                    })), null === i ? i : 1 >= i.length ? i[0] : i;
                },
                replacer: s,
                undHash: e
            }), t;
        }(__m2),
        __m12 = function(t) {
            var e = 0;
            return t.Construct = function() { return arguments.length ? t.Construct.extend.apply(t.Construct, arguments) : undefined; }, t.extend(t.Construct, {
                constructorExtends: !0,
                newInstance: function() {
                    var t, e = this.instance();
                    return e.setup && (t = e.setup.apply(e, arguments)), e.init && e.init.apply(e, t || arguments), e;
                },
                _inherit: function(e, n, r) { t.extend(r || e, e || {}); },
                _overwrite: function(t, e, n, r) { t[n] = r; },
                setup: function(e) { this.defaults = t.extend(!0, {}, e.defaults, this.defaults); },
                instance: function() {
                    e = 1;
                    var t = new this;
                    return e = 0, t;
                },
                extend: function(n, r, i) {

                    function a() { return e ? undefined : this.constructor !== a && arguments.length && a.constructorExtends ? a.extend.apply(a, arguments) : a.newInstance.apply(a, arguments); }

                    "string" != typeof n && (i = r, r = n, n = null), i || (i = r, r = null), i = i || {};
                    var s, o, u, c, l, f, d, h, p = this, g = this.prototype;
                    h = this.instance(), t.Construct._inherit(i, g, h);
                    for (l in p)p.hasOwnProperty(l) && (a[l] = p[l]);
                    t.Construct._inherit(r, p, a), n && (s = n.split("."), f = s.pop(), o = t.getObject(s.join("."), window, !0), d = o, u = t.underscore(n.replace(/\./g, "_")), c = t.underscore(f), o[f] = a), t.extend(a, { constructor: a, prototype: h, namespace: d, _shortName: c, fullName: n, _fullName: u }), f !== undefined && (a.shortName = f), a.prototype.constructor = a;
                    var m = [p].concat(t.makeArray(arguments)), v = a.setup.apply(a, m);
                    return a.init && a.init.apply(a, v || m), a;
                }
            }), t.Construct.prototype.setup = function() {}, t.Construct.prototype.init = function() {}, t.Construct;
        }(__m13),
        __m11 = function(t) {
            var e,
                n = function(e, n, r) { return t.bind.call(e, n, r), function() { t.unbind.call(e, n, r); }; },
                r = t.isFunction,
                i = t.extend,
                a = t.each,
                s = [].slice,
                o = /\{([^\}]+)\}/g,
                u = t.getObject("$.event.special", [t]) || {},
                c = function(e, n, r, i) { return t.delegate.call(e, n, r, i), function() { t.undelegate.call(e, n, r, i); }; },
                l = function(e, r, i, a) { return a ? c(e, t.trim(a), r, i) : n(e, r, i); },
                f = t.Control = t.Construct({
                    setup: function() {
                        if (t.Construct.setup.apply(this, arguments), t.Control) {
                            var e, n = this;
                            n.actions = {};
                            for (e in n.prototype)n._isAction(e) && (n.actions[e] = n._action(e));
                        }
                    },
                    _shifter: function(e, n) {
                        var i = "string" == typeof n ? e[n] : n;
                        return r(i) || (i = e[i]), function() { return e.called = n, i.apply(e, [this.nodeName ? t.$(this) : this].concat(s.call(arguments, 0))); };
                    },
                    _isAction: function(t) {
                        var e = this.prototype[t], n = typeof e;
                        return"constructor" !== t && ("function" === n || "string" === n && r(this.prototype[e])) && !!(u[t] || d[t] || /[^\w]/.test(t));
                    },
                    _action: function(n, r) {
                        if (o.lastIndex = 0, r || !o.test(n)) {
                            var i = r ? t.sub(n, this._lookup(r)) : n;
                            if (!i)return null;
                            var a = t.isArray(i), s = a ? i[1] : i, u = s.split(/\s+/g), c = u.pop();
                            return{ processor: d[c] || e, parts: [s, u.join(" "), c], delegate: a ? i[0] : undefined };
                        }
                    },
                    _lookup: function(t) { return[t, window]; },
                    processors: {},
                    defaults: {}
                }, {
                    setup: function(e, n) {
                        var r, a = this.constructor, s = a.pluginName || a._fullName;
                        return this.element = t.$(e), s && "can_control" !== s && this.element.addClass(s), r = t.data(this.element, "controls"), r || (r = [], t.data(this.element, "controls", r)), r.push(this), this.options = i({}, a.defaults, n), this.on(), [this.element, this.options];
                    },
                    on: function(e, n, r, i) {
                        if (!e) {
                            this.off();
                            var a, s, o = this.constructor, u = this._bindings, c = o.actions, f = this.element, d = t.Control._shifter(this, "destroy");
                            for (a in c)c.hasOwnProperty(a) && (s = c[a] || o._action(a, this.options, this), s && (u.control[a] = s.processor(s.delegate || f, s.parts[2], s.parts[1], a, this)));
                            return t.bind.call(f, "removed", d), u.user.push(function(e) { t.unbind.call(e, "removed", d); }), u.user.length;
                        }
                        return"string" == typeof e && (i = r, r = n, n = e, e = this.element), i === undefined && (i = r, r = n, n = null), "string" == typeof i && (i = t.Control._shifter(this, i)), this._bindings.user.push(l(e, r, i, n)), this._bindings.user.length;
                    },
                    off: function() {
                        var t = this.element[0], e = this._bindings;
                        e && (a(e.user || [], function(e) { e(t); }), a(e.control || {}, function(e) { e(t); })), this._bindings = { user: [], control: {} };
                    },
                    destroy: function() {
                        if (null !== this.element) {
                            var e, n = this.constructor, r = n.pluginName || n._fullName;
                            this.off(), r && "can_control" !== r && this.element.removeClass(r), e = t.data(this.element, "controls"), e.splice(t.inArray(this, e), 1), t.trigger(this, "destroyed"), this.element = null;
                        }
                    }
                }),
                d = t.Control.processors;
            return e = function(e, n, r, i, a) { return l(e, n, t.Control._shifter(a, i), r); }, a(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", "keypress", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin", "focusout", "mouseenter", "mouseleave", "touchstart", "touchmove", "touchcancel", "touchend", "touchleave", "inserted", "removed"], function(t) { d[t] = e; }), f;
        }(__m2, __m12),
        __m16 = function(t) { return t.bindAndSetup = function() { return t.addEvent.apply(this, arguments), this._init || (this._bindings ? this._bindings++ : (this._bindings = 1, this._bindsetup && this._bindsetup())), this; }, t.unbindAndTeardown = function() { return t.removeEvent.apply(this, arguments), null === this._bindings ? this._bindings = 0 : this._bindings--, !this._bindings && this._bindteardown && this._bindteardown(), this; }, t; }(__m2),
        __m17 = function(t) {
            var e = t.bubble = {
                event: function(t, e) { return t.constructor._bubbleRule(e, t); },
                childrenOf: function(t, n) { t._each(function(r, i) { r && r.bind && e.toParent(r, t, i, n); }); },
                teardownChildrenFrom: function(t, n) { t._each(function(r) { e.teardownFromParent(t, r, n); }); },
                toParent: function(e, n, r, i) {
                    t.listenTo.call(n, e, i, function() {
                        var i = t.makeArray(arguments), a = i.shift();
                        i[0] = (t.List && n instanceof t.List ? n.indexOf(e) : r) + (i[0] ? "." + i[0] : ""), a.triggeredNS = a.triggeredNS || {}, a.triggeredNS[n._cid] || (a.triggeredNS[n._cid] = !0, t.trigger(n, a, i));
                    });
                },
                teardownFromParent: function(e, n, r) { n && n.unbind && t.stopListening.call(e, n, r); },
                isBubbling: function(t, e) { return t._bubbleBindings && t._bubbleBindings[e]; },
                bind: function(t, n) {
                    if (!t._init) {
                        var r = e.event(t, n);
                        r && (t._bubbleBindings || (t._bubbleBindings = {}), t._bubbleBindings[r] ? t._bubbleBindings[r]++ : (t._bubbleBindings[r] = 1, e.childrenOf(t, r)));
                    }
                },
                unbind: function(n, r) {
                    var i = e.event(n, r);
                    i && (n._bubbleBindings && n._bubbleBindings[i]--, n._bubbleBindings && !n._bubbleBindings[i] && (delete n._bubbleBindings[i], e.teardownChildrenFrom(n, i), t.isEmptyObject(n._bubbleBindings) && delete n._bubbleBindings));
                },
                add: function(n, r, i) { if (r instanceof t.Map && n._bubbleBindings)for (var a in n._bubbleBindings)n._bubbleBindings[a] && (e.teardownFromParent(n, r, a), e.toParent(r, n, i, a)); },
                removeMany: function(t, n) { for (var r = 0, i = n.length; i > r; r++)e.remove(t, n[r]); },
                remove: function(n, r) { if (r instanceof t.Map && n._bubbleBindings)for (var i in n._bubbleBindings)n._bubbleBindings[i] && e.teardownFromParent(n, r, i); },
                set: function(n, r, i, a) { return t.Map.helpers.isObservable(i) && e.add(n, i, r), t.Map.helpers.isObservable(a) && e.remove(n, a), i; }
            };
            return e;
        }(__m2),
        __m18 = function(t) {
            var e = 1, n = 0, r = [], i = [];
            t.batch = {
                start: function(t) { n++, t && i.push(t); },
                stop: function(a, s) {
                    if (a ? n = 0 : n--, 0 === n) {
                        var o, u, c = r.slice(0), l = i.slice(0);
                        for (r = [], i = [], e++, s && t.batch.start(), o = 0, u = c.length; u > o; o++)t.dispatch.apply(c[o][0], c[o][1]);
                        for (o = 0, u = l.length; l.length > o; o++)l[o]();
                    }
                },
                trigger: function(i, a, s) {
                    if (!i._init) {
                        if (0 === n)return t.dispatch.call(i, a, s);
                        a = "string" == typeof a ? { type: a } : a, a.batchNum = e, r.push([i, [a, s]]);
                    }
                }
            };
        }(__m4),
        __m15 = function(t, e, n) {
            var r = null,
                i = function() {
                    for (var t in r)r[t].added && delete r[t].obj._cid;
                    r = null;
                },
                a = function(t) { return r && r[t._cid] && r[t._cid].instance; },
                s = null,
                o = t.Map = t.Construct.extend({
                    setup: function() {
                        if (t.Construct.setup.apply(this, arguments), t.Map) {
                            this.defaults || (this.defaults = {}), this._computes = [];
                            for (var e in this.prototype)"define" !== e && "function" != typeof this.prototype[e] ? this.defaults[e] = this.prototype[e] : this.prototype[e].isComputed && this._computes.push(e);
                            this.helpers.define && this.helpers.define(this);
                        }
                        !t.List || this.prototype instanceof t.List || (this.List = o.List.extend({ Map: this }, {}));
                    },
                    _bubble: n,
                    _bubbleRule: function(t) { return("change" === t || t.indexOf(".") >= 0) && "change"; },
                    _computes: [],
                    bind: t.bindAndSetup,
                    on: t.bindAndSetup,
                    unbind: t.unbindAndTeardown,
                    off: t.unbindAndTeardown,
                    id: "id",
                    helpers: {
                        define: null,
                        attrParts: function(t, e) { return e ? [t] : "object" == typeof t ? t : ("" + t).split("."); },
                        addToMap: function(e, n) {
                            var a;
                            r || (a = i, r = {});
                            var s = e._cid, o = t.cid(e);
                            return r[o] || (r[o] = { obj: e, instance: n, added: !s }), a;
                        },
                        isObservable: function(e) { return e instanceof t.Map || e && e === t.route; },
                        canMakeObserve: function(e) { return e && !t.isDeferred(e) && (t.isArray(e) || t.isPlainObject(e)); },
                        serialize: function(e, n, r) {
                            var i = t.cid(e), a = !1;
                            return s || (a = !0, s = { attr: {}, serialize: {} }), s[n][i] = r, e.each(function(i, a) {
                                var u, c = o.helpers.isObservable(i), l = c && s[n][t.cid(i)];
                                u = l ? l : "serialize" === n ? o.helpers._serialize(e, a, i) : o.helpers._getValue(e, a, i, n), u !== undefined && (r[a] = u);
                            }), t.__reading(e, "__keys"), a && (s = null), r;
                        },
                        _serialize: function(t, e, n) { return o.helpers._getValue(t, e, n, "serialize"); },
                        _getValue: function(t, e, n, r) { return o.helpers.isObservable(n) ? n[r]() : n; }
                    },
                    keys: function(e) {
                        var n = [];
                        t.__reading(e, "__keys");
                        for (var r in e._data)n.push(r);
                        return n;
                    }
                }, {
                    setup: function(e) {
                        this._data = {}, t.cid(this, ".map"), this._init = 1;
                        var n = this._setupDefaults();
                        this._setupComputes(n);
                        var r = e && t.Map.helpers.addToMap(e, this), i = t.extend(t.extend(!0, {}, n), e);
                        this.attr(i), r && r(), this.bind("change", t.proxy(this._changes, this)), delete this._init;
                    },
                    _setupComputes: function() {
                        var t = this.constructor._computes;
                        this._computedBindings = {};
                        for (var e, n = 0, r = t.length; r > n; n++)e = t[n], this[e] = this[e].clone(this), this._computedBindings[e] = { count: 0 };
                    },
                    _setupDefaults: function() { return this.constructor.defaults || {}; },
                    _bindsetup: function() {},
                    _bindteardown: function() {},
                    _changes: function(e, n, r, i, a) { t.batch.trigger(this, { type: n, batchNum: e.batchNum, target: e.target }, [i, a]); },
                    _triggerChange: function(e, r, i, a) { n.isBubbling(this, "change") ? t.batch.trigger(this, { type: "change", target: this }, [e, r, i, a]) : t.batch.trigger(this, e, [i, a]), ("remove" === r || "add" === r) && t.batch.trigger(this, { type: "__keys", target: this }); },
                    _each: function(t) {
                        var e = this.__get();
                        for (var n in e)e.hasOwnProperty(n) && t(e[n], n);
                    },
                    attr: function(e, n) {
                        var r = typeof e;
                        return"string" !== r && "number" !== r ? this._attrs(e, n) : 1 === arguments.length ? (t.__reading(this, e), this._get(e)) : (this._set(e, n), this);
                    },
                    each: function() { return t.each.apply(undefined, [this].concat(t.makeArray(arguments))); },
                    removeAttr: function(e) {
                        var n = t.List && this instanceof t.List, r = t.Map.helpers.attrParts(e), i = r.shift(), a = n ? this[i] : this._data[i];
                        return r.length && a ? a.removeAttr(r) : ("string" == typeof e && ~e.indexOf(".") && (i = e), this._remove(i, a), a);
                    },
                    _remove: function(t, e) { t in this._data && (delete this._data[t], t in this.constructor.prototype || delete this[t], this._triggerChange(t, "remove", undefined, e)); },
                    _get: function(t) {
                        t = "" + t;
                        var e = t.indexOf(".");
                        if (e >= 0) {
                            var n = this.__get(t);
                            if (n !== undefined)return n;
                            var r = t.substr(0, e), i = t.substr(e + 1), a = this.__get(r);
                            return a && a._get ? a._get(i) : undefined;
                        }
                        return this.__get(t);
                    },
                    __get: function(t) { return t ? this._computedBindings[t] ? this[t]() : this._data[t] : this._data; },
                    __type: function(e) {
                        if (!(e instanceof t.Map) && t.Map.helpers.canMakeObserve(e)) {
                            var n = a(e);
                            if (n)return n;
                            if (t.isArray(e)) {
                                var r = t.List;
                                return new r(e);
                            }
                            var i = this.constructor.Map || t.Map;
                            return new i(e);
                        }
                        return e;
                    },
                    _set: function(t, e, n) {
                        t = "" + t;
                        var r, i = t.indexOf(".");
                        if (!n && i >= 0) {
                            var a = t.substr(0, i), s = t.substr(i + 1);
                            if (r = this._init ? undefined : this.__get(a), !o.helpers.isObservable(r))throw"can.Map: Object does not exist";
                            r._set(s, e);
                        } else this.__convert && (e = this.__convert(t, e)), r = this._init ? undefined : this.__get(t), this.__set(t, this.__type(e, t), r);
                    },
                    __set: function(t, e, n) {
                        if (e !== n) {
                            var r = n !== undefined || this.__get().hasOwnProperty(t) ? "set" : "add";
                            this.___set(t, this.constructor._bubble.set(this, t, e, n)), this._triggerChange(t, r, e, n), n && this.constructor._bubble.teardownFromParent(this, n);
                        }
                    },
                    ___set: function(t, e) { this._computedBindings[t] ? this[t](e) : this._data[t] = e, "function" == typeof this.constructor.prototype[t] || this._computedBindings[t] || (this[t] = e); },
                    bind: function(e) {
                        var n = this._computedBindings && this._computedBindings[e];
                        if (n)
                            if (n.count)n.count++;
                            else {
                                n.count = 1;
                                var r = this;
                                n.handler = function(n, i, a) { t.batch.trigger(r, { type: e, batchNum: n.batchNum, target: r }, [i, a]); }, this[e].bind("change", n.handler);
                            }
                        return this.constructor._bubble.bind(this, e), t.bindAndSetup.apply(this, arguments);
                    },
                    unbind: function(e) {
                        var n = this._computedBindings && this._computedBindings[e];
                        return n && (1 === n.count ? (n.count = 0, this[e].unbind("change", n.handler), delete n.handler) : n.count--), this.constructor._bubble.unbind(this, e), t.unbindAndTeardown.apply(this, arguments);
                    },
                    serialize: function() { return t.Map.helpers.serialize(this, "serialize", {}); },
                    _attrs: function(e, n) {
                        if (e === undefined)return o.helpers.serialize(this, "attr", {});
                        e = t.simpleExtend({}, e);
                        var r, i, a = this;
                        t.batch.start(), this.each(function(t, r) {
                            if ("_cid" !== r) {
                                if (i = e[r], i === undefined)return n && a.removeAttr(r), undefined;
                                a.__convert && (i = a.__convert(r, i)), o.helpers.isObservable(i) ? a.__set(r, a.__type(i, r), t) : o.helpers.isObservable(t) && o.helpers.canMakeObserve(i) ? t.attr(i, n) : t !== i && a.__set(r, a.__type(i, r), t), delete e[r];
                            }
                        });
                        for (r in e)"_cid" !== r && (i = e[r], this._set(r, i, !0));
                        return t.batch.stop(), this;
                    },
                    compute: function(e) {
                        if (t.isFunction(this.constructor.prototype[e]))return t.compute(this[e], this);
                        var n = e.split("."), r = n.length - 1, i = { args: [] };
                        return t.compute(function(e) { return arguments.length ? (t.compute.read(this, n.slice(0, r)).value.attr(n[r], e), undefined) : t.compute.read(this, n, i).value; }, this);
                    }
                });
            return o.prototype.on = o.prototype.bind, o.prototype.off = o.prototype.unbind, o;
        }(__m2, __m16, __m17, __m12, __m18),
        __m19 = function(t, e, n) {
            var r = [].splice,
                i = function() {
                    var t = { 0: "a", length: 1 };
                    return r.call(t, 0, 1), !t[0];
                }(),
                a = e.extend({ Map: e }, {
                    setup: function(e, n) {
                        this.length = 0, t.cid(this, ".map"), this._init = 1, this._setupComputes(), e = e || [];
                        var r;
                        t.isDeferred(e) ? this.replace(e) : (r = e.length && t.Map.helpers.addToMap(e, this), this.push.apply(this, t.makeArray(e || []))), r && r(), this.bind("change", t.proxy(this._changes, this)), t.simpleExtend(this, n), delete this._init;
                    },
                    _triggerChange: function(n, r, i, a) {
                        e.prototype._triggerChange.apply(this, arguments);
                        var s = +n;
                        ~n.indexOf(".") || isNaN(s) || ("add" === r ? (t.batch.trigger(this, r, [i, s]), t.batch.trigger(this, "length", [this.length])) : "remove" === r ? (t.batch.trigger(this, r, [a, s]), t.batch.trigger(this, "length", [this.length])) : t.batch.trigger(this, r, [i, s]));
                    },
                    __get: function(e) { return e ? this[e] && this[e].isComputed && t.isFunction(this.constructor.prototype[e]) ? this[e]() : this[e] : this; },
                    ___set: function(t, e) { this[t] = e, +t >= this.length && (this.length = +t + 1); },
                    _remove: function(t, e) { isNaN(+t) ? (delete this[t], this._triggerChange(t, "remove", undefined, e)) : this.splice(t, 1); },
                    _each: function(t) { for (var e = this.__get(), n = 0; e.length > n; n++)t(e[n], n); },
                    serialize: function() { return e.helpers.serialize(this, "serialize", []); },
                    splice: function(e, a) {
                        var s, o, u = t.makeArray(arguments), c = [];
                        for (s = 2; u.length > s; s++)u[s] = n.set(this, s, this.__type(u[s], s)), c.push(u[s]);
                        a === undefined && (a = u[1] = this.length - e);
                        var l = r.apply(this, u), f = l;
                        if (c.length && l.length)for (o = 0; l.length > o; o++)t.inArray(l[o], c) >= 0 && f.splice(o, 1);
                        if (!i)for (s = this.length; l.length + this.length > s; s++)delete this[s];
                        return t.batch.start(), a > 0 && (this._triggerChange("" + e, "remove", undefined, l), n.removeMany(this, l)), u.length > 2 && this._triggerChange("" + e, "add", u.slice(2), l), t.batch.stop(), l;
                    },
                    _attrs: function(n, r) { return n === undefined ? e.helpers.serialize(this, "attr", []) : (n = t.makeArray(n), t.batch.start(), this._updateAttrs(n, r), t.batch.stop(), undefined); },
                    _updateAttrs: function(t, n) {
                        for (var r = Math.min(t.length, this.length), i = 0; r > i; i++) {
                            var a = this[i], s = t[i];
                            e.helpers.isObservable(a) && e.helpers.canMakeObserve(s) ? a.attr(s, n) : a !== s && this._set(i, s);
                        }
                        t.length > this.length ? this.push.apply(this, t.slice(this.length)) : t.length < this.length && n && this.splice(t.length);
                    }
                }),
                s = function(e) { return e[0] && t.isArray(e[0]) ? e[0] : t.makeArray(e); };
            return t.each({ push: "length", unshift: 0 }, function(t, e) {
                var r = [][e];
                a.prototype[e] = function() {
                    for (var e, i, a = [], s = t ? this.length : 0, o = arguments.length; o--;)i = arguments[o], a[o] = n.set(this, o, this.__type(i, o));
                    return e = r.apply(this, a), (!this.comparator || a.length) && this._triggerChange("" + s, "add", a, undefined), e;
                };
            }), t.each({ pop: "length", shift: 0 }, function(t, e) {
                a.prototype[e] = function() {
                    var r = s(arguments), i = t && this.length ? this.length - 1 : 0, a = [][e].apply(this, r);
                    return this._triggerChange("" + i, "remove", undefined, [a]), a && a.unbind && n.remove(this, a), a;
                };
            }), t.extend(a.prototype, {
                indexOf: function(e, n) { return this.attr("length"), t.inArray(e, this, n); },
                join: function() { return[].join.apply(this.attr(), arguments); },
                reverse: function() {
                    var e = t.makeArray([].reverse.call(this));
                    this.replace(e);
                },
                slice: function() {
                    var t = Array.prototype.slice.apply(this, arguments);
                    return new this.constructor(t);
                },
                concat: function() {
                    var e = [];
                    return t.each(t.makeArray(arguments), function(n, r) { e[r] = n instanceof t.List ? n.serialize() : n; }), new this.constructor(Array.prototype.concat.apply(this.serialize(), e));
                },
                forEach: function(e, n) { return t.each(this, e, n || this); },
                replace: function(e) { return t.isDeferred(e) ? e.then(t.proxy(this.replace, this)) : this.splice.apply(this, [0, this.length].concat(t.makeArray(e || []))), this; },
                filter: function(e, n) {
                    var r, i = new t.List, a = this;
                    return this.each(function(t, s) { r = e.call(n | a, t, s, a), r && i.push(t); }), i;
                }
            }), t.List = e.List = a, t.List;
        }(__m2, __m15, __m17),
        __m20 = function(t) {
            var e = [];
            t.__read = function(t, n) {
                e.push({});
                var r = t.call(n);
                return{ value: r, observed: e.pop() };
            }, t.__reading = function(t, n) { e.length && (e[e.length - 1][t._cid + "|" + n] = { obj: t, event: n + "" }); }, t.__clearReading = function() {
                if (e.length) {
                    var t = e[e.length - 1];
                    return e[e.length - 1] = {}, t;
                }
            }, t.__setReading = function(t) { e.length && (e[e.length - 1] = t); }, t.__addReading = function(n) { e.length && t.simpleExtend(e[e.length - 1], n); };
            var n = function(e, n, i, s) {
                    var o = t.__read(e, n), u = o.observed;
                    return r(i, u, s), a(i, s), o;
                },
                r = function(t, e, n) { for (var r in e)i(t, e, r, n); },
                i = function(t, e, n, r) {
                    if (t[n])delete t[n];
                    else {
                        var i = e[n];
                        i.obj.bind(i.event, r);
                    }
                },
                a = function(t, e) {
                    for (var n in t) {
                        var r = t[n];
                        r.obj.unbind(r.event, e);
                    }
                },
                s = function(e, n, r, i) { n !== r && t.batch.trigger(e, i ? { type: "change", batchNum: i } : "change", [n, r]); },
                o = function(e, r, i, a) {
                    var s, o, u;
                    return{
                        on: function(c) {
                            o || (o = function(t) {
                                if (e.bound && (t.batchNum === undefined || t.batchNum !== u)) {
                                    var a = s.value;
                                    s = n(r, i, s.observed, o), c(s.value, a, t.batchNum), u = u = t.batchNum;
                                }
                            }), s = n(r, i, {}, o), a(s.value), e.hasDependencies = !t.isEmptyObject(s.observed);
                        },
                        off: function() {
                            for (var t in s.observed) {
                                var e = s.observed[t];
                                e.obj.unbind(e.event, o);
                            }
                        }
                    };
                },
                u = function(e, r, i, a) {
                    var s, o, u, c;
                    return{
                        on: function(l) {
                            u || (u = function(t) {
                                if (e.bound && (t.batchNum === undefined || t.batchNum !== c)) {
                                    var n = r.call(i);
                                    l(n, o, t.batchNum), o = n, c = c = t.batchNum;
                                }
                            }), s = n(r, i, {}, u), o = s.value, a(s.value), e.hasDependencies = !t.isEmptyObject(s.observed);
                        },
                        off: function() {
                            for (var t in s.observed) {
                                var e = s.observed[t];
                                e.obj.unbind(e.event, u);
                            }
                        }
                    };
                },
                c = function(e) { return e instanceof t.Map || e && e.__get; },
                l = function() {};
            t.compute = function(n, r, i, a) {
                if (n && n.isComputed)return n;
                for (var c, f, d, h = l, p = l, g = function() { return f; }, m = function(t) { f = t; }, v = m, _ = [], b = function(t, e, n) { v(t), s(c, t, e, n); }, y = 0, x = arguments.length; x > y; y++)_[y] = arguments[y];
                if (c = function(n) {
                    if (arguments.length) {
                        var i = f, a = m.call(r, n, i);
                        return c.hasDependencies ? g.call(r) : (f = a === undefined ? g.call(r) : a, s(c, f, i), f);
                    }
                    return e.length && c.canReadForChangeEvent !== !1 && (t.__reading(c, "change"), c.bound || t.compute.temporarilyBind(c)), c.bound ? f : g.call(r);
                }, "function" == typeof n) {
                    m = n, g = n, c.canReadForChangeEvent = i === !1 ? !1 : !0;
                    var w = a ? u(c, n, r || this, v) : o(c, n, r || this, v);
                    h = w.on, p = w.off;
                } else if (r)
                    if ("string" == typeof r) {
                        var k = r, M = n instanceof t.Map;
                        if (M) {
                            c.hasDependencies = !0;
                            var C;
                            g = function() { return n.attr(k); }, m = function(t) { n.attr(k, t); }, h = function(e) { C = function(t, n, r) { e(n, r, t.batchNum); }, n.bind(i || k, C), f = t.__read(g).value; }, p = function() { n.unbind(i || k, C); };
                        } else g = function() { return n[k]; }, m = function(t) { n[k] = t; }, h = function(e) { C = function() { e(g(), f); }, t.bind.call(n, i || k, C), f = t.__read(g).value; }, p = function() { t.unbind.call(n, i || k, C); };
                    } else if ("function" == typeof r)f = n, m = r, r = i, d = "setter";
                    else {
                        f = n;
                        var A = r, N = b;
                        if (r = A.context || A, g = A.get || g, m = A.set || function() { return f; }, A.fn) {
                            var O, T = A.fn;
                            g = function() { return T.call(r, f); }, 0 === T.length ? O = o(c, T, r, v) : 1 === T.length ? O = o(c, function() { return T.call(r, f); }, r, v) : (b = function(t) { t !== undefined && N(t, f); }, O = o(c, function() {
                                var t = T.call(r, f, function(t) { N(t, f); });
                                return t !== undefined ? t : f;
                            }, r, v)), h = O.on, p = O.off;
                        } else
                            b = function() {
                                var t = g.call(r);
                                N(t, f);
                            };
                        h = A.on || h, p = A.off || p;
                    }
                else f = n;
                return t.cid(c, "compute"), t.simpleExtend(c, {
                    isComputed: !0,
                    _bindsetup: function() {
                        this.bound = !0;
                        var e = t.__clearReading();
                        h.call(this, b), t.__setReading(e);
                    },
                    _bindteardown: function() { p.call(this, b), this.bound = !1; },
                    bind: t.bindAndSetup,
                    unbind: t.unbindAndTeardown,
                    clone: function(e) { return e && ("setter" === d ? _[2] = e : _[1] = e), t.compute.apply(t, _); }
                });
            };
            var f,
                d = function() {
                    for (var t = 0, e = f.length; e > t; t++)f[t].unbind("change", l);
                    f = null;
                };
            return t.compute.temporarilyBind = function(t) { t.bind("change", l), f || (f = [], setTimeout(d, 10)), f.push(t); }, t.compute.truthy = function(e) {
                return t.compute(function() {
                    var t = e();
                    return"function" == typeof t && (t = t()), !!t;
                });
            }, t.compute.async = function(e, n, r) { return t.compute(e, { fn: n, context: r }); }, t.compute.read = function(e, n, r) {
                r = r || {};
                for (var i, a, s, o = e, u = 0, l = n.length; l > u; u++)if (a = o, a && a.isComputed && (r.foundObservable && r.foundObservable(a, u), a = a()), c(a) ? (!s && r.foundObservable && r.foundObservable(a, u), s = 1, o = "function" == typeof a[n[u]] && a.constructor.prototype[n[u]] === a[n[u]] ? r.returnObserveMethods ? o[n[u]] : "constructor" === n[u] && a instanceof t.Construct ? a[n[u]] : a[n[u]].apply(a, r.args || []) : o.attr(n[u])) : o = a[n[u]], i = typeof o, o && o.isComputed && !r.isArgument && l - 1 > u ? (!s && r.foundObservable && r.foundObservable(a, u + 1), o = o()) : n.length - 1 > u && "function" === i && r.executeAnonymousFunctions && !(t.Construct && o.prototype instanceof t.Construct) && (o = o()), n.length - 1 > u && (null === o || "function" !== i && "object" !== i))return r.earlyExit && r.earlyExit(a, u, o), { value: undefined, parent: a };
                return"function" != typeof o || t.Construct && o.prototype instanceof t.Construct || (r.isArgument ? o.isComputed || r.proxyMethods === !1 || (o = t.proxy(o, a)) : (o.isComputed && !s && r.foundObservable && r.foundObservable(o, u), o = o.call(a))), o === undefined && r.earlyExit && r.earlyExit(a, u - 1), { value: o, parent: a };
            }, t.compute;
        }(__m2, __m16, __m18),
        __m14 = function(t) { return t.Observe = t.Map, t.Observe.startBatch = t.batch.start, t.Observe.stopBatch = t.batch.stop, t.Observe.triggerBatch = t.batch.trigger, t; }(__m2, __m15, __m19, __m20),
        __m22 = function(t) {
            var e = /(\\)?\./g,
                n = /\\\./g,
                r = function(t) {
                    var r = [], i = 0;
                    return t.replace(e, function(e, a, s) { a || (r.push(t.slice(i, s).replace(n, ".")), i = s + e.length); }), r.push(t.slice(i).replace(n, ".")), r;
                },
                i = t.Construct.extend({ read: t.compute.read }, {
                    init: function(t, e) { this._context = t, this._parent = e, this.__cache = {}; },
                    attr: function(e) {
                        var n = t.__clearReading(), r = this.read(e, { isArgument: !0, returnObserveMethods: !0, proxyMethods: !1 }).value;
                        return t.__setReading(n), r;
                    },
                    add: function(t) { return t !== this._context ? new this.constructor(t, this) : this; },
                    computeData: function(e, n) {
                        n = n || { args: [] };
                        var r,
                            i,
                            a = this,
                            s = {
                                compute: t.compute(function(o) {
                                    if (!arguments.length) {
                                        if (r)return t.compute.read(r, i, n).value;
                                        var u = a.read(e, n);
                                        return r = u.rootObserve, i = u.reads, s.scope = u.scope, s.initialValue = u.value, s.reads = u.reads, s.root = r, u.value;
                                    }
                                    if (r.isComputed && !i.length)r(o);
                                    else {
                                        var c = i.length - 1;
                                        t.compute.read(r, i.slice(0, c)).value.attr(i[c], o);
                                    }
                                })
                            };
                        return s;
                    },
                    compute: function(t, e) { return this.computeData(t, e).compute; },
                    read: function(e, n) {
                        var i;
                        if ("./" === e.substr(0, 2))i = !0, e = e.substr(2);
                        else {
                            if ("../" === e.substr(0, 3))return this._parent.read(e.substr(3), n);
                            if (".." === e)return{ value: this._parent._context };
                            if ("." === e || "this" === e)return{ value: this._context };
                        }
                        for (var a, s, o, u, c, l, f = -1 === e.indexOf("\\.") ? e.split(".") : r(e), d = this, h = [], p = -1; d;) {
                            if (a = d._context, null !== a) {
                                var g = t.compute.read(a, f, t.simpleExtend({ foundObservable: function(t, e) { c = t, l = f.slice(e); }, earlyExit: function(e, n) { n > p && (s = c, h = l, p = n, u = d, o = t.__clearReading()); }, executeAnonymousFunctions: !0 }, n));
                                if (g.value !== undefined)return{ scope: d, rootObserve: c, value: g.value, reads: l };
                            }
                            t.__clearReading(), d = i ? null : d._parent;
                        }
                        return s ? (t.__setReading(o), { scope: u, rootObserve: s, reads: h, value: undefined }) : { names: f, value: undefined };
                    }
                });
            return t.view.Scope = i, i;
        }(__m2, __m12, __m15, __m19, __m10, __m20),
        __m24 = function(t) {
            var e = function() { return 1 === t.$(document.createComment("~")).length; }(),
                n = {
                    tagToContentPropMap: { option: "textContent" in document.createElement("option") ? "textContent" : "innerText", textarea: "value" },
                    attrMap: t.attr.map,
                    attrReg: /([^\s=]+)[\s]*=[\s]*/,
                    defaultValue: t.attr.defaultValue,
                    tagMap: { "": "span", colgroup: "col", table: "tbody", tr: "td", ol: "li", ul: "li", tbody: "tr", thead: "tr", tfoot: "tr", select: "option", optgroup: "option" },
                    reverseTagMap: { col: "colgroup", tr: "tbody", option: "select", td: "tr", th: "tr", li: "ul" },
                    getParentNode: function(t, e) { return e && 11 === t.parentNode.nodeType ? e : t.parentNode; },
                    setAttr: t.attr.set,
                    getAttr: t.attr.get,
                    removeAttr: t.attr.remove,
                    contentText: function(t) { return"string" == typeof t ? t : t || 0 === t ? "" + t : ""; },
                    after: function(e, n) {
                        var r = e[e.length - 1];
                        r.nextSibling ? t.insertBefore(r.parentNode, n, r.nextSibling) : t.appendChild(r.parentNode, n);
                    },
                    replace: function(r, i) { n.after(r, i), t.remove(t.$(r)).length < r.length && !e && t.each(r, function(t) { 8 === t.nodeType && t.parentNode.removeChild(t); }); }
                };
            return t.view.elements = n, n;
        }(__m2, __m10),
        __m23 = function(can, elements, viewCallbacks) {
            var newLine = /(\r|\n)+/g,
                notEndTag = /\//,
                clean = function(t) { return t.split("\\").join("\\\\").split("\n").join("\\n").split('"').join('\\"').split("	").join("\\t"); },
                getTag = function(t, e, n) {
                    if (t)return t;
                    for (; e.length > n;) {
                        if ("<" === e[n] && !notEndTag.test(e[n + 1]))return elements.reverseTagMap[e[n + 1]] || "span";
                        n++;
                    }
                    return"";
                },
                bracketNum = function(t) { return--t.split("{").length - --t.split("}").length; },
                myEval = function(script) { eval(script); },
                attrReg = /([^\s]+)[\s]*=[\s]*$/,
                startTxt = "var ___v1ew = [];",
                finishTxt = "return ___v1ew.join('')",
                put_cmd = "___v1ew.push(\n",
                insert_cmd = put_cmd,
                htmlTag = null,
                quote = null,
                beforeQuote = null,
                rescan = null,
                getAttrName = function() {
                    var t = beforeQuote.match(attrReg);
                    return t && t[1];
                },
                status = function() { return quote ? "'" + getAttrName() + "'" : htmlTag ? 1 : 0; },
                top = function(t) { return t[t.length - 1]; },
                Scanner;
            return can.view.Scanner = Scanner = function(t) {
                can.extend(this, { text: {}, tokens: [] }, t), this.text.options = this.text.options || "", this.tokenReg = [], this.tokenSimple = { "<": "<", ">": ">", '"': '"', "'": "'" }, this.tokenComplex = [], this.tokenMap = {};
                for (var e, n = 0; e = this.tokens[n]; n++)e[2] ? (this.tokenReg.push(e[2]), this.tokenComplex.push({ abbr: e[1], re: RegExp(e[2]), rescan: e[3] })) : (this.tokenReg.push(e[1]), this.tokenSimple[e[1]] = e[0]), this.tokenMap[e[0]] = e[1];
                this.tokenReg = RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")", "g");
            }, Scanner.prototype = {
                helpers: [],
                scan: function(t, e) {
                    var n = [], r = 0, i = this.tokenSimple, a = this.tokenComplex;
                    t = t.replace(newLine, "\n"), this.transform && (t = this.transform(t)), t.replace(this.tokenReg, function(e, s) {
                        var o = arguments[arguments.length - 2];
                        if (o > r && n.push(t.substring(r, o)), i[e])n.push(e);
                        else
                            for (var u, c = 0; u = a[c]; c++)
                                if (u.re.test(e)) {
                                    n.push(u.abbr), u.rescan && n.push(u.rescan(s));
                                    break;
                                }
                        r = o + s.length;
                    }), t.length > r && n.push(t.substr(r));
                    var s, o, u, c, l = "", f = [startTxt + (this.text.start || "")], d = function(t, e) { f.push(put_cmd, '"', clean(t), '"' + (e || "") + ");"); }, h = [], p = null, g = !1, m = { attributeHookups: [], tagHookups: [], lastTagHookup: "" }, v = function() { m.lastTagHookup = m.tagHookups.pop() + m.tagHookups.length; }, _ = "", b = [], y = !1, x = !1, w = 0, k = this.tokenMap;
                    for (htmlTag = quote = beforeQuote = null; (u = n[w++]) !== undefined;) {
                        if (null === p)
                            switch (u) {
                            case k.left:
                            case k.escapeLeft:
                            case k.returnLeft:
                                g = htmlTag && 1;
                            case k.commentLeft:
                                p = u, l.length && d(l), l = "";
                                break;
                            case k.escapeFull:
                                g = htmlTag && 1, rescan = 1, p = k.escapeLeft, l.length && d(l), rescan = n[w++], l = rescan.content || rescan, rescan.before && d(rescan.before), n.splice(w, 0, k.right);
                                break;
                            case k.commentFull:
                                break;
                            case k.templateLeft:
                                l += k.left;
                                break;
                            case"<":
                                0 !== n[w].indexOf("!--") && (htmlTag = 1, g = 0), l += u;
                                break;
                            case">":
                                htmlTag = 0;
                                var M = "/" === l.substr(l.length - 1) || "--" === l.substr(l.length - 2), C = "";
                                if (m.attributeHookups.length && (C = "attrs: ['" + m.attributeHookups.join("','") + "'], ", m.attributeHookups = []), _ + m.tagHookups.length !== m.lastTagHookup && _ === top(m.tagHookups))M && (l = l.substr(0, l.length - 1)), f.push(put_cmd, '"', clean(l), '"', ",can.view.pending({tagName:'" + _ + "'," + C + "scope: " + (this.text.scope || "this") + this.text.options), M ? (f.push("}));"), l = "/>", v()) : "<" === n[w] && n[w + 1] === "/" + _ ? (f.push("}));"), l = u, v()) : (f.push(",subtemplate: function(" + this.text.argNames + "){\n" + startTxt + (this.text.start || "")), l = "");
                                else if (g || !y && elements.tagToContentPropMap[b[b.length - 1]] || C) {
                                    var A = ",can.view.pending({" + C + "scope: " + (this.text.scope || "this") + this.text.options + '}),"';
                                    M ? d(l.substr(0, l.length - 1), A + '/>"') : d(l, A + '>"'), l = "", g = 0;
                                } else l += u;
                                (M || y) && (b.pop(), _ = b[b.length - 1], y = !1), m.attributeHookups = [];
                                break;
                            case"'":
                            case'"':
                                if (htmlTag)
                                    if (quote && quote === u) {
                                        quote = null;
                                        var N = getAttrName();
                                        if (viewCallbacks.attr(N) && m.attributeHookups.push(N), x) {
                                            l += u, d(l), f.push(finishTxt, "}));\n"), l = "", x = !1;
                                            break;
                                        }
                                    } else if (null === quote && (quote = u, beforeQuote = s, c = getAttrName(), "img" === _ && "src" === c || "style" === c)) {
                                        d(l.replace(attrReg, "")), l = "", x = !0, f.push(insert_cmd, "can.view.txt(2,'" + getTag(_, n, w) + "'," + status() + ",this,function(){", startTxt), d(c + "=" + u);
                                        break;
                                    }
                            default:
                                if ("<" === s) {
                                    _ = "!--" === u.substr(0, 3) ? "!--" : u.split(/\s/)[0];
                                    var O, T = !1;
                                    0 === _.indexOf("/") && (T = !0, O = _.substr(1)), T ? (top(b) === O && (_ = O, y = !0), top(m.tagHookups) === O && (d(l.substr(0, l.length - 1)), f.push(finishTxt + "}}) );"), l = "><", v())) : (_.lastIndexOf("/") === _.length - 1 && (_ = _.substr(0, _.length - 1)), "!--" !== _ && viewCallbacks.tag(_) && ("content" === _ && elements.tagMap[top(b)] && (u = u.replace("content", elements.tagMap[top(b)])), m.tagHookups.push(_)), b.push(_));
                                }
                                l += u;
                            }
                        else
                            switch (u) {
                            case k.right:
                            case k.returnRight:
                                switch (p) {
                                case k.left:
                                    o = bracketNum(l), 1 === o ? (f.push(insert_cmd, "can.view.txt(0,'" + getTag(_, n, w) + "'," + status() + ",this,function(){", startTxt, l), h.push({ before: "", after: finishTxt + "}));\n" })) : (r = h.length && -1 === o ? h.pop() : { after: ";" }, r.before && f.push(r.before), f.push(l, ";", r.after));
                                    break;
                                case k.escapeLeft:
                                case k.returnLeft:
                                    o = bracketNum(l), o && h.push({ before: finishTxt, after: "}));\n" });
                                    for (var L = p === k.escapeLeft ? 1 : 0, S = { insert: insert_cmd, tagName: getTag(_, n, w), status: status(), specialAttribute: x }, j = 0; this.helpers.length > j; j++) {
                                        var E = this.helpers[j];
                                        if (E.name.test(l)) {
                                            l = E.fn(l, S), E.name.source === /^>[\s]*\w*/.source && (L = 0);
                                            break;
                                        }
                                    }
                                    "object" == typeof l ? l.startTxt && l.end && x ? f.push(insert_cmd, "can.view.toStr( ", l.content, "() ) );") : (l.startTxt ? f.push(insert_cmd, "can.view.txt(\n" + ("string" == typeof status() || (null != l.escaped ? l.escaped : L)) + ",\n'" + _ + "',\n" + status() + ",\nthis,\n") : l.startOnlyTxt && f.push(insert_cmd, "can.view.onlytxt(this,\n"), f.push(l.content), l.end && f.push("));")) : x ? f.push(insert_cmd, l, ");") : f.push(insert_cmd, "can.view.txt(\n" + ("string" == typeof status() || L) + ",\n'" + _ + "',\n" + status() + ",\nthis,\nfunction(){ " + (this.text.escape || "") + "return ", l, o ? startTxt : "}));\n"), rescan && rescan.after && rescan.after.length && (d(rescan.after.length), rescan = null);
                                }
                                p = null, l = "";
                                break;
                            case k.templateLeft:
                                l += k.left;
                                break;
                            default:
                                l += u;
                            }
                        s = u;
                    }
                    l.length && d(l), f.push(";");
                    var R = f.join(""), D = { out: (this.text.outStart || "") + R + " " + finishTxt + (this.text.outEnd || "") };
                    return myEval.call(D, "this.fn = (function(" + this.text.argNames + "){" + D.out + "});\r\n//# sourceURL=" + e + ".js"), D;
                }
            }, can.view.pending = function(t) {
                var e = can.view.getHooks();
                return can.view.hook(function(n) {
                    can.each(e, function(t) { t(n); }), t.templateType = "legacy", t.tagName && viewCallbacks.tagHandler(n, t.tagName, t), can.each(t && t.attrs || [], function(e) {
                        t.attributeName = e;
                        var r = viewCallbacks.attr(e);
                        r && r(n, t);
                    });
                });
            }, can.view.tag("content", function(t, e) { return e.scope; }), can.view.Scanner = Scanner, Scanner;
        }(__m10, __m24, __m9),
        __m27 = function(t) {
            var e = !0;
            try {
                document.createTextNode("")._ = 0;
            } catch (n) {
                e = !1;
            }
            var r = {},
                i = {},
                a = "ejs_" + Math.random(),
                s = 0,
                o = function(t, n) {
                    var r = n || i, o = u(t, r);
                    return o ? o : e || 3 !== t.nodeType ? (++s, t[a] = (t.nodeName ? "element_" : "obj_") + s) : (++s, r["text_" + s] = t, "text_" + s);
                },
                u = function(t, n) {
                    if (e || 3 !== t.nodeType)return t[a];
                    for (var r in n)if (n[r] === t)return r;
                },
                c = [].splice,
                l = [].push,
                f = function(t) {
                    for (var e = 0, n = 0, r = t.length; r > n; n++) {
                        var i = t[n];
                        i.nodeType ? e++ : e += f(i);
                    }
                    return e;
                },
                d = function(t, e) {
                    for (var n = {}, r = 0, i = t.length; i > r; r++) {
                        var a = h.first(t[r]);
                        n[o(a, e)] = t[r];
                    }
                    return n;
                },
                h = {
                    id: o,
                    update: function(e, n) {
                        var r = h.unregisterChildren(e);
                        n = t.makeArray(n);
                        var i = e.length;
                        return c.apply(e, [0, i].concat(n)), e.replacements ? h.nestReplacements(e) : h.nestList(e), r;
                    },
                    nestReplacements: function(t) {
                        for (var e = 0, n = {}, r = d(t.replacements, n), i = t.replacements.length; t.length > e && i;) {
                            var a = t[e], s = r[u(a, n)];
                            s && (t.splice(e, f(s), s), i--), e++;
                        }
                        t.replacements = [];
                    },
                    nestList: function(t) {
                        for (var e = 0; t.length > e;) {
                            var n = t[e], i = r[o(n)];
                            i ? i !== t && t.splice(e, f(i), i) : r[o(n)] = t, e++;
                        }
                    },
                    last: function(t) {
                        var e = t[t.length - 1];
                        return e.nodeType ? e : h.last(e);
                    },
                    first: function(t) {
                        var e = t[0];
                        return e.nodeType ? e : h.first(e);
                    },
                    register: function(t, e, n) { return t.unregistered = e, t.parentList = n, n === !0 ? t.replacements = [] : n ? (n.replacements.push(t), t.replacements = []) : h.nestList(t), t; },
                    unregisterChildren: function(e) {
                        var n = [];
                        return t.each(e, function(t) { t.nodeType ? (e.replacements || delete r[o(t)], n.push(t)) : l.apply(n, h.unregister(t)); }), n;
                    },
                    unregister: function(t) {
                        var e = h.unregisterChildren(t);
                        if (t.unregistered) {
                            var n = t.unregistered;
                            delete t.unregistered, delete t.replacements, n();
                        }
                        return e;
                    },
                    nodeMap: r
                };
            return t.view.nodeLists = h, h;
        }(__m2, __m24),
        __m28 = function(t) {

            function e(t) {
                for (var e = {}, n = t.split(","), r = 0; n.length > r; r++)e[n[r]] = !0;
                return e;
            }

            var n = "-A-Za-z0-9_",
                r = "[a-zA-Z_:][" + n + ":.]+",
                i = "\\s*=\\s*",
                a = '"((?:\\\\.|[^"])*)"',
                s = "'((?:\\\\.|[^'])*)'",
                o = "(?:" + i + "(?:" + "(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",
                u = "\\{\\{[^\\}]*\\}\\}\\}?",
                c = "\\{\\{([^\\}]*)\\}\\}\\}?",
                l = RegExp("^<([" + n + "]+)" + "(" + "(?:\\s*" + "(?:(?:" + "(?:" + r + ")?" + o + ")|" + "(?:" + u + ")+)" + ")*" + ")\\s*(\\/?)>"),
                f = RegExp("^<\\/([" + n + "]+)[^>]*>"),
                d = RegExp("(?:(?:(" + r + ")|" + c + ")" + "(?:" + i + "(?:" + "(?:" + a + ")|(?:" + s + ")|([^>\\s]+)" + ")" + ")?)", "g"),
                h = RegExp(c, "g"),
                p = /<|\{\{/,
                g = e("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed"),
                m = e("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"),
                v = e("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),
                _ = e("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"),
                b = e("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),
                y = e("script,style"),
                x = function(t, e) {

                    function n(t, n, i, a) {
                        if (n = n.toLowerCase(), m[n])for (; u.last() && v[u.last()];)r("", u.last());
                        _[n] && u.last() === n && r("", n), a = g[n] || !!a, e.start(n, a), a || u.push(n), x.parseAttrs(i, e), e.end(n, a);
                    }

                    function r(t, n) {
                        var r;
                        if (n)for (r = u.length - 1; r >= 0 && u[r] !== n; r--);
                        else r = 0;
                        if (r >= 0) {
                            for (var i = u.length - 1; i >= r; i--)e.close && e.close(u[i]);
                            u.length = r;
                        }
                    }

                    function i(t, n) { e.special && e.special(n); }

                    var a, s, o, u = [], c = t;
                    for (u.last = function() { return this[this.length - 1]; }; t;) {
                        if (s = !0, u.last() && y[u.last()])t = t.replace(RegExp("([\\s\\S]*?)</" + u.last() + "[^>]*>"), function(t, n) { return n = n.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2"), e.chars && e.chars(n), ""; }), r("", u.last());
                        else if (0 === t.indexOf("<!--") ? (a = t.indexOf("-->"), a >= 0 && (e.comment && e.comment(t.substring(4, a)), t = t.substring(a + 3), s = !1)) : 0 === t.indexOf("</") ? (o = t.match(f), o && (t = t.substring(o[0].length), o[0].replace(f, r), s = !1)) : 0 === t.indexOf("<") ? (o = t.match(l), o && (t = t.substring(o[0].length), o[0].replace(l, n), s = !1)) : 0 === t.indexOf("{{") && (o = t.match(h), o && (t = t.substring(o[0].length), o[0].replace(h, i))), s) {
                            a = t.search(p);
                            var d = 0 > a ? t : t.substring(0, a);
                            t = 0 > a ? "" : t.substring(a), e.chars && d && e.chars(d);
                        }
                        if (t === c)throw"Parse Error: " + t;
                        c = t;
                    }
                    r(), e.done();
                };
            return x.parseAttrs = function(t, e) {
                (null != t ? t : "").replace(d, function(t, n, r, i, a, s) {
                    if (r && e.special(r), n || i || a || s) {
                        var o = arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : arguments[5] ? arguments[5] : b[n.toLowerCase()] ? n : "";
                        e.attrStart(n || "");
                        for (var u, c = h.lastIndex = 0, l = h.exec(o); l;)u = o.substring(c, h.lastIndex - l[0].length), u.length && e.attrValue(u), e.special(l[1]), c = h.lastIndex, l = h.exec(o);
                        u = o.substr(c, o.length), u && e.attrValue(u), e.attrEnd(n || "");
                    }
                });
            }, t.view.parser = x, x;
        }(__m10),
        __m26 = function(t, e, n, r, i) {
            e = e || t.view.elements, r = r || t.view.NodeLists, i = i || t.view.parser;
            var a = function(e, n, r) {
                    var i = !1, a = function() { return i || (i = !0, r(s), t.unbind.call(e, "removed", a)), !0; }, s = { teardownCheck: function(t) { return t ? !1 : a(); } };
                    return t.bind.call(e, "removed", a), n(s), s;
                },
                s = function(t, e, n) { return a(t, function() { e.bind("change", n); }, function(t) { e.unbind("change", n), t.nodeList && r.unregister(t.nodeList); }); },
                o = function(t) {
                    var e, n = {};
                    return i.parseAttrs(t, { attrStart: function(t) { n[t] = "", e = t; }, attrValue: function(t) { n[e] += t; }, attrEnd: function() {} }), n;
                },
                u = [].splice,
                c = function(t) { return t && t.nodeType; },
                l = function(t) { t.childNodes.length || t.appendChild(document.createTextNode("")); },
                f = {
                    list: function(n, i, s, o, c, l) {
                        var d,
                            h = l || [n],
                            p = [],
                            g = function(n, i, a) {
                                var c = document.createDocumentFragment(), f = [], d = [];
                                t.each(i, function(e, n) {
                                    var i = [];
                                    l && r.register(i, null, !0);
                                    var u = t.compute(n + a), h = s.call(o, e, u, i), p = "string" == typeof h, g = t.frag(h);
                                    g = p ? t.view.hookup(g) : g;
                                    var m = t.makeArray(g.childNodes);
                                    l ? (r.update(i, m), f.push(i)) : f.push(r.register(m)), c.appendChild(g), d.push(u);
                                });
                                var g = a + 1;
                                if (h[g]) {
                                    var m = r.first(h[g]);
                                    t.insertBefore(m.parentNode, c, m);
                                } else e.after(1 === g ? [v] : [r.last(h[g - 1])], c);
                                u.apply(h, [g, 0].concat(f)), u.apply(p, [a, 0].concat(d));
                                for (var _ = a + d.length, b = p.length; b > _; _++)p[_](_);
                            },
                            m = function(e, n, i, a, s) {
                                if (a || !y.teardownCheck(v.parentNode)) {
                                    var o = h.splice(i + 1, n.length), u = [];
                                    t.each(o, function(t) {
                                        var e = r.unregister(t);
                                        [].push.apply(u, e);
                                    }), p.splice(i, n.length);
                                    for (var c = i, l = p.length; l > c; c++)p[c](c);
                                    s || t.remove(t.$(u));
                                }
                            },
                            v = document.createTextNode(""),
                            _ = function(t) { d && d.unbind && d.unbind("add", g).unbind("remove", m), m({}, { length: h.length - 1 }, 0, !0, t); },
                            b = function(t, e) { _(), d = e || [], d.bind && d.bind("add", g).bind("remove", m), g({}, d, 0); };
                        c = e.getParentNode(n, c);
                        var y = a(c, function() { t.isFunction(i) && i.bind("change", b); }, function() { t.isFunction(i) && i.unbind("change", b), _(!0); });
                        l ? (e.replace(h, v), r.update(h, [v]), l.unregistered = y.teardownCheck) : f.replace(h, v, y.teardownCheck), b({}, t.isFunction(i) ? i() : i);
                    },
                    html: function(n, i, a, o) {
                        var u;
                        a = e.getParentNode(n, a), u = s(a, i, function(t, e) {
                            var n = r.first(f).parentNode;
                            n && d(e), u.teardownCheck(r.first(f).parentNode);
                        });
                        var f = o || [n],
                            d = function(n) {
                                var i = !c(n), s = t.frag(n), o = t.makeArray(f);
                                l(s), i && (s = t.view.hookup(s, a)), o = r.update(f, s.childNodes), e.replace(o, s);
                            };
                        u.nodeList = f, o ? o.unregistered = u.teardownCheck : r.register(f, u.teardownCheck), d(i());
                    },
                    replace: function(n, i, a) {
                        var s = n.slice(0), o = t.frag(i);
                        return r.register(n, a), "string" == typeof i && (o = t.view.hookup(o, n[0].parentNode)), r.update(n, o.childNodes), e.replace(s, o), n;
                    },
                    text: function(n, i, a, o) {
                        var u = e.getParentNode(n, a), c = s(u, i, function(e, n) { "unknown" != typeof l.nodeValue && (l.nodeValue = t.view.toStr(n)), c.teardownCheck(l.parentNode); }), l = document.createTextNode(t.view.toStr(i()));
                        o ? (o.unregistered = c.teardownCheck, c.nodeList = o, r.update(o, [l]), e.replace([n], l)) : c.nodeList = f.replace([n], l, c.teardownCheck);
                    },
                    setAttributes: function(e, n) {
                        var r = o(n);
                        for (var i in r)t.attr.set(e, i, r[i]);
                    },
                    attributes: function(n, r, i) {
                        var a = {},
                            u = function(r) {
                                var i, s = o(r);
                                for (i in s) {
                                    var u = s[i], c = a[i];
                                    u !== c && t.attr.set(n, i, u), delete a[i];
                                }
                                for (i in a)e.removeAttr(n, i);
                                a = s;
                            };
                        s(n, r, function(t, e) { u(e); }), arguments.length >= 3 ? a = o(i) : u(r());
                    },
                    attributePlaceholder: "__!!__",
                    attributeReplace: /__!!__/g,
                    attribute: function(n, r, i) {
                        s(n, i, function() { e.setAttr(n, r, u.render()); });
                        var a, o = t.$(n);
                        a = t.data(o, "hooks"), a || t.data(o, "hooks", a = {});
                        var u, c = e.getAttr(n, r), l = c.split(f.attributePlaceholder), d = [];
                        d.push(l.shift(), l.join(f.attributePlaceholder)), a[r] ? a[r].computes.push(i) : a[r] = {
                            render: function() {
                                var t = 0, n = c ? c.replace(f.attributeReplace, function() { return e.contentText(u.computes[t++]()); }) : e.contentText(u.computes[t++]());
                                return n;
                            },
                            computes: [i],
                            batchNum: undefined
                        }, u = a[r], d.splice(1, 0, i()), e.setAttr(n, r, d.join(""));
                    },
                    specialAttribute: function(t, n, r) { s(t, r, function(r, i) { e.setAttr(t, n, h(i)); }), e.setAttr(t, n, h(r())); },
                    simpleAttribute: function(t, n, r) { s(t, r, function(r, i) { e.setAttr(t, n, i); }), e.setAttr(t, n, r()); }
                };
            f.attr = f.simpleAttribute, f.attrs = f.attributes;
            var d = /(\r|\n)+/g,
                h = function(t) {
                    var n = /^["'].*["']$/;
                    return t = t.replace(e.attrReg, "").replace(d, ""), n.test(t) ? t.substr(1, t.length - 2) : t;
                };
            return t.view.live = f, f;
        }(__m2, __m24, __m10, __m27, __m28),
        __m25 = function(t, e, n) {
            var r,
                i = [],
                a = function(t) {
                    var n = e.tagMap[t] || "span";
                    return"span" === n ? "@@!!@@" : "<" + n + ">" + a(n) + "</" + n + ">";
                },
                s = function(e, n) {
                    if ("string" == typeof e)return e;
                    if (!e && 0 !== e)return"";
                    var r = e.hookup && function(t, n) { e.hookup.call(e, t, n); } || "function" == typeof e && e;
                    return r ? n ? "<" + n + " " + t.view.hook(r) + "></" + n + ">" : (i.push(r), "") : "" + e;
                },
                o = function(e, n) { return"string" == typeof e || "number" == typeof e ? t.esc(e) : s(e, n); },
                u = !1,
                c = function() {};
            return t.extend(t.view, {
                live: n,
                setupLists: function() {
                    var e, n = t.view.lists;
                    return t.view.lists = function(t, n) { return e = { list: t, renderer: n }, Math.random(); }, function() { return t.view.lists = n, e; };
                },
                getHooks: function() {
                    var t = i.slice(0);
                    return r = t, i = [], t;
                },
                onlytxt: function(t, e) { return o(e.call(t)); },
                txt: function(l, f, d, h, p) {
                    var g, m, v, _, b = e.tagMap[f] || "span", y = !1, x = c;
                    if (u)g = p.call(h);
                    else {
                        ("string" == typeof d || 1 === d) && (u = !0);
                        var w = t.view.setupLists();
                        x = function() { v.unbind("change", c); }, v = t.compute(p, h, !1), v.bind("change", c), m = w(), g = v(), u = !1, y = v.hasDependencies;
                    }
                    if (m)return x(), "<" + b + t.view.hook(function(t, e) { n.list(t, m.list, m.renderer, h, e); }) + "></" + b + ">";
                    if (!y || "function" == typeof g)return x(), (u || 2 === l || !l ? s : o)(g, 0 === d && b);
                    var k = e.tagToContentPropMap[f];
                    return 0 !== d || k ? 1 === d ? (i.push(function(t) { n.attributes(t, v, v()), x(); }), v()) : 2 === l ? (_ = d, i.push(function(t) { n.specialAttribute(t, _, v), x(); }), v()) : (_ = 0 === d ? k : d, (0 === d ? r : i).push(function(t) { n.attribute(t, _, v), x(); }), n.attributePlaceholder) : "<" + b + t.view.hook(l && "object" != typeof g ? function(t, e) { n.text(t, v, e), x(); } : function(t, e) { n.html(t, v, e), x(); }) + ">" + a(b) + "</" + b + ">";
                }
            }), t;
        }(__m10, __m24, __m26, __m13),
        __m21 = function(t) {
            t.view.ext = ".mustache";
            var e = "scope",
                n = "___h4sh",
                r = "{scope:" + e + ",options:options}",
                i = "{scope:" + e + ",options:options, special: true}",
                a = e + ",options",
                s = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
                o = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,
                u = function(t) { return'{get:"' + t.replace(/"/g, '\\"') + '"}'; },
                c = function(t) { return t && "string" == typeof t.get; },
                l = function(e) { return e instanceof t.Map || e && !!e._get; },
                f = function(t) { return t && t.splice && "number" == typeof t.length; },
                d = function(e, n, r) {
                    var i = function(t, r) { return e(t || n, r); };
                    return function(e, a) { return e === undefined || e instanceof t.view.Scope || (e = n.add(e)), a === undefined || a instanceof t.view.Options || (a = r.add(a)), i(e, a || r); };
                },
                h = function(e) {
                    if (this.constructor !== h) {
                        var n = new h(e);
                        return function(t, e) { return n.render(t, e); };
                    }
                    return"function" == typeof e ? (this.template = { fn: e }, undefined) : (t.extend(this, e), this.template = this.scanner.scan(this.text, this.name), undefined);
                };
            t.Mustache = window.Mustache = h, h.prototype.render = function(e, n) { return e instanceof t.view.Scope || (e = new t.view.Scope(e || {})), n instanceof t.view.Options || (n = new t.view.Options(n || {})), n = n || {}, this.template.fn.call(e, e, n); }, t.extend(h.prototype, {
                scanner: new t.view.Scanner({
                    text: { start: "", scope: e, options: ",options: options", argNames: a },
                    tokens: [["returnLeft", "{{{", "{{[{&]"], ["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"], ["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"], ["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function(t) { return{ before: /^\n.+?\n$/.test(t) ? "\n" : "", content: t.match(/\{\{(.+?)\}\}/)[1] || "" }; }], ["escapeLeft", "{{"], ["returnRight", "}}}"], ["right", "}}"]],
                    helpers: [
                        {
                            name: /^>[\s]*\w*/,
                            fn: function(e) {
                                var n = t.trim(e.replace(/^>\s?/, "")).replace(/["|']/g, "");
                                return"can.Mustache.renderPartial('" + n + "'," + a + ")";
                            }
                        }, {
                            name: /^\s*data\s/,
                            fn: function(t) {
                                var n = t.match(/["|'](.*)["|']/)[1];
                                return"can.proxy(function(__){can.data(can.$(__),'" + n + "', this.attr('.')); }, " + e + ")";
                            }
                        }, {
                            name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                            fn: function(t) {
                                var n = /\s*\(([\$\w]+)\)\s*->([^\n]*)/, r = t.match(n);
                                return"can.proxy(function(__){var " + r[1] + "=can.$(__);with(" + e + ".attr('.')){" + r[2] + "}}, this);";
                            }
                        }, {
                            name: /^.*$/,
                            fn: function(e, c) {
                                var l = !1, f = { content: "", startTxt: !1, startOnlyTxt: !1, end: !1 };
                                if (e = t.trim(e), e.length && (l = e.match(/^([#^/]|else$)/))) {
                                    switch (l = l[0]) {
                                    case"#":
                                    case"^":
                                        c.specialAttribute ? f.startOnlyTxt = !0 : (f.startTxt = !0, f.escaped = 0);
                                        break;
                                    case"/":
                                        return f.end = !0, f.content += 'return ___v1ew.join("");}}])', f;
                                    }
                                    e = e.substring(1);
                                }
                                if ("else" !== l) {
                                    var d, h = [], p = [], g = 0;
                                    f.content += "can.Mustache.txt(\n" + (c.specialAttribute ? i : r) + ",\n" + (l ? '"' + l + '"' : "null") + ",", (t.trim(e) + " ").replace(s, function(t, e) { g && (d = e.match(o)) ? d[2] ? h.push(d[0]) : p.push(d[4] + ":" + (d[6] ? d[6] : u(d[5]))) : h.push(u(e)), g++; }), f.content += h.join(","), p.length && (f.content += ",{" + n + ":{" + p.join(",") + "}}");
                                }
                                switch (l && "else" !== l && (f.content += ",[\n\n"), l) {
                                case"^":
                                case"#":
                                    f.content += "{fn:function(" + a + "){var ___v1ew = [];";
                                    break;
                                case"else":
                                    f.content += 'return ___v1ew.join("");}},\n{inverse:function(' + a + "){\nvar ___v1ew = [];";
                                    break;
                                default:
                                    f.content += ")";
                                }
                                return l || (f.startTxt = !0, f.end = !0), f;
                            }
                        }
                    ]
                })
            });
            for (var p = t.view.Scanner.prototype.helpers, g = 0; p.length > g; g++)h.prototype.scanner.helpers.unshift(p[g]);
            return h.txt = function(e, r, i) {
                for (var a, s, o = e.scope, u = e.options, p = [], g = { fn: function() {}, inverse: function() {} }, m = o.attr("."), v = !0, _ = 3; arguments.length > _; _++) {
                    var b = arguments[_];
                    if (r && t.isArray(b))g = t.extend.apply(t, [g].concat(b));
                    else if (b && b[n]) {
                        a = b[n];
                        for (var y in a)c(a[y]) && (a[y] = h.get(a[y].get, e, !1, !0));
                    } else b && c(b) ? p.push(h.get(b.get, e, !1, !0)) : p.push(b);
                }
                if (c(i)) {
                    var x = i.get;
                    i = h.get(i.get, e, p.length, !1), v = x === i;
                }
                if (g.fn = d(g.fn, o, u), g.inverse = d(g.inverse, o, u), "^" === r) {
                    var w = g.fn;
                    g.fn = g.inverse, g.inverse = w;
                }
                return(s = v && "string" == typeof i && h.getHelper(i, u) || t.isFunction(i) && !i.isComputed && { fn: i }) ? (t.extend(g, { context: m, scope: o, contexts: o, hash: a }), p.push(g), function() { return s.fn.apply(m, p) || ""; }) : function() {
                    var e;
                    e = t.isFunction(i) && i.isComputed ? i() : i;
                    var n, a, s, o = p.length ? p : [e], u = !0, c = [];
                    if (r)for (n = 0; o.length > n; n++)s = o[n], a = s !== undefined && l(s), f(s) ? "#" === r ? u = u && !!(a ? s.attr("length") : s.length) : "^" === r && (u = u && !(a ? s.attr("length") : s.length)) : u = "#" === r ? u && !!s : "^" === r ? u && !s : u;
                    if (u) {
                        if ("#" === r) {
                            if (f(e)) {
                                var d = l(e);
                                for (n = 0; e.length > n; n++)c.push(g.fn(d ? e.attr("" + n) : e[n]));
                                return c.join("");
                            }
                            return g.fn(e || {}) || "";
                        }
                        return"^" === r ? g.inverse(e || {}) || "" : "" + (null != e ? e : "");
                    }
                    return"";
                };
            }, h.get = function(e, n, r, i) {
                var a = n.scope.attr("."), s = n.options || {};
                if (r) {
                    if (h.getHelper(e, s))return e;
                    if (n.scope && t.isFunction(a[e]))return a[e];
                }
                var o = n.scope.computeData(e, { isArgument: i, args: [a, n.scope] }), u = o.compute;
                t.compute.temporarilyBind(u);
                var c = o.initialValue;
                return c !== undefined && o.scope === n.scope || !h.getHelper(e, s) ? u.hasDependencies ? u : c : e;
            }, h.resolve = function(e) { return l(e) && f(e) && e.attr("length") ? e : t.isFunction(e) ? e() : e; }, t.view.Options = t.view.Scope.extend({ init: function(e) { e.helpers || e.partials || e.tags || (e = { helpers: e }), t.view.Scope.prototype.init.apply(this, arguments); } }), h._helpers = {}, h.registerHelper = function(t, e) { this._helpers[t] = { name: t, fn: e }; }, h.getHelper = function(t, e) {
                var n = e.attr("helpers." + t);
                return n ? { fn: n } : this._helpers[t];
            }, h.render = function(e, n, r) {
                if (!t.view.cached[e]) {
                    var i = t.__clearReading();
                    n.attr("partial") && (e = n.attr("partial")), t.__setReading(i);
                }
                return t.view.render(e, n, r);
            }, h.safeString = function(t) { return{ toString: function() { return t; } }; }, h.renderPartial = function(e, n, r) {
                var i = r.attr("partials." + e);
                return i ? i.render ? i.render(n, r) : i(n, r) : t.Mustache.render(e, n, r);
            }, t.each({
                "if": function(e, n) {
                    var r;
                    return r = t.isFunction(e) ? t.compute.truthy(e)() : !!h.resolve(e), r ? n.fn(n.contexts || this) : n.inverse(n.contexts || this);
                },
                unless: function(e, n) { return h._helpers["if"].fn.apply(this, [t.isFunction(e) ? t.compute(function() { return!e(); }) : !e, n]); },
                each: function(e, n) {
                    var r, i, a, s = h.resolve(e), o = [];
                    if (t.view.lists && (s instanceof t.List || e && e.isComputed && s === undefined))return t.view.lists(e, function(t, e) { return n.fn(n.scope.add({ "@index": e }).add(t)); });
                    if (e = s, e && f(e)) {
                        for (a = 0; e.length > a; a++)o.push(n.fn(n.scope.add({ "@index": a }).add(e[a])));
                        return o.join("");
                    }
                    if (l(e)) {
                        for (r = t.Map.keys(e), a = 0; r.length > a; a++)i = r[a], o.push(n.fn(n.scope.add({ "@key": i }).add(e[i])));
                        return o.join("");
                    }
                    if (e instanceof Object) {
                        for (i in e)o.push(n.fn(n.scope.add({ "@key": i }).add(e[i])));
                        return o.join("");
                    }
                },
                "with": function(t, e) {
                    var n = t;
                    return t = h.resolve(t), t ? e.fn(n) : undefined;
                },
                log: function(t, e) { "undefined" != typeof console && console.log && (e ? console.log(t, e.context) : console.log(t.context)); }
            }, function(t, e) { h.registerHelper(e, t); }), t.view.register({ suffix: "mustache", contentType: "x-mustache-template", script: function(t, e) { return"can.Mustache(function(" + a + ") { " + new h({ text: e, name: t }).template.out + " })"; }, renderer: function(t, e) { return h({ text: e, name: t }); } }), t.mustache.registerHelper = t.proxy(t.Mustache.registerHelper, t.Mustache), t.mustache.safeString = t.Mustache.safeString, t;
        }(__m2, __m22, __m10, __m23, __m20, __m25),
        __m29 = function(t) {
            var e = function() {
                    var t = { "": !0, "true": !0, "false": !1 },
                        e = function(e) {
                            if (e && e.getAttribute) {
                                var n = e.getAttribute("contenteditable");
                                return t[n];
                            }
                        };
                    return function(t) {
                        var n = e(t);
                        return"boolean" == typeof n ? n : !!e(t.parentNode);
                    };
                }(),
                n = function(t) { return"{" === t[0] && "}" === t[t.length - 1] ? t.substr(1, t.length - 2) : t; };
            t.view.attr("can-value", function(r, u) {
                var c, l, f = n(r.getAttribute("can-value")), d = u.scope.computeData(f, { args: [] }).compute;
                return"input" === r.nodeName.toLowerCase() && ("checkbox" === r.type && (c = t.attr.has(r, "can-true-value") ? r.getAttribute("can-true-value") : !0, l = t.attr.has(r, "can-false-value") ? r.getAttribute("can-false-value") : !1), "checkbox" === r.type || "radio" === r.type) ? (new a(r, { value: d, trueValue: c, falseValue: l }), undefined) : "select" === r.nodeName.toLowerCase() && r.multiple ? (new s(r, { value: d }), undefined) : e(r) ? (new o(r, { value: d }), undefined) : (new i(r, { value: d }), undefined);
            });
            var r = { enter: function(t, e, n) { return{ event: "keyup", handler: function(t) { return 13 === t.keyCode ? n.call(this, t) : undefined; } }; } };
            t.view.attr(/can-[\w\.]+/, function(e, i) {
                var a = i.attributeName,
                    s = a.substr("can-".length),
                    o = function(r) {
                        var s = n(e.getAttribute(a)), o = i.scope.read(s, { returnObserveMethods: !0, isArgument: !0 });
                        return o.value.call(o.parent, i.scope._context, t.$(this), r);
                    };
                if (r[s]) {
                    var u = r[s](i, e, o);
                    o = u.handler, s = u.event;
                }
                t.bind.call(e, s, o);
            });
            var i = t.Control.extend({
                    init: function() { "SELECT" === this.element[0].nodeName.toUpperCase() ? setTimeout(t.proxy(this.set, this), 1) : this.set(); },
                    "{value} change": "set",
                    set: function() {
                        if (this.element) {
                            var t = this.options.value();
                            this.element[0].value = null == t ? "" : t;
                        }
                    },
                    change: function() { this.element && this.options.value(this.element[0].value); }
                }),
                a = t.Control.extend({
                    init: function() { this.isCheckbox = "checkbox" === this.element[0].type.toLowerCase(), this.check(); },
                    "{value} change": "check",
                    check: function() {
                        if (this.isCheckbox) {
                            var e = this.options.value(), n = this.options.trueValue || !0;
                            this.element[0].checked = e === n;
                        } else {
                            var r = this.options.value() == this.element[0].value ? "set" : "remove";
                            t.attr[r](this.element[0], "checked", !0);
                        }
                    },
                    change: function() { this.isCheckbox ? this.options.value(this.element[0].checked ? this.options.trueValue : this.options.falseValue) : this.element[0].checked && this.options.value(this.element[0].value); }
                }),
                s = i.extend({
                    init: function() { this.delimiter = ";", this.set(); },
                    set: function() {
                        var e = this.options.value();
                        "string" == typeof e ? (e = e.split(this.delimiter), this.isString = !0) : e && (e = t.makeArray(e));
                        var n = {};
                        t.each(e, function(t) { n[t] = !0; }), t.each(this.element[0].childNodes, function(t) { t.value && (t.selected = !!n[t.value]); });
                    },
                    get: function() {
                        var e = [], n = this.element[0].childNodes;
                        return t.each(n, function(t) { t.selected && t.value && e.push(t.value); }), e;
                    },
                    change: function() {
                        var e = this.get(), n = this.options.value();
                        this.isString || "string" == typeof n ? (this.isString = !0, this.options.value(e.join(this.delimiter))) : n instanceof t.List ? n.attr(e, !0) : this.options.value(e);
                    }
                }),
                o = t.Control.extend({
                    init: function() { this.set(), this.on("blur", "setValue"); },
                    "{value} change": "set",
                    set: function() {
                        var t = this.options.value();
                        this.element[0].innerHTML = t === undefined ? "" : t;
                    },
                    setValue: function() { this.options.value(this.element[0].innerHTML); }
                });
        }(__m2, __m21, __m11),
        __m1 = function(t, e) {
            var n = /^(dataViewId|class|id)$/i,
                r = /\{([^\}]+)\}/g,
                i = t.Component = t.Construct.extend({
                    setup: function() {
                        if (t.Construct.setup.apply(this, arguments), t.Component) {
                            var e = this, n = this.prototype.scope;
                            if (this.Control = a.extend(this.prototype.events), n && ("object" != typeof n || n instanceof t.Map) ? n.prototype instanceof t.Map && (this.Map = n) : this.Map = t.Map.extend(n || {}), this.attributeScopeMappings = {}, t.each(this.Map ? this.Map.defaults : {}, function(t, n) { "@" === t && (e.attributeScopeMappings[n] = n); }), this.prototype.template)
                                if ("function" == typeof this.prototype.template) {
                                    var r = this.prototype.template;
                                    this.renderer = function() { return t.view.frag(r.apply(null, arguments)); };
                                } else this.renderer = t.view.mustache(this.prototype.template);
                            t.view.tag(this.prototype.tag, function(t, n) { new e(t, n); });
                        }
                    }
                }, {
                    setup: function(r, i) {
                        var a, s, o, u = {}, c = this, l = {};
                        if (t.each(this.constructor.attributeScopeMappings, function(e, n) { u[n] = r.getAttribute(t.hyphenate(e)); }), t.each(t.makeArray(r.attributes), function(o) {
                            var f = t.camelize(o.nodeName.toLowerCase()), d = o.value;
                            if (!(c.constructor.attributeScopeMappings[f] || n.test(f) || e.attr(o.nodeName))) {
                                if ("{" === d[0] && "}" === d[d.length - 1])d = d.substr(1, d.length - 2);
                                else if ("legacy" !== i.templateType)return u[f] = d, undefined;
                                var h = i.scope.computeData(d, { args: [] }), p = h.compute, g = function(t, e) { a = f, s.attr(f, e), a = null; };
                                p.bind("change", g), u[f] = p(), p.hasDependencies ? (t.bind.call(r, "removed", function() { p.unbind("change", g); }), l[f] = h) : p.unbind("change", g);
                            }
                        }), this.constructor.Map)s = new this.constructor.Map(u);
                        else if (this.scope instanceof t.Map)s = this.scope;
                        else if (t.isFunction(this.scope)) {
                            var f = this.scope(u, i.scope, r);
                            s = f instanceof t.Map ? f : f.prototype instanceof t.Map ? new f(u) : new(t.Map.extend(f))(u);
                        }
                        var d = {};
                        t.each(l, function(t, e) { d[e] = function(n, r) { a !== e && t.compute(r); }, s.bind(e, d[e]); }), t.bind.call(r, "removed", function() { t.each(d, function(t, e) { s.unbind(e, d[e]); }); }), t.isEmptyObject(this.constructor.attributeScopeMappings) && "legacy" === i.templateType || t.bind.call(r, "attributes", function(e) {
                            var n = t.camelize(e.attributeName);
                            l[n] || s.attr(n, r.getAttribute(e.attributeName));
                        }), this.scope = s, t.data(t.$(r), "scope", this.scope);
                        var h = i.scope.add(this.scope), p = { helpers: {} };
                        t.each(this.helpers || {}, function(e, n) { t.isFunction(e) && (p.helpers[n] = function() { return e.apply(s, arguments); }); }), this._control = new this.constructor.Control(r, { scope: this.scope }), this.constructor.renderer ? (p.tags || (p.tags = {}), p.tags.content = function g(e, n) {
                            var r = i.subtemplate || n.subtemplate;
                            r && (delete p.tags.content, t.view.live.replace([e], r(n.scope, n.options)), p.tags.content = g);
                        }, o = this.constructor.renderer(h, i.options.add(p))) : o = "legacy" === i.templateType ? t.view.frag(i.subtemplate ? i.subtemplate(h, i.options.add(p)) : "") : i.subtemplate ? i.subtemplate(h, i.options.add(p)) : document.createDocumentFragment(), t.appendChild(r, o);
                    }
                }),
                a = t.Control.extend({
                    _lookup: function(t) { return[t.scope, t, window]; },
                    _action: function(e, n, i) {
                        var a, s;
                        if (r.lastIndex = 0, a = r.test(e), i || !a) {
                            if (a) {
                                s = t.compute(function() {
                                    var i,
                                        a = e.replace(r, function(e, r) {
                                            var a;
                                            return"scope" === r ? (i = n.scope, "") : (r = r.replace(/^scope\./, ""), a = t.compute.read(n.scope, r.split("."), { isArgument: !0 }).value, a === undefined && (a = t.getObject(r)), "string" == typeof a ? a : (i = a, ""));
                                        }),
                                        s = a.split(/\s+/g),
                                        o = s.pop();
                                    return{ processor: this.processors[o] || this.processors.click, parts: [a, s.join(" "), o], delegate: i || undefined };
                                }, this);
                                var o = function(t, n) { i._bindings.control[e](i.element), i._bindings.control[e] = n.processor(n.delegate || i.element, n.parts[2], n.parts[1], e, i); };
                                return s.bind("change", o), i._bindings.readyComputes[e] = { compute: s, handler: o }, s();
                            }
                            return t.Control._action.apply(this, arguments);
                        }
                    }
                }, { setup: function(e, n) { return this.scope = n.scope, t.Control.prototype.setup.call(this, e, n); }, off: function() { this._bindings && t.each(this._bindings.readyComputes || {}, function(t) { t.compute.unbind("change", t.handler); }), t.Control.prototype.off.apply(this, arguments), this._bindings.readyComputes = {}; } });
            return window.$ && $.fn && ($.fn.scope = function(t) { return t ? this.data("scope").attr(t) : this.data("scope"); }), t.scope = function(e, n) { return e = t.$(e), n ? t.data(e, "scope").attr(n) : t.data(e, "scope"); }, i;
        }(__m2, __m9, __m11, __m14, __m21, __m29),
        __m30 = function(t) {
            var e = function(e, n, r) {
                    var i = new t.Deferred;
                    return e.then(function() {
                        var e = t.makeArray(arguments), a = !0;
                        try {
                            e[0] = r.apply(n, e);
                        } catch (s) {
                            a = !1, i.rejectWith(i, [s].concat(e));
                        }
                        a && i.resolveWith(i, e);
                    }, function() { i.rejectWith(this, arguments); }), "function" == typeof e.abort && (i.abort = function() { return e.abort(); }), i;
                },
                n = 0,
                r = function(e) { return t.__reading(e, e.constructor.id), e.__get(e.constructor.id); },
                i = function(e, n, r, i, a, s) {
                    var o = {};
                    if ("string" == typeof e) {
                        var u = e.split(/\s+/);
                        o.url = u.pop(), u.length && (o.type = u.pop());
                    } else t.extend(o, e);
                    return o.data = "object" != typeof n || t.isArray(n) ? n : t.extend(o.data || {}, n), o.url = t.sub(o.url, o.data, !0), t.ajax(t.extend({ type: r || "post", dataType: i || "json", success: a, error: s }, o));
                },
                a = function(n, i, a, s, o) {
                    var u;
                    t.isArray(n) ? (u = n[1], n = n[0]) : u = n.serialize(), u = [u];
                    var c, l, f = n.constructor;
                    return("update" === i || "destroy" === i) && u.unshift(r(n)), l = f[i].apply(f, u), c = e(l, n, function(t) { return n[o || i + "d"](t, l), n; }), l.abort && (c.abort = function() { l.abort(); }), c.then(a, s), c;
                },
                s = {
                    models: function(e) {
                        return function(n, r) {
                            if (t.Model._reqs++, n) {
                                if (n instanceof this.List)return n;
                                var i = this, a = [], s = i.List || g, o = r instanceof t.List ? r : new s, u = t.isArray(n), c = n instanceof g, l = u ? n : c ? n.serialize() : t.getObject(e || "data", n);
                                if (l === undefined)throw Error("Could not get any raw data while converting using .models");
                                return o.length && o.splice(0), t.each(l, function(t) { a.push(i.model(t)); }), o.push.apply(o, a), u || t.each(n, function(t, e) { "data" !== e && o.attr(e, t); }), setTimeout(t.proxy(this._clean, this), 1), o;
                            }
                        };
                    },
                    model: function(e) {
                        return function(n) {
                            if (n) {
                                "function" == typeof n.serialize && (n = n.serialize()), this.parseModel ? n = this.parseModel.apply(this, arguments) : e && (n = t.getObject(e || "data", n));
                                var r = n[this.id], i = (r || 0 === r) && this.store[r] ? this.store[r].attr(n, this.removeAttr || !1) : new this(n);
                                return i;
                            }
                        };
                    }
                },
                o = function(e) { return function(n) { return e ? t.getObject(e || "data", n) : n; }; },
                u = { parseModel: o, parseModels: o },
                c = {
                    create: { url: "_shortName", type: "post" },
                    update: {
                        data: function(e, n) {
                            n = n || {};
                            var r = this.id;
                            return n[r] && n[r] !== e && (n["new" + t.capitalize(e)] = n[r], delete n[r]), n[r] = e, n;
                        },
                        type: "put"
                    },
                    destroy: { type: "delete", data: function(t, e) { return e = e || {}, e.id = e[this.id] = t, e; } },
                    findAll: { url: "_shortName" },
                    findOne: {}
                },
                l = function(t, e) { return function(n) { return n = t.data ? t.data.apply(this, arguments) : n, i(e || this[t.url || "_url"], n, t.type || "get"); }; },
                f = function(t, e) {
                    if (t.resource) {
                        var n = t.resource.replace(/\/+$/, "");
                        return"findAll" === e || "create" === e ? n : n + "/{" + t.id + "}";
                    }
                };
            t.Model = t.Map.extend({
                fullName: "can.Model",
                _reqs: 0,
                setup: function(e, r, i, a) {
                    if ("string" !== r && (a = i, i = r), a || (a = i), this.store = {}, t.Map.setup.apply(this, arguments), t.Model) {
                        i && i.List ? (this.List = i.List, this.List.Map = this) : this.List = e.List.extend({ Map: this }, {});
                        var o = this, d = t.proxy(this._clean, o);
                        t.each(c, function(n, r) {
                            if (t.isFunction(o[r]) || (o[r] = l(n, o[r] ? o[r] : f(o, r))), o["make" + t.capitalize(r)]) {
                                var i = o["make" + t.capitalize(r)](o[r]);
                                t.Construct._overwrite(o, e, r, function() {
                                    t.Model._reqs++;
                                    var e = i.apply(this, arguments), n = e.then(d, d);
                                    return n.abort = e.abort, n;
                                });
                            }
                        }), t.each(s, function(n, r) {
                            var i = "parse" + t.capitalize(r), s = o[r];
                            "string" == typeof s ? (t.Construct._overwrite(o, e, i, u[i](s)), t.Construct._overwrite(o, e, r, n(s))) : a && (a[r] || a[i]) || t.Construct._overwrite(o, e, i, u[i]());
                        }), t.each(u, function(n, r) { "string" == typeof o[r] && t.Construct._overwrite(o, e, r, n(o[r])); }), "can.Model" !== o.fullName && o.fullName || (o.fullName = "Model" + ++n), t.Model._reqs = 0, this._url = this._shortName + "/{" + this.id + "}";
                    }
                },
                _ajax: l,
                _makeRequest: a,
                _clean: function() {
                    if (t.Model._reqs--, !t.Model._reqs)for (var e in this.store)this.store[e]._bindings || delete this.store[e];
                    return arguments[0];
                },
                models: s.models("data"),
                model: s.model()
            }, {
                setup: function(e) {
                    var n = e && e[this.constructor.id];
                    t.Model._reqs && null != n && (this.constructor.store[n] = this), t.Map.prototype.setup.apply(this, arguments);
                },
                isNew: function() {
                    var t = r(this);
                    return!(t || 0 === t);
                },
                save: function(t, e) { return a(this, this.isNew() ? "create" : "update", t, e); },
                destroy: function(e, n) {
                    if (this.isNew()) {
                        var r = this, i = t.Deferred();
                        return i.then(e, n), i.done(function(t) { r.destroyed(t); }).resolve(r);
                    }
                    return a(this, "destroy", e, n, "destroyed");
                },
                _bindsetup: function() { return this.constructor.store[this.__get(this.constructor.id)] = this, t.Map.prototype._bindsetup.apply(this, arguments); },
                _bindteardown: function() { return delete this.constructor.store[r(this)], t.Map.prototype._bindteardown.apply(this, arguments); },
                ___set: function(e, n) { t.Map.prototype.___set.call(this, e, n), e === this.constructor.id && this._bindings && (this.constructor.store[r(this)] = this); }
            });
            var d = function(e) {
                    var n = "parse" + t.capitalize(e);
                    return function(t) { return this[n] && (t = this[n].apply(this, arguments)), this[e](t); };
                },
                h = function(t) { return this.parseModel ? this.parseModel.apply(this, arguments) : this.model(t); },
                p = { makeFindAll: d("models"), makeFindOne: d("model"), makeCreate: h, makeUpdate: h };
            t.each(p, function(n, r) {
                t.Model[r] = function(r) {
                    return function() {
                        var i = t.makeArray(arguments), a = t.isFunction(i[1]) ? i.splice(0, 1) : i.splice(0, 2), s = e(r.apply(this, a), this, n);
                        return s.then(i[0], i[1]), s;
                    };
                };
            }), t.each(["created", "updated", "destroyed"], function(e) {
                t.Model.prototype[e] = function(n) {
                    var r, i = this.constructor;
                    r = n && "object" == typeof n && this.attr(n.attr ? n.attr() : n), t.dispatch.call(this, { type: "change", target: this }, [e]), t.dispatch.call(i, e, [this]);
                };
            });
            var g = t.Model.List = t.List.extend({ _bubbleRule: function(e, n) { return t.List._bubbleRule(e, n) || "destroyed"; } }, { setup: function(e) { t.isPlainObject(e) && !t.isArray(e) ? (t.List.prototype.setup.apply(this), this.replace(this.constructor.Map.findAll(e))) : t.List.prototype.setup.apply(this, arguments), this._init = 1, this.bind("destroyed", t.proxy(this._destroyed, this)), delete this._init; }, _destroyed: function(t, e) { if (/\w+/.test(e))for (var n; (n = this.indexOf(t.target)) > -1;)this.splice(n, 1); } });
            return t.Model;
        }(__m2, __m15, __m19),
        __m32 = function(t) {
            var e = /^\d+$/, n = /([^\[\]]+)|(\[\])/g, r = /([^?#]*)(#.*)?$/, i = function(t) { return decodeURIComponent(t.replace(/\+/g, " ")); };
            return t.extend(t, {
                deparam: function(a) {
                    var s, o, u = {};
                    return a && r.test(a) && (s = a.split("&"), t.each(s, function(t) {
                        var r = t.split("="), a = i(r.shift()), s = i(r.join("=")), c = u;
                        if (a) {
                            r = a.match(n);
                            for (var l = 0, f = r.length - 1; f > l; l++)c[r[l]] || (c[r[l]] = e.test(r[l + 1]) || "[]" === r[l + 1] ? [] : {}), c = c[r[l]];
                            o = r.pop(), "[]" === o ? c.push(s) : c[o] = s;
                        }
                    })), u;
                }
            }), t;
        }(__m2, __m13),
        __m31 = function(t) {
            var e,
                n,
                r,
                i,
                a = /\:([\w\.]+)/g,
                s = /^(?:&[^=]+=[^&]*)+/,
                o = function(e) {
                    var n = [];
                    return t.each(e, function(e, r) { n.push(("className" === r ? "class" : r) + '="' + ("href" === r ? e : t.esc(e)) + '"'); }), n.join(" ");
                },
                u = function(t, e) {
                    var n = 0, r = 0, i = {};
                    for (var a in t.defaults)t.defaults[a] === e[a] && (i[a] = 1, n++);
                    for (; t.names.length > r; r++) {
                        if (!e.hasOwnProperty(t.names[r]))return-1;
                        i[t.names[r]] || n++;
                    }
                    return n;
                },
                c = window.location,
                l = function(t) { return(t + "").replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1"); },
                f = t.each,
                d = t.extend,
                h = function(e) { return e && "object" == typeof e ? (e = e instanceof t.Map ? e.attr() : t.isFunction(e.slice) ? e.slice() : t.extend({}, e), t.each(e, function(t, n) { e[n] = h(t); })) : e !== undefined && null !== e && t.isFunction(e.toString) && (e = "" + e), e; },
                p = function(t) { return t.replace(/\\/g, ""); },
                g = function() {
                    i = 1, clearTimeout(e), e = setTimeout(function() {
                        i = 0;
                        var e = t.route.data.serialize(), n = t.route.param(e, !0);
                        t.route._call("setURL", n), r = n;
                    }, 10);
                };
            t.route = function(e, n) {
                var r = t.route._call("root");
                r.lastIndexOf("/") === r.length - 1 && 0 === e.indexOf("/") && (e = e.substr(1)), n = n || {};
                for (var i, s, o = [], u = "", c = a.lastIndex = 0, f = t.route._call("querySeparator"), d = t.route._call("matchSlashes"); i = a.exec(e);)o.push(i[1]), u += p(e.substring(c, a.lastIndex - i[0].length)), s = "\\" + (p(e.substr(a.lastIndex, 1)) || f + (d ? "" : "|/")), u += "([^" + s + "]" + (n[i[1]] ? "*" : "+") + ")", c = a.lastIndex;
                return u += e.substr(c).replace("\\", ""), t.route.routes[e] = { test: RegExp("^" + u + "($|" + l(f) + ")"), route: e, names: o, defaults: n, length: e.split("/").length }, t.route;
            }, d(t.route, {
                param: function(e, n) {
                    var r, i, s = 0, o = e.route, c = 0;
                    if (delete e.route, f(e, function() { c++; }), f(t.route.routes, function(t) { return i = u(t, e), i > s && (r = t, s = i), i >= c ? !1 : undefined; }), t.route.routes[o] && u(t.route.routes[o], e) === s && (r = t.route.routes[o]), r) {
                        var l, h = d({}, e), p = r.route.replace(a, function(t, n) { return delete h[n], e[n] === r.defaults[n] ? "" : encodeURIComponent(e[n]); }).replace("\\", "");
                        return f(r.defaults, function(t, e) { h[e] === t && delete h[e]; }), l = t.param(h), n && t.route.attr("route", r.route), p + (l ? t.route._call("querySeparator") + l : "");
                    }
                    return t.isEmptyObject(e) ? "" : t.route._call("querySeparator") + t.param(e);
                },
                deparam: function(e) {
                    var n = t.route._call("root");
                    n.lastIndexOf("/") === n.length - 1 && 0 === e.indexOf("/") && (e = e.substr(1));
                    var r = { length: -1 }, i = t.route._call("querySeparator"), a = t.route._call("paramsMatcher");
                    if (f(t.route.routes, function(t) { t.test.test(e) && t.length > r.length && (r = t); }), r.length > -1) {
                        var s = e.match(r.test), o = s.shift(), u = e.substr(o.length - (s[s.length - 1] === i ? 1 : 0)), c = u && a.test(u) ? t.deparam(u.slice(1)) : {};
                        return c = d(!0, {}, r.defaults, c), f(s, function(t, e) { t && t !== i && (c[r.names[e]] = decodeURIComponent(t)); }), c.route = r.route, c;
                    }
                    return e.charAt(0) !== i && (e = i + e), a.test(e) ? t.deparam(e.slice(1)) : {};
                },
                data: new t.Map({}),
                map: function(e) {
                    var n;
                    n = e.prototype instanceof t.Map ? new e : e, t.route.data = n;
                },
                routes: {},
                ready: function(e) { return e !== !0 && (t.route._setup(), t.route.setState()), t.route; },
                url: function(e, n) { return n && (e = t.extend({}, t.route.deparam(t.route._call("matchingPartOfURL")), e)), t.route._call("root") + t.route.param(e); },
                link: function(e, n, r, i) { return"<a " + o(d({ href: t.route.url(n, i) }, r)) + ">" + e + "</a>"; },
                current: function(e) { return this._call("matchingPartOfURL") === t.route.param(e); },
                bindings: { hashchange: { paramsMatcher: s, querySeparator: "&", matchSlashes: !1, bind: function() { t.bind.call(window, "hashchange", m); }, unbind: function() { t.unbind.call(window, "hashchange", m); }, matchingPartOfURL: function() { return c.href.split(/#!?/)[1] || ""; }, setURL: function(t) { return c.hash = "#!" + t, t; }, root: "#!" } },
                defaultBinding: "hashchange",
                currentBinding: null,
                _setup: function() { t.route.currentBinding || (t.route._call("bind"), t.route.bind("change", g), t.route.currentBinding = t.route.defaultBinding); },
                _teardown: function() { t.route.currentBinding && (t.route._call("unbind"), t.route.unbind("change", g), t.route.currentBinding = null), clearTimeout(e), i = 0; },
                _call: function() {
                    var e = t.makeArray(arguments), n = e.shift(), r = t.route.bindings[t.route.currentBinding || t.route.defaultBinding], i = r[n];
                    return i.apply ? i.apply(r, e) : i;
                }
            }), f(["bind", "unbind", "on", "off", "delegate", "undelegate", "removeAttr", "compute", "_get", "__get"], function(e) { t.route[e] = function() { return t.route.data[e] ? t.route.data[e].apply(t.route.data, arguments) : undefined; }; }), t.route.attr = function(e, n) {
                var r, i = typeof e;
                return r = n === undefined ? arguments : "string" !== i && "number" !== i ? [h(e), n] : [e, h(n)], t.route.data.attr.apply(t.route.data, r);
            };
            var m = t.route.setState = function() {
                var e = t.route._call("matchingPartOfURL"), a = n;
                if (n = t.route.deparam(e), !i || e !== r) {
                    t.batch.start();
                    for (var s in a)n[s] || t.route.removeAttr(s);
                    t.route.attr(n), t.batch.stop();
                }
            };
            return t.route;
        }(__m2, __m15, __m19, __m32),
        __m33 = function(t) {
            return t.Control.processors.route = function(e, n, r, i, a) {
                r = r || "", t.route.routes[r] || ("/" === r[0] && (r = r.substring(1)), t.route(r));
                var s,
                    o = function(e) {
                        if (t.route.attr("route") === r && (e.batchNum === undefined || e.batchNum !== s)) {
                            s = e.batchNum;
                            var n = t.route.attr();
                            delete n.route, t.isFunction(a[i]) ? a[i](n) : a[a[i]](n);
                        }
                    };
                return t.route.bind("change", o), function() { t.route.unbind("change", o); };
            }, t;
        }(__m2, __m31, __m11),
        __m34 = function() {
            var t = can.List.prototype.replace;
            can.List.prototype.replace = function(e) {
                var n = t.apply(this, arguments);
                if (can.isDeferred(e)) {
                    can.batch.start(), this.attr("state", e.state()), this.removeAttr("reason"), can.batch.stop();
                    var r = this, i = this._deferred = new can.Deferred;
                    e.then(function() { r.attr("state", e.state()), i.resolve(r); }, function(t) { can.batch.start(), r.attr("state", e.state()), r.attr("reason", t), can.batch.stop(), i.reject(t); });
                }
                return n;
            }, can.each({ isResolved: "resolved", isPending: "pending", isRejected: "rejected" }, function(t, e) { can.List.prototype[e] = function() { return this.attr("state") === t; }; }), can.each(["then", "done", "fail", "always", "promise"], function(t) { can.List.prototype[t] = function() { return this._deferred || (this._deferred = new can.Deferred, this._deferred.resolve(this)), this._deferred[t].apply(this._deferred, arguments); }; });
        }(__m19),
        __m35 = function(t) {
            var e = t.extend,
                n = function(t) {
                    if (this.constructor !== n) {
                        var r = new n(t);
                        return function(t, e) { return r.render(t, e); };
                    }
                    return"function" == typeof t ? (this.template = { fn: t }, undefined) : (e(this, t), this.template = this.scanner.scan(this.text, this.name), undefined);
                };
            return t.EJS = n, n.prototype.render = function(t, e) { return t = t || {}, this.template.fn.call(t, t, new n.Helpers(t, e || {})); }, e(n.prototype, {
                scanner: new t.view.Scanner({
                    text: { outStart: "with(_VIEW) { with (_CONTEXT) {", outEnd: "}}", argNames: "_CONTEXT,_VIEW", context: "this" },
                    tokens: [["templateLeft", "<%%"], ["templateRight", "%>"], ["returnLeft", "<%=="], ["escapeLeft", "<%="], ["commentLeft", "<%#"], ["left", "<%"], ["right", "%>"], ["returnRight", "%>"]],
                    helpers: [
                        {
                            name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                            fn: function(t) {
                                var e = /\s*\(([\$\w]+)\)\s*->([^\n]*)/, n = t.match(e);
                                return"can.proxy(function(__){var " + n[1] + "=can.$(__);" + n[2] + "}, this);";
                            }
                        }
                    ],
                    transform: function(t) {
                        return t.replace(/<%([\s\S]+?)%>/gm, function(t, e) {
                            var n, r, i = [];
                            e.replace(/[{}]/gm, function(t, e) { i.push([t, e]); });
                            do
                                for (n = !1, r = i.length - 2; r >= 0; r--)
                                    if ("{" === i[r][0] && "}" === i[r + 1][0]) {
                                        i.splice(r, 2), n = !0;
                                        break;
                                    }
                            while (n);
                            if (i.length >= 2) {
                                var a, s = ["<%"], o = 0;
                                for (r = 0; a = i[r]; r++)s.push(e.substring(o, o = a[1])), "{" === a[0] && i.length - 1 > r || "}" === a[0] && r > 0 ? s.push("{" === a[0] ? "{ %><% " : " %><% }") : s.push(a[0]), ++o;
                                return s.push(e.substring(o), "%>"), s.join("");
                            }
                            return"<%" + e + "%>";
                        });
                    }
                })
            }), n.Helpers = function(t, n) { this._data = t, this._extras = n, e(this, n); }, n.Helpers.prototype = { list: function(e, n) { t.each(e, function(t, r) { n(t, r, e); }); }, each: function(e, n) { t.isArray(e) ? this.list(e, n) : t.view.lists(e, n); } }, t.view.register({ suffix: "ejs", script: function(t, e) { return"can.EJS(function(_CONTEXT,_VIEW) { " + new n({ text: e, name: t }).template.out + " })"; }, renderer: function(t, e) { return n({ text: e, name: t }); } }), t.ejs.Helpers = n.Helpers, t;
        }(__m2, __m10, __m13, __m20, __m23, __m25),
        __m37 = function(t, e) {

            function n(t, n, r) {
                var i, o, u, c, l, f = r, d = typeof t, h = function() { return i || (i = { path: r, callbacks: [] }, n.push(i), f = []), i; };
                if ("object" === d) {
                    if (t.tag) {
                        if (o = document.createElement(t.tag), t.attrs)
                            for (var p in t.attrs) {
                                var g = t.attrs[p];
                                "function" == typeof g ? h().callbacks.push({ callback: g }) : o.setAttribute(p, g);
                            }
                        if (t.attributes)for (c = 0, l = t.attributes.length; l > c; c++)h().callbacks.push({ callback: t.attributes[c] });
                        t.children && t.children.length && (u = i ? i.paths = [] : n, o.appendChild(a(t.children, u, f)));
                    } else if (t.comment && (o = document.createComment(t.comment), t.callbacks))for (c = 0, l = t.attributes.length; l > c; c++)h().callbacks.push({ callback: t.callbacks[c] });
                } else
                    "string" === d ? o = document.createTextNode(t) : "function" === d && (s ? (o = document.createTextNode(""), h().callbacks.push({ callback: t })) : (o = document.createComment("~"), h().callbacks.push({
                        callback: function() {
                            var n = document.createTextNode("");
                            return e.replace([this], n), t.apply(n, arguments);
                        }
                    })));
                return o;
            }

            function r(t, e, n) {
                for (var i, a = e.path, s = e.callbacks, o = e.paths, u = t, c = 0, l = a.length; l > c; c++)u = u.childNodes[a[c]];
                for (c = 0, l = s.length; l > c; c++)i = s[c], i.callback.apply(u, n);
                if (o && o.length)for (c = o.length - 1; c >= 0; c--)r(u, o[c], n);
            }

            function i(e) {
                var n = [], i = a(e, n, []);
                return{
                    paths: n,
                    clone: i,
                    hydrate: function() {
                        for (var e = u(this.clone), i = t.makeArray(arguments), a = n.length - 1; a >= 0; a--)r(e, n[a], i);
                        return e;
                    }
                };
            }

            var a = function(t, e, r) {
                    for (var i = document.createDocumentFragment(), a = 0, s = t.length; s > a; a++) {
                        var o = t[a];
                        i.appendChild(n(o, e, r.concat(a)));
                    }
                    return i;
                },
                s = function() {
                    var t = document.createDocumentFragment(), e = document.createElement("div");
                    e.appendChild(document.createTextNode("")), e.appendChild(document.createTextNode("")), t.appendChild(e);
                    var n = t.cloneNode(!0);
                    return 2 === n.childNodes[0].childNodes.length;
                }(),
                o = function() {
                    var t = document.createElement("a");
                    t.innerHTML = "<xyz></xyz>";
                    var e = t.cloneNode(!0);
                    return"<xyz></xyz>" === e.innerHTML;
                }(),
                u = o ? function(t) { return t.cloneNode(!0); } : function(e) {
                    var n;
                    if (1 === e.nodeType ? n = document.createElement(e.nodeName) : 3 === e.nodeType ? n = document.createTextNode(e.nodeValue) : 8 === e.nodeType ? n = document.createComment(e.nodeValue) : 11 === e.nodeType && (n = document.createDocumentFragment()), e.attributes) {
                        var r = t.makeArray(e.attributes);
                        t.each(r, function(t) { t && t.specified && n.setAttribute(t.nodeName, t.nodeValue); });
                    }
                    return e.childNodes && t.each(e.childNodes, function(t) { n.appendChild(u(t)); }), n;
                };
            return i.keepsTextNodes = s, t.view.target = i, i;
        }(__m2, __m24),
        __m39 = function() { return{ isArrayLike: function(t) { return t && t.splice && "number" == typeof t.length; }, isObserveLike: function(t) { return t instanceof can.Map || t && !!t._get; }, emptyHandler: function() {}, jsonParse: function(str) { return"'" === str[0] ? str.substr(1, str.length - 2) : "undefined" === str ? undefined : window.JSON ? JSON.parse(str) : eval("(" + str + ")"); }, mixins: { last: function() { return this.stack[this.stack.length - 1]; }, add: function(t) { this.last().add(t); }, subSectionDepth: function() { return this.stack.length - 1; } } }; }(__m2),
        __m41 = function(t, e, n) {
            n = n || t.view.live;
            var r = function(n) { return e.isObserveLike(n) && e.isArrayLike(n) && n.attr("length") ? n : t.isFunction(n) ? n() : n; },
                i = {
                    each: function(i, a) {
                        var s, o, u, c = r(i), l = [];
                        if (c instanceof t.List || i && i.isComputed && c === undefined)
                            return function(t) {
                                var e = function(t, e, n) { return a.fn(a.scope.add({ "@index": e }).add(t), a.options, n); };
                                n.list(t, i, e, a.context, t.parentNode, a.nodeList);
                            };
                        var f = c;
                        if (f && e.isArrayLike(f))for (u = 0; f.length > u; u++)l.push(a.fn(a.scope.add({ "@index": u }).add(f[u])));
                        else if (e.isObserveLike(f))for (s = t.Map.keys(f), u = 0; s.length > u; u++)o = s[u], l.push(a.fn(a.scope.add({ "@key": o }).add(f[o])));
                        else if (f instanceof Object)for (o in f)l.push(a.fn(a.scope.add({ "@key": o }).add(f[o])));
                        return l;
                    },
                    "if": function(e, n) {
                        var i;
                        return i = t.isFunction(e) ? t.compute.truthy(e)() : !!r(e), i ? n.fn(n.scope || this) : n.inverse(n.scope || this);
                    },
                    unless: function(e, n) { return i["if"].apply(this, [t.isFunction(e) ? t.compute(function() { return!e(); }) : !e, n]); },
                    "with": function(t, e) {
                        var n = t;
                        return t = r(t), t ? e.fn(n) : undefined;
                    },
                    log: function(t, e) { "undefined" != typeof console && console.log && (e ? console.log(t, e.context) : console.log(t.context)); },
                    data: function(e) {
                        var n = 2 === arguments.length ? this : arguments[1];
                        return function(r) { t.data(t.$(r), e, n || this.context); };
                    }
                };
            return{
                registerHelper: function(t, e) { i[t] = e; },
                getHelper: function(t, e) {
                    var n = e.attr("helpers." + t);
                    return n || (n = i[t]), n ? { fn: n } : undefined;
                }
            };
        }(__m2, __m39, __m26),
        __m40 = function(t, e, n, r, i, a, s) {
            r = r || t.view.live, i = i || t.view.elements, a = a || t.view.Scope, s = s || t.view.nodeLists;
            var o = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
                u = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/,
                c = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g,
                l = function(t) { return t && "string" == typeof t.get; },
                f = function(t, e, n, r) {
                    for (var i = document.createDocumentFragment(), a = 0, s = t.length; s > a; a++)d(i, n.fn(e ? t.attr("" + a) : t[a], r));
                    return i;
                },
                d = function(t, e) { e && t.appendChild("string" == typeof e ? document.createTextNode(e) : e); },
                h = function(t, e, n, r) {
                    for (var i = "", a = 0, s = t.length; s > a; a++)i += n.fn(e ? t.attr("" + a) : t[a], r);
                    return i;
                },
                p = function(e, n, r) {
                    var i = n.computeData(e, { isArgument: r, args: [n.attr("."), n] });
                    return t.compute.temporarilyBind(i.compute), i;
                },
                g = function(t, e) {
                    var n = p(t, e, !0);
                    return n.compute.hasDependencies ? n.compute : n.initialValue;
                },
                m = function(t, e, n, r, i, a) { i && (t.fn = v(i, e, n, r)), a && (t.inverse = v(a, e, n, r)); },
                v = function(e, n, r, i) {
                    var a = function(t, r, i) { return e(t || n, r, i); };
                    return function(e, s, o) {
                        var u = t.__clearReading();
                        e === undefined || e instanceof t.view.Scope || (e = n.add(e)), s === undefined || s instanceof _.Options || (s = r.add(s));
                        var c = a(e, s || r, o || i);
                        return t.__setReading(u), c;
                    };
                },
                _ = {
                    expressionData: function(n) {
                        var r = [], i = {}, a = 0;
                        return(t.trim(n) + " ").replace(o, function(t, n) {
                            var s;
                            a && (s = n.match(u)) ? s[1] || s[2] ? r.push(e.jsonParse(s[1] || s[2])) : i[s[3]] = s[6] ? { get: s[6] } : e.jsonParse(s[4] || s[5]) : r.push({ get: n }), a++;
                        }), { name: r.shift(), args: r, hash: i };
                    },
                    makeEvaluator: function(r, i, a, s, o, u, c, d) {
                        for (var v, _, b = [], y = {}, x = { fn: function() {}, inverse: function() {} }, w = r.attr("."), k = o.name, M = o.args.length || !t.isEmptyObject(o.hash), C = 0, A = o.args.length; A > C; C++) {
                            var N = o.args[C];
                            N && l(N) ? b.push(g(N.get, r, !0)) : b.push(N);
                        }
                        for (var O in o.hash)y[O] = l(o.hash[O]) ? g(o.hash[O].get, r) : o.hash[O];
                        if (l(k) && (M && (v = n.getHelper(k.get, i), v || "function" != typeof w[k.get] || (v = { fn: w[k.get] })), !v)) {
                            var T = k.get, L = p(k.get, r, !1), S = L.compute;
                            _ = L.initialValue, L.reads && 1 === L.reads.length && L.root instanceof t.Map && (S = t.compute(L.root, L.reads[0])), k = L.compute.hasDependencies ? S : _, M || _ !== undefined ? "function" == typeof _ && (v = { fn: _ }) : v = n.getHelper(T, i);
                        }
                        if ("^" === s) {
                            var j = u;
                            u = c, c = j;
                        }
                        return v ? (m(x, r, i, a, u, c), t.simpleExtend(x, { context: w, scope: r, contexts: r, hash: y, nodeList: a }), b.push(x), function() { return v.fn.apply(w, b) || ""; }) : s ? "#" === s || "^" === s ? (m(x, r, i, a, u, c), function() {
                            var n;
                            if (n = t.isFunction(k) && k.isComputed ? k() : k, e.isArrayLike(n)) {
                                var a = e.isObserveLike(n);
                                return(a ? n.attr("length") : n.length) ? (d ? h : f)(n, a, x, i) : x.inverse(r, i);
                            }
                            return n ? x.fn(n || r, i) : x.inverse(r, i);
                        }) : undefined : k && k.isComputed ? k : function() { return"" + (null != k ? k : ""); };
                    },
                    makeLiveBindingPartialRenderer: function(e, n) {
                        return e = t.trim(e), function(r, a, o) {
                            var u, c = a.attr("partials." + e);
                            u = c ? c.render ? c.render(r, a) : c(r, a) : t.view.render(e, r, a), u = t.frag(u);
                            var l = [this];
                            s.register(l, null, n.directlyNested ? o || !0 : !0), s.update(l, u.childNodes), i.replace([this], u);
                        };
                    },
                    makeStringBranchRenderer: function(t, e) {
                        var n = y(e), r = t + e;
                        return function(e, i, a, s) {
                            var o = e.__cache[r];
                            (t || !o) && (o = b(e, i, null, t, n, a, s, !0), t || (e.__cache[r] = o));
                            var u = o();
                            return null == u ? "" : "" + u;
                        };
                    },
                    makeLiveBindingBranchRenderer: function(e, n, a) {
                        var o = y(n);
                        return function(u, c, l, f, d) {
                            var h = [this];
                            h.expression = n, s.register(h, null, a.directlyNested ? l || !0 : !0);
                            var p = b(u, c, h, e, o, f, d, a.tag), g = t.compute(p, null, !1, !0);
                            g.bind("change", t.k);
                            var m = g();
                            if ("function" == typeof m) {
                                var v = t.__clearReading();
                                m(this), t.__setReading(v);
                            } else g.hasDependencies ? a.attr ? r.simpleAttribute(this, a.attr, g) : a.tag ? r.attributes(this, g) : a.text && "object" != typeof m ? r.text(this, g, this.parentNode, h) : r.html(this, g, this.parentNode, h) : a.attr ? t.attr.set(this, a.attr, m) : a.tag ? r.setAttributes(this, m) : a.text && "string" == typeof m ? this.nodeValue = m : m && i.replace([this], t.frag(m));
                            g.unbind("change", t.k);
                        };
                    },
                    splitModeFromExpression: function(e, n) {
                        e = t.trim(e);
                        var r = e[0];
                        return"#/{&^>!".indexOf(r) >= 0 ? e = t.trim(e.substr(1)) : r = null, "{" === r && n.node && (r = null), { mode: r, expression: e };
                    },
                    cleanLineEndings: function(t) {
                        return t.replace(c, function(t, e, n, r, i, a, s, o, u, c) {
                            a = a || "", e = e || "", n = n || "";
                            var l = x(i || u, {});
                            return o || ">{".indexOf(l.mode) >= 0 ? t : "^#!/".indexOf(l.mode) >= 0 ? r + (0 !== c && s.length ? e + "\n" : "") : n + r + a + (n.length || 0 !== c ? e + "\n" : "");
                        });
                    },
                    Options: t.view.Scope.extend({ init: function(e) { e.helpers || e.partials || e.tags || (e = { helpers: e }), t.view.Scope.prototype.init.apply(this, arguments); } })
                },
                b = _.makeEvaluator,
                y = _.expressionData,
                x = _.splitModeFromExpression;
            return _;
        }(__m2, __m39, __m41, __m26, __m24, __m22, __m27),
        __m38 = function(t, e, n, r) {
            var i = function() {
                    var t = document.createElement("div");
                    return function(e) { return-1 === e.indexOf("&") ? e.replace(/\r\n/g, "\n") : (t.innerHTML = e, 0 === t.childNodes.length ? "" : t.childNodes[0].nodeValue); };
                }(),
                a = function() { this.stack = [new s]; };
            t.extend(a.prototype, n.mixins), t.extend(a.prototype, {
                startSubSection: function(t) {
                    var e = new s(t);
                    return this.stack.push(e), e;
                },
                endSubSectionAndReturnRenderer: function() {
                    if (this.last().isEmpty())return this.stack.pop(), null;
                    var e = this.endSection();
                    return t.proxy(e.compiled.hydrate, e.compiled);
                },
                startSection: function(t) {
                    var e = new s(t);
                    this.last().add(e.targetCallback), this.stack.push(e);
                },
                endSection: function() { return this.last().compile(), this.stack.pop(); },
                inverse: function() { this.last().inverse(); },
                compile: function() {
                    var e = this.stack.pop().compile();
                    return function(n, i) { return n instanceof t.view.Scope || (n = new t.view.Scope(n || {})), i instanceof r.Options || (i = new r.Options(i || {})), e.hydrate(n, i); };
                },
                push: function(t) { this.last().push(t); },
                pop: function() { return this.last().pop(); }
            });
            var s = function(e) {
                this.data = "targetData", this.targetData = [], this.targetStack = [];
                var n = this;
                this.targetCallback = function(r, i, a) { e.call(this, r, i, a, t.proxy(n.compiled.hydrate, n.compiled), n.inverseCompiled && t.proxy(n.inverseCompiled.hydrate, n.inverseCompiled)); };
            };
            return t.extend(s.prototype, { inverse: function() { this.inverseData = [], this.data = "inverseData"; }, push: function(t) { this.add(t), this.targetStack.push(t); }, pop: function() { return this.targetStack.pop(); }, add: function(t) { "string" == typeof t && (t = i(t)), this.targetStack.length ? this.targetStack[this.targetStack.length - 1].children.push(t) : this[this.data].push(t); }, compile: function() { return this.compiled = e(this.targetData), this.inverseData && (this.inverseCompiled = e(this.inverseData), delete this.inverseData), delete this.targetData, delete this.targetStack, this.compiled; }, children: function() { return this.targetStack.length ? this.targetStack[this.targetStack.length - 1].children : this[this.data]; }, isEmpty: function() { return!this.targetData.length; } }), a;
        }(__m2, __m37, __m39, __m40),
        __m42 = function(t, e, n) {
            e = e || t.view.live;
            var r = function() { this.stack = [new s]; }, i = function() {};
            t.extend(r.prototype, n.mixins), t.extend(r.prototype, {
                startSection: function(t) {
                    var e = new s;
                    this.last().add({ process: t, truthy: e }), this.stack.push(e);
                },
                endSection: function() { this.stack.pop(); },
                inverse: function() {
                    this.stack.pop();
                    var t = new s;
                    this.last().last().falsey = t, this.stack.push(t);
                },
                compile: function(n) {
                    var r = this.stack[0].compile();
                    return function(a, s) {
                        var o = t.compute(function() { return r(a, s); }, this, !1, !0);
                        o.bind("change", i);
                        var u = o();
                        o.hasDependencies ? (n.attr ? e.simpleAttribute(this, n.attr, o) : e.attributes(this, o), o.unbind("change", i)) : n.attr ? t.attr.set(this, n.attr, u) : e.setAttributes(this, u);
                    };
                }
            });
            var a = function(t, e, n) { return function(r, i) { return t.call(this, r, i, e, n); }; }, s = function() { this.values = []; };
            return t.extend(s.prototype, {
                add: function(t) { this.values.push(t); },
                last: function() { return this.values[this.values.length - 1]; },
                compile: function() {
                    for (var t = this.values, e = t.length, n = 0; e > n; n++) {
                        var r = this.values[n];
                        "object" == typeof r && (t[n] = a(r.process, r.truthy && r.truthy.compile(), r.falsey && r.falsey.compile()));
                    }
                    return function(n, r) {
                        for (var i, a = "", s = 0; e > s; s++)i = t[s], a += "string" == typeof i ? i : i.call(this, n, r);
                        return a;
                    };
                }
            }), r;
        }(__m2, __m26, __m39),
        __m36 = function(t, e, n, r, i, a, s, o) {

            function u(n) {
                n = a.cleanLineEndings(n);
                var s = new r,
                    u = { node: null, attr: null, sectionElementStack: [], text: !1 },
                    c = function(t, e, n) {
                        if (">" === e)t.add(a.makeLiveBindingPartialRenderer(n, u));
                        else if ("/" === e)t.endSection(), t instanceof r && u.sectionElementStack.pop();
                        else if ("else" === e)t.inverse();
                        else {
                            var i = t instanceof r ? a.makeLiveBindingBranchRenderer : a.makeStringBranchRenderer;
                            "{" === e || "&" === e ? t.add(i(null, n, l())) : "#" === e || "^" === e ? (t.startSection(i(e, n, l())), t instanceof r && u.sectionElementStack.push("section")) : t.add(i(null, n, l({ text: !0 })));
                        }
                    },
                    l = function(e) {
                        var n = { tag: u.node && u.node.tag, attr: u.attr && u.attr.name, directlyNested: "section" === u.sectionElementStack[u.sectionElementStack.length - 1] };
                        return e ? t.simpleExtend(n, e) : n;
                    },
                    f = function(t, e) { t.attributes || (t.attributes = []), t.attributes.push(e); };
                return e(n, {
                    start: function(t) { u.node = { tag: t, children: [] }; },
                    end: function(t, e) {
                        var n = o.tag(t);
                        e ? (s.add(u.node), n && f(u.node, function(e, n) { o.tagHandler(this, t, { scope: e, options: n, subtemplate: null, templateType: "stache" }); })) : (s.push(u.node), u.sectionElementStack.push("element"), n && s.startSubSection()), u.node = null;
                    },
                    close: function(t) {
                        var e, n = o.tag(t);
                        n && (e = s.endSubSectionAndReturnRenderer());
                        var r = s.pop();
                        n && f(r, function(n, r) { o.tagHandler(this, t, { scope: n, options: r, subtemplate: e, templateType: "stache" }); }), u.sectionElementStack.pop();
                    },
                    attrStart: function(t) { u.node.section ? u.node.section.add(t + '="') : u.attr = { name: t, value: "" }; },
                    attrEnd: function(t) {
                        if (u.node.section)u.node.section.add('" ');
                        else {
                            u.node.attrs || (u.node.attrs = {}), u.node.attrs[u.attr.name] = u.attr.section ? u.attr.section.compile(l()) : u.attr.value;
                            var e = o.attr(t);
                            e && (u.node.attributes || (u.node.attributes = []), u.node.attributes.push(function(n, r) { e(this, { attributeName: t, scope: n, options: r }); })), u.attr = null;
                        }
                    },
                    attrValue: function(t) {
                        var e = u.node.section || u.attr.section;
                        e ? e.add(t) : u.attr.value += t;
                    },
                    chars: function(t) { s.add(t); },
                    special: function(t) {
                        var e = a.splitModeFromExpression(t, u), n = e.mode, r = e.expression;
                        if ("else" === r)return(u.attr && u.attr.section ? u.attr.section : s).inverse(), undefined;
                        if ("!" !== n)
                            if (u.node && u.node.section)c(u.node.section, n, r), 0 === u.node.section.subSectionDepth() && (u.node.attributes.push(u.node.section.compile(l())), delete u.node.section);
                            else if (u.attr)u.attr.section || (u.attr.section = new i, u.attr.value && u.attr.section.add(u.attr.value)), c(u.attr.section, n, r);
                            else if (u.node)
                                if (u.node.attributes || (u.node.attributes = []), n) {
                                    if ("#" !== n && "^" !== n)throw n + " is currently not supported within a tag.";
                                    u.node.section || (u.node.section = new i), c(u.node.section, n, r);
                                } else u.node.attributes.push(a.makeLiveBindingBranchRenderer(null, r, l()));
                            else c(s, n, r);
                    },
                    comment: function(t) { s.add({ comment: t }); },
                    done: function() {}
                }), s.compile();
            }

            e = e || t.view.parser, o = o || t.view.callbacks;
            var c = { "\n": "\\n", "\r": "\\r", "\u2028": "\\u2028", "\u2029": "\\u2029" }, l = function(t) { return("" + t).replace(/["'\\\n\r\u2028\u2029]/g, function(t) { return"'\"\\".indexOf(t) >= 0 ? "\\" + t : c[t]; }); };
            return t.view.register({ suffix: "stache", contentType: "x-stache-template", fragRenderer: function(t, e) { return u(e); }, script: function(t, e) { return'can.stache("' + l(e) + '")'; } }), t.view.ext = ".stache", t.extend(t.stache, s), t.extend(u, s), t.stache.safeString = u.safeString = function(t) { return{ toString: function() { return t; } }; }, u;
        }(__m2, __m28, __m37, __m38, __m42, __m40, __m41, __m9),
        __m43 = function(t) {
            "use strict";
            if (window.history && history.pushState) {
                t.route.bindings.pushstate = {
                    root: "/",
                    matchSlashes: !1,
                    paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,
                    querySeparator: "?",
                    bind: function() {
                        t.delegate.call(t.$(document.documentElement), "a", "click", e), t.each(r, function(e) {
                            i[e] = window.history[e], window.history[e] = function(n, r, a) {
                                var s = 0 === a.indexOf("http"), o = window.location.search + window.location.hash;
                                (!s && a !== window.location.pathname + o || s && a !== window.location.href + o) && (i[e].apply(window.history, arguments), t.route.setState());
                            };
                        }), t.bind.call(window, "popstate", t.route.setState);
                    },
                    unbind: function() { t.undelegate.call(t.$(document.documentElement), "click", "a", e), t.each(r, function(t) { window.history[t] = i[t]; }), t.unbind.call(window, "popstate", t.route.setState); },
                    matchingPartOfURL: function() {
                        var t = n(), e = location.pathname + location.search, r = e.indexOf(t);
                        return e.substr(r + t.length);
                    },
                    setURL: function(e) { a && -1 === e.indexOf("#") && window.location.hash && (e += window.location.hash), window.history.pushState(null, null, t.route._call("root") + e); }
                };
                var e = function(e) {
                        if (!(e.isDefaultPrevented ? e.isDefaultPrevented() : e.defaultPrevented === !0)) {
                            var r = this._node || this, i = r.host || window.location.host;
                            if (window.location.host === i) {
                                var s = n();
                                if (0 === r.pathname.indexOf(s)) {
                                    var o = (r.pathname + r.search).substr(s.length), u = t.route.deparam(o);
                                    u.hasOwnProperty("route") && (a = !0, window.history.pushState(null, null, r.href), e.preventDefault && e.preventDefault());
                                }
                            }
                        }
                    },
                    n = function() {
                        var e = location.protocol + "//" + location.host, n = t.route._call("root"), r = n.indexOf(e);
                        return 0 === r ? n.substr(e.length) : n;
                    },
                    r = ["pushState", "replaceState"],
                    i = {},
                    a = !1;
                t.route.defaultBinding = "pushstate";
            }
            return t;
        }(__m2, __m31),
        __m46 = function(t) {
            var e = t.isArray;
            t.Object = {};
            var n = t.Object.same = function(i, a, s, o, u, c) {
                var l, f = typeof i, d = e(i), h = typeof s;
                if (("string" === h || null === s) && (s = r[s], h = "function"), "function" === h)return s(i, a, o, u);
                if (s = s || {}, null === i || null === a)return i === a;
                if (i instanceof Date || a instanceof Date)return i === a;
                if (-1 === c)return"object" === f || i === a;
                if (f !== typeof a || d !== e(a))return!1;
                if (i === a)return!0;
                if (d) {
                    if (i.length !== a.length)return!1;
                    for (var p = 0; i.length > p; p++)if (l = s[p] === undefined ? s["*"] : s[p], !n(i[p], a[p], i, a, l))return!1;
                    return!0;
                }
                if ("object" === f || "function" === f) {
                    var g = t.extend({}, a);
                    for (var m in i) {
                        if (l = s[m] === undefined ? s["*"] : s[m], !n(i[m], a[m], l, i, a, c === !1 ? -1 : undefined))return!1;
                        delete g[m];
                    }
                    for (m in g)if (s[m] === undefined || !n(undefined, a[m], s[m], i, a, c === !1 ? -1 : undefined))return!1;
                    return!0;
                }
                return!1;
            };
            t.Object.subsets = function(e, n, r) {
                for (var i = n.length, a = [], s = 0; i > s; s++) {
                    var o = n[s];
                    t.Object.subset(e, o, r) && a.push(o);
                }
                return a;
            }, t.Object.subset = function(t, e, r) {
                r = r || {};
                for (var i in e)if (!n(t[i], e[i], r[i], t, e))return!1;
                return!0;
            };
            var r = { "null": function() { return!0; }, i: function(t, e) { return("" + t).toLowerCase() === ("" + e).toLowerCase(); }, eq: function(t, e) { return t === e; }, similar: function(t, e) { return t == e; } };
            return r.eqeq = r.similar, t.Object;
        }(__m2),
        __m45 = function(t) {
            var e = function(t, e) {
                var n = {};
                for (var r in t)n[r] = "object" != typeof t[r] || null === t[r] || t[r] instanceof Date ? t[r] : e.attr(r);
                return n;
            };
            return t.extend(t.Map.prototype, {
                backup: function() { return this._backupStore = this._attrs(), this; },
                isDirty: function(e) { return this._backupStore && !t.Object.same(this._attrs(), this._backupStore, undefined, undefined, undefined, !!e); },
                restore: function(t) {
                    var n = t ? this._backupStore : e(this._backupStore, this);
                    return this.isDirty(t) && this._attrs(n, !0), this;
                }
            }), t.Map;
        }(__m2, __m15, __m46),
        __m44 = function(t) {
            var e = function(e, n) {
                    var r, i, a = t.extend(!0, {}, n);
                    if (e)
                        for (var s = 0; e.length > s; s++) {
                            for (r = a, i = e[s].split("."); i.length > 1;)r = r && r[i.shift()];
                            r && delete r[i.shift()];
                        }
                    return a;
                },
                n = function(e, n, r, i) {
                    this._changedAttrs = this._changedAttrs || [];
                    var a, s, o = new t.Deferred, u = this, c = this.serialize(), l = this._requestQueue, f = this._changedAttrs;
                    return a = function(t, e, n, r) { return function() { return t.constructor._makeRequest([t, c], e || (t.isNew() ? "create" : "update"), n, r, i); }; }(this, r, function() { o.resolveWith(u, arguments), l.splice(0, 1), l.length > 0 ? l[0] = l[0]() : f.splice(0); }, function() { o.rejectWith(u, arguments), l.splice(0), f.splice(0); }), s = l.push(a) - 1, 1 === l.length && (l[0] = l[0]()), o.abort = function() {
                        var t;
                        return t = l[s].abort && l[s].abort(), l.splice(s), 0 === l.length && f.splice(0), t;
                    }, o.then(e, n), o;
                },
                r = t.Model.prototype._triggerChange,
                i = t.Model.prototype.destroy,
                a = t.Model.prototype.setup;
            return t.each(["created", "updated", "destroyed"], function(n) {
                var r = t.Model.prototype[n];
                t.Model.prototype[n] = function(t) { t && "object" == typeof t && (t = t.attr ? t.attr() : t, this._backupStore = t, t = e(this._changedAttrs || [], t)), r.call(this, t); };
            }), t.extend(t.Model.prototype, { setup: function() { a.apply(this, arguments), this._requestQueue = new t.List; }, _triggerChange: function(t) { this._changedAttrs && this._changedAttrs.push(t), r.apply(this, arguments); }, hasQueuedRequests: function() { return this._requestQueue.attr("length") > 1; }, save: function() { return n.apply(this, arguments); }, destroy: function(t, e) { return this.isNew() ? i.call(this, t, e) : n.call(this, t, e, "destroy", "destroyed"); } }), t;
        }(__m2, __m30, __m45),
        __m47 = function(t) {
            var e = t.isFunction, n = /xyz/.test(function() { return this.xyz; }) ? /\b_super\b/ : /.*/;
            return t.Construct._overwrite = function(t, r, i, a) {
                t[i] = e(a) && e(r[i]) && n.test(a) ? function(t, e) {
                    return function() {
                        var n, i = this._super;
                        return this._super = r[t], n = e.apply(this, arguments), this._super = i, n;
                    };
                }(i, a) : a;
            }, t.Construct._inherit = function(e, n, r) {
                r = r || e;
                for (var i in e)t.Construct._overwrite(r, n, i, e[i]);
            }, t;
        }(__m2, __m12),
        __m48 = function(t) {
            var e = (t.isFunction, t.isArray),
                n = t.makeArray,
                r = function(t) {
                    var r, i = n(arguments);
                    return t = i.shift(), e(t) || (t = [t]), r = this, function() {
                        for (var a, s, o = i.concat(n(arguments)), u = t.length, c = 0; u > c; c++)s = t[c], s && (a = "string" == typeof s, o = (a ? r[s] : s).apply(r, o || []), u - 1 > c && (o = !e(o) || o._use_call ? [o] : o));
                        return o;
                    };
                };
            t.Construct.proxy = t.Construct.prototype.proxy = r;
            for (var i = [t.Map, t.Control, t.Model], a = 0; i.length > a; a++)i[a] && (i[a].proxy = r);
            return t;
        }(__m2, __m12),
        __m50 = function(t) {
            var e = t.bubble;
            return t.extend({}, e, { childrenOf: function(t, n) { t._nestedReference ? t._nestedReference.each(function(r, i) { r && r.bind && e.toParent(r, t, i(), n); }) : e._each.apply(this, arguments); } });
        }(__m2, __m17),
        __m51 = function(t) {
            var e = function(t, e, n) {
                    for (var r, i = e.split("."), a = t; r = i.shift();)a = a[r], n && n(a, r);
                    return a;
                },
                n = function(t) { this.array = t; };
            n.prototype.toString = function() { return"" + t.inArray(this.item, this.array); };
            var r = function(t) { this.root = t, this.references = []; };
            r.ArrIndex = n, t.extend(r.prototype, {
                make: function(r) {
                    var i, a = [];
                    (t.isArray(this.root) || this.root instanceof t.LazyList) && (i = new n(this.root)), e(this.root, r, function(e, r) { i ? (i.item = e, a.push(i), i = undefined) : (a.push(r), t.isArray(e) && (i = new n(e))); });
                    var s = function() { return a.join("."); };
                    return this.references.push(s), s;
                },
                removeChildren: function(t, e) {
                    for (var n = 0; this.references.length > n;) {
                        var r = this.references[n]();
                        0 === r.indexOf(t) ? (e(this.get(r), r), this.references.splice(n, 1)) : n++;
                    }
                },
                get: function(t) { return e(this.root, t); },
                each: function(e) {
                    var n = this;
                    t.each(this.references, function(t) {
                        var r = t();
                        e(n.get(r), t, r);
                    });
                }
            }), t.NestedReference = r;
        }(__m2),
        __m49 = function(t, e) {
            var n = null, r = function(t) { return n && n[t._cid] && n[t._cid].instance; };
            return t.LazyMap = t.Map.extend({ _bubble: e }, {
                setup: function(e) {
                    this.constructor.Map = this.constructor, this.constructor.List = t.LazyList, this._data = t.extend(t.extend(!0, {}, this.constructor.defaults || {}), e), t.cid(this, ".lazyMap"), this._init = 1, this._setupComputes();
                    var n = e && t.Map.helpers.addToMap(e, this);
                    this._nestedReference = new t.NestedReference(this._data), n && n(), t.each(this._data, t.proxy(function(t, e) { this.___set(e, t); }, this)), this.bind("change", t.proxy(this._changes, this)), delete this._init;
                },
                _addChild: function(t, n, r) {
                    var i = this;
                    if (this._nestedReference.removeChildren(t, function(r, a) {
                        if (e.remove(i, r), n) {
                            var s = a.replace(t + ".", "");
                            if (t === s)r._nestedReference.each(function(t, r) { n._nestedReference.make(r()), i._bindings && e.add(this, n, r()); });
                            else {
                                var o = n._nestedReference.make(s);
                                i._bindings && e.add(r, n, o());
                            }
                        }
                    }), r && r(), n) {
                        var a = this._nestedReference.make(t);
                        this._bindings && e.add(this, n, a());
                    }
                    return n;
                },
                removeAttr: function(e) {
                    var n = this._goto(e);
                    return n.parts.length ? n.value.removeAttr(n.parts.join(".")) : (t.isArray(n.parent) ? (n.parent.splice(n.prop, 1), this._triggerChange(e, "remove", undefined, [this.__type(n.value, n.prop)])) : n.parent[n.prop] && (delete n.parent[n.prop], t.batch.trigger(this, n.path.length ? n.path.join(".") + ".__keys" : "__keys"), this._triggerChange(e, "remove", undefined, this.__type(n.value, n.prop))), this._nestedReference.removeChildren(), n.value);
                },
                __type: function(e) {
                    if (!(e instanceof t.LazyMap) && t.Map.helpers.canMakeObserve(e)) {
                        var n = r(e);
                        if (n)return n;
                        if (t.isArray(e)) {
                            var i = t.LazyList;
                            return new i(e);
                        }
                        var a = this.constructor.Map || t.LazyMap;
                        return new a(e);
                    }
                    return e;
                },
                _goto: function(e, n) {
                    for (var r, i, a = t.Map.helpers.attrParts(e, n).slice(0), s = [], o = this instanceof t.List ? this[a.shift()] : this.__get(); o && !t.Map.helpers.isObservable(o) && a.length;)i !== undefined && s.push(i), r = o, o = o[i = a.shift()];
                    return{ parts: a, prop: i, value: o, parent: r, path: s };
                },
                _get: function(e) {
                    var n = this._goto(e);
                    if (t.Map.helpers.isObservable(n.value))return n.parts.length ? n.value._get(n.parts) : n.value;
                    if (n.value && t.Map.helpers.canMakeObserve(n.value)) {
                        var r = this.__type(n.value, n.prop);
                        return this._addChild(e, r, function() { n.parent[n.prop] = r; }), r;
                    }
                    return n.value !== undefined ? n.value : this.__get(e);
                },
                _set: function(e, n, r) {
                    var i = this._goto(e, r);
                    if (t.Map.helpers.isObservable(i.value) && i.parts.length)return i.value._set(i.parts, n);
                    if (i.parts.length)throw"can.LazyMap: object does not exist";
                    this.__set(e, n, i.value, i);
                },
                __set: function(e, n, r, i, a) {
                    if (a = a || !0, n !== r) {
                        var s = i.parent.hasOwnProperty(i.prop) ? "set" : "add";
                        if (a && t.Map.helpers.canMakeObserve(n)) {
                            n = this.__type(n, e);
                            var o = this;
                            this._addChild(e, n, function() { o.___set(e, n, i); });
                        } else this.___set(e, n, i);
                        "add" === s && t.batch.trigger(this, i.path.length ? i.path.join(".") + ".__keys" : "__keys", undefined), this._triggerChange(e, s, n, r);
                    }
                },
                ___set: function(e, n, r) { this[e] && this[e].isComputed && t.isFunction(this.constructor.prototype[e]) ? this[e](n) : r ? r.parent[r.prop] = n : this._data[e] = n, t.isFunction(this.constructor.prototype[e]) || (this[e] = n); },
                _attrs: function(e, n) {
                    if (e === undefined)return t.Map.helpers.serialize(this, "attr", {});
                    e = t.extend({}, e);
                    var r, i, a, s = this;
                    t.batch.start(), this.each(function(r, o) { return a = e[o], i = s._goto(o, !0), a === undefined ? (n && s.removeAttr(o), undefined) : (!t.Map.helpers.isObservable(r) && t.Map.helpers.canMakeObserve(r) && (r = s.attr(o)), s.__convert && (a = s.__convert(o, a)), a instanceof t.Map ? s.__set(o, a, r, i) : t.Map.helpers.isObservable(r) && t.Map.helpers.canMakeObserve(a) && r.attr ? r.attr(a, n) : r !== a && s.__set(o, a, r, i), delete e[o], undefined); });
                    for (r in e)a = e[r], this._set(r, a, !0);
                    return t.batch.stop(), this;
                }
            }), t.LazyList = t.List.extend({ Map: t.LazyMap }, { setup: function() { t.List.prototype.setup.apply(this, arguments), this._nestedReference = new t.NestedReference(this); } }), t.LazyMap;
        }(__m2, __m50, __m15, __m19, __m51),
        __m52 = function(t) {
            var e = function(t, e) {
                    var n, r = t.length, i = 0, a = [];
                    for (i; r > i; i++) {
                        if (n = e[i], "string" != typeof n)return null;
                        if ("**" === t[i])return e.join(".");
                        if ("*" === t[i])a.push(n);
                        else {
                            if (n !== t[i])return null;
                            a.push(n);
                        }
                    }
                    return a.join(".");
                },
                n = function(n, r, i, a, s) {
                    var o, u, c, l, f, d = r.split("."), h = (this._observe_delegates || []).slice(0);
                    n.attr = r, n.lastAttr = d[d.length - 1];
                    for (var p = 0; o = h[p++];)
                        if (!(n.batchNum && o.batchNum === n.batchNum || o.undelegated)) {
                            l = undefined, f = !0;
                            for (var g = 0; o.attrs.length > g; g++)u = o.attrs[g], c = e(u.parts, d), c && (l = c), u.value && f ? f = u.value === "" + this.attr(u.attr) : f && o.attrs.length > 1 && (f = this.attr(u.attr) !== undefined);
                            if (l && f) {
                                var m = r.replace(l + ".", "");
                                n.batchNum && (o.batchNum = n.batchNum), "change" === o.event ? (r = m, n.curAttr = l, o.callback.apply(this.attr(l), t.makeArray(arguments))) : o.event === i ? o.callback.apply(this.attr(l), [n, a, s, m]) : "set" === o.event && "add" === i && o.callback.apply(this.attr(l), [n, a, s, m]);
                            }
                        }
                };
            return t.extend(t.Map.prototype, {
                delegate: function(e, r, i) {
                    e = t.trim(e);
                    for (var a, s = this._observe_delegates || (this._observe_delegates = []), o = [], u = /([^\s=,]+)(?:=("[^",]*"|'[^',]*'|[^\s"',]*))?(,?)\s*/g; null !== (a = u.exec(e));)a[2] && t.inArray(a[2].substr(0, 1), ['"', "'"]) >= 0 && (a[2] = a[2].substr(1, -1)), o.push({ attr: a[1], parts: a[1].split("."), value: a[2], or: "," === a[3] });
                    return s.push({ selector: e, attrs: o, callback: i, event: r }), 1 === s.length && this.bind("change", n), this;
                },
                undelegate: function(e, r, i) {
                    e = e && t.trim(e);
                    var a, s = 0, o = this._observe_delegates || [];
                    if (e)for (; o.length > s;)a = o[s], a.callback === i || !i && a.selector === e ? (a.undelegated = !0, o.splice(s, 1)) : s++;
                    else o = [];
                    return o.length || this.unbind("change", n), this;
                }
            }), t.Map.prototype.delegate.matches = e, t.Map;
        }(__m2, __m15),
        __m53 = function(t) {
            t.classize = function(e, n) {
                for (var r = e.split(t.undHash), i = 0; r.length > i; i++)r[i] = t.capitalize(r[i]);
                return r.join(n || "");
            };
            var e = t.classize, n = t.Map.prototype, r = n.__set;
            return n.__set = function(n, i, a, s, o) {
                var u = e(n),
                    c = "set" + u,
                    l = function(e) {
                        var r = o && o.call(f, e);
                        return r !== !1 && t.trigger(f, "error", [n, e], !0), !1;
                    },
                    f = this;
                return this[c] ? (t.batch.start(), i = this[c](i, function(t) { r.call(f, n, t, a, s, l); }, l), i === undefined ? (t.batch.stop(), undefined) : (r.call(f, n, i, a, s, l), t.batch.stop(), this)) : (r.call(f, n, i, a, s, l), this);
            }, t.Map;
        }(__m2, __m15),
        __m54 = function(t) {
            t.each([t.Map, t.Model], function(e) {
                if (e !== undefined) {
                    var n = function(t) { return"object" == typeof t && null !== t && t; };
                    t.extend(e, {
                        attributes: {},
                        convert: {
                            date: function(t) {
                                var e = typeof t;
                                return"string" === e ? (t = Date.parse(t), isNaN(t) ? null : new Date(t)) : "number" === e ? new Date(t) : t;
                            },
                            number: function(t) { return parseFloat(t); },
                            "boolean": function(t) { return"false" !== t && "0" !== t && t ? !0 : !1; },
                            "default": function(e, n, r, i) {
                                if (t.Map.prototype.isPrototypeOf(i.prototype) && "function" == typeof i.model && "function" == typeof i.models)return i[t.isArray(e) ? "models" : "model"](e);
                                if (t.Map.prototype.isPrototypeOf(i.prototype))return t.isArray(e) && "function" == typeof i.List ? new i.List(e) : new i(e);
                                if ("function" == typeof i)return i(e, n);
                                var a, s = t.getObject(i), o = window;
                                return i.indexOf(".") >= 0 && (a = i.substring(0, i.lastIndexOf(".")), o = t.getObject(a)), "function" == typeof s ? s.call(o, e, n) : e;
                            }
                        },
                        serialize: { "default": function(t) { return n(t) && t.serialize ? t.serialize() : t; }, date: function(t) { return t && t.getTime(); } }
                    });
                    var r = e.setup;
                    e.setup = function(e, n, i) {
                        var a = this;
                        r.call(a, e, n, i), t.each(["attributes"], function(t) { a[t] && e[t] !== a[t] || (a[t] = {}); }), t.each(["convert", "serialize"], function(n) { e[n] !== a[n] && (a[n] = t.extend({}, e[n], a[n])); });
                    };
                }
            }), t.Map.prototype.__convert = function(t, e) {
                var n, r, i = this.constructor, a = this.__get(t);
                return i.attributes && (n = i.attributes[t], r = i.convert[n] || i.convert["default"]), null !== e && n ? r.call(i, e, a, function() {}, n) : e;
            };
            var e = t.Map.helpers._serialize;
            t.Map.helpers._serialize = function(t, n, r) {
                var i = t.constructor, a = i.attributes ? i.attributes[n] : 0, s = i.serialize ? i.serialize[a] : 0;
                return r && "function" == typeof r.serialize ? e.apply(this, arguments) : s ? s(r, a) : e.apply(this, arguments);
            };
            var n = t.Map.prototype.serialize;
            return t.Map.prototype.serialize = function(t) {
                var e = n.apply(this, arguments);
                return t ? e[t] : e;
            }, t.Map;
        }(__m2, __m15, __m19),
        __m55 = function(t) {
            var e = function(e, n, r) {
                    if (r || (r = n, n = {}), n = n || {}, e = "string" == typeof e ? [e] : t.makeArray(e), !n.testIf || n.testIf.call(this)) {
                        var i = this;
                        t.each(e, function(t) {
                            i.validations[t] || (i.validations[t] = []), i.validations[t].push(function(e) {
                                var i = r.call(this, e, t);
                                return i === undefined ? undefined : n.message || i;
                            });
                        });
                    }
                },
                n = t.Map.prototype.__set;
            return t.Map.prototype.__set = function(e, r, i, a, s) {
                var o = this,
                    u = o.constructor.validations,
                    c = function(n) {
                        var r = s && s.call(o, n);
                        return r !== !1 && t.trigger(o, "error", [e, n], !0), !1;
                    };
                if (n.call(o, e, r, i, a, c), u && u[e]) {
                    var l = o.errors(e);
                    l && c(l);
                }
                return this;
            }, t.each([t.Map, t.Model], function(n) {
                if (n !== undefined) {
                    var r = n.setup;
                    t.extend(n, {
                        setup: function(t) { r.apply(this, arguments), this.validations && t.validations !== this.validations || (this.validations = {}); },
                        validate: e,
                        validationMessages: { format: "is invalid", inclusion: "is not a valid option (perhaps out of range)", lengthShort: "is too short", lengthLong: "is too long", presence: "can't be empty", range: "is out of range", numericality: "must be a number" },
                        validateFormatOf: function(t, n, r) { e.call(this, t, r, function(t) { return t !== undefined && null !== t && "" !== t && null === (t + "").match(n) ? this.constructor.validationMessages.format : undefined; }); },
                        validateInclusionOf: function(t, n, r) {
                            e.call(this, t, r, function(t) {
                                if (t !== undefined) {
                                    for (var e = 0; n.length > e; e++)if (n[e] === t)return;
                                    return this.constructor.validationMessages.inclusion;
                                }
                            });
                        },
                        validateLengthOf: function(t, n, r, i) { e.call(this, t, i, function(t) { return(t === undefined || null === t) && n > 0 || t !== undefined && null !== t && n > t.length ? this.constructor.validationMessages.lengthShort + " (min=" + n + ")" : t !== undefined && null !== t && t.length > r ? this.constructor.validationMessages.lengthLong + " (max=" + r + ")" : undefined; }); },
                        validatePresenceOf: function(t, n) { e.call(this, t, n, function(t) { return t === undefined || "" === t || null === t ? this.constructor.validationMessages.presence : undefined; }); },
                        validateRangeOf: function(t, n, r, i) { e.call(this, t, i, function(t) { return(t === undefined || null === t) && n > 0 || t !== undefined && null !== t && (n > t || t > r) ? this.constructor.validationMessages.range + " [" + n + "," + r + "]" : undefined; }); },
                        validatesNumericalityOf: function(t) {
                            e.call(this, t, function(t) {
                                var e = !isNaN(parseFloat(t)) && isFinite(t);
                                return e ? undefined : this.constructor.validationMessages.numericality;
                            });
                        }
                    });
                }
            }), t.extend(t.Map.prototype, {
                errors: function(e, n) {
                    e && (e = t.isArray(e) ? e : [e]);
                    var r = {},
                        i = this,
                        a = function(e, a) {
                            t.each(a, function(t) {
                                var a = t.call(i, o ? i.__convert ? i.__convert(e, n) : n : i.attr(e));
                                a && (r[e] || (r[e] = []), r[e].push(a));
                            });
                        },
                        s = this.constructor.validations,
                        o = e && 1 === e.length && 2 === arguments.length;
                    return t.each(e || s || {}, function(t, e) { "number" == typeof e && (e = t, t = s[e]), a(e, t || []); }), t.isEmptyObject(r) ? null : o ? r[e[0]] : r;
                }
            }), t.Map;
        }(__m2, __m15),
        __m56 = function(t) {
            return t.extend(t.List.prototype, {
                filter: function(e) {
                    var n = new this.constructor,
                        r = this,
                        i = function(i) {
                            var a = function(t, e) {
                                    var r = n.indexOf(i);
                                    e || -1 === r || n.splice(r, 1), e && -1 === r && n.push(i);
                                },
                                s = t.compute(function() { return e(i, r.indexOf(i), r); });
                            s.bind("change", a), a(null, s());
                        };
                    return this.bind("add", function(e, n, r) { t.each(n, function(t, e) { i(t, r + e); }); }), this.bind("remove", function(e, r) {
                        t.each(r, function(t) {
                            var e = n.indexOf(t);
                            -1 !== e && n.splice(e, 1);
                        });
                    }), this.forEach(i), n;
                },
                map: function(e) {
                    var n = new t.List,
                        r = this,
                        i = function(i, a) {
                            var s = t.compute(function() { return e(i, a, r); });
                            s.bind("change", function(t, e) { n.splice(a, 1, e); }), n.splice(a, 0, s());
                        };
                    return this.forEach(i), this.bind("add", function(e, n, r) { t.each(n, function(t, e) { i(t, r + e); }); }), this.bind("remove", function(t, e, r) { n.splice(r, e.length); }), n;
                }
            }), t.List;
        }(__m2, __m15, __m19, __m20),
        __m57 = function(t) {
            t.Map.helpers.define = function(t) {
                var e = t.prototype.define;
                t.defaultGenerators = {};
                for (var n in e)"value" in e[n] && ("function" == typeof e[n].value ? t.defaultGenerators[n] = e[n].value : t.defaults[n] = e[n].value), "function" == typeof e[n].Value && function(e) { t.defaultGenerators[n] = function() { return new e; }; }(e[n].Value);
            };
            var e = t.Map.prototype._setupDefaults;
            t.Map.prototype._setupDefaults = function() {
                var t = e.call(this), n = this.constructor;
                for (var r in n.defaultGenerators)t[r] = n.defaultGenerators[r].call(this);
                return t;
            };
            var n = t.Map.prototype, r = n.__set;
            n.__set = function(e, n, i, a, s) {
                var o = function(n) {
                        var r = s && s.call(u, n);
                        return r !== !1 && t.trigger(u, "error", [e, n], !0), !1;
                    },
                    u = this,
                    c = this.define && this.define[e],
                    l = c && c.set,
                    f = c && c.get;
                if (l) {
                    t.batch.start();
                    var d = !1, h = l.call(this, n, function(t) { r.call(u, e, t, i, a, o), d = !0; }, o);
                    return f ? (t.batch.stop(), undefined) : h === undefined && !d && l.length >= 2 ? (t.batch.stop(), undefined) : (d || r.call(u, e, 0 === l.length && h === undefined ? n : h, i, a, o), t.batch.stop(), this);
                }
                return r.call(u, e, n, i, a, o), this;
            };
            var i = {
                    date: function(t) {
                        var e = typeof t;
                        return"string" === e ? (t = Date.parse(t), isNaN(t) ? null : new Date(t)) : "number" === e ? new Date(t) : t;
                    },
                    number: function(t) { return+t; },
                    "boolean": function(t) { return"false" !== t && "0" !== t && t ? !0 : !1; },
                    "*": function(t) { return t; },
                    string: function(t) { return"" + t; }
                },
                a = n.__type;
            n.__type = function(t, e) {
                var n = this.define && this.define[e], r = n && n.type, s = n && n.Type, o = t;
                return"string" == typeof r && (r = i[r]), r || s ? (r && (o = r.call(this, o, e)), !s || o instanceof s || (o = new s(o)), o) : a.call(this, o, e);
            };
            var s = n._remove;
            n._remove = function(e, n) {
                var r, i = this.define && this.define[e] && this.define[e].remove;
                return i ? (t.batch.start(), r = i.call(this, n), r === !1 ? (t.batch.stop(), undefined) : (r = s.call(this, e, n), t.batch.stop(), r)) : s.call(this, e, n);
            };
            var o = n._setupComputes;
            n._setupComputes = function(e) {
                o.apply(this, arguments);
                for (var n in this.define) {
                    var r = this.define[n], i = r.get;
                    i && (this[n] = t.compute.async(e[n], i, this), this._computedBindings[n] = { count: 0 });
                }
            };
            var u = t.Map.helpers._serialize;
            t.Map.helpers._serialize = function(t, e, n) { return c(t, e, n); };
            var c = function(t, e, n) {
                    var r = t.define && t.define[e] && t.define[e].serialize;
                    return r === undefined ? u.apply(this, arguments) : r !== !1 ? "function" == typeof r ? r.call(t, n, e) : u.apply(this, arguments) : undefined;
                },
                l = n.serialize;
            return n.serialize = function(t) {
                var e = l.apply(this, arguments);
                if (t)return e;
                var n, r;
                for (var i in this.define)i in e || (n = this.define && this.define[i] && this.define[i].serialize, n && (r = c(this, i, this.attr(i)), r !== undefined && (e[i] = r)));
                return e;
            }, t.Map;
        }(__m2, __m14),
        __m58 = function(t) {
            var e = t.List._bubbleRule;
            if (t.List._bubbleRule = function(t, n) { return n.comparator ? "change" : e.apply(this, arguments); }, t.Model) {
                var n = t.Model.List._bubbleRule;
                t.Model.List._bubbleRule = function(t, e) { return e.comparator ? "change" : n.apply(this, arguments); };
            }
            var r = t.List.prototype, i = r._changes, a = r.setup;
            t.extend(r, {
                comparator: undefined,
                sortIndexes: [],
                sortedIndex: function(t) {
                    for (var e = t.attr(this.comparator), n = 0, r = 0, i = this.length; i > r; r++)
                        if (t !== this[r]) {
                            if (this[r].attr(this.comparator) >= e)return r + n;
                        } else n = -1;
                    return r + n;
                },
                sort: function(e, n) {
                    var r = this.comparator, i = r ? [function(t, e) { return t = "function" == typeof t[r] ? t[r]() : t[r], e = "function" == typeof e[r] ? e[r]() : e[r], t === e ? 0 : e > t ? -1 : 1; }] : [e];
                    return n || t.trigger(this, "reset"), Array.prototype.sort.apply(this, i);
                }
            });
            var s = function(e) { return e[0] && t.isArray(e[0]) ? e[0] : t.makeArray(e); };
            return t.each({ push: "length", unshift: 0 }, function(e, n) {
                var r = t.List.prototype, i = r[n];
                r[n] = function() {
                    var n = s(arguments), r = e ? this.length : 0, a = i.apply(this, arguments);
                    return this.comparator && n.length && (this.sort(null, !0), t.batch.trigger(this, "reset", [n]), this._triggerChange("" + r, "add", n, undefined)), a;
                };
            }), r._changes = function(e, n, r, a, s) {
                if (this.comparator && /^\d+./.test(n)) {
                    var o = +/^\d+/.exec(n)[0], u = this[o];
                    if (u !== undefined) {
                        var c = this.sortedIndex(u);
                        if (c !== o)return[].splice.call(this, o, 1), [].splice.call(this, c, 0, u), t.trigger(this, "move", [u, c, o]), t.trigger(this, "change", [n.replace(/^\d+/, c), r, a, s]), undefined;
                    }
                }
                i.apply(this, arguments);
            }, r.setup = function() { a.apply(this, arguments), this.comparator && this.sort(); }, t.Map;
        }(__m2, __m19),
        __m59 = function(t, e) {
            var n,
                r = function(t, e) {
                    var r = t.constructor.pluginName || t.constructor._shortName;
                    for (n = 0; e.length > n; n++)if ("string" == typeof e[n] ? r === e[n] : t instanceof e[n])return!0;
                    return!1;
                },
                i = e.makeArray,
                a = e.Control.setup;
            return e.Control.setup = function() {
                if (this !== e.Control) {
                    var t = this.pluginName || this._fullName;
                    "can_control" !== t && this.plugin(t), a.apply(this, arguments);
                }
            }, t.fn.extend({
                controls: function() {
                    var t, n, a = i(arguments), s = [];
                    return this.each(function() { if (t = e.$(this).data("controls"))for (var i = 0; t.length > i; i++)n = t[i], (!a.length || r(n, a)) && s.push(n); }), s;
                },
                control: function() { return this.controls.apply(this, arguments)[0]; }
            }), e.Control.plugin = function(n) {
                var r = this;
                t.fn[n] || (t.fn[n] = function(n) {
                    var a, s = i(arguments), o = "string" == typeof n && t.isFunction(r.prototype[n]), u = s[0];
                    return this.each(function() {
                        var t = e.$(this).control(r);
                        t ? o ? a = t[u].apply(t, s.slice(1)) : t.update.apply(t, s) : r.newInstance.apply(r, [this].concat(s));
                    }), a !== undefined ? a : this;
                });
            }, e.Control.prototype.update = function(t) { e.extend(this.options, t), this.on(); }, e;
        }(jQuery, __m2, __m11),
        __m60 = function(t, e) {
            var n, r, i, a, s, o, u = { val: !0, text: !0 };
            return n = function(n) {
                var a = t.fn[n];
                t.fn[n] = function() {
                    var t, s, c, l = e.makeArray(arguments), f = this;
                    if (e.isDeferred(l[0]))return l[0].done(function(t) { r.call(f, [t], a); }), this;
                    if (i(l)) {
                        if (t = o(l))return s = l[t], l[t] = function(t) { r.call(f, [t], a), s.call(f, t); }, e.view.apply(e.view, l), this;
                        if (c = e.view.apply(e.view, l), e.isDeferred(c))return c.done(function(t) { r.call(f, [t], a); }), this;
                        l = [c];
                    }
                    return u[n] ? a.apply(this, l) : r.call(this, l, a);
                };
            }, r = function(t, n) {
                var r;
                for (var i in e.view.hookups)break;
                return i && t[0] && a(t[0]) && (t[0] = e.view.frag(t[0]).childNodes), r = n.apply(this, t);
            }, i = function(t) {
                var e = typeof t[1];
                return"string" == typeof t[0] && ("object" === e || "function" === e) && !s(t[1]);
            }, s = function(t) { return t.nodeType || t[0] && t[0].nodeType; }, a = function(t) { return s(t) ? !0 : "string" == typeof t ? (t = e.trim(t), "<" === t.substr(0, 1) && ">" === t.substr(t.length - 1, 1) && t.length >= 3) : !1; }, o = function(t) { return"function" == typeof t[3] ? 3 : "function" == typeof t[2] && 2; }, t.fn.hookup = function() { return e.view.frag(this), this; }, e.each(["prepend", "append", "after", "before", "text", "html", "replaceWith", "val"], function(t) { n(t); }), e;
        }(jQuery, __m2, __m10),
        __m61 = function(t) {
            if (!t.Object)throw Error("can.fixture depends on can.Object. Please include it before can.fixture.");
            var e = function(e) { return"undefined" != typeof steal ? t.isFunction(steal.config) ? "" + steal.config().root.mapJoin(e) : "" + steal.root.join(e) : (t.fixture.rootUrl || "") + e; },
                n = function(n, r) {
                    if (t.fixture.on) {
                        var i = function() {};
                        n.type = n.type || n.method || "GET";
                        var a = u(n);
                        if (!n.fixture)return"file:" === window.location.protocol && i("ajax request to " + n.url + ", no fixture found"), undefined;
                        if ("string" == typeof n.fixture && t.fixture[n.fixture] && (n.fixture = t.fixture[n.fixture]), "string" == typeof n.fixture) {
                            var s = n.fixture;
                            /^\/\//.test(s) && (s = e(n.fixture.substr(2))), a && (s = t.sub(s, a)), delete n.fixture, n.url = s, n.data = null, n.type = "GET", n.error || (n.error = function(t, e, n) { throw"fixtures.js Error " + e + " " + n; });
                        } else n.dataTypes && n.dataTypes.splice(0, 0, "fixture"), a && r && (r.data = r.data || {}, t.extend(r.data, a));
                    }
                },
                r = function(t, e, n, r) { return"number" != typeof t && (r = e, n = t, e = "success", t = 200), "string" != typeof e && (r = n, n = e, e = "success"), t >= 400 && 599 >= t && (this.dataType = "text"), [t, e, i(this, n), r]; },
                i = function(t, e) {
                    var n = t.dataTypes ? t.dataTypes[0] : t.dataType || "json";
                    if (!e || !e[n]) {
                        var r = {};
                        r[n] = e, e = r;
                    }
                    return e;
                };
            if (t.ajaxPrefilter && t.ajaxTransport)
                t.ajaxPrefilter(n), t.ajaxTransport("fixture", function(e, n) {
                    e.dataTypes.shift();
                    var a, s = !1;
                    return{
                        send: function(o, u) {
                            a = setTimeout(function() {
                                var t = function() { s === !1 && u.apply(null, r.apply(e, arguments)); }, a = e.fixture(n, t, o, e);
                                a !== undefined && u(200, "success", i(e, a), {});
                            }, t.fixture.delay);
                        },
                        abort: function() { s = !0, clearTimeout(a); }
                    };
                });
            else {
                var a = t.ajax;
                t.ajax = function(e) {
                    if (n(e, e), e.fixture) {
                        var i, s = new t.Deferred, o = !1;
                        return s.getResponseHeader = function() {}, s.then(e.success, e.fail), s.abort = function() { clearTimeout(i), o = !0, s.reject(s); }, i = setTimeout(function() {
                            var t = function() {
                                    var t = r.apply(e, arguments), n = t[0];
                                    (n >= 200 && 300 > n || 304 === n) && o === !1 ? s.resolve(t[2][e.dataType]) : s.reject(s, "error", t[1]);
                                },
                                n = e.fixture(e, t, e.headers, e);
                            n !== undefined && s.resolve(n);
                        }, t.fixture.delay), s;
                    }
                    return a(e);
                };
            }
            var s = [],
                o = function(t, e) {
                    for (var n = 0; s.length > n; n++)if (l._similar(t, s[n], e))return n;
                    return-1;
                },
                u = function(t) {
                    var e = o(t);
                    return e > -1 ? (t.fixture = s[e].fixture, l._getData(s[e].url, t.url)) : undefined;
                },
                c = function(t) {
                    var e = t.data.id;
                    return e === undefined && "number" == typeof t.data && (e = t.data), e === undefined && t.url.replace(/\/(\d+)(\/|$|\.)/g, function(t, n) { e = n; }), e === undefined && (e = t.url.replace(/\/(\w+)(\/|$|\.)/g, function(t, n) { "update" !== n && (e = n); })), e === undefined && (e = Math.round(1e3 * Math.random())), e;
                },
                l = t.fixture = function(e, n) {
                    if (n !== undefined) {
                        if ("string" == typeof e) {
                            var r = e.match(/(GET|POST|PUT|DELETE) (.+)/i);
                            e = r ? { url: r[2], type: r[1] } : { url: e };
                        }
                        var i = o(e, !!n);
                        if (i > -1 && s.splice(i, 1), null == n)return;
                        e.fixture = n, s.push(e);
                    } else t.each(e, function(t, e) { l(e, t); });
                },
                f = t.replacer;
            return t.extend(t.fixture, {
                _similar: function(e, n, r) { return r ? t.Object.same(e, n, { fixture: null }) : t.Object.subset(e, n, t.fixture._compare); },
                _compare: { url: function(t, e) { return!!l._getData(e, t); }, fixture: null, type: "i" },
                _getData: function(e, n) {
                    var r = [],
                        i = e.replace(".", "\\.").replace("?", "\\?"),
                        a = RegExp(i.replace(f, function(t, e) {
                            return r.push(e), "([^/]+)";
                        }) + "$").exec(n),
                        s = {};
                    return a ? (a.shift(), t.each(r, function(t) { s[t] = a.shift(); }), s) : null;
                },
                store: function(e, n, r) {
                    var i, a, s, o = 0, u = function(t) { for (var e = 0; a.length > e; e++)if (t == a[e].id)return a[e]; }, l = {};
                    if (t.isArray(e) && "string" == typeof e[0] ? (i = e, e = n, n = r, r = arguments[3]) : "string" == typeof e && (i = [e + "s", e], e = n, n = r, r = arguments[3]), "number" == typeof e)
                        a = [], s = function() {
                            a = [];
                            for (var r = 0; e > r; r++) {
                                var s = n(r, a);
                                s.id || (s.id = r), o = Math.max(s.id + 1, o + 1) || a.length, a.push(s);
                            }
                            t.isArray(i) && (t.fixture["~" + i[0]] = a, t.fixture["-" + i[0]] = l.findAll, t.fixture["-" + i[1]] = l.findOne, t.fixture["-" + i[1] + "Update"] = l.update, t.fixture["-" + i[1] + "Destroy"] = l.destroy, t.fixture["-" + i[1] + "Create"] = l.create);
                        };
                    else {
                        r = n;
                        var f = e;
                        s = function() { a = f.slice(0); };
                    }
                    return t.extend(l, {
                        findAll: function(e) {
                            e = e || {};
                            var n = a.slice(0);
                            e.data = e.data || {}, t.each((e.data.order || []).slice(0).reverse(), function(t) {
                                var e = t.split(" ");
                                n = n.sort(function(t, n) { return"ASC" !== e[1].toUpperCase() ? t[e[0]] < n[e[0]] ? 1 : t[e[0]] === n[e[0]] ? 0 : -1 : t[e[0]] < n[e[0]] ? -1 : t[e[0]] === n[e[0]] ? 0 : 1; });
                            }), t.each((e.data.group || []).slice(0).reverse(), function(t) {
                                var e = t.split(" ");
                                n = n.sort(function(t, n) { return t[e[0]] > n[e[0]]; });
                            });
                            var i = parseInt(e.data.offset, 10) || 0, s = parseInt(e.data.limit, 10) || a.length - i, o = 0;
                            for (var u in e.data)if (o = 0, e.data[u] !== undefined && (-1 !== u.indexOf("Id") || -1 !== u.indexOf("_id")))for (; n.length > o;)e.data[u] != n[o][u] ? n.splice(o, 1) : o++;
                            if ("function" == typeof r)for (o = 0; n.length > o;)r(n[o], e) ? o++ : n.splice(o, 1);
                            else if ("object" == typeof r)for (o = 0; n.length > o;)t.Object.subset(n[o], e.data, r) ? o++ : n.splice(o, 1);
                            return{ count: n.length, limit: e.data.limit, offset: e.data.offset, data: n.slice(i, i + s) };
                        },
                        findOne: function(t, e) {
                            var n = u(c(t));
                            return n === undefined ? e(404, "Requested resource not found") : (e(n), undefined);
                        },
                        update: function(e, n) {
                            var r = c(e), i = u(r);
                            return i === undefined ? n(404, "Requested resource not found") : (t.extend(i, e.data), n({ id: r }, { location: e.url || "/" + c(e) }), undefined);
                        },
                        destroy: function(t, e) {
                            var n = c(t), r = u(n);
                            if (r === undefined)return e(404, "Requested resource not found");
                            for (var i = 0; a.length > i; i++)
                                if (a[i].id == n) {
                                    a.splice(i, 1);
                                    break;
                                }
                            return{};
                        },
                        create: function(e, r) {
                            var i = n(a.length, a);
                            t.extend(i, e.data), i.id || (i.id = o++), a.push(i), r({ id: i.id }, { location: e.url + "/" + i.id });
                        }
                    }), s(), t.extend({ getId: c, find: function(t) { return u(c(t)); }, reset: s }, l);
                },
                rand: function d(t, e, n) {
                    if ("number" == typeof t)return"number" == typeof e ? t + Math.floor(Math.random() * (e - t)) : Math.floor(Math.random() * t);
                    var r = d;
                    if (e === undefined)return r(t, r(t.length + 1));
                    var i = [];
                    t = t.slice(0), n || (n = e), n = e + Math.round(r(n - e));
                    for (var a = 0; n > a; a++)i.push(t.splice(r(t.length), 1)[0]);
                    return i;
                },
                xhr: function(e) { return t.extend({}, { abort: t.noop, getAllResponseHeaders: function() { return""; }, getResponseHeader: function() { return""; }, open: t.noop, overrideMimeType: t.noop, readyState: 4, responseText: "", responseXML: null, send: t.noop, setRequestHeader: t.noop, status: 200, statusText: "OK" }, e); },
                on: !0
            }), t.fixture.delay = 200, t.fixture.rootUrl = e(""), t.fixture["-handleFunction"] = function(e) { return"string" == typeof e.fixture && t.fixture[e.fixture] && (e.fixture = t.fixture[e.fixture]), "function" == typeof e.fixture ? (setTimeout(function() { e.success && e.success.apply(null, e.fixture(e, "success")), e.complete && e.complete.apply(null, e.fixture(e, "complete")); }, t.fixture.delay), !0) : !1; }, t.fixture.overwrites = s, t.fixture.make = t.fixture.store, t.fixture;
        }(__m2, __m13, __m46);
    window.can = __m4;
})();