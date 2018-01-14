
/**
 * Лоадер при создании сертификата.
 * Так уж получилось что и запрос отправляет тоже он :(
 */
Crypt.Dialogs.RequestCongratulation = Crypt.View.extend({
  template: 'RequestCongratulation',

  /**
   * Запускаем диалог
   */
  initialize: function(val, callback) {
    this.pin = val;
    this.cb = callback;
    this.render();
  },

  /**
   * Рендерим шаблон, кэшируем объекты
   */
  render: function() {
    this.dialog = new Crypt.Dialog();
    this.dialog.Open(this.template, [], {
      wrapCSS: 'blank-centered',
      closeBtn: false
    });
    this.$content = this.dialog.$content;
    this.$cancel = this.$content.find('.js-cancel');
    $(this.dialog).on('onClose', _.bind(function() {
      location.reload();
    }, this));
  }
});
