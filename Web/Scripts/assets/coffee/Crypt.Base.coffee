$.ajaxSetup({
  async: true
  type: 'POST'
});

# shot syntax
log = (t) ->
  console.log t
  return

# Скроллим к элементу
Crypt.scrollTo = (el, speed) ->
  speed = if speed then speed else 700
  $('html, body').animate({
    scrollTop: el.offset().top
  }, speed);
  return

getDateFormat = (date) ->
  (if date.getMinutes() < 10 then '0' else '') + date.getMinutes() + ':' + (if date.getSeconds() < 10 then '0' else '') + date.getSeconds()

getDate = (str) ->
  if !str.length
    return new Date(1, 1)
  del = str.indexOf(':')
  mEnd = if del != -1 then del else 0
  sStart = if del != -1 then (del + 1) else str.length
  m = parseInt(str.substring(0, mEnd))
  s = parseInt(str.substring(sStart, str.length))

  if isNaN(m) or isNaN(s)
    return new Date(1, 1)
  new Date(new Date(new Date(1, 1).setSeconds(s)).setMinutes(m))

$(document).ready ->
  #pass validation
  if ($.validator)
    $.validator.addMethod 'tnsPassword', ((value, element) ->
      @optional(element) or (/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*)/.test(value) and /^[a-z0-9]+$/i.test(value))
    ), ''
    $.validator.addMethod 'tnsEmail', ((value, element) ->
#      @optional(element) or /^([A-Za-z0-9]+\.{0,1})+([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]*[A-Za-z0-9]+@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{2,6}$/.test(value);
      @optional(element) or /^(("[A-Za-z0-9][\w-\s]+[A-Za-z0-9]")|([A-Za-z0-9][\w-]+(?:\.[\w-]+)*[A-Za-z0-9])|("[A-Za-z0-9][\w-\s]+")([\w-]+(?:\.[\w-]+)*[A-Za-z0-9]))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i.test(value);
    ), ''

  return