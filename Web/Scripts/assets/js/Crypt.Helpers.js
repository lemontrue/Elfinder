var Crypt;

Crypt = Crypt || {};

Crypt.Helpers = {
  PhoneMask: function(el) {
    if (el) {
      return $(el).mask("+7 (999) 999-99-99");
    }
  }
};
