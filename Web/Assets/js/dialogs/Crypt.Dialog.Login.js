
/**
 * Диалог подтверждения телефона при авторизации
 */
Crypt.Dialogs.Login = function() {
  return {
    timerTime: 180,
    template: 'regPhone',
    tryCount: 0,
    maxTryCount: 5,
    ln: Crypt.l18n.Login,

    /**
     * Запускаем диалог
     */
    initialize: function(data, callback) {
      this.fields = data;
      this.cb = callback;
      this.checkLogin();
    },

    /**
     * Рендерим шаблон, кэшируем объекты, запускаем таймер
     */
    render: function(time) {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, {});
      this.$content = this.dialog.$content;
      this.$title = this.$content.find('.js-dialog-title');
      this.$body = this.$content.find('.js-dialog-body');
      this.$timerEl = this.$content.find('.js-time');
      this.submitBtn = this.$content.find('.js-submit');
      this.resendBtn = this.$content.find('.js-resend');
      this.cancelBtn = this.$content.find('.js-close');
      this.$input = this.$content.find('.js-pin');
      this.$error = this.$content.find('.js-error');
      this.timer = new Crypt.Timer();
      this.timer.Init({
        el: this.$timerEl,
        startTime: this.timerTime
      }, {
        end: _.bind(function() {
          this.blockSubmit();
        }, this),
        canResend: _.bind(function() {
          this.activeResend();
        }, this)
      });
      $(this.dialog).on('onClose', _.bind(function() {
        this.timer.Stop();
        this.cb.canceled();
      }, this));
      this.setActions();
    },

    /**
     * Навешиваем обработчики
     */
    setActions: function() {
      this.resendBtn.on('click', _.bind(function() {
        this.resendSms();
      }, this));
      this.submitBtn.on('click', _.bind(function() {
        this.checkCode();
      }, this));
      this.cancelBtn.on('click', _.bind(function() {
        this.dialog.Close();
      }, this));
      this.$input.on('keypress', _.bind(function(e) {
        if (e.charCode === 13) {
          this.checkCode();
          return false;
        }
        if (this.$input.val().length === 4) {
          return false;
        }
        return this.hideError();
      }, this));
      this.$input.on('keyup', _.bind(function() {
        return this;
      }));
      this.$input.focus();
    },
    activeResend: function() {
      this.resendBtn.removeAttr('disabled');
    },
    blockResend: function() {
      this.resendBtn.attr('disabled', 'disabled');
    },
    blockSubmit: function() {
      this.submitBtn.attr('disabled', 'disabled');
    },
    activeSubmit: function() {
      this.submitBtn.removeAttr('disabled');
    },
    blockInput: function() {
      this.submitBtn.attr('disabled', 'disabled');
    },
    blockActinos: function() {
      this.blockSubmit();
      this.blockResend();
      this.blockInput();
      this.$input.val('');
    },
    showError: function(text) {
      this.$error.addClass('js-validation-error').html(text);
    },
    hideError: function() {
      this.$error.removeClass('js-validation-error').html('');
    },

    /**
     * Проверяем введенный пин
     */
    checkCode: function() {
      if (this.resendBtn.hasClass('disabled')) {
        return false;
      }
      if (this.$input.val() === '') {
        this.showError(this.ln.EnterCode);
        return false;
      }
      if (!/^[0-9]+$/.test(this.$input.val())) {
        this.showError(this.ln.WrongCode);
        return;
      }
      if (this.tryCount >= this.maxTryCount) {
        this.showError(this.ln.LoginMaxCount);
        this.blockActinos();
        this.timer.Stop();
        return false;
      }
      this.tryCount++;
      $('#sms .img').show();
      $.ajax({
        url: Crypt.Urls.CheckSmsPin,
        data: {
          pinCode: this.$input.val(),
          retUrl: $('#retUrl').val()
        },
        success: _.bind(function(response) {
          if (response.success) {
            this.cb.success(response.redirect);
          } else {
            this.showError(this.ln.WrongCode);
            this.$input.focus();
          }
        }, this)
      });
    },

    /**
     * Запрашиваем новый пин
     */
    resendSms: function() {
      if (this.resendBtn.hasClass('disabled')) {
        return false;
      }
      $.ajax({
        url: Crypt.Urls.ResendSmsReg,
        success: _.bind(function(response) {
          this.$input.val('');
          this.blockResend();
          if (response.success) {
            this.tryCount = 0;
            this.timer.Start();
            this.$input.focus();
            this.activeSubmit();
          } else {
            this.showError(response.message);
            this.timer.Stop();
            this.blockSubmit();
          }
        }, this)
      });
    },
    qs: function(key) {
      var match;
      key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, '\\$&');
      match = location.search.match(new RegExp('[?&]' + key + '=([^&]+)(&|$)'));
      return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },

    /**
    Проверяем введенные данные
     */
    checkLogin: function() {
      $.ajax({
        url: Crypt.Urls.LoginGuid,
        data: this.fields,
        success: _.bind(function(response) {
          var redirect, wnd;
          if (response.errorMsg) {
            this.cb.error(response);
            return;
          }
          switch (response.pin) {
            case 0:
              if (response.retUrl !== '') {
                redirect = response.retUrl;
              } else {
                if (this.qs('ReturnUrl') !== null) {
                  redirect = qs('ReturnUrl');
                }
              }
              this.cb.success(redirect);
              break;
            case 1:
              this.timerTime = response.pinWaitingTime;
              this.render();
              break;
            case 2:
              this.cb.kobil(response);
              break;
            default:
              wnd = window.open('about:blank', '_blank', 'height=800,width=1200,resizable=1,scrollbars=1');
              wnd.document.write(response);
          }
        }, this),
        error: _.bind(function(request, error, result) {
          var wnd;
          Crypt.Preloader.UnBlock($('.login-area'));
          wnd = window.open('about:blank', '_blank', 'height:100;width:100');
          wnd.document.write(request.responseText);
          return this.activeSubmit;
        }, this)
      });
    }
  };
};
