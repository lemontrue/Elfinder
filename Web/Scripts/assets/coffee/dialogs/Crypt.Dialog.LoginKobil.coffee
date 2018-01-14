###*
# Диалог проверки телефона при регистрации
###

Crypt.Dialogs.LoginKobil = () ->

  timerTime: 180
  template: 'regPhone'
  tryCount: 0
  maxTryCount: 5

  # проксируем локализацию
  ln: Crypt.l18n.Login

  ###*
  # Запускаем диалог
  ###
  initialize: (time,callback) ->
    @timerTime = !!time ? time : @timerTime
    @cb = callback

#    @checkPhone()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: ->

    @dialog = new Crypt.Dialog().Open(@template, {})

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
            @cb.success(response)
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
      data:
        smsConfirmationToken: @token
      success: _.bind((response) ->
          @$input.val('')
          @blockResend()

          if response.success
            @token = response.SmsConfirmationToken
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

  kobilLogin: ->
    $kobilButton.attr 'disabled', 'true'
    if $kobilLogin2.val() != ''
      Crypt.Preloader.Block($('.login-area'))
      $.ajax
        url: Crypt.Urls.KobilLogin
        data: login: $kobilLogin2.val()
        success: (result) ->
          if result.errorMsg != null
            if result.errorCode == 4 or result.errorCode == 5
              showNormalLogin $kobilLogin2.val()
              $('#clickButton').removeAttr 'disabled'
            Crypt.Preloader.UnBlock($('.login-area'))
            showError result.errorMsg
            $kobilButton.removeAttr 'disabled'
            return
          if result.pin == 2
            loginCookie 'initTab', 'kobil'
            showKobilWindow result.KobilTransactionWaitingTime, result.KobilPollingTime, 'kobilLogin'
          else if !result.KobilAuthEnabled
            showNormalLogin()
            Crypt.Preloader.UnBlock($('.login-area'))
            showError 'Отключен вход по TaxnetId'
            $('#clickButton').removeAttr 'disabled'
          $kobilButton.removeAttr 'disabled'
          return
        error: (request, error, result) ->
          Crypt.Preloader.UnBlock($('.login-area'))
          wnd = window.open('about:blank', '_blank', 'height:100;width:100')
          wnd.document.write request.responseText
          $('#clickButton').removeAttr 'disabled'
          false
    else
      $kobilButton.removeAttr 'disabled'
      showError 'Введите E-mail'
      $kobilLogin2.addClass 'error'
    return
