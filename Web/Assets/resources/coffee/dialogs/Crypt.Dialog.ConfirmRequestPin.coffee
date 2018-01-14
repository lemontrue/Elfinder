###*
# Диалог проверки телефона при регистрации
###

Crypt.Dialogs.ConfirmRequestPin = Crypt.View.extend(

  template: 'requestConfirmPin'
  isCancel: true
  ###*
  # Запускаем диалог
  ###
  initialize: (callback) ->
    @cb = callback

    @render()

    return

  ###*
  # Рендерим шаблон, вешаем обработчики
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {},{
      afterClose:  _.bind(() ->
        if (@isCancel)
          Crypt.Preloader.UnBlock $('#myCertificateList')
        return
      this)
    })

    @$content = @dialog.$content
    @$submitBtn = @$content.find('.js-submit')
    @$elPin = @$content.find('.js-pin')
    @$elCancel = @$content.find('.js-close')

    @$elCancel.on 'click', _.bind(()->
      @dialog.Close()
      return false
    this)

    @$submitBtn.on 'click', _.bind(()->
      @isCancel = false
      @cb(@$elPin.val())
      return false
    this)

    return

)