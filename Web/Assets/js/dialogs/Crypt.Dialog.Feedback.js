
/**
 * Диалог обратной связи
 */
Crypt.Dialogs.Feedback = function() {
  return {
    closeAfter: 3000,
    template: 'feedback',
    valid: true,

    /**
     * Запускаем диалог
     */
    initialize: function(options, callback) {
      this.cb = callback;
      this.render();
    },

    /**
     * Рендерим шаблон, кэшируем объекты, запускаем таймер
     */
    render: function() {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, {}, {
        wrapCSS: 'modern-modal'
      });
      this.$content = this.dialog.$content;
      this.$title = this.$content.find('.js-dialog-title');
      this.$body = this.$content.find('.js-dialog-body');
      this.submitBtn = this.$content.find('.js-submit');
      this.$fields = this.$content.find('.js-field');
      this.$name = this.$content.find('.js-name');
      this.$phone = this.$content.find('.js-phone');
      this.$email = this.$content.find('.js-email');
      this.$message = this.$content.find('.js-message');
      Crypt.Helpers.MaskPhone($("input.js-phone"));
      this.setActions();
    },

    /**
     * Навешиваем обработчики
     */
    setActions: function() {
      this.submitBtn.on('click', _.bind(function() {
        this.onSubmit();
      }, this));
      this.$fields.on('keypress', _.bind(function(e) {
        this.hideError(e);
      }, this));
      this.$fields.on('keyup blur', _.bind(function() {
        this.submitBtn.toggleClass('i-disabled', !this.liveValidate());
      }, this));
    },
    onSubmit: function() {
      if (this.submitBtn.hasClass('disabled')) {
        return false;
      }
      Crypt.Preloader.Block(this.$content);
      this.submitBtn.addClass('disabled');
      if (!this.validate()) {
        this.submitBtn.removeClass('disabled');
        Crypt.Preloader.UnBlock(this.$content);
      } else {
        $.ajax({
          url: Crypt.Urls.SendToSupport,
          data: {
            name: this.$name.val(),
            phone: this.$phone.val(),
            email: this.$email.val(),
            message: this.$message.val()
          },
          success: _.bind(function(response) {
            if (response && response.Status === 0) {
              this.onSuccess();
            } else {
              this.onFail();
            }
          }, this),
          error: _.bind(function() {
            this.onFail();
          }, this)
        });
      }
    },
    validate: function() {
      if (!this.$email.val().length && !this.$phone.val().length) {
        this.showError(this.$phone, 'Заполните поле Телефон или E-mail!<br>Иначе как же мы с Вами свяжемся?');
      }
      if (!this.$message.val().length) {
        this.showError(this.$message, 'Введите Ваше сообщение! Если Вам действительно есть о чем с нами поговорить.');
      }
      return this.valid;
    },
    liveValidate: function() {
      if (!this.$email.val().length && !this.$phone.val().length) {
        return false;
      }
      if (!this.$message.val().length) {
        return false;
      }
      return true;
    },
    showError: function(el, message) {
      el.parent().append('<label for="" class="error">' + message + '</label>');
      this.valid = false;
    },
    hideError: function(e) {
      $(e.currentTarget).parent().find('label.error').remove();
      this.valid = true;
    },
    onFail: function() {
      Crypt.Preloader.UnBlock(this.$content);
      this.submitBtn.removeClass('disabled');
      return Crypt.Dialogs.BaseTemporary().initialize({
        text: Crypt.l18n.Feedback.Error
      });
    },
    onSuccess: function() {
      return Crypt.Dialogs.BaseTemporary().initialize({
        text: Crypt.l18n.Feedback.Success
      });
    }
  };
};
