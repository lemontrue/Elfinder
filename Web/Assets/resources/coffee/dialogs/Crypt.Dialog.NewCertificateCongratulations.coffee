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
    regTipOptions = {
      tipJoint: 'left',
      background: '#fff5d2',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#fee8ae'
    }
    $('.js-congrat-test-tip').on 'click', (e) ->
      return false
    new Opentip($('.js-congrat-test-tip'), 'Сертификат выпущен без участия аккредитованного Удостоверяющего Центра и не имеет юридической силы', '', regTipOptions)
    Opentip.lastZIndex = 9000;
    return

