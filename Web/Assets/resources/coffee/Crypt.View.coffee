# Немного полезностей
# Честно стырено с Backbone.View & Backbone.Events


Events =
  on: (events, callback, context) ->
    calls = undefined
    event = undefined
    node = undefined
    tail = undefined
    list = undefined
    if !callback
      return this
    events = events.split(eventSplitter)
    calls = @_callbacks or (@_callbacks = {})
    while event = events.shift()
      list = calls[event]
      node = if list then list.tail else {}
      node.next = tail = {}
      node.context = context
      node.callback = callback
      calls[event] =
        tail: tail
        next: if list then list.next else node
    this
  off: (events, callback, context) ->
    event = undefined
    calls = undefined
    node = undefined
    tail = undefined
    cb = undefined
    ctx = undefined
    if !(calls = @_callbacks)
      return
    if !(events or callback or context)
      delete @_callbacks
      return this
    events = if events then events.split(eventSplitter) else _.keys(calls)
    while event = events.shift()
      node = calls[event]
      delete calls[event]
      if !node or !(callback or context)
        continue
      tail = node.tail
      while (node = node.next) != tail
        cb = node.callback
        ctx = node.context
        if callback and cb != callback or context and ctx != context
          @on event, cb, ctx
    this
  trigger: (events) ->
    event = undefined
    node = undefined
    calls = undefined
    tail = undefined
    args = undefined
    all = undefined
    rest = undefined
    if !(calls = @_callbacks)
      return this
    all = calls.all
    events = events.split(eventSplitter)
    rest = slice.call(arguments, 1)
    while event = events.shift()
      if node = calls[event]
        tail = node.tail
        while (node = node.next) != tail
          node.callback.apply node.context or this, rest
      if node = all
        tail = node.tail
        args = [ event ].concat(rest)
        while (node = node.next) != tail
          node.callback.apply node.context or this, args
    this

Events.bind   = Events.on;
Events.unbind = Events.off;

Crypt.BaseView = (options) ->
  @cid = _.uniqueId('view')
  _.extend this, _.pick(options, viewOptions)
  @_ensureElement()
  @initialize.apply this, arguments
  return

# Cached regex to split keys for `delegate`.
delegateEventSplitter = /^(\S+)\s*(.*)$/
# List of view options to be set as properties.
viewOptions = [
  'model'
  'collection'
  'el'
  'id'
  'attributes'
  'className'
  'tagName'
  'events'
]
# Set up all inheritable **Backbone.View** properties and methods.
_.extend Crypt.BaseView.prototype,

  tagName: 'div'

  $: (selector) ->
    @$el.find selector

  initialize: ->

  render: ->
    this

  remove: ->
    @_removeElement()
    @stopListening()
    this

  _removeElement: ->
    @$el.remove()
    return

  setElement: (element) ->
    @undelegateEvents()
    @_setElement element
    @delegateEvents()
    this

  _setElement: (el) ->
    @$el = $(el)
    @el = @$el[0]
    return

  delegateEvents: (events) ->
    events or (events = _.result(this, 'events'))
    if !events
      return this
    @undelegateEvents()
    for key of events
      method = events[key]
      if !_.isFunction(method)
        method = @[method]
      if !method
        continue
      match = key.match(delegateEventSplitter)
      @delegate match[1], match[2], _.bind(method, this)
    this

  delegate: (eventName, selector, listener) ->
    @$el.on eventName + '.delegateEvents' + @cid, selector, listener
    this

  undelegateEvents: ->
    if @$el
      @$el.off '.delegateEvents' + @cid
    this

  undelegate: (eventName, selector, listener) ->
    @$el.off eventName + '.delegateEvents' + @cid, selector, listener
    this

  _createElement: (tagName) ->
    document.createElement tagName

  _ensureElement: ->
    if !@el
      attrs = _.extend({}, _.result(this, 'attributes'))
      if @id
        attrs.id = _.result(this, 'id')
      if @className
        attrs['class'] = _.result(this, 'className')
      @setElement @_createElement(_.result(this, 'tagName'))
      @_setAttributes attrs
    else
      @setElement _.result(this, 'el')
    return

  _setAttributes: (attributes) ->
    @$el.attr attributes
    return



Crypt.BaseView.extend = (protoProps, staticProps) ->
  parent = this
  child = undefined
  # The constructor function for the new subclass is either defined by you
  # (the "constructor" property in your `extend` definition), or defaulted
  # by us to simply call the parent constructor.
  if protoProps and _.has(protoProps, 'constructor')
    child = protoProps.constructor
  else

    child = ->
      parent.apply this, arguments

  # Add static properties to the constructor function, if supplied.
  _.extend child, parent, staticProps
  # Set the prototype chain to inherit from `parent`, without calling
  # `parent` constructor function.

  Surrogate = ->
    @constructor = child
    return

  Surrogate.prototype = parent.prototype
  child.prototype = new Surrogate
  # Add prototype properties (instance properties) to the subclass,
  # if supplied.
  if protoProps
    _.extend child.prototype, protoProps
  # Set a convenience property in case the parent's prototype is needed
  # later.
  child.__super__ = parent.prototype
  child



Crypt.View = Crypt.BaseView.extend (

  _hideClass:  'hidden'
  _disableClass:  'hidden'
  _disableClass:  'hidden'

  Hide: ()->
    i = 0
    while i < arguments.length
      @_addClass arguments[i], @_hideClass
      i++

  Show: (el)->
    i = 0
    while i < arguments.length
      @_removeClass arguments[i], @_hideClass
      i++

  _addClass: (el, needClass) ->
    elements = if _.isArray el then el else [el]

    _.each elements, (elem)->
      if elem.length then elem.addClass needClass

  _removeClass: (el, needClass) ->
    elements = if _.isArray el  then el else [el]

    _.each elements,  (elem)->
      if elem.length then elem.removeClass needClass

)