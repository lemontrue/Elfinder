
/**
 * Приветственный диалог
 */
Crypt.Dialogs.Welcome = function() {
  return {
    template: 'welcomeModal',
    ln: Crypt.l18n.Profile,
    cookie: 'hideWelcome',

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
      var afterRegistration, data, lang, single;
      if ($.cookie(this.cookie) || !ShowWelcomeModal) {
        return false;
      }
      afterRegistration = $.cookie('afterRegistration');
      $.cookie('afterRegistration', 'false', {
        expires: 5,
        path: '/'
      });
      single = EmailConfirmed || HasMyCert;
      lang = afterRegistration === 'true' ? this.ln.WelcomeModalFirst : this.ln.WelcomeModalSecond;
      data = _.extend(lang, {
        EmailConfirmed: EmailConfirmed,
        HasMyCert: HasMyCert,
        Single: single,
        First: afterRegistration === 'true'
      });
      this.dialog = new Crypt.Dialog();
      this.dialog.Open(this.template, data, {
        wrapCSS: 'styled-modal',
        margin: 0,
        padding: 0,
        minHeight: 600
      });
      this.$content = this.dialog.$content;
      this.$checkbox = this.$content.find('.js-hide-modal');
      this.$checkbox.on('change', _.bind(function(e) {
        if ($(e.currentTarget).prop('checked')) {
          $.cookie(this.cookie, 'true', {
            expires: 365,
            path: '/'
          });
        }
      }, this));
      $(this.dialog).on('onClose', _.bind(function() {
        this.cb.canceled();
      }, this));
    }
  };
};
