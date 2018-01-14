###*
# Приветственный диалог
###

Crypt.Dialogs.Welcome = () ->

  template: 'welcomeModal'

  ln: Crypt.l18n.Profile

  cookie: 'hideWelcome'

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

    if ( $.cookie(@cookie) || !ShowWelcomeModal )
      return false

    afterRegistration = $.cookie 'afterRegistration'

    $.cookie 'afterRegistration', 'false',
      expires: 5
      path: '/'

    single = EmailConfirmed || HasMyCert
    lang = if afterRegistration == 'true' then @ln.WelcomeModalFirst else @ln.WelcomeModalSecond
    data = _.extend( lang,
      EmailConfirmed: EmailConfirmed
      HasMyCert: HasMyCert
      Single: single
      First: afterRegistration == 'true'
    )

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, data, {wrapCSS:'styled-modal',margin: 0,padding: 0,minHeight: 600})

    @$content = @dialog.$content
    @$checkbox = @$content.find('.js-hide-modal')

    @$checkbox.on 'change', _.bind((e)->
      if ($(e.currentTarget).prop('checked'))
        $.cookie @cookie, 'true',
          expires: 365
          path: '/'
      return
    this)

    $(@dialog).on 'onClose', _.bind(() ->
      @cb.canceled()
      return
    this)

    return

