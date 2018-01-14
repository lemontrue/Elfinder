###*
# Created by Kirill on 5/2/2015.
###

RediretToLogin = ->
  location.href = url
  return

welcomeModal = ->
  WelcomeDialog = new (Crypt.Dialogs.Welcome)
  WelcomeDialog.initialize canceled: _.bind((->
  ), this)
  return

checkChangePassForm = (oldPass, newPass, newPassConfirm) ->
  cntrLabelNewPassSucc = $(newPass).parent().find('.info-pass.success').hide()
  cntrLabelNewPassErr = $(newPass).parent().find('.info').hide()
  cntrLabelConf = $(newPassConfirm).parent().find('.info.error').hide()
  infoPass = $(newPass).parent().find('.info').hide()
  success = true
  if $(oldPass).val() == ''
    $(oldPass).addClass 'error'
    success = false
  reg = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/
  reg2 = /^[a-z0-9]+$/i
  if $(newPass).val() == '' or $(newPass).val().length < 6
    $(newPass).addClass 'error'
    $(infoPass).text('Пароль не менее 6 символов должен включать цифры, заглавные и строчные буквы.').removeClass('error').show()
    success = false
  else if reg.test($(newPass).val())
    checkPass newPass
    #$(cntrLabelNewPassSucc).show();
  else
    checkPass newPass
    success = false
  if $(newPassConfirm).val() == ''
    $(newPassConfirm).addClass 'error'
    success = false
  else if $(newPassConfirm).val() != $(newPass).val()
    $(cntrLabelConf).show()
    $(newPassConfirm).addClass 'error'
    success = false
  success

initPage = ->
  oldPass = $.find('#oldPass')
  newPass = $.find('#newPass')
  name = $.find('#Name')
  newPassConfirm = $.find('#newPassConfirm')
  newEmail = $.find('#newEmail')
  infoPass = $(newPass).parent().find('.info').hide()
  cntrLabelNewPassSucc = $(newPass).parent().find('.info-pass.success').hide()
  cntrLabelNameErr = $(name).parent().find('.info.error').hide().css('top', '40px')
  cntrLabelOldPassErr = $(oldPass).parent().find('.info.error').hide()
  cntrLabelConf = $(newPassConfirm).parent().find('.info.error').hide()
  $(newEmail).blur(->
    reg = new RegExp(/^([A-Za-z0-9]+\.{0,1})+([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]*[A-Za-z0-9]+@@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{2,6}$/)
    if $(this).val() == '' or !reg.test($(this).val()) or $(this).val().length > 70
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    return
  $('#newPhone').blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    return
  $(name).focus ->
    $(cntrLabelNameErr).hide()
    $(this).removeClass 'error'
    return
  $(oldPass).blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    $(cntrLabelOldPassErr).hide()
    return
  $(newPass).keyup ->
    if $(this).val().length >= 6
      $(infoPass).hide()
      checkPass this
    return
  $(newPass).blur(->
    reg = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/
    if $(this).val() == '' or $(this).val().length < 6
      $(this).addClass 'error'
    else if reg.test($(this).val())
      checkPass newPass
      #$(cntrLabelNewPassSucc).show();
    else
      checkPass this
    if $(newPassConfirm).val() != '' and $(newPassConfirm).val() != $(this).val()
      $(cntrLabelConf).show()
      $(newPassConfirm).addClass 'error'
    return
  ).focus ->
    $(infoPass).text('Пароль не менее 6 символов должен включать цифры, заглавные и строчные буквы.').removeClass('error').show()
    $(this).removeClass 'error'
    $(cntrLabelNewPassSucc).hide()
    $(cntrLabelConf).hide()
    $(newPassConfirm).removeClass 'error'
    #$(cntrLabelNewPassErr).hide();
    return
  $(newPassConfirm).blur(->
    if $(this).val() == ''
      $(this).addClass 'error'
    else if $(this).val() != $(newPass).val()
      $(cntrLabelConf).show()
      $(this).addClass 'error'
    return
  ).focus ->
    $(this).removeClass 'error'
    $(cntrLabelConf).hide()
    return
  $('form').submit (event) ->
    event.target.id != 'ajaxFormMyCertificateList' and event.target.id != 'mainform' and event.preventDefault()
    return
  return

checkPass = (me) ->
  infoPass = $(me).parent().find('.info').hide()
  cntrLabelNewPassSucc = $(me).parent().find('.info-pass.success')
  valid = true
  valid2 = true
  text = 'Ненадежный пароль. Добавьте в него <{AZ}{az}{09}>.'
  text2 = ' Запрещено использовать русские буквы, спец.символы и пробелы'
  resText = ''
  if $(me).val().length > 5
    if !/[A-Z]+/.test($(me).val())
      text = text.replace('{AZ}', 'заглавные буквы,')
      valid = false
    if !/[a-z]+/.test($(me).val())
      text = text.replace('{az}', 'строчные буквы,')
      valid = false
    if !/[0-9]+/.test($(me).val())
      text = text.replace('{09}', 'цифры,')
      valid = false
    if !/^[a-z0-9]+$/i.test($(me).val())
      $(me).addClass 'error'
      valid2 = false
    if !valid or !valid2
      $(cntrLabelNewPassSucc).hide()
      if !valid
        pos = text.lastIndexOf(',')
        text = text.substring(0, pos) + text.substring(pos + 1)
        resText = text.replace('{AZ}', '').replace('{az}', '').replace('{09}', '')
      if !valid2
        resText += text2
      $(infoPass).addClass('error').text(resText).show()
      $(me).addClass 'error'
    else
      $(cntrLabelNewPassSucc).show()
      $(me).removeClass 'error'
    return valid
  false

showModal = (id) ->
  w = $('#modal #' + id)
  if w[0]
    w.show()
    w.parent().show()
  clearPassFields()
  return

hideModal = (id) ->
  if id == 'sms-confirm'
    clearTimeout window.smsTimeout
  w = $('#modal #' + id)
  if w[0]
    w.hide()
    w.parent().hide()
  return

clearPassFields = ->
  $('#oldPass').val('').removeClass 'error'
  $('#newPass').val('').removeClass 'error'
  $('#newPassConfirm').val('').removeClass 'error'
  $('#newEmail').val('').removeClass 'error'
  $('#newPass').closest('form').find('.info-pass').hide()
  $('#newPass').closest('form').find('.info').removeClass('error').hide()
  return

changePhone = (me) ->
  if !me
    return
  form = $(me).parent().parent()
  newPhone = form.find('#newPhone')

  hid = $.find('#Phone')
  reg = new RegExp(/^([\- ]?)(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)
  lengthError = false
  if $(newPhone).val()[0] == '+'
    if $(newPhone).val().length != 12
      lengthError = true
  else
    if $(newPhone).val().length != 10
      lengthError = true
  if $(newPhone).val() == '' or !reg.test($(newPhone).val()) or $(newPhone).val().length > 12 or lengthError
    $(newPhone).addClass 'error'
    $('#wrongPhone').css 'display', 'block'
  else
    $(newPhone).removeClass 'error'
    $('#wrongPhone').css 'display', 'none'
    $(hid).val $(newPhone).val()
    $('.phone.col').show()
    $('.phone.col').text $(newPhone).val()
    $('#changePhoneBtn').text 'Сменить телефон'
    hideModal 'change-phone'
  return

changePassword = (me) ->
  if !me
    return
  form = $(me).parent().parent()
  oldPass = form.find('#oldPass')
  newPass = form.find('#newPass')
  newPassConfirm = form.find('#newPassConfirm')
  cntrLabelOldPassErr = $(oldPass).parent().find('.info.error')
  if checkChangePassForm(oldPass, newPass, newPassConfirm)
    $.ajax(
      url: url2
      type: 'POST'
      data:
        newPass: $(newPass).val()
        oldPass: $(oldPass).val()).always (resp) ->
          if resp.success
            hideModal 'change-pass'
            showModal 'relogin-confirmation'
          else if resp.errorOldPass
            $(cntrLabelOldPassErr).show()
            $(oldPass).addClass 'error'
          else if resp.redirectUrl
            location.href = resp.redirectUrl
          else
            window.console and window.console.log and window.console.log(resp.message)
          return
  return

sendTestSms = (me) ->
  $.ajax(
    url: url3
    type: 'POST').always (resp) ->
      if resp.success
        $(me).hide()
      else if resp.redirectUrl
        location.href = resp.redirectUrl
      else
        window.console and window.console.log and window.console.log(resp.exception)
        alert resp.message
      return
  false

checkProfile = ->
  cntrLabelNameErr = $('#Name').parent().find('.info.error').hide()
  if $('#Name').val() == '' or !/^([a-zA-Zа-яА-ЯёЁ0-9\`\~\!\@@\"\№\#\$\;\%\:\^\&\?\*\(\)\_\-\+\=\/\|\\\{\}\[\]\'\<\>\,\.]+\s?)+$/.test($('#Name').val())
    $(cntrLabelNameErr).show()
    $('#Name').addClass 'error'
    return false
  true

submitMain = ->
  if !checkProfile()
    return
  $.ajax
    type: 'POST'
    url: $('#mainform').attr('href')
    data: $('#mainform').serialize()
    error: (responce) ->
      (new (Crypt.Dialog)).Open 'blankError', text: 'Произошла ошибка при сохранении данных, попробуйте повторить попытку позднее'
      return
    success: (responce) ->
      if responce == true
        (new (Crypt.Dialog)).Open 'blankInfo', text: 'Данные успешно изменены!'
      else
        (new (Crypt.Dialog)).Open 'blankError', text: 'Произошла ошибка при сохранении данных, попробуйте повторить попытку позднее'
      return
  false

showCheckPinWindow = (time, type) ->
  window.type = type
  startTime = new Date(new Date(1, 1).setSeconds(time))
  $('#sms-confirm .left-timer').text(getDateFormat(startTime))
  $('#resend').attr('disabled', 'disabled')
  $('#pinCode').val ''
  timeDiv = $('#sms-confirm .left-timer').text(getDateFormat(startTime))
  window.checkPinCount = 0

  checkPin = (text) ->
    obj = $('#sms-confirm .left-timer')
    date = getDate($(obj).text())
    if date.getMinutes() == 0 and date.getSeconds() == 0
      $('#sms-confirm .error').html 'Срок действия кода истек!'
      $('#sms-confirm .error').show()
      clearTimeout window.smsTimeout
      return

    if !text.length
      $('#pinCode').addClass 'error'
      $('#sms-confirm .info').html 'Введите код'
      $('#sms-confirm .info').show()
      return
    else if !/^[0-9]+$/.test(text)
      $('#pinCode').addClass 'error'
      $('#sms-confirm .info').html 'Код может содержать только цифры'
      $('#sms-confirm .info').show()
      return
    $('#sms-confirm .error').hide()
    $('#sms-confirm .img').show()

    if window.checkPinCount >= 5
      type = if window.type == 'email' then 'электронного адреса' else 'мобильного телефона'
      text = 'Превышено максимальное количество попыток.<br>Пройдите процедуру смены ' + type + ' с начала'
      $('#sms-confirm .error').html text
      $('#sms-confirm .error').show()
      clearTimeout window.smsTimeout
      $('#send-pin').attr 'disabled', 'disabled'
      $('#resend').attr 'disabled', 'disabled'
      return
    $.ajax(
      url: url4
      async: false
      type: 'POST'
      data: pin: text).always (response) ->
        if !response.error == false
          if response.error == 'relogin'
            location.href = url5
        $('#sms-confirm .img').hide()
        window.checkPinCount++
        if response.Status == 0
          #Ok
          if window.SmsConfirmationType == 'PhoneChange'
            ShowPhoneChangeSuccessWindow()
          if window.SmsConfirmationType == 'EmailChange'
            ShowEmailChangeSuccessWindow()
        if response.Status == 1
          #Ошибка
          $('#sms-confirm .error').html 'Ошибка при проверке'
          $('#sms-confirm .error').show()
        if response.Status == 2
          #Неверный пин
          $('#sms-confirm .error').html 'Неверный код'
          $('#sms-confirm .error').show()
        if response.Status == 3
          #Истек
          $('#sms-confirm .error').html 'Время жизни истекло'
          $('#sms-confirm .error').show()
        if response.Status == 4
          #Отсутствует
          $('#sms-confirm .error').html 'Ненайдена попытка подтверждения'
          $('#sms-confirm .error').show()
        if response.Status == 5
          #Количество попыток превышено
          $('#sms-confirm .error').html 'Превышено максимальное количество попыток. <br>Пройдите процедуру смены мобильного телефона с начала'
          $('#sms-confirm .error').show()
        if response.success
          #вывод окна об успешной смене телефона
          location.href = location.href
        else
        return
    return

  checkTime = ->
    obj = $('#sms-confirm .left-timer')
    date = getDate($(obj).text())
    if date.getMinutes() > 0 or date.getSeconds() > 0
      date = new Date(date.getTime() - 1000)
      $(obj).text getDateFormat(date)
      window.smsTimeout = setTimeout(checkTime, 1000)
    return

  showResendBut = ->
    $('#resend').removeAttr 'disabled'
    return

  $('#resend').click ->
    `var type`
    $('#pinCode').val ''
    $('#pinCode').removeClass 'error'
    $('#sms-confirm .error').hide()
    $('#sms-confirm .img').show()
    if window.checkPinCount >= 5
      type = if window.type == 'email' then 'электронного адреса' else 'мобильного телефона'
      text = 'Превышено максимальное количество попыток.<br>Пройдите процедуру смены ' + type + ' с начала'
      $('#sms-confirm .error').html text
      $('#sms-confirm .error').show()
      clearTimeout window.smsTimeout
      $('#send-pin').attr 'disabled', 'disabled'
      $('#resend').attr 'disabled', 'disabled'
      return
    $.ajax(
      url: url6
      async: false
      type: 'POST'
      data: SmsConfirmationID: window.SmsConfirmationID).always (response) ->
        if !response.error == false
          if response.error == 'relogin'
            location.href = url7
        $('#sms-confirm .img').hide()
        window.checkPinCount++
        if response.Status == 0
          #Ok
          $('#sms-confirm .left-timer').text(getDateFormat(startTime))
          $('#resend').attr('disabled', 'disabled')
          setTimeout showResendBut, 59 * 1000
          $('#pinCode').focus()
          #ShowPhoneChangeSuccessWindow();
        if response.Status == 1
          #Ошибка
          $('#sms-confirm .error').html 'Ошибка при проверке'
          $('#sms-confirm .error').show()
        if response.Status == 2
          #Неверный пин
          $('#sms-confirm .error').html 'Неверный код'
          $('#sms-confirm .error').show()
        if response.Status == 3
          #Истек
          $('#sms-confirm .error').html 'Время жизни истекло'
          $('#sms-confirm .error').show()
        if response.Status == 4
          #Отсутствует
          $('#sms-confirm .error').html 'Ненайдена попытка подтверждения'
          $('#sms-confirm .error').show()
        if response.Status == 5
          #Количество попыток превышено
          $('#sms-confirm .error').html 'Превышено максимальное количество попыток. <br>Пройдите процедуру смены мобильного телефона с начала'
          $('#sms-confirm .error').show()
        return
    return
  $('#send-pin').click ->
    checkPin $('#pinCode').val()
    return
  $('#sms-confirm').keypress (e) ->
    if e.keyCode == 13
      e.preventDefault()
      checkPin $('#pinCode').val()
    return
  $('#pinCode').focus ->
    $(this).removeClass 'error'
    $('#sms-confirm .info').hide()
    return
  $.fancybox.open '#sms-confirm',
    afterLoad: ->
      $('#pinCode').val ''
      return
    afterClose: ->
      clearTimeout window.smsTimeout
      return
    helpers: overlay: closeClick: false
  window.smsTimeout = setTimeout(checkTime, 1000)
  setTimeout showResendBut, 59 * 1000
  $('#pinCode').focus()
  return

ShowPhoneChangeSuccessWindow = ->
  window.canRedirect = false
  $.fancybox.close()
  showModal 'changePhoneSuccess-info'
  return

ShowEmailChangeSuccessWindow = ->
  window.canRedirect = false
  $.fancybox.close()
  showModal 'changeEmailSuccess-info'
  return

getDateFormat = (date) ->
  (if date.getMinutes() < 10 then '0' else '') + date.getMinutes() + ':' + (if date.getSeconds() < 10 then '0' else '') + date.getSeconds()

getDate = (str) ->
  if !str.length
    return new Date(1, 1)
  m = parseInt(str.substring(0, if str.indexOf(':') != -1 then str.indexOf(':') else 0))
  start = if str.indexOf(':') != -1 then str.indexOf(':') + 1 else str.length
  s = parseInt(str.substring(start, str.length))
  if isNaN(m) or isNaN(s)
    return new Date(1, 1)
  new Date(new Date(new Date(1, 1).setSeconds(s)).setMinutes(m))

changePhoneButClick = ->
  Crypt.Helpers.MaskPhone($("input#newPhone"), {}, '(999) 999-99-99')
  $('.phone').css 'display', 'none'
  $('.new-phone').css 'display', 'inherit'
  $('#changePhoneBtn').css 'display', 'none'
  $('#ConfirmPhoneChangeDiv').css 'display', 'inherit'
  return

ConfirmPhoneChangeBtn = ->
  $('#wrongPhone').css 'display', 'none'
  loader = $('.new-phone .save-loader')
  input = $('#newPhone')
  $(loader).css 'display', 'block'
  phoneNumber = $('#newPhone').val().replace(/\D+/g,"")
  if phoneNumber.length != 10
    $(input).addClass 'error'
    $('#wrongPhone').css 'display', 'block'
    $('#wrongPhone').html 'Необходимо ввести номер в международном формате, например +7 960 000000'
    $(loader).css 'display', 'none'
    return
  $.ajax
    url: url8
    async: true
    type: 'POST'
    data: phoneNumber: phoneNumber
    success: (response) ->
      $(input).removeClass 'error'
      $(loader).css 'display', 'none'
      if response.error == 'relogin'
        location.href = url9
      if response.Status == 1
        $('#wrongPhone').html 'Телефон уже используется в системе'
        $('#wrongPhone').css 'display', 'block'
        $(input).addClass 'error'
      if response.Status == 0
        window.SmsConfirmationType = response.SmsConfirmationType
        window.SmsConfirmationID = response.SmsConfirmationID
        showCheckPinWindow response.PinWaitingTime, 'phone'
      if response.Status == 2
        $('#info .btn.btn-green').unbind 'click'
        $('#info .close').unbind 'click'
        $('#info .btn.btn-green').click ->
          phoneChangeCancelByAdmin()
          event.preventDefault()
          return
        $('#info .close').click ->
          phoneChangeCancelByAdmin()
          event.preventDefault()
          return
        $('#infoText').html 'Телефон успешно изменен'
        showModal 'info'
      return
    error: (response) ->
      console.log response
      return
  #ajax проверки телефона
  return

phoneChangeCancelByAdmin = ->
  str = $('#newPhone').val()
  begin = undefined
  end = undefined
  begin = str.substring(0, 1)
  end = str.substring(8)
  str = begin + '*******' + end
  $('#phoneAsText').html str
  PhoneChangeCancel()
  $('#info .btn.btn-green').click ->
    hideModal 'info'
    return
  $('#info .close').click ->
    hideModal 'info'
    return
  return

PhoneChangeCancel = ->
  $('#phoneAsText').css 'display', 'inherit'
  $('.phone').css 'display', 'inherit'
  $('.new-phone').css 'display', 'none'
  $('#newPhone').val ''
  $('#newPhone').removeClass 'error'
  $('#changePhoneBtn').css 'display', 'inherit'
  $('#ConfirmPhoneChangeDiv').css 'display', 'none'
  $('#wrongPhone').hide()
  $('#phonePreloaderImg').css 'display', 'none'
  return

changeEmailButClick = ->
  $('.js-resendEmailConfirmation').css 'display', 'none'
  $('.email.col').css 'display', 'none'
  $('.new-email.col').css 'display', 'inherit'
  $('#emailAsText').css 'display', 'none'
  $('#newEmail').css 'display', 'inherit'
  $('#changeEmailBtn').css 'display', 'none'
  $('#ConfirmEmailChangeDiv').css 'display', 'inherit'
  return

EmailChangeClick = ->
  $('.js-resendEmailConfirmation').css 'display', 'inherit'
  $('.email.col').css 'display', 'inherit'
  $('.new-email.col').css 'display', 'none'
  $('#emailAsText').css 'display', 'inherit'
  $('#newEmail').val ''
  $('#newEmail').removeClass 'error'
  $('#newEmail').css 'display', 'none'
  $('#changeEmailBtn').css 'display', 'inherit'
  $('#ConfirmEmailChangeDiv').css 'display', 'none'
  $('#emailPreloaderImg').css 'display', 'none'
  $('#wrongEmail').css 'display', 'none'
  return

changeEmail = ->
  newEmail = $('#newEmail')
  reg = new RegExp(/^(("[A-Za-z0-9][\w-\s]+[A-Za-z0-9]")|([A-Za-z0-9][\w-]+(?:\.[\w-]+)*[A-Za-z0-9])|("[A-Za-z0-9][\w-\s]+")([\w-]+(?:\.[\w-]+)*[A-Za-z0-9]))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i)

  emailChangeCancelByAdmin = ->
    $('#emailAsText').html $('#newEmail').val()
    EmailChangeClick()
    $('#info .btn.btn-green').click ->
      hideModal 'info'
      return
    $('#info .close').click ->
      hideModal 'info'
      return
    return

  if $(newEmail).val() == '' or !reg.test($(newEmail).val()) or $(newEmail).val().length > 70
    $(newEmail).addClass 'error'
    $('#wrongEmail').css 'display', 'block'
  else
    $('#emailPreloaderImg').css 'display', 'inline-block'
    $('#wrongEmail').css 'display', 'none'
    $.ajax
      url: url10
      async: true
      type: 'POST'
      data: email: newEmail.val()
      success: (response) ->
        $('#emailPreloaderImg').css 'display', 'none'
        if response.error == 'relogin'
          location.href = url11
        if response.Status == 0
          $('#wrongEmail').html 'E-mail уже используется в системе'
          $('#wrongEmail').css 'display', 'inherit'
        if response.Status == 1
          #отправлена смс
          window.SmsConfirmationType = response.SmsConfirmationType
          window.SmsConfirmationID = response.SmsConfirmationID
          showCheckPinWindow response.PinWaitingTime, 'email'
        if response.Status == 2
          #отправлен email
          ShowEmailChangeSuccessWindow()
        if response.Status == 3
          $('#wrongEmail').html 'превышено количество попыток смены email'
          $('#wrongEmail').css 'display', 'inherit'
        if response.Status == 4
          $('#info .btn.btn-green').unbind 'click'
          $('#info .close').unbind 'click'
          $('#info .btn.btn-green').click ->
            emailChangeCancelByAdmin()
            event.preventDefault()
            return
          $('#info .close').click ->
            emailChangeCancelByAdmin()
            event.preventDefault()
            return
          $('#infoText').html 'E-mail успешно изменен'
          showModal 'info'
        return
      error: (response) ->
        console.log response
        return
    #$(hid).val($(newEmail).val());
    #$(".email.col").show();
    #$(".email.col").text($(newEmail).val());
    #$("#changeEmailBtn").text("Сменить E-mail");
    #hideModal('change-email');
  return

window.SmsConfirmationType = 0
window.canRedirect = true
window.smsTimeout = null
$ ->
  if $.cookie('logined') == 'true'
    welcomeModal()
  $.cookie 'logined', null, path: '/'
  $('.js-start-marker-activation').on 'click', ->
    new (Crypt.Dialogs.MarkerActivation)({}).initialize()
    return
  if $.cookie('afterRegistration')
    showModal 'blankCentered'
    $.cookie 'afterRegistration', '',
      expires: -1
      path: '/'
  if EmailChangeError != ''
    if EmailChangeError == 'True'
      $('#errorPlacer span').html 'Ссылка больше не активна!'
      showModal 'error'
    else
      $('#relogin-text span').html 'E-mail был успешно подтвержден!<br/> Для вашей безопасности мы рекомендуем Вам авторизоваться в системе повторно. Продолжить?'
      showModal 'relogin-confirmation'
  hidAuthType = $('#AcceptType')
  if hidAuthType
    $(hidAuthType).bind('change', (event) ->
      target = event.target or event.srcElement
      if $(target).val() == 'Sms'
        $('#sendTestSmsB').show()
      else
        $('#sendTestSmsB').hide()
      if $(target).val() == 'Kobil'
        $('#KobilAuthPassRequired').show()
      else
        $('#KobilAuthPassRequired').hide()
      return
    ).change()
  initPage()
  myOpentip = new Opentip($('#AllowTransmissionFromCryptogrammUser_info'), 'Другие пользователи через поиск контактов Cryptogramm будут видеть ваш адрес электронной почты и смогут добавить его в свою адресную книгу.')
  myOpentip2 = new Opentip($('#KobilAuthSmsRequired'), 'При авторизации, в качестве дополнительной меры безопасности, Вам потребуется вводить пароль. Рекомендуем выбрать данную опцию')
  if $('#tempEmail').length
    myOpentip3 = new Opentip($('#tempEmail'), 'E-mail не подтвержден')
  $('#newPhone').keypress (e) ->
#    if e.charCode == 32
#      return false
    return
  if showPasswordChangeModal == 'True'
    $('#CurPasswordLabel').html 'Введите временный пароль:'
    $('#changePassMessage').html 'Задайте новый пароль для вашего аккаунта. В противном случае, по истечении срока действия временного пароля, Вы не сможете авторизоваться в системе.'
    showModal 'change-pass'
  $('#newPhone').keydown (event) ->
#    #Enter
#    if event.keyCode == 13
#      ConfirmPhoneChangeBtn()
#    # ctrl + [a,z,x,c,v]
#    if event.ctrlKey == true and ($.inArray(event.keyCode, [90,88,86,67,65]))
#      return
#    # Разрешаем нажатие клавиш backspace, del, tab и esc
#    if event.keyCode == 46 or event.keyCode == 8 or event.keyCode == 9 or event.keyCode == 27 or (event.keyCode >= 35 and event.keyCode <= 39)
#      return
#    else
#      # Запрещаем всё, кроме клавиш цифр на основной клавиатуре, а также Num-клавиатуре
#      if (event.keyCode < 48 or event.keyCode > 57) and (event.keyCode < 96 or event.keyCode > 105) or (event.ctrlKey)
#        event.preventDefault()
    return
  $('#newPhone').keyup () ->
#    res = $(this).val().replace(/\D+/g,"")
#    $(this).val res
    return
  $('#newEmail').keydown (event) ->
    #Enter
    if event.keyCode == 13
      changeEmail()
    return
  return

# ---
# generated by js2coffee 2.1.0