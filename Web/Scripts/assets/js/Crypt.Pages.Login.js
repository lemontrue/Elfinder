var Crypt;

var getUrlParam = function parseSecond(val) {
    var result = false,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    }
    return result;
};
 
Crypt = window.Crypt || {};

Crypt.Pages.Login = _.extend(Crypt.Pages, {
  checkPinCount: 0,
  fancyboxRedirect: true,
  ln: Crypt.l18n.Login,
  initialize: function() {
    this.ln = Crypt.l18n.Login;
    this.$error = $('.error-mess');
    this.$normalLogin = $('#normalLogin');
    this.$kobilLogin = $('#TaxnetId');
    this.$tabsTitles = $('#login .titles .title');
    this.$login1 = $('#login1');
    this.$kobilButton = $('#kobilButton');
    this.$password = $('#password');
    this.$pinCode = $('#pinCode');
    this.$kobilLogin2 = $('#kobilLogin');
    return this.render();
  },
  render: function() {
    this.$login1.val($.cookie('email')).focus();
    this.$kobilLogin2.val($.cookie('email'));
    this.$pinCode.val('');
    this.$showRegistration = $('.js-show-registration');
    $('#retUrl').val(Crypt.Urls.retUrl.replace('&amp;', '&'));
    if ($.cookie('initTab') === 'normal') {
      this.showNormalLogin();
    }
    if ($.cookie('initTab') === 'kobil') {
      this.showKobilLogin();
    }
    return this.onEvents();
  },
  onEvents: function() {
    this.$showRegistration.on('click', function() {
      $.cookie('haveAccount', null, {
        path: '/'
      });
      return true;
    });
    this.$tabsTitles.click(_.bind(function() {
      var tab;
      tab = $(this).data('tab');
      this.$tabsTitles.removeClass('active');
      $(this).addClass('active');
      $('.tabs').hide();
      $('#tab-' + tab).show();
    }, this));
    $('body').keypress(_.bind(function(e) {
      var id;
      if (e.keyCode === 13) {
        id = e.target.id;
        Crypt.Preloader.Block($('.login-area'));
        if (e.target !== null) {
          if (id !== 'pinCode' && id !== 'kobilLogin') {
            this.getGuid();
          }
          if (id === 'kobilLogin') {
            this.kobilLogin();
          }
        } else if (e.target !== null) {
          if (id !== 'pinCode' && id !== 'kobilLogin') {
            this.getGuid();
          }
          if (id === 'kobilLogin') {
            this.kobilLogin();
          }
        }
        e.preventDefault();
      }
    }, this));
    $('#clickButton').click(_.bind(function() {
      var login, password;
      Crypt.Preloader.Block($('.login-area'));
      login = this.$login1.val();
      password = this.$password.val();
      if (login === '' && password === '') {
        this.$password.addClass('error');
        this.$login1.addClass('error');
        this.showError('Введите E-mail и пароль!');
        Crypt.Preloader.UnBlock($('.login-area'));
      } else {
        this.getGuid();
      }
    }, this));
    $('#kobilButton').click(_.bind(function() {
      this.kobilLogin();
    }, this));
    $('.js-show-normal-login').on('click', _.bind(function() {
      this.showNormalLogin();
    }, this));
    $('.js-show-kobil-login').on('click', _.bind(function() {
      this.showKobilLogin();
    }, this));
  },
  loginCookie: function(name, val, time, path) {
    return $.cookie(name, val, {
      expires: time ? time : 365,
      path: path ? path : '/'
    });
  },
  showNormalLogin: function(email) {
    this.$error.hide();
    this.$normalLogin.show();
    this.$kobilLogin.hide();
    if (email !== void 0) {
      this.$login1.val(email);
      this.$password.addClass('error');
    }
    this.$tabsTitles.removeClass('active').filter('[data-tab="login"]').addClass('active');
  },
  showKobilLogin: function() {
    this.$error.hide();
    this.$normalLogin.hide();
    this.$kobilLogin.show();
    this.$tabsTitles.removeClass('active').filter('[data-tab="taxnet"]').addClass('active');
  },
  showError: function(text) {
    return this.$error.html(text).show();
  },
  kobilLogin: function() {
    this.$kobilButton.attr('disabled', 'true');
    if (this.$kobilLogin2.val() !== '') {
      $.ajax({
        url: Crypt.Urls.KobilLogin,
        data: {
          login: this.$kobilLogin2.val()
        },
        success: _.bind(function(result) {
          if (result.errorMsg && result.errorMsg !== null) {
            if (result.errorCode === 4 || result.errorCode === 5) {
              this.showNormalLogin(this.$kobilLogin2.val());
              $('#clickButton').removeAttr('disabled');
            }
            Crypt.Preloader.UnBlock($('.login-area'));
            this.showError(result.errorMsg);
            this.$kobilButton.removeAttr('disabled');
            return;
          }
          if (result.pin === 2) {
            this.loginCookie('initTab', 'kobil');
            this.showKobilWindow(result.KobilTransactionWaitingTime, result.KobilPollingTime, 'kobilLogin');
          } else if (!result.KobilAuthEnabled) {
            this.showNormalLogin();
            Crypt.Preloader.UnBlock($('.login-area'));
            this.showError('Отключен вход по TaxnetId');
            $('#clickButton').removeAttr('disabled');
          }
          this.$kobilButton.removeAttr('disabled');
        }, this),
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
      Crypt.Preloader.UnBlock($('.login-area'));
      this.$kobilButton.removeAttr('disabled');
      this.showError('Введите E-mail');
      this.$kobilLogin2.addClass('error');
    }
  },
  getGuid: function() {
    var loignDialog;
    loignDialog = new Crypt.Dialogs.Login();
    loignDialog.initialize({
      login1: this.$login1.val(),
      password: this.$password.val()
    }, {
      success: _.bind(function(response) {
        this.loginCookie('initTab', 'normal');
        if ($('#saveEmailNormal').prop('checked')) {
          this.loginCookie('email', this.$login1.val());
        }
        $.cookie('haveAccount', true, {
          expires: 365,
          path: '/'
        });
        $.cookie('logined', true, {
          expires: 365,
          path: '/'
        });
        var retUrl = getUrlParam('ReturnUrl');
        location.href = retUrl ? retUrl : response;
        loation.href = response;
      }, this),
      kobil: _.bind(function(result) {
        Crypt.Preloader.UnBlock($('.login-area'));
        this.loginCookie('initTab', 'kobil');
        return this.showKobilWindow(result.KobilTransactionWaitingTime, result.KobilPollingTime, 'normalLogin');
      }, this),
      error: _.bind(function(response) {
        Crypt.Preloader.UnBlock($('.login-area'));
        if (response.errorCode === 4) {
          this.$password.addClass('error');
        }
        this.showError(response.errorMsg);
        return this.activeSubmit;
      }, this),
      canceled: function() {
        return Crypt.Preloader.UnBlock($('.login-area'));
      }
    });
  },
  showKobilWindow: function(time, pollingTime, sender) {
    var checkInterval, checkTime, kobil, startTime, stopCheckKobil, stopTimeKobil, timeDiv;
    this.loginCookie('email', this.$login1.val());
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
        success: _.bind(function(response) {
          if (typeof response.Status === 'undefined') {
            if (response.message) {
              console.log(response.message);
            }
            alert('Произошла неизвестная ошибка');
            location.href = Crypt.Urls.Login;
          } else if (response.Status === 1) {
            if (sender === 'normalLogin') {
              if ($('#saveEmailNormal').prop('checked')) {
                this.loginCookie('email', $login1.val());
              }
            }
            if (sender === 'kobilLogin') {
              if ($('#saveEmailKobil').prop('checked')) {
                this.loginCookie('email', $kobilLogin2.val());
              }
            }
            $.cookie('haveAccount', true, {
              expires: 365,
              path: '/'
            });
            $.cookie('logined', true, {
              expires: 365,
              path: '/'
            });
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
        }, this),
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
  }
});

Crypt.Pages.Login.initialize();
