###*
# Диалог просто с текстом, автозакрытие по таймеру
###

Crypt.Dialogs.BaseTemporary = () ->

  template: 'baseTemporary'
  closeAfter: 5000

  ###*
  # Запускаем диалог
  ###
  initialize: (options,callback) ->
    @options = options
    @cb = callback

    if options && options.closeAfter then @closeAfter = options.closeAfter

    @render()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {
      text: if @options.text then @options.text else ''
    })

    @$content = @dialog.$content
    @$body = @$content.find('.js-dialog-body')
    @$text = @$body.find('.js-dialog-text')

    @timeout = setTimeout _.bind((->
      @dialog.Close()
      return
    ), this), @closeAfter

    $(@dialog).on 'onClose', _.bind(() ->
      clearTimeout(@timeout)
      return
    this)

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
    return false if (@resendBtn.hasClass 'disabled')
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
      url: Crypt.Urls.CheckPhoneReg
      data:
        phone: @phone
      success: _.bind((response) ->
        switch response.Status
          when 2
            if (@isCorrectEmail)
              new Crypt.Dialog().Open( 'blankError', @ln.RegWrongPhone )
            else
              new Crypt.Dialog().Open( 'blankError', @ln.RegWrongEmailAndPhone )
            @cb.canceled()
            break;
          when 0
            if (!@isCorrectEmail)
              new Crypt.Dialog().Open( 'blankError', @ln.RegWrongEmail )
              @cb.canceled()
            else
              @token = response.SmsConfirmationToken
              @render()
        return
      this)
      error: _.bind(->
        Crypt.Preloader.UnBlock @$content
        @cb.error()
        return
      this)
    return
