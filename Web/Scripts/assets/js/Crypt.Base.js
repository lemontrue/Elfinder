var getDate, getDateFormat, log;

$.ajaxSetup({
  async: true,
  type: 'POST'
});

log = function(t) {
  console.log(t);
};

Crypt.scrollTo = function(el, speed) {
  speed = speed ? speed : 700;
  $('html, body').animate({
    scrollTop: el.offset().top
  }, speed);
};

getDateFormat = function(date) {
  return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
};

getDate = function(str) {
  var del, m, mEnd, s, sStart;
  if (!str.length) {
    return new Date(1, 1);
  }
  del = str.indexOf(':');
  mEnd = del !== -1 ? del : 0;
  sStart = del !== -1 ? del + 1 : str.length;
  m = parseInt(str.substring(0, mEnd));
  s = parseInt(str.substring(sStart, str.length));
  if (isNaN(m) || isNaN(s)) {
    return new Date(1, 1);
  }
  return new Date(new Date(new Date(1, 1).setSeconds(s)).setMinutes(m));
};

$(document).ready(function() {
  if ($.validator) {
    $.validator.addMethod('tnsPassword', (function(value, element) {
      return this.optional(element) || (/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/.test(value) && /^[a-z0-9]+$/i.test(value));
    }), '');
    $.validator.addMethod('tnsEmail', (function(value, element) {
      return this.optional(element) || /^(("[A-Za-z0-9][\w-\s]+[A-Za-z0-9]")|([A-Za-z0-9][\w-]+(?:\.[\w-]+)*[A-Za-z0-9])|("[A-Za-z0-9][\w-\s]+")([\w-]+(?:\.[\w-]+)*[A-Za-z0-9]))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i.test(value);
    }), '');
  }
});
