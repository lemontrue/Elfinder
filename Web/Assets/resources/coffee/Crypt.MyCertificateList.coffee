###*
# Created by Kirill on 5/4/2015.
###

checkSetPin = ->
  setpin = $.find('#setPin')
  error = $(setpin).parent().find('.info.error')
  if $(setpin).val() == ''
    $(setpin).addClass 'error'
    return false
  else if !/^[0-9]+$/.test($(setpin).val())
    $(error).show()
    $(setpin).addClass 'error'
    return false
  true

checkChangePinForm = ->
  result = true
  newPin = $.find('#newPin')
  newPinConfirm = $.find('#newPinConfirm')
  oldPin = $.find('#oldPin')
  cntrLabelnewPinErr = $(newPin).parent().find('.info.error').hide()
  cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find('.info.error')
  if $(newPin).val() == ''
    $(newPin).addClass 'error'
    result = false
  if !/^[0-9]+$/.test($(newPin).val())
    $(cntrLabelnewPinErr).show()
    $(newPin).addClass 'error'
    result = false
  if $(oldPin).val() == ''
    $(oldPin).addClass 'error'
    result = false
  if $(newPinConfirm).val() == ''
    $(newPinConfirm).addClass 'error'
    result = false
  else if $(newPinConfirm).val() != $(newPin).val()
    $(cntrLabelnewPinConfirmErr).show()
    $(newPinConfirm).addClass 'error'
    result = false
  result

showSetPinModal = (id, user2Cert) ->
  w = $('#modal #' + id)
  if w[0]
    $(w).find('input[type=hidden]').val user2Cert
    w.show()
    w.parent().show()
  clearPinFields()
  return

showModal = (id) ->
  w = $('#modal #' + id)
  if w[0]
    w.show()
    w.parent().show()
  return

hideModal = (id) ->
  w = $('#modal #' + id)
  if w[0]
    $(w).find('input[type=hidden]').val ''
    w.hide()
    w.parent().hide()
  return

clearPinFields = ->
  $('#newPin').val ''
  $('#newPinConfirm').val ''
  $('#oldPin').val ''
  $('#setPin').val ''
  return

changePin = (me) ->
  if !me
    return
  form = $(me).parent().parent()
  oldPin = $.find('#oldPin')
  cntrLabelOldPinErr = $(oldPin).parent().find('.info.error')
  user2CertHid = form.parent().find('input[type=hidden]')
  if checkChangePinForm()
    $.ajax(
      url: Crypt.Urls.CertList.ChangePin
      type: 'POST'
      data:
        newPin: $('#newPin').val()
        oldPin: $('#oldPin').val()
        user2Cert: $(user2CertHid).val()
        userId: $('#UserId').val()).always (resp) ->
          if resp.success
            $(user2CertHid).val ''
            hideModal 'change-pin2'
            clearPinFields()
          else if resp.errorOldPin
            $(cntrLabelOldPinErr).show()
            $(oldPin).addClass 'error'
          else if resp.redirectUrl
            location.href = resp.redirectUrl
          else
            window.console and window.console.log and window.console.log(resp.exception)
            alert resp.message
          return
  return

deletePin = (usercert) ->
  if !usercert
    return
  certId = usercert
  $.ajax(
    url: Crypt.Urls.CertList.DeletePin
    type: 'POST'
    data:
      user2Cert: certId
      userId: $('#UserId').val()).always (resp) ->
        if resp.success
          _.each certificates.certs, (el) ->
            if el.MyCertificate.Id == certId
              el.MyCertificate.HasPIN = false
            return
          reRenderCertificates()
        else if resp.redirectUrl
          location.href = resp.redirectUrl
        else
          window.console and window.console.log and window.console.log(resp.exception)
          alert resp.message
        return
  false

setPinMethod = (me) ->
  if !me
    return
  form = $(me).parent().parent()
  setpin = form.find('#setPin')
  user2CertHid = form.parent().find('input[type=hidden]')
  if checkSetPin()
    $.ajax(
      url: Crypt.Urls.CertList.SetPin
      type: 'POST'
      data:
        newPin: $(setpin).val()
        user2Cert: $(user2CertHid).val()
        userId: $('#UserId').val()).always (resp) ->
          if resp.success
            _.each certificates.certs, (el) ->
              if el.MyCertificate.Id == $(user2CertHid).val()
                el.MyCertificate.HasPIN = true
              return
            $(user2CertHid).val ''
            hideModal 'change-pin'
            clearPinFields()
            reRenderCertificates()
          else if resp.redirectUrl
            location.href = resp.redirectUrl
          else
            window.console and window.console.log and window.console.log(resp.exception)
            alert resp.message
          return
  return

#Проверяем не вернул ли сервер ошибку и инициализируем поля

checkResult = (resp) ->
  if resp.redirectUrl
    location.href = resp.redirectUrl
  scroll.update()
  initCertificateList()
  return

initCertificateList = ->
  $('#certificats-list').find('input[type=text]').each (ind, el) ->
    data = $(el).val()
    a = $(el).parent().find('a.small-text:first')
    hid = $(el).parent().find('input[type=hidden]:first')

    saveHandler = ->
      name = $(el).val()
      id = $(hid).val()
      $.ajax(
        url: Crypt.Urls.CertList.SaveCertFriendlyName
        type: 'POST'
        data:
          name: name
          certId: id
          userId: $('#UserId').val()).always (resp) ->
            if resp.success
              if $(el).val() == ''
                $(el).removeAttr 'disabled'
                $(a).hide()
              else
                changeState()
                data = name
            else if resp.redirectUrl
              location.href = resp.redirectUrl
            else
              window.console and window.console.log and window.console.log(resp.exception)
              alert resp.message
            return
      false

    defState = ->
      saveState()
      $(a).hide()
      return

    saveState = ->
      $(el).removeAttr 'disabled'
      $(a).text 'Сохранить'
      $(a).show()
      $(a).off('click').click saveHandler
      false

    changeState = ->
      $(el).attr 'disabled', 'disabled'
      $(a).text 'Изменить'
      $(a).show()
      $(a).off('click').click saveState
      false

    $(el).keyup (e) ->
      if e.keyCode == 13
        saveHandler()

      ###if ($(el).val() != "") saveState();
       else defState();
      ###

      if $(el).val().length > 0
        saveState()
      else
        if data.length == 0
          $(a).hide()
      return
    if $(el).val() == ''
      defState()
    else
      changeState()
    return
  return

$ ->
  $('.js-get-marker').on 'click', ->
    (new (Crypt.Dialog)).Open 'blankInform',
      title: 'Вы уже отправляли запрос<br>на получение маркера'
      text: 'Ожидайте звонка нашего менеджера,<br>он свяжется с Вами в ближайшее время.<br><br>С уважением, команда Cryptogramm'
    return

  ###*
  # Дата на русском. пока только в формате DD month YYYY
  # @param d - UNIX Timestamp
  # @returns {string}
  ###

  ruDate = (d) ->
    date = new Date(d)
    date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth() + 1] + ' ' + date.getFullYear()

  templateCerts = $('#tpl-certListItem').text()
  templateRequests = $('#tpl-requestListItem').text()
  first = true
  green = 0
  red = 0
  certificates = _.each(window.certificates.certs, (Item) ->
    Item.NotBefore = Crypt.Helpers.ExtractTimestamp(Item.NotBefore)
    Item.NotAfter = Crypt.Helpers.ExtractTimestamp(Item.NotAfter)
    Item
  )
  requests = _.each(window.requests.requests, (Item) ->
    if Item.Status == 'Не отправлен (запрос на сертификат не отправлялся абонентом)'
      Item.StatusCode = 1

    if Item.Status == 'В обработке (запрос обрабатывается)'
      Item.StatusCode = 3

    if Item.Status == 'Отклонен (запрос на сертификат отклонен)'
      Item.StatusCode = 5

    if Item.Status == 'Одобрен (сертификат выпущен)'
      Item.StatusCode = 4

    if Item.Status == 'Подтвержден (абонент подтвердил получение сертификата)'
      Item.StatusCode = 6

    if Item.Status == 'Отправлен (запрос отправлен на сервер)'
      Item.StatusCode = 2


    if Item.StatusCode == 4
      green++
    if Item.StatusCode == 5
      red++

    if (Item.Name.length > 30)
      Item.Name =  Item.Name.substr(0, 30) + '...'
    Item.CreationTime = Crypt.Helpers.ExtractTimestamp(Item.CreationTime)
    Item
  )

  if green > 0 && $.cookie('requestConfirmedHide') != '1'

    (new (Crypt.Dialog)).Open('blankInfo3', text: 'Один из ваших запросов ожидает подтверждения. Вы сможете выполнить операцию подтверждения в любое удобное для Вас время в Вашем профиле, но помните, что до тех пор, пока выпуск сертификата не подтвержден, Вы не сможете им воспользоваться!',{
      beforeClose:  _.bind(() ->
        $('.js-request-list').click();
      this)
    })

  $('body').on('change','#requestConfirmHide',()->
    if ($('#requestConfirmHide').prop('checked'))
      $.cookie 'requestConfirmedHide', 1,
        expires: 365
        path: '/'
    else
      $.cookie 'requestConfirmedHide', 0,
        expires: 365
        path: '/'
  )
  log(requests)
  if green
    $('.js-request-list').append '&nbsp;<span class="green">' + green + '</span>'
  if red
    $('.js-request-list').append '&nbsp;<span class="red">' + red + '</span>'

  window.reRenderCertificates = () ->

    tabActive = $('.filter .js-tabs').find('li.active').data('val') == 'active'
    isRequests = $('.filter .js-tabs').find('li.active').data('val') == 'requests'

    if isRequests
      $('#chb-withpin').prop('checked', false)
      $('#chb-test').prop('checked', false)

    pin = $('#chb-withpin').prop('checked')
    test = $('#chb-test').prop('checked')

    data = if isRequests then requests else certificates
    template = if isRequests then templateRequests else templateCerts
    sort = if isRequests then $('#sel-sort-requests').val() else $('#sel-sort-certs').val()
    sort = sort.split('_')
    if data

      if sort.length == 2
        Crypt.Helpers.SortBy data, sort[0], sort[1]
      if data.length
        data = _.filter(data, (el) ->
          byPin = true
          byTest = true
          byActive = true
          if pin
            byPin = el.MyCertificate.HasPIN
          if test
            byTest = el.IsTest
          if tabActive
            byActive = el.NotAfter > Date.now()
          if !isRequests then byPin and byTest and byActive else true
        )
    if data
      $('#certificats-list .certificats-list').html _.template(template)(Items: data)
      $('.js-sort-select').addClass 'hidden'
      if isRequests
        $('.js-chb-sort').addClass 'hidden'
        $('.js-sort-select').filter('.i-requests').removeClass 'hidden'
        regTipOptions =
          tipJoint: 'left'
          background: '#fff5d2'
          borderRadius: 4
          borderWidth: 1
          borderColor: '#fee8ae'
        $('.js-tip-download-request').each (i, el) ->
          new Opentip($(el), Crypt.l18n.Profile.MyCertificateList.DownloadRequestTip, '', regTipOptions)
          Opentip.lastZIndex = 9000
          return
      else
        $('.js-sort-select').filter('.i-certificates').removeClass 'hidden'
        $('.js-chb-sort').removeClass 'hidden'
    if first
      if data and data.length
        $('.js-scrollList').removeClass 'hidden'
        $('.js-emptyCertificates').addClass 'hidden'
      else
        $('.js-scrollList').addClass 'hidden'
        $('.js-emptyCertificates').removeClass 'hidden'
    first = false
    regTipOptions =
      tipJoint: 'left'
      background: '#fff5d2'
      borderRadius: 4
      borderWidth: 1
      borderColor: '#fee8ae'
    $('.js-test-certificate-tip').each (i, el) ->
      new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions)
      return
    initCertificateList()
    return

  reRenderCertificates()
  initCertificateList()
  $('.js-createTestCertificate').on 'click', (e) ->
    if EmailConfirmed
      pinDialog = new (Crypt.Dialogs.NewTestCertificate)
      pinDialog.initialize
        canceled: _.bind((->
        ), this)
        success: _.bind(((cert) ->
          certificates.push cert
          reRenderCertificates()
          scroll.update()
          return
        ), this)
    else
      (new (Crypt.Dialog)).Open 'blankError', text: Crypt.l18n.NewCertificate.needConfirmEmail
    e.preventDefault()
    false
  $('#chb-withpin').on 'change', ->
    reRenderCertificates()
    return
  $('#chb-test').on 'change', ->
    reRenderCertificates()
    return
  $('#sel-sort-certs').on 'change', ->
    reRenderCertificates()
    return
  $('#sel-sort-requests').on 'change', ->
    reRenderCertificates()
    return
  $('.filter .js-tabs li').click (e) ->
    $el = $(e.currentTarget)
    $box = $el.parent()
    if $el.hasClass('active')
      return false
    $box.find('li').removeClass 'active'
    $el.addClass 'active'
    reRenderCertificates()
    return
  setpin = $.find('#setPin')
  newPin = $.find('#newPin')
  newPinConfirm = $.find('#newPinConfirm')
  oldPin = $.find('#oldPin')
  cntrLabelnewPinErr = $(newPin).parent().find('.info.error').hide()
  cntrLabelSetPinErr = $(setpin).parent().find('.info.error').hide()
  cntrLabelOldPinErr = $(oldPin).parent().find('.info.error').hide()
  cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find('.info.error').hide()
  $(setpin).blur(->
    checkSetPin()
    return
  ).focus ->
    $(this).removeClass 'error'
    $(cntrLabelSetPinErr).hide()
    return
  $(newPin).blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    else if $(newPinConfirm).val() != '' and $(this).val() != $(newPinConfirm).val()
      $(cntrLabelnewPinConfirmErr).show()
      $(newPinConfirm).addClass 'error'
    if !/^[0-9]+$/.test($(this).val())
      $(cntrLabelnewPinErr).show()
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    $(newPinConfirm).removeClass 'error'
    $(cntrLabelnewPinConfirmErr).hide()
    $(cntrLabelnewPinErr).hide()
    return
  $(oldPin).blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    $(cntrLabelOldPinErr).hide()
    return
  $(newPinConfirm).blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    else if $(this).val() != $(newPin).val()
      $(cntrLabelnewPinConfirmErr).show()
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    $(cntrLabelnewPinConfirmErr).hide()
    return
  $('body').on 'click', '.js-request-actions .js-confirm-request', ->
    id = $(this).closest('.js-item').data('id')
    # здесь надо получить инфу о сертификате
    Crypt.Preloader.Block $('#myCertificateList')
    new Crypt.Dialogs.ConfirmRequest(id)
    false

  $('body').on 'click', '.js-request-actions .js-cancel-request', ->

    id = $(this).closest('.js-item').data('id');
    $('#delete-confirm').removeClass('hidden')
    $('#delete-confirm').find('.js-confirm-decline').data('id',id)
    $('#delete-confirm').find('.js-cancel-decline').on('click', () ->
      $('#delete-confirm').addClass('hidden').find('.js-confirm-decline').data('id', '');
      return false
    )
    $('#delete-confirm').find('.js-confirm-decline').on('click', (e) ->
      id = $(e.target).data('id')
      $.ajax
        url: Crypt.Urls.MarkerRequestDelete
        data:
          requestId: id
        success: _.bind((response) ->
          $('#delete-confirm').addClass('hidden').find('.js-confirm-decline').data('id', '');
          (new (Crypt.Dialog)).Open('blankInfo2', text: 'Запрос удален! Вы можете попробовать активировать маркер еще раз с помощью мастера активации. В случае если ошибка повторится, обратитесь в Удостоверяющий Центр где был получен маркер.',{
            beforeClose:  _.bind(() ->
              location.reload()
            this)
          })

          return
        this)
        error: _.bind((response) ->
          (new (Crypt.Dialog)).Open('blankInfo2', text: 'Произошла ошибка при удалении запроса',{
            beforeClose:  _.bind(() ->
              location.reload()
            this)
          })
          log(response)
          return
        this)
      return false
    )
    false


  $('body').on 'click', '.js-canceled-more', ->
    (new (Crypt.Dialog)).Open 'blankInfo', text: 'Отправленный запрос на сертификат был отклонен, попробуйте отправить запрос повторно. В случае, если ошибка повторится, обратитесь в Удостоверяющий Центр, где был получен маркер.'
    return false

  $('body').on 'click', '.js-request-actions .js-request-resend', ->
    id = $(this).closest('.js-item').data('id')
    $.ajax
      url: Crypt.Urls.MarkerRequestResend
      data:
        requestId: id
      success: _.bind((response) ->
        if (response.Status == 1)
          smsConfirm = new Crypt.Dialogs.RequestSmsConfirm()
          smsConfirm.initialize(
            id,
            {
              success: _.bind(->
                $.ajax
                  url: Crypt.Urls.MarkerRequestResendAgain
                  data:
                    requestId: id
                  success: _.bind((response) ->
                    (new (Crypt.Dialog)).Open('blankInfo2', text: 'Запрос успешно отправлен! Очень скоро сертификат будет выпущен, мы дополнительно сообщим Вам об этом. За статусом запроса Вы можете следить в разделе «Запросы на сертификаты»',{
                      beforeClose:  _.bind(() ->
                        location.reload()
                      this)
                    })
                  this)
              this)
              canceled: _.bind(->
                return
              this)
              error: _.bind(->
                return
              this)
            }
          )

        else if (response.Status == 0)
          (new (Crypt.Dialog)).Open('blankInfo2', text: 'Запрос успешно отправлен! Очень скоро сертификат будет выпущен, мы дополнительно сообщим Вам об этом. За статусом запроса Вы можете следить в разделе «Запросы на сертификаты»',{
            beforeClose:  _.bind(() ->
              location.reload()
            this)
          })
        else
          (new (Crypt.Dialog)).Open('blankError', text: 'Произошла ошибка, попробуйте повторить запрос позднее',{
            beforeClose:  _.bind(() ->
              location.reload()
            this)
          })
        return
      this)
      error: _.bind((response) ->
        debugger
        log('переотправка провалилась')
        log(response)

        return
      this)
    false

  return

