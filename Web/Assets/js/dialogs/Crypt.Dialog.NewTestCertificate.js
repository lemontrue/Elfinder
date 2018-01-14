
/**
 * Запрос пина для нового тестового тертификата
 */
Crypt.Dialogs.NewTestCertificate = function() {
  return {
    template: 'NewTestCertificateModal',

    /**
     * Запускаем диалог
     */
    initialize: function(callback) {
      this.cb = callback;
      this.render();
    },

    /**
     * Рендерим шаблон, кэшируем объекты
     */
    render: function() {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, [], {
        wrapCSS: 'thin-modal'
      });
      this.$content = this.dialog.$content;
      this.$submit = this.$content.find('.js-submit');
      this.$input = this.$content.find('.js-pinCode');
      this.$eye = this.$content.find('.js-eye');
      this.$error = this.$content.find('.js-error');
      this.$error.hide();
      this.setEvents();
    },
    setEvents: function() {
      this.$eye.on('click', _.bind(function() {
        this.$eye.toggleClass('i-visible');
        this.$input.prop('type', this.$eye.hasClass('i-visible') ? 'text' : 'password');
      }, this));
      this.$input.on('keypress', _.bind(function() {
        this.$error.hide();
      }, this));
      this.$input.on('focus', _.bind(function() {
        this.$error.hide();
      }, this));
      this.$submit.on('click', _.bind(function(e) {
        var val;
        val = this.$input.val();
        if (!val) {
          this.$error.html('Введите ПИН-код').show();
          return false;
        } else if (val.length !== 8) {
          this.$error.html('ПИН-код должен состоять из 8 цифр').show();
          return false;
        } else if (!/^[a-z0-9]+$/i.test(val)) {
          this.$error.html('ПИН-код может содержать только цифры').show();
          return false;
        }
        new Crypt.Dialogs.NewCertificateLoader().initialize(this.$input.val(), this.cb);
        e.preventDefault();
        return false;
      }, this));
      $(this.dialog).on('onClose', _.bind(function() {
        this.cb.canceled();
      }, this));
    }
  };
};
