var Crypt;

Crypt = Crypt || {};

Crypt.Helpers = {

  /**
   * Все врендеренные данные для текущей страницы мы складируем в этой переменной
   * @param key
   * @returns {*}
   * @constructor
   */
  GetRenderedData: function(key) {
    if (YouDo.RenderedData && !_.isUndefined(YouDo.RenderedData[key])) {
      return YouDo.RenderedData[key];
    } else {
      return false;
    }
  },

  /**
   * Нажатие Enter
   * @param event
   * @returns {boolean}
   */
  IsEnter: function(event) {
    var code;
    code = event.keyCode || event.which;
    return code === 13 || code === 10;
  },

  /**
   * Нажатие Escape
   * @param event
   * @returns {boolean}
   * @constructor
   */
  IsEsc: function(event) {
    var code;
    code = event.keyCode || event.which;
    return code === 27;
  },

  /**
  * Нажатие Ctrl+Enter || Ctrl+Return
  * @param event
  * @returns {boolean}
  * @constructor
   */
  IsCtrlEnter: function(event) {
    var code;
    code = event.keyCode || event.which;
    return (code === 13 || code === 10) && event.ctrlKey;
  },

  /**
  * Получаем параметриз урла
   */
  getUrlParam: function(val) {
    var index, items, result, tmp;
    result = false;
    tmp = [];
    items = location.search.substr(1).split('&');
    index = 0;
    while (index < items.length) {
      tmp = items[index].split('=');
      if (tmp[0] === val) {
        result = decodeURIComponent(tmp[1]);
      }
      index++;
    }
    return result;
  },
  ScrollToEl: function(el, speed, onComplete) {
    return this.ScrollTo(el.offset().top, speed, onComplete);
  },
  ScrollToTop: function(speed, onComplete) {
    return this.ScrollTo(0, speed, onComplete);
  },
  ScrollTo: function(position, speed, onComplete) {
    speed = speed ? speed : 'normal';
    onComplete = _.isFunction(onComplete) ? onComplete : Function.prototype;
    $('html, body').animate({
      scrollTop: position
    }, speed, _.once(onComplete));
  },
  PadZero: function(number, length) {
    var str;
    length = !length ? 2 : length;
    str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  },
  GetFileExtension: function(name) {
    if (-1 !== name.indexOf('.')) {
      return name.replace(/.*[.]/, '');
    } else {
      return '';
    }
  },
  Translit: function(text) {
    var current_sim, i, result, space, transl;
    text = text.toLowerCase();
    space = '-';
    transl = {
      'а': 'a',
      'б': 'b',
      'в': 'v',
      'г': 'g',
      'д': 'd',
      'е': 'e',
      'ё': 'e',
      'ж': 'zh',
      'з': 'z',
      'и': 'i',
      'й': 'j',
      'к': 'k',
      'л': 'l',
      'м': 'm',
      'н': 'n',
      'о': 'o',
      'п': 'p',
      'р': 'r',
      'с': 's',
      'т': 't',
      'у': 'u',
      'ф': 'f',
      'х': 'h',
      'ц': 'c',
      'ч': 'ch',
      'ш': 'sh',
      'щ': 'sh',
      'ъ': space,
      'ы': 'y',
      'ь': space,
      'э': 'e',
      'ю': 'yu',
      'я': 'ya',
      ' ': space,
      '_': space,
      '`': space,
      '~': space,
      '!': space,
      '@': space,
      '#': space,
      '$': space,
      '%': space,
      '^': space,
      '&': space,
      '*': space,
      '(': space,
      ')': space,
      '-': space,
      '=': space,
      '+': space,
      '[': space,
      ']': space,
      '\\': space,
      '|': space,
      '/': space,
      '.': space,
      ',': space,
      '{': space,
      '}': space,
      '\'': space,
      '"': space,
      ';': space,
      ':': space,
      '?': space,
      '<': space,
      '>': space,
      '№': space
    };
    result = '';
    current_sim = '';
    i = 0;
    while (i < text.length) {
      if (transl[text[i]] !== void 0) {
        if (current_sim !== transl[text[i]] || current_sim !== space) {
          result += transl[text[i]];
          current_sim = transl[text[i]];
        }
      } else {
        result += text[i];
        current_sim = text[i];
      }
      i++;
    }
    return result;
  },

  /**
   * Пытаемся вытащить Timestamp из строки, числа или чего еще
   * @param {String|Number} date  /Date(1234567890moment()/, ISO8601, UNIX Timestamp
   * @returns {number}    UNIX Timestamp
   * @constructor
   */
  ExtractTimestamp: function(date) {
    if (_.isString(date) && date.indexOf('/') === 0) {
      return Number(date.substr(6, 13));
    } else if (_.isString(date) && (date.indexOf('Z') > -1 || date.indexOf('T') > -1)) {
      return new Date(date).getTime();
    } else if (_.isString(date)) {
      return Number(date);
    } else if (Number(date) === date) {
      return date;
    } else if (_.isDate(date)) {
      return date.getTime();
    } else {
      return null;
    }
  },
  ruDate: function(d) {
    var date;
    date = new Date(d);
    return date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth() + 1] + ' ' + date.getFullYear();
  },

  /**
   * Получаем форматированную строку с датой
   * Добавляем leadingZero
   * @param {Object|Number|String}   dateObj      instanceof Date || .getTime()
   * @param {String}                 [separator]  Разделитель
   * @returns {String}
   */
  GetDateFormatted: function(dateObj, separator) {
    var date, month, year;
    dateObj = dateObj instanceof Date ? dateObj : new Date(dateObj);
    separator = !!separator ? separator : '.';
    date = this.PadZero(dateObj.getDate());
    month = this.PadZero(dateObj.getMonth() + 1);
    year = dateObj.getFullYear();
    return '{1}{0}{2}{0}{3}'.format(separator, date, month, year);
  },

  /**
   * Получаем форматированную строку со временем
   * Добавляем leadingZero
   * @param {Object|Number|String}   dateObj      instanceof Date || .getTime()
   * @returns {String}
   */
  GetTimeFormatted: function(dateObj) {
    var hours, minutes;
    dateObj = dateObj instanceof Date ? dateObj : new Date(dateObj);
    hours = this.PadZero(dateObj.getHours());
    minutes = this.PadZero(dateObj.getMinutes());
    return '{0}:{1}'.format(hours, minutes);
  },

  /**
   * Обертка над $.mask()
   * @param {object} $selector    Инпут(ы)
   * @param {object} [options]      Опции для $.mask()
   * @param {string} [mask]         Можно даже свою маску прописать, но зачем?)
   * @returns {object}
   * @link http://plugins.jquery.com/maskedinput/
   */
  MaskPhone: function($selector, options, mask) {
    options = !!options ? options : {};
    mask = !!mask ? mask : '+7 (999) 999-99-99';
    return $selector.unmask().mask(mask, options).trigger('change');
  },

  /**
   * Приводим номер телефона к виду (000) 000-00-00 / +7 (000) 000-00-00
   * @param phone
   * @param leadingCountryCode
   * @returns {String}
   */
  FormatPhone: function(phone, leadingCountryCode) {
    if (!phone || !phone.length) {
      return '';
    }
    leadingCountryCode = !!leadingCountryCode ? leadingCountryCode : false;
    return (leadingCountryCode ? '+7 ' : '') + '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + '-' + phone.substr(6, 2) + '-' + phone.substr(8, 2);
  },

  /**
   * Сортируем массив по переданному полю
   */
  SortBy: function(Items, prop, asc) {
    asc = asc === 'ASC';
    return Items.sort(function(a, b) {
      var aVal, bVal;
      aVal = prop.split('.').reduce(function(m, i) {
        if (m && typeof m === 'object') {
          return m[i];
        } else {
          return null;
        }
      }, a);
      bVal = prop.split('.').reduce(function(m, i) {
        if (m && typeof m === 'object') {
          return m[i];
        } else {
          return null;
        }
      }, b);
      if (asc) {
        if (aVal < bVal) {
          return -1;
        } else if (aVal > bVal) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (aVal < bVal) {
          return 1;
        } else if (aVal > bVal) {
          return -1;
        } else {
          return 0;
        }
      }
    });
  }
};

String.prototype.nl2br = function() {
  return this.replace(/\n/ig, '<br />\n').trim();
};

String.prototype.br2nl = function() {
  return this.replace(/<br.*?>/ig, '\n').trim();
};

String.prototype.xTrim = function(charlist) {
  var i, l, str, whitespace;
  str = this;
  whitespace = void 0;
  l = 0;
  i = 0;
  if (!charlist) {
    whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
  } else {
    charlist += '';
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
  }
  l = str.length;
  i = 0;
  while (i < l) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
    i++;
  }
  l = str.length;
  i = l - 1;
  while (i >= 0) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
    i--;
  }
  if (whitespace.indexOf(str.charAt(0)) === -1) {
    return str;
  } else {
    return '';
  }
};

String.prototype.template = function() {
  var args, pattern;
  pattern = /\{\w+\}/g;
  args = arguments;
  return this.replace(pattern, function(capture) {
    return args[0][capture.match(/\w+/)];
  });
};


/**
 * Replaces each format item in a specified string with the text equivalent of a corresponding object's value
 * @param s      A composite format string
 * @param params An object array that contains zero or more objects to format
 * @returns {*}
 */

String.format = function(s, params) {
  if (arguments.length > 2) {
    params = $.makeArray(arguments).slice(1);
  }
  if (!_.isArray(params)) {
    params = $.makeArray(params);
  }
  $.each(params, function(i, param) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), param);
  });
  return s;
};


/**
 * Replaces each format item in a specified string with the text equivalent of a corresponding object's value
 * An object array that contains zero or more objects to format
 * @returns {*}
 */

String.prototype.format = function() {
  return String.format(this, arguments);
};


/**
 * String truncate
 * @param s         Укорачивает строку
 * @param maxLength Максимальное количество символов
 * @returns {*}
 */

String.truncate = function(s, maxLength) {
  if (s.length > maxLength) {
    return s.substr(0, maxLength) + '…';
  }
  return s;
};

String.prototype.truncate = function() {
  return String.truncate(this, arguments[0]);
};
