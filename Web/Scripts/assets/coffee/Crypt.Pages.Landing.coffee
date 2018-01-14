Crypt = window.Crypt or {}


Crypt.Pages.Landing = _.extend(Crypt.Pages,

  checkPinCount : 0
  fancyboxRedirect: true

# настроки подсказки для город (todo может вынести глобально?)
  regTipOptions:
    tipJoint: "left"
    background: '#fff5d2'
    borderRadius: 4
    borderWidth: 1
    borderColor: '#fee8ae'

# проксируем локализацию
  ln: Crypt.l18n.Login

  initialize: ->

    @$error = $('.error-mess')
    @$registration = $('.js-registration-form')
    @$feedback = $('.js-feedback, .js-float-feedback')
    @$registrationBox = $('.js-registration-box')
    @$showRegistration = $('.js-show-registration')
    @$login1 = $('#login1')
    @$kobilButton = $('#kobilButton')
    @$password = $('#password')
    @$pinCode = $('#pinCode')
    @$kobilLogin2 = $('#kobilLogin')
    @$fixedHeader = $('.js-fixed-header')
    @$eye = $('.js-eye')

    @render()

    return

  render: ->
    if $.cookie('haveAccount') == "true"
      location.href = Crypt.Urls.Login
      return false
    else
      $('.js-app-landing').removeClass 'hidden'

    @$registration.validate _.extend(
      Crypt.Config.Forms.Registration
      submitHandler: _.bind(->
        if $('.js-onRegistration').hasClass('disabled')
          return false
        Crypt.Preloader.Block @$registrationBox
        @checkRegPhone()
        false
      this)
    )

    #todo а надо ли оно?
    @$registration.submit ->
      return false

    Crypt.Helpers.PhoneMask($("input.js-phone"))

    @initSlider()

    new Opentip($(".js-registrationCity-tip"), @ln.AutoCity, '', this.regTipOptions)

    @onEvents()

  onEvents: ->

    $(window).scroll ->
      $('.js-fixed-header').toggleClass('i-fixed', $(window).scrollTop() > 0 )
      $('.js-scrollUp').toggleClass('show', $(window).scrollTop() > 550 )
      $('.js-float-feedback').toggleClass('show', $(window).scrollTop() > 550 )

      return

    @$showRegistration.click _.bind(->
      Crypt.scrollTo @$registration
      return false
    this)

    $('.js-scrollUp').click _.bind(->
      Crypt.scrollTo $('.js-app-landing'), 300
      return false
    this)

    @$eye.on 'click', _.bind(->
      if (!@$eye.hasClass('active'))
        @$eye.addClass('active').siblings('input').attr('type', 'text')
      else
        @$eye.removeClass('active').siblings('input').attr('type', 'password')
      return false
    this)


    @$registration.find('input').on 'focusout keypress', ->
      self = this
      form = $(self).closest('form')
      setTimeout (->
        errors = !!form.find('input.error').length
        empty = false
        form.find("input").each (i,e) ->
          if $(e).val() == ''
            empty = true
        $('.js-onRegistration').toggleClass 'disabled', errors || empty
        return
      ), 200

    $('.js-city-search').autocomplete
      serviceUrl: '/registration/CityAutocomplete'
      paramName: "pattern"
      minChars: 3
      dataType: 'json'
      transformResult: (response) ->
        { suggestions: $.map(response.Cities, (Item) ->
          {
          value: Item
          }
        ) }


    @$feedback.on 'click', ->
      t = new Crypt.Dialogs.Feedback()
      t.initialize()

    return

  onScroll: ->
    isTop = $("body").scrollTop() == 0
    isFixed = @$fixedHeader.hasClass 'i-fixed'
    if isTop && isFixed
      @$fixedHeader.removeClass 'i-fixed'
    if !isTop && !isFixed
      @$fixedHeader.addClass 'i-fixed'
    #@$fixedHeader.toggleClass('i-fixed', $("body").scrollTop() > 0 )

    return

  # SLIDER on landing
  initSlider: ->
    el = $('.jcarousel')

    el.jcarousel({
      wrap: 'both'
    })


    el.on('jcarousel:scrollend', (event, carousel) ->
      tab = el.jcarousel('target').data('tab')
      $('.js-slider-related.js-fiz').toggleClass 'hidden', tab!=1
      $('.js-slider-related.js-biz').toggleClass 'hidden', tab==1
    )

    $('.jcarousel-control-prev').jcarouselControl target: '-=1'
    $('.jcarousel-control-next').jcarouselControl target: '+=1'

    $('.jcarousel-pagination').on('jcarouselpagination:active', 'li', ->
      $(this).addClass 'active'
      return
    ).on('jcarouselpagination:inactive', 'li', ->
      $(this).removeClass 'active'
      return
    ).jcarouselPagination 'item': (page, carouselItems) ->
      '<li><a href="#' + page + '">' + $(carouselItems).data('title') + '</a></li>'

  # чистим телефон от мусора
  getRegPhone: ->
    Number($('input[name=Phone]').val().replace(/\D+/g,""))

  # вывод серверных ошибок при реге
  showRegistrationError: (error) ->
    new Crypt.Dialog().Open('blankError', {title:'Ошибка!',text:error.Message})
    return

  submitRegForm:  ->
    $.ajax
      url: '/registration'
      data:
        'Model.Phone': @getRegPhone()
        'Model.FIO': $('input[name=FIO]').val()
        'Model.City': $('input[name=City]').val()
        'Model.Email': $('input[name=Email]').val()
        'Model.Password': $('input[name=Password]').val()
      success: _.bind((response) ->
        if ( response.Error )
          @showRegistrationError(response.Error)
          Crypt.Preloader.UnBlock @$registrationBox
        else
          $.cookie 'afterRegistration', 'true',
            expires: 5
            path: '/'
          $.cookie 'logined', true,
            expires: 365
            path: '/'
          location.href = Crypt.Urls.Profile
        return
      this)
      error: _.bind(->
        new Crypt.Dialog().Open( 'blankCentered', @ln.ErrorReg )
        Crypt.Preloader.UnBlock @$registrationBox
        return
      this)
    return


  ###*
    Поднимаем диалог подтверждения телефона
  ###
  checkRegPhone: ()->

    RegPhoneConfirm = new Crypt.Dialogs.RegPhoneConfirm()

    RegPhoneConfirm.initialize(
      @getRegPhone(),
      @$registrationBox.find('input[name=Email]').val()
      {
        success: _.bind(->
          @submitRegForm()
          return
        this)
        canceled: _.bind(->
          Crypt.Preloader.UnBlock @$registrationBox
          return
        this)
        error: _.bind(->
          new Crypt.Dialog().Open( 'blankCentered', @ln.ErrorReg )
          Crypt.Preloader.UnBlock @$registrationBox
          return
        this)
      }
    )
    return
)

Crypt.Pages.Landing.initialize()