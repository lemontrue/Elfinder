Crypt = Crypt or {}

# todo вынести в каконить общий инит
Crypt.Pages = Crypt.Pages || {};

###*
# Основной Диалог
###
Crypt.Pages = () ->

  delegateEventSplitter = /^(\S+)\s*(.*)$/;

  delegateEvents: (events) ->
    if !(events or (events = _.result(this, 'events')))
      return this
    @undelegateEvents()
    for key of events
      method = events[key]
      if !_.isFunction(method)
        method = @[events[key]]
      if !method
        continue
      match = key.match(delegateEventSplitter)
      @delegate match[1], match[2], _.bind(method, this)
    this
