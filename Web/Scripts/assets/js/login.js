(function() {
  var $error, $kobilButton, $kobilLogin, $kobilLogin2, $login1, $normalLogin, $password, $pinCode, $registration, $registrationBox, $showRegistration, $tabsTitles, checkPinCount, checkRegPhone, fancyboxRedirect, getGuid, getRegPhone, kobilLogin, loginCookie, qs, showCheckPinWindow, showError, showKobilLogin, showKobilWindow, showNormalLogin, showRegistrationError, submitRegForm;

  checkPinCount = 0;

  fancyboxRedirect = true;

  $error = $('.error-mess');

  $normalLogin = $('#normalLogin');

  $kobilLogin = $('#TaxnetId');

  $tabsTitles = $('#login .titles .title');

  $registration = $('.js-registration-form');

  $registrationBox = $('.js-registration-box');

  $showRegistration = $('.js-show-registration');

  $login1 = $('#login1');

  $kobilButton = $('#kobilButton');

  $password = $('#password');

  $pinCode = $('#pinCode');

  $kobilLogin2 = $('#kobilLogin');

  loginCookie = function(name, val, time, path) {
    return $.cookie(name, val, {
      expires: time ? time : 365,
      path: path ? path : '/'
    });
  };

  showNormalLogin = function(email) {
    $error.hide();
    $normalLogin.show();
    $kobilLogin.hide();
    if (email !== void 0) {
      $login1.val(email);
      $password.addClass('error');
    }
    $tabsTitles.removeClass('active').filter('[data-tab="login"]').addClass('active');
  };

  showKobilLogin = function() {
    $error.hide();
    $normalLogin.hide();
    $kobilLogin.show();
    $tabsTitles.removeClass('active').filter('[data-tab="taxnet"]').addClass('active');
  };

  showError = function(text) {
    return $('.error-mess').html(text).show();
  };

  kobilLogin = function() {
    $kobilButton.attr('disabled', 'true');
    if ($kobilLogin2.val() !== '') {
      Crypt.Preloader.Block($('.login-area'));
      $.ajax({
        url: Crypt.Urls.KobilLogin,
        data: {
          login: $kobilLogin2.val()
        },
        success: function(result) {
          if (result.errorMsg !== null) {
            if (result.errorCode === 4 || result.errorCode === 5) {
              showNormalLogin($kobilLogin2.val());
              $('#clickButton').removeAttr('disabled');
            }
            Crypt.Preloader.UnBlock($('.login-area'));
            showError(result.errorMsg);
            $kobilButton.removeAttr('disabled');
            return;
          }
          if (result.pin === 2) {
            loginCookie('initTab', 'kobil');
            showKobilWindow(result.KobilTransactionWaitingTime, result.KobilPollingTime, 'kobilLogin');
          } else if (!result.KobilAuthEnabled) {
            showNormalLogin();
            Crypt.Preloader.UnBlock($('.login-area'));
            showError('Отключен вход по TaxnetId');
            $('#clickButton').removeAttr('disabled');
          }
          $kobilButton.removeAttr('disabled');
        },
        error: function(request, error, result) {
          var wnd;
          Crypt.Preloader.UnBlock($('.login-area'));
          wnd = window.open('about:blank', '_blank', 'height:100;width:100');
          wnd.document.write(request.responseText);
          $('#clickButton').removeAttr('disabled');
          return false;
        }
      });
    } else {
      $kobilButton.removeAttr('disabled');
      showError('Введите E-mail');
      $kobilLogin2.addClass('error');
    }
  };

  getGuid = function() {
    $('#clickButton').attr('disabled', 'true');
    Crypt.Preloader.Block($('.login-area'));
    $.ajax({
      url: Crypt.Urls.LoginGuid,
      data: {
        login1: $login1.val(),
        password: $password.val()
      },
      success: function(result) {
        var wnd;
        if (result.errorMsg) {
          if (result.errorCode === 4) {
            $password.addClass('error');
          }
          showError(result.errorMsg);
          $('#clickButton').removeAttr('disabled');
          Crypt.Preloader.UnBlock($('.login-area'));
          return;
        }
        if (result.pin === 0) {
          if ($('#saveEmailNormal').prop('checked')) {
            loginCookie('email', $login1.val());
          }
          loginCookie('initTab', 'normal');
          if (result.retUrl !== '') {
            location.href = result.retUrl;
          } else {
            if (qs('retUrl') !== null) {
              location.href = qs('retUrl');
            }
          }
        } else if (result.pin === 1) {
          showCheckPinWindow(result.pinWaitingTime);
        } else if (result.pin === 2) {
          loginCookie('initTab', 'kobil');
          showKobilWindow(result.KobilTransactionWaitingTime, result.KobilPollingTime, 'normalLogin');
        } else {
          wnd = window.open('about:blank', '_blank', 'height=800,width=1200,resizable=1,scrollbars=1');
          wnd.document.write(result);
        }
      },
      error: function(request, error, result) {
        var wnd;
        Crypt.Preloader.UnBlock($('.login-area'));
        wnd = window.open('about:blank', '_blank', 'height:100;width:100');
        wnd.document.write(request.responseText);
        $('#clickButton').removeAttr('disabled');
        return false;
      }
    });
  };

  qs = function(key) {
    var match;
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, '\\$&');
    match = location.search.match(new RegExp('[?&]' + key + '=([^&]+)(&|$)'));
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  };

  showKobilWindow = function(time, pollingTime, sender) {
    var checkInterval, checkTime, kobil, startTime, stopCheckKobil, stopTimeKobil, timeDiv;
    loginCookie('email', $login1.val());
    startTime = new Date(new Date(1, 1).setSeconds(time));
    timeDiv = $('#kobil .time').text(getDateFormat(startTime));
    checkInterval = pollingTime * 1000;
    stopCheckKobil = false;
    stopTimeKobil = false;
    kobil = function() {
      $.ajax({
        url: Crypt.Urls.CheckKobil,
        data: {
          retUrl: $('#retUrl').val()
        },
        success: function(response) {
          if (typeof response.Status === 'undefined') {
            if (response.message) {
              console.log(response.message);
            }
            alert('Произошла неизвестная ошибка');
            location.href = Crypt.Urls.Login;
          } else if (response.Status === 1) {
            if (sender === 'normalLogin') {
              if ($('#saveEmailNormal').prop('checked')) {
                loginCookie('email', $login1.val());
              }
            }
            if (sender === 'kobilLogin') {
              if ($('#saveEmailKobil').prop('checked')) {
                loginCookie('email', $kobilLogin2.val());
              }
            }
            location.href = response.redirect;
          } else if (response.Status === 2) {
            if (response.message) {
              console.log(response.message);
            }
            $('#kobil .result').show();
            $('#kobil .error').show().text('В авторизации отказано!');
            $('#kobil .row-loader').hide();
            $('#close-text').show();
            stopTimeKobil = true;
            stopCheckKobil = true;
          } else {
            if (!stopCheckKobil) {
              setTimeout(kobil, checkInterval);
            }
          }
        },
        error: function(response) {
          console.log(response);
          location.href = Crypt.Urls.Login;
        }
      });
    };
    checkTime = function() {
      var date, obj;
      obj = $('#kobil .time');
      date = getDate($(obj).text());
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        $('#kobil .result').show();
        $('#kobil .error').show().text('Данные не были подтверждены!');
        $('#kobil .row-loader').hide();
        $('#close-text').show();
        stopCheckKobil = true;
      } else {
        date = new Date(date.getTime() - 1000);
        $(obj).text(getDateFormat(date));
        if (!stopTimeKobil) {
          setTimeout(checkTime, 1000);
        }
      }
    };
    $('#kobil .text-center a').click(function(e) {
      e.preventDefault();
      $.fancybox.close();
    });
    $.fancybox.open('#kobil', {
      afterClose: function() {
        location.href = Crypt.Urls.CancelKobil + '?retUrl=' + $('#retUrl').val();
      },
      helpers: {
        overlay: {
          closeClick: false
        }
      }
    });
    setTimeout(checkTime, 1000);
    setTimeout(kobil, checkInterval);
  };

  showCheckPinWindow = function(time) {
    var checkPin, checkTime, showResendBut, startTime, timeDiv;
    startTime = new Date(new Date(1, 1).setSeconds(time));
    timeDiv = $('#sms .time').text(getDateFormat(startTime));
    checkPin = function(text) {
      var date, obj;
      obj = $('#sms .time');
      date = getDate($(obj).text());
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        $('#sms .js-sms-limit').html('Срок действия кода истек!').show();
        return;
      }
      if (window.checkPinCount >= 4) {
        $('#sms .js-sms-limit').html('Превышено максимальное количество попыток.<br>Пройдите процедуру авторизации с начала').show();
        $('#resend').attr('disabled', 'disabled');
        clearTimeout(window.showResendTimer);
        $('#send-pin').attr('disabled', 'disabled');
        return;
      }
      if (!text.length) {
        $pinCode.addClass('error');
        $('#sms .js-sms-limit').html('Введите код').show();
        return;
      } else if (!/^[0-9]+$/.test(text)) {
        $pinCode.addClass('error');
        $('#sms .js-sms-limit').html('Неверный код').show();
        return;
      }
      $('#sms .js-sms-limit').hide().html('');
      $('#sms .img').show();
      $.ajax({
        url: Crypt.Urls.CheckSmsPin,
        data: {
          pinCode: text,
          retUrl: $('#retUrl').val()
        }
      }).always(function(response) {
        $('#sms .img').hide();
        if (response.success) {
          loginCookie('initTab', 'kobil');
          loginCookie('email', $login1.val());
          location.href = response.redirect;
        } else {
          $('#sms').addClass('error');
          $('#sms .js-sms-limit').html('Неверный код').show();
          window.checkPinCount = window.checkPinCount + 1;
        }
      });
    };
    checkTime = function() {
      var date, obj;
      obj = $('#sms .time');
      date = getDate($(obj).text());
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        window.fancyboxRedirect = false;
        setTimeout(checkTime, 1000);
      } else {
        date = new Date(date.getTime() - 1000);
        $(obj).text(getDateFormat(date));
        setTimeout(checkTime, 1000);
      }
    };
    showResendBut = function() {
      $('#resend').removeAttr('disabled');
    };
    $('#resend').click(function() {
      $('#sms .error').hide();
      $('#sms .img').show();
      $.ajax({
        url: Crypt.Urls.ResendSms
      }).always(function(response) {
        $('#sms .img').hide();
        if (response.success) {
          $('#sms .time').text(getDateFormat(startTime));
          $('#resend').attr('disabled', 'disabled');
          window.showResendTimer = setTimeout(showResendBut, 59 * 1000);
          $pinCode.focus();
        } else {
          $('#sms .error').html(response.message).show();
          if (response.errorCode === 7) {
            $('#resend').attr('disabled', 'disabled');
            $('#send-pin').attr('disabled', 'disabled');
          }
        }
      });
    });
    $('#send-pin').click(function() {
      checkPin($pinCode.val());
    });
    $pinCode.keypress(function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        checkPin($pinCode.val());
      }
    });
    $('#close-pin').click(function() {
      location.href = Crypt.Urls.Login;
    });
    $pinCode.focus(function() {
      $(this).removeClass('error');
      $('#sms .info').hide();
      $('#sms .error').hide();
    });
    $.fancybox.open('#sms', {
      afterClose: function() {
        if (window.fancyboxRedirect) {
          location.href = Crypt.Urls.Login;
        } else {
          Crypt.Preloader.UnBlock($('.login-area'));
          $('#clickButton').removeAttr('disabled');
        }
      },
      helpers: {
        overlay: {
          closeClick: false
        }
      },
      topRatio: 0.2,
      autoCenter: false
    });
    setTimeout(checkTime, 1000);
    window.showResendTimer = setTimeout(showResendBut, 59 * 1000);
    $pinCode.focus();
  };

  getRegPhone = function() {
    return Number($('input[name=Phone]').val().replace(/\D+/g, ""));
  };

  showRegistrationError = function(error) {
    new Crypt.Dialog().Open({
      type: 'blankError',
      text: error.Message
    });
  };

  submitRegForm = function() {
    return $.ajax({
      url: '/registration',
      data: {
        'Model.Phone': getRegPhone(),
        'Model.FIO': $('input[name=FIO]').val(),
        'Model.City': $('input[name=City]').val(),
        'Model.Email': $('input[name=Email]').val(),
        'Model.Password': $('input[name=Password]').val()
      },
      success: function(response) {
        if (response.Error) {
          showRegistrationError(response.Error);
        } else {
          new Crypt.Dialog().Open('blankCentered', {
            title: 'Благодарим Вас за регистрацию!',
            text: 'Ура, вы теперь в Cryptogramm, осталось только войти в систему!<br>Для этого воспользуйтесь формой авторизации'
          });
        }
        Crypt.Preloader.UnBlock($registrationBox);
      },
      error: function() {
        new Crypt.Dialog().Open('blankCentered', {
          title: 'Произошла ошибка!',
          text: 'При регистрации вашей учетной записи произошла ошибка. Приносим свои<br>извинения за предоставленные неудобства. Повторите попытку регистрации чуть<br>позже. Cryptogramm очень жаль, что это случилось именно с вами, обычно мы<br>работам хорошо...'
        });
        Crypt.Preloader.UnBlock($registrationBox);
        return false;
      }
    });
  };


  /**
    Поднимаем диалог подтверждения телефона
   */

  checkRegPhone = function() {
    var RegPhoneConfirm;
    RegPhoneConfirm = new Crypt.Dialogs.RegPhoneConfirm();
    RegPhoneConfirm.initialize(getRegPhone(), {
      success: _.bind(function() {
        return submitRegForm();
      }, this),
      canceled: function() {
        return Crypt.Preloader.UnBlock($registrationBox);
      }
    });
  };

  $(document).ready(function() {
    $registration.validate({
      rules: {
        FIO: {
          required: true,
          maxlength: 50
        },
        Phone: {
          required: true,
          minlength: 18,
          maxlength: 18
        },
        Email: {
          required: true,
          tnsEmail: true,
          maxlength: 50
        },
        Password: {
          required: true,
          minlength: 6,
          maxlength: 40,
          tnsPassword: true
        },
        City: 'required'
      },
      messages: {
        FIO: 'Введите ФИО',
        Phone: {
          required: 'Введите номер телефона',
          minlength: 'Введите номер, зарегистрированный в РФ, в международном формате, например +7 (123) 456-78-90',
          maxlength: 'Введите номер, зарегистрированный в РФ, в международном формате, например +7 (123) 456-78-90'
        },
        Email: {
          required: 'Введите E-mail',
          tnsEmail: 'Некорректный E-mail',
          maxlength: 'Некорректный E-mail'
        },
        Password: {
          required: 'Введите Пароль',
          minlength: 'Пароль не менее 6 символов должен включать цифры, заглавные и строчные латинские буквы',
          maxlength: 'Максимальная длина пароля равна 40 символам',
          tnsPassword: 'Пароль не менее 6 символов должен включать цифры, заглавные и строчные латинские буквы'
        },
        City: 'Введите город'
      },
      submitHandler: function() {
        Crypt.Preloader.Block($registrationBox);
        checkRegPhone();
        return false;
      }
    });
    $showRegistration.click(function() {
      Crypt.scrollTo($registration, 800);
      return false;
    });
    $registration.submit(function() {
      return false;
    });
    $("input.js-phone").mask("+7 (999) 999-99-99");
    new Opentip($(".js-registrationCity-tip"), "Город определен автоматически!<br>В случае если произошла<br>ошибка, выберите город<br>самостоятельно, из списка.", '', {
      tipJoint: "left",
      background: '#fff5d2',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#fee8ae'
    });
    $registration.find('input').on('focusout keypress', function() {
      var form, self;
      self = this;
      form = $(self).closest('form');
      return setTimeout((function() {
        var empty, errors;
        errors = !!form.find('input.error').length;
        empty = false;
        form.find("input").each(function(i, e) {
          if ($(e).val() === '') {
            return empty = true;
          }
        });
        $('.js-onRegistration').toggleClass('disabled', errors || empty);
      }), 200);
    });
    $login1.val($.cookie('email'));
    $kobilLogin2.val($.cookie('email'));
    if ($.cookie('initTab') === 'normal') {
      showNormalLogin();
    }
    if ($.cookie('initTab') === 'kobil') {
      showKobilLogin();
    }
    $tabsTitles.click(function(e) {
      var tab;
      tab = $(this).data('tab');
      $tabsTitles.removeClass('active');
      $(this).addClass('active');
      $('.tabs').hide();
      $('#tab-' + tab).show();
    });
    $('#retUrl').val(Crypt.Urls.retUrl.replace('&amp;', '&'));
    $('body').keypress(function(e) {
      if (e.keyCode === 13) {
        if (e.srcElement !== null) {
          if (e.srcElement.id !== 'pinCode' && e.srcElement.id !== 'kobilLogin') {
            getGuid();
          }
          if (e.srcElement.id === 'kobilLogin') {
            kobilLogin();
          }
        } else if (e.target !== null) {
          if (e.target.id !== 'pinCode' && e.target.id !== 'kobilLogin') {
            getGuid();
          }
          if (e.target.id === 'kobilLogin') {
            kobilLogin();
          }
        }
        e.preventDefault();
      }
    });
    $('#clickButton').click(function() {
      var login, password;
      login = $login1.val();
      password = $password.val();
      if (login === '' && password === '') {
        $password.addClass('error');
        $login1.addClass('error');
        $('.error-mess').show().html('Введите E-mail и пароль!');
      } else {
        getGuid();
      }
    });
    $('#kobilButton').click(function() {
      kobilLogin();
    });
    $login1.focus();
    $pinCode.val('');
    $('.js-show-normal-login').on('click', function() {
      showNormalLogin();
    });
    $('.js-show-kobil-login').on('click', function() {
      showKobilLogin();
    });
    $('.js-city-search').autocomplete({
      serviceUrl: '/registration/CityAutocomplete',
      paramName: "pattern",
      minChars: 3,
      dataType: 'json',
      transformResult: function(response) {
        return {
          suggestions: $.map(response.Cities, function(Item) {
            return {
              value: Item
            };
          })
        };
      }
    });
  });

}).call(this);
