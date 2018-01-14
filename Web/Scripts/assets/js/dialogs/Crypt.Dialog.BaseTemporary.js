
/**
 * Диалог просто с текстом, автозакрытие по таймеру
 */
Crypt.Dialogs.BaseTemporary = function() {
  return {
    template: 'baseTemporary',
    closeAfter: 5000,

    /**
     * Запускаем диалог
     */
    initialize: function(options, callback) {
      this.options = options;
      this.cb = callback;
      if (options && options.closeAfter) {
        this.closeAfter = options.closeAfter;
      }
      this.render();
    },

    /**
     * Рендерим шаблон, кэшируем объекты, запускаем таймер
     */
    render: function() {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, {
        text: this.options.text ? this.options.text : ''
      });
      this.$content = this.dialog.$content;
      this.$body = this.$content.find('.js-dialog-body');
      this.$text = this.$body.find('.js-dialog-text');
      this.timeout = setTimeout(_.bind((function() {
        this.dialog.Close();
      }), this), this.closeAfter);
      $(this.dialog).on('onClose', _.bind(function() {
        clearTimeout(this.timeout);
      }, this));
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
      this.$input.on('keyup', _.bind(function() {}, this));
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
      if (this.resendBtn.hasClass('disabled')) {
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
        url: Crypt.Urls.CheckPhoneReg,
        data: {
          phone: this.phone
        },
        success: _.bind(function(response) {
          switch (response.Status) {
            case 2:
              if (this.isCorrectEmail) {
                new Crypt.Dialog().Open('blankError', this.ln.RegWrongPhone);
              } else {
                new Crypt.Dialog().Open('blankError', this.ln.RegWrongEmailAndPhone);
              }
              this.cb.canceled();
              break;
            case 0:
              if (!this.isCorrectEmail) {
                new Crypt.Dialog().Open('blankError', this.ln.RegWrongEmail);
                this.cb.canceled();
              } else {
                this.token = response.SmsConfirmationToken;
                this.render();
              }
          }
        }, this),
        error: _.bind(function() {
          Crypt.Preloader.UnBlock(this.$content);
          this.cb.error();
        }, this)
      });
    }
  };
};
