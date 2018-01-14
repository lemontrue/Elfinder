
/**
 * Лоадер при создании сертификата.
 * Так уж получилось что и запрос отправляет тоже он :(
 */

(function() {
  Crypt.Dialogs.NewCertificateLoader = function() {
    return {
      template: 'NewCertificateLoader',

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
          wrapCSS: 'thin-modal',
          closeBtn: false
        });
        this.$content = this.dialog.$content;
        this.$cancel = this.$content.find('.js-cancel');
        this.start();
      },
      onSuccess: function(response) {
        new Crypt.Dialogs.NewCertificateCongratulations().initialize();
        this.cb.success(response.CertificateInfo);
      },
      onFail: function() {
        new Crypt.Dialog().Open('blankError', {
          text: Crypt.l18n.NewCertificate.error
        });
        this.activeSubmit;
      },
      start: function() {
        this.xhr = $.ajax({
          url: Crypt.Urls.CreateTestCertificate,
          data: {
            pin: this.pin
          },
          success: _.bind(function(response) {
            if (response && !response.Error) {
              this.onSuccess(response);
            } else {
              this.onFail();
            }
          }, this),
          error: _.bind(function() {
            return this.onFail();
          }, this)
        });
        this.$cancel.on('click', _.bind(function(e) {
          this.xhr.abort();
          this.dialog.Close();
          e.preventDefault();
          return false;
        }, this));
      }
    };
  };

}).call(this);
