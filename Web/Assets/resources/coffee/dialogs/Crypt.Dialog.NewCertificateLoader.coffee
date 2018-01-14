###*
# Лоадер при создании сертификата.
# Так уж получилось что и запрос отправляет тоже он :(
###

Crypt.Dialogs.NewCertificateLoader = () ->

  template: 'NewCertificateLoader'

  ###*
  # Запускаем диалог
  ###
  initialize: (val, callback) ->
    @pin = val
    @cb = callback
    @render()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, [],{wrapCSS:'thin-modal',closeBtn:false})

    @$content = @dialog.$content
    @$cancel = @$content.find('.js-cancel')

    @start()

    return

  onSuccess: (response) ->
    new Crypt.Dialogs.NewCertificateCongratulations().initialize();
    @cb.success(response.CertificateInfo)
    return

  onFail: ->
    new Crypt.Dialog().Open( 'blankError', { text: Crypt.l18n.NewCertificate.error } )
    @activeSubmit
    return

  start: ->
    @xhr = $.ajax
      url: Crypt.Urls.CreateTestCertificate
      data:
        pin: @pin
      success: _.bind((response) ->
        if (response && !response.Error)
          @onSuccess(response)
        else
          @onFail()
        return
      this)
      error: _.bind( ->
        @onFail()
      this)

    @$cancel.on 'click', _.bind((e) ->
      @xhr.abort()
      @dialog.Close()
      e.preventDefault()
      return false
    this)

    return