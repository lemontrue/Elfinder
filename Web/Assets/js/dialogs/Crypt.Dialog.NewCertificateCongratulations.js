
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
      var regTipOptions;
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, [], {
        wrapCSS: 'styled-modal',
        margin: 0,
        padding: 0
      });
      $(this.dialog).on('onClose', _.bind(function() {
        location.href = Crypt.Urls.Login;
      }, this));
      regTipOptions = {
        tipJoint: 'left',
        background: '#fff5d2',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fee8ae'
      };
      $('.js-congrat-test-tip').on('click', function(e) {
        return false;
      });
      new Opentip($('.js-congrat-test-tip'), 'Сертификат выпущен без участия аккредитованного Удостоверяющего Центра и не имеет юридической силы', '', regTipOptions);
      Opentip.lastZIndex = 9000;
    }
  };
};
