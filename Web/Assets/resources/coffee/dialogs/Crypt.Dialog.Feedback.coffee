###*
# Диалог обратной связи
###

Crypt.Dialogs.Feedback = () ->

  closeAfter: 3000
  template: 'feedback'
  valid: true


  ###*
  # Запускаем диалог
  ###
  initialize: (options, callback) ->
    @cb = callback

    @render()

    return

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: ->

    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {},{
      wrapCSS: 'modern-modal'
    })

    @$content = @dialog.$content
    @$title = @$content.find('.js-dialog-title')
    @$body = @$content.find('.js-dialog-body')
    @submitBtn = @$content.find('.js-submit')
    @$fields = @$content.find('.js-field')
    @$name = @$content.find('.js-name')
    @$phone = @$content.find('.js-phone')
    @$email = @$content.find('.js-email')
    @$message = @$content.find('.js-message')

    Crypt.Helpers.MaskPhone($("input.js-phone"))

    @setActions()
    return

  ###*
  # Навешиваем обработчики
  ###
  setActions: () ->

    @submitBtn.on 'click', _.bind(()->
      @onSubmit()
      return
    this)

    @$fields.on 'keypress', _.bind((e)->
      @hideError(e)
      return
    this)

    @$fields.on 'keyup blur', _.bind(()->
      @submitBtn.toggleClass 'i-disabled', !@liveValidate()
      return
    this)

    return

  onSubmit: () ->
    if (@submitBtn.hasClass('disabled'))
      return false

    Crypt.Preloader.Block @$content
    @submitBtn.addClass('disabled')

    if ( !@validate() )
      @submitBtn.removeClass('disabled')
      Crypt.Preloader.UnBlock @$content
    else
      $.ajax
        url: Crypt.Urls.SendToSupport
        data:
          name: @$name.val()
          phone: @$phone.val()
          email: @$email.val()
          message: @$message.val() 
        success: _.bind((response) ->
          if response && response.Status == 0
            @onSuccess()
          else
            @onFail()
          return
        this)
        error: _.bind(->
          @onFail()
          return
        this)
    return

  validate: () ->
    if (!@$email.val().length && !@$phone.val().length ) then @showError @$phone, 'Заполните поле Телефон или E-mail!<br>Иначе как же мы с Вами свяжемся?'
    if (!@$message.val().length ) then @showError @$message, 'Введите Ваше сообщение! Если Вам действительно есть о чем с нами поговорить.'

    return @valid

  liveValidate: ->
    if (!@$email.val().length && !@$phone.val().length ) then return false
    if (!@$message.val().length ) then return false
    return true

  showError: (el,message) ->
    el.parent().append '<label for="" class="error">' + message + '</label>'
    @valid = false
    return

  hideError: (e) ->
    $(e.currentTarget).parent().find('label.error').remove()
    @valid = true
    return

  onFail: ->
    Crypt.Preloader.UnBlock @$content
    @submitBtn.removeClass('disabled')
    Crypt.Dialogs.BaseTemporary().initialize text: Crypt.l18n.Feedback.Error


  onSuccess: ->
    Crypt.Dialogs.BaseTemporary().initialize text: Crypt.l18n.Feedback.Success
