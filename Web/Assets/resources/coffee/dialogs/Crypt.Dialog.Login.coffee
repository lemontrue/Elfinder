###*
# Диалог подтверждения телефона при авторизации
###

Crypt.Dialogs.Login = () ->

  timerTime: 180
  template: 'regPhone'
  tryCount: 0
  maxTryCount: 5

  # проксируем локализацию
  ln: Crypt.l18n.Login

  ###*
  # Запускаем диалог
  ###
  initialize: (data,callback) ->
    @fields = data
    @cb = callback

    @checkLogin()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: (time) ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {})

    @$content = @dialog.$content
    @$title = @$content.find('.js-dialog-title')
    @$body = @$content.find('.js-dialog-body')
    @$timerEl = @$content.find('.js-time')
    @submitBtn = @$content.find('.js-submit')
    @resendBtn = @$content.find('.js-resend')
    @cancelBtn = @$content.find('.js-close')
    @$input = @$content.find('.js-pin')
    @$error = @$content.find('.js-error')

    @timer = new Crypt.Timer()
    @timer.Init(
      {
        el: @$timerEl
        startTime: @timerTime
      }
      {
        end: _.bind(->
          @blockSubmit()
          return
        this)
        canResend: _.bind(->
          @activeResend()
          return
        this)
      }
    )

    $(@dialog).on 'onClose', _.bind(() ->
      @timer.Stop()
      @cb.canceled()
      return
    this)

    @setActions()

    return


  ###*
  # Навешиваем обработчики
  ###
  setActions: () ->
    @resendBtn.on 'click', _.bind(()->
      @resendSms()
      return
    this)
    @submitBtn.on 'click', _.bind(()->
      @checkCode()
      return
    this)
    @cancelBtn.on 'click', _.bind(()->
      @dialog.Close()
      return
    this)
    @$input.on 'keypress', _.bind((e)->
      if (e.charCode == 13)
        @checkCode()
        return false
      if @$input.val().length == 4
        return false
      @hideError()
    this)

    @$input.on 'keyup', _.bind(()->

      this)

    @$input.focus()

    return

  activeResend: () ->
    @resendBtn.removeAttr 'disabled'
    return

  blockResend: () ->
    @resendBtn.attr 'disabled', 'disabled'
    return

  blockSubmit: () ->
    @submitBtn.attr 'disabled', 'disabled'
    return

  activeSubmit: () ->
    @submitBtn.removeAttr 'disabled'
    return

  blockInput: () ->
    @submitBtn.attr 'disabled', 'disabled'
    return

  blockActinos: () ->
    @blockSubmit()
    @blockResend()
    @blockInput()
    @$input.val('')
    return

  showError: (text) ->
    @$error.addClass('js-validation-error').html text
    return

  hideError: () ->
    @$error.removeClass('js-validation-error').html ''
    return

  ###*
  # Проверяем введенный пин
  ###
  checkCode: () ->
    return false if (@resendBtn.hasClass 'disabled')
    if (@$input.val() == '')
      @showError(@ln.EnterCode)
      return false
    if !/^[0-9]+$/.test(@$input.val())
      @showError(@ln.WrongCode)
      return
    if (@tryCount >= @maxTryCount)
      @showError(@ln.LoginMaxCount)
      @blockActinos()
      @timer.Stop()
      return false

    @tryCount++

    $('#sms .img').show()
    $.ajax
      url: Crypt.Urls.CheckSmsPin
      data:
        pinCode: @$input.val()
        retUrl: $('#retUrl').val()
      success: _.bind((response) ->
        if response.success
          @cb.success(response.redirect)
        else
          @showError(@ln.WrongCode)
          @$input.focus()
        return
      this)
    return

  ###*
  # Запрашиваем новый пин
  ###
  resendSms: () ->
    return false if (@resendBtn.hasClass 'disabled')

    $.ajax
      url: Crypt.Urls.ResendSmsReg
      success: _.bind((response) ->
        @$input.val('')
        @blockResend()
        if response.success
          @tryCount = 0
          @timer.Start()
          @$input.focus()
          @activeSubmit()
        else
          @showError(response.message)
          @timer.Stop()
          @blockSubmit()
        return
      this)
    return

  # хз чо оно делает :)
  qs:  (key) ->
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, '\\$&')
    # escape RegEx meta chars
    match = location.search.match(new RegExp('[?&]' + key + '=([^&]+)(&|$)'))
    match and decodeURIComponent(match[1].replace(/\+/g, ' '))


  ###*
  Проверяем введенные данные
  ###
  checkLogin: ->
    $.ajax
      url: Crypt.Urls.LoginGuid
      data: @fields
      success: _.bind((response) ->
        if response.errorMsg
          @cb.error(response)
          return
        switch response.pin
          when 0
            if response.retUrl != ''
              redirect = response.retUrl
            else
              if @qs('ReturnUrl') != null
                redirect = qs('ReturnUrl')
            @cb.success(redirect)
            break
          when 1
            @timerTime = response.pinWaitingTime
            @render()
            break
          when 2
            @cb.kobil(response)
            break
          else
            wnd = window.open('about:blank', '_blank', 'height=800,width=1200,resizable=1,scrollbars=1')
            wnd.document.write response
        return
      this)
      error: _.bind((request, error, result) ->
        Crypt.Preloader.UnBlock($('.login-area'))
        wnd = window.open('about:blank', '_blank', 'height:100;width:100')
        wnd.document.write request.responseText
        @activeSubmit
      this)
    return