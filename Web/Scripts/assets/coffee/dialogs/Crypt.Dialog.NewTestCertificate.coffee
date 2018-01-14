###*
# Запрос пина для нового тестового тертификата
###

Crypt.Dialogs.NewTestCertificate = () ->

  template: 'NewTestCertificateModal'

  ###*
  # Запускаем диалог
  ###
  initialize: (callback) ->
    @cb = callback
    @render()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, [],{wrapCSS:'thin-modal'})

    @$content = @dialog.$content
    @$submit = @$content.find('.js-submit')
    @$input = @$content.find('.js-pinCode')
    @$eye = @$content.find('.js-eye')
    @$error = @$content.find('.js-error')

    @$error.hide()

    @setEvents()

    return

  setEvents: ->
    @$eye.on 'click', _.bind(() ->
      @$eye.toggleClass 'i-visible'
      @$input.prop('type', if @$eye.hasClass( 'i-visible' ) then 'text' else 'password')
      return
    this)

    @$input.on 'keypress', _.bind(->
      @$error.hide()
      return
    this)

    @$input.on 'focus', _.bind(->
      @$error.hide()
      return
    this)

    @$submit.on 'click', _.bind((e) ->
      val = @$input.val()
      if !val
        @$error.html('Введите ПИН-код').show()
        return false
      else if val.length != 8
        @$error.html('ПИН-код должен состоять из 8 цифр').show()
        return false
      else if !/^[a-z0-9]+$/i.test(val)
        @$error.html('ПИН-код может содержать только цифры').show()
        return false

      new Crypt.Dialogs.NewCertificateLoader().initialize @$input.val(), @cb

      e.preventDefault()
      return false
    this)

    $(@dialog).on 'onClose', _.bind(() ->
      @cb.canceled()
      return
    this)

    return