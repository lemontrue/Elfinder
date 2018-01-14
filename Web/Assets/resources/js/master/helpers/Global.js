/**
 * Created by Александр on 25.03.14.
 */

var delegate = function (fn, scope, args) {
    if (!can.isFunction(fn))
        return false;

    return function () {
        return fn.apply(scope || this, args || arguments);
    };
};

var countMap = function (map) {
    var i = 0;
    map.each(function () {
        i++;
    });
    return i;
};

var time = function () {
    return Math.round((new Date()).getTime() / 1000);
};

var clearList = function (list) {
    list.splice(0, list.length);

    return list;
};

/**
 * Поиск объекта в массиве
 * @param list Массив
 * @param key
 * @param value
 * @returns {*} Индекс найденного объекта в массиве
 */
var listObjSearch = function (list, key, value) {
    var _index = null,
        r = function (key, obj) {
            if (key.length > 1) {
                var k = key[0];
                if (obj[k] !== undefined) {
                    key.splice(0, 1);
                    return r(key, obj[k]);
                } else {
                    return undefined;
                }
            } else {
                return (obj[key[0]] === undefined) ? undefined : obj[key[0]];
            }
        };

    can.each(list, delegate(function (obj, index) {
        if (r(key.split('.'), list[index]) === value)
            _index = index;
    }, this));

    return _index;
};

/**
 * Копировать массив
 * @param whence Откуда
 * @param where Куда
 * @param call Вызов функции перед добавлением нового элемента
 * @returns {*}
 */
var listCopy = function (whence, where, call) {
    call = call || function () {
    };
    can.each(whence, delegate(function (obj, index) {
        call.apply(this, [obj, index]);

        where.push(whence[index]);
    }, this));

    return where;
};

var addKeyInObject = function (obj, call) {
    can.each(obj, delegate(function (obj, index) {
        call.apply(this, [obj, index]);
    }, this));

    return obj;
};

var random = function () {
    return Math.random().toString(14).substring(7);
};

var format = function (str, args) {
    args = args || {};
    var message = str || '';

    can.each(args, function (value, key) {
        message = message.replace(new RegExp(key, 'g'), value);
    });

    return message;
};

var guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

/**
 * Очистка карты (объекта)
 * @param map Карта или объект
 * @returns {*}
 */
var clearMap = function (map) {
    map.each(function (value, key) {
        map.removeAttr(key);
    });

    return map;
};

var scroll = function (p) {
    var body = $('body'),
        newHeight = (body.height() * p) / 100;

    body.animate({
        scrollTop: newHeight
    }, 'slow');
};

var md5 = function (str) {
    return format('md5(%str) =)', {'%str': str});
};

var exist = function (key, val) {
    if (key === undefined)
        return false;

    return key === val;
};

var push = function (obj, item) {
    if (Object.prototype.toString.call(obj) !== '[object Array]')
        obj = [];

    obj.push(item);

    return obj;
};

var alertError = function (message, error) {
    if (Master['layout'] === undefined) {
        alert(format(message + '<br /><div style="font-size: 10px;color: red;margin: 10px 0 10px 0;">%stack</div>', {
            '%message': error.message,
            '%stack': error.stack
        }));

        return;
    }

    var _alert = Master.layout.message('Произошла ошибка',
        format(message + '<br /><div style="font-size: 10px;color: red;margin: 10px 0 10px 0;">%stack</div>', {
            '%message': error.message,
            '%stack': error.stack
        }),
        'error', [
            {
                text: 'Да',
                cls: 'btn-green',
                call: delegate(function () {
                    _alert.remove();
                }, this)
            }
        ]);

    $('div[error]').show();
    scroll(100);
};

/**
 * Числительные
 * @param number
 * @param titles
 * @returns {*}
 */
var declOfNum = function (number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5] ];
};

/**
 * Обрезка строки
 * @param text Строка
 * @param len Максимальная длинна в символах
 * @returns {*}
 */
var aligningText = function (text, len) {
    if (can.$.inArray(text, [null, undefined]) !== -1)
        return;

    text = typeof text === 'string' ? text : text();

    if (text.length <= len)
        return text;

    var result = format('%t1%r%t2', {
        '%t1': text.substr(0, 35),
        '%r': '/.../',
        '%t2': text.substr(-7)
    });

    return result;
};

var path = function (obj, params) {
    var events = params['events'] ? params['events'] : null,
        pathArr = params['path'] ? params['path'].split('.') : [],
        status = true,
        currentObj = obj,
        error, ready;

    error = events !== null && events['error'] ? events['error'] : function () {
    };
    ready = events !== null && events['ready'] ? events['ready'] : function () {
    };

    if (can.$.inArray(obj, [null, undefined, 0]) !== -1 || Object.prototype.toString.call(obj) !== '[object Object]') {
        error.apply(this, [
            {
                code: 100,
                message: 'Некорректный объект'
            }
        ]);
        status = false;
        return;
    }

    can.each(pathArr, function (item) {
        if (!status)
            return;

        if (currentObj[item] === undefined) {
            error.apply(this, [
                {
                    code: 101,
                    message: format('Заданный путь "%path" не соответствует объекту', {
                        '%path': params['path'] || ''
                    })
                }
            ]);
            status = false;
            return;
        }

        currentObj = currentObj[item];
    });

    if (!status)
        return;

    ready.apply(this, [currentObj]);
    return currentObj
};

/**
 * Получает элемент карты по индексу
 * @param map
 * @param index
 * @returns {*}
 */
var getMapIndex = function (map, index) {
    var result = null;

    can.each(map, delegate(function (item, _i) {
        if (index === _i)
            result = map[_i];
    }, this));

    return result;
};

var closeConfirm = function (message, close, cancel) {
    cancel = cancel || function () {
    };
    close = close || function () {
    };
    message = message || 'Привет зайчёнка';

    var alert = Master.layout.message('Внимание!',
        message,
        'warning', [
            {
                text: 'Отмена',
                call: delegate(function () {
                    alert.remove();
                    cancel.apply(window, [Master]);
                }, this)
            },
            {
                text: 'Да',
                cls: 'btn-green',
                call: delegate(function () {
                    alert.remove();
                    close.apply(window, [Master]);
                }, this)
            }
        ]);
};

var infoMessage = function(message, close) {
    close = close || function() {};
    message = message || '';

    var alert = Master.layout.message('Внимание!',
        message,
        'warning', [
            {
                text: 'OK',
                cls: 'btn-green',
                call: delegate(function() {
                    alert.remove();
                    close.apply(window, [Master]);
                }, this)
            }
        ]);
};