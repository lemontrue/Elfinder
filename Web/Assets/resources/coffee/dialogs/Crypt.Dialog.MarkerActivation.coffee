###*
# Диалог активации маркера
###

Crypt.Dialogs.MarkerActivation = Crypt.View.extend(

  events:
     'click .js-tabs-title .js-item': 'onTabTitlesClick'
     'keyup .js-auth': 'onAuthChange'
     'keyup .js-pin': 'onEnterPin'
     'keypress .js-new-pin': 'onEnterNewPin'
     'click .js-next': 'onClickNext'
     'click .js-change': 'onClickChange'
     'click .js-back': 'onClickBack'
     'click .js-confirm-decline': 'onConfirmDecline'
     'click .js-cancel-decline': 'onCancelDecline'
     'click .js-cancel': 'onCloseDialog'
     'click .js-print': 'onPrint'
     'click .js-resend': 'resendSms'


  timerTime: 180
  template: 'markerActivation'
  tryCount: 0
  maxTryCount: 5
  activeTab: 0
  canStep2: false
  canClose: true
  isAuth: false
  markerId: ''

  # проксируем локализацию
  ln: Crypt.l18n.MarkerActivation

  initialize: (data,callback) ->
    @cb = callback

    @setDialog()
    @render()

    return

  setDialog: () ->
    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, {}, {
      wrapCSS:'empty-modal'
      beforeClose:  _.bind(() ->
        if @$footer.hasClass 'disabled' then return false

        if @activeTab == 3
          location.reload()
          return false

        @beforeClose()
        return @canClose
      this)
    })

    @setElement(@dialog.$content)

  ###*
  # Рендерим шаблон, кэшируем объекты, запускаем таймер
  ###
  render: ->

    scroll.update()

    @$footer = @$('.js-dialog-footer')

    @$tabsTitlesBlock = @$('.js-tabs-title')
    @$tabsTitles = @$('.js-tabs-title .js-item')

    @$tabs = @$('.js-tab-content')
    @$authFrom = @$('.js-auth')
    @$loginField = @$('.js-login')
    @$passField = @$('.js-pass')
    @$pinField = @$('.js-pin')
    @$phoneForm = @$('.js-phone-confirm')
    @$loader = @$('.js-loader')
    @$changeAuth = @$('.js-change')
    @$resendBtn = @$('.js-resend')
    @$errorBlock = @$('.js-error')
    @$errorRequestBlock = @$('.js-error-request')
    @$timerEl = @$('.js-time')
    @$certInfoEl = @$('.js-cert-info')

    @$printBtn = @$('.js-print')
    @$cancelBtn = @$('.js-cancel')
    @$backBtn = @$('.js-back')
    @$nextBtn = @$('.js-next')
    @$subDialogCancel = @$('.js-sub-dialog-cancel')
    @$subDialogBack = @$('.js-sub-dialog-back')
    @$subDialogChangeAuth = @$('.js-sub-dialog-change-auth')
    @$subDialogConfirmRequest = @$('.js-sub-dialog-confirm-request')

    @$loginField.focus()

    return

  onConfirmDecline: ->
    @unBlockNavigation()
    @onCloseDialog()
    return false

  # закрываем диалог
  onCloseDialog: ->
    if @$footer.hasClass 'disabled' then return false

    @canClose = true
    @dialog.Close()

  # отмена в диалоге подтверждения закрытия
  onCancelDecline: ->
    @Hide @$subDialogCancel
    @unBlockNavigation()
    return

  # диалог подтверждения закрытия
  beforeClose: ->
    if (!@canClose)
      @blockNavigation()
      @Show @$subDialogCancel
    return false

  # на предыдущий щаг
  onClickBack: ->
    if @$footer.hasClass 'disabled' then return false

    @changeTab @activeTab-1
    return false

  # блокируем навигацию в футере и хэдера диалога
  blockNavigation: ->
    @$tabsTitlesBlock.addClass 'disabled'
    @$footer.addClass 'disabled'
    return

  # разблокируем навигацию
  unBlockNavigation: ->
    @$tabsTitlesBlock.removeClass 'disabled'
    @$footer.removeClass 'disabled'
    return

  # клик по переключателям шагов в шапке
  onTabTitlesClick: (e)->
    if @$tabsTitlesBlock.hasClass 'disabled' then return false

    index = @$tabsTitles.index $(e.currentTarget)

    if index == 1
      if @isAuth && @canStep2
        @changeTab (index)
    else
      if @activeTab == 1 && index == 2
        return false
      else
        @changeTab (index)

    return false

  # ввели чтото в поля авторизации маркера
  onAuthChange: (e) ->
    if (@$loginField.val().length && @$passField.val().length)
      @$nextBtn.removeClass 'disabled'
      if Crypt.Helpers.IsEnter(e) then @$nextBtn.trigger 'click'
    else
      @$nextBtn.addClass 'disabled'
    return

  # ввели чтото в пинкод маркера
  onEnterPin: (e) ->
    @$pinField.removeClass 'error'

    if (@$pinField.val().length )
      @$nextBtn.removeClass 'disabled'
      if Crypt.Helpers.IsEnter(e) then @$nextBtn.trigger 'click'
    else
      @$nextBtn.addClass 'disabled'
    return

  # вводим пин на контейнер
  onEnterNewPin: (e) ->
    @hideErrorRequest()
    code = if e.which then e.which else e.keyCode
    return /[0-9]/.test(String.fromCharCode(code))

  # сбрасываем авторизацию
  onClickChange: ->
    @Show @$subDialogChangeAuth
    @blockNavigation()

    @$subDialogChangeAuth.find('.js-confirm-change-auth').off().on 'click', _.bind(->
      @unBlockNavigation()
      @Hide @$subDialogChangeAuth, @$phoneForm, @$changeAuth, @$resendBtn
      @hideError()
      @tryCount = 0
      @isAuth = false
      @canStep2 = false
      @$authFrom.find('input').removeAttr 'disabled'
      @$nextBtn.addClass 'disabled'

      return
    this)
    @$subDialogChangeAuth.find('.js-cancel-change-auth').off().on 'click', _.bind(->
      @unBlockNavigation()
      @Hide @$subDialogChangeAuth
      return
    this)
    return false

  # кнопка продожлить
  onClickNext: ->
    if @$nextBtn.hasClass('disabled') or @$footer.hasClass ('disabled')
      return false

    if @activeTab == 0
      if @isAuth
        if @canStep2
          @changeTab(1)
        else
          @checkCode()
      else
        @loginMarker()

      return false;

    if @activeTab == 1
      @changeTab(2)
      return false

    if @activeTab == 2
      @onSendRequest()
      return false

    if @activeTab == 3
      location.reload()
      return false
    return false

  # меняем активную вкладку
  changeTab: (newTab) ->
    if @activeTab == 3
      return false

    if @activeTab != newTab && ( @activeTab != 0 || ( newTab == 1 && @canStep2 ) )

      if (newTab < @activeTab)
        @Show @$subDialogBack
        @blockNavigation()

        @$subDialogBack.find('.js-confirm-back').off().on 'click', _.bind(->
          @unBlockNavigation()
          @Hide @$subDialogBack
          @activeTab = newTab
          @toggleTab()
          return
        this)
        @$subDialogBack.find('.js-cancel-back').off().on 'click', _.bind(->
          @unBlockNavigation()
          @Hide @$subDialogBack
          return
        this)

      else
        @activeTab = newTab
        @toggleTab()

    else
      return false

    return

  # переключаем вкладку
  toggleTab: () ->
    @$tabsTitles.removeClass 'active'
    @Hide @$tabs

    $(@$tabsTitles[@activeTab-1]).addClass 'done'
    $(@$tabsTitles[@activeTab]).addClass 'active'
    $(@$tabsTitles[@activeTab]).removeClass 'done'

    @Show $(@$tabs[@activeTab])

    @Hide @$backBtn, @$cancelBtn

    @$tabsTitlesBlock.removeClass 'step1 step2 step3'
    @canClose = true


    if @activeTab == 0
      @$nextBtn.text 'Продолжить'
      @Show @$cancelBtn
      @$tabsTitlesBlock.addClass 'step1'
    if @activeTab == 1
      $.fancybox.update()
      @$nextBtn.text 'Все верно, продолжить'
      @Show @$backBtn
      @$nextBtn.removeClass 'disabled'
      @$tabsTitlesBlock.addClass 'step2'
      @canClose = false
    if @activeTab == 2

      $('.tab-pin.js-tab-content').html( _.template($('#tpl-tab-pin').text())()  )

      cuSel({ changedEl: "#savePin", visRows: 500, scrollArrows: false });
      @$nextBtn.text 'Отправить запрос'
      @Show @$backBtn
      @$tabsTitlesBlock.addClass 'step3'
      @canClose = false
      @$('.js-new-pin').val('')

      new Opentip($("#MarkerNewPin_info"), @ln.MarkerNewPin_info);
      new Opentip($("#MarkerPinContainer_info"), @ln.MarkerPinContainer_info);
      Opentip.lastZIndex = 9000;
    if @activeTab == 3
      @$tabsTitlesBlock.addClass 'disabled'
      @canClose = true
      @$nextBtn.text 'ОК'

    return

  # запрос на логин
  loginMarker: ()->
    @blockTabAuth()
    $.ajax
      url: Crypt.Urls.MarkerLogon
      data:
        login: @$loginField.val()
        password: @$passField.val()
      success: _.bind((response) ->
        if response.Error
          switch response.Error.Code
            when 3
              @showError @ln.LogonError
              break
            when 20
              if (response.MarkerStatus == 1)
                @showError @ln.SameErrorCode20.format 'Не отправлен'
              else if (response.MarkerStatus == 2)
                @showError @ln.SameErrorCode20.format 'Отправлен'
              else if (response.MarkerStatus == 3)
                @showError @ln.SameErrorCode20.format 'В обработке'
              else if (response.MarkerStatus == 4)
                @showError @ln.SameErrorCode20.format 'Одобрен'
              else if (response.MarkerStatus == 5)
                @showError @ln.SameErrorCode20.format 'Отклонен'
              else if (response.MarkerStatus == 6)
                @showError @ln.SameErrorCode20.format 'Подтвержден'
              break
            else
              @showError @ln.SameError.format response.Error.Message
              break
          @unBlockTabAuth()
        else
          @hideError()
          @markerId = response.CurrentMarkerId
          switch (response.Status)
            when 0
              @isAuth = true
              @canStep2 = true
              @blockAuth()
              @getCertInfo()
            when 1
              @isAuth = true
              @canStep2 = false
              @$pinField.val()
              @Hide @$resendBtn
              @unBlockTabAuth()
              @needSMS()
            else
              break
        return
      this)
      error: ->
        @unBlockTabAuth()
        return
    return

  # запрос получения инфы о сертификтате
  getCertInfo: ->
    $.ajax
      url: Crypt.Urls.MarkerCertInfo
      data:
        currentMarkerId: @markerId
      success: _.bind((response) ->

        if (response.Status == 0)
          i = response.ShowingInfo
          data =
            name: _.find(i, (el)->
              el.Name == 'SN'
            ) || {}
            surname: _.find(i, (el)->
              el.Name=='G'
            ) || {}
            post: _.find(i, (el)->
              el.Name=='T'
            ) || {}
            address: _.find(i, (el)->
              el.Name=='STREET'
            ) || {}
            company: _.find(i, (el)->
              el.Name=='O'
            ) || {}
            department: _.find(i, (el)->
              el.Name=='OU'
            ) || {}
            city: _.find(i, (el)->
              el.Name=='L'
            ) || {}
            region: _.find(i, (el)->
              el.Name=='S'
            ) || {}
            country: _.find(i, (el)->
              el.Name=='C'
            ) || {}
            email: _.find(i, (el)->
              el.Name=='E'
            ) || {}
            inn: _.find(i, (el)->
              el.Name=='ИНН'
            ) || {}
            ogrnip: _.find(i, (el)->
              el.Name=='ОГРНИП'
            ) || {}
            ogrn: _.find(i, (el)->
              el.Name=='ОГРН'
            ) || {}
            snils: _.find(i, (el)->
              el.Name=='СНИЛС'
            ) || {}
            KeyUsage: _.find(i, (el)->
              el.Name=='KeyUsage'
            ) || {}
            EnhancedKeyUsage: _.find(i, (el)->
              el.Name=='EnhancedKeyUsage'
            ) || {}
            CertificatePolicies: _.find(i, (el)->
              el.Name=='CertificatePolicies'
            ) || {}
          data = _.each(data,(el,i)->
            if (!!el && !!el.Value)
              el.Text = el.Value
            else
              el.Text = ''
            return
          )
          log(data)
          @certInfo = {
            name: data.name.Text + ' ' + data.surname.Text
            post: data.post.Text
            address: data.address.Text
            company: data.company.Text + data.department.Text
            city: data.city.Text
            region: data.region.Text + ', ' + data.country.Text
            email: data.email.Text
            inn: data.inn.Text
            ogrn: data.ogrn.Text
            ogrnip: data.ogrnip.Text
            snils: data.snils.Text
            KeyUsage: if data.KeyUsage.Text then data.KeyUsage.Text.replace(/,/g, ', ') else ''
            EnhancedKeyUsage: data.EnhancedKeyUsage.Text

          }
          log(@certInfo)
          if (@certInfo.name.length > 25)
            @certInfo.name =  @certInfo.name.substr(0, 25) + '...'
          template = $('#tpl-markerCertInfo').text()
          @$certInfoEl.html( _.template(template)(@certInfo) )

          @printText = _.template(template)(@certInfo)

          @unBlockTabAuth()
          @changeTab(1)

        else if (response.Status == 3)
          @loginMarker()
        return
      this)
      error: ->
        @unBlockTabAuth()
        return
    return

  onPrint: ->
    newWin = window.open("about:blank", "Print certificate info ");
    newWin.document.write( _.template($('#tpl-markerCertInfo-print').text())() )
    newWin.document.write( @printText );

    newWin.print();
    return false

  # блокируем авторизационные поля
  blockAuth: ->
    @Show @$changeAuth
    @$authFrom.find('input').attr('disabled','disabled')

  # показываем ошибку на первой вкладке
  showError: (text) ->
    @Show @$errorBlock.html(text)

  # скрываем ошибку
  hideError: ->
    @Hide @$errorBlock
    @$('.js-new-pin').removeClass 'error'

  # показываем ошибку на третьей вкладке
  showErrorRequest: (text) ->
    @Show @$errorRequestBlock.html(text)
    @$('.js-new-pin').addClass 'error'

  # скрываем ошибку на третьей вкладке
  hideErrorRequest: ->
    @Hide @$errorRequestBlock

  # блокиреуем авторизацию
  blockTabAuth: () ->
    @$nextBtn.addClass 'disabled'
    @Show @$loader

  # разблокируем авторизацию
  unBlockTabAuth: ->
    if !@isAuth
      @$nextBtn.removeClass 'disabled'
    @Hide @$loader

  # нужно подтв по смс, настраиваем диалог
  needSMS: ->
    @blockAuth()
    @Show @$phoneForm
    @$pinField.focus()
    @activeTimer()

  # таймер на смс подтверждение
  activeTimer: ->
    @timer = new Crypt.Timer()
    @timer.Init(
      {
        el: @$timerEl
        startTime: @timerTime
      }
      {
        end: _.bind(->


          return
        this)
        canResend: _.bind(->
          @Show @$resendBtn
          return
        this)
      }
    )

  ###*
  # Запрашиваем новый пин
  ###
  resendSms: () ->

    if ( @tryCount >= @maxTryCount )
      @timer.Stop()
      @showError @ln.MaxTryCountError
      @$nextBtn.addClass 'disabled'
      return false

    @tryCount++

    $.ajax
      url: Crypt.Urls.MarkerResendSms
      data:
        currentMarkerId: @markerId
      success: _.bind((response) ->
        @Hide @$resendBtn
        @timer.Start()
        @$nextBtn.removeClass 'disabled'
        @$pinField.removeClass('error').val('').focus()
        @hideError()
        return
      this)
      error: _.bind(->
        return
      this)
    return false

  ###*
  # Проверяем введенный пин
  ###
  checkCode: () ->

    if (@timer.isEnd)
      @showError 'Срок действия кода истек!'
      @$nextBtn.addClass 'disabled'
      return false

    @$nextBtn.addClass 'disabled'

    $.ajax
      url: Crypt.Urls.MarkerCheckSms
      data:
        pin: @$pinField.val()
        currentMarkerId: @markerId
      success: _.bind((response) ->

        if (response.Status == 0 && response.Error == null)
          @markerId = response.CurrentMarkerId
          @canStep2 = true
          @Hide @$phoneForm
          @getCertInfo()
        else
          if response.Error.Code == 9
            @showError "Неверный код"
            @$pinField.addClass 'error'
          else
            @showError @ln.SameError.format response.Error.Message

        return
      this)
      error: _.bind(->
        @showError "Произошла ошибка, попробуйте повторить запрос позднее"
        return
      this)
    return

  # хотим запросить сертификат
  onSendRequest: ->
    if ( !@validateRequest() )
      return false

    @blockNavigation()

    if ( @$('.js-send-sms').is(':checked') || @$('.js-send-email').is(':checked') )
      @Show @$subDialogConfirmRequest
      if (@$('.js-send-sms').is(':checked') && @$('.js-send-email').is(':checked'))
        $('.js-confirm-request-text').html @ln.PinBySMSandEmail
      else
        $('.js-confirm-request-text').html if @$('.js-send-sms').is(':checked') then @ln.PinBySMS else @ln.PinByEmail

      @$subDialogConfirmRequest.find('.js-confirm-request').off().on 'click', _.bind(->
        @Hide @$subDialogConfirmRequest
        @SendRequest()
        return
      this)
      @$subDialogConfirmRequest.find('.js-cancel-request').off().on 'click', _.bind(->
        @unBlockNavigation()
        @Hide @$subDialogConfirmRequest
        return
      this)
    else
      @SendRequest()

    return false


  # послыаем запрос
  SendRequest: ->

    Crypt.Preloader.Block($('.modal-markerActivation'))
    if (@validateRequest())
      $.ajax
        url: Crypt.Urls.MarkerSendRequest
        data:
          currentMarkerId: @markerId
          login: @$loginField.val()
          password: @$passField.val()
          pin: @$('.js-new-pin').val()
          SavePIN: false
          SendSMS: @$('.js-send-sms').is(':checked')
          SendEmail: @$('.js-send-email').is(':checked')
        success: _.bind((response) ->
          @unBlockNavigation()
          @$('.js-dialog-body').html @ln.SuccessRequest
          @activeTab = 3
          @toggleTab()
          Crypt.Preloader.UnBlock($('.modal-markerActivation'))
          return
        this)
        error: _.bind(->
          Crypt.Preloader.UnBlock($('.modal-markerActivation'))
          return
        this)
    return

  # проверяем поля для запроса на сертификат
  validateRequest: ->

    @hideErrorRequest()

    if ( @$('.js-new-pin').val().length != 8 )
      @showErrorRequest @ln.PinLength
      return false

    if ( !/[0-9]/.test(@$('.js-new-pin').val()) )
      @showErrorRequest @ln.PinNumbers
      return false

    return true

)