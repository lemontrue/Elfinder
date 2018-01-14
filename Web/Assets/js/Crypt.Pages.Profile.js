
/**
 * Created by Kirill on 5/2/2015.
 */
var ConfirmPhoneChangeBtn, EmailChangeClick, PhoneChangeCancel, RediretToLogin, ShowEmailChangeSuccessWindow, ShowPhoneChangeSuccessWindow, changeEmail, changeEmailButClick, changePassword, changePhone, changePhoneButClick, checkChangePassForm, checkPass, checkProfile, clearPassFields, getDate, getDateFormat, hideModal, initPage, phoneChangeCancelByAdmin, sendTestSms, showCheckPinWindow, showModal, submitMain, welcomeModal;

RediretToLogin = function() {
  location.href = url;
};

welcomeModal = function() {
  var WelcomeDialog;
  WelcomeDialog = new Crypt.Dialogs.Welcome;
  WelcomeDialog.initialize({
    canceled: _.bind((function() {}), this)
  });
};

checkChangePassForm = function(oldPass, newPass, newPassConfirm) {
  var cntrLabelConf, cntrLabelNewPassErr, cntrLabelNewPassSucc, infoPass, reg, reg2, success;
  cntrLabelNewPassSucc = $(newPass).parent().find('.info-pass.success').hide();
  cntrLabelNewPassErr = $(newPass).parent().find('.info').hide();
  cntrLabelConf = $(newPassConfirm).parent().find('.info.error').hide();
  infoPass = $(newPass).parent().find('.info').hide();
  success = true;
  if ($(oldPass).val() === '') {
    $(oldPass).addClass('error');
    success = false;
  }
  reg = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/;
  reg2 = /^[a-z0-9]+$/i;
  if ($(newPass).val() === '' || $(newPass).val().length < 6) {
    $(newPass).addClass('error');
    $(infoPass).text('Пароль не менее 6 символов должен включать цифры, заглавные и строчные буквы.').removeClass('error').show();
    success = false;
  } else if (reg.test($(newPass).val())) {
    checkPass(newPass);
  } else {
    checkPass(newPass);
    success = false;
  }
  if ($(newPassConfirm).val() === '') {
    $(newPassConfirm).addClass('error');
    success = false;
  } else if ($(newPassConfirm).val() !== $(newPass).val()) {
    $(cntrLabelConf).show();
    $(newPassConfirm).addClass('error');
    success = false;
  }
  return success;
};

initPage = function() {
  var cntrLabelConf, cntrLabelNameErr, cntrLabelNewPassSucc, cntrLabelOldPassErr, infoPass, name, newEmail, newPass, newPassConfirm, oldPass;
  oldPass = $.find('#oldPass');
  newPass = $.find('#newPass');
  name = $.find('#Name');
  newPassConfirm = $.find('#newPassConfirm');
  newEmail = $.find('#newEmail');
  infoPass = $(newPass).parent().find('.info').hide();
  cntrLabelNewPassSucc = $(newPass).parent().find('.info-pass.success').hide();
  cntrLabelNameErr = $(name).parent().find('.info.error').hide().css('top', '40px');
  cntrLabelOldPassErr = $(oldPass).parent().find('.info.error').hide();
  cntrLabelConf = $(newPassConfirm).parent().find('.info.error').hide();
  $(newEmail).blur(function() {
    var reg;
    reg = new RegExp(/^([A-Za-z0-9]+\.{0,1})+([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]*[A-Za-z0-9]+@@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{2,6}$/);
    if ($(this).val() === '' || !reg.test($(this).val()) || $(this).val().length > 70) {
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
  });
  $('#newPhone').blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
  });
  $(name).focus(function() {
    $(cntrLabelNameErr).hide();
    $(this).removeClass('error');
  });
  $(oldPass).blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
    $(cntrLabelOldPassErr).hide();
  });
  $(newPass).keyup(function() {
    if ($(this).val().length >= 6) {
      $(infoPass).hide();
      checkPass(this);
    }
  });
  $(newPass).blur(function() {
    var reg;
    reg = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/;
    if ($(this).val() === '' || $(this).val().length < 6) {
      $(this).addClass('error');
    } else if (reg.test($(this).val())) {
      checkPass(newPass);
    } else {
      checkPass(this);
    }
    if ($(newPassConfirm).val() !== '' && $(newPassConfirm).val() !== $(this).val()) {
      $(cntrLabelConf).show();
      $(newPassConfirm).addClass('error');
    }
  }).focus(function() {
    $(infoPass).text('Пароль не менее 6 символов должен включать цифры, заглавные и строчные буквы.').removeClass('error').show();
    $(this).removeClass('error');
    $(cntrLabelNewPassSucc).hide();
    $(cntrLabelConf).hide();
    $(newPassConfirm).removeClass('error');
  });
  $(newPassConfirm).blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    } else if ($(this).val() !== $(newPass).val()) {
      $(cntrLabelConf).show();
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
    $(cntrLabelConf).hide();
  });
  $('form').submit(function(event) {
    event.target.id !== 'ajaxFormMyCertificateList' && event.target.id !== 'mainform' && event.preventDefault();
  });
};

checkPass = function(me) {
  var cntrLabelNewPassSucc, infoPass, pos, resText, text, text2, valid, valid2;
  infoPass = $(me).parent().find('.info').hide();
  cntrLabelNewPassSucc = $(me).parent().find('.info-pass.success');
  valid = true;
  valid2 = true;
  text = 'Ненадежный пароль. Добавьте в него <{AZ}{az}{09}>.';
  text2 = ' Запрещено использовать русские буквы, спец.символы и пробелы';
  resText = '';
  if ($(me).val().length > 5) {
    if (!/[A-Z]+/.test($(me).val())) {
      text = text.replace('{AZ}', 'заглавные буквы,');
      valid = false;
    }
    if (!/[a-z]+/.test($(me).val())) {
      text = text.replace('{az}', 'строчные буквы,');
      valid = false;
    }
    if (!/[0-9]+/.test($(me).val())) {
      text = text.replace('{09}', 'цифры,');
      valid = false;
    }
    if (!/^[a-z0-9]+$/i.test($(me).val())) {
      $(me).addClass('error');
      valid2 = false;
    }
    if (!valid || !valid2) {
      $(cntrLabelNewPassSucc).hide();
      if (!valid) {
        pos = text.lastIndexOf(',');
        text = text.substring(0, pos) + text.substring(pos + 1);
        resText = text.replace('{AZ}', '').replace('{az}', '').replace('{09}', '');
      }
      if (!valid2) {
        resText += text2;
      }
      $(infoPass).addClass('error').text(resText).show();
      $(me).addClass('error');
    } else {
      $(cntrLabelNewPassSucc).show();
      $(me).removeClass('error');
    }
    return valid;
  }
  return false;
};

showModal = function(id) {
  var w;
  w = $('#modal #' + id);
  if (w[0]) {
    w.show();
    w.parent().show();
  }
  clearPassFields();
};

hideModal = function(id) {
  var w;
  if (id === 'sms-confirm') {
    clearTimeout(window.smsTimeout);
  }
  w = $('#modal #' + id);
  if (w[0]) {
    w.hide();
    w.parent().hide();
  }
};

clearPassFields = function() {
  $('#oldPass').val('').removeClass('error');
  $('#newPass').val('').removeClass('error');
  $('#newPassConfirm').val('').removeClass('error');
  $('#newEmail').val('').removeClass('error');
  $('#newPass').closest('form').find('.info-pass').hide();
  $('#newPass').closest('form').find('.info').removeClass('error').hide();
};

changePhone = function(me) {
  var form, hid, lengthError, newPhone, reg;
  if (!me) {
    return;
  }
  form = $(me).parent().parent();
  newPhone = form.find('#newPhone');
  hid = $.find('#Phone');
  reg = new RegExp(/^([\- ]?)(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/);
  lengthError = false;
  if ($(newPhone).val()[0] === '+') {
    if ($(newPhone).val().length !== 12) {
      lengthError = true;
    }
  } else {
    if ($(newPhone).val().length !== 10) {
      lengthError = true;
    }
  }
  if ($(newPhone).val() === '' || !reg.test($(newPhone).val()) || $(newPhone).val().length > 12 || lengthError) {
    $(newPhone).addClass('error');
    $('#wrongPhone').css('display', 'block');
  } else {
    $(newPhone).removeClass('error');
    $('#wrongPhone').css('display', 'none');
    $(hid).val($(newPhone).val());
    $('.phone.col').show();
    $('.phone.col').text($(newPhone).val());
    $('#changePhoneBtn').text('Сменить телефон');
    hideModal('change-phone');
  }
};

changePassword = function(me) {
  var cntrLabelOldPassErr, form, newPass, newPassConfirm, oldPass;
  if (!me) {
    return;
  }
  form = $(me).parent().parent();
  oldPass = form.find('#oldPass');
  newPass = form.find('#newPass');
  newPassConfirm = form.find('#newPassConfirm');
  cntrLabelOldPassErr = $(oldPass).parent().find('.info.error');
  if (checkChangePassForm(oldPass, newPass, newPassConfirm)) {
    $.ajax({
      url: url2,
      type: 'POST',
      data: {
        newPass: $(newPass).val(),
        oldPass: $(oldPass).val()
      }
    }).always(function(resp) {
      if (resp.success) {
        hideModal('change-pass');
        showModal('relogin-confirmation');
      } else if (resp.errorOldPass) {
        $(cntrLabelOldPassErr).show();
        $(oldPass).addClass('error');
      } else if (resp.redirectUrl) {
        location.href = resp.redirectUrl;
      } else {
        window.console && window.console.log && window.console.log(resp.message);
      }
    });
  }
};

sendTestSms = function(me) {
  $.ajax({
    url: url3,
    type: 'POST'
  }).always(function(resp) {
    if (resp.success) {
      $(me).hide();
    } else if (resp.redirectUrl) {
      location.href = resp.redirectUrl;
    } else {
      window.console && window.console.log && window.console.log(resp.exception);
      alert(resp.message);
    }
  });
  return false;
};

checkProfile = function() {
  var cntrLabelNameErr;
  cntrLabelNameErr = $('#Name').parent().find('.info.error').hide();
  if ($('#Name').val() === '' || !/^([a-zA-Zа-яА-ЯёЁ0-9\`\~\!\@@\"\№\#\$\;\%\:\^\&\?\*\(\)\_\-\+\=\/\|\\\{\}\[\]\'\<\>\,\.]+\s?)+$/.test($('#Name').val())) {
    $(cntrLabelNameErr).show();
    $('#Name').addClass('error');
    return false;
  }
  return true;
};

submitMain = function() {
  if (!checkProfile()) {
    return;
  }
  $.ajax({
    type: 'POST',
    url: $('#mainform').attr('href'),
    data: $('#mainform').serialize(),
    error: function(responce) {
      (new Crypt.Dialog).Open('blankError', {
        text: 'Произошла ошибка при сохранении данных, попробуйте повторить попытку позднее'
      });
    },
    success: function(responce) {
      if (responce === true) {
        (new Crypt.Dialog).Open('blankInfo', {
          text: 'Данные успешно изменены!'
        });
      } else {
        (new Crypt.Dialog).Open('blankError', {
          text: 'Произошла ошибка при сохранении данных, попробуйте повторить попытку позднее'
        });
      }
    }
  });
  return false;
};

showCheckPinWindow = function(time, type) {
  var checkPin, checkTime, showResendBut, startTime, timeDiv;
  window.type = type;
  startTime = new Date(new Date(1, 1).setSeconds(time));
  $('#sms-confirm .left-timer').text(getDateFormat(startTime));
  $('#resend').attr('disabled', 'disabled');
  $('#pinCode').val('');
  timeDiv = $('#sms-confirm .left-timer').text(getDateFormat(startTime));
  window.checkPinCount = 0;
  checkPin = function(text) {
    var date, obj;
    obj = $('#sms-confirm .left-timer');
    date = getDate($(obj).text());
    if (date.getMinutes() === 0 && date.getSeconds() === 0) {
      $('#sms-confirm .error').html('Срок действия кода истек!');
      $('#sms-confirm .error').show();
      clearTimeout(window.smsTimeout);
      return;
    }
    if (!text.length) {
      $('#pinCode').addClass('error');
      $('#sms-confirm .info').html('Введите код');
      $('#sms-confirm .info').show();
      return;
    } else if (!/^[0-9]+$/.test(text)) {
      $('#pinCode').addClass('error');
      $('#sms-confirm .info').html('Код может содержать только цифры');
      $('#sms-confirm .info').show();
      return;
    }
    $('#sms-confirm .error').hide();
    $('#sms-confirm .img').show();
    if (window.checkPinCount >= 5) {
      type = window.type === 'email' ? 'электронного адреса' : 'мобильного телефона';
      text = 'Превышено максимальное количество попыток.<br>Пройдите процедуру смены ' + type + ' с начала';
      $('#sms-confirm .error').html(text);
      $('#sms-confirm .error').show();
      clearTimeout(window.smsTimeout);
      $('#send-pin').attr('disabled', 'disabled');
      $('#resend').attr('disabled', 'disabled');
      return;
    }
    $.ajax({
      url: url4,
      async: false,
      type: 'POST',
      data: {
        pin: text
      }
    }).always(function(response) {
      if (!response.error === false) {
        if (response.error === 'relogin') {
          location.href = url5;
        }
      }
      $('#sms-confirm .img').hide();
      window.checkPinCount++;
      if (response.Status === 0) {
        if (window.SmsConfirmationType === 'PhoneChange') {
          ShowPhoneChangeSuccessWindow();
        }
        if (window.SmsConfirmationType === 'EmailChange') {
          ShowEmailChangeSuccessWindow();
        }
      }
      if (response.Status === 1) {
        $('#sms-confirm .error').html('Ошибка при проверке');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 2) {
        $('#sms-confirm .error').html('Неверный код');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 3) {
        $('#sms-confirm .error').html('Время жизни истекло');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 4) {
        $('#sms-confirm .error').html('Ненайдена попытка подтверждения');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 5) {
        $('#sms-confirm .error').html('Превышено максимальное количество попыток. <br>Пройдите процедуру смены мобильного телефона с начала');
        $('#sms-confirm .error').show();
      }
      if (response.success) {
        location.href = location.href;
      } else {

      }
    });
  };
  checkTime = function() {
    var date, obj;
    obj = $('#sms-confirm .left-timer');
    date = getDate($(obj).text());
    if (date.getMinutes() > 0 || date.getSeconds() > 0) {
      date = new Date(date.getTime() - 1000);
      $(obj).text(getDateFormat(date));
      window.smsTimeout = setTimeout(checkTime, 1000);
    }
  };
  showResendBut = function() {
    $('#resend').removeAttr('disabled');
  };
  $('#resend').click(function() {
    var type;
    var text;
    $('#pinCode').val('');
    $('#pinCode').removeClass('error');
    $('#sms-confirm .error').hide();
    $('#sms-confirm .img').show();
    if (window.checkPinCount >= 5) {
      type = window.type === 'email' ? 'электронного адреса' : 'мобильного телефона';
      text = 'Превышено максимальное количество попыток.<br>Пройдите процедуру смены ' + type + ' с начала';
      $('#sms-confirm .error').html(text);
      $('#sms-confirm .error').show();
      clearTimeout(window.smsTimeout);
      $('#send-pin').attr('disabled', 'disabled');
      $('#resend').attr('disabled', 'disabled');
      return;
    }
    $.ajax({
      url: url6,
      async: false,
      type: 'POST',
      data: {
        SmsConfirmationID: window.SmsConfirmationID
      }
    }).always(function(response) {
      if (!response.error === false) {
        if (response.error === 'relogin') {
          location.href = url7;
        }
      }
      $('#sms-confirm .img').hide();
      window.checkPinCount++;
      if (response.Status === 0) {
        $('#sms-confirm .left-timer').text(getDateFormat(startTime));
        $('#resend').attr('disabled', 'disabled');
        setTimeout(showResendBut, 59 * 1000);
        $('#pinCode').focus();
      }
      if (response.Status === 1) {
        $('#sms-confirm .error').html('Ошибка при проверке');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 2) {
        $('#sms-confirm .error').html('Неверный код');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 3) {
        $('#sms-confirm .error').html('Время жизни истекло');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 4) {
        $('#sms-confirm .error').html('Ненайдена попытка подтверждения');
        $('#sms-confirm .error').show();
      }
      if (response.Status === 5) {
        $('#sms-confirm .error').html('Превышено максимальное количество попыток. <br>Пройдите процедуру смены мобильного телефона с начала');
        $('#sms-confirm .error').show();
      }
    });
  });
  $('#send-pin').click(function() {
    checkPin($('#pinCode').val());
  });
  $('#sms-confirm').keypress(function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      checkPin($('#pinCode').val());
    }
  });
  $('#pinCode').focus(function() {
    $(this).removeClass('error');
    $('#sms-confirm .info').hide();
  });
  $.fancybox.open('#sms-confirm', {
    afterLoad: function() {
      $('#pinCode').val('');
    },
    afterClose: function() {
      clearTimeout(window.smsTimeout);
    },
    helpers: {
      overlay: {
        closeClick: false
      }
    }
  });
  window.smsTimeout = setTimeout(checkTime, 1000);
  setTimeout(showResendBut, 59 * 1000);
  $('#pinCode').focus();
};

ShowPhoneChangeSuccessWindow = function() {
  window.canRedirect = false;
  $.fancybox.close();
  showModal('changePhoneSuccess-info');
};

ShowEmailChangeSuccessWindow = function() {
  window.canRedirect = false;
  $.fancybox.close();
  showModal('changeEmailSuccess-info');
};

getDateFormat = function(date) {
  return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
};

getDate = function(str) {
  var m, s, start;
  if (!str.length) {
    return new Date(1, 1);
  }
  m = parseInt(str.substring(0, str.indexOf(':') !== -1 ? str.indexOf(':') : 0));
  start = str.indexOf(':') !== -1 ? str.indexOf(':') + 1 : str.length;
  s = parseInt(str.substring(start, str.length));
  if (isNaN(m) || isNaN(s)) {
    return new Date(1, 1);
  }
  return new Date(new Date(new Date(1, 1).setSeconds(s)).setMinutes(m));
};

changePhoneButClick = function() {
  Crypt.Helpers.MaskPhone($("input#newPhone"), {}, '(999) 999-99-99');
  $('.phone').css('display', 'none');
  $('.new-phone').css('display', 'inherit');
  $('#changePhoneBtn').css('display', 'none');
  $('#ConfirmPhoneChangeDiv').css('display', 'inherit');
};

ConfirmPhoneChangeBtn = function() {
  var input, loader, phoneNumber;
  $('#wrongPhone').css('display', 'none');
  loader = $('.new-phone .save-loader');
  input = $('#newPhone');
  $(loader).css('display', 'block');
  phoneNumber = $('#newPhone').val().replace(/\D+/g, "");
  if (phoneNumber.length !== 10) {
    $(input).addClass('error');
    $('#wrongPhone').css('display', 'block');
    $('#wrongPhone').html('Необходимо ввести номер в международном формате, например +7 960 000000');
    $(loader).css('display', 'none');
    return;
  }
  $.ajax({
    url: url8,
    async: true,
    type: 'POST',
    data: {
      phoneNumber: phoneNumber
    },
    success: function(response) {
      $(input).removeClass('error');
      $(loader).css('display', 'none');
      if (response.error === 'relogin') {
        location.href = url9;
      }
      if (response.Status === 1) {
        $('#wrongPhone').html('Телефон уже используется в системе');
        $('#wrongPhone').css('display', 'block');
        $(input).addClass('error');
      }
      if (response.Status === 0) {
        window.SmsConfirmationType = response.SmsConfirmationType;
        window.SmsConfirmationID = response.SmsConfirmationID;
        showCheckPinWindow(response.PinWaitingTime, 'phone');
      }
      if (response.Status === 2) {
        $('#info .btn.btn-green').unbind('click');
        $('#info .close').unbind('click');
        $('#info .btn.btn-green').click(function() {
          phoneChangeCancelByAdmin();
          event.preventDefault();
        });
        $('#info .close').click(function() {
          phoneChangeCancelByAdmin();
          event.preventDefault();
        });
        $('#infoText').html('Телефон успешно изменен');
        showModal('info');
      }
    },
    error: function(response) {
      console.log(response);
    }
  });
};

phoneChangeCancelByAdmin = function() {
  var begin, end, str;
  str = $('#newPhone').val();
  begin = void 0;
  end = void 0;
  begin = str.substring(0, 1);
  end = str.substring(8);
  str = begin + '*******' + end;
  $('#phoneAsText').html(str);
  PhoneChangeCancel();
  $('#info .btn.btn-green').click(function() {
    hideModal('info');
  });
  $('#info .close').click(function() {
    hideModal('info');
  });
};

PhoneChangeCancel = function() {
  $('#phoneAsText').css('display', 'inherit');
  $('.phone').css('display', 'inherit');
  $('.new-phone').css('display', 'none');
  $('#newPhone').val('');
  $('#newPhone').removeClass('error');
  $('#changePhoneBtn').css('display', 'inherit');
  $('#ConfirmPhoneChangeDiv').css('display', 'none');
  $('#wrongPhone').hide();
  $('#phonePreloaderImg').css('display', 'none');
};

changeEmailButClick = function() {
  $('.js-resendEmailConfirmation').css('display', 'none');
  $('.email.col').css('display', 'none');
  $('.new-email.col').css('display', 'inherit');
  $('#emailAsText').css('display', 'none');
  $('#newEmail').css('display', 'inherit');
  $('#changeEmailBtn').css('display', 'none');
  $('#ConfirmEmailChangeDiv').css('display', 'inherit');
};

EmailChangeClick = function() {
  $('.js-resendEmailConfirmation').css('display', 'inherit');
  $('.email.col').css('display', 'inherit');
  $('.new-email.col').css('display', 'none');
  $('#emailAsText').css('display', 'inherit');
  $('#newEmail').val('');
  $('#newEmail').removeClass('error');
  $('#newEmail').css('display', 'none');
  $('#changeEmailBtn').css('display', 'inherit');
  $('#ConfirmEmailChangeDiv').css('display', 'none');
  $('#emailPreloaderImg').css('display', 'none');
  $('#wrongEmail').css('display', 'none');
};

changeEmail = function() {
  var emailChangeCancelByAdmin, newEmail, reg;
  newEmail = $('#newEmail');
  reg = new RegExp(/^(("[A-Za-z0-9][\w-\s]+[A-Za-z0-9]")|([A-Za-z0-9][\w-]+(?:\.[\w-]+)*[A-Za-z0-9])|("[A-Za-z0-9][\w-\s]+")([\w-]+(?:\.[\w-]+)*[A-Za-z0-9]))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
  emailChangeCancelByAdmin = function() {
    $('#emailAsText').html($('#newEmail').val());
    EmailChangeClick();
    $('#info .btn.btn-green').click(function() {
      hideModal('info');
    });
    $('#info .close').click(function() {
      hideModal('info');
    });
  };
  if ($(newEmail).val() === '' || !reg.test($(newEmail).val()) || $(newEmail).val().length > 70) {
    $(newEmail).addClass('error');
    $('#wrongEmail').css('display', 'block');
  } else {
    $('#emailPreloaderImg').css('display', 'inline-block');
    $('#wrongEmail').css('display', 'none');
    $.ajax({
      url: url10,
      async: true,
      type: 'POST',
      data: {
        email: newEmail.val()
      },
      success: function(response) {
        $('#emailPreloaderImg').css('display', 'none');
        if (response.error === 'relogin') {
          location.href = url11;
        }
        if (response.Status === 0) {
          $('#wrongEmail').html('E-mail уже используется в системе');
          $('#wrongEmail').css('display', 'inherit');
        }
        if (response.Status === 1) {
          window.SmsConfirmationType = response.SmsConfirmationType;
          window.SmsConfirmationID = response.SmsConfirmationID;
          showCheckPinWindow(response.PinWaitingTime, 'email');
        }
        if (response.Status === 2) {
          ShowEmailChangeSuccessWindow();
        }
        if (response.Status === 3) {
          $('#wrongEmail').html('превышено количество попыток смены email');
          $('#wrongEmail').css('display', 'inherit');
        }
        if (response.Status === 4) {
          $('#info .btn.btn-green').unbind('click');
          $('#info .close').unbind('click');
          $('#info .btn.btn-green').click(function() {
            emailChangeCancelByAdmin();
            event.preventDefault();
          });
          $('#info .close').click(function() {
            emailChangeCancelByAdmin();
            event.preventDefault();
          });
          $('#infoText').html('E-mail успешно изменен');
          showModal('info');
        }
      },
      error: function(response) {
        console.log(response);
      }
    });
  }
};

window.SmsConfirmationType = 0;

window.canRedirect = true;

window.smsTimeout = null;

$(function() {
  var hidAuthType, myOpentip, myOpentip2, myOpentip3;
  if ($.cookie('logined') === 'true') {
    welcomeModal();
  }
  $.cookie('logined', null, {
    path: '/'
  });
  $('.js-start-marker-activation').on('click', function() {
    new Crypt.Dialogs.MarkerActivation({}).initialize();
  });
  if ($.cookie('afterRegistration')) {
    showModal('blankCentered');
    $.cookie('afterRegistration', '', {
      expires: -1,
      path: '/'
    });
  }
  if (EmailChangeError !== '') {
    if (EmailChangeError === 'True') {
      $('#errorPlacer span').html('Ссылка больше не активна!');
      showModal('error');
    } else {
      $('#relogin-text span').html('E-mail был успешно подтвержден!<br/> Для вашей безопасности мы рекомендуем Вам авторизоваться в системе повторно. Продолжить?');
      showModal('relogin-confirmation');
    }
  }
  hidAuthType = $('#AcceptType');
  if (hidAuthType) {
    $(hidAuthType).bind('change', function(event) {
      var target;
      target = event.target || event.srcElement;
      if ($(target).val() === 'Sms') {
        $('#sendTestSmsB').show();
      } else {
        $('#sendTestSmsB').hide();
      }
      if ($(target).val() === 'Kobil') {
        $('#KobilAuthPassRequired').show();
      } else {
        $('#KobilAuthPassRequired').hide();
      }
    }).change();
  }
  initPage();
  myOpentip = new Opentip($('#AllowTransmissionFromCryptogrammUser_info'), 'Другие пользователи через поиск контактов Cryptogramm будут видеть ваш адрес электронной почты и смогут добавить его в свою адресную книгу.');
  myOpentip2 = new Opentip($('#KobilAuthSmsRequired'), 'При авторизации, в качестве дополнительной меры безопасности, Вам потребуется вводить пароль. Рекомендуем выбрать данную опцию');
  if ($('#tempEmail').length) {
    myOpentip3 = new Opentip($('#tempEmail'), 'E-mail не подтвержден');
  }
  $('#newPhone').keypress(function(e) {});
  if (showPasswordChangeModal === 'True') {
    $('#CurPasswordLabel').html('Введите временный пароль:');
    $('#changePassMessage').html('Задайте новый пароль для вашего аккаунта. В противном случае, по истечении срока действия временного пароля, Вы не сможете авторизоваться в системе.');
    showModal('change-pass');
  }
  $('#newPhone').keydown(function(event) {});
  $('#newPhone').keyup(function() {});
  $('#newEmail').keydown(function(event) {
    if (event.keyCode === 13) {
      changeEmail();
    }
  });
});
