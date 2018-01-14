
/**
 * Диалог проверки телефона при регистрации
 */
Crypt.Dialogs.RegPhoneConfirm = function() {
  return {
    timerTime: 180,
    template: 'regPhone',
    tryCount: 0,
    maxTryCount: 5,
    ln: Crypt.l18n.Login,

    /**
     * Запускаем диалог
     */
    initialize: function(phone, email, callback) {
      this.phone = phone;
      this.email = email;
      this.cb = callback;
      this.$registrationBox = $('.js-registration-box');
      this.checkPhone();
    },

    /**
     * Рендерим шаблон, кэшируем объекты, запускаем таймер
     */
    render: function() {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, {});
      this.$content = this.dialog.$content;
      this.$title = this.$content.find('.js-dialog-title');
      this.$body = this.$content.find('.js-dialog-body');
      this.$timerEl = this.$content.find('.js-time');
      this.$submitBtn = this.$content.find('.js-submit');
      this.$resendBtn = this.$content.find('.js-resend');
      this.$cancelBtn = this.$content.find('.js-close');
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
      setTimeout(_.bind((function() {
        this.$input.focus();
      }), this), 100);
    },

    /**
     * Навешиваем обработчики
     */
    setActions: function() {
      this.$resendBtn.on('click', _.bind(function() {
        this.resendSms();
      }, this));
      this.$submitBtn.on('click', _.bind(function() {
        this.checkCode();
      }, this));
      this.$cancelBtn.on('click', _.bind(function() {
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
      this.$input.on('keyup', _.bind(function() {}, this));
      this.$input.focus();
    },
    activeResend: function() {
      this.$resendBtn.removeAttr('disabled');
    },
    blockResend: function() {
      this.$resendBtn.attr('disabled', 'disabled');
    },
    blockSubmit: function() {
      this.$submitBtn.attr('disabled', 'disabled');
    },
    activeSubmit: function() {
      this.$submitBtn.removeAttr('disabled');
    },
    blockInput: function() {
      this.$submitBtn.attr('disabled', 'disabled');
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
      if (this.$resendBtn.hasClass('disabled')) {
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
        this.showError(this.ln.RegMaxCount);
        this.blockActinos();
        this.timer.Stop();
        return false;
      }
      this.tryCount++;
      Crypt.Preloader.Block(this.$content);
      $.ajax({
        url: Crypt.Urls.SmsConfirmReg,
        data: {
          PIN: this.$input.val(),
          smsConfirmationToken: this.token
        },
        success: _.bind(function(response) {
          this.$input.val('');
          switch (response.Status) {
            case 0:
              this.dialog.Close();
              this.cb.success();
              break;
            case 4:
              Crypt.Preloader.UnBlock(this.$content);
              this.showError(this.ln.RegMaxCount);
              this.blockActinos();
              this.timer.Stop();
              break;
            case 5:
              Crypt.Preloader.UnBlock(this.$content);
              this.showError(this.ln.WrongCode);
              this.$input.focus();
          }
        }, this),
        error: _.bind(function() {
          Crypt.Preloader.UnBlock(this.$content);
          this.cb.error();
        }, this)
      });
    },

    /**
     * Запрашиваем новый пин
     */
    resendSms: function() {
      if (this.$resendBtn.hasClass('disabled')) {
        return false;
      }
      Crypt.Preloader.UnBlock(this.$content);
      $.ajax({
        url: Crypt.Urls.ResendSmsReg,
        data: {
          smsConfirmationToken: this.token
        },
        success: _.bind(function(response) {
          Crypt.Preloader.UnBlock(this.$content);
          this.token = response.SmsConfirmationToken;
          this.tryCount = 0;
          this.timer.Start();
          this.$input.val('').focus();
          this.activeSubmit();
          this.blockResend();
        }, this),
        error: _.bind(function() {
          Crypt.Preloader.UnBlock(this.$content);
          this.cb.error();
        }, this)
      });
    },

    /**
     * проверка телефона и первый запрос пина
     */
    checkPhone: function() {
      $.ajax({
        url: Crypt.Urls.CheckPhoneNEmail,
        data: {
          phone: this.phone,
          email: this.email
        },
        success: _.bind(function(response) {
          if (response && response.Status === 0) {
            this.token = response.SmsConfirmationToken;
            this.render();
          } else {
            new Crypt.Dialog().Open('blankCentered', {
              title: 'Внимание!',
              text: response.Error.Message
            });
          }
          Crypt.Preloader.UnBlock(this.$registrationBox);
        }, this),
        error: _.bind(function() {
          new Crypt.Dialog().Open('blankCentered', this.ln.ErrorReg);
          Crypt.Preloader.UnBlock(this.$registrationBox);
          return this;
        })
      });
    }
  };
};
