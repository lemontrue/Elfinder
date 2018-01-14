###*
# Поздравление с сертификатом
###

Crypt.Dialogs.NewCertificateCongratulations = () ->

  template: 'NewCertificateCongratulations'

  ###*
  # Запускаем диалог
  ###
  initialize: () ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, [], {wrapCSS:'styled-modal',margin: 0,padding: 0})

    $(@dialog).on 'onClose', _.bind(() ->
      location.href = Crypt.Urls.Login
      return
    this)

    return

