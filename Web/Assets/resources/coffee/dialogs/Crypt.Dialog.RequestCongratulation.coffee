###*
# Лоадер при создании сертификата.
# Так уж получилось что и запрос отправляет тоже он :(
###

Crypt.Dialogs.RequestCongratulation = Crypt.View.extend(

  template: 'RequestCongratulation'

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
    @dialog.Open(@template, [],{wrapCSS:'blank-centered',closeBtn:false})

    @$content = @dialog.$content
    @$cancel = @$content.find('.js-cancel')


    $(@dialog).on 'onClose', _.bind(() ->
      location.reload()
      return
    this)


    return

)