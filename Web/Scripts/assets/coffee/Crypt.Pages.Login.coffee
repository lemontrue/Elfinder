Crypt = window.Crypt or {}


Crypt.Pages.Login = _.extend(Crypt.Pages,

  checkPinCount : 0
  fancyboxRedirect: true

# проксируем локализацию
  ln: Crypt.l18n.Login

  initialize: ->

    this.ln = Crypt.l18n.Login

    @$error = $('.error-mess')
    @$normalLogin = $('#normalLogin')
    @$kobilLogin = $('#TaxnetId')
    @$tabsTitles = $('#login .titles .title')
    @$login1 = $('#login1')
    @$kobilButton = $('#kobilButton')
    @$password = $('#password')
    @$pinCode = $('#pinCode')
    @$kobilLogin2 = $('#kobilLogin')

    @render()

  render: ->
    @$login1.val($.cookie('email')).focus()
    @$kobilLogin2.val $.cookie('email')
    @$pinCode.val ''
    @$showRegistration = $('.js-show-registration')

    $('#retUrl').val Crypt.Urls.retUrl.replace('&amp;', '&')

    if $.cookie('initTab') == 'normal'
      @showNormalLogin()

    if $.cookie('initTab') == 'kobil'
      @showKobilLogin()

    @onEvents()

  onEvents: ->


    @$showRegistration.on 'click', ->
      $.cookie 'haveAccount', null,
        path: '/'
      return true

    # todo вкладки отдельно замутить когданить
    @$tabsTitles.click _.bind(->
        tab = $(this).data('tab')
        @$tabsTitles.removeClass 'active'
        $(this).addClass 'active'
        $('.tabs').hide()
        $('#tab-' + tab).show()
        return
      this)

    $('body').keypress _.bind((e) ->

      if e.keyCode == 13
        id = e.target.id
        Crypt.Preloader.Block($('.login-area'))
        if e.target != null
          if id != 'pinCode' and id != 'kobilLogin'
            @getGuid()
          if id == 'kobilLogin'
            @kobilLogin()
        else if e.target != null
          if id != 'pinCode' and id != 'kobilLogin'
            @getGuid()
          if id == 'kobilLogin'
            @kobilLogin()
        e.preventDefault()
      return
    this)


    $('#clickButton').click _.bind(->
      Crypt.Preloader.Block($('.login-area'))
      login = @$login1.val()
      password = @$password.val()
      if login == '' and password == ''
        @$password.addClass 'error'
        @$login1.addClass 'error'
        @showError 'Введите E-mail и пароль!'
        Crypt.Preloader.UnBlock($('.login-area'))
      else
        @getGuid()
      return
    this)

    $('#kobilButton').click _.bind(->
      @kobilLogin()
      return
    this)

    $('.js-show-normal-login').on 'click', _.bind(->
      @showNormalLogin()
      return
    this)

    $('.js-show-kobil-login').on 'click', _.bind(->
      @showKobilLogin()
      return
    this)

    return

  loginCookie: (name,val,time,path) ->
    $.cookie name, val,
      expires: if time then time else 365
      path: if path then path else '/'

  showNormalLogin: (email) ->
    @$error.hide()
    @$normalLogin.show()
    @$kobilLogin.hide()
    if email != undefined
      @$login1.val email
      @$password.addClass 'error'
    @$tabsTitles.removeClass('active').filter('[data-tab="login"]').addClass 'active'
    return

  showKobilLogin:  ->
    @$error.hide()
    @$normalLogin.hide()
    @$kobilLogin.show()
    @$tabsTitles.removeClass('active').filter('[data-tab="taxnet"]').addClass 'active'
    return

  showError:  (text) ->
    @$error.html(text).show()

  kobilLogin: ->
    @$kobilButton.attr 'disabled', 'true'
    if @$kobilLogin2.val() != ''
      $.ajax
        url: Crypt.Urls.KobilLogin
        data: login: @$kobilLogin2.val()
        success: _.bind((result) ->
          if result.errorMsg && result.errorMsg != null 
            if result.errorCode == 4 or result.errorCode == 5
              @showNormalLogin @$kobilLogin2.val()
              $('#clickButton').removeAttr 'disabled'
            Crypt.Preloader.UnBlock($('.login-area'))
            @showError result.errorMsg
            @$kobilButton.removeAttr 'disabled'
            return
          if result.pin == 2
            @loginCookie 'initTab', 'kobil'
            @showKobilWindow result.KobilTransactionWaitingTime, result.KobilPollingTime, 'kobilLogin'
          else if !result.KobilAuthEnabled
            @showNormalLogin()
            Crypt.Preloader.UnBlock($('.login-area'))
            @showError 'Отключен вход по TaxnetId'
            $('#clickButton').removeAttr 'disabled'
          @$kobilButton.removeAttr 'disabled'
          return
        this)
        error: (request, error, result) ->
          Crypt.Preloader.UnBlock($('.login-area'))
          wnd = window.open('about:blank', '_blank', 'height:100;width:100')
          wnd.document.write request.responseText
          $('#clickButton').removeAttr 'disabled'
          false
    else
      Crypt.Preloader.UnBlock($('.login-area'))
      @$kobilButton.removeAttr 'disabled'
      @showError 'Введите E-mail'
      @$kobilLogin2.addClass 'error'
    return

  getGuid:  ->


    loignDialog = new Crypt.Dialogs.Login()

    loignDialog.initialize(
      {
        login1: @$login1.val()
        password: @$password.val()
      },
      {
        success: _.bind((response)->
          @loginCookie 'initTab', 'normal'
          if $('#saveEmailNormal').prop('checked')
            @loginCookie 'email', @$login1.val()
          $.cookie 'haveAccount', true,
            expires: 365
            path: '/'
          $.cookie 'logined', true,
            expires: 365
            path: '/'

          if (response.redirect == undefined)
            location.href = response
          else
            location.href = response.redirect
          return
        this)
        kobil: _.bind((result)->
          Crypt.Preloader.UnBlock($('.login-area'))
          @loginCookie 'initTab', 'kobil'
          @showKobilWindow result.KobilTransactionWaitingTime, result.KobilPollingTime, 'normalLogin'
        this)
        error: _.bind((response) ->
          Crypt.Preloader.UnBlock($('.login-area'))
          if response.errorCode == 4
            @$password.addClass 'error'
          @showError response.errorMsg
          @activeSubmit
        this)
        canceled: ->
          Crypt.Preloader.UnBlock $('.login-area')
      }
    )
    return

  showKobilWindow:  (time, pollingTime, sender) ->
    @loginCookie 'email', @$login1.val()
    startTime = new Date(new Date(1, 1).setSeconds(time))
    timeDiv = $('#kobil .time').text(getDateFormat(startTime))
    checkInterval = pollingTime * 1000
    stopCheckKobil = false
    stopTimeKobil = false

    kobil = ->
      $.ajax
        url: Crypt.Urls.CheckKobil
        data: retUrl: $('#retUrl').val()
        success: _.bind((response) ->
            if typeof response.Status == 'undefined'
              if response.message
                console.log response.message
              alert 'Произошла неизвестная ошибка'
              location.href = Crypt.Urls.Login
            else if response.Status == 1
              if sender == 'normalLogin'
                if $('#saveEmailNormal').prop('checked')
                  @loginCookie 'email', $login1.val()
              if sender == 'kobilLogin'
                if $('#saveEmailKobil').prop('checked')
                  @loginCookie 'email', $kobilLogin2.val()
              $.cookie 'haveAccount', true,
                expires: 365
                path: '/'
              $.cookie 'logined', true,
                expires: 365
                path: '/'
              location.href = response.redirect
            else if response.Status == 2
              if response.message
                console.log response.message
              $('#kobil .result').show()
              $('#kobil .error').show().text 'В авторизации отказано!'
              $('#kobil .row-loader').hide()
              $('#close-text').show()
              stopTimeKobil = true
              stopCheckKobil = true
            else
              if !stopCheckKobil
                setTimeout kobil, checkInterval
            return
          this)
        error: (response) ->
          console.log response
          location.href = Crypt.Urls.Login
          return
      return

    checkTime = ->
      obj = $('#kobil .time')
      date = getDate($(obj).text())
      if date.getMinutes() == 0 and date.getSeconds() == 0
        $('#kobil .result').show()
        $('#kobil .error').show().text 'Данные не были подтверждены!'
        $('#kobil .row-loader').hide()
        $('#close-text').show()
        stopCheckKobil = true
      else
        date = new Date(date.getTime() - 1000)
        $(obj).text getDateFormat(date)
        if !stopTimeKobil
          setTimeout checkTime, 1000
      return

    $('#kobil .text-center a').click (e) ->
      e.preventDefault()
      $.fancybox.close()
      return

    $.fancybox.open '#kobil',
      afterClose: ->
        location.href = Crypt.Urls.CancelKobil + '?retUrl=' + $('#retUrl').val()
        return
      helpers: overlay: closeClick: false

    setTimeout checkTime, 1000

    setTimeout kobil, checkInterval

    return


)

Crypt.Pages.Login.initialize()