var Crypt;

Crypt = Crypt || {};

Crypt.Pages = Crypt.Pages || {};


/**
 * Основной Диалог
 */

Crypt.Pages = function() {
  var delegateEventSplitter;
  delegateEventSplitter = /^(\S+)\s*(.*)$/;
  return {
    delegateEvents: function(events) {
      var key, match, method;
      if (!(events || (events = _.result(this, 'events')))) {
        return this;
      }
      this.undelegateEvents();
      for (key in events) {
        method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        if (!method) {
          continue;
        }
        match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    }
  };
};
