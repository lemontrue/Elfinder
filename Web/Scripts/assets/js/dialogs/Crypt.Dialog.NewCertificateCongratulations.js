
/**
 * Поздравление с сертификатом
 */
Crypt.Dialogs.NewCertificateCongratulations = function() {
  return {
    template: 'NewCertificateCongratulations',

    /**
     * Запускаем диалог
     */
    initialize: function() {
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, [], {
        wrapCSS: 'styled-modal',
        margin: 0,
        padding: 0
      });
      $(this.dialog).on('onClose', _.bind(function() {
        location.href = Crypt.Urls.Login;
      }, this));
    }
  };
};
