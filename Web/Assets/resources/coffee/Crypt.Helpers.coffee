Crypt = Crypt or {}


Crypt.Helpers = {

  ###*
   * Все врендеренные данные для текущей страницы мы складируем в этой переменной
   * @param key
   * @returns {*}
   * @constructor
  ###
  GetRenderedData: (key) ->
    if YouDo.RenderedData and !_.isUndefined(YouDo.RenderedData[key]) then YouDo.RenderedData[key] else false

  ###*
  # Нажатие Enter
  # @param event
  # @returns {boolean}
  ###
  IsEnter: (event) ->
    code = event.keyCode || event.which;
    return (code == 13 || code == 10);

  ###*
   * Нажатие Escape
   * @param event
   * @returns {boolean}
   * @constructor
  ###
  IsEsc:(event) ->
    code = event.keyCode or event.which
    code == 27

  ###*
  * Нажатие Ctrl+Enter || Ctrl+Return
  * @param event
  * @returns {boolean}
  * @constructor
  ###
  IsCtrlEnter:(event) ->
    code = event.keyCode or event.which
    (code == 13 or code == 10) and event.ctrlKey

  ###*
  * Получаем параметриз урла
  ###
  getUrlParam: (val) ->
    result = false
    tmp = []
    items = location.search.substr(1).split('&')
    index = 0
    while index < items.length
      tmp = items[index].split('=')
      if tmp[0] == val
        result = decodeURIComponent(tmp[1])
      index++
    result
  # Скроллим к элементу
  ScrollToEl:(el, speed, onComplete) ->
    this.ScrollTo(el.offset().top, speed, onComplete)

  # Скроллим вверх
  ScrollToTop:(speed, onComplete) ->
    this.ScrollTo(0, speed, onComplete)

  # основной метод скролла
  ScrollTo:(position, speed, onComplete) ->
    speed = if speed then speed else 'normal'
    onComplete = if _.isFunction(onComplete) then onComplete else Function.prototype;

    $('html, body').animate({
      scrollTop: position
    }, speed, _.once(onComplete));
    return

  # Дополняем нулями слева
  PadZero:(number, length) ->
    length = if !length then 2 else length
    str = '' + number
    while str.length < length
      str = '0' + str
    str

  GetFileExtension:(name) ->
    if -1 != name.indexOf('.') then name.replace(/.*[.]/, '') else ''

  Translit:(text) ->
    text = text.toLowerCase()
    space = '-'
    # Массив для транслитерации
    transl =
      'а': 'a'
      'б': 'b'
      'в': 'v'
      'г': 'g'
      'д': 'd'
      'е': 'e'
      'ё': 'e'
      'ж': 'zh'
      'з': 'z'
      'и': 'i'
      'й': 'j'
      'к': 'k'
      'л': 'l'
      'м': 'm'
      'н': 'n'
      'о': 'o'
      'п': 'p'
      'р': 'r'
      'с': 's'
      'т': 't'
      'у': 'u'
      'ф': 'f'
      'х': 'h'
      'ц': 'c'
      'ч': 'ch'
      'ш': 'sh'
      'щ': 'sh'
      'ъ': space
      'ы': 'y'
      'ь': space
      'э': 'e'
      'ю': 'yu'
      'я': 'ya'
      ' ': space
      '_': space
      '`': space
      '~': space
      '!': space
      '@': space
      '#': space
      '$': space
      '%': space
      '^': space
      '&': space
      '*': space
      '(': space
      ')': space
      '-': space
      '=': space
      '+': space
      '[': space
      ']': space
      '\\': space
      '|': space
      '/': space
      '.': space
      ',': space
      '{': space
      '}': space
      '\'': space
      '"': space
      ';': space
      ':': space
      '?': space
      '<': space
      '>': space
      '№': space
    result = ''
    current_sim = ''
    i = 0
    while i < text.length
      # Если символ найден в массиве то меняем его
      if transl[text[i]] != undefined
        if current_sim != transl[text[i]] or current_sim != space
          result += transl[text[i]]
          current_sim = transl[text[i]]
      else
        result += text[i]
        current_sim = text[i]
      i++
    result

  ###*
   * Пытаемся вытащить Timestamp из строки, числа или чего еще
   * @param {String|Number} date  /Date(1234567890moment()/, ISO8601, UNIX Timestamp
   * @returns {number}    UNIX Timestamp
   * @constructor
  ###
  ExtractTimestamp: (date) ->
    if _.isString(date) and date.indexOf('/') == 0
      Number date.substr(6, 13)
    else if _.isString(date) and (date.indexOf('Z') > -1 or date.indexOf('T') > -1)
      new Date(date).getTime()
    else if _.isString(date)
      Number date
    else if Number(date) == date
      date
    else if _.isDate(date)
      date.getTime()
    else
      null

  ruDate: (d) ->
    date = new Date(d)
    date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth() + 1] + ' ' + date.getFullYear()

  ###*
   * Получаем форматированную строку с датой
   * Добавляем leadingZero
   * @param {Object|Number|String}   dateObj      instanceof Date || .getTime()
   * @param {String}                 [separator]  Разделитель
   * @returns {String}
  ###
  GetDateFormatted: (dateObj, separator) ->
    dateObj = if dateObj instanceof Date then dateObj else new Date(dateObj)
    separator = if ! !separator then separator else '.'
    date = @PadZero(dateObj.getDate())
    month = @PadZero(dateObj.getMonth() + 1)
    year = dateObj.getFullYear()

    '{1}{0}{2}{0}{3}'.format separator, date, month, year

  ###*
   * Получаем форматированную строку со временем
   * Добавляем leadingZero
   * @param {Object|Number|String}   dateObj      instanceof Date || .getTime()
   * @returns {String}
  ###

  GetTimeFormatted: (dateObj) ->
    dateObj = if dateObj instanceof Date then dateObj else new Date(dateObj)
    hours = @PadZero(dateObj.getHours())
    minutes = @PadZero(dateObj.getMinutes())
    '{0}:{1}'.format hours, minutes

  ###*
   * Обертка над $.mask()
   * @param {object} $selector    Инпут(ы)
   * @param {object} [options]      Опции для $.mask()
   * @param {string} [mask]         Можно даже свою маску прописать, но зачем?)
   * @returns {object}
   * @link http://plugins.jquery.com/maskedinput/
  ###

  MaskPhone: ($selector, options, mask) ->
    options = if ! !options then options else {}
    mask = if ! !mask then mask else '+7 (999) 999-99-99'
    $selector.unmask().mask(mask, options).trigger 'change'

  ###*
   * Приводим номер телефона к виду (000) 000-00-00 / +7 (000) 000-00-00
   * @param phone
   * @param leadingCountryCode
   * @returns {String}
  ###
  FormatPhone: (phone, leadingCountryCode) ->
    if !phone or !phone.length
      return ''
    leadingCountryCode = if ! !leadingCountryCode then leadingCountryCode else false
    (if leadingCountryCode then '+7 ' else '') + '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + '-' + phone.substr(6, 2) + '-' + phone.substr(8, 2)

  ###*
   * Сортируем массив по переданному полю
  ###
  SortBy: (Items, prop, asc) ->
    asc = asc == 'ASC'

    Items.sort (a, b) ->
      aVal = prop.split('.').reduce( (m, i) ->
        return if m && typeof m == 'object' then m[i] else null;
      , a);
      bVal = prop.split('.').reduce( (m, i) ->
        return if m && typeof m == 'object' then m[i] else null;
      , b);

      if asc
        if aVal < bVal then -1 else if aVal > bVal then 1 else 0
      else
        if aVal < bVal then 1 else if aVal > bVal then -1 else 0
}

String::nl2br = ->
  @replace(/\n/ig, '<br />\n').trim()

String::br2nl = ->
  @replace(/<br.*?>/ig, '\n').trim()

String::xTrim = (charlist) ->
  str = this
  whitespace = undefined
  l = 0
  i = 0
  if !charlist
    # default list
    whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000'
  else
    # preg_quote custom list
    charlist += ''
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1')
  l = str.length
  i = 0
  while i < l
    if whitespace.indexOf(str.charAt(i)) == -1
      str = str.substring(i)
      break
    i++
  l = str.length
  i = l - 1
  while i >= 0
    if whitespace.indexOf(str.charAt(i)) == -1
      str = str.substring(0, i + 1)
      break
    i--
  if whitespace.indexOf(str.charAt(0)) == -1 then str else ''

String::template = ->
  pattern = /\{\w+\}/g
  args = arguments
  @replace pattern, (capture) ->
    args[0][capture.match(/\w+/)]

###*
# Replaces each format item in a specified string with the text equivalent of a corresponding object's value
# @param s      A composite format string
# @param params An object array that contains zero or more objects to format
# @returns {*}
###

String.format = (s, params) ->
  if arguments.length > 2
    params = $.makeArray(arguments).slice(1)
  if !_.isArray(params)
    params = $.makeArray(params)
  $.each params, (i, param) ->
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), param)
    return
  s

###*
# Replaces each format item in a specified string with the text equivalent of a corresponding object's value
# An object array that contains zero or more objects to format
# @returns {*}
###
String::format = ->
  String.format this, arguments

###*
# String truncate
# @param s         Укорачивает строку
# @param maxLength Максимальное количество символов
# @returns {*}
###
String.truncate = (s, maxLength) ->
  if s.length > maxLength
    return s.substr(0, maxLength) + '…'
  s

String::truncate = ->
  String.truncate this, arguments[0]

