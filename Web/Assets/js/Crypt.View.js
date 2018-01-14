var Events, delegateEventSplitter, viewOptions;

Events = {
  on: function(events, callback, context) {
    var calls, event, list, node, tail;
    calls = void 0;
    event = void 0;
    node = void 0;
    tail = void 0;
    list = void 0;
    if (!callback) {
      return this;
    }
    events = events.split(eventSplitter);
    calls = this._callbacks || (this._callbacks = {});
    while (event = events.shift()) {
      list = calls[event];
      node = list ? list.tail : {};
      node.next = tail = {};
      node.context = context;
      node.callback = callback;
      calls[event] = {
        tail: tail,
        next: list ? list.next : node
      };
    }
    return this;
  },
  off: function(events, callback, context) {
    var calls, cb, ctx, event, node, tail;
    event = void 0;
    calls = void 0;
    node = void 0;
    tail = void 0;
    cb = void 0;
    ctx = void 0;
    if (!(calls = this._callbacks)) {
      return;
    }
    if (!(events || callback || context)) {
      delete this._callbacks;
      return this;
    }
    events = events ? events.split(eventSplitter) : _.keys(calls);
    while (event = events.shift()) {
      node = calls[event];
      delete calls[event];
      if (!node || !(callback || context)) {
        continue;
      }
      tail = node.tail;
      while ((node = node.next) !== tail) {
        cb = node.callback;
        ctx = node.context;
        if (callback && cb !== callback || context && ctx !== context) {
          this.on(event, cb, ctx);
        }
      }
    }
    return this;
  },
  trigger: function(events) {
    var all, args, calls, event, node, rest, tail;
    event = void 0;
    node = void 0;
    calls = void 0;
    tail = void 0;
    args = void 0;
    all = void 0;
    rest = void 0;
    if (!(calls = this._callbacks)) {
      return this;
    }
    all = calls.all;
    events = events.split(eventSplitter);
    rest = slice.call(arguments, 1);
    while (event = events.shift()) {
      if (node = calls[event]) {
        tail = node.tail;
        while ((node = node.next) !== tail) {
          node.callback.apply(node.context || this, rest);
        }
      }
      if (node = all) {
        tail = node.tail;
        args = [event].concat(rest);
        while ((node = node.next) !== tail) {
          node.callback.apply(node.context || this, args);
        }
      }
    }
    return this;
  }
};

Events.bind = Events.on;

Events.unbind = Events.off;

Crypt.BaseView = function(options) {
  this.cid = _.uniqueId('view');
  _.extend(this, _.pick(options, viewOptions));
  this._ensureElement();
  this.initialize.apply(this, arguments);
};

delegateEventSplitter = /^(\S+)\s*(.*)$/;

viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

_.extend(Crypt.BaseView.prototype, {
  tagName: 'div',
  $: function(selector) {
    return this.$el.find(selector);
  },
  initialize: function() {},
  render: function() {
    return this;
  },
  remove: function() {
    this._removeElement();
    this.stopListening();
    return this;
  },
  _removeElement: function() {
    this.$el.remove();
  },
  setElement: function(element) {
    this.undelegateEvents();
    this._setElement(element);
    this.delegateEvents();
    return this;
  },
  _setElement: function(el) {
    this.$el = $(el);
    this.el = this.$el[0];
  },
  delegateEvents: function(events) {
    var key, match, method;
    events || (events = _.result(this, 'events'));
    if (!events) {
      return this;
    }
    this.undelegateEvents();
    for (key in events) {
      method = events[key];
      if (!_.isFunction(method)) {
        method = this[method];
      }
      if (!method) {
        continue;
      }
      match = key.match(delegateEventSplitter);
      this.delegate(match[1], match[2], _.bind(method, this));
    }
    return this;
  },
  delegate: function(eventName, selector, listener) {
    this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
    return this;
  },
  undelegateEvents: function() {
    if (this.$el) {
      this.$el.off('.delegateEvents' + this.cid);
    }
    return this;
  },
  undelegate: function(eventName, selector, listener) {
    this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
    return this;
  },
  _createElement: function(tagName) {
    return document.createElement(tagName);
  },
  _ensureElement: function() {
    var attrs;
    if (!this.el) {
      attrs = _.extend({}, _.result(this, 'attributes'));
      if (this.id) {
        attrs.id = _.result(this, 'id');
      }
      if (this.className) {
        attrs['class'] = _.result(this, 'className');
      }
      this.setElement(this._createElement(_.result(this, 'tagName')));
      this._setAttributes(attrs);
    } else {
      this.setElement(_.result(this, 'el'));
    }
  },
  _setAttributes: function(attributes) {
    this.$el.attr(attributes);
  }
});

Crypt.BaseView.extend = function(protoProps, staticProps) {
  var Surrogate, child, parent;
  parent = this;
  child = void 0;
  if (protoProps && _.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function() {
      return parent.apply(this, arguments);
    };
  }
  _.extend(child, parent, staticProps);
  Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;
  if (protoProps) {
    _.extend(child.prototype, protoProps);
  }
  child.__super__ = parent.prototype;
  return child;
};

Crypt.View = Crypt.BaseView.extend({
  _hideClass: 'hidden',
  _disableClass: 'hidden',
  _disableClass: 'hidden',
  Hide: function() {
    var i, results;
    i = 0;
    results = [];
    while (i < arguments.length) {
      this._addClass(arguments[i], this._hideClass);
      results.push(i++);
    }
    return results;
  },
  Show: function(el) {
    var i, results;
    i = 0;
    results = [];
    while (i < arguments.length) {
      this._removeClass(arguments[i], this._hideClass);
      results.push(i++);
    }
    return results;
  },
  _addClass: function(el, needClass) {
    var elements;
    elements = _.isArray(el) ? el : [el];
    return _.each(elements, function(elem) {
      if (elem.length) {
        return elem.addClass(needClass);
      }
    });
  },
  _removeClass: function(el, needClass) {
    var elements;
    elements = _.isArray(el) ? el : [el];
    return _.each(elements, function(elem) {
      if (elem.length) {
        return elem.removeClass(needClass);
      }
    });
  }
});
