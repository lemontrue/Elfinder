
/**
 * Диалог проверки телефона при регистрации
 */
Crypt.Dialogs.ConfirmRequestPin = Crypt.View.extend({
  template: 'requestConfirmPin',
  isCancel: true,

  /**
   * Запускаем диалог
   */
  initialize: function(callback) {
    this.cb = callback;
    this.render();
  },

  /**
   * Рендерим шаблон, вешаем обработчики
   */
  render: function() {
    this.dialog = new Crypt.Dialog();
    this.dialog.Open(this.template, {}, {
      afterClose: _.bind(function() {
        if (this.isCancel) {
          Crypt.Preloader.UnBlock($('#myCertificateList'));
        }
      }, this)
    });
    this.$content = this.dialog.$content;
    this.$submitBtn = this.$content.find('.js-submit');
    this.$elPin = this.$content.find('.js-pin');
    this.$elCancel = this.$content.find('.js-close');
    this.$elCancel.on('click', _.bind(function() {
      this.dialog.Close();
      return false;
    }, this));
    this.$submitBtn.on('click', _.bind(function() {
      this.isCancel = false;
      this.cb(this.$elPin.val());
      return false;
    }, this));
  }
});
