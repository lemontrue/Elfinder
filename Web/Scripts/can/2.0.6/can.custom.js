/*!
 * CanJS - 2.0.6
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 17 Mar 2014 06:59:20 GMT
 * Licensed MIT
 * Includes: can/component/component.js,can/construct/construct.js,can/map/map.js,can/list/list.js,can/compute/compute.js,can/model/model.js,can/view/view.js,can/control/control.js,can/route/route.js,can/control/route/route.js,can/view/mustache/mustache.js,can/view/ejs/ejs.js,can/route/pushstate/pushstate.js,can/model/queue/queue.js,can/construct/super/super.js,can/construct/proxy/proxy.js,can/map/delegate/delegate.js,can/map/setter/setter.js,can/map/attributes/attributes.js,can/map/validations/validations.js,can/map/backup/backup.js,can/map/list/list.js,can/map/sort/sort.js,can/control/plugin/plugin.js,can/view/modifiers/modifiers.js,can/util/object/object.js,can/util/fixture/fixture.js
 * Download from: http://bitbuilder.herokuapp.com/can.custom.js?configuration=jquery&minify=true&plugins=can%2Fcomponent%2Fcomponent.js&plugins=can%2Fconstruct%2Fconstruct.js&plugins=can%2Fmap%2Fmap.js&plugins=can%2Flist%2Flist.js&plugins=can%2Fcompute%2Fcompute.js&plugins=can%2Fmodel%2Fmodel.js&plugins=can%2Fview%2Fview.js&plugins=can%2Fcontrol%2Fcontrol.js&plugins=can%2Froute%2Froute.js&plugins=can%2Fcontrol%2Froute%2Froute.js&plugins=can%2Fview%2Fmustache%2Fmustache.js&plugins=can%2Fview%2Fejs%2Fejs.js&plugins=can%2Froute%2Fpushstate%2Fpushstate.js&plugins=can%2Fmodel%2Fqueue%2Fqueue.js&plugins=can%2Fconstruct%2Fsuper%2Fsuper.js&plugins=can%2Fconstruct%2Fproxy%2Fproxy.js&plugins=can%2Fmap%2Fdelegate%2Fdelegate.js&plugins=can%2Fmap%2Fsetter%2Fsetter.js&plugins=can%2Fmap%2Fattributes%2Fattributes.js&plugins=can%2Fmap%2Fvalidations%2Fvalidations.js&plugins=can%2Fmap%2Fbackup%2Fbackup.js&plugins=can%2Fmap%2Flist%2Flist.js&plugins=can%2Fmap%2Fsort%2Fsort.js&plugins=can%2Fcontrol%2Fplugin%2Fplugin.js&plugins=can%2Fview%2Fmodifiers%2Fmodifiers.js&plugins=can%2Futil%2Fobject%2Fobject.js&plugins=can%2Futil%2Ffixture%2Ffixture.js
 */
(function(undefined) {
    var __m4 = function() {
            var t = window.can || {};
            ("undefined" == typeof GLOBALCAN || GLOBALCAN !== !1) && (window.can = t), t.isDeferred = function(t) {
                var e = this.isFunction;
                return t && e(t.then) && e(t.pipe);
            };
            var e = 0;
            return t.cid = function(t, n) { return t._cid || (e++, t._cid = (n || "") + e), t._cid; }, t.VERSION = "@EDGE", t.simpleExtend = function(t, e) {
                for (var n in e)t[n] = e[n];
                return t;
            }, t;
        }(),
        __m5 = function(t) {
            return t.each = function(e, n, r) {
                var i, a = 0;
                if (e)
                    if ("number" == typeof e.length && e.pop)for (e.attr && e.attr("length"), i = e.length; i > a && n.call(r || e[a], e[a], a, e) !== !1; a++);
                    else if (e.hasOwnProperty) {
                        t.Map && e instanceof t.Map && (t.__reading && t.__reading(e, "__keys"), e = e.__get());
                        for (i in e)if (e.hasOwnProperty(i) && n.call(r || e[i], e[i], i, e) === !1)break;
                    }
                return e;
            }, t;
        }(__m4),
        __m6 = function(t) {
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
        __m7 = function(t) {
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
                    for (var h in c) {
                        var f = c[h] || [];
                        for (s = 0; f.length > s;)r && r === f[s] || !r ? (t.unbind.call(e, h, f[s]), f.splice(s, 1)) : s++;
                        f.length || delete l.events[h];
                    }
                    t.isEmptyObject(l.events) && delete i[u];
                }
                return this;
            }, t.removeEvent = function(t, e) {
                if (!this.__bindEvents)return this;
                for (var n, r = this.__bindEvents[t] || [], i = 0, a = "function" == typeof e; r.length > i;)n = r[i], a && n.handler === e || !a && n.cid === e ? r.splice(i, 1) : i++;
                return this;
            }, t.dispatch = function(t, e) {
                if (this.__bindEvents) {
                    "string" == typeof t && (t = { type: t });
                    var n, r = t.type, i = (this.__bindEvents[r] || []).slice(0);
                    e = [t].concat(e || []);
                    for (var a = 0, s = i.length; s > a; a++)n = i[a], n.handler.apply(this, e);
                }
            }, t;
        }(__m4),
        __m2 = function(t, e) {
            var n = function(t) { return t.nodeName && (1 === t.nodeType || 9 === t.nodeType) || t == window; };
            t.extend(e, t, {
                trigger: function(r, i, a) { n(r) ? t.event.trigger(i, a, r, !0) : r.trigger ? r.trigger(i, a) : ("string" == typeof i && (i = { type: i }), i.target = i.target || r, e.dispatch.call(r, i, a)); },
                addEvent: e.addEvent,
                removeEvent: e.removeEvent,
                buildFragment: function(e, n) {
                    var r, i = t.buildFragment;
                    return e = [e], n = n || document, n = !n.nodeType && n[0] || n, n = n.ownerDocument || n, r = i.call(jQuery, e, n), r.cacheable ? t.clone(r.fragment) : r.fragment || r;
                },
                $: t,
                each: e.each,
                bind: function(r, i) { return this.bind && this.bind !== e.bind ? this.bind(r, i) : n(this) ? t.event.add(this, r, i) : e.addEvent.call(this, r, i), this; },
                unbind: function(r, i) { return this.unbind && this.unbind !== e.unbind ? this.unbind(r, i) : n(this) ? t.event.remove(this, r, i) : e.removeEvent.call(this, r, i), this; },
                delegate: function(e, r, i) { return this.delegate ? this.delegate(e, r, i) : n(this) && t(this).delegate(e, r, i), this; },
                undelegate: function(e, r, i) { return this.undelegate ? this.undelegate(e, r, i) : n(this) && t(this).undelegate(e, r, i), this; },
                proxy: function(t, e) { return function() { return t.apply(e, arguments); }; }
            }), e.on = e.bind, e.off = e.unbind, t.each(["append", "filter", "addClass", "remove", "data", "get", "has"], function(t, n) { e[n] = function(t) { return t[n].apply(t, e.makeArray(arguments).slice(1)); }; });
            var r = t.cleanData;
            t.cleanData = function(n) { t.each(n, function(t, n) { n && e.trigger(n, "removed", [], !1); }), r(n); };
            var i, a = t.fn.domManip;
            return t.fn.domManip = function() {
                for (var t = 1; arguments.length > t; t++)
                    if ("function" == typeof arguments[t]) {
                        i = t;
                        break;
                    }
                return a.apply(this, arguments);
            }, t(document.createElement("div")).append(document.createElement("div")), t.fn.domManip = 2 === i ? function(t, n, r) {
                return a.call(this, t, n, function(t) {
                    var n = 11 === t.nodeType ? e.makeArray(t.childNodes) : null, i = r.apply(this, arguments);
                    return e.inserted(n ? n : [t]), i;
                });
            } : function(t, n) {
                return a.call(this, t, function(t) {
                    var r = 11 === t.nodeType ? e.makeArray(t.childNodes) : null, i = n.apply(this, arguments);
                    return e.inserted(r ? r : [t]), i;
                });
            }, t.event.special.inserted = {}, t.event.special.removed = {}, e;
        }(jQuery, __m4, __m5, __m6, __m7),
        __m10 = function(t) {
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
                h = function(t, e, n) {
                    var r = t[e];
                    return r === undefined && n === !0 && (r = t[e] = {}), r;
                },
                f = function(t) { return/^f|^o/.test(typeof t); },
                p = function(t) {
                    var e = null === t || t === undefined || isNaN(t) && "NaN" == "" + t;
                    return"" + (e ? "" : t);
                };
            return t.extend(t, {
                esc: function(t) { return p(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(o, "&#34;").replace(u, "&#39;"); },
                getObject: function(e, n, r) {
                    var i, a, s, o, u = e ? e.split(".") : [], c = u.length, l = 0;
                    if (n = t.isArray(n) ? n : [n || window], o = n.length, !c)return n[0];
                    for (l; o > l; l++) {
                        for (i = n[l], s = undefined, a = 0; c > a && f(i); a++)s = i, i = h(s, u[a]);
                        if (s !== undefined && i !== undefined)break;
                    }
                    if (r === !1 && i !== undefined && delete s[u[a - 1]], r === !0 && i === undefined)for (i = n[0], a = 0; c > a && f(i); a++)i = h(i, u[a], !0);
                    return i;
                },
                capitalize: function(t) { return t.charAt(0).toUpperCase() + t.slice(1); },
                camelize: function(t) { return p(t).replace(c, function(t, e) { return e ? e.toUpperCase() : ""; }); },
                hyphenate: function(t) { return p(t).replace(l, function(t) { return t.charAt(0) + "-" + t.charAt(1).toLowerCase(); }); },
                underscore: function(t) { return t.replace(n, "/").replace(r, "$1_$2").replace(i, "$1_$2").replace(a, "_").toLowerCase(); },
                sub: function(e, n, r) {
                    var i = [];
                    return e = e || "", i.push(e.replace(s, function(e, a) {
                        var s = t.getObject(a, n, r === !0 ? !1 : undefined);
                        return s === undefined || null === s ? (i = null, "") : f(s) && i ? (i.push(s), "") : "" + s;
                    })), null === i ? i : 1 >= i.length ? i[0] : i;
                },
                replacer: s,
                undHash: e
            }), t;
        }(__m2),
        __m9 = function(t) {
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
                    var s, o, u, c, l, h, f, p, d = this, g = this.prototype;
                    p = this.instance(), t.Construct._inherit(i, g, p);
                    for (l in d)d.hasOwnProperty(l) && (a[l] = d[l]);
                    t.Construct._inherit(r, d, a), n && (s = n.split("."), h = s.pop(), o = t.getObject(s.join("."), window, !0), f = o, u = t.underscore(n.replace(/\./g, "_")), c = t.underscore(h), o[h] = a), t.extend(a, { constructor: a, prototype: p, namespace: f, _shortName: c, fullName: n, _fullName: u }), h !== undefined && (a.shortName = h), a.prototype.constructor = a;
                    var m = [d].concat(t.makeArray(arguments)), _ = a.setup.apply(a, m);
                    return a.init && a.init.apply(a, _ || m), a;
                }
            }), t.Construct.prototype.setup = function() {}, t.Construct.prototype.init = function() {}, t.Construct;
        }(__m10),
        __m8 = function(t) {
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
                h = t.Control = t.Construct({
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
                        return"constructor" !== t && ("function" === n || "string" === n && r(this.prototype[e])) && !!(u[t] || f[t] || /[^\w]/.test(t));
                    },
                    _action: function(n, r) {
                        if (o.lastIndex = 0, r || !o.test(n)) {
                            var i = r ? t.sub(n, this._lookup(r)) : n;
                            if (!i)return null;
                            var a = t.isArray(i), s = a ? i[1] : i, u = s.split(/\s+/g), c = u.pop();
                            return{ processor: f[c] || e, parts: [s, u.join(" "), c], delegate: a ? i[0] : undefined };
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
                            var a, s, o = this.constructor, u = this._bindings, c = o.actions, h = this.element, f = t.Control._shifter(this, "destroy");
                            for (a in c)c.hasOwnProperty(a) && (s = c[a] || o._action(a, this.options)) && u.push(s.processor(s.delegate || h, s.parts[2], s.parts[1], a, this));
                            return t.bind.call(h, "removed", f), u.push(function(e) { t.unbind.call(e, "removed", f); }), u.length;
                        }
                        return"string" == typeof e && (i = r, r = n, n = e, e = this.element), i === undefined && (i = r, r = n, n = null), "string" == typeof i && (i = t.Control._shifter(this, i)), this._bindings.push(l(e, r, i, n)), this._bindings.length;
                    },
                    off: function() {
                        var t = this.element[0];
                        a(this._bindings || [], function(e) { e(t); }), this._bindings = [];
                    },
                    destroy: function() {
                        if (null !== this.element) {
                            var e, n = this.constructor, r = n.pluginName || n._fullName;
                            this.off(), r && "can_control" !== r && this.element.removeClass(r), e = t.data(this.element, "controls"), e.splice(t.inArray(this, e), 1), t.trigger(this, "destroyed"), this.element = null;
                        }
                    }
                }),
                f = t.Control.processors;
            return e = function(e, n, r, i, a) { return l(e, n, t.Control._shifter(a, i), r); }, a(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", "keypress", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin", "focusout", "mouseenter", "mouseleave", "touchstart", "touchmove", "touchcancel", "touchend", "touchleave"], function(t) { f[t] = e; }), h;
        }(__m2, __m9),
        __m13 = function(t) { return t.bindAndSetup = function() { return t.addEvent.apply(this, arguments), this._init || (this._bindings ? this._bindings++ : (this._bindings = 1, this._bindsetup && this._bindsetup())), this; }, t.unbindAndTeardown = function() { return t.removeEvent.apply(this, arguments), null === this._bindings ? this._bindings = 0 : this._bindings--, !this._bindings && this._bindteardown && this._bindteardown(), this; }, t; }(__m2),
        __m14 = function(t) {
            var e = 1, n = 0, r = [], i = [];
            t.batch = {
                start: function(t) { n++, t && i.push(t); },
                stop: function(a, s) {
                    if (a ? n = 0 : n--, 0 === n) {
                        var o = r.slice(0), u = i.slice(0);
                        r = [], i = [], e++, s && t.batch.start(), t.each(o, function(e) { t.trigger.apply(t, e); }), t.each(u, function(t) { t(); });
                    }
                },
                trigger: function(i, a, s) {
                    if (!i._init) {
                        if (0 === n)return t.trigger(i, a, s);
                        a = "string" == typeof a ? { type: a } : a, a.batchNum = e, r.push([i, a, s]);
                    }
                }
            };
        }(__m4),
        __m12 = function(t) {
            var e = function(e, n, r) {
                    t.listenTo.call(r, e, "change", function() {
                        var i = t.makeArray(arguments), a = i.shift();
                        i[0] = ("*" === n ? [r.indexOf(e), i[0]] : [n, i[0]]).join("."), a.triggeredNS = a.triggeredNS || {}, a.triggeredNS[r._cid] || (a.triggeredNS[r._cid] = !0, t.trigger(r, a, i));
                    });
                },
                n = function(e, n) { return n ? [e] : t.isArray(e) ? e : ("" + e).split("."); },
                r = function(t) {
                    return function() {
                        var n = this;
                        this._each(function(r, i) { r && r.bind && e(r, t || i, n); });
                    };
                },
                i = null,
                a = function() {
                    for (var t in i)i[t].added && delete i[t].obj._cid;
                    i = null;
                },
                s = function(t) { return i && i[t._cid] && i[t._cid].instance; },
                o = t.Map = t.Construct.extend({
                    setup: function() {
                        if (t.Construct.setup.apply(this, arguments), t.Map) {
                            this.defaults || (this.defaults = {}), this._computes = [];
                            for (var e in this.prototype)"function" != typeof this.prototype[e] ? this.defaults[e] = this.prototype[e] : this.prototype[e].isComputed && this._computes.push(e);
                        }
                        !t.List || this.prototype instanceof t.List || (this.List = o.List({ Map: this }, {}));
                    },
                    _computes: [],
                    bind: t.bindAndSetup,
                    on: t.bindAndSetup,
                    unbind: t.unbindAndTeardown,
                    off: t.unbindAndTeardown,
                    id: "id",
                    helpers: {
                        addToMap: function(e, n) {
                            var r;
                            i || (r = a, i = {});
                            var s = e._cid, o = t.cid(e);
                            return i[o] || (i[o] = { obj: e, instance: n, added: !s }), r;
                        },
                        canMakeObserve: function(e) { return e && !t.isDeferred(e) && (t.isArray(e) || t.isPlainObject(e) || e instanceof t.Map); },
                        unhookup: function(e, n) { return t.each(e, function(e) { e && e.unbind && t.stopListening.call(n, e, "change"); }); },
                        hookupBubble: function(n, r, i, a, u) { return a = a || o, u = u || t.List, n instanceof o ? i._bindings && o.helpers.unhookup([n], i) : n = t.isArray(n) ? s(n) || new u(n) : s(n) || new a(n), i._bindings && e(n, r, i), n; },
                        serialize: function(e, n, r) { return e.each(function(i, a) { r[a] = o.helpers.canMakeObserve(i) && t.isFunction(i[n]) ? i[n]() : i, t.__reading && t.__reading(e, a); }), t.__reading && t.__reading(e, "__keys"), r; },
                        makeBindSetup: r
                    },
                    keys: function(e) {
                        var n = [];
                        t.__reading && t.__reading(e, "__keys");
                        for (var r in e._data)n.push(r);
                        return n;
                    }
                }, {
                    setup: function(e) {
                        this._data = {}, t.cid(this, ".map"), this._init = 1, this._setupComputes();
                        var n = e && t.Map.helpers.addToMap(e, this), r = t.extend(t.extend(!0, {}, this.constructor.defaults || {}), e);
                        this.attr(r), n && n(), this.bind("change", t.proxy(this._changes, this)), delete this._init;
                    },
                    _setupComputes: function() {
                        var t = this.constructor._computes;
                        this._computedBindings = {};
                        for (var e, n = 0, r = t.length; r > n; n++)e = t[n], this[e] = this[e].clone(this), this._computedBindings[e] = { count: 0 };
                    },
                    _bindsetup: r(),
                    _bindteardown: function() {
                        var t = this;
                        this._each(function(e) { o.helpers.unhookup([e], t); });
                    },
                    _changes: function(e, n, r, i, a) { t.batch.trigger(this, { type: n, batchNum: e.batchNum }, [i, a]); },
                    _triggerChange: function() { t.batch.trigger(this, "change", t.makeArray(arguments)); },
                    _each: function(t) {
                        var e = this.__get();
                        for (var n in e)e.hasOwnProperty(n) && t(e[n], n);
                    },
                    attr: function(e, n) {
                        var r = typeof e;
                        return"string" !== r && "number" !== r ? this._attrs(e, n) : 1 === arguments.length ? (t.__reading && t.__reading(this, e), this._get(e)) : (this._set(e, n), this);
                    },
                    each: function() { return t.__reading && t.__reading(this, "__keys"), t.each.apply(undefined, [this.__get()].concat(t.makeArray(arguments))); },
                    removeAttr: function(e) {
                        var r = t.List && this instanceof t.List, i = n(e), a = i.shift(), s = r ? this[a] : this._data[a];
                        return i.length && s ? s.removeAttr(i) : (~e.indexOf(".") && (a = e), r ? this.splice(a, 1) : a in this._data && (delete this._data[a], a in this.constructor.prototype || delete this[a], t.batch.trigger(this, "__keys"), this._triggerChange(a, "remove", undefined, s)), s);
                    },
                    _get: function(t) {
                        var e;
                        if ("string" == typeof t && ~t.indexOf(".") && (e = this.__get(t), e !== undefined))return e;
                        var r = n(t), i = this.__get(r.shift());
                        return r.length ? i ? i._get(r) : undefined : i;
                    },
                    __get: function(e) { return e ? this[e] && this[e].isComputed && t.isFunction(this.constructor.prototype[e]) ? this[e]() : this._data[e] : this._data; },
                    _set: function(t, e, r) {
                        var i = n(t, r), a = i.shift(), s = this.__get(a);
                        if (i.length && o.helpers.canMakeObserve(s))s._set(i, e);
                        else {
                            if (i.length)throw"can.Map: Object does not exist";
                            this.__convert && (e = this.__convert(a, e)), this.__set(a, e, s);
                        }
                    },
                    __set: function(e, n, r) {
                        if (n !== r) {
                            var i = this.__get().hasOwnProperty(e) ? "set" : "add";
                            this.___set(e, o.helpers.canMakeObserve(n) ? o.helpers.hookupBubble(n, e, this) : n), "add" === i && t.batch.trigger(this, "__keys", undefined), this._triggerChange(e, i, n, r), r && o.helpers.unhookup([r], this);
                        }
                    },
                    ___set: function(e, n) { this[e] && this[e].isComputed && t.isFunction(this.constructor.prototype[e]) && this[e](n), this._data[e] = n, t.isFunction(this.constructor.prototype[e]) || (this[e] = n); },
                    bind: function(e) {
                        var n = this._computedBindings && this._computedBindings[e];
                        if (n)
                            if (n.count)n.count++;
                            else {
                                n.count = 1;
                                var r = this;
                                n.handler = function(n, i, a) { t.batch.trigger(r, { type: e, batchNum: n.batchNum }, [i, a]); }, this[e].bind("change", n.handler);
                            }
                        return t.bindAndSetup.apply(this, arguments);
                    },
                    unbind: function(e) {
                        var n = this._computedBindings && this._computedBindings[e];
                        return n && (1 === n.count ? (n.count = 0, this[e].unbind("change", n.handler), delete n.handler) : n.count++), t.unbindAndTeardown.apply(this, arguments);
                    },
                    serialize: function() { return t.Map.helpers.serialize(this, "serialize", {}); },
                    _attrs: function(e, n) {
                        var r, i = this;
                        if (e === undefined)return o.helpers.serialize(this, "attr", {});
                        e = t.simpleExtend({}, e), t.batch.start(), this.each(function(a, s) {
                            if ("_cid" !== s) {
                                if (r = e[s], r === undefined)return n && i.removeAttr(s), undefined;
                                i.__convert && (r = i.__convert(s, r)), r instanceof t.Map ? i.__set(s, r, a) : o.helpers.canMakeObserve(a) && o.helpers.canMakeObserve(r) && a.attr ? a.attr(r, n) : a !== r && i.__set(s, r, a), delete e[s];
                            }
                        });
                        for (var a in e)"_cid" !== a && (r = e[a], this._set(a, r, !0));
                        return t.batch.stop(), this;
                    },
                    compute: function(e) {
                        if (t.isFunction(this.constructor.prototype[e]))return t.compute(this[e], this);
                        var n = e.split("."), r = n.length - 1, i = { args: [] };
                        return t.compute(function(e) { return arguments.length ? (t.compute.read(this, n.slice(0, r)).value.attr(n[r], e), undefined) : t.compute.read(this, n, i).value; }, this);
                    }
                });
            return o.prototype.on = o.prototype.bind, o.prototype.off = o.prototype.unbind, o;
        }(__m2, __m13, __m9, __m14),
        __m15 = function(t, e) {
            var n = [].splice,
                r = function() {
                    var t = { 0: "a", length: 1 };
                    return n.call(t, 0, 1), !t[0];
                }(),
                i = e({ Map: e }, {
                    setup: function(e, n) {
                        this.length = 0, t.cid(this, ".map"), this._init = 1, e = e || [];
                        var r;
                        t.isDeferred(e) ? this.replace(e) : (r = e.length && t.Map.helpers.addToMap(e, this), this.push.apply(this, t.makeArray(e || []))), r && r(), this.bind("change", t.proxy(this._changes, this)), t.simpleExtend(this, n), delete this._init;
                    },
                    _triggerChange: function(n, r, i, a) { e.prototype._triggerChange.apply(this, arguments), ~n.indexOf(".") || ("add" === r ? (t.batch.trigger(this, r, [i, +n]), t.batch.trigger(this, "length", [this.length])) : "remove" === r ? (t.batch.trigger(this, r, [a, +n]), t.batch.trigger(this, "length", [this.length])) : t.batch.trigger(this, r, [i, +n])); },
                    __get: function(t) { return t ? this[t] : this; },
                    ___set: function(t, e) { this[t] = e, +t >= this.length && (this.length = +t + 1); },
                    _each: function(t) { for (var e = this.__get(), n = 0; e.length > n; n++)t(e[n], n); },
                    _bindsetup: e.helpers.makeBindSetup("*"),
                    serialize: function() { return e.helpers.serialize(this, "serialize", []); },
                    splice: function(i, a) {
                        var s, o = t.makeArray(arguments);
                        for (s = 2; o.length > s; s++) {
                            var u = o[s];
                            e.helpers.canMakeObserve(u) && (o[s] = e.helpers.hookupBubble(u, "*", this, this.constructor.Map, this.constructor));
                        }
                        a === undefined && (a = o[1] = this.length - i);
                        var c = n.apply(this, o);
                        if (!r)for (s = this.length; c.length + this.length > s; s++)delete this[s];
                        return t.batch.start(), a > 0 && (this._triggerChange("" + i, "remove", undefined, c), e.helpers.unhookup(c, this)), o.length > 2 && this._triggerChange("" + i, "add", o.slice(2), c), t.batch.stop(), c;
                    },
                    _attrs: function(n, r) { return n === undefined ? e.helpers.serialize(this, "attr", []) : (n = t.makeArray(n), t.batch.start(), this._updateAttrs(n, r), t.batch.stop(), undefined); },
                    _updateAttrs: function(t, n) {
                        for (var r = Math.min(t.length, this.length), i = 0; r > i; i++) {
                            var a = this[i], s = t[i];
                            e.helpers.canMakeObserve(a) && e.helpers.canMakeObserve(s) ? a.attr(s, n) : a !== s && this._set(i, s);
                        }
                        t.length > this.length ? this.push.apply(this, t.slice(this.length)) : t.length < this.length && n && this.splice(t.length);
                    }
                }),
                a = function(e) { return e[0] && t.isArray(e[0]) ? e[0] : t.makeArray(e); };
            return t.each({ push: "length", unshift: 0 }, function(t, n) {
                var r = [][n];
                i.prototype[n] = function() {
                    for (var n, i, a = [], s = t ? this.length : 0, o = arguments.length; o--;)i = arguments[o], a[o] = e.helpers.canMakeObserve(i) ? e.helpers.hookupBubble(i, "*", this, this.constructor.Map, this.constructor) : i;
                    return n = r.apply(this, a), (!this.comparator || a.length) && this._triggerChange("" + s, "add", a, undefined), n;
                };
            }), t.each({ pop: "length", shift: 0 }, function(e, n) {
                i.prototype[n] = function() {
                    var r = a(arguments), i = e && this.length ? this.length - 1 : 0, s = [][n].apply(this, r);
                    return this._triggerChange("" + i, "remove", undefined, [s]), s && s.unbind && t.stopListening.call(this, s, "change"), s;
                };
            }), t.extend(i.prototype, {
                indexOf: function(e, n) { return this.attr("length"), t.inArray(e, this, n); },
                join: function() { return[].join.apply(this.attr(), arguments); },
                reverse: [].reverse,
                slice: function() {
                    var t = Array.prototype.slice.apply(this, arguments);
                    return new this.constructor(t);
                },
                concat: function() {
                    var e = [];
                    return t.each(t.makeArray(arguments), function(n, r) { e[r] = n instanceof t.List ? n.serialize() : n; }), new this.constructor(Array.prototype.concat.apply(this.serialize(), e));
                },
                forEach: function(e, n) { return t.each(this, e, n || this); },
                replace: function(e) { return t.isDeferred(e) ? e.then(t.proxy(this.replace, this)) : this.splice.apply(this, [0, this.length].concat(t.makeArray(e || []))), this; }
            }), t.List = e.List = i, t.List;
        }(__m2, __m12),
        __m16 = function(t) {
            var e = ["__reading", "__clearReading", "__setReading"],
                n = function(n) {
                    for (var r = {}, i = 0; e.length > i; i++)r[e[i]] = t[e[i]];
                    return t.__reading = function(t, e) { n.push({ obj: t, attr: e + "" }); }, t.__clearReading = function() { return n.splice(0, n.length); }, t.__setReading = function(t) { [].splice.apply(n, [0, n.length].concat(t)); }, r;
                },
                r = function() {},
                i = function(e, r) {
                    var i = [], a = n(i), s = e.call(r);
                    return t.simpleExtend(t, a), { value: s, observed: i };
                },
                a = function(e, n, r, a) {
                    var s,
                        o = {},
                        u = !0,
                        c = {
                            value: undefined,
                            teardown: function() {
                                for (var t in o) {
                                    var e = o[t];
                                    e.observe.obj.unbind(e.observe.attr, l), delete o[t];
                                }
                            }
                        },
                        l = function(t) {
                            if (!(a && !a.bound || t.batchNum !== undefined && t.batchNum === s)) {
                                var e = c.value, n = h();
                                c.value = n, n !== e && r(n, e), s = s = t.batchNum;
                            }
                        },
                        h = function() {
                            var t, r = i(e, n), a = r.observed, s = r.value;
                            u = !u;
                            for (var c = 0, h = a.length; h > c; c++)t = a[c], o[t.obj._cid + "|" + t.attr] ? o[t.obj._cid + "|" + t.attr].matched = u : (o[t.obj._cid + "|" + t.attr] = { matched: u, observe: t }, t.obj.bind(t.attr, l));
                            for (var f in o)t = o[f], t.matched !== u && (t.observe.obj.unbind(t.observe.attr, l), delete o[f]);
                            return s;
                        };
                    return c.value = h(), c.isListening = !t.isEmptyObject(o), c;
                },
                s = function(e) { return e instanceof t.Map || e && e.__get; };
            t.compute = function(e, n, s) {
                if (e && e.isComputed)return e;
                var o, u, c, l, h = { bound: !1, hasDependencies: !1 }, f = r, p = r, d = function() { return c; }, g = function(t) { c = t; }, m = !0, _ = t.makeArray(arguments), v = function(e, n) { c = e, t.batch.trigger(u, "change", [e, n]); };
                if (u = function(e) {
                    if (arguments.length) {
                        var r = c, i = g.call(n, e, r);
                        return u.hasDependencies ? d.call(n) : (c = i === undefined ? d.call(n) : i, r !== c && t.batch.trigger(u, "change", [c, r]), c);
                    }
                    return t.__reading && m && (t.__reading(u, "change"), h.bound || t.compute.temporarilyBind(u)), h.bound ? c : d.call(n);
                }, "function" == typeof e)g = e, d = e, m = s === !1 ? !1 : !0, u.hasDependencies = !1, f = function(t) { o = a(e, n || this, t, h), u.hasDependencies = o.isListening, c = o.value; }, p = function() { o && o.teardown(); };
                else if (n)
                    if ("string" == typeof n) {
                        var b = n, y = e instanceof t.Map;
                        y && (u.hasDependencies = !0), d = function() { return y ? e.attr(b) : e[b]; }, g = function(t) { y ? e.attr(b, t) : e[b] = t; };
                        var w;
                        f = function(n) { w = function() { n(d(), c); }, t.bind.call(e, s || b, w), c = i(d).value; }, p = function() { t.unbind.call(e, s || b, w); };
                    } else if ("function" == typeof n)c = e, g = n, n = s, l = "setter";
                    else {
                        c = e;
                        var x = n, k = v;
                        v = function() {
                            var t = d.call(n);
                            t !== c && k(t, c);
                        }, d = x.get || d, g = x.set || g, f = x.on || f, p = x.off || p;
                    }
                else c = e;
                return t.cid(u, "compute"), t.simpleExtend(u, {
                    isComputed: !0,
                    _bindsetup: function() {
                        h.bound = !0;
                        var e = t.__reading;
                        delete t.__reading, f.call(this, v), t.__reading = e;
                    },
                    _bindteardown: function() { p.call(this, v), h.bound = !1; },
                    bind: t.bindAndSetup,
                    unbind: t.unbindAndTeardown,
                    clone: function(e) { return e && ("setter" === l ? _[2] = e : _[1] = e), t.compute.apply(t, _); }
                });
            };
            var o,
                u = function() {
                    for (var t = 0, e = o.length; e > t; t++)o[t].unbind("change", r);
                    o = null;
                };
            return t.compute.temporarilyBind = function(t) { t.bind("change", r), o || (o = [], setTimeout(u, 10)), o.push(t); }, t.compute.binder = a, t.compute.truthy = function(e) {
                return t.compute(function() {
                    var t = e();
                    return"function" == typeof t && (t = t()), !!t;
                });
            }, t.compute.read = function(e, n, r) {
                r = r || {};
                for (var i, a, o, u = e, c = 0, l = n.length; l > c; c++)if (a = u, a && a.isComputed && (r.foundObservable && r.foundObservable(a, c), a = a()), s(a) ? (!o && r.foundObservable && r.foundObservable(a, c), o = 1, u = "function" == typeof a[n[c]] && a.constructor.prototype[n[c]] === a[n[c]] ? r.returnObserveMethods ? u[n[c]] : "constructor" === n[c] && a instanceof t.Construct ? a[n[c]] : a[n[c]].apply(a, r.args || []) : u.attr(n[c])) : u = a[n[c]], u && u.isComputed && !r.isArgument && l - 1 > c && (!o && r.foundObservable && r.foundObservable(a, c + 1), u = u()), i = typeof u, n.length - 1 > c && (null === u || "function" !== i && "object" !== i))return r.earlyExit && r.earlyExit(a, c, u), { value: undefined, parent: a };
                return"function" == typeof u && (r.isArgument ? u.isComputed || r.proxyMethods === !1 || (u = t.proxy(u, a)) : (u.isComputed && !o && r.foundObservable && r.foundObservable(u, c), u = u.call(a))), u === undefined && r.earlyExit && r.earlyExit(a, c - 1), { value: u, parent: a };
            }, t.compute;
        }(__m2, __m13, __m14),
        __m11 = function(t) { return t.Observe = t.Map, t.Observe.startBatch = t.batch.start, t.Observe.stopBatch = t.batch.stop, t.Observe.triggerBatch = t.batch.trigger, t; }(__m2, __m12, __m15, __m16),
        __m19 = function(t) {
            var e = t.isFunction,
                n = t.makeArray,
                r = 1,
                i = t.view = t.template = function(n, r, a, s) {
                    e(a) && (s = a, a = undefined);
                    var o = function(t) { return i.frag(t); }, u = e(s) ? function(t) { s(o(t)); } : null, c = e(n) ? n(r, a, u) : i.render(n, r, a, u), l = t.Deferred();
                    return e(c) ? c : t.isDeferred(c) ? (c.then(function(t, e) { l.resolve.call(l, o(t), e); }, function() { l.fail.apply(l, arguments); }), l) : o(c);
                };
            t.extend(i, {
                frag: function(t, e) { return i.hookup(i.fragment(t), e); },
                fragment: function(e) {
                    var n = t.buildFragment(e, document.body);
                    return n.childNodes.length || n.appendChild(document.createTextNode("")), n;
                },
                toId: function(e) { return t.map(("" + e).split(/\/|\./g), function(t) { return t ? t : undefined; }).join("_"); },
                hookup: function(e, n) {
                    var r, a, s = [];
                    return t.each(e.childNodes ? t.makeArray(e.childNodes) : e, function(e) { 1 === e.nodeType && (s.push(e), s.push.apply(s, t.makeArray(e.getElementsByTagName("*")))); }), t.each(s, function(t) { t.getAttribute && (r = t.getAttribute("data-view-id")) && (a = i.hookups[r]) && (a(t, n, r), delete i.hookups[r], t.removeAttribute("data-view-id")); }), e;
                },
                hookups: {},
                hook: function(t) { return i.hookups[++r] = t, " data-view-id='" + r + "'"; },
                cached: {},
                cachedRenderers: {},
                cache: !0,
                register: function(t) { this.types["." + t.suffix] = t; },
                types: {},
                ext: ".ejs",
                registerScript: function() {},
                preload: function() {},
                render: function(r, a, c, l) {
                    e(c) && (l = c, c = undefined);
                    var h, f, p, d, g, m = o(a);
                    if (m.length)
                        return f = new t.Deferred, p = t.extend({}, a), m.push(s(r, !0)), t.when.apply(t, m).then(function(e) {
                            var r, i = n(arguments), s = i.pop();
                            if (t.isDeferred(a))p = u(e);
                            else for (var o in a)t.isDeferred(a[o]) && (p[o] = u(i.shift()));
                            r = s(p, c), f.resolve(r, p), l && l(r, p);
                        }, function() { f.reject.apply(f, arguments); }), f;
                    if (t.__reading && (h = t.__reading, t.__reading = null), d = e(l), f = s(r, d), t.Map && h && (t.__reading = h), d)g = f, f.then(function(t) { l(a ? t(a, c) : t); });
                    else {
                        if ("resolved" === f.state() && f.__view_id) {
                            var _ = i.cachedRenderers[f.__view_id];
                            return a ? _(a, c) : _;
                        }
                        f.then(function(t) { g = a ? t(a, c) : t; });
                    }
                    return g;
                },
                registerView: function(e, n, r, a) {
                    var s = (r || i.types[i.ext]).renderer(e, n);
                    return a = a || new t.Deferred, i.cache && (i.cached[e] = a, a.__view_id = e, i.cachedRenderers[e] = s), a.resolve(s);
                }
            });
            var a = function(t, e) { if (!t.length)throw"can.view: No template or empty template:" + e; },
                s = function(e, n) {
                    var r, s, o, u = "string" == typeof e ? e : e.url, c = e.engine || u.match(/\.[\w\d]+$/);
                    if (u.match(/^#/) && (u = u.substr(1)), (s = document.getElementById(u)) && (c = "." + s.type.match(/\/(x\-)?(.+)/)[2]), c || i.cached[u] || (u += c = i.ext), t.isArray(c) && (c = c[0]), o = i.toId(u), u.match(/^\/\//) && (u = u.substr(2), u = window.steal ? steal.config().root.mapJoin("" + steal.id(u)) : u), window.require && require.toUrl && (u = require.toUrl(u)), r = i.types[c], i.cached[o])return i.cached[o];
                    if (s)return i.registerView(o, s.innerHTML, r);
                    var l = new t.Deferred;
                    return t.ajax({ async: n, url: u, dataType: "text", error: function(t) { a("", u), l.reject(t); }, success: function(t) { a(t, u), i.registerView(o, t, r, l); } }), l;
                },
                o = function(e) {
                    var n = [];
                    if (t.isDeferred(e))return[e];
                    for (var r in e)t.isDeferred(e[r]) && n.push(e[r]);
                    return n;
                },
                u = function(e) { return t.isArray(e) && "success" === e[1] ? e[0] : e; };
            return t.extend(i, {
                register: function(t) {
                    this.types["." + t.suffix] = t, i[t.suffix] = function(e, n) {
                        if (!n) {
                            var r = function() { return i.frag(r.render.apply(this, arguments)); };
                            return r.render = function() {
                                var n = t.renderer(null, e);
                                return n.apply(n, arguments);
                            }, r;
                        }
                        return i.preload(e, t.renderer(e, n));
                    };
                },
                registerScript: function(t, e, n) { return"can.view.preload('" + e + "'," + i.types["." + t].script(e, n) + ");"; },
                preload: function(e, n) {

                    function r() { return i.frag(n.apply(this, arguments)); }

                    var a = i.cached[e] = (new t.Deferred).resolve(function(t, e) { return n.call(t, t, e); });
                    return r.render = n, a.__view_id = e, i.cachedRenderers[e] = n, r;
                }
            }), t;
        }(__m2),
        __m18 = function(t) {
            var e = /(\\)?\./g,
                n = /\\\./g,
                r = function(t) {
                    var r = [], i = 0;
                    return t.replace(e, function(e, a, s) { a || (r.push(t.slice(i, s).replace(n, ".")), i = s + e.length); }), r.push(t.slice(i).replace(n, ".")), r;
                },
                i = t.Construct.extend({ read: t.compute.read }, {
                    init: function(t, e) { this._context = t, this._parent = e; },
                    attr: function(e) {
                        var n = t.__clearReading && t.__clearReading(), r = this.read(e, { isArgument: !0, returnObserveMethods: !0, proxyMethods: !1 }).value;
                        return t.__setReading && t.__setReading(n), r;
                    },
                    add: function(t) { return t !== this._context ? new this.constructor(t, this) : this; },
                    computeData: function(e, n) {
                        n = n || { args: [] };
                        var r,
                            a,
                            s = this,
                            o = {
                                compute: t.compute(function(t) {
                                    if (!arguments.length) {
                                        if (r)return i.read(r, a, n).value;
                                        var u = s.read(e, n);
                                        return r = u.rootObserve, a = u.reads, o.scope = u.scope, o.initialValue = u.value, u.value;
                                    }
                                    if (r.isComputed && !a.length)r(t);
                                    else {
                                        var c = a.length - 1;
                                        i.read(r, a.slice(0, c)).value.attr(a[c], t);
                                    }
                                })
                            };
                        return o;
                    },
                    read: function(e, n) {
                        if ("../" === e.substr(0, 3))return this._parent.read(e.substr(3), n);
                        if (".." === e)return{ value: this._parent._context };
                        if ("." === e || "this" === e)return{ value: this._context };
                        for (var a, s, o, u, c, l, h = -1 === e.indexOf("\\.") ? e.split(".") : r(e), f = this, p = [], d = -1; f;) {
                            if (a = f._context, null !== a) {
                                var g = i.read(a, h, t.simpleExtend({ foundObservable: function(t, e) { c = t, l = h.slice(e); }, earlyExit: function(e, n) { n > d && (s = c, p = l, d = n, u = f, o = t.__clearReading && t.__clearReading()); } }, n));
                                if (g.value !== undefined)return{ scope: f, rootObserve: c, value: g.value, reads: l };
                            }
                            t.__clearReading && t.__clearReading(), f = f._parent;
                        }
                        return s ? (t.__setReading && t.__setReading(o), { scope: u, rootObserve: s, reads: p, value: undefined }) : { names: h, value: undefined };
                    }
                });
            return t.view.Scope = i, i;
        }(__m2, __m9, __m12, __m15, __m19, __m16),
        __m21 = function(t) {
            var e = {
                tagToContentPropMap: { option: "textContent" in document.createElement("option") ? "textContent" : "innerText", textarea: "value" },
                attrMap: { "class": "className", value: "value", innerText: "innerText", textContent: "textContent", checked: !0, disabled: !0, readonly: !0, required: !0, src: function(t, e) { null === e || "" === e ? t.removeAttribute("src") : t.setAttribute("src", e); } },
                attrReg: /([^\s=]+)[\s]*=[\s]*/,
                defaultValue: ["input", "textarea"],
                tagMap: { "": "span", table: "tbody", tr: "td", ol: "li", ul: "li", tbody: "tr", thead: "tr", tfoot: "tr", select: "option", optgroup: "option" },
                reverseTagMap: { tr: "tbody", option: "select", td: "tr", th: "tr", li: "ul" },
                getParentNode: function(t, e) { return e && 11 === t.parentNode.nodeType ? e : t.parentNode; },
                setAttr: function(n, r, i) {
                    var a = ("" + n.nodeName).toLowerCase(), s = e.attrMap[r];
                    "function" == typeof s ? s(n, i) : s === !0 && "checked" === r && "radio" === n.type ? (t.inArray(a, e.defaultValue) >= 0 && (n.defaultChecked = !0), n[r] = !0) : s === !0 ? n[r] = !0 : s ? (n[s] = i, "value" === s && t.inArray(a, e.defaultValue) >= 0 && (n.defaultValue = i)) : n.setAttribute(r, i);
                },
                getAttr: function(t, n) { return(e.attrMap[n] && t[e.attrMap[n]] ? t[e.attrMap[n]] : t.getAttribute(n)) || ""; },
                removeAttr: function(t, n) {
                    var r = e.attrMap[n];
                    r === !0 ? t[n] = !1 : "string" == typeof r ? t[r] = "" : t.removeAttribute(n);
                },
                contentText: function(t) { return"string" == typeof t ? t : t || 0 === t ? "" + t : ""; },
                after: function(e, n) {
                    var r = e[e.length - 1];
                    r.nextSibling ? t.insertBefore(r.parentNode, n, r.nextSibling) : t.appendChild(r.parentNode, n);
                },
                replace: function(n, r) { e.after(n, r), t.remove(t.$(n)); }
            };
            return function() {
                var t = document.createElement("div");
                t.setAttribute("style", "width: 5px"), t.setAttribute("style", "width: 10px"), e.attrMap.style = function(t, e) { t.style.cssText = e || ""; };
            }(), e;
        }(__m2),
        __m20 = function(can, elements) {
            var newLine = /(\r|\n)+/g,
                clean = function(t) { return t.split("\\").join("\\\\").split("\n").join("\\n").split('"').join('\\"').split("	").join("\\t"); },
                getTag = function(t, e, n) {
                    if (t)return t;
                    for (; e.length > n;) {
                        if ("<" === e[n] && elements.reverseTagMap[e[n + 1]])return elements.reverseTagMap[e[n + 1]];
                        n++;
                    }
                    return"";
                },
                bracketNum = function(t) { return t.split("{").length - t.split("}").length; },
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
                automaticCustomElementCharacters = /[-\:]/,
                Scanner;
            return can.view.Scanner = Scanner = function(t) {
                can.extend(this, { text: {}, tokens: [] }, t), this.text.options = this.text.options || "", this.tokenReg = [], this.tokenSimple = { "<": "<", ">": ">", '"': '"', "'": "'" }, this.tokenComplex = [], this.tokenMap = {};
                for (var e, n = 0; e = this.tokens[n]; n++)e[2] ? (this.tokenReg.push(e[2]), this.tokenComplex.push({ abbr: e[1], re: RegExp(e[2]), rescan: e[3] })) : (this.tokenReg.push(e[1]), this.tokenSimple[e[1]] = e[0]), this.tokenMap[e[0]] = e[1];
                this.tokenReg = RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")", "g");
            }, Scanner.attributes = {}, Scanner.regExpAttributes = {}, Scanner.attribute = function(t, e) { "string" == typeof t ? Scanner.attributes[t] = e : Scanner.regExpAttributes[t] = { match: t, callback: e }; }, Scanner.hookupAttributes = function(t, e) { can.each(t && t.attrs || [], function(n) { t.attr = n, Scanner.attributes[n] ? Scanner.attributes[n](t, e) : can.each(Scanner.regExpAttributes, function(r) { r.match.test(n) && r.callback(t, e); }); }); }, Scanner.tag = function(t, e) { window.html5 && (window.html5.elements += " " + t, window.html5.shivDocument()), Scanner.tags[t.toLowerCase()] = e; }, Scanner.tags = {}, Scanner.hookupTag = function(t) {
                var e = can.view.getHooks();
                return can.view.hook(function(n) {
                    can.each(e, function(t) { t(n); });
                    var r = t.tagName, i = t.options.read("helpers._tags." + r, { isArgument: !0, proxyMethods: !1 }).value, a = i || Scanner.tags[r], s = t.scope, o = a ? a(n, t) : s;
                    if (o && t.subtemplate) {
                        s !== o && (s = s.add(o));
                        var u = can.view.frag(t.subtemplate(s, t.options));
                        can.appendChild(n, u);
                    }
                    can.view.Scanner.hookupAttributes(t, n);
                });
            }, Scanner.prototype = {
                helpers: [],
                scan: function(t, e) {
                    var n, r = [], i = 0, a = this.tokenSimple, s = this.tokenComplex;
                    t = t.replace(newLine, "\n"), this.transform && (t = this.transform(t)), t.replace(this.tokenReg, function(e, n) {
                        var o = arguments[arguments.length - 2];
                        if (o > i && r.push(t.substring(i, o)), a[e])r.push(e);
                        else
                            for (var u, c = 0; u = s[c]; c++)
                                if (u.re.test(e)) {
                                    r.push(u.abbr), u.rescan && r.push(u.rescan(n));
                                    break;
                                }
                        i = o + n.length;
                    }), t.length > i && r.push(t.substr(i));
                    var o, u, c, l, h = "", f = [startTxt + (this.text.start || "")], p = function(t, e) { f.push(put_cmd, '"', clean(t), '"' + (e || "") + ");"); }, d = [], g = null, m = !1, _ = { attributeHookups: [], tagHookups: [], lastTagHookup: "" }, v = function() { _.lastTagHookup = _.tagHookups.pop() + _.tagHookups.length; }, b = "", y = [], w = !1, x = !1, k = 0, A = this.tokenMap;
                    for (htmlTag = quote = beforeQuote = null; (c = r[k++]) !== undefined;) {
                        if (null === g)
                            switch (c) {
                            case A.left:
                            case A.escapeLeft:
                            case A.returnLeft:
                                m = htmlTag && 1;
                            case A.commentLeft:
                                g = c, h.length && p(h), h = "";
                                break;
                            case A.escapeFull:
                                m = htmlTag && 1, rescan = 1, g = A.escapeLeft, h.length && p(h), rescan = r[k++], h = rescan.content || rescan, rescan.before && p(rescan.before), r.splice(k, 0, A.right);
                                break;
                            case A.commentFull:
                                break;
                            case A.templateLeft:
                                h += A.left;
                                break;
                            case"<":
                                0 !== r[k].indexOf("!--") && (htmlTag = 1, m = 0), h += c;
                                break;
                            case">":
                                htmlTag = 0;
                                var M = "/" === h.substr(h.length - 1) || "--" === h.substr(h.length - 2), N = "";
                                if (_.attributeHookups.length && (N = "attrs: ['" + _.attributeHookups.join("','") + "'], ", _.attributeHookups = []), b + _.tagHookups.length !== _.lastTagHookup && b === top(_.tagHookups))M && (h = h.substr(0, h.length - 1)), f.push(put_cmd, '"', clean(h), '"', ",can.view.Scanner.hookupTag({tagName:'" + b + "'," + N + "scope: " + (this.text.scope || "this") + this.text.options), M ? (f.push("}));"), h = "/>", v()) : "<" === r[k] && r[k + 1] === "/" + b ? (f.push("}));"), h = c, v()) : (f.push(",subtemplate: function(" + this.text.argNames + "){\n" + startTxt + (this.text.start || "")), h = "");
                                else if (m || !w && elements.tagToContentPropMap[y[y.length - 1]] || N) {
                                    var C = ",can.view.pending({" + N + "scope: " + (this.text.scope || "this") + this.text.options + '}),"';
                                    M ? p(h.substr(0, h.length - 1), C + '/>"') : p(h, C + '>"'), h = "", m = 0;
                                } else h += c;
                                (M || w) && (y.pop(), b = y[y.length - 1], w = !1), _.attributeHookups = [];
                                break;
                            case"'":
                            case'"':
                                if (htmlTag)
                                    if (quote && quote === c) {
                                        quote = null;
                                        var T = getAttrName();
                                        if (Scanner.attributes[T] ? _.attributeHookups.push(T) : can.each(Scanner.regExpAttributes, function(t) { t.match.test(T) && _.attributeHookups.push(T); }), x) {
                                            h += c, p(h), f.push(finishTxt, "}));\n"), h = "", x = !1;
                                            break;
                                        }
                                    } else if (null === quote && (quote = c, beforeQuote = o, l = getAttrName(), "img" === b && "src" === l || "style" === l)) {
                                        p(h.replace(attrReg, "")), h = "", x = !0, f.push(insert_cmd, "can.view.txt(2,'" + getTag(b, r, k) + "'," + status() + ",this,function(){", startTxt), p(l + "=" + c);
                                        break;
                                    }
                            default:
                                if ("<" === o) {
                                    b = "!--" === c.substr(0, 3) ? "!--" : c.split(/\s/)[0];
                                    var j = !1;
                                    0 === b.indexOf("/") && (j = !0, n = b.substr(1)), j ? (top(y) === n && (b = n, w = !0), top(_.tagHookups) === n && (p(h.substr(0, h.length - 1)), f.push(finishTxt + "}}) );"), h = "><", v())) : (b.lastIndexOf("/") === b.length - 1 && (b = b.substr(0, b.length - 1)), "!--" !== b && (Scanner.tags[b] || automaticCustomElementCharacters.test(b)) && ("content" === b && elements.tagMap[top(y)] && (c = c.replace("content", elements.tagMap[top(y)])), _.tagHookups.push(b)), y.push(b));
                                }
                                h += c;
                            }
                        else
                            switch (c) {
                            case A.right:
                            case A.returnRight:
                                switch (g) {
                                case A.left:
                                    u = bracketNum(h), 1 === u ? (f.push(insert_cmd, "can.view.txt(0,'" + getTag(b, r, k) + "'," + status() + ",this,function(){", startTxt, h), d.push({ before: "", after: finishTxt + "}));\n" })) : (i = d.length && -1 === u ? d.pop() : { after: ";" }, i.before && f.push(i.before), f.push(h, ";", i.after));
                                    break;
                                case A.escapeLeft:
                                case A.returnLeft:
                                    u = bracketNum(h), u && d.push({ before: finishTxt, after: "}));\n" });
                                    for (var O = g === A.escapeLeft ? 1 : 0, L = { insert: insert_cmd, tagName: getTag(b, r, k), status: status(), specialAttribute: x }, E = 0; this.helpers.length > E; E++) {
                                        var S = this.helpers[E];
                                        if (S.name.test(h)) {
                                            h = S.fn(h, L), S.name.source === /^>[\s]*\w*/.source && (O = 0);
                                            break;
                                        }
                                    }
                                    "object" == typeof h ? h.raw && f.push(h.raw) : x ? f.push(insert_cmd, h, ");") : f.push(insert_cmd, "can.view.txt(\n" + ("string" == typeof status() || O) + ",\n'" + b + "',\n" + status() + ",\n" + "this,\nfunction(){ " + (this.text.escape || "") + "return ", h, u ? startTxt : "}));\n"), rescan && rescan.after && rescan.after.length && (p(rescan.after.length), rescan = null);
                                }
                                g = null, h = "";
                                break;
                            case A.templateLeft:
                                h += A.left;
                                break;
                            default:
                                h += c;
                            }
                        o = c;
                    }
                    h.length && p(h), f.push(";");
                    var R = f.join(""), D = { out: (this.text.outStart || "") + R + " " + finishTxt + (this.text.outEnd || "") };
                    return myEval.call(D, "this.fn = (function(" + this.text.argNames + "){" + D.out + "});\r\n//# sourceURL=" + e + ".js"), D;
                }
            }, can.view.Scanner.tag("content", function(t, e) { return e.scope; }), Scanner;
        }(__m19, __m21),
        __m24 = function(t) {
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
                o = function(t) {
                    if (e || 3 !== t.nodeType)return t[a] ? t[a] : (++s, t[a] = (t.nodeName ? "element_" : "obj_") + s);
                    for (var n in i)if (i[n] === t)return n;
                    return++s, i["text_" + s] = t, "text_" + s;
                },
                u = [].splice,
                c = {
                    id: o,
                    update: function(e, n) {
                        t.each(e.childNodeLists, function(t) { c.unregister(t); }), e.childNodeLists = [], t.each(e, function(t) { delete r[o(t)]; }), n = t.makeArray(n), t.each(n, function(t) { r[o(t)] = e; });
                        var i = e.length, a = e[0];
                        u.apply(e, [0, i].concat(n));
                        for (var s = e; s = s.parentNodeList;)u.apply(s, [t.inArray(a, s), i].concat(n));
                    },
                    register: function(t, e, n) {
                        if (t.unregistered = e, t.childNodeLists = [], !n) {
                            if (t.length > 1)throw"does not work";
                            var i = o(t[0]);
                            n = r[i];
                        }
                        return t.parentNodeList = n, n && n.childNodeLists.push(t), t;
                    },
                    unregister: function(e) {
                        e.isUnregistered || (e.isUnregistered = !0, delete e.parentNodeList, t.each(e, function(t) {
                            var e = o(t);
                            delete r[e];
                        }), e.unregistered && e.unregistered(), t.each(e.childNodeLists, function(t) { c.unregister(t); }));
                    },
                    nodeMap: r
                };
            return c;
        }(__m2, __m21),
        __m23 = function(t, e, n, r) {
            var i = function(e, n, r) {
                    var i = !1, a = function() { return i || (i = !0, r(s), t.unbind.call(e, "removed", a)), !0; }, s = { teardownCheck: function(t) { return t ? !1 : a(); } };
                    return t.bind.call(e, "removed", a), n(s), s;
                },
                a = function(t, e, n) { return i(t, function() { e.bind("change", n); }, function(t) { e.unbind("change", n), t.nodeList && r.unregister(t.nodeList); }); },
                s = function(t) { return(t || "").replace(/['"]/g, "").split("="); },
                o = [].splice,
                u = {
                    list: function(n, a, s, c, l) {
                        var h,
                            f = [n],
                            p = [],
                            d = [],
                            g = function(n, i, a) {
                                var u = document.createDocumentFragment(), l = [], h = [];
                                if (t.each(i, function(e, n) {
                                    var i = t.compute(n + a), o = s.call(c, e, i), p = t.view.fragment(o);
                                    l.push(r.register(t.makeArray(p.childNodes), undefined, f)), u.appendChild(t.view.hookup(p)), h.push(i);
                                }), p[a]) {
                                    var g = p[a][0];
                                    t.insertBefore(g.parentNode, u, g);
                                } else e.after(0 === a ? [_] : p[a - 1], u);
                                o.apply(p, [a, 0].concat(l)), o.apply(d, [a, 0].concat(h));
                                for (var m = a + h.length, v = d.length; v > m; m++)d[m](m);
                            },
                            m = function(e, n, i, a) {
                                if (a || !y.teardownCheck(_.parentNode)) {
                                    var s = p.splice(i, n.length), o = [];
                                    t.each(s, function(t) { [].push.apply(o, t), r.update(t, []), r.unregister(t); }), d.splice(i, n.length);
                                    for (var u = i, c = d.length; c > u; u++)d[u](u);
                                    t.remove(t.$(o));
                                }
                            },
                            _ = document.createTextNode(""),
                            v = function() { h && h.unbind && h.unbind("add", g).unbind("remove", m), m({}, { length: p.length }, 0, !0); },
                            b = function(t, e) { v(), h = e || [], h.bind && h.bind("add", g).bind("remove", m), g({}, h, 0); };
                        l = e.getParentNode(n, l);
                        var y = i(l, function() { t.isFunction(a) && a.bind("change", b); }, function() { t.isFunction(a) && a.unbind("change", b), v(); });
                        u.replace(f, _, y.teardownCheck), b({}, t.isFunction(a) ? a() : a);
                    },
                    html: function(n, i, s) {
                        var o;
                        s = e.getParentNode(n, s), o = a(s, i, function(t, e) {
                            var n = u[0].parentNode;
                            n && c(e), o.teardownCheck(u[0].parentNode);
                        });
                        var u = [n],
                            c = function(n) {
                                var i = t.view.fragment("" + n), a = t.makeArray(u);
                                r.update(u, i.childNodes), i = t.view.hookup(i, s), e.replace(a, i);
                            };
                        o.nodeList = u, r.register(u, o.teardownCheck), c(i());
                    },
                    replace: function(n, i, a) {
                        var s, o = n.slice(0);
                        return r.register(n, a), "string" == typeof i ? s = t.view.fragment(i) : 11 !== i.nodeType ? (s = document.createDocumentFragment(), s.appendChild(i)) : s = i, r.update(n, s.childNodes), "string" == typeof i && (s = t.view.hookup(s, n[0].parentNode)), e.replace(o, s), n;
                    },
                    text: function(t, n, r) {
                        var i = e.getParentNode(t, r), s = a(i, n, function(t, e) { "unknown" != typeof o.nodeValue && (o.nodeValue = "" + e), s.teardownCheck(o.parentNode); }), o = document.createTextNode(n());
                        s.nodeList = u.replace([t], o, s.teardownCheck);
                    },
                    attributes: function(t, n, r) {
                        var i = function(n) {
                            var r = s(n), i = r.shift();
                            i !== o && o && e.removeAttr(t, o), i && (e.setAttr(t, i, r.join("=")), o = i);
                        };
                        if (a(t, n, function(t, e) { i(e); }), arguments.length >= 3)var o = s(r)[0];
                        else i(n());
                    },
                    attributePlaceholder: "__!!__",
                    attributeReplace: /__!!__/g,
                    attribute: function(n, r, i) {
                        a(n, i, function() { e.setAttr(n, r, c.render()); });
                        var s, o = t.$(n);
                        s = t.data(o, "hooks"), s || t.data(o, "hooks", s = {});
                        var c, l = e.getAttr(n, r), h = l.split(u.attributePlaceholder), f = [];
                        f.push(h.shift(), h.join(u.attributePlaceholder)), s[r] ? s[r].computes.push(i) : s[r] = {
                            render: function() {
                                var t = 0, n = l ? l.replace(u.attributeReplace, function() { return e.contentText(c.computes[t++]()); }) : e.contentText(c.computes[t++]());
                                return n;
                            },
                            computes: [i],
                            batchNum: undefined
                        }, c = s[r], f.splice(1, 0, i()), e.setAttr(n, r, f.join(""));
                    },
                    specialAttribute: function(t, n, r) { a(t, r, function(r, i) { e.setAttr(t, n, l(i)); }), e.setAttr(t, n, l(r())); }
                },
                c = /(\r|\n)+/g,
                l = function(t) {
                    var n = /^["'].*["']$/;
                    return t = t.replace(e.attrReg, "").replace(c, ""), n.test(t) ? t.substr(1, t.length - 2) : t;
                };
            return t.view.live = u, t.view.nodeLists = r, t.view.elements = e, u;
        }(__m2, __m21, __m19, __m24),
        __m22 = function(t, e, n) {
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
                pending: function(e) {
                    var n = t.view.getHooks();
                    return t.view.hook(function(r) { t.each(n, function(t) { t(r); }), t.view.Scanner.hookupAttributes(e, r); });
                },
                getHooks: function() {
                    var t = i.slice(0);
                    return r = t, i = [], t;
                },
                onlytxt: function(t, e) { return o(e.call(t)); },
                txt: function(l, h, f, p, d) {
                    var g, m, _, v, b, y = e.tagMap[h] || "span", w = !1;
                    if (u)m = d.call(p);
                    else {
                        ("string" == typeof f || 1 === f) && (u = !0);
                        var x = t.view.setupLists();
                        _ = function() { g.unbind("change", c); }, g = t.compute(d, p, !1), g.bind("change", c), v = x(), m = g(), u = !1, w = g.hasDependencies;
                    }
                    if (v)return _ && _(), "<" + y + t.view.hook(function(t, e) { n.list(t, v.list, v.renderer, p, e); }) + "></" + y + ">";
                    if (!w || "function" == typeof m)return _ && _(), (u || 2 === l || !l ? s : o)(m, 0 === f && y);
                    var k = e.tagToContentPropMap[h];
                    return 0 !== f || k ? 1 === f ? (i.push(function(t) { n.attributes(t, g, g()), _(); }), g()) : 2 === l ? (b = f, i.push(function(t) { n.specialAttribute(t, b, g), _(); }), g()) : (b = 0 === f ? k : f, (0 === f ? r : i).push(function(t) { n.attribute(t, b, g), _(); }), n.attributePlaceholder) : "<" + y + t.view.hook(l && "object" != typeof m ? function(t, e) { n.text(t, g, e), _(); } : function(t, e) { n.html(t, g, e), _(); }) + ">" + a(y) + "</" + y + ">";
                }
            }), t;
        }(__m19, __m21, __m23, __m10),
        __m17 = function(t) {
            t.view.ext = ".mustache";
            var e = "scope",
                n = "___h4sh",
                r = "{scope:" + e + ",options:options}",
                i = e + ",options",
                a = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,
                s = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,
                o = function(t) { return'{get:"' + t.replace(/"/g, '\\"') + '"}'; },
                u = function(t) { return t && "string" == typeof t.get; },
                c = function(e) { return e instanceof t.Map || e && !!e._get; },
                l = function(t) { return t && t.splice && "number" == typeof t.length; },
                h = function(e, n, r) { return function(i, a) { return i === undefined || i instanceof t.view.Scope || (i = n.add(i)), a === undefined || a instanceof g || (a = r.add(a)), e(i, a || r); }; },
                f = function(e) {
                    if (this.constructor !== f) {
                        var n = new f(e);
                        return function(t, e) { return n.render(t, e); };
                    }
                    return"function" == typeof e ? (this.template = { fn: e }, undefined) : (t.extend(this, e), this.template = this.scanner.scan(this.text, this.name), undefined);
                };
            t.Mustache = window.Mustache = f, f.prototype.render = function(e, n) { return e instanceof t.view.Scope || (e = new t.view.Scope(e || {})), n instanceof g || (n = new g(n || {})), n = n || {}, this.template.fn.call(e, e, n); }, t.extend(f.prototype, {
                scanner: new t.view.Scanner({
                    text: { start: "", scope: e, options: ",options: options", argNames: i },
                    tokens: [["returnLeft", "{{{", "{{[{&]"], ["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"], ["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"], ["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function(t) { return{ before: /^\n.+?\n$/.test(t) ? "\n" : "", content: t.match(/\{\{(.+?)\}\}/)[1] || "" }; }], ["escapeLeft", "{{"], ["returnRight", "}}}"], ["right", "}}"]],
                    helpers: [
                        {
                            name: /^>[\s]*\w*/,
                            fn: function(e) {
                                var n = t.trim(e.replace(/^>\s?/, "")).replace(/["|']/g, "");
                                return"can.Mustache.renderPartial('" + n + "'," + i + ")";
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
                            fn: function(e, u) {
                                var c = !1, l = [];
                                if (e = t.trim(e), e.length && (c = e.match(/^([#^/]|else$)/))) {
                                    switch (c = c[0]) {
                                    case"#":
                                    case"^":
                                        u.specialAttribute ? l.push(u.insert + "can.view.onlytxt(this,function(){ return ") : l.push(u.insert + "can.view.txt(0,'" + u.tagName + "'," + u.status + ",this,function(){ return ");
                                        break;
                                    case"/":
                                        return{ raw: 'return ___v1ew.join("");}}])}));' };
                                    }
                                    e = e.substring(1);
                                }
                                if ("else" !== c) {
                                    var h, f = [], p = 0;
                                    l.push("can.Mustache.txt(\n" + r + ",\n" + (c ? '"' + c + '"' : "null") + ",");
                                    var d = [];
                                    (t.trim(e) + " ").replace(a, function(t, e) { p && (h = e.match(s)) ? h[2] ? f.push(h[0]) : d.push(h[4] + ":" + (h[6] ? h[6] : o(h[5]))) : f.push(o(e)), p++; }), l.push(f.join(",")), d.length && l.push(",{" + n + ":{" + d.join(",") + "}}");
                                }
                                switch (c && "else" !== c && l.push(",[\n\n"), c) {
                                case"#":
                                    l.push("{fn:function(" + i + "){var ___v1ew = [];");
                                    break;
                                case"else":
                                    l.push('return ___v1ew.join("");}},\n{inverse:function(' + i + "){\nvar ___v1ew = [];");
                                    break;
                                case"^":
                                    l.push("{inverse:function(" + i + "){\nvar ___v1ew = [];");
                                    break;
                                default:
                                    l.push(")");
                                }
                                return l = l.join(""), c ? { raw: l } : l;
                            }
                        }
                    ]
                })
            });
            for (var p = t.view.Scanner.prototype.helpers, d = 0; p.length > d; d++)f.prototype.scanner.helpers.unshift(p[d]);
            f.txt = function(e, r, i) {
                for (var a, s, o, p, d, g = e.scope, m = e.options, _ = [], v = { fn: function() {}, inverse: function() {} }, b = g.attr("."), y = !0, w = !0, x = [], k = 3; arguments.length > k; k++)
                    if (d = arguments[k], r && t.isArray(d))v = t.extend.apply(t, [v].concat(d));
                    else if (d && d[n]) {
                        a = d[n];
                        for (var A in a)u(a[A]) && (a[A] = f.get(a[A].get, e));
                    } else d && u(d) ? _.push(f.get(d.get, e, !1, !0)) : _.push(d);
                if (u(i)) {
                    var M = i.get;
                    i = f.get(i.get, e, _.length, !1), y = M === i;
                }
                if (v.fn = h(v.fn, g, m), v.inverse = h(v.inverse, g, m), o = y && "string" == typeof i && f.getHelper(i, m) || t.isFunction(i) && !i.isComputed && { fn: i })return t.extend(v, { context: b, scope: g, contexts: g, hash: a }), _.push(v), o.fn.apply(b, _) || "";
                if (t.isFunction(i) && i.isComputed && (i = i()), s = _.length ? _ : [i], r)for (k = 0; s.length > k; k++)d = s[k], p = d !== undefined && c(d), l(d) ? "#" === r ? w = w && !!(p ? d.attr("length") : d.length) : "^" === r && (w = w && !(p ? d.attr("length") : d.length)) : w = "#" === r ? w && !!d : "^" === r ? w && !d : w;
                if (w)
                    switch (r) {
                    case"#":
                        if (l(i)) {
                            var N = c(i);
                            for (k = 0; i.length > k; k++)x.push(v.fn(i[k])), N && i.attr("" + k);
                            return x.join("");
                        }
                        return v.fn(i || {}) || "";
                    case"^":
                        return v.inverse(i || {}) || "";
                    default:
                        return"" + (null != i ? i : "");
                    }
                return"";
            }, f.get = function(e, n, r, i) {
                var a = n.scope.attr("."), s = n.options || {};
                if (r) {
                    if (f.getHelper(e, s))return e;
                    if (n.scope && t.isFunction(a[e]))return a[e];
                }
                var o = n.scope.computeData(e, { isArgument: i, args: [a, n.scope] }), u = o.compute;
                t.compute.temporarilyBind(u);
                var c = o.initialValue;
                return c !== undefined && o.scope === n.scope || !f.getHelper(e, s) ? u.hasDependencies ? u : c : e;
            }, f.resolve = function(e) { return c(e) && l(e) && e.attr("length") ? e : t.isFunction(e) ? e() : e; };
            var g = t.view.Scope.extend({ init: function(e) { e.helpers || e.partials || (e = { helpers: e }), t.view.Scope.prototype.init.apply(this, arguments); } });
            return f._helpers = {}, f.registerHelper = function(t, e) { this._helpers[t] = { name: t, fn: e }; }, f.getHelper = function(t, e) {
                var n = e.attr("helpers." + t);
                return n ? { fn: n } : this._helpers[t];
            }, f.render = function(e, n) {
                if (!t.view.cached[e]) {
                    var r = t.__clearReading && t.__clearReading();
                    n.attr("partial") && (e = n.attr("partial")), t.__setReading && t.__setReading(r);
                }
                return t.view.render(e, n);
            }, f.safeString = function(t) { return{ toString: function() { return t; } }; }, f.renderPartial = function(e, n, r) {
                var i = r.attr("partials." + e);
                return i ? i.render ? i.render(n, r) : i(n, r) : t.Mustache.render(e, n, r);
            }, t.each({
                "if": function(e, n) {
                    var r;
                    return r = t.isFunction(e) ? t.compute.truthy(e)() : !!f.resolve(e), r ? n.fn(n.contexts || this) : n.inverse(n.contexts || this);
                },
                unless: function(t, e) { return f.resolve(t) ? undefined : e.fn(e.contexts || this); },
                each: function(e, n) {
                    var r, i, a, s = [], o = f.resolve(e);
                    if (t.view.lists && (o instanceof t.List || e && e.isComputed && o === undefined))return t.view.lists(e, function(t, e) { return n.fn(n.scope.add({ "@index": e }).add(t)); });
                    if (e = o, e && l(e)) {
                        for (a = 0; e.length > a; a++) {
                            var u = function() { return a; };
                            s.push(n.fn(n.scope.add({ "@index": u }).add(e[a])));
                        }
                        return s.join("");
                    }
                    if (c(e)) {
                        for (r = t.Map.keys(e), a = 0; r.length > a; a++)i = r[a], s.push(n.fn(n.scope.add({ "@key": i }).add(e[i])));
                        return s.join("");
                    }
                    if (e instanceof Object) {
                        for (i in e)s.push(n.fn(n.scope.add({ "@key": i }).add(e[i])));
                        return s.join("");
                    }
                },
                "with": function(t, e) {
                    var n = t;
                    return t = f.resolve(t), t ? e.fn(n) : undefined;
                },
                log: function(t, e) { console !== undefined && (e ? console.log(t, e.context) : console.log(t.context)); }
            }, function(t, e) { f.registerHelper(e, t); }), t.view.register({ suffix: "mustache", contentType: "x-mustache-template", script: function(t, e) { return"can.Mustache(function(" + i + ") { " + new f({ text: e, name: t }).template.out + " })"; }, renderer: function(t, e) { return f({ text: e, name: t }); } }), t;
        }(__m2, __m18, __m19, __m20, __m16, __m22),
        __m25 = function(t) {
            var e = function(t, e) { return t.hasAttribute ? t.hasAttribute(e) : null !== t.getAttribute(e); };
            t.view.Scanner.attribute("can-value", function(n, a) {
                var s = a.getAttribute("can-value"), o = n.scope.computeData(s, { args: [] }).compute;
                if ("input" === a.nodeName.toLowerCase()) {
                    var u, c;
                    if ("checkbox" === a.type && (u = e(a, "can-true-value") ? n.scope.compute(a.getAttribute("can-true-value")) : t.compute(!0), c = e(a, "can-false-value") ? n.scope.compute(a.getAttribute("can-false-value")) : t.compute(!1)), "checkbox" === a.type || "radio" === a.type)return new i(a, { value: o, trueValue: u, falseValue: c }), undefined;
                }
                new r(a, { value: o });
            });
            var n = { enter: function(t, e, n) { return{ event: "keyup", handler: function(t) { return 13 === t.keyCode ? n.call(this, t) : undefined; } }; } };
            t.view.Scanner.attribute(/can-[\w\.]+/, function(e, r) {
                var i = e.attr,
                    a = e.attr.substr("can-".length),
                    s = function(n) {
                        var a = r.getAttribute(i), s = e.scope.read(a, { returnObserveMethods: !0, isArgument: !0 });
                        return s.value.call(s.parent, e.scope._context, t.$(this), n);
                    };
                if (n[a]) {
                    var o = n[a](e, r, s);
                    s = o.handler, a = o.event;
                }
                t.bind.call(r, a, s);
            });
            var r = t.Control.extend({
                    init: function() { "SELECT" === this.element[0].nodeName.toUpperCase() ? setTimeout(t.proxy(this.set, this), 1) : this.set(); },
                    "{value} change": "set",
                    set: function() {
                        if (this.element) {
                            var t = this.options.value();
                            this.element[0].value = t === undefined ? "" : t;
                        }
                    },
                    change: function() { this.element && this.options.value(this.element[0].value); }
                }),
                i = t.Control.extend({
                    init: function() { this.isCheckebox = "checkbox" === this.element[0].type.toLowerCase(), this.check(); },
                    "{value} change": "check",
                    "{trueValue} change": "check",
                    "{falseValue} change": "check",
                    check: function() {
                        if (this.isCheckebox) {
                            var e = this.options.value(), n = this.options.trueValue() || !0;
                            this.element[0].checked = e === n;
                        } else {
                            var r = this.options.value() === this.element[0].value ? "setAttr" : "removeAttr";
                            t.view.elements[r](this.element[0], "checked", !0);
                        }
                    },
                    change: function() { this.isCheckebox ? this.options.value(this.element[0].checked ? this.options.trueValue() : this.options.falseValue()) : this.element[0].checked && this.options.value(this.element[0].value); }
                });
        }(__m2, __m17, __m8),
        __m1 = function(t) {
            var e = /^(dataViewId|class|id)$/i,
                n = t.Component = t.Construct.extend({
                    setup: function() {
                        if (t.Construct.setup.apply(this, arguments), t.Component) {
                            var e = this;
                            if (this.Control = t.Control.extend({ _lookup: function(t) { return[t.scope, t, window]; } }, t.extend({
                                setup: function(e, n) {
                                    var r = t.Control.prototype.setup.call(this, e, n);
                                    this.scope = n.scope;
                                    var i = this;
                                    return this.on(this.scope, "change", function a() { i.on(), i.on(i.scope, "change", a); }), r;
                                }
                            }, this.prototype.events)), this.prototype.scope && "object" != typeof this.prototype.scope ? this.prototype.scope.prototype instanceof t.Map && (this.Map = this.prototype.scope) : this.Map = t.Map.extend(this.prototype.scope || {}), this.attributeScopeMappings = {}, t.each(this.Map ? this.Map.defaults : {}, function(t, n) { "@" === t && (e.attributeScopeMappings[n] = n); }), this.prototype.template)
                                if ("function" == typeof this.prototype.template) {
                                    var n = this.prototype.template;
                                    this.renderer = function() { return t.view.frag(n.apply(null, arguments)); };
                                } else this.renderer = t.view.mustache(this.prototype.template);
                            t.view.Scanner.tag(this.prototype.tag, function(t, n) { new e(t, n); });
                        }
                    }
                }, {
                    setup: function(n, r) {
                        var i, a, s, o = {}, u = this, c = {};
                        if (t.each(this.constructor.attributeScopeMappings, function(e, r) { o[r] = n.getAttribute(t.hyphenate(e)); }), t.each(t.makeArray(n.attributes), function(s) {
                            var l = t.camelize(s.nodeName.toLowerCase()), h = s.value;
                            if (!(u.constructor.attributeScopeMappings[l] || e.test(l) || t.view.Scanner.attributes[s.nodeName])) {
                                for (var f in t.view.Scanner.regExpAttributes)if (t.view.Scanner.regExpAttributes[f].match.test(s.nodeName))return;
                                var p = r.scope.computeData(h, { args: [] }), d = p.compute, g = function(t, e) { i = l, a.attr(l, e), i = null; };
                                d.bind("change", g), o[l] = d(), d.hasDependencies ? (t.bind.call(n, "removed", function() { d.unbind("change", g); }), c[l] = p) : d.unbind("change", g);
                            }
                        }), this.constructor.Map)a = new this.constructor.Map(o);
                        else if (this.scope instanceof t.Map)a = this.scope;
                        else if (t.isFunction(this.scope)) {
                            var l = this.scope(o, r.scope, n);
                            a = l instanceof t.Map ? l : l.prototype instanceof t.Map ? new l(o) : new(t.Map.extend(l))(o);
                        }
                        var h = {};
                        t.each(c, function(t, e) { h[e] = function(n, r) { i !== e && t.compute(r); }, a.bind(e, h[e]); }), t.bind.call(n, "removed", function() { t.each(h, function(t, e) { a.unbind(e, h[e]); }); }), this.scope = a, t.data(t.$(n), "scope", this.scope);
                        var f = r.scope.add(this.scope), p = {};
                        t.each(this.helpers || {}, function(e, n) { t.isFunction(e) && (p[n] = function() { return e.apply(a, arguments); }); }), this._control = new this.constructor.Control(n, { scope: this.scope }), this.constructor.renderer ? (p._tags || (p._tags = {}), p._tags.content = function d(e, n) {
                            var i = r.subtemplate || n.subtemplate;
                            i && (delete p._tags.content, t.view.live.replace([e], i(n.scope, n.options)), p._tags.content = d);
                        }, s = this.constructor.renderer(f, r.options.add(p))) : s = t.view.frag(r.subtemplate ? r.subtemplate(f, r.options.add(p)) : ""), t.appendChild(n, s);
                    }
                });
            return window.$ && $.fn && ($.fn.scope = function(t) { return t ? this.data("scope").attr(t) : this.data("scope"); }), t.scope = function(e, n) { return e = t.$(e), n ? t.data(e, "scope").attr(n) : t.data(e, "scope"); }, n;
        }(__m2, __m8, __m11, __m17, __m25),
        __m26 = function(t) {
            var e = function(e, n, r) {
                    var i = new t.Deferred;
                    return e.then(function() {
                        var e = t.makeArray(arguments), a = !0;
                        try {
                            e[0] = n[r](e[0]);
                        } catch (s) {
                            a = !1, i.rejectWith(i, [s].concat(e));
                        }
                        a && i.resolveWith(i, e);
                    }, function() { i.rejectWith(this, arguments); }), "function" == typeof e.abort && (i.abort = function() { return e.abort(); }), i;
                },
                n = 0,
                r = function(e) { return t.__reading && t.__reading(e, e.constructor.id), e.__get(e.constructor.id); },
                i = function(e, n, r, i, a, s) {
                    var o = {};
                    if ("string" == typeof e) {
                        var u = e.split(/\s+/);
                        o.url = u.pop(), u.length && (o.type = u.pop());
                    } else t.extend(o, e);
                    return o.data = "object" != typeof n || t.isArray(n) ? n : t.extend(o.data || {}, n), o.url = t.sub(o.url, o.data, !0), t.ajax(t.extend({ type: r || "post", dataType: i || "json", success: a, error: s }, o));
                },
                a = function(e, n, i, a, s) {
                    var o;
                    t.isArray(e) ? (o = e[1], e = e[0]) : o = e.serialize(), o = [o];
                    var u, c, l = e.constructor;
                    return"create" !== n && o.unshift(r(e)), c = l[n].apply(l, o), u = c.pipe(function(t) { return e[s || n + "d"](t, c), e; }), c.abort && (u.abort = function() { c.abort(); }), u.then(i, a), u;
                },
                s = {
                    models: function(e) {
                        return function(n, r) {
                            if (t.Model._reqs++, n) {
                                if (n instanceof this.List)return n;
                                var i = this, a = [], s = i.List || c, o = r instanceof t.List ? r : new s, u = t.isArray(n), l = n instanceof c, h = u ? n : l ? n.serialize() : t.getObject(e || "data", n);
                                if (h === undefined)throw Error("Could not get any raw data while converting using .models");
                                return o.length && o.splice(0), t.each(h, function(t) { a.push(i.model(t)); }), o.push.apply(o, a), u || t.each(n, function(t, e) { "data" !== e && o.attr(e, t); }), setTimeout(t.proxy(this._clean, this), 1), o;
                            }
                        };
                    },
                    model: function(e) {
                        return function(n) {
                            if (n) {
                                "function" == typeof n.serialize && (n = n.serialize()), e && (n = t.getObject(e || "data", n));
                                var r = n[this.id], i = (r || 0 === r) && this.store[r] ? this.store[r].attr(n, this.removeAttr || !1) : new this(n);
                                return i;
                            }
                        };
                    }
                },
                o = {
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
                u = function(t, e) { return function(n) { return n = t.data ? t.data.apply(this, arguments) : n, i(e || this[t.url || "_url"], n, t.type || "get"); }; };
            t.Model = t.Map({
                fullName: "can.Model",
                _reqs: 0,
                setup: function(e) {
                    if (this.store = {}, t.Map.setup.apply(this, arguments), t.Model) {
                        this.List = c({ Map: this }, {});
                        var r = this, i = t.proxy(this._clean, r);
                        t.each(o, function(n, a) {
                            if (t.isFunction(r[a]) || (r[a] = u(n, r[a])), r["make" + t.capitalize(a)]) {
                                var s = r["make" + t.capitalize(a)](r[a]);
                                t.Construct._overwrite(r, e, a, function() {
                                    t.Model._reqs++;
                                    var e = s.apply(this, arguments), n = e.then(i, i);
                                    return n.abort = e.abort, n;
                                });
                            }
                        }), t.each(s, function(n, i) { "string" == typeof r[i] && t.Construct._overwrite(r, e, i, n(r[i])); }), "can.Model" !== r.fullName && r.fullName || (n++, r.fullName = "Model" + n), t.Model._reqs = 0, this._url = this._shortName + "/{" + this.id + "}";
                    }
                },
                _ajax: u,
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
                    t.Model._reqs && null !== n && (this.constructor.store[n] = this), t.Map.prototype.setup.apply(this, arguments);
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
            }), t.each({ makeFindAll: "models", makeFindOne: "model", makeCreate: "model", makeUpdate: "model" }, function(n, r) {
                t.Model[r] = function(r) {
                    return function() {
                        var i = t.makeArray(arguments), a = t.isFunction(i[1]) ? i.splice(0, 1) : i.splice(0, 2), s = e(r.apply(this, a), this, n);
                        return s.then(i[0], i[1]), s;
                    };
                };
            }), t.each(["created", "updated", "destroyed"], function(e) {
                t.Model.prototype[e] = function(n) {
                    var r, i = this.constructor;
                    r = n && "object" == typeof n && this.attr(n.attr ? n.attr() : n), t.trigger(this, "change", e), t.trigger(i, e, this);
                };
            });
            var c = t.Model.List = t.List({
                setup: function(e) { t.isPlainObject(e) && !t.isArray(e) ? (t.List.prototype.setup.apply(this), this.replace(this.constructor.Map.findAll(e))) : t.List.prototype.setup.apply(this, arguments); },
                _changes: function(e, n) {
                    if (t.List.prototype._changes.apply(this, arguments), /\w+\.destroyed/.test(n)) {
                        var r = this.indexOf(e.target);
                        -1 !== r && this.splice(r, 1);
                    }
                }
            });
            return t.Model;
        }(__m2, __m12, __m15),
        __m28 = function(t) {
            var e = /^\d+$/, n = /([^\[\]]+)|(\[\])/g, r = /([^?#]*)(#.*)?$/, i = function(t) { return decodeURIComponent(t.replace(/\+/g, " ")); };
            return t.extend(t, {
                deparam: function(a) {
                    var s, o, u = {};
                    return a && r.test(a) && (s = a.split("&"), t.each(s, function(t) {
                        var r = t.split("="), a = i(r.shift()), s = i(r.join("=")), c = u;
                        if (a) {
                            r = a.match(n);
                            for (var l = 0, h = r.length - 1; h > l; l++)c[r[l]] || (c[r[l]] = e.test(r[l + 1]) || "[]" === r[l + 1] ? [] : {}), c = c[r[l]];
                            o = r.pop(), "[]" === o ? c.push(s) : c[o] = s;
                        }
                    })), u;
                }
            }), t;
        }(__m2, __m10),
        __m27 = function(t) {
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
                h = t.each,
                f = t.extend,
                p = function(e) { return e && "object" == typeof e ? (e = e instanceof t.Map ? e.attr() : t.isFunction(e.slice) ? e.slice() : t.extend({}, e), t.each(e, function(t, n) { e[n] = p(t); })) : e !== undefined && null !== e && t.isFunction(e.toString) && (e = "" + e), e; },
                d = function(t) { return t.replace(/\\/g, ""); },
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
                for (var i, s, o = [], u = "", c = a.lastIndex = 0, h = t.route._call("querySeparator"); i = a.exec(e);)o.push(i[1]), u += d(e.substring(c, a.lastIndex - i[0].length)), s = "\\" + (d(e.substr(a.lastIndex, 1)) || h), u += "([^" + s + "]" + (n[i[1]] ? "*" : "+") + ")", c = a.lastIndex;
                return u += e.substr(c).replace("\\", ""), t.route.routes[e] = { test: RegExp("^" + u + "($|" + l(h) + ")"), route: e, names: o, defaults: n, length: e.split("/").length }, t.route;
            }, f(t.route, {
                param: function(e, n) {
                    var r, i, s = 0, o = e.route, c = 0;
                    if (delete e.route, h(e, function() { c++; }), h(t.route.routes, function(t) { return i = u(t, e), i > s && (r = t, s = i), i >= c ? !1 : undefined; }), t.route.routes[o] && u(t.route.routes[o], e) === s && (r = t.route.routes[o]), r) {
                        var l, p = f({}, e), d = r.route.replace(a, function(t, n) { return delete p[n], e[n] === r.defaults[n] ? "" : encodeURIComponent(e[n]); }).replace("\\", "");
                        return h(r.defaults, function(t, e) { p[e] === t && delete p[e]; }), l = t.param(p), n && t.route.attr("route", r.route), d + (l ? t.route._call("querySeparator") + l : "");
                    }
                    return t.isEmptyObject(e) ? "" : t.route._call("querySeparator") + t.param(e);
                },
                deparam: function(e) {
                    var n = t.route._call("root");
                    n.lastIndexOf("/") === n.length - 1 && 0 === e.indexOf("/") && (e = e.substr(1));
                    var r = { length: -1 }, i = t.route._call("querySeparator"), a = t.route._call("paramsMatcher");
                    if (h(t.route.routes, function(t) { t.test.test(e) && t.length > r.length && (r = t); }), r.length > -1) {
                        var s = e.match(r.test), o = s.shift(), u = e.substr(o.length - (s[s.length - 1] === i ? 1 : 0)), c = u && a.test(u) ? t.deparam(u.slice(1)) : {};
                        return c = f(!0, {}, r.defaults, c), h(s, function(t, e) { t && t !== i && (c[r.names[e]] = decodeURIComponent(t)); }), c.route = r.route, c;
                    }
                    return e.charAt(0) !== i && (e = i + e), a.test(e) ? t.deparam(e.slice(1)) : {};
                },
                data: new t.Map({}),
                routes: {},
                ready: function(e) { return e !== !0 && (t.route._setup(), t.route.setState()), t.route; },
                url: function(e, n) { return n && (e = t.extend({}, t.route.deparam(t.route._call("matchingPartOfURL")), e)), t.route._call("root") + t.route.param(e); },
                link: function(e, n, r, i) { return"<a " + o(f({ href: t.route.url(n, i) }, r)) + ">" + e + "</a>"; },
                current: function(e) { return this._call("matchingPartOfURL") === t.route.param(e); },
                bindings: { hashchange: { paramsMatcher: s, querySeparator: "&", bind: function() { t.bind.call(window, "hashchange", m); }, unbind: function() { t.unbind.call(window, "hashchange", m); }, matchingPartOfURL: function() { return c.href.split(/#!?/)[1] || ""; }, setURL: function(t) { return c.hash = "#!" + t, t; }, root: "#!" } },
                defaultBinding: "hashchange",
                currentBinding: null,
                _setup: function() { t.route.currentBinding || (t.route._call("bind"), t.route.bind("change", g), t.route.currentBinding = t.route.defaultBinding); },
                _teardown: function() { t.route.currentBinding && (t.route._call("unbind"), t.route.unbind("change", g), t.route.currentBinding = null), clearTimeout(e), i = 0; },
                _call: function() {
                    var e = t.makeArray(arguments), n = e.shift(), r = t.route.bindings[t.route.currentBinding || t.route.defaultBinding], i = r[n];
                    return i.apply ? i.apply(r, e) : i;
                }
            }), h(["bind", "unbind", "on", "off", "delegate", "undelegate", "removeAttr", "compute", "_get", "__get"], function(e) { t.route[e] = function() { return t.route.data[e] ? t.route.data[e].apply(t.route.data, arguments) : undefined; }; }), t.route.attr = function(e, n) {
                var r, i = typeof e;
                return r = n === undefined ? arguments : "string" !== i && "number" !== i ? [p(e), n] : [e, p(n)], t.route.data.attr.apply(t.route.data, r);
            };
            var m = t.route.setState = function() {
                var e = t.route._call("matchingPartOfURL");
                n = t.route.deparam(e), i && e === r || t.route.attr(n, !0);
            };
            return t.route;
        }(__m2, __m12, __m15, __m28),
        __m29 = function(t) {
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
        }(__m2, __m27, __m8),
        __m30 = function(t) {
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
                    text: { outStart: "with(_VIEW) { with (_CONTEXT) {", outEnd: "}}", argNames: "_CONTEXT,_VIEW" },
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
            }), n.Helpers = function(t, n) { this._data = t, this._extras = n, e(this, n); }, n.Helpers.prototype = { list: function(e, n) { t.each(e, function(t, r) { n(t, r, e); }); }, each: function(e, n) { t.isArray(e) ? this.list(e, n) : t.view.lists(e, n); } }, t.view.register({ suffix: "ejs", script: function(t, e) { return"can.EJS(function(_CONTEXT,_VIEW) { " + new n({ text: e, name: t }).template.out + " })"; }, renderer: function(t, e) { return n({ text: e, name: t }); } }), t;
        }(__m2, __m19, __m10, __m16, __m20, __m22),
        __m31 = function(t) {
            "use strict";
            if (window.history && history.pushState) {
                t.route.bindings.pushstate = {
                    root: "/",
                    paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,
                    querySeparator: "?",
                    bind: function() {
                        t.delegate.call(t.$(document.documentElement), "a", "click", e), t.each(["pushState", "replaceState"], function(e) {
                            r[e] = window.history[e], window.history[e] = function(n, i, a) {
                                var s = 0 === a.indexOf("http"), o = window.location.search + window.location.hash;
                                (!s && a !== window.location.pathname + o || s && a !== window.location.href + o) && (r[e].apply(window.history, arguments), t.route.setState());
                            };
                        }), t.bind.call(window, "popstate", t.route.setState);
                    },
                    unbind: function() { t.undelegate.call(t.$(document.documentElement), "click", "a", e), t.each(["pushState", "replaceState"], function(t) { window.history[t] = r[t]; }), t.unbind.call(window, "popstate", t.route.setState); },
                    matchingPartOfURL: function() {
                        var t = n(), e = location.pathname + location.search, r = e.indexOf(t);
                        return e.substr(r + t.length);
                    },
                    setURL: function(e) { i && -1 === e.indexOf("#") && window.location.hash && (e += window.location.hash), window.history.pushState(null, null, t.route._call("root") + e); }
                };
                var e = function(e) {
                        if (!(e.isDefaultPrevented ? e.isDefaultPrevented() : e.defaultPrevented === !0)) {
                            var n = this._node || this, r = n.host || window.location.host;
                            if (window.location.host === r) {
                                var a = t.route._call("root");
                                if (0 === n.pathname.indexOf(a)) {
                                    var s = (n.pathname + n.search).substr(a.length), o = t.route.deparam(s);
                                    o.hasOwnProperty("route") && (i = !0, window.history.pushState(null, null, n.href), e.preventDefault && e.preventDefault());
                                }
                            }
                        }
                    },
                    n = function() {
                        var e = location.protocol + "//" + location.host, n = t.route._call("root"), r = n.indexOf(e);
                        return 0 === r ? t.route.root.substr(e.length) : n;
                    },
                    r = {},
                    i = !1;
                t.route.defaultBinding = "pushstate";
            }
            return t;
        }(__m2, __m27),
        __m34 = function(t) {
            var e = t.isArray;
            t.Object = {};
            var n = t.Object.same = function(i, a, s, o, u, c) {
                var l, h = typeof i, f = e(i), p = typeof s;
                if (("string" === p || null === s) && (s = r[s], p = "function"), "function" === p)return s(i, a, o, u);
                if (s = s || {}, null === i || null === a)return i === a;
                if (i instanceof Date || a instanceof Date)return i === a;
                if (-1 === c)return"object" === h || i === a;
                if (h !== typeof a || f !== e(a))return!1;
                if (i === a)return!0;
                if (f) {
                    if (i.length !== a.length)return!1;
                    for (var d = 0; i.length > d; d++)if (l = s[d] === undefined ? s["*"] : s[d], !n(i[d], a[d], i, a, l))return!1;
                    return!0;
                }
                if ("object" === h || "function" === h) {
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
            var r = { "null": function() { return!0; }, i: function(t, e) { return("" + t).toLowerCase() === ("" + e).toLowerCase(); } };
            return t.Object;
        }(__m2),
        __m33 = function(t) {
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
        }(__m2, __m12, __m34),
        __m32 = function(t) {
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
                    var a, s, o = new t.Deferred, u = this, c = this.serialize(), l = this._requestQueue, h = this._changedAttrs;
                    return a = function(t, e, n, r) { return function() { return t.constructor._makeRequest([t, c], e || (t.isNew() ? "create" : "update"), n, r, i); }; }(this, r, function() { o.resolveWith(u, arguments), l.splice(0, 1), l.length > 0 ? l[0] = l[0]() : h.splice(0); }, function() { o.rejectWith(u, arguments), l.splice(0), h.splice(0); }), s = l.push(a) - 1, 1 === l.length && (l[0] = l[0]()), o.abort = function() {
                        var t;
                        return t = l[s].abort && l[s].abort(), l.splice(s), 0 === l.length && h.splice(0), t;
                    }, o.then(e, n), o;
                },
                r = t.Model.prototype._changes,
                i = t.Model.prototype.destroy,
                a = t.Model.prototype.setup;
            return t.each(["created", "updated", "destroyed"], function(n) {
                var r = t.Model.prototype[n];
                t.Model.prototype[n] = function(t) { t && "object" == typeof t && (t = t.attr ? t.attr() : t, this._backupStore = t, t = e(this._changedAttrs || [], t)), r.call(this, t); };
            }), t.extend(t.Model.prototype, { setup: function() { a.apply(this, arguments), this._requestQueue = new t.List; }, _changes: function(t, e) { this._changedAttrs && this._changedAttrs.push(e), r.apply(this, arguments); }, hasQueuedRequests: function() { return this._requestQueue.attr("length") > 1; }, save: function() { return n.apply(this, arguments); }, destroy: function(t, e) { return this.isNew() ? i.call(this, t, e) : n.call(this, t, e, "destroy", "destroyed"); } }), t;
        }(__m2, __m26, __m33),
        __m35 = function(t) {
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
        }(__m2, __m9),
        __m36 = function(t) {
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
        }(__m2, __m9),
        __m37 = function(t) {
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
                    var o, u, c, l, h, f = r.split("."), p = (this._observe_delegates || []).slice(0);
                    n.attr = r, n.lastAttr = f[f.length - 1];
                    for (var d = 0; o = p[d++];)
                        if (!(n.batchNum && o.batchNum === n.batchNum || o.undelegated)) {
                            l = undefined, h = !0;
                            for (var g = 0; o.attrs.length > g; g++)u = o.attrs[g], c = e(u.parts, f), c && (l = c), u.value && h ? h = u.value === "" + this.attr(u.attr) : h && o.attrs.length > 1 && (h = this.attr(u.attr) !== undefined);
                            if (l && h) {
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
        }(__m2, __m12),
        __m39 = function(t) {
            return t.each([t.Map, t.Model], function(e) {
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
                var n, r, i = this.constructor, a = this.attr(t);
                return i.attributes && (n = i.attributes[t], r = i.convert[n] || i.convert["default"]), null !== e && n ? r.call(i, e, a, function() {}, n) : e;
            }, t.List.prototype.serialize = function() { return t.makeArray(t.Map.prototype.serialize.apply(this, arguments)); }, t.Map.prototype.serialize = function(e, n) {
                var r = {}, i = this.constructor, a = {};
                return n = t.isArray(n) ? n : [], n.push(this._cid), e !== undefined ? a[e] = this[e] : a = this.__get(), t.each(a, function(e, a) {
                    var s, o;
                    e instanceof t.Map && t.inArray(e._cid, n) > -1 ? r[a] = e.attr("id") : (s = i.attributes ? i.attributes[a] : 0, o = i.serialize ? i.serialize[s] : 0, r[a] = e && "function" == typeof e.serialize ? e.serialize(undefined, n) : o ? o(e, s) : e);
                }), a.length !== undefined && (r.length = a.length), e !== undefined ? r[e] : r;
            }, t.Map;
        }(__m2, __m12, __m15),
        __m38 = function(t) {
            t.classize = function(e, n) {
                for (var r = e.split(t.undHash), i = 0; r.length > i; i++)r[i] = t.capitalize(r[i]);
                return r.join(n || "");
            };
            var e = t.classize, n = t.Map.prototype, r = n.__set;
            return n.__set = function(n, i, a, s, o) {
                var u = e(n),
                    c = "set" + u,
                    l = function(e) {
                        var r = o && o.call(h, e);
                        return r !== !1 && t.trigger(h, "error", [n, e], !0), !1;
                    },
                    h = this;
                if (!this[c] || (i = this[c](i, function(t) { r.call(h, n, t, a, s, l); }, l)) !== undefined)return r.call(h, n, i, a, s, l), this;
            }, t.Map;
        }(__m2, __m39),
        __m40 = function(t) {
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
        }(__m2, __m39),
        __m41 = function(t) {
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
        }(__m2, __m12, __m15, __m16),
        __m42 = function(t) {
            var e = t.List.prototype, n = e._changes, r = e.setup;
            t.extend(e, {
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
            var i = function(e) { return e[0] && t.isArray(e[0]) ? e[0] : t.makeArray(e); };
            return t.each({ push: "length", unshift: 0 }, function(e, n) {
                var r = t.List.prototype, a = r[n];
                r[n] = function() {
                    var n = i(arguments), r = e ? this.length : 0, s = a.apply(this, arguments);
                    return this.comparator && n.length && (this.sort(null, !0), t.batch.trigger(this, "reset", [n]), this._triggerChange("" + r, "add", n, undefined)), s;
                };
            }), e._changes = function(e, r, i, a, s) {
                if (this.comparator && /^\d+./.test(r)) {
                    var o = +/^\d+/.exec(r)[0], u = this[o];
                    if (u !== undefined) {
                        var c = this.sortedIndex(u);
                        if (c !== o)return[].splice.call(this, o, 1), [].splice.call(this, c, 0, u), t.trigger(this, "move", [u, c, o]), t.trigger(this, "change", [r.replace(/^\d+/, c), i, a, s]), undefined;
                    }
                }
                n.apply(this, arguments);
            }, e.setup = function() { r.apply(this, arguments), this.comparator && this.sort(); }, t.Map;
        }(__m2, __m15),
        __m43 = function(t, e) {
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
        }(jQuery, __m2, __m8),
        __m44 = function(t, e) {
            var n, r, i, a, s, o, u = { val: !0, text: !0 };
            return n = function(n) {
                var a = t.fn[n];
                t.fn[n] = function() {
                    var t, s, c, l = e.makeArray(arguments), h = this;
                    if (e.isDeferred(l[0]))return l[0].done(function(t) { r.call(h, [t], a); }), this;
                    if (i(l)) {
                        if (t = o(l))return s = l[t], l[t] = function(t) { r.call(h, [t], a), s.call(h, t); }, e.view.apply(e.view, l), this;
                        if (c = e.view.apply(e.view, l), e.isDeferred(c))return c.done(function(t) { r.call(h, [t], a); }), this;
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
        }(jQuery, __m2, __m19),
        __m45 = function(t) {
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
                        } else n.dataTypes && n.dataTypes.splice(0, 0, "fixture"), a && r && t.extend(r.data, a);
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
                h = t.replacer;
            return t.extend(t.fixture, {
                _similar: function(e, n, r) { return r ? t.Object.same(e, n, { fixture: null }) : t.Object.subset(e, n, t.fixture._compare); },
                _compare: { url: function(t, e) { return!!l._getData(e, t); }, fixture: null, type: "i" },
                _getData: function(e, n) {
                    var r = [], i = e.replace(".", "\\.").replace("?", "\\?"), a = RegExp(i.replace(h, function(t, e) { return r.push(e), "([^/]+)"; }) + "$").exec(n), s = {};
                    return a ? (a.shift(), t.each(r, function(t) { s[t] = a.shift(); }), s) : null;
                },
                store: function(e, n, r, i) {
                    var a = [], s = 0, o = function(t) { for (var e = 0; a.length > e; e++)if (t == a[e].id)return a[e]; }, u = {};
                    "string" == typeof e ? e = [e + "s", e] : t.isArray(e) || (i = r, r = n, n = e), t.extend(u, {
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
                            var r = parseInt(e.data.offset, 10) || 0, s = parseInt(e.data.limit, 10) || a.length - r, o = 0;
                            for (var u in e.data)if (o = 0, e.data[u] !== undefined && (-1 !== u.indexOf("Id") || -1 !== u.indexOf("_id")))for (; n.length > o;)e.data[u] != n[o][u] ? n.splice(o, 1) : o++;
                            if (i)for (o = 0; n.length > o;)i(n[o], e) ? o++ : n.splice(o, 1);
                            return{ count: n.length, limit: e.data.limit, offset: e.data.offset, data: n.slice(r, r + s) };
                        },
                        findOne: function(t, e) {
                            var n = o(c(t));
                            e(n ? n : undefined);
                        },
                        update: function(e, n) {
                            var r = c(e);
                            t.extend(o(r), e.data), n({ id: c(e) }, { location: e.url || "/" + c(e) });
                        },
                        destroy: function(e) {
                            for (var n = c(e), r = 0; a.length > r; r++)
                                if (a[r].id == n) {
                                    a.splice(r, 1);
                                    break;
                                }
                            return t.extend(o(n) || {}, e.data), {};
                        },
                        create: function(e, n) {
                            var i = r(a.length, a);
                            t.extend(i, e.data), i.id || (i.id = s++), a.push(i), n({ id: i.id }, { location: e.url + "/" + i.id });
                        }
                    });
                    var l = function() {
                        a = [];
                        for (var i = 0; n > i; i++) {
                            var o = r(i, a);
                            o.id || (o.id = i), s = Math.max(o.id + 1, s + 1) || a.length, a.push(o);
                        }
                        t.isArray(e) && (t.fixture["~" + e[0]] = a, t.fixture["-" + e[0]] = u.findAll, t.fixture["-" + e[1]] = u.findOne, t.fixture["-" + e[1] + "Update"] = u.update, t.fixture["-" + e[1] + "Destroy"] = u.destroy, t.fixture["-" + e[1] + "Create"] = u.create);
                    };
                    return l(), t.extend({ getId: c, find: function(t) { return o(c(t)); }, reset: l }, u);
                },
                rand: function f(t, e, n) {
                    if ("number" == typeof t)return"number" == typeof e ? t + Math.floor(Math.random() * (e - t)) : Math.floor(Math.random() * t);
                    var r = f;
                    if (e === undefined)return r(t, r(t.length + 1));
                    var i = [];
                    t = t.slice(0), n || (n = e), n = e + Math.round(r(n - e));
                    for (var a = 0; n > a; a++)i.push(t.splice(r(t.length), 1)[0]);
                    return i;
                },
                xhr: function(e) { return t.extend({}, { abort: t.noop, getAllResponseHeaders: function() { return""; }, getResponseHeader: function() { return""; }, open: t.noop, overrideMimeType: t.noop, readyState: 4, responseText: "", responseXML: null, send: t.noop, setRequestHeader: t.noop, status: 200, statusText: "OK" }, e); },
                on: !0
            }), t.fixture.delay = 200, t.fixture.rootUrl = e(""), t.fixture["-handleFunction"] = function(e) { return"string" == typeof e.fixture && t.fixture[e.fixture] && (e.fixture = t.fixture[e.fixture]), "function" == typeof e.fixture ? (setTimeout(function() { e.success && e.success.apply(null, e.fixture(e, "success")), e.complete && e.complete.apply(null, e.fixture(e, "complete")); }, t.fixture.delay), !0) : !1; }, t.fixture.overwrites = s, t.fixture.make = t.fixture.store, t.fixture;
        }(__m2, __m10, __m34);
    window.can = __m4;
})();