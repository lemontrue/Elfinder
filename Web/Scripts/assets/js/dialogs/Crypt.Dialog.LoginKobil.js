
/**
 * Диалог проверки телефона при регистрации
 */
Crypt.Dialogs.LoginKobil = function() {
  return {
    timerTime: 180,
    template: 'regPhone',
    tryCount: 0,
    maxTryCount: 5,
    ln: Crypt.l18n.Login,

    /**
     * Запускаем диалог
     */
    initialize: function(time, callback) {
      var _ref;
      this.timerTime = (_ref = !!time) != null ? _ref : {
        time: this.timerTime
      };
      this.cb = callback;
    },

    /**
     * Рендерим шаблон, кэшируем объекты, запускаем таймер
     */
    render: function() {
      this.dialog = new Crypt.Dialog().Open(this.template, {});
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
          return;
          return this;
        }),
        canResend: _.bind(function() {
          this.activeResend();
          return;
          return this;
        })
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
            this.cb.success(response);
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
        data: {
          smsConfirmationToken: this.token
        },
        success: _.bind(function(response) {
          this.$input.val('');
          this.blockResend();
          if (response.success) {
            this.token = response.SmsConfirmationToken;
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
    kobilLogin: function() {
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
    }
  };
};
