###*
# Диалог проверки телефона при регистрации
###

Crypt.Dialogs.RegPhoneConfirm = () ->

  timerTime: 180
  template: 'regPhone'
  tryCount: 0
  maxTryCount: 5

# проксируем локализацию
  ln: Crypt.l18n.Login

  ###*
  # Запускаем диалог
  ###
  initialize: (phone,email,callback) ->
    @phone = phone
    @email = email
    @cb = callback

    @$registrationBox = $('.js-registration-box')

    @checkPhone()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {})


    @$content = @dialog.$content
    @$title = @$content.find('.js-dialog-title')
    @$body = @$content.find('.js-dialog-body')

    @$timerEl = @$content.find('.js-time')
    @$submitBtn = @$content.find('.js-submit')
    @$resendBtn = @$content.find('.js-resend')
    @$cancelBtn = @$content.find('.js-close')
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

    setTimeout _.bind((->
      @$input.focus()
      return
    ), this), 100

    return

  ###*
  # Навешиваем обработчики
  ###
  setActions: () ->
    @$resendBtn.on 'click', _.bind(()->
      @resendSms()
      return
    this)
    @$submitBtn.on 'click', _.bind(()->
      @checkCode()
      return
    this)
    @$cancelBtn.on 'click', _.bind(()->
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
    @$resendBtn.removeAttr 'disabled'
    return

  blockResend: () ->
    @$resendBtn.attr 'disabled', 'disabled'
    return

  blockSubmit: () ->
    @$submitBtn.attr 'disabled', 'disabled'
    return

  activeSubmit: () ->
    @$submitBtn.removeAttr 'disabled'
    return

  blockInput: () ->
    @$submitBtn.attr 'disabled', 'disabled'
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
    return false if (@$resendBtn.hasClass 'disabled')

    if (@$input.val() == '')
      @showError(@ln.EnterCode)
      return false
    if !/^[0-9]+$/.test(@$input.val())
      @showError(@ln.WrongCode)
      return
    if (@tryCount >= @maxTryCount)
      @showError(@ln.RegMaxCount)
      @blockActinos()
      @timer.Stop()
      return false

    @tryCount++
    Crypt.Preloader.Block @$content
    $.ajax
      url: Crypt.Urls.SmsConfirmReg
      data:
        PIN: @$input.val()
        smsConfirmationToken: @token
      success: _.bind((response) ->
        @$input.val('')
        switch response.Status
          when 0
            @dialog.Close()
            @cb.success()
            break
          when 4
            Crypt.Preloader.UnBlock @$content
            @showError(@ln.RegMaxCount)
            @blockActinos()
            @timer.Stop()
            break
          when 5
            Crypt.Preloader.UnBlock @$content
            @showError(@ln.WrongCode)
            @$input.focus()
        return
      this)
      error: _.bind(->
        Crypt.Preloader.UnBlock @$content
        @cb.error()
        return
      this)
    return

  ###*
  # Запрашиваем новый пин
  ###
  resendSms: () ->
    return false if (@$resendBtn.hasClass 'disabled')
    Crypt.Preloader.UnBlock @$content
    $.ajax
      url: Crypt.Urls.ResendSmsReg
      data:
        smsConfirmationToken: @token
      success: _.bind((response) ->
        Crypt.Preloader.UnBlock @$content
        @token = response.SmsConfirmationToken
        @tryCount = 0
        @timer.Start()
        @$input.val('').focus()
        @activeSubmit()
        @blockResend()
        return
      this)
      error: _.bind(->
        Crypt.Preloader.UnBlock @$content
        @cb.error()
        return
      this)
    return

  ###*
  # проверка телефона и первый запрос пина
  ###
  checkPhone: ()->

    $.ajax
      url: Crypt.Urls.CheckPhoneNEmail
      data:
        phone: @phone
        email: @email
      success: _.bind((response) ->
        if (response && response.Status == 0)
          @token = response.SmsConfirmationToken
          @render()
        else
          new Crypt.Dialog().Open( 'blankCentered',
            title: 'Внимание!'
            text: response.Error.Message
          )
        Crypt.Preloader.UnBlock @$registrationBox
        return
      this)
      error: _.bind(->
        new Crypt.Dialog().Open( 'blankCentered', @ln.ErrorReg )
        Crypt.Preloader.UnBlock @$registrationBox
        this)
    return

