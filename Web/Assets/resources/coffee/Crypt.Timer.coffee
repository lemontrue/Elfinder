Crypt = Crypt or {}

Crypt.Timer = () ->

  isEnd: false

  Init: (options, callback) ->
    @timeout = ()->
    @el = options.el
    @startTime = options.startTime
    @cb = callback
    @Start()
    return

  Start: ->
    clearTimeout (@timeout)
    startTime = new Date(new Date(1, 1).setSeconds(@startTime))
    @el.text(getDateFormat(startTime))
    @isEnd = false
    @checkTime()

    return

  Stop: ->
    clearTimeout (@timeout)
    startTime = new Date(new Date(1, 1).setSeconds(0))
    @el.text(getDateFormat(startTime))
    @isEnd = true
    return

  checkTime: ->
    date = window.getDate(@el.text())

    if date.getMinutes() == 0 and date.getSeconds() == 0
      @cb.end()
      @Stop()

    else
      if date.getMinutes() == 2 and date.getSeconds() == 0
        @cb.canResend()
      date = new Date(date.getTime() - 1000)
      @el.text getDateFormat(date)

    @timeout = setTimeout _.bind(->
        @checkTime()
        return
      this),
      1000

    return



