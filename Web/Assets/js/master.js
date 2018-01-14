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
/**
 * Created by Александр on 25.03.14.
 */

/**
 * Правильный вывод индекса
 */
can.stache.registerHelper('actionIndex', function (index) {
    return index() + 1;
});

can.stache.registerHelper('upload_file_attached_reg', function (id) {
    can.trigger(window, 'upload_file_attached_reg', [id]);
});

can.stache.registerHelper('text_trim', function (text, length, postfix) {
    var str = text(),
        _postfix = postfix || '',
        _length = length || 0;

    if (text().length > _length) {
        str = str.substr(0, _length) + _postfix;
    }

    return str;
});

can.stache.registerHelper('regUploadEncSer', function () {
    setTimeout(delegate(function () {
        can.trigger(window, 'reg_upload_enc_ser', []);
    }, this), 200);
});

can.stache.registerHelper('process_count_format', function (count) {
    return format('%count %title', {
        '%count': count(),
        '%title': declOfNum(count(), ['процесс', 'процесса', 'процессов'])
    });
});

can.stache.registerHelper('aligningText', function (text, ln) {
    return aligningText(text(), ln);
});

can.stache.registerHelper('debug', function (options) {
    if (Master.debug) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

can.stache.registerHelper('append', function (val) {

    return function (el) {
        $(el).append(val);
    };
});

can.stache.registerHelper('removeToClick', function (call) {
    call = typeof call !== 'function' ? function () {
    } : call;

    return function (el) {
        $(el).click(delegate(function () {
            $(el).remove();
            call.apply(this, []);
        }, this));
    };
});
/**
 * Created by Александр on 16.04.14.
 */
var CheckAttachmentFiles = can.Construct({
    init: function (scope, callFn) {
        this.scope = scope;
        this.callFn = callFn;

        try {

            this.scope.req.begin('check_signed_file_setacment', {
                signedFileInfosJSON: this.scope.getFilesString()
            }, delegate(function (data) {
                if (data.data.status === 'Error') {
                    can.trigger(window, 'net_error', [data.data.errorMessage]);
                    this.scope.errorMaster();
                    return;
                }


                this.checkingResult(data.data.masterSignedFileInfos);
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при проверке присоединённого файла. "%message"', e);
        }
    },

    checkingResult: function (files) {
        try {

            var success = true;
            can.each(files, delegate(function (file, index) {
                _file = file.SignedFileInfo;

                var resultSearch = this.scope.searchFile(_file.FileUri);

                if (file.Exception !== null) {
                    resultSearch.file.InnerError('Подпись данного файла не может быть проверена');

                    return 0;
                }

                if (_file.Detached === true) {
                    success = false;

                    resultSearch.file.attachedFile.attr('attached', true);

                    resultSearch.file.attachedFile.attr('error', true);
                    resultSearch.file.attachedFile.attr('errorMessage', 'Укажите файл для подписи');
                }
            }, this));

            this.callFn.apply(this, [success === true]);
        } catch (e) {
            alertError('Неожиданная ошибка произошла пре проверки присоединённого файла. "%message"', e);
        }
    }
});
/**
 * Created by Александр on 08.04.14.
 */
var CertificateSelection = can.Control({
    init: function (el, options) {
        this.scope = options.scope;
        this.nextCall = options.nextCall || function () {
        };

        this.result = new can.compute(false);
        this.ready = new can.compute(false);
        this.boxState = new can.compute('change');

        this.certificate = new can.compute(null);
        this.pin = new can.compute(null);
        this.savePin = new can.compute(null);
        this.needToPIN = new can.compute(null);
        this.STOP = new can.compute(false);
        this.STOP_SKIP = new can.compute(false);

        this.cert = new can.Map.List([]);

        this.files = new can.Map();
        this.certList = new can.Map.List();

        this.applyOptions(can.extend({
            title: 'Расшифровать'
        }, options.params || {}));
        try {
            var view = can.view('/Scripts/master/view/activity/decipher/certificate_selection.hbs', {
                title: this.title,
                event: {
                    refiles: delegate(this.scope.layout.main.reFiles, this.scope.layout.main, [true]),
                    cancel: delegate(this.scope.layout.main.reFiles, this.scope.layout.main, [true]),
                    change_certificate: delegate(function () {
                        new SelectCertificate('list', delegate(function (array) {
                            array.each(delegate(function (item) {
                                this.certificate(null);
                                this.certificate(item);

                                this.STOP_SKIP(false);

                                this.checkingFiles();
                            }, this));
                        }, this), {
                            cert: this.certList
                        });

                    }, this),

                    composition_certificate_change: delegate(function () {
                        closeConfirm('При смене сертификата все изменения, сделанные на предыдущих этапах, будут потеряны. Продолжить?', delegate(function () {
                            this.result(false);
                            can.$('div[result]').html('');

                            this.scope.result(false);
                        }, this));
                    }, this),

                    action_run: delegate(this.actionRun, this)
                },

                result: this.result,
                ready: this.ready,
                boxState: this.boxState,
                certificate: this.certificate
            });

            this.apply = delegate(function () {
                this.pull = delegate(function () {

                }, this.self);
                this.next = 1;
                this.prev = 0;
            }, this);

            this.element.append(view);



            this.result.bind('change', delegate(function (ev, newVal, oldVal) {
                this.boxState((newVal === true) ? 'ready' : 'change');
            }, this));

            this.certificate.bind('change', delegate(function (ev, newVal, oldVal) {
                this.ready((newVal === null) ? false : true);
            }, this));

            this.scope.pool.templates.current.bind('change', delegate(function (ev, newVal, oldVal) {
                setTimeout(delegate(this.makeCertificate, this), 2000);
            }, this));

            var ajaxObj, processID = this.scope.iprocess.add('Выполняется запрос сертификатов для расшифровки...', delegate(function (code) {
                // Отмена операции
                if (code === 0)
                    return;

                ajaxObj.abort();
                this.scope.layout.main.clearAction();
            }, this));

            ajaxObj = this.scope.req.begin('get_decrypt_certificates', {
                files: this.scope.getArrayFilesString()
            }, delegate(function (data) {
                this.responsDownloadFiles = data.data.result.DownloadedFiles;

                can.each(data.data.result.CertificateInfos, delegate(function (c) {
                    this.cert.push(c);
                }, this));

                can.each(data.data.result.DownloadedFiles, delegate(function (file) {

                    var resultSearch = this.scope.searchFile(file.Uri);
                    if (resultSearch === undefined)
                        return;

                    /**
                     * Добавляем файл и его сертификаты для расшифровки
                     * в массив
                     */
                    this.files.attr(resultSearch.file.id, file.DecryptCertificatesThumbprints);

                    /**
                     * Добавляем все возможные сертификаты
                     * в массив
                     */
                    window.decipherIsTest = false;
                    can.each(file.DecryptCertificatesThumbprints, delegate(function (thumbr, index) {
                        var certInfos = this.cert[listObjSearch(this.cert, 'Thumbprint', thumbr)];

                        if ($.inArray(certInfos, [null, undefined, []]) !== -1) {
                            new Logger(format('Возникла ошибка при получении информации о сертификате "%thumbr".', {
                                '%thumbr': thumbr
                            }), 'error');

                            return;
                        }

                        this.thumbr = thumbr;
                        this.results = [];

                        this.certList.each(delegate(function(value, index, list) {
                            if (value.Thumbprint === this.thumbr) {
                                this.results.push(value.Thumbprint)
                            }
                        },this));
                        if (!this.results.length) {
                            // дикий костыль
                            if (certInfos.IsTest) {
                                window.decipherIsTest = true;
                            }
                            this.certList.push({
                                Thumbprint: thumbr,
                                SubjectName: file.DecryptCertificatesNames[index],
                                Organization: certInfos.Organization,
                                NotAfter: certInfos.NotAfter,
                                IsTest: certInfos.IsTest
                            });
                        }
                    }, this));

                    if (file.Exception !== null)
                        resultSearch.file.InnerError('Данный файл не может быть расшифрован');
                }, this));

                if (this.certList.length > 0) {
                    this.certificate(null);
                    this.certificate(this.certList[0]);
                    this.checkingFiles();
                } else {
                    var alert = Master.layout.message('Внимание!',
                        format('Ни один из выбранных файлов не может быть расшифрован.', {}),
                        'warning', [
                            {
                                text: 'Закрыть',
                                cls: 'btn-green',
                                call: delegate(function () {
                                    Master.layout.main.reFiles();
                                    alert.remove();
                                }, this),
                                exit: true
                            }
                        ]);
                }
                var regTipOptions = {
                    tipJoint: "left",
                    background: '#fff5d2',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#fee8ae'
                };

                $(".js-test-certificate-tip").each(function(i,el){
                    new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
                    Opentip.lastZIndex = 9000;
                });
                can.trigger(window, 'process_exit', [processID]);
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выборе сертификата. "%message"', e);
        }
    },

    /**
     * Применение опций
     * @param o
     */
    applyOptions: function (o) {
        can.each(o, delegate(function (value, key) {
            this[key] = value;
        }, this));
    },

    //другое имя придумать не смог =)
    thisRun: function (params) {
        this.nextCall.apply(this, [this.certificate, this.pin, this.savePin, this.needToPIN, this]);

        this.result(true);
    },

    actionRun: function (pinError) {

        if (pinError === true) {
            this.result(false);
            this.scope.result(false);
        }

        if (this.warningNotReadyFiles()) {
            return false;
        }

        new PinCode(this.certificate().Thumbprint, delegate(function (need, pin, save) {
            this.pin(pin);
            this.savePin(save);
            this.needToPIN(need);

            this.thisRun();
        }, this), {
            pinError: pinError === true
        });
    },

    /**
     * Вызывает предепреждение о том,
     * что не все файлы могут быть расшифрованы
     * выбранным сертификатом.
     */
    warningNotReadyFiles: function () {
        try {
            this.scope.fileEach(delegate(function (file) {
                if (file.error() === true)
                    this.STOP(true);
            }, this), 'ready,error');

            if (this.STOP() === true && this.STOP_SKIP() === false) {

                var alert = Master.layout.message('Внимание!',
                    'Не все файлы могут быть расшифрованы выбранным сертификатом. Продолжить?',
                    'warning', [
                        {
                            text: 'Отмена',
                            call: delegate(function () {
                                alert.remove();
                            }, this)
                        },
                        {
                            text: 'Да',
                            cls: 'btn-green',
                            call: delegate(function () {
                                /**
                                 * Пропускаем.
                                 */
                                this.STOP_SKIP(true);
                                this.actionRun();
                                alert.remove();
                            }, this)
                        }
                    ]);

                return true;
            }
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выборе сертификата. "%message"', e);
        }

        return false;
    },

    /**
     * Проверка файлов на возможность расшифровки
     */
    checkingFiles: function () {
        try {

            this.scope.fileEach(delegate(function (file) {
                var ID = file.id,
                    certArray = this.files.attr(ID);

                if (can.$.inArray(this.certificate().Thumbprint, certArray) === -1) {
                    file.error(true);
                    file.errorMessage('Файл не может быть расшифрован данным сертификатом');

                    return;
                }

                file.error(false);
                file.errorMessage('');
            }, this), 'ready,error');
        } catch (e) {
            alertError('Неожиданная ошибка произошла при проверке файлов на возможность расшифровки. "%message"', e);
        }
    }
});
/**
 * Created by Александр on 28.03.14.
 */
var SelectCertificate = can.Construct({
    init: function (type, call, options) {
        /**
         * Тип выбора
         * @type {*}
         */
        this.type = (can.$.inArray(type, ['my', 'all', 'list']) !== -1) ? type : 'my';
        /**
         * Функция вызова с массивом выбранных
         * сертифиатов в качестве параметра.
         * @type {*}
         */
        this.call = (typeof call === 'function') ? call : function () {
        };

        this.options = options;

        /**
         * Список всех сертификатов
         * @type {exports.List}
         */
        this.certificateList = new can.Map.List();
        /**
         * Список выбранных сертификатов
         * @type {exports.List}
         */
        this.certificateListSelect = new can.Map.List();

        this.checkAll = new can.compute(false);

        this.nothingFound = can.compute(false);

        this.run();
    },

    run: function () {
        try {
            var search = (this.type === 'all') ? delegate(function (value) {
                value = value.toLocaleLowerCase();
                var clean = value === '';
                this.certificateList.each(delegate(function (item) {
                    if (clean === true) {
                        item.attr('show', true);
                        return;
                    }

                    if (item.owner.toLocaleLowerCase().search(value) === -1 && (!item.organization || item.organization.toLocaleLowerCase().search(value) === -1) && item.validity.toLocaleLowerCase().search(value) === -1) {
                        item.attr('show', false);
                    } else {
                        item.attr('show', true);
                    }
                }, this));

                foundLength = function (certList) {
                    return $.grep(certList,function (n, i) {
                        return n.show === true;
                    }).length;
                }

                if (foundLength(this.certificateList) == 0) {
                    this.nothingFound(true);
                } else {
                    this.nothingFound(false);
                }
            }, this) : undefined;

            if (this.type === 'all') {
                Master.req.begin('find_all_certificate', {
                    searchString: ''
                }, delegate(function (req) {
                    if (req.status === 'error') {
                        new Logger('Возникла ошибка при загрузке пользовательских сертификатов', 'error');
                        return;
                    }

                    can.each(req.data.model, delegate(function (item) {
                        this.addItem(item.SubjectName, item.TimeMessage, item.Organization, item.Thumbprint, item);
                    }, this));

                    this.modal.loading(false);
                }, this));
            }

            if (this.type === 'my') {
                can.each(Master.pool.allMyCertificate, delegate(function (item) {
                    this.addItem(item.SubjectName, item.TimeMessage, item.Organization, item.Thumbprint, item);
                }, this));
            }

            if (this.type === 'list') {
                console.log('Изменить привязку!!!');

                this.options.cert.bind('change', delegate(function (ev, attr, type, newVal, oldVal) {

                }, this));

                can.each(this.options.cert, delegate(function (item) {
                    var valid =  !!item.NotAfter ?  moment(parseInt(item.NotAfter.match('[0-9]+')[0])).calendar().replace(/\//g,'.') : '';
                   this.addItem(item.SubjectName, format('Действителен до %time', {
                       '%time': valid
                   }), item.Organization, item.Thumbprint, item);
                }, this));
            }

            this.modal = Master.layout.modal(
                'Выберите сертификат' + ((this.type === 'all') ? 'ы' : '') + ' для добавления.',
                {
                    type: 'path',
                    path: 'find_certificate.hbs',
                    params: {
                        modMy: this.type === 'my',
                        modAll: this.type === 'all',
                        checkAll: this.checkAll,
                        event: {
                            exit: delegate(function () {
                                this.modal.remove();
                            }, this),
                            select: delegate(function (scope, el, ev) {
                                if (ev.target.tagName !== 'TD')
                                    return;

                                if (can.$.inArray(this.type, ['my', 'list']) !== -1 && this.certificateListSelect[0] !== undefined) {
                                    var cert = this.certificateListSelect[0];
                                    var _itemIndex = listObjSearch(this.certificateList, 'ID', cert.ID);
                                    this.certificateListSelect.splice(0, 1);

                                    this.itemSelect(this.certificateList[_itemIndex], false);
                                } else {
                                    var _item = listObjSearch(this.certificateListSelect, 'ID', scope.ID);

                                    if (_item !== null && _item >= 0) {
                                        this.itemSelect(scope, false);

                                        return;
                                    }
                                }

                                this.itemSelect(scope, true);
                            }, this),
                            add: delegate(this.add, this),
                            dblclick: delegate(this.dblclick, this),
                            certCheck: delegate(this.certCheck, this),
                            notclick: delegate(function (scope, el, ev) {
                                if (can.$.inArray(this.type, ['my', 'list']) !== -1) {
                                    this.itemSelect(scope, false);
                                } else {
                                    var _item = listObjSearch(this.certificateListSelect, 'ID', scope.ID);

                                    if (_item !== null && _item >= 0) {
                                        this.itemSelect(scope, false);

                                        return;
                                    }
                                }

                                this.itemSelect(scope, true);
                            }, this),
                            sort: {
                                owner: delegate(function (scope, el, ev) {
                                    this.certificateList.comparator = 'owner';
                                    this.certificateList.sort();
                                    /*this.certificateList.sort(function(a, b) {
                                     var ca = a.owner[0].charCodeAt(),
                                     cb = b.owner[0].charCodeAt();

                                     if(ca < cb) {
                                     return -1;
                                     }

                                     if(ca > cb) {
                                     return 1;
                                     }

                                     return 0;
                                     });*/
                                }, this),
                                validity: delegate(function (scope, el, ev) {
                                    this.certificateList.sort(function (a, b) {
                                        var ca = a.validity[0].charCodeAt(),
                                            cb = b.validity[0].charCodeAt();

                                        if (ca < cb) {
                                            return -1;
                                        }

                                        if (ca > cb) {
                                            return 1;
                                        }

                                        return 0;
                                    });
                                }, this),
                                organization: delegate(function (scope, el, ev) {

                                    this.certificateList.sort(function (a, b) {
                                        var ca = a.organization[0].charCodeAt(),
                                            cb = b.organization[0].charCodeAt();

                                        if (ca < cb) {
                                            return -1;
                                        }

                                        if (ca > cb) {
                                            return 1;
                                        }

                                        return 0;
                                    });
                                }, this)
                            }
                        },

                        certificate: this.certificateList,
                        cls: this.certificateListSelect,
                        nothingFound: this.nothingFound
                    }
                },
                undefined,
                search
            );


            this.checkAll.bind('change', delegate(function (ev, newVal, oldVal) {
                this.certificateList.each(delegate(function (cert) {
                    this.itemSelect(cert, newVal);
                }, this));
            }, this));

        } catch (e) {
            alertError('Неожиданная ошибка произошла при открытии диалогового окна выбора сертификата. "%message"', e);
        } finally {
            if (this.type === 'all') {
                this.modal.loading('Загрузка списка сертификатов...');
            }

            setTimeout(function() {
                var regTipOptions = {
                    tipJoint: "left",
                    background: '#fff5d2',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#fee8ae'
                };
                $(".js-test-certificate-tip").each(function(i,el){
                    new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
                });
            }, 1000)
        }
    },

    /**
     *
     * @param owner
     * @param validity
     * @param organization
     * @returns {*}
     */
    addItem: function (owner, validity, organization, thumbprint, data) {
        var id = guid();
        this.certificateList.push({
            ID: id,
            owner: owner,
            validity: validity,
            organization: organization,
            thumbprint: thumbprint,
            data: data,
            check: false,
            show: true,
            isTest: data.IsTest
        });

        return id;
    },

    itemSelect: function (item, selected) {
        if (selected === true) {
            item.attr('check', true);

            this.certificateListSelect.push(item);
        } else {
            item.attr('check', false);
            var _item = listObjSearch(this.certificateListSelect, 'ID', item.ID);
            this.certificateListSelect.splice(_item, 1);
        }
    },

    dblclick: function () {
        if (can.$.inArray(this.type, ['my', 'list']) !== -1) {
            this.add();
        }
    },

    add: function () {
        var val = new can.Map.List([]);

        this.certificateListSelect.each(delegate(function (item) {
            val.push(item.data);
        }, this));

        this.call.apply(null, [val]);
        this.modal.remove();
    },

    certCheck: function () {
        console.log('certCheck', arguments);
    }
});
/**
 * Created by Александр on 16.04.14.
 */
var OperationResult = can.Construct({
    init: function (scope, settings) {
        this.scope = scope;

        this.tag = $('div[result]');

        this.type = settings['type'] || '';

        try {
            var __result = can.Map.extend({
                length: function () {
                    return countMap(this.files);
                }
            });

            this.result = new __result({
                files: {}
            });

            this.error = settings['error'] === true;

            this.globError = {
                status: new can.compute(false),
                message: new can.compute('')
            };

            this.lineError = new can.compute(false);

            this.icon = path(settings, {
                path: 'icon',
                event: {
                    error: delegate(function (e) {
                        alertError('Неожиданная ошибка произошла при выводе результата. "%message"', e.message);
                    }, this)
                }
            });

            this.errorMessage = settings.errorMessage || 'Произошла ошибка';

            this.refreshFiles(settings.files);

            settings.files.bind('change', delegate(function () {
                this.refreshFiles(settings.files);
            }, this));


            this.sourceType = settings.sourceType;
            var view = can.view('/Scripts/master/view/activity/operation_result.hbs', {
                result: this.result,
                isTest: window.decipherIsTest,
                error: this.error,
                globError: this.globError,
                errorMes: this.errorMessage,

                icon: this.icon,
                showLink: settings['showLink'] === true,
                lineError: this.lineError,

                isEncSig: this.type === 'enc_sig',

                event: {
                    view_file: delegate(function (scope) {
                        var filename = scope.fileName+'.sig.enc';
                        filename = scope.sourcefileName.substring(0, scope.sourcefileName.length - filename.length)+scope.fileName;
                        $.ajax({
                            url: '/helper/GetVisualizationInfo',async: false,type: "GET",data: {filename: filename},
                            success: function (result) {
                                if (!result.Error) {
                                    var name = scope.fileName.split('/'),
                                        len=40;
                                    name = name[name.length-1];
                                    if (name.length > len) {
                                        name = '...'+name.substring(name.length-len, name.length);
                                    }
                                    if (result.VisualizationUrl) {
                                        $.fancybox({href : result.VisualizationUrl,type: 'iframe'},{
                                                helpers: {title: {position: 'top'}},
                                                maxWidth	: 700,
                                                height      : 1000,
                                                minWidth	: 200,
                                                autoSize	: true,
                                                autoResize	: true,
                                                scrolling: 'no',
                                                topRatio: 0,
                                                margin: [20, 20, 90, 20],
                                                closeClick	: false,
                                                openEffect	: 'fade',
                                                wrapCSS     : 'visualiseModal',
                                                title       : name,
                                                afterClose: function() {
                                                    window.visualState = false;
                                                }
                                            }
                                        );
                                    } else {
                                        $.fancybox("<img align='center' width='100%' style='margin: 0 auto;display: block;' src='data:image/jpg;base64,"+result.Base64Picture+"'>",{
                                                helpers: {title: {position: 'top'}},
                                                aspectRatio : true,
                                                fitToView	: true,
                                                autoSize	: true,
                                                autoResize	: true,
                                                scrolling: 'no',
                                                topRatio: 0,
                                                margin: [20, 20, 90, 20],
                                                closeClick	: false,
                                                openEffect	: 'fade',
                                                wrapCSS     : 'visualiseModal',
                                                title       : name,
                                                afterClose: function() {
                                                    window.visualState = false;
                                                }
                                            }
                                        );
                                    }
                                } else {

                                }
                            },
                            error: function (request, error, result) {}
                        });

                        return false
                    }, this),
                    backFiles: delegate(function () {
                        window.location.href = '/Default/WebDavBrowser';
                    }, this),

                    refiles: delegate(this.scope.layout.main.reFiles, this.scope.layout.main, [true]),
                    download_file: delegate(function (scope, ev) {
                        var filename = scope.fileName+'.sig.enc';
                        filename = scope.sourcefileName.substring(0, scope.sourcefileName.length - filename.length)+scope.fileName;
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(filename));

                    }, this),
                    download_source: delegate(function (scope, ev) {
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sourcefileName));
                    }, this),
                    download_encrypted: delegate(function (scope, ev) {
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.encryptedName));
                    }, this),

                    remove_encrypted: delegate(function (scope, ev) {
                        closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                            this.scope.req.begin('file_delete', {
                                deletingFileUri: scope.encryptedName
                            }, function (data) {
                                // Какой то ответ
                            }, this);

                            // Удаляем
                            // .. и немножко удерживаем для красоты.
                            setTimeout(delegate(function () {
                                scope.attr('encryptedName', '');
                            }, this), 200);
                        }, this));
                    }, this),

                    remove: delegate(function (scope, ev) {
                        closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                            this.scope.req.begin('file_delete', {
                                deletingFileUri: scope.fileName
                            }, function (data) {
                                // Какой то ответ
                            }, this);

                            // Удаляем
                            // .. и немножко удерживаем для красоты.
                            setTimeout(delegate(function () {

                                /*if(this.type !== 'enc_sig') {
                                 if(countMap(this.result.files) === 1) {
                                 clearMap(this.result.files);

                                 this.scope.layout.main.reFiles(false);
                                 return;
                                 }

                                 var _index = this.result.files.attr(scope.id);
                                 if(_index === undefined) {
                                 return;
                                 }

                                 this.result.files.removeAttr(scope.id);
                                 } else {
                                 scope.attr('fileName', '');
                                 }

                                 if(countMap(this.result.files) === 1) {
                                 clearMap(this.result.files);

                                 this.scope.layout.main.reFiles(false);
                                 return;
                                 }*/

                                scope.attr('fileName', '');

                            }, this), 200);
                        }, this));
                    }, this),
                    more: delegate(function (scope, el) {
                        if (scope.isMoreShow) {
                            el.html('Подробнее');
                            scope.attr('isMoreShow', false);
                        } else {
                            el.html('Скрыть');
                            scope.attr('isMoreShow', true);
                        }
                    }, this)
                },

                sourceType: this.sourceType
            });
            console.log(view)
            this.tag.append(view);
            var regTipOptions = {
                tipJoint: "left",
                background: '#fff5d2',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#fee8ae'
            };

            $(".js-test-file-tip").each(function(i,el){
                new Opentip($(el), 'Данный файл был подвергнут криптооперации с использованием тестового сертификата. Такие сертификаты выпускаются без участия аккредитованного Удостоверяющего Центра и не имеют юридической силы.', '', regTipOptions);
                Opentip.lastZIndex = 9000;
            });

        } catch (e) {
            alertError('Неожиданная ошибка произошла при выводе результата. "%message"', e);
        } finally {
            this.scope.result(true);
            scroll(100);
        }
    },

    remove: function () {
        this.tag.html('');
    },

    refreshFiles: function (files) {
        try {

            clearMap(this.result.files);

            var acceptExt = ['ods','xls','xlsb','xlsx','ods','xlsb','xlsm','xlsx','odp','pot','potm','potx',
                'pps','ppsm','ppsx','ppt','pptm','pptx','odp','ppsx','pptx','doc','docm','docx','dot',
                'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp','xml'];

            can.each(files, delegate(function (file, index) {

                var id = guid();
                var fileName;
                //Временный костыль получения корректного пути файла в результате
                if (file.EncryptedFile)
                    fileName = file.EncryptedFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/' +  ('' + file.OperatedFile).replace(/^.*[\\\/]/, '');
                else
                    fileName = file.OperatedFile;

                var fileData = {
                    id: id,
                    fileName: fileName,
                    sourcefileName: file.SourceFile,
                    error: file.error,
                    errorMessage: file.errorMessage,
                    sertInfo: this.icon === false ? file.sertInfo : false,
                    hideView: true
                };

                if (file.OperatedFile) {
                    var name = !!file.OperatedFile ? file.OperatedFile.split('/') : '';
                    var ext = '';
                    name = name[name.length - 1];
                    if (name !== null) {
                        ext = name.split('.');
                        ext = ext[ext.length - 1];
                        if (acceptExt.indexOf(ext.toLowerCase()) !== -1) {
                            fileData.hideView = false;
                        }
                    }
                }
                if (file.EncryptedFile !== undefined) {
                    fileData.encryptedName = file.EncryptedFile;
                }

                this.result.files.attr(id, fileData);

                if (file.error)
                    this.lineError(true);


            }, this));

            scroll(100);
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выводе результата. "%message"', e);
        }
    }
});

/**
 * Created by Александр on 28.04.14.
 */
var OpenUploadFileDialog = can.Construct({
    init: function (fnCall, params) {
        params = params || {};

        this.key = random();
        this.fnCall = fnCall || function () {
        };

        this.multi_selection = (params['multi_selection'] === undefined) ? true : params['multi_selection'];

        try {
            this.modal = Master.layout.modal('Выберите файл для добавления', {
                type: 'path',
                path: 'select_files.hbs',
                params: {
                    key: this.key,
                    multi_selection: this.multi_selection
                }
            }, 'box');
        } catch (e) {
            alertError('Неожиданная ошибка произошла при открытии диалогового откна выбора файлов. "%message"', e);
        } finally {
            can.bind.call(window, 'select_files', delegate(function (ev, key, files) {
                if (key !== this.key)
                    return;
                this.fnCall.apply(Master, [files, params]);
                this.close();
            }, this));

            can.bind.call(window, 'window_open_files_close', delegate(function (ev, key, files) {
                this.close();
            }, this));
        }
    },

    close: function () {
        this.modal.remove();
    }
});

/**
 * Created by Александр on 11.06.14.
 *
 * Класс запроса пин-кода
 */
var PinCode = can.Construct('helpers.PinCode', {
    /**
     * Конструктор запроса пин-кода
     * @param thumbprint Отпечаток сертификата
     * @param function callFn Ф. обратного вызова (3 параметра)
     * (нужен ли пин, пин-код, сохранить или нет)
     * @param object options Опции
     */
    init: function (thumbprint, callFn, options) {
        options = options || {};
        /**
         *
         * @type {*|Function}
         */
        this.callFn = callFn || function () {
        };
        /**
         *
         * @type {*|string}
         */
        this.thumbprint = thumbprint || '';
        this.pinCnt = 0;
        this.__modalWindow = null;

        this.options = {
            pinError: options['pinError'] === true,
            wrongSavedPin : options['wrongSavedPin'] === true
        };

        if (this.options.pinError && !this.options.wrongSavedPin) {
            this.getPin('Неверный пин');
            return;
        }



        this.needToPin(delegate(function (need) {
            if (need) {
                this.getPin('');
            } else {
                if (this.options.wrongSavedPin) {
                    this.getPin('');
                } else {
                    this.__return(false, null, undefined);
                }
            }
        }, this));
    },

    /**
     * Нужен ли пин-код
     * @param function call
     */
    needToPin: function (call) {
        if (!this.__hasToPool()) {
            Master.req.begin('get_pin', {
                thumbprint: this.thumbprint
            }, function (data) {
                var state = data.data.NeedToPIN === true;

                Master.pool.needToPin.attr(this.thumbprint, state);
                call.apply(this, [state]);
            });
        } else {
            call.apply(this, [true]);
        }
    },

    /**
     * Вывод модального окна для ввода пин-кода
     * @param errorMessage Сообщение об ошибке
     */
    getPin: function (errorMessage) {
        this.__modalWindow = this.__showModal(delegate(function (pin, save) {
            this.__return(true, pin, save);
        }, this));

        if (errorMessage !== undefined) {
            this.__modalWindow.error(errorMessage);
        }
    },

    /**
     * Вызов обратной ф-ции вызова.
     * @param boolean need Нужен ли пин
     * @param string pin Пин-код
     * @param boolean save Нужно ли сохранять
     * @private
     */
    __return: function (need, pin, save) {
        this.callFn.apply(this, [need, pin, save]);
    },

    /**
     * Поиск сохранённого значения в пуле
     * @returns {boolean}
     * @private
     */
    __hasToPool: function () {
        var _need = Master.pool.needToPin.attr(this.thumbprint);

        if (_need === undefined || _need === false)
            return false
        else
            return true;
    },

    __showModal: function (call, scope, params) {
        call = call || function () {
        };
        params = params || {};

        var pin = new can.compute(''),
            save = new can.compute(false),
            error = new can.compute(params['error'] || '');

        try {
            if (Master.debug) {
                pin('11111111');
            }

            var modal = {}, body = can.view.render('/Scripts/master/view/modals/pin.hbs', {
                pin: pin,
                btns: [
                    {
                        text: 'Отмена',
                        call: delegate(function () {
                            modal.remove();
                        }, this)
                    },
                    {
                        text: 'Продолжить',
                        cls: 'btn-green',
                        call: delegate(function () {
                            if (pin().length === 0) {
                                error('Введен пустой пин!');
                                return;
                            }

                            error('');

                            call.apply(scope, [pin(), save()]);
                            modal.remove();
                        }, this)
                    }
                ],
                save: save,
                error: error
            });

            modal = Master.layout.modal('Ввод пин-кода', {
                type: 'text',
                body: body
            }, 'alert');
        } catch (e) {
            alertError('Неожиданная ошибка произошла при установке пин-кода. "%message"', e);
        }

        return {
            exit: function () {
                modal.remove();
            },
            error: function (message) {
                if (message === undefined)
                    return error();
                else
                    return error(message);
            }
        };
    }
});
/**
 * Created by Александр on 17.06.14.
 */
var UploadVerifyFiles = can.Construct('helpers.UploadVerifyFiles', {
    init: function (uploader, files, fnCall) {
        this.uploader = uploader;
        this.files = files;
        this.fnCall = fnCall || function () {
        };

        this.__errors = new can.Map.List();
        this.__verified = new can.Map.List();

        can.each(files, delegate(function (file) {
            this.__verifyFile(file);
        }, this));

        this.fnCall.apply(this, [this.__verified]);

        if (this.__errors.length === 0) {

            return;
        }

        this.__showErrorMessage();
    },

    __verifyFile: function (file) {
        if (file.size > 20 * 1024 * 1024) {
            this.__addError(file, 'Превышен максимально допустимый размер загружаемого файла, повторите попытку. Максимально допустимый размер файла равен 20 мегабайтам.');
            return;
        }

        if (file.name.length > 100) {
            this.__addError(file, 'Превышена максимальная длина имени файла. В настоящий момент максимальная длина имени файла ограничена 100 символами.');
            return;
        }

        var mach = file.name.match(/[$\:\*\?\"\+\#\<\>\/]/g);

        if (mach !== null && mach.length > 0) {
            this.__addError(file, 'Файл содержит недопустимые символы в названии. Для ввода запрещены символы: "$ / : * ? " + # < > |"');
            return;
        }

        this.__verified.push(file);
    },

    __addError: function (file, errorMessage) {
        this.uploader.removeFile(file);

        this.__errors.push({
            name: aligningText(file.name, 40),
            message: errorMessage
        });
    },

    __showErrorMessage: function () {

        var message = '';

        this.__errors.each(delegate(function (error) {
            message += format('<b>«%name»</b> — %message<br />', {
                '%name': error.name,
                '%message': error.message
            });
        }, this));

        var _alert = Master.layout.message('Внимание!',
            format('Невозможно загрузить некоторые файлы по следующим причинам:<br />%errors%', {
                '%errors%': message
            }),
            'error', [
                {
                    text: 'Закрыть',
                    cls: 'btn-green',
                    call: delegate(function () {
                        _alert.remove();
                    }, this)
                }
            ]);

        $('.upload').removeClass('drag');
    }
});
var Logger = function (message, type, data) {
    if (!Master.debug)
        return;

    type = type || 'info',
        data = data || '',
        message = (function (m) {
            var type = Object.prototype.toString.call(m);
            if (type === '[object String]') {
                return m;
            }

            if (type === '[object Array]') {
                var message = m[0];

                can.each(m[1], function (value, key) {
                    message = message.replace(new RegExp(key, 'g'), value)
                });

                return message;
            }
        })(message);

    if (type === 'error') {
        console.error(message, data);
        return;
    }

    if (type === 'info') {
        console.info(message, data);
        return;
    }

    if (type === 'warning') {
        console.warn(message, data);
        return;
    }
};
var Core = can.Construct('Core', {
    init: function () {
    },

    /**
     * Ссылка на делегат оставлен для совместимости
     */
    delegate: delegate,

    /**
     * UNIX TIME
     * @returns {number}
     */
    time: time,

    /**
     * Генерация уникальной строки
     * @returns {string}
     */
    random: random,

    /**
     * Подсчёт кол-ва элементов на карте
     * @param map
     * @returns {number}
     */
    countMap: countMap,

    /**
     * Очистка рабочей карты
     * @param map
     * @returns {*}
     */
    clearMap: clearMap
});
var CoreGlob = can.Construct('CoreGlob', {
    scope: null,

    init: function (scope) {
        this.scope = scope;

        this.keypress = new window.keypress.Listener();

        this.scope.result = new can.compute(false);

        /**
         * Основное хранилище данных приложения.
         * @type {can.Map}
         */
        this.scope.pool = new can.Map({
            settings: {
                load: {}
            },
            files: new can.Map.List([]),
            templates: null,
            allMyCertificate: new can.Map.List([]),
            keys: {},
            needToPin: {}
        });

        this.scope.req = new Request(this.scope);
        this.scope.iprocess = new InformationProcess(this.scope);
        this.scope.pool.templates = new Templates(this.scope);

        can.bind.call(this.scope, 'settings_loaded', delegate(function () {
            new Logger('Настройки загружены');

            if (this.scope.debug)
                this.runDebug();

            /**
             * Инициализация шаблонов.
             */
            this.scope.pool.templates.load();

            this.run();
        }, this));

        this.ext('outside', delegate(function (name) {
            if (name === 'exitsendfilewindow') {
                can.trigger(this.scope, 'close_window_send_file', [this.scope]);
            }
        }, this));

        this.ext('goUrl', function () {
            window.location.href = url;
        });

        /**
         * Добавление нового файла
         */
        this.ext('addFile', function (name, lastDate, params) {
            var file = new File(name, lastDate, params);

            this.pool.files.push(file);

            return file;
        });

        /**
         * Отдаёт массив готовых к обработке файлов
         * @returns {*}
         */
        this.ext('getFilesString', function () {
            var files = [];

            this.pool.files.each(delegate(function (file) {
                if (file.isHade() === true || file.error() === true) {
                    return 0;
                }

                var _obj = {};
                _obj['FileUri'] = file.path();

                if (file.attachedFile.attached) {
                    _obj['DataFileUri'] = file.attachedFile.path;
                }

                files.push(_obj);
            }, this));

            return JSON.stringify(files);
        });

        this.ext('getArrayFilesString', function (has_show_error) {
            has_show_error = has_show_error || false;
            var files = [];

            this.pool.files.each(delegate(function (file) {
                if ((file.isHade() === true || file.error() === true) && has_show_error === false) {
                    return 0;
                }
                files.push(file.path());
            }, this));

            return files;
        });

        /**
         * Поиск файла по имени
         */
        this.ext('searchFile', function (path) {
            var index, file;

            this.pool.files.each(delegate(function (_f, _i) {
                if (_f.path() === path) {
                    index = _i;
                    file = this.pool.files[_i];
                }
            }, this));

            return {
                index: index,
                file: file
            }
        });

        /**
         * Перебор файлов
         * sort - Какие файлы отдать error|hide|ready|all
         * (возможно комбинировать, типа: @hide,ready@)
         */
        this.ext('fileEach', function (call, sort) {
            call = call || function () {
            };
            sort = sort || 'all';

            var __call = delegate(function (index) {
                call.apply(null, [this.pool.files[index]]);
            }, this);

            this.pool.files.each(delegate(function (file, index) {
                if (sort.indexOf('error') !== -1 && file.error() === true) {
                    __call(index);
                }

                if (sort.indexOf('hide') !== -1 && file.isHade() === true) {
                    __call(index);
                }

                if (sort.indexOf('ready') !== -1 && (!file.error() && !file.isHade())) {
                    __call(index);
                }

                if (sort === 'all') {
                    __call(index);
                }
            }, this));
        });

        this.ext('errorMaster', function () {
            can.$('div[error]').show();
            scroll(100);
        });

        this.ext('loader', function (state) {

            if (state === true) {
                can.$('div[loader]').show();
            } else {
                can.$('div[loader]').hide();
            }

            scroll(100);
        });

        /**
         * Обработчик событий окна выбора уже загруженных файлов.
         */
        this.ext('OpenFilesEventHandler', function (name, params) {
            if (name === 'close') {
                can.trigger(window, 'window_open_files_close', []);
                return;
            }

            if (name === 'addFile') {
                can.trigger(window, 'select_files', [params.key, params.files]);
                return;
            }

            if (name === 'changeTitle') {
                can.trigger(window, 'change_title', [params.key, params.title]);
                return;
            }
        });

        this.ext('onLoadMessage', function (state) {
            if (state === true) {
                window.onbeforeunload = function () {
                    if (Master.debug)
                        return;

                    return 'Вы уверены, что хотите обновить страницу? Все не сохраненные данные будут потеряны! Продолжить?';
                };
                return;
            }

            window.onbeforeunload = function () {
            };
        });

        this.keylogger();

        /*setTimeout(function() {
         Master.onLoadMessage(true);
         }, 2000);*/
    },

    /**
     * Точка входа
     */
    run: function () {
        /**
         * Запрос личных сертификатов
         */
        this.scope.req.begin('find_my_certificate', {}, delegate(function (req) {
            if (req.status === 'error') {
                new Logger('Возникла ошибка при загрузке пользовательских сертификатов', 'error');
                return;
            }

            can.each(req.data.model, delegate(function (c) {
                this.scope.pool.allMyCertificate.push(c);
            }, this));

            new Logger(['Пользовательские сертификаты загружены а колличестве %count штук', {
                '%count': this.scope.pool.allMyCertificate.length
            }]);
        }, this));

        this.runLoadFiles();

        this.scope.layout = new Layout(this.scope.pool.settings.load.tag, {
            scope: this.scope
        });

        this.scope.isLoaded = true;

        /**
         * Событие: Приложение загружено и иниализированно.
         */
        can.trigger(window, 'appRun', [this.scope]);
    },

    /**
     * Перевод режима работы мастера в заданное с главной страницы.
     */
    runLoadFiles: function () {
        var init = this.scope.pool.settings.load.initialize;


        if (init.files.length === 0 && init.type === '') {
            return;
        }
        can.each(init.files, delegate(function (file, index) {
            this.scope.addFile(file.path, file.lastChange, {
                ready: true,
                attached: false
            });
        }, this));

        var actions = {
            Encrypt: 'encrypt',
            SignEncrypt: 'subscribe_and_encrypt',
            Sign: 'subscribe',
            SignVerify: 'check_signature',
            Decrypt: 'decipher',
            DecryptSignverify: 'decipher_check_signature'
        };

        can.bind.call(window, 'appRun', delegate(function () {
            this.scope.layout.main.actionRun(actions[init.type], {
                selectActionOnly: true
            });
        }, this));
    },

    /**
     * Инициализация настроек
     * @param obj
     */
    loadSettings: function (obj) {
        can.each(obj, delegate(function (value, key) {
            this.scope.pool.settings.load.attr(key, value);
        }, this));

        /**
         * Событие: Настройки инициализированны.
         */
        can.trigger(this.scope, 'settings_loaded', [this.scope]);
    },

    /**
     * Поиск загруженного файла по его ID
     * @param id
     * @returns {{file: *, index: *}}
     */
    fileSearch: function (id) {
        var _file = null,
            _index = null;
        this.scope.pool.files.each(function (file, index) {
            if (file.id === id) {
                _file = file;
                _index = index;
            }
        });

        return {
            file: _file,
            index: _index
        };
    },

    /**
     * Этот метод вызывается в в дебаг режиме
     * после полной инициализации мастера.
     */
    runDebug: function () {
        /*this.scope.addFile('Загруженные/Monosnap.msi', new Date(), {
         ready: true,
         attached: false
         });

         this.scope.addFile('Загруженные/LWAPlugin64BitInstaller32.msi', new Date(), {
         ready: true,
         attached: false
         });*/
    },

    /**
     * Регистрация обработчиков нажатия клавиш.
     */
    keylogger: function () {

        this.keypress.simple_combo('f t', delegate(function (e) {
            this.scope.addFile('Загруженные/FastScreen_Setup.exe', new Date(), {
                ready: true,
                attached: false
            });

            this.scope.addFile('Загруженные/Monosnap.msi', new Date(), {
                ready: true,
                attached: false
            });
        }, this));

        this.keypress.simple_combo('f c', delegate(function (e) {
            clearList(this.scope.pool.files);
        }, this));

        this.keypress.simple_combo('l o s t', delegate(function (e) {
            can.$('body').css({
                background: 'red'
            });
        }, this));

        this.keypress.simple_combo('i v', delegate(function (e) {
            var alert = Master.layout.message('Версия системы',
                format('<b>Версия:</b>&nbsp;&nbsp;%number<br /><b>Дата:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%date', {
                    '%number': this.scope.Version.number,
                    '%date': this.scope.Version.date
                }),
                'info', [
                    {
                        text: 'Да',
                        cls: 'btn-green',
                        call: delegate(function () {
                            alert.remove();
                        }, this)
                    }
                ]);
        }, this));
    },

    /**
     * Регистрация пользовательских методов
     * внутри ядра.
     * @param name Имя метода
     * @param call Вызываемая функция (замыкание)
     */
    ext: function (name, call) {
        call = call || function () {
        };
        name = name || '';

        this.scope[name] = delegate(call, this.scope);
    }
});
var Request = can.Construct('Core.Request', {
    scope: null,

    demands: null,

    name: null,

    init: function (scope) {
        this.scope = scope;

        this.demands = new can.Map({});

        this.__addDemands();

        new Logger(['Инициализация сервиса запросов... %count запросов добавлено', {
            '%count': this.scope.countMap(this.demands)
        }]);
    },

    /**
     * Запрос
     * @param name Название запроса
     * @param params Параметры
     * @returns {*}
     */
    begin: function (name, params, fn, scope) {
        fn = fn || function () {
        };

        var ajaxObj = null;

        try {
            var req = this.demands.attr(name),
                reply = function (status, data) {
                    var arg = {
                        status: status,
                        data: data
                    };

                    if (status === 'abort') {
                        new Logger(format('Произошла отмена запроса %name', {
                            '%name': name
                        }));

                        return 0;
                    }

                    if (arg.data['status'] !== undefined && arg.data['status'] === 'Error') {
                        if (arg.data['errorCode'] !== undefined && arg.data['errorCode'] === '401') {
                            var alert = Master.layout.message('Внимание!',
                                'Ваша сессия истекла, необходимо авторизоваться.',
                                'error', [
                                    {
                                        text: 'Да',
                                        cls: 'btn-green',
                                        call: delegate(function () {
                                            window.location.reload();
                                        }, this)
                                    }
                                ]);
                            return 0;
                        }
                    }

                    if (arg.status === 'parsererror') {
                        var alert = Master.layout.message('Ошибка мастера!',
                            format('В процессе обработки запроса произошла непредвиденная ошибка.', {}),
                            'warning', [
                                {
                                    text: 'Закрыть',
                                    cls: 'btn-green',
                                    call: delegate(function () {
                                        alert.remove();
                                    }, this)
                                }
                            ]);
                        return 0;
                    }

                    fn.apply(scope || this.scope, [arg]);
                };

            if (req === undefined) {
                new Logger(['Ошибка в запросе. Адреса "%address" не  существует', {
                    '%address': name
                }], 'error');

                return null;
            }

            if (typeof req.rule === 'function' && req.rule.apply(this, [params, this.scope]) === false) {
                return 0;
            }

            ajaxObj = can.$.ajax(can.extend({
                    type: req.method || 'GET',
                    url: req.url,
                    data: can.extend(params, ((req.params) ? req.params.serialize() : {})),
                    dataType: req.type || 'json',
                    headers: req.headers || {},
                    async: true,
                    cache: false
                }, ((req.ajaxParam) ? req.ajaxParam : {})))
                .done(delegate(function (a, b) {
                    reply(b, a);
                }, this))
                .fail(delegate(function (a, b) {
                    reply(b, a);
                }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выполнении запроса на сервер. "%message"', e);
        }

        return ajaxObj;
    },

    /**
     * Добавление новой записи запроса
     * @param name Имя запроса
     * @param params Параметры запроса
     * @param rewrite Перезаписать (флаг)
     * @returns {boolean} Успех операции
     */
    add: function (name, params, rewrite) {
        if (this.demands.attr(name) !== undefined && rewrite !== true) {
            new Logger(['Ошибка добавления запроса. Имя "%name" уже существует.', {
                '%name': name
            }], 'error');

            return false;
        }

        if (typeof params.url !== 'string') {
            new Logger('Ошибка добавления запроса. В записи не найден URL', 'error');

            return false;
        }

        this.demands.attr(name, params);

        return true;
    },

    __addDemands: function () {
        this.add('user_profile', {
            url: '/Master/GetUserProfile'
        });

        this.add('certificate_info', {
            url: '/Master/GetCertificatesInfo',
            ajaxParam: {
                traditional: true
            }
        });

        this.add('find_my_certificate', {
            url: '/Master/GetMyCertificates'
        });

        this.add('find_all_certificate', {
            url: '/Master/FindCertificate'
        });

        this.add('make_operation', {
            url: '/Master/MakeOperation',
            ajaxParam: {
                traditional: true
            },
            method: 'POST'
        });

        this.add('file_delete', {
            url: '/Master/DeleteFile'
        });

        this.add('check_signed_file_setacment', {
            url: '/Master/CheckSignedFilesAtachment',
            method: 'POST'
        });

        this.add('get_my_certificates', {
            url: '/Master/GetMyCertificates'
        });

        this.add('get_decrypt_certificates', {
            url: '/Master/GetDecryptCertificates',
            ajaxParam: {
                traditional: true
            },
            method: 'POST'
        });

        this.add('set_template_as_default', {
            url: '/Master/SetTemplateAsDefault',
            /**
             * Бизнес правило
             * @param param Входящие параметры запроса
             * @param scope Скоп мастера
             * @returns {boolean} Результат продолжения работы
             */
            rule: function (param, scope) {
                if (param.templateId === '00000000-0000-0000-0000-000000000000')
                    return false;

                return true;
            }
        });

        this.add('get_pin', {
            url: '/Master/NeedToPIN',
            method: 'POST'
        });
    }
});
var Layout = can.Control({
    scope: null,
    container: null,

    openFiles: null,

    init: function (el, options) {
        this.scope = options.scope;

        this.tpLock = new can.compute(false);

        try {
            var view = can.view('/Assets/views/master/layout.hbs', {
                tplock: this.tpLock,
                template: {
                    data: this.scope.pool.templates.items,
                    current: this.scope.pool.templates.current
                },
                isAdmin: this.scope.pool.settings.load.user.isAdmin,
                event: {

                        template_click: delegate(function (template, el, ev) {
                        var next = delegate(function () {
                            new Logger(['Выбран профиль: %template', {
                                '%template': template.Name
                            }]);

                            if (this.scope.isLoaded) {
                                this.scope.pool.keys.attr('profile_load_id', this.scope.iprocess.add(format('Устанавливается профиль «%template»...', {
                                    '%template': template.Name
                                }), delegate(function () {
                                    scroll(100);
                                }, this)));
                            }
                            this.scope.pool.templates.changeCurrent(template.ID);

                        }, this);

                        if (can.$.inArray(this.main.actionValue(), ['subscribe', 'encrypt', 'subscribe_and_encrypt']) !== -1) {
                            closeConfirm('При смене шаблона все внесенные изменения будут потеряны. Вы уверены, что хотите сменить шаблон?', delegate(function () {
                                next.apply(this, []);
                                scroll(100);
                            }, this));
                        } else {
                            next.apply(this, []);
                        }


                    }, this),
                    myProfile: delegate(function () {
                        if (this.scope.result()) {
                            window.location.href = '/Default/MyProfile';
                            return;
                        }

                        closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                            window.location.href = '/Default/MyProfile';
                        });
                    }, this) ,
                    addressBook: delegate(function () {
                        if (this.scope.result()) {
                            window.location.href = '/AddressBook';
                            return;
                        }

                        closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                            window.location.href = '/AddressBook';
                        });
                    }, this),
                    settings: delegate(function () {
                        if (this.scope.result()) {
                            window.location.href = '/Settings';
                            return;
                        }

                        closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                            window.location.href = '/Settings';
                        });
                    }, this),
                    administration: delegate(function () {
                        if (this.scope.result()) {
                            window.location.href = '/Administration';
                            return;
                        }

                        closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                            window.location.href = '/Administration';
                        });
                    }, this)
                },
                pool: this.scope.pool,
                exit_app: delegate(function () {
                    if (this.scope.result()) {
                        window.location.href = '/Default/WebDavBrowser';
                        return;
                    }

                    closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                        window.location.href = '/Default/WebDavBrowser';
                    });
                }, this),
                backFiles: delegate(function () {
                    if (this.scope.result()) {
                        window.location.href = '/Default/WebDavBrowser';
                        return;
                    }

                    closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                        window.location.href = '/Default/WebDavBrowser';
                    });
                }, this)
            });

            this.scope.pool.templates.current.bind('change', function () {
                console.log(arguments);
            });

            this.element.append(view);

            this.container = el.find('div[app]');

            this.main = new Main(this.container, {
                scope: this.scope
            });

            new Logger('Layout загружен');

            /**
             * Скрываем выпадающий список
             * с профилями по клику на
             * пустом месте в любой части страницы.
             */
            can.$('body').click(function () {
                $('.dropdown-menu.profile').hide();
            });
        } catch (e) {
            alertError('Неожиданная ошибка произошла при отрисовке страницы. "%message"', e);
        }
    },

    /**
     * Отоброжает модальное окно
     * @param title Заголовок
     * @param content Наполнение формата:
     * {
     *      type|String: [text|path],
     *      path|String: '',
     *      params|String: ''
     * }
     * @param type Тип окна
     * @returns {{setTitle: setTitle, remove: remove}}
     */
    modal: function (title, content, type, searchLine) {

        var modalObj = null, exitFnCall = function () {
        };

        type = type || 'box';
        var _searchLine = (searchLine === undefined) ? false : true,
            _content = '',
            _title = new can.compute(title),
            _searchValue = new can.compute(''),
            _loading = new can.compute(false),
            searchLine = searchLine || function () {
            };

        if (content !== undefined) {
            if (content.type === 'text') {
                _content = content.body;
            }
            if (content.type === 'path') {
                var _params = can.extend(content.params, {
                    searchValue: _searchValue
                });
                _content = can.view.render('/Scripts/master/view/modals/' + content.path, _params);
            }
        }

        var modal = can.view('/Assets/views/master/modal.hbs', {
            title: _title,
            content: _content,
            type: type,
            searchLine: _searchLine,
            searchValue: delegate(function (scope, el, ev) {
                searchLine.apply(this, [el.val()]);
            }, this),
            loading: _loading
        }, {
            close: delegate(function () {
                return delegate(function (el) {
                    modalObj = $(el).parent().parent().parent();
                    $(el).click(delegate(function () {
                        exitFnCall.apply(this, []);
                        modalObj.remove();
                    }, this));
                }, this);
            }, this)
        });

        this.element.append(modal);

        $('#modal .window').animate({
            opacity: 1
        }, 'fast');

        return {
            /**
             * Установка заголовка
             * @param title
             */
            setTitle: function (title) {
                _title(title);
            },
            /**
             * Закрытие модального окна
             */
            remove: function () {
                modalObj.remove();
            },
            /**
             * Установка и снятие лоадера
             * @param title
             */
            loading: function (title) {
                _loading(title);
            },

            onExit: function (call) {
                exitFnCall = call;
            }
        };
    },

    /**
     * Выводит модальное сообщение
     * @param title Заголовок
     * @param text Текст сообщения
     * @param icon Иконка [warning|error]
     * @param btns Кнопки формата:
     *
     * [
     *      {
     *          // Текст кнопки
     *          text: '',
     *          // Класс кнопки
     *          cls: '',
     *          // Событие клика
     *          call: function(){}
     *      }
     * ]
     * @returns {{setTitle: setTitle, remove: remove}}
     */
    message: function (title, text, icon, btns) {
        var body, modal, exitFn = function () {
        };

        body = can.view.render('/Assets/views/master/modals/message.hbs', {
            icon: icon,
            text: text,
            btns: btns
        });

        modal = this.modal(title, {
            type: 'text',
            body: body
        }, 'alert');

        can.each(btns, delegate(function (btn) {
            if (btn.exit === true) {
                exitFn = btn.call;
            }
        }, this));

        modal.onExit(function () {
            exitFn.apply(this, []);
        });

        return modal;
    },

    '.show_template click': function (el, ev) {
        ev.stopPropagation();

        $('.dropdown-menu.profile').toggle();
    },

    '.dropdown-menu.profile li a click': function (el, ev) {
        ev.stopPropagation();

        $('.dropdown-menu.profile').hide();
    },

    /**
     * Заблокировать / разблокировать выбор профиля
     * @param hasLock
     */
    templateLock: function (hasLock) {
        this.tpLock(hasLock === true);
    }
});

can.extend(Layout.prototype, can.event);
var InformationProcess = can.Construct('Helpers.InformationProcess', {
    init: function (scope) {
        this.scope = scope;

        this.process = new can.Map.List();

        this.current = new can.compute(null);
        this.currentProcess = new can.compute(null);

        this.countProcess = new can.compute(0);
        this.time = new can.compute('00:00');

        this.message = null;
        this.cap = null;

        this.visibility = false;

        this.__timeInterval = null;
        this.__timeTicks = 0;

        var view = can.view('/Assets/views/master/information_process.hbs', {
            current: this.current,
            countProcess: this.countProcess,
            exit: delegate(this.exit, this),
            time: this.time
        });

        can.bind.call(window, 'appRun', delegate(function (ev, scope) {
            $('div[information_process]').append(view);

            this.message = $('div[information_process] div[message]');
            this.cap = $('div[information_process] .cap');

            this.cap.hide();
        }, this));

        can.bind.call(window, 'process_exit', delegate(function (ev, id) {
            var itemID = listObjSearch(this.process, 'ID', id);
            if (can.$.inArray(itemID, [null, undefined]) !== -1)
                return;

            this.process[itemID].ExitFn.apply(this, [0]);

            this.process.splice(itemID, 1);
        }, this));

        this.process.bind('change', delegate(function (ev, attr, how, newVal, oldVal) {
            this.__run();
        }, this));
    },

    /**
     * Внутренний запуск
     * @private
     */
    __run: function () {

        if (this.process.length > 0) {
            if (!this.visibility)
                this.__show();

            var showFn = function () {
                this.currentProcess(this.process[0]);

                this.current(this.currentProcess().Name);

                this.__animateMessageShow();

                /**
                 * Возникает когда запускается процесс.
                 */
                can.trigger(window, 'process_run', [this.process[0].ID, this.process[0].Name]);
            };

            if (this.current() !== null)
                this.__animateMessageHide(showFn);

            showFn.apply(this, []);
        } else {
            this.current(null);
            this.currentProcess(null);

            if (this.visibility)
                this.__hide();
        }

        this.countProcess(this.process.length);
    },

    /**
     * Добавления задачи
     * @param name
     * @returns {*}
     */
    add: function (name, callExit) {
        var ID = guid();

        this.process.push({
            ID: ID,
            Name: name,
            ExitFn: callExit || function () {
            }
        });

        return ID;
    },

    /**
     * Отображение нового сообщения
     * @param text Текст сообщения
     * @private
     */
    __showMessage: function (text) {

    },

    /**
     * Отображение панели
     * @private
     */
    __show: function (call) {
        call = call || function () {
        };


        $('#information_process').animate({
            bottom: 0
        }, 'fast', delegate(function () {
            call.apply(this, []);

            this.cap.show();
        }, this));

        this.visibility = true;

        this.__timeInterval = setInterval(delegate(function () {
            this.__timeTicks++;

            var minutes = Math.floor(this.__timeTicks / 60);
            var seconds = this.__timeTicks - minutes * 60;

            this.time(format('mm:ss', {
                'mm': (minutes < 10) ? '0' + minutes : minutes,
                'ss': (seconds < 10) ? '0' + seconds : seconds
            }));
        }, this), 1000);
    },

    /**
     * Скрывание панели
     * @private
     */
    __hide: function (call) {
        call = call || function () {
        };

        $('#information_process').animate({
            bottom: -90
        }, 'fast', delegate(function () {
            call.apply(this, []);

            this.cap.hide();
        }, this));

        this.visibility = false;

        clearInterval(this.__timeInterval);
        this.time('00:00');
        this.__timeTicks = 0;
    },

    /**
     * Анимация отображения сообщения
     * @private
     */
    __animateMessageShow: function (call) {
        call = call || function () {
        };

        this.message.css({
            'margin-top': 35,
            opacity: 0
        }).animate({
                'margin-top': 18,
                opacity: 1
            }, 'fast', delegate(function () {
            call.apply(this, []);
        }, this));
    },

    /**
     * Анимация скрывание сообщения
     * @private
     */
    __animateMessageHide: function (call) {
        call = call || function () {
        };

        this.message.css({
            'margin-top': 18,
            opacity: 1
        }).animate({
                'margin-top': 1,
                opacity: 0
            }, 'fast', delegate(function () {
            call.apply(this, []);
        }, this));
    },

    exit: function () {
        this.process.each(delegate(function (p, i) {
            p.ExitFn.apply(this, [-1, p.ID]);
        }, this));

        clearList(this.process);
    }
});
var Template = can.Construct.extend('Core.Templates.Template', {
    init: function (scope, id, name) {
        this.ID = id || 0;

        this.Name = name;

        this.Settings = new can.Map({
            raw: null,
            signature: {
                detached: '',
                zipType: '',
                encodingType: ''
            },
            encryption: {
                zipType: '',
                encodingType: ''
            }
        });

        this.Certificate = new can.Map({
            signature: new can.Map.List([]),
            encryption: new can.Map.List([]),
            personal: new can.Map.List([])
        });

        this.Detail = new can.compute(false);

        this.scope = scope;

        __loadTemplate = false;

        this.looadID = null;
    },

    /**
     * Получение полной информации о шаблоне
     * включая информацию о подключенных сертификатов.
     */
    getDetails: function () {

        clearList(this.Certificate.signature);
        clearList(this.Certificate.encryption);
        clearList(this.Certificate.personal);

        this.__getSettings();

        /**
         * Ждём когда применятся все настройки,
         * в том числе и сертификаты.
         */
        setTimeout(delegate(this.__getCertificate, this), 1000);

        if (this.scope.isLoaded && this.ID !== '00000000-0000-0000-0000-00000000000')
            this.scope.req.begin('set_template_as_default', {templateId: this.ID});

        //this.Detail(true);
    },

    /**
     * Получение настроек профиля
     * @private
     */
    __getSettings: function () {

        if (this.ID === '00000000-0000-0000-0000-000000000000') {

            this.__runConfig(this.scope.pool.settings.load.templates.default);
            return;
        }

        this.scope.req.begin('user_profile', {profileId: this.ID}, function (req) {
            if (req.status === 'error') {
                new Logger(['При загрузке настроек профиля "%name" возникли проблемы', {
                    '%name': this.Name
                }], 'error', req);
                return false;
            }

            this.__runConfig(req.data);
        }, this);
    },

    __runConfig: function (conf) {
        this.Settings.attr('raw', conf);

        var _signature = conf._SignatureSettings;
        var _encryption = conf._EncryptionSettings;

        if (_signature === undefined) {
            new Logger(['Возникла ошибка при получении настроек для подписи, шаблона "%name"', {
                '%name': this.Name
            }], 'error');
        }

        if (_encryption === undefined) {
            new Logger(['Возникла ошибка при получении настроек для шифрования, шаблона "%name"', {
                '%name': this.Name
            }], 'error');
        }

        this.Settings.signature.attr('detached', _signature.Detached ? false : true);
        this.Settings.signature.attr('zipType', _signature.ZipType);
        this.Settings.signature.attr('encodingType', _signature._EncodingType);

        this.Settings.encryption.attr('zipType', _encryption.ZipType);
        this.Settings.encryption.attr('encodingType', _encryption._EncodingType);

        if (_signature.SignerCertificate1 !== null) {
            this.Certificate.signature.push({
                hash: _signature.SignerCertificate1,
                data: null
            });
        }

        if (_encryption.RecipientCertificates1 !== null && _encryption.RecipientCertificates1.length > 0) {
            can.each(_encryption.RecipientCertificates1, delegate(function (hash) {
                this.Certificate.encryption.push({
                    hash: hash,
                    data: null
                });
            }, this));
        }
    },

    /**
     * Получение сертификатов профиля
     * @private
     */
    __getCertificate: function () {
        var __complite_s = false,
            __complite_e = false,
            checkComplite = delegate(function () {
                if (__complite_e === true && __complite_s === true) {
                    setTimeout(delegate(function () {
                        can.trigger(window, 'process_exit', [this.scope.pool.keys.attr('profile_load_id')]);
                    }, this), 2000);
                }
            }, this);

        /**
         * Запрашиваем детальную информацию по сертификату подписи.
         */
        if (JSON.stringify(this.Certificate.signature.serialize()).length > 2) {

            var hash = [];
            this.Certificate.signature.each(delegate(function (item, index, obj) {
                hash.push(item.hash);
            }, this));

            this.scope.req.begin('certificate_info', {
                thumbprints: hash
            }, function (sReq) {
                if (sReq.status === 'error') {
                    new Logger('Произошла ошибка при получении сертификата подписи', 'error', sReq);
                    return false;
                }

                new Logger('Сертификат для подписи успешно зашружены');

                can.each(sReq.data.certificates, delegate(function (obj, index) {
                    this.__searchCertificate(obj.Thumbprint, 'signature', delegate(function (item) {
                        item.attr('data', obj);
                    }, this));
                }, this));

                __complite_s = true;
                checkComplite();
            }, this);
        } else {
            __complite_s = true;
            checkComplite();
        }

        /**
         * Запрашиаем детальную информацию по сертификатам шифрования.
         */
        if (JSON.stringify(this.Certificate.encryption.serialize()).length > 2) {

            var hash = [];
            this.Certificate.encryption.each(delegate(function (item, index) {
                hash.push(item.hash);
            }, this));

            this.scope.req.begin('certificate_info', {
                thumbprints: hash
            }, function (sReq) {
                if (sReq.status === 'error') {
                    new Logger('Произошла ошибка при получении сертификатов шифрования', 'error', sReq);
                    return false;
                }

                new Logger('Сертификат для шифрования успешно зашружены');

                can.each(sReq.data.certificates, delegate(function (obj, index) {
                    this.__searchCertificate(obj.Thumbprint, 'encryption', delegate(function (item) {
                        if (obj.MyCertificate !== null) {

                            var index = listObjSearch(this.Certificate.encryption, 'hash', obj.Thumbprint);
                            if (index === undefined)
                                return;

                            this.Certificate.encryption.splice(index);
                            return;
                        }

                        item.attr('data', obj);
                    }, this));

                    if (obj.MyCertificate !== null) {
                        new Logger('Найден личный сертификат шифрования', undefined, obj);

                        this.Certificate.personal.push(obj);
                    }

                }, this));


                __complite_e = true;
                checkComplite();

                /**
                 * Устанавливаем флаг о получения
                 * детальной информации.
                 */
                this.Detail(true);
            }, this);
        } else {
            __complite_e = true;
            checkComplite();
            this.Detail(true);
        }
    },

    __searchCertificate: function (hash, type, call) {
        type = type || 'signature';

        var store = this.Certificate[type],
            item = null;

        can.each(store, delegate(function (obj, index) {
            if (obj.hash === hash) {
                item = store[index];
            }
        }, this));

        if (item !== null) {
            call.apply(this, [item]);
        }
    }
});
/**
 * Created by Александр on 24.03.14.
 */

var Templates = can.Construct.extend('Core.Templates', {

    init: function (scope) {
        this.scope = scope;

        this.items = new can.Map.List([]);
        this.current = can.compute(null);
    },

    load: function () {
        try {

            var cur = null,
                all = this.scope.pool.settings.load.templates.all;

            all.sort(function (a, b) {
                if (a.Name[0].charCodeAt() > b.Name[0].charCodeAt())
                    return 1

                if (a.Name[0].charCodeAt() < b.Name[0].charCodeAt())
                    return -1

                return 0;
            });

            can.each(all, delegate(function (template, key) {
                this.items.push(new Template(this.scope, template.ID, template.Name));

                if (template.IsDefault === true) {
                    cur = template;
                    this.changeCurrent(template.ID);
                }
            }, this));

            if (cur !== null) {
                return;
            }

            if (all.length > 1 && cur === null) {

                this.changeCurrent(all[0].ID);
                return;
            }

            if (all.length === 1 || (cur === null && all.length !== 0)) {
                this.changeCurrent(all[0].ID);
            } else {
                this.current({
                    Name: 'Шаблона нет'
                });
            }
        } catch (e) {
            alertError('Неожиданная ошибка произошла при обработке шаблона. "%message"', e);
        }
    },

    search: function (str, type) {
        var type = type || 'id',
            _item = null;

        try {
            this.items.each(delegate(function (item, index) {
                if (type === 'id') {
                    if (item.ID === str) {
                        _item = this.items[index];
                    }

                    return;
                }

                if (type === 'name') {
                    if (item.Name === str) {
                        _item = this.items[index];
                    }

                    return;
                }
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при обработке шаблона. "%message"', e);
        } finally {
            return _item;
        }
    },

    changeCurrent: function (id) {

        var item = this.search(id, 'id');

        if (item === null) {
            new Logger(['Не удалось обнаружить шаблон по ID "%id"', {
                '%id': id
            }], 'error');

            return;
        }
        this.current(item);
        $('.show_template').html(item.Name);
        item.getDetails();

        new Logger(['Шаблон по умолчанию "%name", установлен', {
            '%name': item.Name
        }]);
    }

});
/**
 * Created by Александр on 09.04.14.
 */
var File = can.Construct.extend('Core.File', {
    init: function (path, lastDate, params) {

        /**
         * Путь до файла
         * @type {*}
         */
        this.path = new can.compute(path);
        /**
         * Время последнего изменения
         * @type {*}
         */
        this.lastDate = new can.compute('');

        /**
         * Скрыт ли файл
         * @type {can.compute}
         */
        this.isHade = new can.compute(false);

        this.error = new can.compute(false);
        this.errorMessage = new can.compute('');

        /**
         * Процент загрузки
         * @type {can.compute}
         */
        this.upPercen = new can.compute(0);
        /**
         * Загружен ли файл
         * @type {can.compute}
         */
        this.uploaded = new can.compute(false);
        this.uploader = null;

        this.attachedFile = new can.Map({
            attached: false,
            path: '',
            error: false,
            errorMessage: ''
        });

        this.inner = params['inner'] || null;

        /**
         * Необработанное время изменения
         * @type {*}
         * @private
         */
        this.__rawLastDate = lastDate;

        this.setLastDate(lastDate);
        this.__setParams(params);

        this.id = guid();

        can.bind.call(window, 'upload_file_attached_reg', delegate(function (ev, id) {
            if (id === this.id) {
                if (this.uploader !== null) {
                    this.uploader.unbindAll();
                    this.uploader = null;
                }

                setTimeout(delegate(this.__fileUploadReg, this), 500);
            }
        }, this));
    },

    /**
     * Скрывает файл
     * @returns {File}
     */
    hide: function () {
        this.isHade(true);
        return this;
    },

    /**
     * Показывает файл
     * @returns {File}
     */
    show: function () {
        this.isHade(false);
        return this;
    },

    /**
     *
     *
     * @returns {File}
     */
    toggel: function () {
        this.isHade(this.isHade() === true);
        return this;
    },

    /**
     *
     * @param date
     * @returns {File}
     */
    setLastDate: function (date) {
        this.lastDate(moment(date).format('DD.MM.YYYY'));
        this.__rawLastDate = date;
        return this;
    },

    /**
     * Выводит ошибку
     * @param str Строка ошибки, если строка пуста, то ошибка снимается.
     * @returns {File}
     */
    InnerError: function (str) {
        this.error(str !== null);
        this.errorMessage((str === null) ? '' : str);

        return this;
    },

    /**
     *
     * @param params
     * @private
     */
    __setParams: function (params) {
        if (params === undefined)
            return;

        if (params['ready'] === true) {
            this.uploaded(true);
            this.upPercen(100);
        }

        if (params['attached'] === true) {
            this.attachedFile.attr('attached', true);
        }
    },

    __fileUploadReg: function () {
        if (this.uploader !== null)
            return;

        this.uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: this.id,
            //max_file_size: '20mb',
            url: Master.pool.settings.load.urlUpload,
            multi_selection: false,
            init: {
                FilesAdded: delegate(function (up, files) {
                    //55
                    if (files.length >= 10) {
                        var alert = Master.layout.message('Внимание!',
                            format('Превышено максимально допустимое число загружаемых файлов(<b>%fileCount</b>), повторите попытку.<br />Максимально допустимое число одновременно загружаемых файлов равно <b>10</b>.', {
                                '%fileCount': files.length
                            }),
                            'warning', [
                                {
                                    text: 'Да',
                                    cls: 'btn-green',
                                    call: delegate(function () {
                                        alert.remove();
                                    }, this)
                                }
                            ]);
                        return;
                    }

                    new UploadVerifyFiles(this.uploader, files);

                    this.uploader.start();
                }, this),

                FileUploaded: delegate(function (up, file, info) {
                    var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                    if (res.status == 'ok') {
                        this.attachedFile.attr('error', false);
                        this.attachedFile.attr('path', res.fileName);
                    }
                }, this),

                UploadProgress: delegate(function (up, file) {
                    this.uploaded(up.total.percent);
                }, this),

                StateChanged: delegate(function (up) {
                    if (up.state == plupload.STARTED) {
                        this.uploaded(false);
                    } else {
                        this.uploaded(true);
                    }
                }, this)
            }
        });

        this.uploader.init();
    }
});
var Actions = can.Control({
    scope: null,
    /**
     * Готовность файлов.
     */
    filesReady: null,

    init: function (el, options) {
        this.scope = options.scope;
        this.filesReady = new can.compute(false);

        var view = can.view('Assets/view/master/actions.hbs', {
            pool: this.scope.pool,
            event: {
                file_list_open: this.scope.delegate(function () {
                    this.selectFiles();
                }, this),
                // Удалить из списка
                hide_for_list: this.scope.delegate(function (file) {
                    file.attr('isHade', true);
                }, this),
                // Восстановить
                show_for_list: this.scope.delegate(function (file) {
                    file.attr('isHade', false);
                }, this),
                // Скрыть
                delete_for_list: this.scope.delegate(function (file) {
                    var index = this.scope.core.fileSearch(file.name).index;

                    this.scope.pool.files.splice(index, 1);
                }, this),
                cancel: this.scope.delegate(function () {
                    this.scope.pool.files.each(this.scope.delegate(function (file, index) {
                        this.scope.pool.files.splice(index, 1);
                    }, this));
                }, this)
            },
            filesReady: this.filesReady,
            aaa: 123
        }, {
            activeUploader: this.scope.delegate(function () {
                setTimeout(this.scope.delegate(function () {
                    this.regUploader();
                }, this), 500);
            }, this)
        });

        el.append(view);

    },

    selectFiles: function () {
        new Logger('open');

        this.scope.layout.modal('Выберите файл для добавления', 'select_files.hbs', {}, 'box');
    },

    /**
     * Регистрация загрузчика файлов.
     * (Биндинг на элемент дома)
     */
    regUploader: function () {
        this.uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: 'newFile',
            url: this.scope.pool.settings.load.urlUpload,
            init: {
                FilesAdded: this.scope.delegate(function (up, files) {

                    can.each(files, this.scope.delegate(function (file) {
                        this.scope.pool.files.push({
                            name: file.name,
                            date: moment.unix(this.scope.time()).format('DD.MM.YYYY'),
                            uploaded: false,
                            upPercen: 0,
                            isHade: false
                        });

                        file.a = this.scope.core.fileSearch(file.name).file;
                    }, this));

                    this.uploader.start();
                }, this),

                FileUploaded: this.scope.delegate(function (up, file, info) {
                    var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                    if (res.status == 'ok') {
                        file.a.attr('uploaded', true);
                    }

                }, this),

                UploadProgress: this.scope.delegate(function (up, file) {

                    file.a.attr('upPercen', up.total.percent);
                }, this),

                StateChanged: this.scope.delegate(function (up) {
                    if (up.state == plupload.STARTED) {
                        // Начало загрузки
                    } else {
                        // Загрузка закончена
                    }
                }, this)
            }
        });

        this.uploader.init();
    }
});
var Main = can.Control({
    scope: null,

    init: function (el, options) {

        this.scope = options.scope;
        this.filesReady = new can.compute(false);
        this.actionReady = new can.compute(false);
        this.masterReady = new can.compute(false);
        this.certReady = new can.compute(false);
        this.actionValue = new can.compute(0);

        this.result = new can.compute(false);

        this.action = new can.compute(null);

        this.uploader = null;
        var view = can.view('/Assets/views/master/actions.hbs', {
            pool: this.scope.pool,
            event: {
                file_list_open: delegate(this.selectFiles, this),
                /**
                 * Удалить из списка
                 */
                hide_for_list: delegate(function (file) {
                    file.isHade(true);
                }, this),
                /**
                 * Восстановить
                 */
                show_for_list: delegate(function (file) {
                    file.isHade(false);
                }, this),
                /**
                 * Удалить совсем (убрать из списка)
                 */
                delete_for_list: delegate(function (file) {
                    this.fileRemove(file);
                }, this),
                upload_exit: delegate(function (file) {
                    this.fileRemove(file);
                }, this),
                /**
                 * Клик по кнопке "отмена"
                 */
                cancel: delegate(function () {
                    closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function () {
                        window.location.href = '/Default/WebDavBrowser';
                    });
                }, this),
                action_value: this.actionValue,
                /**
                 * Клик по нопке "продолжить" с выбранным действием
                 */
                action_run: delegate(function () {
                    new Logger(['Запускаем действие "%action"', {
                        '%action': this.actionValue()
                    }]);

                    this.actionRun(this.actionValue());
                }, this),
                refiles: delegate(this.reFiles, this, [true]),
                result: this.result
            },
            filesReady: this.filesReady,
            actionReady: this.actionReady,
            masterReady: this.masterReady,
            action: this.action,

            openSelectFileDialog: delegate(function (file, el, ev) {
                var _file = file;

                new OpenUploadFileDialog(delegate(function (files, params) {

                    var file = this.scope.searchFile(params.file.path()).file;
                    file.attachedFile.attr('error', false);
                    file.attachedFile.attr('path', files[0].path);
                }, this), {
                    file: file,
                    multi_selection: false
                });
            }, this)


        }, {
            activeUploader: delegate(function () {
                setTimeout(delegate(function () {
                    this.regUploader();
                }, this), 500);
            }, this)
        });

        el.append(view);

        /**
         * Отслеживание изменений в файлах
         */
        this.scope.pool.files.bind('change', delegate(function (ev, attr, how, newVal, oldVal) {
            this.checkFileReady();
        }, this));

        /**
         * Отслеживание изменения действия
         */
        this.actionValue.bind('change', delegate(function (ev, text, value) {
            this.checkActionReady();
            this.actionToTempale(text);
        }, this));

        /**
         * Отслеживание общей готовности к действию. (Ориентация на файлы)
         * (готов набор файлов и выбрано действие над ними)
         */
        this.filesReady.bind('change', delegate(function (ev, text, value) {
            this.checkMasterReady();
        }, this));

        this.certReady.bind('change', delegate(function (ev, text, value) {
            this.checkMasterReady();
        }, this));

        /**
         * Отслеживание общей готовности к действию. (ориентация на действие)
         * (готов набор файлов и выбрано действие над ними)
         */
        this.actionReady.bind('change', delegate(function (ev, text, value) {
            this.checkMasterReady();
        }, this));

        this.masterReady.bind('change', delegate(function (ev, newVal, oldVal) {

        }, this));


        can.bind.call(this.scope, 'appRun', delegate(function (ev, scope) {
            /**
             * После полной загрузке мастера, проверяем готовность файлов.
             */
            this.checkFileReady();
        }, this));

        can.bind.call(this.scope, 'action_okay', delegate(function (ev, scope) {
            this.result(true);
        }, this));

        setInterval(delegate(function () {
            this.checkFileReady();
            this.checkActionReady();
            this.checkCertReady();

            this.checkMasterReady();
        }, this), 500);
    },

    fileRemove: function (file) {
        if (file.inner !== null) {
            this.uploader.removeFile(file.inner);
            file.inner.destroy()
        }

        var index = this.scope.core.fileSearch(file.id).index;

        this.scope.pool.files.splice(index, 1);
    },

    actionToTempale: function (name) {
        this.scope.layout.templateLock(can.$.inArray(name, ['subscribe', 'encrypt', 'subscribe_and_encrypt']) === -1);
    },

    checkCertReady: function () {
        return this.certReady(this.scope.pool.templates.current().Detail());
    },

    /**
     * Проверка на готовность файлов
     */
    checkFileReady: function () {
        var ready = true,
            allHide = true;
        this.scope.pool.files.each(function (file) {
            if (file.uploaded() === false)
                ready = false;

            if (file.isHade() === false)
                allHide = false;
        });

        if (this.scope.pool.files.length === 1 && this.scope.pool.files[0].isHade() === true)
            ready = false;

        if (allHide)
            ready = false;

        this.filesReady(ready);
    },

    /**
     * Проверка на готовность действия
     */
    checkActionReady: function () {
        this.actionReady((parseInt(this.actionValue()) !== 0) ? true : false);
    },

    /**
     * Проверка на готовность мастера к работе
     */
    checkMasterReady: function () {
        this.masterReady((this.filesReady() === true && this.actionReady() === true && this.checkCertReady() === true) ? true : false);
    },

    selectFiles: function () {
        new OpenUploadFileDialog(delegate(function (files) {
            can.each(files, delegate(function (file) {
                this.scope.addFile(file.path, file.lastChange, {
                    ready: true
                });
            }, this));
        }, this));
    },

    /**
     * Регистрация загрузчика
     */
    regUploader: function () {
        this.uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: 'newFile',
            drop_element: 'newFile',
            //max_file_size: '20mb',
            url: this.scope.pool.settings.load.urlUpload,
            chunk_size: '100kb',
            init: {
                FilesAdded: delegate(function (up, files) {
                    if (files.length > 10) {
                        var alert = Master.layout.message('Внимание!',
                            format('Превышено максимально допустимое число загружаемых файлов, повторите попытку. Максимально допустимое число одновременно загружаемых файлов равно <b>10</b>.', {
                                '%fileCount': files.length
                            }),
                            'error', [
                                {
                                    text: 'Закрыть',
                                    cls: 'btn-green',
                                    call: delegate(function () {
                                        $('.upload').removeClass('drag');
                                        alert.remove();
                                    }, this)
                                }
                            ]);
                        return;
                    }

                    new UploadVerifyFiles(this.uploader, files, delegate(function (files) {
                        can.each(files, delegate(function (file, index) {
                            file.fileObj = this.scope.addFile(file.name, new Date(), {
                                inner: file
                            });
                        }, this));
                    }, this));

                    this.uploader.start();
                }, this),

                FileUploaded: delegate(function (up, file, info) {
                    var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                    if (res.status == 'ok') {
                        file.fileObj.uploaded(true);

                        file.fileObj.path(res.fileName);
                    }

                    if (res.status === 'Error') {
                        var _alert = Master.layout.message('Внимание!',
                            format('Невозможно загрузить файл "%name"', {
                                '%name': file.name
                            }),
                            'error', [
                                {
                                    text: 'Закрыть',
                                    cls: 'btn-green',
                                    call: delegate(function () {
                                        _alert.remove();
                                    }, this)
                                }
                            ]);

                        this.uploader.removeFile(file);
                    }

                }, this),

                UploadProgress: delegate(function (up, file) {
                    try {
                        file.fileObj.upPercen(file.percent);
                    } catch (e) {
                        new Logger(e.name);
                    }
                }, this),

                StateChanged: delegate(function (up) {
                    if (up.state == plupload.STARTED) {
                        // Начало загрузки
                    } else {
                        // Загрузка закончена
                    }
                }, this)
            }
        });

        this.uploader.init();

        var button = $('#newFile');

        button.on('dragenter', function () {
            button.addClass('drag');
        });

        button.on('dragleave', function () {
            button.removeClass('drag');
        });
    },

    actionRun: function (name, params) {
        name = name || '';
        params = params || {};

        if (name.length < 3) {
            this.action(null);
            return;
        }

        if (exist(params['selectActionOnly'], true)) {
            this.actionValue(name);

            setTimeout(delegate(function () {
                scroll(100);
                can.$('#selectAction').focus();
            }, this), 500);
            return;
        }

        /**
         * Действия:
         * - подпись
         * - шифрование
         * - подпись и шифрование
         */
        if (can.$.inArray(name, ['subscribe', 'encrypt', 'subscribe_and_encrypt']) !== -1) {
            this.action(new SignAndEncrypt(can.$('div[action]'), {
                scope: this.scope,
                main: this,
                actionName: name
            }));
            this.result(true);
        }

        /**
         * Действие:
         * - проверка подписи
         */
        if (name === 'check_signature') {
            this.action(new CheckSignature(can.$('div[action]'), {
                scope: this.scope,
                main: this,
                actionName: name
            }));

            this.scope.layout.templateLock(true);
        }

        if (name === 'decipher') {
            this.action(new Decipher(can.$('div[action]'), {
                scope: this.scope,
                main: this,
                actionName: name
            }));
            this.result(true);

            this.scope.layout.templateLock(true);
        }

        if (name === 'decipher_check_signature') {
            this.action(new DecipherAndCheckSignature(can.$('div[action]'), {
                scope: this.scope,
                main: this,
                actionName: name
            }));
            this.result(true);

            this.scope.layout.templateLock(true);
        }

        scroll(100);
    },

    /**
     * Изменение состава файлов
     * @param showMessage Вывесть ли предупреждающее сообщение
     */
    reFiles: function (showMessage, text) {
        text = text || 'При смене состава файлов все изменения, сделанные на последующих этапах, будут потеряны. Продолжить?';

        if (showMessage === true) {
            closeConfirm(text, delegate(function () {
                this.result(false);
                this.clearAction();

                $('body').animate({'scrollTop': 100}, 'slow');

                /**
                 * Вновь регистрируем загрузчик вайлов
                 * с задержкой
                 */
                setTimeout(delegate(this.regUploader, this), 500);
            }, this));
        } else {
            this.clearAction();
            setTimeout(delegate(this.regUploader, this), 500);
        }

        /**
         * Убираем ошибки у файлов (если есть)
         */
        this.scope.pool.files.each(function (file) {
            file.InnerError(null);
        });
    },

    /**
     * Очистка мастера от действия
     */
    clearAction: function () {
        this.action(null);
        this.result(false);

        can.$('div[action]').html('');
        can.$('div[result]').html('');
        can.$('#select-files .action-change select').focus();

        this.actionToTempale(this.actionValue());
        this.scope.result(false);
    }
});
var SignAndEncrypt = can.Control({

    /**
     *
     * @param el
     * @param options
     */
    init: function (el, options) {
        // В любой непонятной ситуации просто ложись спать.
        try {
            /**
             * ОЧЕНЬ, очень плохо! Не нужно так делать!!!
             * @type {SignAndEncrypt}
             */
            var self = this;

            this.scope = options.scope;
            this.main = options.main;

            this.template = this.scope.pool.templates.current;

            this.view_detail = new can.compute(false);
            this.result = new can.compute(false);
            this.operationCode = new can.compute(0);

            this.modalFileSend = null;

            this.sigAddID = guid();
            this.errorSelectEncSert = can.compute(false);

            this.resultData = new can.Map({
                error: false,
                errorMessage: '',
                files: [],
                event: {
                    sendAll: delegate(function () {
                        var files = [];
                        this.resultData.files.each(delegate(function (file) {
                            if (file.error === true)
                                return;

                            files.push({
                                path: file.path,
                                lastChange: '',
                                name: '',
                                mime: ''
                            });
                        }, this));

                        this.sendFile(files);
                    }, this),

                    backFiles: delegate(function () {
                        window.location.href = '/Default/WebDavBrowser';
                    }, this),

                    showAlert: delegate(function () {
                        var alert = Master.layout.message('Внимание!', 'Одновременно может быть отправлено не более 30ти файлов (обработано ' + this.resultData.files.length + ')', 'warning', [
                            {
                                text: 'Закрыть',
                                cls: 'btn-green',
                                call: delegate(function () {
                                    alert.remove();
                                    //close.apply(window, [Master]);
                                }, this)
                            }
                        ]);
                    }, this),
                }
            });

            this.subscribe = new can.compute(false);
            this.encrypt = new can.compute(false);
            /**
             * Шифрование личными стртификатами
             * @type {can.compute}
             */
            this.encryptPersonalCertificates = new can.compute(false);

            this.pin = new can.compute(null);
            this.savePin = new can.compute(null);
            this.needToPIN = new can.compute(null);
            /**
             * Массив сертификатов
             * @type {can.Map}
             */
            this.certificate = new can.Map({
                signature: new can.Map.List([]),
                encryption: new can.Map.List([]),
                personal: new can.Map.List([])
            });

            this.detailedSettings = new can.Map({
                signature: {
                    detached: this.template().Settings.signature.detached === true,
                    zipType: this.template().Settings.signature.zipType === 2,
                    encodingType: this.template().Settings.signature.encodingType
                },
                encryption: {
                    encodingType: this.template().Settings.encryption.encodingType
                }
            });

            this.makeCertificate();

            var alacrity = can.Map.extend({
                //notEncryptCertificate: false,
                subscribe: {
                    active: false,
                    certificate: false
                },
                encrypt: {
                    active: false,
                    certificate: false,
                    personal: {
                        active: false,
                        certificate: false

                    }
                },

                run: function () {
                    var subscribe = this.attr('subscribe'),
                        encrypt = this.attr('encrypt'),
                        personal = this.attr('encrypt.personal'),
                        enc_cert = self.checkEncriptCertActive(),
                        enc_p_cert = self.checkEncriptPersonalCertActive();

                    if (subscribe.active() == true && encrypt.active() == false) {
                        return subscribe.certificate === true;
                    }

                    if (subscribe.active() == false && encrypt.active() == true && personal.active() == false) {
                        return encrypt.certificate === true;
                    }

                    if (subscribe.active() == false && encrypt.active() == true && personal.active() == true) {
                        var _r = encrypt.certificate === true || personal.certificate === true;
                        self.errorSelectEncSert(_r);
                        return _r;
                    }

                    if (subscribe.active() == true && encrypt.active() == true && personal.active() == false) {
                        var _r = encrypt.certificate === true;

                        self.errorSelectEncSert(_r);
                        return subscribe.certificate === true && _r;
                    }

                    if (subscribe.active() == true && encrypt.active() == true && personal.active() == true) {
                        var _r = encrypt.certificate === true || personal.certificate === true;

                        self.errorSelectEncSert(_r);
                        return subscribe.certificate === true && _r;
                    }

                    if (enc_cert === true || enc_p_cert === true) {
                        self.errorSelectEncSert(_r);
                    }

                    if (enc_cert === false || enc_p_cert === false) {
                        self.errorSelectEncSert(_r);
                    }
                }
            });

            this.alacrity = new alacrity();
            this.alacrity.attr('subscribe.active', this.subscribe);
            this.alacrity.attr('subscribe.certificate', this.certificate.signature);
            this.alacrity.attr('encrypt.active', this.encrypt);
            this.alacrity.attr('encrypt.certificate', this.certificate.encryption);
            this.alacrity.attr('encrypt.personal.active', this.encryptPersonalCertificates);
            this.alacrity.attr('encrypt.personal.certificate', this.certificate.personal);

            this.alacrity.bind('change', delegate(function (ev, attr, how, newVal, oldVal) {
                if (attr !== 'encrypt.certificate')
                    return;

                this.errorSelectEncSert((attr === 'encrypt.certificate' && (newVal === true || newVal.length > 0)) ? true : false);
            }, this));

            //console.log(this.resultData)
            // пьян, исправить позже
            var view = can.view('/Assets/views/master/activity/sign_and_encrypt.hbs', {
                a: this.alacrity,
                sigid: this.sigAddID,
                errorSelectEncSert: this.errorSelectEncSert,
                event: {
                    refiles: delegate(this.main.reFiles, this.main, [true, 'Вы уверены, что хотите повторить операцию с начала? Все не сохраненные данные будут потеряны!']),
                    view_detail: this.view_detail,
                    change_detail: {
                        detail: delegate(function () {
                            this.view_detail(true);
                        }, this),
                        normal: delegate(function () {
                            this.view_detail(false);
                        }, this)
                    },

                    change_certificate: {
                        subscribe: delegate(function () {
                            new SelectCertificate('my', delegate(function (array) {
                                array.each(delegate(function (item) {

                                    clearList(this.certificate.signature).push({
                                        hash: item.Thumbprint,
                                        data: item,
                                        active: true
                                    });

                                    this.alacrity.attr('subscribe.certificate', true);

                                    // КОСТЫЛЬ
                                    this.encryptPersonalCertificates(false);
                                    this.encryptPersonalCertificates(true);
                                }, this));
                            }, this));

                        }, this),
                        encryption: delegate(function () {
                            new SelectCertificate('all', delegate(function (array) {
                                array.each(delegate(function (item) {
                                    this.certificate.encryption.push({
                                        hash: item.Thumbprint,
                                        data: item,
                                        active: true
                                    });
                                }, this));

                                this.alacrity.attr('encrypt.certificate', true);
                            }, this));
                        }, this),
                        personal: delegate(function () {
                            new SelectCertificate('list', delegate(function (array) {
                                array.each(delegate(function (item) {
                                    this.certificate.personal.push({
                                        hash: item.Thumbprint,
                                        data: item,
                                        active: true
                                    });

                                    this.alacrity.attr('encrypt.personal.certificate', true);

                                    // КОСТЫЛЬ
                                    this.encryptPersonalCertificates(false);
                                    this.encryptPersonalCertificates(true);
                                }, this));
                            }, this), {
                                cert: this.scope.pool.allMyCertificate
                            });
                        }, this)
                    },

                    change_subscribe: delegate(function (scope, el) {
                        this.subscribe(el.is(':checked'));
                    }, this),

                    change_encrypt: delegate(function (scope, el) {
                        this.encrypt(el.is(':checked'));
                    }, this),
                    change_encrypt_personal: delegate(function (scope, el) {
                        this.encryptPersonalCertificates(el.is(':checked'));
                    }, this),

                    action_run: delegate(function () {
                        if ((!this.certificate.signature.length || this.certificate.signature.length == 0) || this.subscribe() === false) {
                            this.run(false, '', false);
                            return;
                        }
                        new PinCode(this.certificate.signature[0].data.Thumbprint, delegate(function (need, pin, save) {
                            this.run(need, pin, save);
                        }, this),{

                        });
                    }, this),
                    cancel: delegate(this.main.reFiles, this.main, [true]),

                    /**
                     * Удаление сертификатов
                     */
                    delete: {
                        encryption: delegate(function (scope, el, ev) {
                            var s = null;
                            this.certificate.encryption.each(delegate(function (sert, index) {
                                if (sert.hash === scope.hash)
                                    s = index;
                            }, this));

                            if (s !== null) {
                                this.certificate.encryption.splice(s, 1);
                            }

                            if (this.certificate.encryption.length === 0) {
                                this.alacrity.attr('encrypt.certificate', false);
                            }

                        }, this),
                        personal: delegate(function (scope, el, ev) {
                            var s = null;
                            this.certificate.personal.each(delegate(function (sert, index) {
                                if (sert.hash === scope.hash)
                                    s = index;
                            }, this));

                            if (s !== null) {
                                this.certificate.personal.splice(s, 1);
                            }

                            if (this.certificate.personal.length === 0) {
                                this.alacrity.attr('encrypt.personal.certificate', false);

                                // КОСТЫЛЬ
                                this.encryptPersonalCertificates(false);
                                this.encryptPersonalCertificates(true);
                            }

                        }, this)
                    },

                    result: this.result,

                    action_change: delegate(function () {
                        closeConfirm('При смене состава сертификатов и их параметрах все изменения, сделанные на последующих этапах, будут потеряны. Продолжить?', delegate(function () {
                            this.result(false);
                            this.pin(null);

                            this.scope.layout.templateLock(false);
                            this.scope.result(false);
                        }, this));
                    }, this),
                    sert_download: delegate(function (scope) {
                        window.open(format('/default/GetCertificate?thumbPrint=%url', {
                            '%url': scope.hash
                        }));
                    }, this)
                },
                subscribe: this.subscribe,
                encrypt: this.encrypt,
                encryptPersonalCertificates: this.encryptPersonalCertificates,

                template: this.certificate,
                detailedSettings: this.detailedSettings,
                resultData: this.resultData,
                moreThanThirtyFiles: delegate(function (scope, el, ev) {
                    if (this.scope.pool.files.length > 30) {
                        return true;
                    } else {
                        return false;
                    }
                }, this)


            }, {
                ifCountCert: delegate(function (cert, options) {
                    /*setTimeout(delegate(function(){
                     console.log(this.certificate);
                     }, this), 1000);*/
                    if (this.scope.pool.allMyCertificate.length > 1 || cert.length === 0) {
                        return options.fn(this);
                    }
                }, this),

            });

            el.append(view); //this.certificate


            /**
             * Выбираем личный сертификат если он есть
             */
            /*if(this.scope.pool.allMyCertificate.length > 0) {

             var th = this.scope.pool.templates.current().Settings.raw.serialize()._SignatureSettings.SignerCertificate1;

             if(th !== null && th.length < 10) {
             var __my_cert =  this.scope.pool.allMyCertificate[0];

             clearList(this.certificate.signature).push({
             hash: __my_cert.Thumbprint,
             data: __my_cert,
             active: true
             });

             this.alacrity.attr('subscribe.certificate', true);
             }

             this.scope.pool.allMyCertificate.each(delegate(function(cert){
             if(cert.Thumbprint === th) {
             clearList(this.certificate.signature).push({
             hash: cert.Thumbprint,
             data: cert,
             active: true
             });
             }

             }, this));

             this.alacrity.attr('subscribe.certificate', true);
             }*/

            this.scope.pool.templates.current.bind('change', delegate(function () {
                setTimeout(delegate(this.makeCertificate, this), 4000);
            }, this));

            this.certificate.encryption.bind('change', delegate(function () {
                this.encrypt(this.certificate.encryption.length < 0 ? true : false);
                this.encrypt(this.certificate.encryption.length > 0 ? true : false);

                this.checkEncriptCertActive();
            }, this));

            this.certificate.personal.bind('change', delegate(function () {
                this.checkEncriptPersonalCertActive();

                // КОСТЫЛЬ
                this.encryptPersonalCertificates(false);
                this.encryptPersonalCertificates(true);
            }, this));

            can.bind.call(this.scope, 'close_window_send_file', delegate(function () {
                if (this.modalFileSend !== null) {
                    this.modalFileSend.remove();
                    this.modalFileSend = null;
                }
            }, this));

            /**
             * Отслеживаем событие регистрирования загрузчика
             * пользовательских сертификатов
             */
            can.bind.call(window, 'reg_upload_enc_ser', delegate(function () {
                setTimeout(delegate(this.addRecipientCertificate, this), 200);
            }, this));

            this.subscribe.bind('change', delegate(function () {
                this.checkAvailabilityCertificates();
            }, this));

            this.encrypt.bind('change', delegate(function () {
                this.checkAvailabilityCertificates();
            }, this));

            this.encryptPersonalCertificates.bind('change', delegate(function () {
                this.checkAvailabilityCertificatesPersonal();
            }, this));

            this.errorSelectEncSert.bind('change', delegate(function (ev, newVal, oldVal) {

            }, this));



            setTimeout(delegate(this.checkAvailabilityCertificates, this), 500);
        } catch (e) {
            alertError('Неожиданная ошибка произошла при подписании или шифровании. "%message"', e);
        } finally {
            this.subscribe((can.$.inArray(options.actionName, ['subscribe', 'subscribe_and_encrypt']) !== -1) ? true : false);
            this.encrypt((can.$.inArray(options.actionName, ['encrypt', 'subscribe_and_encrypt']) !== -1) ? true : false);


            can.trigger(this.scope, 'action_okay', [this.scope]);
        }
    },

    /**
     * Проверяет доступн ли зхотябы один сертификат для шифрования
     * @returns {boolean}
     */
    checkEncriptCertActive: function () {
        var certActive = false;
        this.certificate.encryption.each(delegate(function (cert) {
            if (cert.active)
                certActive = true;
        }, this));

        this.alacrity.attr('encrypt.certificate', certActive === true);

        return certActive === true;
    },

    checkEncriptPersonalCertActive: function () {
        var certActive = false;
        this.certificate.personal.each(delegate(function (cert) {
            if (cert.active)
                certActive = true;
        }, this));

        this.alacrity.attr('encrypt.personal.certificate', certActive === true);

        return certActive === true;
    },

    checkAvailabilityCertificates: function () {
        try {
            if (this.alacrity === undefined)
                return;

            this.alacrity.attr('encrypt.certificate', this.certificate.encryption.length > 0);
            this.alacrity.attr('encrypt.personal.certificate', this.certificate.personal.length > 0);

            this.alacrity.attr('subscribe.certificate', this.certificate.signature.length > 0);

            if (this.subscribe() === true && this.certificate.signature.length === 0 && this.scope.pool.allMyCertificate.length === 1) {
                var __my_cert = this.scope.pool.allMyCertificate[0];

                clearList(this.certificate.signature).push({
                    hash: __my_cert.Thumbprint,
                    data: __my_cert,
                    active: true
                });

                this.subscribe(false);
                this.subscribe(true);
            } else {
                // КОСТЫЛЬ
               $('#a1').trigger('click').trigger('click');
            }

            var regTipOptions = {
                tipJoint: "left",
                background: '#fff5d2',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#fee8ae'
            };

            $(".js-test-certificate-tip").each(function(i,el){
                new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
                Opentip.lastZIndex = 9000;
            });

        } catch (e) {
            alertError('Неожиданная ошибка произошла при подписании или шифровании. "%message"', e);
        }
    },

    checkAvailabilityCertificatesPersonal: function () {
        if (this.encryptPersonalCertificates() === true && this.scope.pool.allMyCertificate.length === 1 && this.certificate.personal.length === 0) {

            var __my_cert = this.scope.pool.allMyCertificate[0];

            this.certificate.personal.push({
                hash: __my_cert.Thumbprint,
                data: __my_cert,
                active: true
            });

            this.encryptPersonalCertificates(false);
            this.encryptPersonalCertificates(true);
        }
    },

    addRecipientCertificate: function () {
        try {
            this.uploader = new plupload.Uploader({
                runtimes: 'html5',
                browse_button: this.sigAddID,
                max_file_size: '20mb',
                url: '/Master/AddRecipientCertificate',
                filters: {
                    mime_types: [
                        { title: "Certificate", extensions: "cer" }
                    ]
                },
                init: {
                    FilesAdded: delegate(function (up, files) {

                        this.uploader.start();
                    }, this),

                    FileUploaded: delegate(function (up, file, info) {
                        var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                        if (res.status == 'ok') {


                            this.certificate.encryption.push({
                                hash: res.AddedCertificate.Thumbprint,
                                data: res.AddedCertificate,
                                active: true
                            });

                            this.alacrity.attr('encrypt.certificate', true);
                        }
                    }, this),

                    UploadProgress: delegate(function (up, file) {

                    }, this),

                    StateChanged: delegate(function (up) {
                        if (up.state == plupload.STARTED) {

                        } else {

                        }
                    }, this)
                }
            });

            this.uploader.init();
        } catch (e) {
            alertError('Неожиданная ошибка произошла при подписании или шифровании. "%message"', e);
        }
    },

    makeCertificate: function () {
        try {
            clearList(this.certificate.encryption);
            clearList(this.certificate.signature);
            clearList(this.certificate.personal);

            this.certificate.attr('encryption', []);
            this.certificate.attr('signature', []);
            this.certificate.attr('personal', []);

            var t = this.scope.pool.templates.current();

            new Logger(['Перестройка шаблонов - (Шифрования - %a : Подписи - %b)', {
                '%a': t.Certificate.encryption.length,
                '%b': t.Certificate.signature.length
            }]);

            t.Certificate.encryption.each(delegate(function (ser) {
                ser.attr('active', false);
                this.certificate.encryption.push(ser);
            }, this));

            t.Certificate.signature.each(delegate(function (ser) {
                this.certificate.signature.push(ser);
            }, this));

            this.detailedSettings.signature.attr('encodingType', t.Settings.signature.encodingType);
            this.detailedSettings.encryption.attr('encodingType', t.Settings.encryption.encodingType);
            this.detailedSettings.signature.attr('detached', t.Settings.signature.detached);

            if (t.Certificate.personal.length > 0) {

                t.Certificate.personal.each(delegate(function (item) {
                    this.certificate.personal.push({
                        hash: item.Thumbprint,
                        data: item,
                        active: false
                    });
                }, this));

                this.encryptPersonalCertificates(false);
                this.encryptPersonalCertificates(true);
            } else {
                this.encryptPersonalCertificates(true);
                this.encryptPersonalCertificates(false);
            }

            this.checkAvailabilityCertificates();


            // КОСТЫЛЬ
            this.encrypt(!this.encrypt());
            this.encrypt(!this.encrypt());


        } catch (e) {
            alertError('Неожиданная ошибка произошла при подписании или шифровании. "%message"', e);
        }
    },

    /**
     * Подготовка настроек.
     * @returns {*}
     */
    prepareSettings: function (pin) {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        settings._SignatureSettings.Detached = !this.detailedSettings.signature.detached;
        settings._SignatureSettings.ZipType = this.detailedSettings.signature.zipType === true ? 1 : 0;
        settings._SignatureSettings._EncodingType = this.detailedSettings.signature.encodingType;

        settings._EncryptionSettings._EncodingType = this.detailedSettings.encryption.encodingType;

        settings._SignatureSettings.KeysetPassword = pin;

        settings._EncryptionSettings.RecipientCertificates1 = [];

        if (this.certificate.signature.length === 1)
            settings._SignatureSettings.SignerCertificate1 = this.certificate.signature[0].hash

        this.certificate.encryption.each(delegate(function (item) {
            if (item.active)
                settings._EncryptionSettings.RecipientCertificates1 = push(settings._EncryptionSettings.RecipientCertificates1, item.hash);
        }, this));

        this.certificate.personal.each(delegate(function (item) {
            if (item.active)
                settings._EncryptionSettings.RecipientCertificates1 = push(settings._EncryptionSettings.RecipientCertificates1, item.hash);
        }, this));

        new Logger('Подготовленные настройки', 'log', settings);

        return JSON.stringify(settings);
    },

    run: function (need, pin, save) {
        /**
         * Проверка на пин
         */
        this.operationCode((this.subscribe() === true && this.encrypt() === true) ? 5 : ((this.subscribe() === true) ? 1 : 2));

        var ajaxObj, processID = this.scope.iprocess.add((this.operationCode() === 1) ? 'Выполняется подпись файлов...' : ((this.operationCode() === 2) ? 'Выполняется шифрование файлов' : 'Выполняется подпись и шифрование файлов...'), delegate(function () {
            ajaxObj.abort();
        }, this));
        ajaxObj = this.scope.req.begin('make_operation', {
            settingsJSON: this.prepareSettings(pin),
            signedFileInfosJSON: this.scope.getFilesString(),
            type: this.operationCode(),
            savePIN: save,
            needToPIN: need
        }, delegate(function (data) {
            this.result(true);
            can.trigger(window, 'process_exit', [processID]);


            var result = data.data.OperationResult,
                filesResult = result.OperationResults,
                globError = false;

            if (result.Exception !== null && $.inArray(result.Exception.Code, [-2146434965, -2147467259]) !== -1) {
                new Logger('PIN ERROR!!!', 'error');
                this.result(false);
                new PinCode(this.certificate.signature[0].data.Thumbprint, delegate(function (need, pin, save) {
                    this.run(need, pin, save);
                }, this), {
                    pinError: true,
                   wrongSavedPin : pin==null
                });

                return;
            }

            // gost
            var restrictedMessage = '';
            var isRestrictedFiles = false;
            filesResult.forEach(delegate(function(el){
                var opResult = !!el.FirsOperationResult ? el.FirsOperationResult : el;
                if (opResult.Exception && opResult.Exception.Code ) {
                    if (opResult.Exception.Code == -2001 ) {
                        restrictedMessage = opResult.Exception.Message;
                    } else {
                        restrictedMessage = 'При проведении операции произошла ошибка, повторите операцию позже!';
                    }
                    isRestrictedFiles = true;
                }
            }, this));

            if (isRestrictedFiles) {
                infoMessage(restrictedMessage, delegate(function () {
                    // вдруг пригодится :)
                }, this));
                this.main.reFiles();

                scroll(100);
                return false;
            }


            if (result.Exception !== null) {
                this.resultData.attr('error', true);
                this.resultData.attr('errorMessage', result.Exception.Message);

                scroll(100);
                return false;
            }

            var arrStatus = {
                1: 'Успешно подписан',
                2: 'Успешно зашифрован',
                5: 'Успешно подписан и зашифрован'
            };

            clearList(this.resultData.files);

            var settings = this.scope.pool.templates.current().Settings.raw.serialize();
            this.isTest = false;

            if (this.certificate.signature.length === 1 && this.certificate.signature[0].data.IsTest )
                this.isTest = true ;

            this.certificate.encryption.each(delegate(function (item) {
                if (item.active && item.data.IsTest) {
                    this.isTest = true
                }
            }, this));

            this.certificate.personal.each(delegate(function (item) {
                if (item.active && item.data.IsTest) {
                    this.isTest = true
                }
            }, this));

            can.each(filesResult, delegate(function (file, index) {
                var isError = false,
                    code = this.operationCode(),
                    pathName, OperatedFile, errorMessage = '';

                if (code === 1) { // Подпись
                    OperatedFile = pathName = file.SignedFile;
                } else if (code === 2) { // Шифрование
                    OperatedFile = pathName = file.EncryptedFile;
                } else if (code === 5) { // Подпись и шифрование
                    OperatedFile = pathName = file.SecondOperationResult.EncryptedFile;
                }

                if (isError)
                    globError = true;

                this.resultData.files.push({
                    id: guid(),
                    error: isError,
                    errorMessage: errorMessage,
                    name: aligningText(pathName, 47),
                    pathName: pathName,
                    status: isError ? 'Произошла ошибка' : arrStatus[this.operationCode()],
                    path: OperatedFile,
                    icon: (this.operationCode() === 1) ? 'sig' : ((this.operationCode() === 2) ? 'enc' : 'sig_enc'),
                    isMoreShow: false,
                    isTest: this.isTest,
                    event: {
                        download: delegate(function (scope, el) {
                            window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.path));
                        }, this),

                        remove: delegate(function (scope, el) {
                            closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                                this.scope.req.begin('file_delete', {
                                    deletingFileUri: scope.path
                                }, function (data) {
                                    // Какой то ответ
                                }, this);

                                // Удаляем
                                // .. и немножко удерживаем для красоты.
                                setTimeout(delegate(function () {
                                    if (this.resultData.files.length === 1) {
                                        clearList(this.resultData.files);

                                        this.result(false);
                                        return;
                                    }

                                    var _index = listObjSearch(this.resultData.files, 'id', scope.id);
                                    if (_index === null) {
                                        return;
                                    }

                                    this.resultData.files.splice(_index, 1);
                                    if (this.resultData.files.length > 30) {
                                        $('div.result div.file-edit-control div.btn.result.show-alert').show();
                                        $('div.result div.file-edit-control div.btn.result.send-all').hide();
                                    } else {
                                        $('div.result div.file-edit-control div.btn.result.show-alert').hide();
                                        $('div.result div.file-edit-control div.btn.result.send-all').show();
                                    }
                                }, this), 500);

                            }, this));
                        }, this),

                        more: delegate(function (scope, el) {
                            if (scope.isMoreShow) {
                                el.html('Подробнее');
                                scope.attr('isMoreShow', false);
                            } else {
                                el.html('Скрыть');
                                scope.attr('isMoreShow', true);
                            }
                        }, this),

                        send: delegate(function (scope, el) {
                            this.sendFile([
                                {
                                    path: scope.path,
                                    lastChange: '',
                                    name: '',
                                    mime: ''
                                }
                            ]);
                        }, this)
                    }
                });
            }, this));

            if (globError) {
                this.resultData.attr('error', true);
            }

            if (this.resultData.files.length === 0) {
                this.resultData.attr('error', true);
                this.resultData.attr('errorMessage', 'Ошибка операции');
            }

            this.scope.layout.templateLock(true);
            this.scope.result(true);

            var regTipOptions = {
                tipJoint: "left",
                background: '#fff5d2',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#fee8ae'
            };

            $(".js-test-file-tip").each(function(i,el){
                new Opentip($(el), 'Данный файл был подвергнут криптооперации с использованием тестового сертификата. Такие сертификаты выпускаются без участия аккредитованного Удостоверяющего Центра и не имеют юридической силы.', '', regTipOptions);
                Opentip.lastZIndex = 9000;
            });

            scroll(100);
        }, this));
    },

    sendFile: function (arr) {
        this.modalFileSend = this.scope.layout.modal('Отправка файлов', {
            type: 'path',
            path: 'send_file_to_mail.hbs',
            params: {
                files: encodeURIComponent(JSON.stringify(arr))
            }
        });

        can.bind.call(window, 'change_title', delegate(function (ev, key, title) {
            if (key !== 'sendfiles')
                return;

            setTimeout(delegate(function () {
                this.modalFileSend.setTitle(title);
            }, this), 500);
        }, this));
    }
});
/**
 * Created by Александр on 07.04.14.
 */
var CheckSignature = can.Control({
    init: function (el, options) {
        this.scope = options.scope;
        this.main = options.main;

        try {
            new CheckAttachmentFiles(this.scope, delegate(function (status) {
                if (status) {
                    this.view();
                } else {
                    this.main.action(null);
                    this.main.result(false);
                }
            }, this));

            var __result = can.Map.extend({
                length: function () {
                    return countMap(this.files);
                }
            });

            this.result = new __result({
                files: {}
            });
        } catch (e) {
            Master.layout.message('Произошла ошибка',
                format("Неожиданная ошибка произошла при проверке подписи. <br /> Ошибка: %message", {
                    '%message': e.name
                }),
                'error', [
                    {
                        text: 'Да',
                        cls: 'btn-green',
                        call: delegate(function () {
                            alert.remove();
                        }, this)
                    }
                ]);
        }
    },

    prepareSettings: function () {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        return JSON.stringify(settings);
    },

    view: function () {
        this.main.result(true);
        this.main.action(this);

        var processID = this.scope.iprocess.add('Выполняется проверка подписи...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 4
            }, delegate(function (data) {
                var globError = false;

                var rd = data.data.OperationResult;
                can.each(rd.OperationResults, delegate(function (file, item) {
                    var id = guid(),
                        sertInfo = [];

                    this.isTest = false
                    if (file.Exception == null) {
                        can.each(file.CertificateStatuses, delegate(function (status) {
                            var certificate = status.CertificateInfo;
                            if (certificate.IsTest) {
                                this.isTest = true;
                            }

                            sertInfo.push({
                                type: !file.Detached ? 'Присоединенная' : 'Отсоединенная',
                                thumbprint: certificate.Thumbprint,
                                recipient: certificate.SubjectName,
                                issureName: certificate.IssureName,
                                notBefore: moment(parseInt(certificate.NotBefore.match('[0-9]+')[0])).calendar(),
                                notAfter: moment(parseInt(certificate.NotAfter.match('[0-9]+')[0])).calendar(),
                                certError: moment(parseInt(certificate.NotAfter.match('[0-9]+')[0])).unix() - moment(new Date()).unix() < 0
                            });
                        }, this));
                    }

                    if (file.Exception !== null)
                        globError = true;

                    var acceptExt = ['ods','xls','xlsb','xlsx','ods','xlsb','xlsm','xlsx','odp','pot','potm','potx',
                        'pps','ppsm','ppsx','ppt','pptm','pptx','odp','ppsx','pptx','doc','docm','docx','dot',
                        'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp','xml'],
                        hideView = true;
                    var name =  file.DataFile.split('/');
                    var ext = '';

                    name = name[name.length-1];
                    if (name !== null) {
                        ext = name.split('.');
                        ext = ext[ext.length-1];
                        if (acceptExt.indexOf(ext.toLowerCase()) !== -1) {
                            hideView = false;
                        }
                    }


                    // Временный костыль получения корректного пути файла в результате
                    var fileName = file.SignedFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/' +  ('' + file.DataFile).replace(/^.*[\\\/]/, '');

                    this.result.files.attr(id, {
                        id: id,
                        fileName: fileName,
                        sigName: file.SignedFile,
                        detached: file.Detached,
                        error: file.Exception !== null,
                        errorMessage: file.Exception !== null ? file.Exception.Message : '',
                        hideView: hideView,
                        info: sertInfo,
                        isTest: this.isTest,

                        event: {

                            view_file: delegate(function (scope) {
                                var filename = scope.fileName+'.sig';
                                filename = scope.sigName.substring(0, scope.sigName.length - filename.length)+scope.fileName;
                                $.ajax({
                                    url: '/helper/GetVisualizationInfo',async: false,type: "GET",data: {filename: filename},
                                    success: function (result) {
                                        if (!result.Error) {
                                            var name = scope.fileName.split('/'),
                                                len=40;
                                            name = name[name.length-1];
                                            if (name.length > len) {
                                                name = '...'+name.substring(name.length-len, name.length);
                                            }
                                            if (result.VisualizationUrl) {
                                                $.fancybox({href : result.VisualizationUrl,type: 'iframe'},{
                                                        helpers: {title: {position: 'top'}},
                                                        maxWidth	: 700,
                                                        height      : 1000,
                                                        minWidth	: 200,
                                                        autoSize	: true,
                                                        autoResize	: true,
                                                        scrolling: 'no',
                                                        topRatio: 0,
                                                        margin: [20, 20, 90, 20],
                                                        closeClick	: false,
                                                        openEffect	: 'fade',
                                                        wrapCSS     : 'visualiseModal',
                                                        title       : name,
                                                        afterClose: function() {
                                                            window.visualState = false;
                                                        }
                                                    }
                                                );
                                            } else {
                                                $.fancybox("<img align='center' width='100%' style='margin: 0 auto;display: block;' src='data:image/jpg;base64,"+result.Base64Picture+"'>",{
                                                        helpers: {title: {position: 'top'}},
                                                        aspectRatio : true,
                                                        fitToView	: true,
                                                        autoSize	: true,
                                                        autoResize	: true,
                                                        scrolling: 'no',
                                                        topRatio: 0,
                                                        margin: [20, 20, 90, 20],
                                                        closeClick	: false,
                                                        openEffect	: 'fade',
                                                        wrapCSS     : 'visualiseModal',
                                                        title       : name,
                                                        afterClose: function() {
                                                            window.visualState = false;
                                                        }
                                                    }
                                                );
                                            }
                                        } else {

                                            $.fancybox('<div class="modal-window" id="no-visualize"><div class="title">Внимание!</div><form action="" autocomplete="off" method="post"><div class="row"><div class="mess-box"><div class="info" id="infoPlacer"><span>Файл данного типа не может быть просмотрен в браузере! Вы можете скачать файл и посмотреть его на устройстве. </span></div></div></div><div class="row sbmt pull-right"><input class="btn btn-green" type="button" value="Закрыть" onclick="$.fancybox.close();" /></div></form></div>',
                                                {wrapCSS : 'no-visualiseModal',
                                                afterClose: function() {
                                                    window.visualState = false;
                                                }
                                            });
                                        }

                                    },
                                    error: function (request, error, result) {}
                                });
                                return false
                            }, this),
                            download_file: delegate(function (scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
                            }, this),
                            download_data_file: delegate(function (scope) {
                                var filename = scope.fileName+'.sig';
                                filename = scope.sigName.substring(0, scope.sigName.length - filename.length)+scope.fileName;
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(filename));
                            }, this),
                            delete_data_file: delegate(function (scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function (data) {
                                        // Какой то ответ
                                    }, this);

                                    scope.attr('fileName', '');
                                }, this));
                            }, this),
                            remove: delegate(function (scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function (data) {
                                        // Какой то ответ
                                    }, this);

                                    // Удаляем
                                    // .. и немножко удерживаем для красоты.
                                    setTimeout(delegate(function () {
                                        if (this.result.length() === 1) {
                                            this.scope.layout.main.clearAction();
                                            return;
                                        }

                                        this.result.files.removeAttr(scope.id);
                                    }, this), 500);
                                }, this));

                            }, this),
                            download_sig: delegate(function (scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
                            }, this),
                            more: delegate(function (scope, el) {
                                if (scope.isMoreShow) {
                                    el.html('Подробнее');
                                    scope.attr('isMoreShow', false);
                                } else {
                                    el.html('Скрыть');
                                    scope.attr('isMoreShow', true);
                                }
                            }, this)
                        }
                    });
                }, this));

                var view = can.view('/Assets/views/master/activity/check_signature.hbs', {
                    scope: this.scope,
                    result: this.result,
                    error: globError === true,
                    event: {
                        backFiles: delegate(function () {
                            window.location.href = '/Default/WebDavBrowser';
                        }, this),
                        refiles: delegate(this.main.reFiles, this.main, [true])
                    }
                });

                can.trigger(window, 'process_exit', [processID]);

                this.element.append(view);

                var regTipOptions = {
                    tipJoint: "left",
                    background: '#fff5d2',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#fee8ae'
                };

                $(".js-test-file-tip").each(function(i,el){
                    new Opentip($(el), 'Данный файл был подвергнут криптооперации с использованием тестового сертификата. Такие сертификаты выпускаются без участия аккредитованного Удостоверяющего Центра и не имеют юридической силы.', '', regTipOptions);
                    Opentip.lastZIndex = 9000;
                });

                this.scope.result(true);

                scroll(100);
            }, this));
        } catch (e) {
            Master.layout.message('Произошла ошибка',
                format('Неожиданная ошибка произошла при проверке подписи. "%message"', {
                    '%message': e.name
                }),
                'error', [
                    {
                        text: 'Да',
                        cls: 'btn-green',
                        call: delegate(function () {
                            alert.remove();
                        }, this)
                    }
                ]);
        }

    }
});
/**
 * Created by Александр on 15.04.14.
 */
var Decipher = can.Control({
    init: function (el, options) {
        this.scope = options.scope;
        this.main = options.main;

        this.certificate = '';
        this.pin = '';
        this.savePin = false;
        this.needToPIN = false;
        this.scScope = null;

        try {
            this.certificate_selection = new CertificateSelection(this.element, {
                scope: this.scope,
                nextCall: delegate(function (sert, pin, savePin, needToPIN, scope) {
                    this.certificate = sert().Thumbprint;
                    this.pin = pin();
                    this.savePin = savePin();
                    this.needToPIN = needToPIN();

                    this.scScope = scope;

                    this.runResult(sert());
                }, this),
                params: {
                    title: 'Расшифровать'
                }
            });
        } catch (e) {
            alertError('Неожиданная ошибка произошла при расшифровке. "%message"', e);
        }
    },

    runResult: function (sert) {
        var files = new can.Map.List([]);

        var processID = this.scope.iprocess.add('Выполняется расшифровка файлов...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 3,
                savePin: this.savePin,
                needToPIN: this.needToPIN
            }, delegate(function (data) {
                var globError = false,
                    pinError = false,
                    result = data.data.OperationResult;

                if (result.Exception !== null) {
                    globError = true;

                    if ($.inArray(parseInt(result.Exception.Code), [-2146434965, -2147467259]) !== -1) {
                        pinError = true;

                        this.scScope.actionRun(true);

                        can.trigger(window, 'process_exit', [processID]);
                    }
                }

                can.each(result.OperationResults, delegate(function (file, index) {
                    if (pinError)
                        return;


                    files.push({
                        OperatedFile: file.EncryptedFile,
                        SourceFile: file.DecryptedFile,
                        error: file.Exception !== null,
                        errorMessage: (file.Exception !== null) ? file.Exception.Message : ''
                    });
                }, this));

                if (pinError)
                    return;

                can.trigger(window, 'process_exit', [processID]);

                this.viewResult(files, globError);
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выводе результата расшифровки. "%message"', e);
        }
    },

    prepareSettings: function () {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        settings._DecryptionSettings.DecryptCertificate = this.certificate;
        settings._DecryptionSettings.KeysetPassword = this.pin;

        return JSON.stringify(settings);
    },

    viewResult: function (files, error) {
        try {
            this.result = new OperationResult(this.scope, {
                files: files,
                sourceType: 'Исходный файл:',
                error: error,
                icon: 'enc',
                showLink: false
            });
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выводе результата расшифровки. "%message"', e);
        }
    }
});
/**
 * Created by Александр on 08.04.14.
 */
var DecipherAndCheckSignature = can.Control({
    init: function (el, options) {
        this.scope = options.scope;
        this.main = options.main;

        this.certificate = '';
        this.pin = '';
        this.savePin = false;
        this.needToPIN = false;
        this.scScope = null;
        try {
            this.certificate_selection = new CertificateSelection(this.element, {
                scope: this.scope,
                nextCall: delegate(function (sert, pin, savePin, needToPIN, scope) {
                    this.certificate = sert().Thumbprint;
                    this.pin = pin();
                    this.savePin = savePin();
                    this.needToPIN = needToPIN();
                    this.scScope = scope;
                    this.runResult(sert());
                }, this),
                params: {
                    title: 'Расшифровать и проверить подпись'
                }
            });
        } catch (e) {
            alertError('Неожиданная ошибка произошла при расшифровке и проверки подписи. "%message"', e);
        }
    },

    runResult: function (sert) {
        var files = new can.Map.List([]);

        var processID = this.scope.iprocess.add('Выполняется расшифровка и проверка подписи у файлов...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 6,
                savePin: this.savePin,
                needToPIN: this.needToPIN
            }, delegate(function (data) {
                var globError = false;
                var pinError = false,
                    result = data.data.OperationResult,
                    filesResult = result.OperationResults;

                if (result.Exception !== null && $.inArray(parseInt(result.Exception.Code), [-2146434965, -2147467259]) !== -1) {
                    pinError = true;

                    this.scScope.actionRun(true);

                    can.trigger(window, 'process_exit', [processID]);
                    return false;
                }

                if ($.inArray(result))

                    if (pinError) return;

                can.each(filesResult, delegate(function (file, index) {
                    if (file.Exception !== null)
                        globError = true;

                    var sertInfo = [];

                    if (file.SecondOperationResult !== null && file.SecondOperationResult.Exception == null) {
                        can.each(file.SecondOperationResult.CertificateStatuses, delegate(function (status) {
                            var certificate = status.CertificateInfo;

                            sertInfo.push({
                                type: !file.Detached ? 'Присоединенная' : 'Отсоединенная',
                                thumbprint: certificate.Thumbprint,
                                recipient: certificate.SubjectName,
                                issureName: certificate.IssureName,
                                notBefore: moment(parseInt(certificate.NotBefore.match('[0-9]+')[0])).calendar(),
                                notAfter: moment(parseInt(certificate.NotAfter.match('[0-9]+')[0])).calendar(),
                                certError: moment(parseInt(certificate.NotAfter.match('[0-9]+')[0])).unix() - moment(new Date()).unix() < 0
                            });
                        }, this));
                    }
                    files.push({
                        OperatedFile: file.SecondOperationResult.DataFile,
                        SourceFile: file.FirsOperationResult.DecryptedFile,
                        EncryptedFile: file.FirsOperationResult.EncryptedFile,
                        error: (file.FirsOperationResult.Exception !== null || file.SecondOperationResult.Exception !== null),
                        errorMessage: file.SecondOperationResult.Exception !== null ? file.SecondOperationResult.Exception.Message : null,
                        sertInfo: sertInfo
                    });
                }, this));

                //this.scope.loader(false);

                can.trigger(window, 'process_exit', [processID]);

                this.viewResult(files, globError);
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при расшифровке и проверки подписи. "%message"', e);
        }
    },

    viewResult: function (files, error) {
        this.result = new OperationResult(this.scope, {
            type: 'enc_sig',
            files: files,
            sourceType: 'Подписанный и зашифрованный файл:',
            error: error,
            icon: false,
            showLink: true,
            errorMessage: 'При проверке подписи произошла ошибка'
        });
    },

    prepareSettings: function () {
        var settings;

        try {
            settings = this.scope.pool.templates.current().Settings.raw.serialize();

            settings._DecryptionSettings.DecryptCertificate = this.certificate;
            settings._DecryptionSettings.KeysetPassword = this.pin;
        } catch (e) {
            alertError('Неожиданная ошибка произошла при расшифровке и проверки подписи. "%message"', e);
        } finally {
            return JSON.stringify(settings);
        }
    }
});
//
// Парень берегись!
//
// Когда ты закончишь «оптимизировать» этот мастер
// и поймешь, насколько большой ошибкой было делать это,
// пожалуйста, увеличь счетчик внизу как предупреждение
// для следующего парня:
//
total_hours_wasted_here = 1;
/**
 * Глобальная инициализация мастера
 */
var InitMaster = Core.extend({
    name: 'Мастер по работе с документами',

    init: function (settings) {
        Master.debug = this.debug = settings.debug;

        /**
         * Инициализировано ли приложение.
         * @type {boolean}
         */
        this.isLoaded = false;

        new Logger(['Начало работы "%m"', {'%m': this.name}]);

        this.core = new CoreGlob(this);
        this.core.loadSettings(settings);

        this.Version = {
            number: '1.2.14',
            date: '24.07.14 12:11'
        };
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdsb2JhbC5qcyIsIlJlZ2lzdGVySGVscGVyLmpzIiwiQ2hlY2tBdHRhY2htZW50RmlsZXMuanMiLCJDZXJ0aWZpY2F0ZVNlbGVjdGlvbi5qcyIsIlNlbGVjdENlcnRpZmljYXRlLmpzIiwiT3BlcmF0aW9uUmVzdWx0LmpzIiwiT3BlblVwbG9hZEZpbGVEaWFsb2cuanMiLCJQaW5Db2RlLmpzIiwiVXBsb2FkVmVyaWZ5RmlsZXMuanMiLCJMb2dnZXIuanMiLCJDb3JlLmpzIiwiQ29yZUdsb2IuanMiLCJSZXF1ZXN0LmpzIiwiTGF5b3V0LmpzIiwiSW5mb3JtYXRpb25Qcm9jZXNzLmpzIiwiVGVtcGxhdGUuanMiLCJUZW1wbGF0ZXMuanMiLCJGaWxlLmpzIiwiQWN0aW9ucy5qcyIsIk1haW4uanMiLCJTaWduQW5kRW5jcnlwdC5qcyIsIkNoZWNrU2lnbmF0dXJlLmpzIiwiRGVjaXBoZXIuanMiLCJEZWNpcGhlckFuZENoZWNrU2lnbmF0dXJlLmpzIiwiSW5pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6NkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ3JlYXRlZCBieSDQkNC70LXQutGB0LDQvdC00YAgb24gMjUuMDMuMTQuXHJcbiAqL1xyXG5cclxudmFyIGRlbGVnYXRlID0gZnVuY3Rpb24gKGZuLCBzY29wZSwgYXJncykge1xyXG4gICAgaWYgKCFjYW4uaXNGdW5jdGlvbihmbikpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHNjb3BlIHx8IHRoaXMsIGFyZ3MgfHwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn07XHJcblxyXG52YXIgY291bnRNYXAgPSBmdW5jdGlvbiAobWFwKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICBtYXAuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gaTtcclxufTtcclxuXHJcbnZhciB0aW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG59O1xyXG5cclxudmFyIGNsZWFyTGlzdCA9IGZ1bmN0aW9uIChsaXN0KSB7XHJcbiAgICBsaXN0LnNwbGljZSgwLCBsaXN0Lmxlbmd0aCk7XHJcblxyXG4gICAgcmV0dXJuIGxpc3Q7XHJcbn07XHJcblxyXG4vKipcclxuICog0J/QvtC40YHQuiDQvtCx0YrQtdC60YLQsCDQsiDQvNCw0YHRgdC40LLQtVxyXG4gKiBAcGFyYW0gbGlzdCDQnNCw0YHRgdC40LJcclxuICogQHBhcmFtIGtleVxyXG4gKiBAcGFyYW0gdmFsdWVcclxuICogQHJldHVybnMgeyp9INCY0L3QtNC10LrRgSDQvdCw0LnQtNC10L3QvdC+0LPQviDQvtCx0YrQtdC60YLQsCDQsiDQvNCw0YHRgdC40LLQtVxyXG4gKi9cclxudmFyIGxpc3RPYmpTZWFyY2ggPSBmdW5jdGlvbiAobGlzdCwga2V5LCB2YWx1ZSkge1xyXG4gICAgdmFyIF9pbmRleCA9IG51bGwsXHJcbiAgICAgICAgciA9IGZ1bmN0aW9uIChrZXksIG9iaikge1xyXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBrID0ga2V5WzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9ialtrXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5LnNwbGljZSgwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcihrZXksIG9ialtrXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9ialtrZXlbMF1dID09PSB1bmRlZmluZWQpID8gdW5kZWZpbmVkIDogb2JqW2tleVswXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgIGNhbi5lYWNoKGxpc3QsIGRlbGVnYXRlKGZ1bmN0aW9uIChvYmosIGluZGV4KSB7XHJcbiAgICAgICAgaWYgKHIoa2V5LnNwbGl0KCcuJyksIGxpc3RbaW5kZXhdKSA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAgIF9pbmRleCA9IGluZGV4O1xyXG4gICAgfSwgdGhpcykpO1xyXG5cclxuICAgIHJldHVybiBfaW5kZXg7XHJcbn07XHJcblxyXG4vKipcclxuICog0JrQvtC/0LjRgNC+0LLQsNGC0Ywg0LzQsNGB0YHQuNCyXHJcbiAqIEBwYXJhbSB3aGVuY2Ug0J7RgtC60YPQtNCwXHJcbiAqIEBwYXJhbSB3aGVyZSDQmtGD0LTQsFxyXG4gKiBAcGFyYW0gY2FsbCDQktGL0LfQvtCyINGE0YPQvdC60YbQuNC4INC/0LXRgNC10LQg0LTQvtCx0LDQstC70LXQvdC40LXQvCDQvdC+0LLQvtCz0L4g0Y3Qu9C10LzQtdC90YLQsFxyXG4gKiBAcmV0dXJucyB7Kn1cclxuICovXHJcbnZhciBsaXN0Q29weSA9IGZ1bmN0aW9uICh3aGVuY2UsIHdoZXJlLCBjYWxsKSB7XHJcbiAgICBjYWxsID0gY2FsbCB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICB9O1xyXG4gICAgY2FuLmVhY2god2hlbmNlLCBkZWxlZ2F0ZShmdW5jdGlvbiAob2JqLCBpbmRleCkge1xyXG4gICAgICAgIGNhbGwuYXBwbHkodGhpcywgW29iaiwgaW5kZXhdKTtcclxuXHJcbiAgICAgICAgd2hlcmUucHVzaCh3aGVuY2VbaW5kZXhdKTtcclxuICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICByZXR1cm4gd2hlcmU7XHJcbn07XHJcblxyXG52YXIgYWRkS2V5SW5PYmplY3QgPSBmdW5jdGlvbiAob2JqLCBjYWxsKSB7XHJcbiAgICBjYW4uZWFjaChvYmosIGRlbGVnYXRlKGZ1bmN0aW9uIChvYmosIGluZGV4KSB7XHJcbiAgICAgICAgY2FsbC5hcHBseSh0aGlzLCBbb2JqLCBpbmRleF0pO1xyXG4gICAgfSwgdGhpcykpO1xyXG5cclxuICAgIHJldHVybiBvYmo7XHJcbn07XHJcblxyXG52YXIgcmFuZG9tID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTQpLnN1YnN0cmluZyg3KTtcclxufTtcclxuXHJcbnZhciBmb3JtYXQgPSBmdW5jdGlvbiAoc3RyLCBhcmdzKSB7XHJcbiAgICBhcmdzID0gYXJncyB8fCB7fTtcclxuICAgIHZhciBtZXNzYWdlID0gc3RyIHx8ICcnO1xyXG5cclxuICAgIGNhbi5lYWNoKGFyZ3MsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgdmFsdWUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG1lc3NhZ2U7XHJcbn07XHJcblxyXG52YXIgZ3VpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIHM0KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxyXG4gICAgICAgICAgICAudG9TdHJpbmcoMTYpXHJcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xyXG4gICAgICAgIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XHJcbn07XHJcblxyXG4vKipcclxuICog0J7Rh9C40YHRgtC60LAg0LrQsNGA0YLRiyAo0L7QsdGK0LXQutGC0LApXHJcbiAqIEBwYXJhbSBtYXAg0JrQsNGA0YLQsCDQuNC70Lgg0L7QsdGK0LXQutGCXHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxudmFyIGNsZWFyTWFwID0gZnVuY3Rpb24gKG1hcCkge1xyXG4gICAgbWFwLmVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICBtYXAucmVtb3ZlQXR0cihrZXkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG1hcDtcclxufTtcclxuXHJcbnZhciBzY3JvbGwgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgdmFyIGJvZHkgPSAkKCdib2R5JyksXHJcbiAgICAgICAgbmV3SGVpZ2h0ID0gKGJvZHkuaGVpZ2h0KCkgKiBwKSAvIDEwMDtcclxuXHJcbiAgICBib2R5LmFuaW1hdGUoe1xyXG4gICAgICAgIHNjcm9sbFRvcDogbmV3SGVpZ2h0XHJcbiAgICB9LCAnc2xvdycpO1xyXG59O1xyXG5cclxudmFyIG1kNSA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgIHJldHVybiBmb3JtYXQoJ21kNSglc3RyKSA9KScsIHsnJXN0cic6IHN0cn0pO1xyXG59O1xyXG5cclxudmFyIGV4aXN0ID0gZnVuY3Rpb24gKGtleSwgdmFsKSB7XHJcbiAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHJldHVybiBrZXkgPT09IHZhbDtcclxufTtcclxuXHJcbnZhciBwdXNoID0gZnVuY3Rpb24gKG9iaiwgaXRlbSkge1xyXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBBcnJheV0nKVxyXG4gICAgICAgIG9iaiA9IFtdO1xyXG5cclxuICAgIG9iai5wdXNoKGl0ZW0pO1xyXG5cclxuICAgIHJldHVybiBvYmo7XHJcbn07XHJcblxyXG52YXIgYWxlcnRFcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlLCBlcnJvcikge1xyXG4gICAgaWYgKE1hc3RlclsnbGF5b3V0J10gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGFsZXJ0KGZvcm1hdChtZXNzYWdlICsgJzxiciAvPjxkaXYgc3R5bGU9XCJmb250LXNpemU6IDEwcHg7Y29sb3I6IHJlZDttYXJnaW46IDEwcHggMCAxMHB4IDA7XCI+JXN0YWNrPC9kaXY+Jywge1xyXG4gICAgICAgICAgICAnJW1lc3NhZ2UnOiBlcnJvci5tZXNzYWdlLFxyXG4gICAgICAgICAgICAnJXN0YWNrJzogZXJyb3Iuc3RhY2tcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX2FsZXJ0ID0gTWFzdGVyLmxheW91dC5tZXNzYWdlKCfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJyxcclxuICAgICAgICBmb3JtYXQobWVzc2FnZSArICc8YnIgLz48ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxMHB4O2NvbG9yOiByZWQ7bWFyZ2luOiAxMHB4IDAgMTBweCAwO1wiPiVzdGFjazwvZGl2PicsIHtcclxuICAgICAgICAgICAgJyVtZXNzYWdlJzogZXJyb3IubWVzc2FnZSxcclxuICAgICAgICAgICAgJyVzdGFjayc6IGVycm9yLnN0YWNrXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgJ2Vycm9yJywgW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAn0JTQsCcsXHJcbiAgICAgICAgICAgICAgICBjbHM6ICdidG4tZ3JlZW4nLFxyXG4gICAgICAgICAgICAgICAgY2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9hbGVydC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdKTtcclxuXHJcbiAgICAkKCdkaXZbZXJyb3JdJykuc2hvdygpO1xyXG4gICAgc2Nyb2xsKDEwMCk7XHJcbn07XHJcblxyXG4vKipcclxuICog0KfQuNGB0LvQuNGC0LXQu9GM0L3Ri9C1XHJcbiAqIEBwYXJhbSBudW1iZXJcclxuICogQHBhcmFtIHRpdGxlc1xyXG4gKiBAcmV0dXJucyB7Kn1cclxuICovXHJcbnZhciBkZWNsT2ZOdW0gPSBmdW5jdGlvbiAobnVtYmVyLCB0aXRsZXMpIHtcclxuICAgIGNhc2VzID0gWzIsIDAsIDEsIDEsIDEsIDJdO1xyXG4gICAgcmV0dXJuIHRpdGxlc1sgKG51bWJlciAlIDEwMCA+IDQgJiYgbnVtYmVyICUgMTAwIDwgMjApID8gMiA6IGNhc2VzWyhudW1iZXIgJSAxMCA8IDUpID8gbnVtYmVyICUgMTAgOiA1XSBdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqINCe0LHRgNC10LfQutCwINGB0YLRgNC+0LrQuFxyXG4gKiBAcGFyYW0gdGV4dCDQodGC0YDQvtC60LBcclxuICogQHBhcmFtIGxlbiDQnNCw0LrRgdC40LzQsNC70YzQvdCw0Y8g0LTQu9C40L3QvdCwINCyINGB0LjQvNCy0L7Qu9Cw0YVcclxuICogQHJldHVybnMgeyp9XHJcbiAqL1xyXG52YXIgYWxpZ25pbmdUZXh0ID0gZnVuY3Rpb24gKHRleHQsIGxlbikge1xyXG4gICAgaWYgKGNhbi4kLmluQXJyYXkodGV4dCwgW251bGwsIHVuZGVmaW5lZF0pICE9PSAtMSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgdGV4dCA9IHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJyA/IHRleHQgOiB0ZXh0KCk7XHJcblxyXG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGxlbilcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gZm9ybWF0KCcldDElciV0MicsIHtcclxuICAgICAgICAnJXQxJzogdGV4dC5zdWJzdHIoMCwgMzUpLFxyXG4gICAgICAgICclcic6ICcvLi4uLycsXHJcbiAgICAgICAgJyV0Mic6IHRleHQuc3Vic3RyKC03KVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbnZhciBwYXRoID0gZnVuY3Rpb24gKG9iaiwgcGFyYW1zKSB7XHJcbiAgICB2YXIgZXZlbnRzID0gcGFyYW1zWydldmVudHMnXSA/IHBhcmFtc1snZXZlbnRzJ10gOiBudWxsLFxyXG4gICAgICAgIHBhdGhBcnIgPSBwYXJhbXNbJ3BhdGgnXSA/IHBhcmFtc1sncGF0aCddLnNwbGl0KCcuJykgOiBbXSxcclxuICAgICAgICBzdGF0dXMgPSB0cnVlLFxyXG4gICAgICAgIGN1cnJlbnRPYmogPSBvYmosXHJcbiAgICAgICAgZXJyb3IsIHJlYWR5O1xyXG5cclxuICAgIGVycm9yID0gZXZlbnRzICE9PSBudWxsICYmIGV2ZW50c1snZXJyb3InXSA/IGV2ZW50c1snZXJyb3InXSA6IGZ1bmN0aW9uICgpIHtcclxuICAgIH07XHJcbiAgICByZWFkeSA9IGV2ZW50cyAhPT0gbnVsbCAmJiBldmVudHNbJ3JlYWR5J10gPyBldmVudHNbJ3JlYWR5J10gOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChjYW4uJC5pbkFycmF5KG9iaiwgW251bGwsIHVuZGVmaW5lZCwgMF0pICE9PSAtMSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcclxuICAgICAgICBlcnJvci5hcHBseSh0aGlzLCBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IDEwMCxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfQndC10LrQvtGA0YDQtdC60YLQvdGL0Lkg0L7QsdGK0LXQutGCJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgc3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbi5lYWNoKHBhdGhBcnIsIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgaWYgKCFzdGF0dXMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRPYmpbaXRlbV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBlcnJvci5hcHBseSh0aGlzLCBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogMTAxLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZvcm1hdCgn0JfQsNC00LDQvdC90YvQuSDQv9GD0YLRjCBcIiVwYXRoXCIg0L3QtSDRgdC+0L7RgtCy0LXRgtGB0YLQstGD0LXRgiDQvtCx0YrQtdC60YLRgycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyVwYXRoJzogcGFyYW1zWydwYXRoJ10gfHwgJydcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgc3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN1cnJlbnRPYmogPSBjdXJyZW50T2JqW2l0ZW1dO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFzdGF0dXMpXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgIHJlYWR5LmFwcGx5KHRoaXMsIFtjdXJyZW50T2JqXSk7XHJcbiAgICByZXR1cm4gY3VycmVudE9ialxyXG59O1xyXG5cclxuLyoqXHJcbiAqINCf0L7Qu9GD0YfQsNC10YIg0Y3Qu9C10LzQtdC90YIg0LrQsNGA0YLRiyDQv9C+INC40L3QtNC10LrRgdGDXHJcbiAqIEBwYXJhbSBtYXBcclxuICogQHBhcmFtIGluZGV4XHJcbiAqIEByZXR1cm5zIHsqfVxyXG4gKi9cclxudmFyIGdldE1hcEluZGV4ID0gZnVuY3Rpb24gKG1hcCwgaW5kZXgpIHtcclxuICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG5cclxuICAgIGNhbi5lYWNoKG1hcCwgZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0sIF9pKSB7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSBfaSlcclxuICAgICAgICAgICAgcmVzdWx0ID0gbWFwW19pXTtcclxuICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxudmFyIGNsb3NlQ29uZmlybSA9IGZ1bmN0aW9uIChtZXNzYWdlLCBjbG9zZSwgY2FuY2VsKSB7XHJcbiAgICBjYW5jZWwgPSBjYW5jZWwgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIGNsb3NlID0gY2xvc2UgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIG1lc3NhZ2UgPSBtZXNzYWdlIHx8ICfQn9GA0LjQstC10YIg0LfQsNC50YfRkdC90LrQsCc7XHJcblxyXG4gICAgdmFyIGFsZXJ0ID0gTWFzdGVyLmxheW91dC5tZXNzYWdlKCfQktC90LjQvNCw0L3QuNC1IScsXHJcbiAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICAnd2FybmluZycsIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ9Ce0YLQvNC10L3QsCcsXHJcbiAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsLmFwcGx5KHdpbmRvdywgW01hc3Rlcl0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ9CU0LAnLFxyXG4gICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZS5hcHBseSh3aW5kb3csIFtNYXN0ZXJdKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdKTtcclxufTtcclxuXHJcbnZhciBpbmZvTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGNsb3NlKSB7XHJcbiAgICBjbG9zZSA9IGNsb3NlIHx8IGZ1bmN0aW9uKCkge307XHJcbiAgICBtZXNzYWdlID0gbWVzc2FnZSB8fCAnJztcclxuXHJcbiAgICB2YXIgYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJyxcclxuICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICd3YXJuaW5nJywgW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnT0snLFxyXG4gICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlLmFwcGx5KHdpbmRvdywgW01hc3Rlcl0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF0pO1xyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAyNS4wMy4xNC5cclxuICovXHJcblxyXG4vKipcclxuICog0J/RgNCw0LLQuNC70YzQvdGL0Lkg0LLRi9Cy0L7QtCDQuNC90LTQtdC60YHQsFxyXG4gKi9cclxuY2FuLnN0YWNoZS5yZWdpc3RlckhlbHBlcignYWN0aW9uSW5kZXgnLCBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIHJldHVybiBpbmRleCgpICsgMTtcclxufSk7XHJcblxyXG5jYW4uc3RhY2hlLnJlZ2lzdGVySGVscGVyKCd1cGxvYWRfZmlsZV9hdHRhY2hlZF9yZWcnLCBmdW5jdGlvbiAoaWQpIHtcclxuICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ3VwbG9hZF9maWxlX2F0dGFjaGVkX3JlZycsIFtpZF0pO1xyXG59KTtcclxuXHJcbmNhbi5zdGFjaGUucmVnaXN0ZXJIZWxwZXIoJ3RleHRfdHJpbScsIGZ1bmN0aW9uICh0ZXh0LCBsZW5ndGgsIHBvc3RmaXgpIHtcclxuICAgIHZhciBzdHIgPSB0ZXh0KCksXHJcbiAgICAgICAgX3Bvc3RmaXggPSBwb3N0Zml4IHx8ICcnLFxyXG4gICAgICAgIF9sZW5ndGggPSBsZW5ndGggfHwgMDtcclxuXHJcbiAgICBpZiAodGV4dCgpLmxlbmd0aCA+IF9sZW5ndGgpIHtcclxuICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDAsIF9sZW5ndGgpICsgX3Bvc3RmaXg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN0cjtcclxufSk7XHJcblxyXG5jYW4uc3RhY2hlLnJlZ2lzdGVySGVscGVyKCdyZWdVcGxvYWRFbmNTZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBzZXRUaW1lb3V0KGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjYW4udHJpZ2dlcih3aW5kb3csICdyZWdfdXBsb2FkX2VuY19zZXInLCBbXSk7XHJcbiAgICB9LCB0aGlzKSwgMjAwKTtcclxufSk7XHJcblxyXG5jYW4uc3RhY2hlLnJlZ2lzdGVySGVscGVyKCdwcm9jZXNzX2NvdW50X2Zvcm1hdCcsIGZ1bmN0aW9uIChjb3VudCkge1xyXG4gICAgcmV0dXJuIGZvcm1hdCgnJWNvdW50ICV0aXRsZScsIHtcclxuICAgICAgICAnJWNvdW50JzogY291bnQoKSxcclxuICAgICAgICAnJXRpdGxlJzogZGVjbE9mTnVtKGNvdW50KCksIFsn0L/RgNC+0YbQtdGB0YEnLCAn0L/RgNC+0YbQtdGB0YHQsCcsICfQv9GA0L7RhtC10YHRgdC+0LInXSlcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmNhbi5zdGFjaGUucmVnaXN0ZXJIZWxwZXIoJ2FsaWduaW5nVGV4dCcsIGZ1bmN0aW9uICh0ZXh0LCBsbikge1xyXG4gICAgcmV0dXJuIGFsaWduaW5nVGV4dCh0ZXh0KCksIGxuKTtcclxufSk7XHJcblxyXG5jYW4uc3RhY2hlLnJlZ2lzdGVySGVscGVyKCdkZWJ1ZycsIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBpZiAoTWFzdGVyLmRlYnVnKSB7XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY2FuLnN0YWNoZS5yZWdpc3RlckhlbHBlcignYXBwZW5kJywgZnVuY3Rpb24gKHZhbCkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAkKGVsKS5hcHBlbmQodmFsKTtcclxuICAgIH07XHJcbn0pO1xyXG5cclxuY2FuLnN0YWNoZS5yZWdpc3RlckhlbHBlcigncmVtb3ZlVG9DbGljaycsIGZ1bmN0aW9uIChjYWxsKSB7XHJcbiAgICBjYWxsID0gdHlwZW9mIGNhbGwgIT09ICdmdW5jdGlvbicgPyBmdW5jdGlvbiAoKSB7XHJcbiAgICB9IDogY2FsbDtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgJChlbCkuY2xpY2soZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKGVsKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgY2FsbC5hcHBseSh0aGlzLCBbXSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgfTtcclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDE2LjA0LjE0LlxyXG4gKi9cclxudmFyIENoZWNrQXR0YWNobWVudEZpbGVzID0gY2FuLkNvbnN0cnVjdCh7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NvcGUsIGNhbGxGbikge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcclxuICAgICAgICB0aGlzLmNhbGxGbiA9IGNhbGxGbjtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdjaGVja19zaWduZWRfZmlsZV9zZXRhY21lbnQnLCB7XHJcbiAgICAgICAgICAgICAgICBzaWduZWRGaWxlSW5mb3NKU09OOiB0aGlzLnNjb3BlLmdldEZpbGVzU3RyaW5nKClcclxuICAgICAgICAgICAgfSwgZGVsZWdhdGUoZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmRhdGEuc3RhdHVzID09PSAnRXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuLnRyaWdnZXIod2luZG93LCAnbmV0X2Vycm9yJywgW2RhdGEuZGF0YS5lcnJvck1lc3NhZ2VdKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmVycm9yTWFzdGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNraW5nUmVzdWx0KGRhdGEuZGF0YS5tYXN0ZXJTaWduZWRGaWxlSW5mb3MpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INC/0YDQvtCy0LXRgNC60LUg0L/RgNC40YHQvtC10LTQuNC90ZHQvdC90L7Qs9C+INGE0LDQudC70LAuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tpbmdSZXN1bHQ6IGZ1bmN0aW9uIChmaWxlcykge1xyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIGNhbi5lYWNoKGZpbGVzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIF9maWxlID0gZmlsZS5TaWduZWRGaWxlSW5mbztcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0U2VhcmNoID0gdGhpcy5zY29wZS5zZWFyY2hGaWxlKF9maWxlLkZpbGVVcmkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLkV4Y2VwdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFNlYXJjaC5maWxlLklubmVyRXJyb3IoJ9Cf0L7QtNC/0LjRgdGMINC00LDQvdC90L7Qs9C+INGE0LDQudC70LAg0L3QtSDQvNC+0LbQtdGCINCx0YvRgtGMINC/0YDQvtCy0LXRgNC10L3QsCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoX2ZpbGUuRGV0YWNoZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFNlYXJjaC5maWxlLmF0dGFjaGVkRmlsZS5hdHRyKCdhdHRhY2hlZCcsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRTZWFyY2guZmlsZS5hdHRhY2hlZEZpbGUuYXR0cignZXJyb3InLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRTZWFyY2guZmlsZS5hdHRhY2hlZEZpbGUuYXR0cignZXJyb3JNZXNzYWdlJywgJ9Cj0LrQsNC20LjRgtC1INGE0LDQudC7INC00LvRjyDQv9C+0LTQv9C40YHQuCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNhbGxGbi5hcHBseSh0aGlzLCBbc3VjY2VzcyA9PT0gdHJ1ZV0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQtSDQv9GA0L7QstC10YDQutC4INC/0YDQuNGB0L7QtdC00LjQvdGR0L3QvdC+0LPQviDRhNCw0LnQu9CwLiBcIiVtZXNzYWdlXCInLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAwOC4wNC4xNC5cclxuICovXHJcbnZhciBDZXJ0aWZpY2F0ZVNlbGVjdGlvbiA9IGNhbi5Db250cm9sKHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xyXG4gICAgICAgIHRoaXMubmV4dENhbGwgPSBvcHRpb25zLm5leHRDYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlc3VsdCA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5ib3hTdGF0ZSA9IG5ldyBjYW4uY29tcHV0ZSgnY2hhbmdlJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2VydGlmaWNhdGUgPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcbiAgICAgICAgdGhpcy5waW4gPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcbiAgICAgICAgdGhpcy5zYXZlUGluID0gbmV3IGNhbi5jb21wdXRlKG51bGwpO1xyXG4gICAgICAgIHRoaXMubmVlZFRvUElOID0gbmV3IGNhbi5jb21wdXRlKG51bGwpO1xyXG4gICAgICAgIHRoaXMuU1RPUCA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5TVE9QX1NLSVAgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLmNlcnQgPSBuZXcgY2FuLk1hcC5MaXN0KFtdKTtcclxuXHJcbiAgICAgICAgdGhpcy5maWxlcyA9IG5ldyBjYW4uTWFwKCk7XHJcbiAgICAgICAgdGhpcy5jZXJ0TGlzdCA9IG5ldyBjYW4uTWFwLkxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5hcHBseU9wdGlvbnMoY2FuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAn0KDQsNGB0YjQuNGE0YDQvtCy0LDRgtGMJ1xyXG4gICAgICAgIH0sIG9wdGlvbnMucGFyYW1zIHx8IHt9KSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBjYW4udmlldygnL1NjcmlwdHMvbWFzdGVyL3ZpZXcvYWN0aXZpdHkvZGVjaXBoZXIvY2VydGlmaWNhdGVfc2VsZWN0aW9uLmhicycsIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZpbGVzOiBkZWxlZ2F0ZSh0aGlzLnNjb3BlLmxheW91dC5tYWluLnJlRmlsZXMsIHRoaXMuc2NvcGUubGF5b3V0Lm1haW4sIFt0cnVlXSksXHJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsOiBkZWxlZ2F0ZSh0aGlzLnNjb3BlLmxheW91dC5tYWluLnJlRmlsZXMsIHRoaXMuc2NvcGUubGF5b3V0Lm1haW4sIFt0cnVlXSksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlX2NlcnRpZmljYXRlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZWxlY3RDZXJ0aWZpY2F0ZSgnbGlzdCcsIGRlbGVnYXRlKGZ1bmN0aW9uIChhcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZShpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TVE9QX1NLSVAoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNraW5nRmlsZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnQ6IHRoaXMuY2VydExpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGlvbl9jZXJ0aWZpY2F0ZV9jaGFuZ2U6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDb25maXJtKCfQn9GA0Lgg0YHQvNC10L3QtSDRgdC10YDRgtC40YTQuNC60LDRgtCwINCy0YHQtSDQuNC30LzQtdC90LXQvdC40Y8sINGB0LTQtdC70LDQvdC90YvQtSDQvdCwINC/0YDQtdC00YvQtNGD0YnQuNGFINGN0YLQsNC/0LDRhSwg0LHRg9C00YPRgiDQv9C+0YLQtdGA0Y/QvdGLLiDQn9GA0L7QtNC+0LvQttC40YLRjD8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW4uJCgnZGl2W3Jlc3VsdF0nKS5odG1sKCcnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnJlc3VsdChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uX3J1bjogZGVsZWdhdGUodGhpcy5hY3Rpb25SdW4sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdDogdGhpcy5yZXN1bHQsXHJcbiAgICAgICAgICAgICAgICByZWFkeTogdGhpcy5yZWFkeSxcclxuICAgICAgICAgICAgICAgIGJveFN0YXRlOiB0aGlzLmJveFN0YXRlLFxyXG4gICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IHRoaXMuY2VydGlmaWNhdGVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFwcGx5ID0gZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWxsID0gZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuc2VsZik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQgPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2ID0gMDtcclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kKHZpZXcpO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdC5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJveFN0YXRlKChuZXdWYWwgPT09IHRydWUpID8gJ3JlYWR5JyA6ICdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5KChuZXdWYWwgPT09IG51bGwpID8gZmFsc2UgOiB0cnVlKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5jdXJyZW50LmJpbmQoJ2NoYW5nZScsIGRlbGVnYXRlKGZ1bmN0aW9uIChldiwgbmV3VmFsLCBvbGRWYWwpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUodGhpcy5tYWtlQ2VydGlmaWNhdGUsIHRoaXMpLCAyMDAwKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGFqYXhPYmosIHByb2Nlc3NJRCA9IHRoaXMuc2NvcGUuaXByb2Nlc3MuYWRkKCfQktGL0L/QvtC70L3Rj9C10YLRgdGPINC30LDQv9GA0L7RgSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LIg0LTQu9GPINGA0LDRgdGI0LjRhNGA0L7QstC60LguLi4nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoY29kZSkge1xyXG4gICAgICAgICAgICAgICAgLy8g0J7RgtC80LXQvdCwINC+0L/QtdGA0LDRhtC40LhcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBhamF4T2JqLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmxheW91dC5tYWluLmNsZWFyQWN0aW9uKCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIGFqYXhPYmogPSB0aGlzLnNjb3BlLnJlcS5iZWdpbignZ2V0X2RlY3J5cHRfY2VydGlmaWNhdGVzJywge1xyXG4gICAgICAgICAgICAgICAgZmlsZXM6IHRoaXMuc2NvcGUuZ2V0QXJyYXlGaWxlc1N0cmluZygpXHJcbiAgICAgICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNEb3dubG9hZEZpbGVzID0gZGF0YS5kYXRhLnJlc3VsdC5Eb3dubG9hZGVkRmlsZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FuLmVhY2goZGF0YS5kYXRhLnJlc3VsdC5DZXJ0aWZpY2F0ZUluZm9zLCBkZWxlZ2F0ZShmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydC5wdXNoKGMpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhbi5lYWNoKGRhdGEuZGF0YS5yZXN1bHQuRG93bmxvYWRlZEZpbGVzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0U2VhcmNoID0gdGhpcy5zY29wZS5zZWFyY2hGaWxlKGZpbGUuVXJpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0U2VhcmNoID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICog0JTQvtCx0LDQstC70Y/QtdC8INGE0LDQudC7INC4INC10LPQviDRgdC10YDRgtC40YTQuNC60LDRgtGLINC00LvRjyDRgNCw0YHRiNC40YTRgNC+0LLQutC4XHJcbiAgICAgICAgICAgICAgICAgICAgICog0LIg0LzQsNGB0YHQuNCyXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlcy5hdHRyKHJlc3VsdFNlYXJjaC5maWxlLmlkLCBmaWxlLkRlY3J5cHRDZXJ0aWZpY2F0ZXNUaHVtYnByaW50cyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICAgICAqINCU0L7QsdCw0LLQu9GP0LXQvCDQstGB0LUg0LLQvtC30LzQvtC20L3Ri9C1INGB0LXRgNGC0LjRhNC40LrQsNGC0YtcclxuICAgICAgICAgICAgICAgICAgICAgKiDQsiDQvNCw0YHRgdC40LJcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZGVjaXBoZXJJc1Rlc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYW4uZWFjaChmaWxlLkRlY3J5cHRDZXJ0aWZpY2F0ZXNUaHVtYnByaW50cywgZGVsZWdhdGUoZnVuY3Rpb24gKHRodW1iciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlcnRJbmZvcyA9IHRoaXMuY2VydFtsaXN0T2JqU2VhcmNoKHRoaXMuY2VydCwgJ1RodW1icHJpbnQnLCB0aHVtYnIpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkoY2VydEluZm9zLCBbbnVsbCwgdW5kZWZpbmVkLCBbXV0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IExvZ2dlcihmb3JtYXQoJ9CS0L7Qt9C90LjQutC70LAg0L7RiNC40LHQutCwINC/0YDQuCDQv9C+0LvRg9GH0LXQvdC40Lgg0LjQvdGE0L7RgNC80LDRhtC40Lgg0L4g0YHQtdGA0YLQuNGE0LjQutCw0YLQtSBcIiV0aHVtYnJcIi4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyV0aHVtYnInOiB0aHVtYnJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCAnZXJyb3InKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGh1bWJyID0gdGh1bWJyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydExpc3QuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5UaHVtYnByaW50ID09PSB0aGlzLnRodW1icikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cy5wdXNoKHZhbHVlLlRodW1icHJpbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVzdWx0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vINC00LjQutC40Lkg0LrQvtGB0YLRi9C70YxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZXJ0SW5mb3MuSXNUZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRlY2lwaGVySXNUZXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGh1bWJwcmludDogdGh1bWJyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN1YmplY3ROYW1lOiBmaWxlLkRlY3J5cHRDZXJ0aWZpY2F0ZXNOYW1lc1tpbmRleF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JnYW5pemF0aW9uOiBjZXJ0SW5mb3MuT3JnYW5pemF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdEFmdGVyOiBjZXJ0SW5mb3MuTm90QWZ0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSXNUZXN0OiBjZXJ0SW5mb3MuSXNUZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuRXhjZXB0aW9uICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRTZWFyY2guZmlsZS5Jbm5lckVycm9yKCfQlNCw0L3QvdGL0Lkg0YTQsNC50Lsg0L3QtSDQvNC+0LbQtdGCINCx0YvRgtGMINGA0LDRgdGI0LjRhNGA0L7QstCw0L0nKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jZXJ0TGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZShudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlKHRoaXMuY2VydExpc3RbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tpbmdGaWxlcygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0KCfQndC4INC+0LTQuNC9INC40Lcg0LLRi9Cx0YDQsNC90L3Ri9GFINGE0LDQudC70L7QsiDQvdC1INC80L7QttC10YIg0LHRi9GC0Ywg0YDQsNGB0YjQuNGE0YDQvtCy0LDQvS4nLCB7fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YXJuaW5nJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQl9Cw0LrRgNGL0YLRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hc3Rlci5sYXlvdXQubWFpbi5yZUZpbGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXQ6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVnVGlwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0aXBKb2ludDogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmY1ZDInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMSxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWU4YWUnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuanMtdGVzdC1jZXJ0aWZpY2F0ZS10aXBcIikuZWFjaChmdW5jdGlvbihpLGVsKXtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgT3BlbnRpcCgkKGVsKSwgJ9Ch0LXRgNGC0LjRhNC40LrQsNGCINCy0YvQv9GD0YnQtdC9INCx0LXQtyDRg9GH0LDRgdGC0LjRjzxicj7QsNC60LrRgNC10LTQuNGC0L7QstCw0L3QvdC+0LPQviDQo9C00L7RgdGC0L7QstC10YDRj9GO0YnQtdCz0L48YnI+0KbQtdC90YLRgNCwINC4INC90LUg0LjQvNC10LXRgiDRjtGA0LjQtNC40YfQtdGB0LrQvtC5INGB0LjQu9GLLicsICcnLCByZWdUaXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBPcGVudGlwLmxhc3RaSW5kZXggPSA5MDAwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjYW4udHJpZ2dlcih3aW5kb3csICdwcm9jZXNzX2V4aXQnLCBbcHJvY2Vzc0lEXSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0LLRi9Cx0L7RgNC1INGB0LXRgNGC0LjRhNC40LrQsNGC0LAuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9GA0LjQvNC10L3QtdC90LjQtSDQvtC/0YbQuNC5XHJcbiAgICAgKiBAcGFyYW0gb1xyXG4gICAgICovXHJcbiAgICBhcHBseU9wdGlvbnM6IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgY2FuLmVhY2gobywgZGVsZWdhdGUoZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvL9C00YDRg9Cz0L7QtSDQuNC80Y8g0L/RgNC40LTRg9C80LDRgtGMINC90LUg0YHQvNC+0LMgPSlcclxuICAgIHRoaXNSdW46IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLm5leHRDYWxsLmFwcGx5KHRoaXMsIFt0aGlzLmNlcnRpZmljYXRlLCB0aGlzLnBpbiwgdGhpcy5zYXZlUGluLCB0aGlzLm5lZWRUb1BJTiwgdGhpc10pO1xyXG5cclxuICAgICAgICB0aGlzLnJlc3VsdCh0cnVlKTtcclxuICAgIH0sXHJcblxyXG4gICAgYWN0aW9uUnVuOiBmdW5jdGlvbiAocGluRXJyb3IpIHtcclxuXHJcbiAgICAgICAgaWYgKHBpbkVycm9yID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0KGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5zY29wZS5yZXN1bHQoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2FybmluZ05vdFJlYWR5RmlsZXMoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXcgUGluQ29kZSh0aGlzLmNlcnRpZmljYXRlKCkuVGh1bWJwcmludCwgZGVsZWdhdGUoZnVuY3Rpb24gKG5lZWQsIHBpbiwgc2F2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBpbihwaW4pO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVQaW4oc2F2ZSk7XHJcbiAgICAgICAgICAgIHRoaXMubmVlZFRvUElOKG5lZWQpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50aGlzUnVuKCk7XHJcbiAgICAgICAgfSwgdGhpcyksIHtcclxuICAgICAgICAgICAgcGluRXJyb3I6IHBpbkVycm9yID09PSB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0JLRi9C30YvQstCw0LXRgiDQv9GA0LXQtNC10L/RgNC10LbQtNC10L3QuNC1INC+INGC0L7QvCxcclxuICAgICAqINGH0YLQviDQvdC1INCy0YHQtSDRhNCw0LnQu9GLINC80L7Qs9GD0YIg0LHRi9GC0Ywg0YDQsNGB0YjQuNGE0YDQvtCy0LDQvdGLXHJcbiAgICAgKiDQstGL0LHRgNCw0L3QvdGL0Lwg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtC8LlxyXG4gICAgICovXHJcbiAgICB3YXJuaW5nTm90UmVhZHlGaWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuZmlsZUVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLmVycm9yKCkgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5TVE9QKHRydWUpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSwgJ3JlYWR5LGVycm9yJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5TVE9QKCkgPT09IHRydWUgJiYgdGhpcy5TVE9QX1NLSVAoKSA9PT0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJyxcclxuICAgICAgICAgICAgICAgICAgICAn0J3QtSDQstGB0LUg0YTQsNC50LvRiyDQvNC+0LPRg9GCINCx0YvRgtGMINGA0LDRgdGI0LjRhNGA0L7QstCw0L3RiyDQstGL0LHRgNCw0L3QvdGL0Lwg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtC8LiDQn9GA0L7QtNC+0LvQttC40YLRjD8nLFxyXG4gICAgICAgICAgICAgICAgICAgICd3YXJuaW5nJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn0J7RgtC80LXQvdCwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQlNCwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICog0J/RgNC+0L/Rg9GB0LrQsNC10LwuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TVE9QX1NLSVAodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3Rpb25SdW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQstGL0LHQvtGA0LUg0YHQtdGA0YLQuNGE0LjQutCw0YLQsC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/RgNC+0LLQtdGA0LrQsCDRhNCw0LnQu9C+0LIg0L3QsCDQstC+0LfQvNC+0LbQvdC+0YHRgtGMINGA0LDRgdGI0LjRhNGA0L7QstC60LhcclxuICAgICAqL1xyXG4gICAgY2hlY2tpbmdGaWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLmZpbGVFYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgSUQgPSBmaWxlLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNlcnRBcnJheSA9IHRoaXMuZmlsZXMuYXR0cihJRCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbi4kLmluQXJyYXkodGhpcy5jZXJ0aWZpY2F0ZSgpLlRodW1icHJpbnQsIGNlcnRBcnJheSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5lcnJvcih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlLmVycm9yTWVzc2FnZSgn0KTQsNC50Lsg0L3QtSDQvNC+0LbQtdGCINCx0YvRgtGMINGA0LDRgdGI0LjRhNGA0L7QstCw0L0g0LTQsNC90L3Ri9C8INGB0LXRgNGC0LjRhNC40LrQsNGC0L7QvCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZmlsZS5lcnJvcihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBmaWxlLmVycm9yTWVzc2FnZSgnJyk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpLCAncmVhZHksZXJyb3InKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0L/RgNC+0LLQtdGA0LrQtSDRhNCw0LnQu9C+0LIg0L3QsCDQstC+0LfQvNC+0LbQvdC+0YHRgtGMINGA0LDRgdGI0LjRhNGA0L7QstC60LguIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDI4LjAzLjE0LlxyXG4gKi9cclxudmFyIFNlbGVjdENlcnRpZmljYXRlID0gY2FuLkNvbnN0cnVjdCh7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAodHlwZSwgY2FsbCwgb3B0aW9ucykge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCi0LjQvyDQstGL0LHQvtGA0LBcclxuICAgICAgICAgKiBAdHlwZSB7Kn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnR5cGUgPSAoY2FuLiQuaW5BcnJheSh0eXBlLCBbJ215JywgJ2FsbCcsICdsaXN0J10pICE9PSAtMSkgPyB0eXBlIDogJ215JztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQpNGD0L3QutGG0LjRjyDQstGL0LfQvtCy0LAg0YEg0LzQsNGB0YHQuNCy0L7QvCDQstGL0LHRgNCw0L3QvdGL0YVcclxuICAgICAgICAgKiDRgdC10YDRgtC40YTQuNCw0YLQvtCyINCyINC60LDRh9C10YHRgtCy0LUg0L/QsNGA0LDQvNC10YLRgNCwLlxyXG4gICAgICAgICAqIEB0eXBlIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2FsbCA9ICh0eXBlb2YgY2FsbCA9PT0gJ2Z1bmN0aW9uJykgPyBjYWxsIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCh0L/QuNGB0L7QuiDQstGB0LXRhSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LJcclxuICAgICAgICAgKiBAdHlwZSB7ZXhwb3J0cy5MaXN0fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2VydGlmaWNhdGVMaXN0ID0gbmV3IGNhbi5NYXAuTGlzdCgpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCh0L/QuNGB0L7QuiDQstGL0LHRgNCw0L3QvdGL0YUg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXHJcbiAgICAgICAgICogQHR5cGUge2V4cG9ydHMuTGlzdH1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdFNlbGVjdCA9IG5ldyBjYW4uTWFwLkxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGVja0FsbCA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMubm90aGluZ0ZvdW5kID0gY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgfSxcclxuXHJcbiAgICBydW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgc2VhcmNoID0gKHRoaXMudHlwZSA9PT0gJ2FsbCcpID8gZGVsZWdhdGUoZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG9jYWxlTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xlYW4gPSB2YWx1ZSA9PT0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdC5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsZWFuID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYXR0cignc2hvdycsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5vd25lci50b0xvY2FsZUxvd2VyQ2FzZSgpLnNlYXJjaCh2YWx1ZSkgPT09IC0xICYmICghaXRlbS5vcmdhbml6YXRpb24gfHwgaXRlbS5vcmdhbml6YXRpb24udG9Mb2NhbGVMb3dlckNhc2UoKS5zZWFyY2godmFsdWUpID09PSAtMSkgJiYgaXRlbS52YWxpZGl0eS50b0xvY2FsZUxvd2VyQ2FzZSgpLnNlYXJjaCh2YWx1ZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYXR0cignc2hvdycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoJ3Nob3cnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm91bmRMZW5ndGggPSBmdW5jdGlvbiAoY2VydExpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJC5ncmVwKGNlcnRMaXN0LGZ1bmN0aW9uIChuLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuLnNob3cgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZExlbmd0aCh0aGlzLmNlcnRpZmljYXRlTGlzdCkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aGluZ0ZvdW5kKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGhpbmdGb3VuZChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpIDogdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2FsbCcpIHtcclxuICAgICAgICAgICAgICAgIE1hc3Rlci5yZXEuYmVnaW4oJ2ZpbmRfYWxsX2NlcnRpZmljYXRlJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFN0cmluZzogJydcclxuICAgICAgICAgICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChyZXEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVxLnN0YXR1cyA9PT0gJ2Vycm9yJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCfQktC+0LfQvdC40LrQu9CwINC+0YjQuNCx0LrQsCDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70YzRgdC60LjRhSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LInLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2FuLmVhY2gocmVxLmRhdGEubW9kZWwsIGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkSXRlbShpdGVtLlN1YmplY3ROYW1lLCBpdGVtLlRpbWVNZXNzYWdlLCBpdGVtLk9yZ2FuaXphdGlvbiwgaXRlbS5UaHVtYnByaW50LCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kYWwubG9hZGluZyhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdteScpIHtcclxuICAgICAgICAgICAgICAgIGNhbi5lYWNoKE1hc3Rlci5wb29sLmFsbE15Q2VydGlmaWNhdGUsIGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRJdGVtKGl0ZW0uU3ViamVjdE5hbWUsIGl0ZW0uVGltZU1lc3NhZ2UsIGl0ZW0uT3JnYW5pemF0aW9uLCBpdGVtLlRodW1icHJpbnQsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbGlzdCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfQmNC30LzQtdC90LjRgtGMINC/0YDQuNCy0Y/Qt9C60YMhISEnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2VydC5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIGF0dHIsIHR5cGUsIG5ld1ZhbCwgb2xkVmFsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhbi5lYWNoKHRoaXMub3B0aW9ucy5jZXJ0LCBkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWxpZCA9ICAhIWl0ZW0uTm90QWZ0ZXIgPyAgbW9tZW50KHBhcnNlSW50KGl0ZW0uTm90QWZ0ZXIubWF0Y2goJ1swLTldKycpWzBdKSkuY2FsZW5kYXIoKS5yZXBsYWNlKC9cXC8vZywnLicpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEl0ZW0oaXRlbS5TdWJqZWN0TmFtZSwgZm9ybWF0KCfQlNC10LnRgdGC0LLQuNGC0LXQu9C10L0g0LTQviAldGltZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAnJXRpbWUnOiB2YWxpZFxyXG4gICAgICAgICAgICAgICAgICAgfSksIGl0ZW0uT3JnYW5pemF0aW9uLCBpdGVtLlRodW1icHJpbnQsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGFsID0gTWFzdGVyLmxheW91dC5tb2RhbChcclxuICAgICAgICAgICAgICAgICfQktGL0LHQtdGA0LjRgtC1INGB0LXRgNGC0LjRhNC40LrQsNGCJyArICgodGhpcy50eXBlID09PSAnYWxsJykgPyAn0YsnIDogJycpICsgJyDQtNC70Y8g0LTQvtCx0LDQstC70LXQvdC40Y8uJyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGF0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2ZpbmRfY2VydGlmaWNhdGUuaGJzJyxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kTXk6IHRoaXMudHlwZSA9PT0gJ215JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kQWxsOiB0aGlzLnR5cGUgPT09ICdhbGwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0FsbDogdGhpcy5jaGVja0FsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXQ6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGFsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Q6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnRhcmdldC50YWdOYW1lICE9PSAnVEQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW4uJC5pbkFycmF5KHRoaXMudHlwZSwgWydteScsICdsaXN0J10pICE9PSAtMSAmJiB0aGlzLmNlcnRpZmljYXRlTGlzdFNlbGVjdFswXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZXJ0ID0gdGhpcy5jZXJ0aWZpY2F0ZUxpc3RTZWxlY3RbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfaXRlbUluZGV4ID0gbGlzdE9ialNlYXJjaCh0aGlzLmNlcnRpZmljYXRlTGlzdCwgJ0lEJywgY2VydC5JRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVMaXN0U2VsZWN0LnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVNlbGVjdCh0aGlzLmNlcnRpZmljYXRlTGlzdFtfaXRlbUluZGV4XSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfaXRlbSA9IGxpc3RPYmpTZWFyY2godGhpcy5jZXJ0aWZpY2F0ZUxpc3RTZWxlY3QsICdJRCcsIHNjb3BlLklEKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaXRlbSAhPT0gbnVsbCAmJiBfaXRlbSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1TZWxlY3Qoc2NvcGUsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVNlbGVjdChzY29wZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZDogZGVsZWdhdGUodGhpcy5hZGQsIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IGRlbGVnYXRlKHRoaXMuZGJsY2xpY2ssIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VydENoZWNrOiBkZWxlZ2F0ZSh0aGlzLmNlcnRDaGVjaywgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RjbGljazogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlLCBlbCwgZXYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FuLiQuaW5BcnJheSh0aGlzLnR5cGUsIFsnbXknLCAnbGlzdCddKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtU2VsZWN0KHNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9pdGVtID0gbGlzdE9ialNlYXJjaCh0aGlzLmNlcnRpZmljYXRlTGlzdFNlbGVjdCwgJ0lEJywgc2NvcGUuSUQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pdGVtICE9PSBudWxsICYmIF9pdGVtID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVNlbGVjdChzY29wZSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtU2VsZWN0KHNjb3BlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsLCBldikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdC5jb21wYXJhdG9yID0gJ293bmVyJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZUxpc3Quc29ydCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKnRoaXMuY2VydGlmaWNhdGVMaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhID0gYS5vd25lclswXS5jaGFyQ29kZUF0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGIub3duZXJbMF0uY2hhckNvZGVBdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNhIDwgY2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjYSA+IGNiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRpdHk6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVMaXN0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYSA9IGEudmFsaWRpdHlbMF0uY2hhckNvZGVBdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gYi52YWxpZGl0eVswXS5jaGFyQ29kZUF0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhIDwgY2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhID4gY2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JnYW5pemF0aW9uOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsLCBldikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZUxpc3Quc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhID0gYS5vcmdhbml6YXRpb25bMF0uY2hhckNvZGVBdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gYi5vcmdhbml6YXRpb25bMF0uY2hhckNvZGVBdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYSA8IGNiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYSA+IGNiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZXJ0aWZpY2F0ZTogdGhpcy5jZXJ0aWZpY2F0ZUxpc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsczogdGhpcy5jZXJ0aWZpY2F0ZUxpc3RTZWxlY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGhpbmdGb3VuZDogdGhpcy5ub3RoaW5nRm91bmRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgc2VhcmNoXHJcbiAgICAgICAgICAgICk7XHJcblxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGVja0FsbC5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdC5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChjZXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtU2VsZWN0KGNlcnQsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0LTQuNCw0LvQvtCz0L7QstC+0LPQviDQvtC60L3QsCDQstGL0LHQvtGA0LAg0YHQtdGA0YLQuNGE0LjQutCw0YLQsC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2FsbCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kYWwubG9hZGluZygn0JfQsNCz0YDRg9C30LrQsCDRgdC/0LjRgdC60LAg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyLi4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVnVGlwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0aXBKb2ludDogXCJsZWZ0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmY1ZDInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMSxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWU4YWUnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJChcIi5qcy10ZXN0LWNlcnRpZmljYXRlLXRpcFwiKS5lYWNoKGZ1bmN0aW9uKGksZWwpe1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBPcGVudGlwKCQoZWwpLCAn0KHQtdGA0YLQuNGE0LjQutCw0YIg0LLRi9C/0YPRidC10L0g0LHQtdC3INGD0YfQsNGB0YLQuNGPPGJyPtCw0LrQutGA0LXQtNC40YLQvtCy0LDQvdC90L7Qs9C+INCj0LTQvtGB0YLQvtCy0LXRgNGP0Y7RidC10LPQvjxicj7QptC10L3RgtGA0LAg0Lgg0L3QtSDQuNC80LXQtdGCINGO0YDQuNC00LjRh9C10YHQutC+0Lkg0YHQuNC70YsuJywgJycsIHJlZ1RpcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIDEwMDApXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gb3duZXJcclxuICAgICAqIEBwYXJhbSB2YWxpZGl0eVxyXG4gICAgICogQHBhcmFtIG9yZ2FuaXphdGlvblxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIGFkZEl0ZW06IGZ1bmN0aW9uIChvd25lciwgdmFsaWRpdHksIG9yZ2FuaXphdGlvbiwgdGh1bWJwcmludCwgZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGd1aWQoKTtcclxuICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgSUQ6IGlkLFxyXG4gICAgICAgICAgICBvd25lcjogb3duZXIsXHJcbiAgICAgICAgICAgIHZhbGlkaXR5OiB2YWxpZGl0eSxcclxuICAgICAgICAgICAgb3JnYW5pemF0aW9uOiBvcmdhbml6YXRpb24sXHJcbiAgICAgICAgICAgIHRodW1icHJpbnQ6IHRodW1icHJpbnQsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIGNoZWNrOiBmYWxzZSxcclxuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgaXNUZXN0OiBkYXRhLklzVGVzdFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGl0ZW1TZWxlY3Q6IGZ1bmN0aW9uIChpdGVtLCBzZWxlY3RlZCkge1xyXG4gICAgICAgIGlmIChzZWxlY3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpdGVtLmF0dHIoJ2NoZWNrJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdFNlbGVjdC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGl0ZW0uYXR0cignY2hlY2snLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHZhciBfaXRlbSA9IGxpc3RPYmpTZWFyY2godGhpcy5jZXJ0aWZpY2F0ZUxpc3RTZWxlY3QsICdJRCcsIGl0ZW0uSUQpO1xyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlTGlzdFNlbGVjdC5zcGxpY2UoX2l0ZW0sIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZGJsY2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoY2FuLiQuaW5BcnJheSh0aGlzLnR5cGUsIFsnbXknLCAnbGlzdCddKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB2YWwgPSBuZXcgY2FuLk1hcC5MaXN0KFtdKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZUxpc3RTZWxlY3QuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICB2YWwucHVzaChpdGVtLmRhdGEpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsLmFwcGx5KG51bGwsIFt2YWxdKTtcclxuICAgICAgICB0aGlzLm1vZGFsLnJlbW92ZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjZXJ0Q2hlY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnY2VydENoZWNrJywgYXJndW1lbnRzKTtcclxuICAgIH1cclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDE2LjA0LjE0LlxyXG4gKi9cclxudmFyIE9wZXJhdGlvblJlc3VsdCA9IGNhbi5Db25zdHJ1Y3Qoe1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjb3BlLCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgdGhpcy50YWcgPSAkKCdkaXZbcmVzdWx0XScpO1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSBzZXR0aW5nc1sndHlwZSddIHx8ICcnO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgX19yZXN1bHQgPSBjYW4uTWFwLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY291bnRNYXAodGhpcy5maWxlcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgX19yZXN1bHQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZXM6IHt9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lcnJvciA9IHNldHRpbmdzWydlcnJvciddID09PSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nbG9iRXJyb3IgPSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IG5ldyBjYW4uY29tcHV0ZShmYWxzZSksXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBuZXcgY2FuLmNvbXB1dGUoJycpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpbmVFcnJvciA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmljb24gPSBwYXRoKHNldHRpbmdzLCB7XHJcbiAgICAgICAgICAgICAgICBwYXRoOiAnaWNvbicsXHJcbiAgICAgICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkZWxlZ2F0ZShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INCy0YvQstC+0LTQtSDRgNC10LfRg9C70YzRgtCw0YLQsC4gXCIlbWVzc2FnZVwiJywgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gc2V0dGluZ3MuZXJyb3JNZXNzYWdlIHx8ICfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaEZpbGVzKHNldHRpbmdzLmZpbGVzKTtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZpbGVzLmJpbmQoJ2NoYW5nZScsIGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaEZpbGVzKHNldHRpbmdzLmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc291cmNlVHlwZSA9IHNldHRpbmdzLnNvdXJjZVR5cGU7XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gY2FuLnZpZXcoJy9TY3JpcHRzL21hc3Rlci92aWV3L2FjdGl2aXR5L29wZXJhdGlvbl9yZXN1bHQuaGJzJywge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLnJlc3VsdCxcclxuICAgICAgICAgICAgICAgIGlzVGVzdDogd2luZG93LmRlY2lwaGVySXNUZXN0LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IHRoaXMuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICBnbG9iRXJyb3I6IHRoaXMuZ2xvYkVycm9yLFxyXG4gICAgICAgICAgICAgICAgZXJyb3JNZXM6IHRoaXMuZXJyb3JNZXNzYWdlLFxyXG5cclxuICAgICAgICAgICAgICAgIGljb246IHRoaXMuaWNvbixcclxuICAgICAgICAgICAgICAgIHNob3dMaW5rOiBzZXR0aW5nc1snc2hvd0xpbmsnXSA9PT0gdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGxpbmVFcnJvcjogdGhpcy5saW5lRXJyb3IsXHJcblxyXG4gICAgICAgICAgICAgICAgaXNFbmNTaWc6IHRoaXMudHlwZSA9PT0gJ2VuY19zaWcnLFxyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlld19maWxlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gc2NvcGUuZmlsZU5hbWUrJy5zaWcuZW5jJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBzY29wZS5zb3VyY2VmaWxlTmFtZS5zdWJzdHJpbmcoMCwgc2NvcGUuc291cmNlZmlsZU5hbWUubGVuZ3RoIC0gZmlsZW5hbWUubGVuZ3RoKStzY29wZS5maWxlTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJy9oZWxwZXIvR2V0VmlzdWFsaXphdGlvbkluZm8nLGFzeW5jOiBmYWxzZSx0eXBlOiBcIkdFVFwiLGRhdGE6IHtmaWxlbmFtZTogZmlsZW5hbWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LkVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gc2NvcGUuZmlsZU5hbWUuc3BsaXQoJy8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbj00MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbbmFtZS5sZW5ndGgtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lLmxlbmd0aCA+IGxlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9ICcuLi4nK25hbWUuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLWxlbiwgbmFtZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuVmlzdWFsaXphdGlvblVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5mYW5jeWJveCh7aHJlZiA6IHJlc3VsdC5WaXN1YWxpemF0aW9uVXJsLHR5cGU6ICdpZnJhbWUnfSx7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlcnM6IHt0aXRsZToge3Bvc2l0aW9uOiAndG9wJ319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aFx0OiA3MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAgICAgIDogMTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGhcdDogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU2l6ZVx0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvUmVzaXplXHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZzogJ25vJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wUmF0aW86IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogWzIwLCAyMCwgOTAsIDIwXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDbGlja1x0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkVmZmVjdFx0OiAnZmFkZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBDU1MgICAgIDogJ3Zpc3VhbGlzZU1vZGFsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgICAgICAgOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnRlckNsb3NlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy52aXN1YWxTdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZmFuY3lib3goXCI8aW1nIGFsaWduPSdjZW50ZXInIHdpZHRoPScxMDAlJyBzdHlsZT0nbWFyZ2luOiAwIGF1dG87ZGlzcGxheTogYmxvY2s7JyBzcmM9J2RhdGE6aW1hZ2UvanBnO2Jhc2U2NCxcIityZXN1bHQuQmFzZTY0UGljdHVyZStcIic+XCIse1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJzOiB7dGl0bGU6IHtwb3NpdGlvbjogJ3RvcCd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNwZWN0UmF0aW8gOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXRUb1ZpZXdcdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1NpemVcdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1Jlc2l6ZVx0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxpbmc6ICdubycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcFJhdGlvOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IFsyMCwgMjAsIDkwLCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ2xpY2tcdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5FZmZlY3RcdDogJ2ZhZGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cmFwQ1NTICAgICA6ICd2aXN1YWxpc2VNb2RhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlICAgICAgIDogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJDbG9zZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudmlzdWFsU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXF1ZXN0LCBlcnJvciwgcmVzdWx0KSB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tGaWxlczogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvRGVmYXVsdC9XZWJEYXZCcm93c2VyJztcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVmaWxlczogZGVsZWdhdGUodGhpcy5zY29wZS5sYXlvdXQubWFpbi5yZUZpbGVzLCB0aGlzLnNjb3BlLmxheW91dC5tYWluLCBbdHJ1ZV0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvd25sb2FkX2ZpbGU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZXYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gc2NvcGUuZmlsZU5hbWUrJy5zaWcuZW5jJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBzY29wZS5zb3VyY2VmaWxlTmFtZS5zdWJzdHJpbmcoMCwgc2NvcGUuc291cmNlZmlsZU5hbWUubGVuZ3RoIC0gZmlsZW5hbWUubGVuZ3RoKStzY29wZS5maWxlTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oJy9oZWxwZXIvRG93bmxvYWRGaWxlP2Rvd25sb2FkZWRGaWxlVXJpPScgKyBlbmNvZGVVUklDb21wb25lbnQoZmlsZW5hbWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRfc291cmNlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCcvaGVscGVyL0Rvd25sb2FkRmlsZT9kb3dubG9hZGVkRmlsZVVyaT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNjb3BlLnNvdXJjZWZpbGVOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRfZW5jcnlwdGVkOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCcvaGVscGVyL0Rvd25sb2FkRmlsZT9kb3dubG9hZGVkRmlsZVVyaT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNjb3BlLmVuY3J5cHRlZE5hbWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX2VuY3J5cHRlZDogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlLCBldikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Ywg0YTQsNC50Ls/JywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5yZXEuYmVnaW4oJ2ZpbGVfZGVsZXRlJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0aW5nRmlsZVVyaTogc2NvcGUuZW5jcnlwdGVkTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDQmtCw0LrQvtC5INGC0L4g0L7RgtCy0LXRglxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvRj9C10LxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC4uINC4INC90LXQvNC90L7QttC60L4g0YPQtNC10YDQttC40LLQsNC10Lwg0LTQu9GPINC60YDQsNGB0L7RgtGLLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignZW5jcnlwdGVkTmFtZScsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLCAyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZTogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlLCBldikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0YPQtNCw0LvQuNGC0Ywg0YTQsNC50Ls/JywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5yZXEuYmVnaW4oJ2ZpbGVfZGVsZXRlJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0aW5nRmlsZVVyaTogc2NvcGUuZmlsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g0JrQsNC60L7QuSDRgtC+INC+0YLQstC10YJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vINCj0LTQsNC70Y/QtdC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAuLiDQuCDQvdC10LzQvdC+0LbQutC+INGD0LTQtdGA0LbQuNCy0LDQtdC8INC00LvRjyDQutGA0LDRgdC+0YLRiy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKmlmKHRoaXMudHlwZSAhPT0gJ2VuY19zaWcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvdW50TWFwKHRoaXMucmVzdWx0LmZpbGVzKSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCh0aGlzLnJlc3VsdC5maWxlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmxheW91dC5tYWluLnJlRmlsZXMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfaW5kZXggPSB0aGlzLnJlc3VsdC5maWxlcy5hdHRyKHNjb3BlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoX2luZGV4ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdC5maWxlcy5yZW1vdmVBdHRyKHNjb3BlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignZmlsZU5hbWUnLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvdW50TWFwKHRoaXMucmVzdWx0LmZpbGVzKSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhck1hcCh0aGlzLnJlc3VsdC5maWxlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmxheW91dC5tYWluLnJlRmlsZXMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0qL1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5hdHRyKCdmaWxlTmFtZScsICcnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSwgMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vcmU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLmlzTW9yZVNob3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoJ9Cf0L7QtNGA0L7QsdC90LXQtScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignaXNNb3JlU2hvdycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoJ9Ch0LrRgNGL0YLRjCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignaXNNb3JlU2hvdycsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgc291cmNlVHlwZTogdGhpcy5zb3VyY2VUeXBlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2aWV3KVxyXG4gICAgICAgICAgICB0aGlzLnRhZy5hcHBlbmQodmlldyk7XHJcbiAgICAgICAgICAgIHZhciByZWdUaXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgdGlwSm9pbnQ6IFwibGVmdFwiLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmY1ZDInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWU4YWUnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKFwiLmpzLXRlc3QtZmlsZS10aXBcIikuZWFjaChmdW5jdGlvbihpLGVsKXtcclxuICAgICAgICAgICAgICAgIG5ldyBPcGVudGlwKCQoZWwpLCAn0JTQsNC90L3Ri9C5INGE0LDQudC7INCx0YvQuyDQv9C+0LTQstC10YDQs9C90YPRgiDQutGA0LjQv9GC0L7QvtC/0LXRgNCw0YbQuNC4INGBINC40YHQv9C+0LvRjNC30L7QstCw0L3QuNC10Lwg0YLQtdGB0YLQvtCy0L7Qs9C+INGB0LXRgNGC0LjRhNC40LrQsNGC0LAuINCi0LDQutC40LUg0YHQtdGA0YLQuNGE0LjQutCw0YLRiyDQstGL0L/Rg9GB0LrQsNGO0YLRgdGPINCx0LXQtyDRg9GH0LDRgdGC0LjRjyDQsNC60LrRgNC10LTQuNGC0L7QstCw0L3QvdC+0LPQviDQo9C00L7RgdGC0L7QstC10YDRj9GO0YnQtdCz0L4g0KbQtdC90YLRgNCwINC4INC90LUg0LjQvNC10Y7RgiDRjtGA0LjQtNC40YfQtdGB0LrQvtC5INGB0LjQu9GLLicsICcnLCByZWdUaXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIE9wZW50aXAubGFzdFpJbmRleCA9IDkwMDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0LLRi9Cy0L7QtNC1INGA0LXQt9GD0LvRjNGC0LDRgtCwLiBcIiVtZXNzYWdlXCInLCBlKTtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLnJlc3VsdCh0cnVlKTtcclxuICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnRhZy5odG1sKCcnKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVmcmVzaEZpbGVzOiBmdW5jdGlvbiAoZmlsZXMpIHtcclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJNYXAodGhpcy5yZXN1bHQuZmlsZXMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGFjY2VwdEV4dCA9IFsnb2RzJywneGxzJywneGxzYicsJ3hsc3gnLCdvZHMnLCd4bHNiJywneGxzbScsJ3hsc3gnLCdvZHAnLCdwb3QnLCdwb3RtJywncG90eCcsXHJcbiAgICAgICAgICAgICAgICAncHBzJywncHBzbScsJ3Bwc3gnLCdwcHQnLCdwcHRtJywncHB0eCcsJ29kcCcsJ3Bwc3gnLCdwcHR4JywnZG9jJywnZG9jbScsJ2RvY3gnLCdkb3QnLFxyXG4gICAgICAgICAgICAgICAgJ2RvdG0nLCdkb3R4Jywnb2R0JywncGRmJywnb25lJywnb25ldG9jMicsJ2pwZycsJ2pwZWcnLCdnaWYnLCdwbmcnLCdibXAnLCd4bWwnXTtcclxuXHJcbiAgICAgICAgICAgIGNhbi5lYWNoKGZpbGVzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBndWlkKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWU7XHJcbiAgICAgICAgICAgICAgICAvL9CS0YDQtdC80LXQvdC90YvQuSDQutC+0YHRgtGL0LvRjCDQv9C+0LvRg9GH0LXQvdC40Y8g0LrQvtGA0YDQtdC60YLQvdC+0LPQviDQv9GD0YLQuCDRhNCw0LnQu9CwINCyINGA0LXQt9GD0LvRjNGC0LDRgtC1XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZS5FbmNyeXB0ZWRGaWxlKVxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZS5FbmNyeXB0ZWRGaWxlLnJlcGxhY2UoL1xcXFwvZywgJy8nKS5yZXBsYWNlKC9cXC9bXlxcL10qXFwvPyQvLCAnJykgKyAnLycgKyAgKCcnICsgZmlsZS5PcGVyYXRlZEZpbGUpLnJlcGxhY2UoL14uKltcXFxcXFwvXS8sICcnKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGZpbGUuT3BlcmF0ZWRGaWxlO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBmaWxlRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZWZpbGVOYW1lOiBmaWxlLlNvdXJjZUZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZpbGUuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBmaWxlLmVycm9yTWVzc2FnZSxcclxuICAgICAgICAgICAgICAgICAgICBzZXJ0SW5mbzogdGhpcy5pY29uID09PSBmYWxzZSA/IGZpbGUuc2VydEluZm8gOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBoaWRlVmlldzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZS5PcGVyYXRlZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9ICEhZmlsZS5PcGVyYXRlZEZpbGUgPyBmaWxlLk9wZXJhdGVkRmlsZS5zcGxpdCgnLycpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4dCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lW25hbWUubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ID0gbmFtZS5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHQgPSBleHRbZXh0Lmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWNjZXB0RXh0LmluZGV4T2YoZXh0LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZURhdGEuaGlkZVZpZXcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLkVuY3J5cHRlZEZpbGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVEYXRhLmVuY3J5cHRlZE5hbWUgPSBmaWxlLkVuY3J5cHRlZEZpbGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQuZmlsZXMuYXR0cihpZCwgZmlsZURhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLmVycm9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZUVycm9yKHRydWUpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHNjcm9sbCgxMDApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQstGL0LLQvtC00LUg0YDQtdC30YPQu9GM0YLQsNGC0LAuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7IiwiXHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAyOC4wNC4xNC5cclxuICovXHJcbnZhciBPcGVuVXBsb2FkRmlsZURpYWxvZyA9IGNhbi5Db25zdHJ1Y3Qoe1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKGZuQ2FsbCwgcGFyYW1zKSB7XHJcbiAgICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmtleSA9IHJhbmRvbSgpO1xyXG4gICAgICAgIHRoaXMuZm5DYWxsID0gZm5DYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm11bHRpX3NlbGVjdGlvbiA9IChwYXJhbXNbJ211bHRpX3NlbGVjdGlvbiddID09PSB1bmRlZmluZWQpID8gdHJ1ZSA6IHBhcmFtc1snbXVsdGlfc2VsZWN0aW9uJ107XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kYWwgPSBNYXN0ZXIubGF5b3V0Lm1vZGFsKCfQktGL0LHQtdGA0LjRgtC1INGE0LDQudC7INC00LvRjyDQtNC+0LHQsNCy0LvQtdC90LjRjycsIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdwYXRoJyxcclxuICAgICAgICAgICAgICAgIHBhdGg6ICdzZWxlY3RfZmlsZXMuaGJzJyxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGhpcy5rZXksXHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlfc2VsZWN0aW9uOiB0aGlzLm11bHRpX3NlbGVjdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAnYm94Jyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0LTQuNCw0LvQvtCz0L7QstC+0LPQviDQvtGC0LrQvdCwINCy0YvQsdC+0YDQsCDRhNCw0LnQu9C+0LIuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgIGNhbi5iaW5kLmNhbGwod2luZG93LCAnc2VsZWN0X2ZpbGVzJywgZGVsZWdhdGUoZnVuY3Rpb24gKGV2LCBrZXksIGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLmtleSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZuQ2FsbC5hcHBseShNYXN0ZXIsIFtmaWxlcywgcGFyYW1zXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIGNhbi5iaW5kLmNhbGwod2luZG93LCAnd2luZG93X29wZW5fZmlsZXNfY2xvc2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIGtleSwgZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm1vZGFsLnJlbW92ZSgpO1xyXG4gICAgfVxyXG59KTsiLCJcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDExLjA2LjE0LlxyXG4gKlxyXG4gKiDQmtC70LDRgdGBINC30LDQv9GA0L7RgdCwINC/0LjQvS3QutC+0LTQsFxyXG4gKi9cclxudmFyIFBpbkNvZGUgPSBjYW4uQ29uc3RydWN0KCdoZWxwZXJzLlBpbkNvZGUnLCB7XHJcbiAgICAvKipcclxuICAgICAqINCa0L7QvdGB0YLRgNGD0LrRgtC+0YAg0LfQsNC/0YDQvtGB0LAg0L/QuNC9LdC60L7QtNCwXHJcbiAgICAgKiBAcGFyYW0gdGh1bWJwcmludCDQntGC0L/QtdGH0LDRgtC+0Log0YHQtdGA0YLQuNGE0LjQutCw0YLQsFxyXG4gICAgICogQHBhcmFtIGZ1bmN0aW9uIGNhbGxGbiDQpC4g0L7QsdGA0LDRgtC90L7Qs9C+INCy0YvQt9C+0LLQsCAoMyDQv9Cw0YDQsNC80LXRgtGA0LApXHJcbiAgICAgKiAo0L3Rg9C20LXQvSDQu9C4INC/0LjQvSwg0L/QuNC9LdC60L7QtCwg0YHQvtGF0YDQsNC90LjRgtGMINC40LvQuCDQvdC10YIpXHJcbiAgICAgKiBAcGFyYW0gb2JqZWN0IG9wdGlvbnMg0J7Qv9GG0LjQuFxyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbiAodGh1bWJwcmludCwgY2FsbEZuLCBvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAdHlwZSB7KnxGdW5jdGlvbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNhbGxGbiA9IGNhbGxGbiB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEB0eXBlIHsqfHN0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRodW1icHJpbnQgPSB0aHVtYnByaW50IHx8ICcnO1xyXG4gICAgICAgIHRoaXMucGluQ250ID0gMDtcclxuICAgICAgICB0aGlzLl9fbW9kYWxXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHBpbkVycm9yOiBvcHRpb25zWydwaW5FcnJvciddID09PSB0cnVlLFxyXG4gICAgICAgICAgICB3cm9uZ1NhdmVkUGluIDogb3B0aW9uc1snd3JvbmdTYXZlZFBpbiddID09PSB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5waW5FcnJvciAmJiAhdGhpcy5vcHRpb25zLndyb25nU2F2ZWRQaW4pIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRQaW4oJ9Cd0LXQstC10YDQvdGL0Lkg0L/QuNC9Jyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5uZWVkVG9QaW4oZGVsZWdhdGUoZnVuY3Rpb24gKG5lZWQpIHtcclxuICAgICAgICAgICAgaWYgKG5lZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UGluKCcnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMud3JvbmdTYXZlZFBpbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UGluKCcnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX3JldHVybihmYWxzZSwgbnVsbCwgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQndGD0LbQtdC9INC70Lgg0L/QuNC9LdC60L7QtFxyXG4gICAgICogQHBhcmFtIGZ1bmN0aW9uIGNhbGxcclxuICAgICAqL1xyXG4gICAgbmVlZFRvUGluOiBmdW5jdGlvbiAoY2FsbCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fX2hhc1RvUG9vbCgpKSB7XHJcbiAgICAgICAgICAgIE1hc3Rlci5yZXEuYmVnaW4oJ2dldF9waW4nLCB7XHJcbiAgICAgICAgICAgICAgICB0aHVtYnByaW50OiB0aGlzLnRodW1icHJpbnRcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IGRhdGEuZGF0YS5OZWVkVG9QSU4gPT09IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgTWFzdGVyLnBvb2wubmVlZFRvUGluLmF0dHIodGhpcy50aHVtYnByaW50LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBjYWxsLmFwcGx5KHRoaXMsIFtzdGF0ZV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjYWxsLmFwcGx5KHRoaXMsIFt0cnVlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCS0YvQstC+0LQg0LzQvtC00LDQu9GM0L3QvtCz0L4g0L7QutC90LAg0LTQu9GPINCy0LLQvtC00LAg0L/QuNC9LdC60L7QtNCwXHJcbiAgICAgKiBAcGFyYW0gZXJyb3JNZXNzYWdlINCh0L7QvtCx0YnQtdC90LjQtSDQvtCxINC+0YjQuNCx0LrQtVxyXG4gICAgICovXHJcbiAgICBnZXRQaW46IGZ1bmN0aW9uIChlcnJvck1lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLl9fbW9kYWxXaW5kb3cgPSB0aGlzLl9fc2hvd01vZGFsKGRlbGVnYXRlKGZ1bmN0aW9uIChwaW4sIHNhdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fX3JldHVybih0cnVlLCBwaW4sIHNhdmUpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgaWYgKGVycm9yTWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX19tb2RhbFdpbmRvdy5lcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQktGL0LfQvtCyINC+0LHRgNCw0YLQvdC+0Lkg0YQt0YbQuNC4INCy0YvQt9C+0LLQsC5cclxuICAgICAqIEBwYXJhbSBib29sZWFuIG5lZWQg0J3Rg9C20LXQvSDQu9C4INC/0LjQvVxyXG4gICAgICogQHBhcmFtIHN0cmluZyBwaW4g0J/QuNC9LdC60L7QtFxyXG4gICAgICogQHBhcmFtIGJvb2xlYW4gc2F2ZSDQndGD0LbQvdC+INC70Lgg0YHQvtGF0YDQsNC90Y/RgtGMXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfX3JldHVybjogZnVuY3Rpb24gKG5lZWQsIHBpbiwgc2F2ZSkge1xyXG4gICAgICAgIHRoaXMuY2FsbEZuLmFwcGx5KHRoaXMsIFtuZWVkLCBwaW4sIHNhdmVdKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9C+0LjRgdC6INGB0L7RhdGA0LDQvdGR0L3QvdC+0LPQviDQt9C90LDRh9C10L3QuNGPINCyINC/0YPQu9C1XHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9faGFzVG9Qb29sOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF9uZWVkID0gTWFzdGVyLnBvb2wubmVlZFRvUGluLmF0dHIodGhpcy50aHVtYnByaW50KTtcclxuXHJcbiAgICAgICAgaWYgKF9uZWVkID09PSB1bmRlZmluZWQgfHwgX25lZWQgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBfX3Nob3dNb2RhbDogZnVuY3Rpb24gKGNhbGwsIHNjb3BlLCBwYXJhbXMpIHtcclxuICAgICAgICBjYWxsID0gY2FsbCB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgIHZhciBwaW4gPSBuZXcgY2FuLmNvbXB1dGUoJycpLFxyXG4gICAgICAgICAgICBzYXZlID0gbmV3IGNhbi5jb21wdXRlKGZhbHNlKSxcclxuICAgICAgICAgICAgZXJyb3IgPSBuZXcgY2FuLmNvbXB1dGUocGFyYW1zWydlcnJvciddIHx8ICcnKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKE1hc3Rlci5kZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgcGluKCcxMTExMTExMScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSB7fSwgYm9keSA9IGNhbi52aWV3LnJlbmRlcignL1NjcmlwdHMvbWFzdGVyL3ZpZXcvbW9kYWxzL3Bpbi5oYnMnLCB7XHJcbiAgICAgICAgICAgICAgICBwaW46IHBpbixcclxuICAgICAgICAgICAgICAgIGJ0bnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQntGC0LzQtdC90LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ9Cf0YDQvtC00L7Qu9C20LjRgtGMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBpbigpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCfQktCy0LXQtNC10L0g0L/Rg9GB0YLQvtC5INC/0LjQvSEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoJycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGwuYXBwbHkoc2NvcGUsIFtwaW4oKSwgc2F2ZSgpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgc2F2ZTogc2F2ZSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsID0gTWFzdGVyLmxheW91dC5tb2RhbCgn0JLQstC+0LQg0L/QuNC9LdC60L7QtNCwJywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgYm9keTogYm9keVxyXG4gICAgICAgICAgICB9LCAnYWxlcnQnKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0YPRgdGC0LDQvdC+0LLQutC1INC/0LjQvS3QutC+0LTQsC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBleGl0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcihtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAxNy4wNi4xNC5cclxuICovXHJcbnZhciBVcGxvYWRWZXJpZnlGaWxlcyA9IGNhbi5Db25zdHJ1Y3QoJ2hlbHBlcnMuVXBsb2FkVmVyaWZ5RmlsZXMnLCB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAodXBsb2FkZXIsIGZpbGVzLCBmbkNhbGwpIHtcclxuICAgICAgICB0aGlzLnVwbG9hZGVyID0gdXBsb2FkZXI7XHJcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xyXG4gICAgICAgIHRoaXMuZm5DYWxsID0gZm5DYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLl9fZXJyb3JzID0gbmV3IGNhbi5NYXAuTGlzdCgpO1xyXG4gICAgICAgIHRoaXMuX192ZXJpZmllZCA9IG5ldyBjYW4uTWFwLkxpc3QoKTtcclxuXHJcbiAgICAgICAgY2FuLmVhY2goZmlsZXMsIGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX192ZXJpZnlGaWxlKGZpbGUpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5mbkNhbGwuYXBwbHkodGhpcywgW3RoaXMuX192ZXJpZmllZF0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fX2Vycm9ycy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX19zaG93RXJyb3JNZXNzYWdlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9fdmVyaWZ5RmlsZTogZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICBpZiAoZmlsZS5zaXplID4gMjAgKiAxMDI0ICogMTAyNCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fYWRkRXJyb3IoZmlsZSwgJ9Cf0YDQtdCy0YvRiNC10L0g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80YvQuSDRgNCw0LfQvNC10YAg0LfQsNCz0YDRg9C20LDQtdC80L7Qs9C+INGE0LDQudC70LAsINC/0L7QstGC0L7RgNC40YLQtSDQv9C+0L/Ri9GC0LrRgy4g0JzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80YvQuSDRgNCw0LfQvNC10YAg0YTQsNC50LvQsCDRgNCw0LLQtdC9IDIwINC80LXQs9Cw0LHQsNC50YLQsNC8LicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmlsZS5uYW1lLmxlbmd0aCA+IDEwMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9fYWRkRXJyb3IoZmlsZSwgJ9Cf0YDQtdCy0YvRiNC10L3QsCDQvNCw0LrRgdC40LzQsNC70YzQvdCw0Y8g0LTQu9C40L3QsCDQuNC80LXQvdC4INGE0LDQudC70LAuINCSINC90LDRgdGC0L7Rj9GJ0LjQuSDQvNC+0LzQtdC90YIg0LzQsNC60YHQuNC80LDQu9GM0L3QsNGPINC00LvQuNC90LAg0LjQvNC10L3QuCDRhNCw0LnQu9CwINC+0LPRgNCw0L3QuNGH0LXQvdCwIDEwMCDRgdC40LzQstC+0LvQsNC80LguJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtYWNoID0gZmlsZS5uYW1lLm1hdGNoKC9bJFxcOlxcKlxcP1xcXCJcXCtcXCNcXDxcXD5cXC9dL2cpO1xyXG5cclxuICAgICAgICBpZiAobWFjaCAhPT0gbnVsbCAmJiBtYWNoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fX2FkZEVycm9yKGZpbGUsICfQpNCw0LnQuyDRgdC+0LTQtdGA0LbQuNGCINC90LXQtNC+0L/Rg9GB0YLQuNC80YvQtSDRgdC40LzQstC+0LvRiyDQsiDQvdCw0LfQstCw0L3QuNC4LiDQlNC70Y8g0LLQstC+0LTQsCDQt9Cw0L/RgNC10YnQtdC90Ysg0YHQuNC80LLQvtC70Ys6IFwiJCAvIDogKiA/IFwiICsgIyA8ID4gfFwiJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX192ZXJpZmllZC5wdXNoKGZpbGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfX2FkZEVycm9yOiBmdW5jdGlvbiAoZmlsZSwgZXJyb3JNZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy51cGxvYWRlci5yZW1vdmVGaWxlKGZpbGUpO1xyXG5cclxuICAgICAgICB0aGlzLl9fZXJyb3JzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBhbGlnbmluZ1RleHQoZmlsZS5uYW1lLCA0MCksXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBfX3Nob3dFcnJvck1lc3NhZ2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5fX2Vycm9ycy5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICBtZXNzYWdlICs9IGZvcm1hdCgnPGI+wqslbmFtZcK7PC9iPiDigJQgJW1lc3NhZ2U8YnIgLz4nLCB7XHJcbiAgICAgICAgICAgICAgICAnJW5hbWUnOiBlcnJvci5uYW1lLFxyXG4gICAgICAgICAgICAgICAgJyVtZXNzYWdlJzogZXJyb3IubWVzc2FnZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBfYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJyxcclxuICAgICAgICAgICAgZm9ybWF0KCfQndC10LLQvtC30LzQvtC20L3QviDQt9Cw0LPRgNGD0LfQuNGC0Ywg0L3QtdC60L7RgtC+0YDRi9C1INGE0LDQudC70Ysg0L/QviDRgdC70LXQtNGD0Y7RidC40Lwg0L/RgNC40YfQuNC90LDQvDo8YnIgLz4lZXJyb3JzJScsIHtcclxuICAgICAgICAgICAgICAgICclZXJyb3JzJSc6IG1lc3NhZ2VcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICdlcnJvcicsIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn0JfQsNC60YDRi9GC0YwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYWxlcnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICQoJy51cGxvYWQnKS5yZW1vdmVDbGFzcygnZHJhZycpO1xyXG4gICAgfVxyXG59KTsiLCJ2YXIgTG9nZ2VyID0gZnVuY3Rpb24gKG1lc3NhZ2UsIHR5cGUsIGRhdGEpIHtcclxuICAgIGlmICghTWFzdGVyLmRlYnVnKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICB0eXBlID0gdHlwZSB8fCAnaW5mbycsXHJcbiAgICAgICAgZGF0YSA9IGRhdGEgfHwgJycsXHJcbiAgICAgICAgbWVzc2FnZSA9IChmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChtKTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdbb2JqZWN0IFN0cmluZ10nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbVswXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjYW4uZWFjaChtWzFdLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UobmV3IFJlZ0V4cChrZXksICdnJyksIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KShtZXNzYWdlKTtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSwgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlID09PSAnaW5mbycpIHtcclxuICAgICAgICBjb25zb2xlLmluZm8obWVzc2FnZSwgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlID09PSAnd2FybmluZycpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSwgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59OyIsInZhciBDb3JlID0gY2FuLkNvbnN0cnVjdCgnQ29yZScsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQodGB0YvQu9C60LAg0L3QsCDQtNC10LvQtdCz0LDRgiDQvtGB0YLQsNCy0LvQtdC9INC00LvRjyDRgdC+0LLQvNC10YHRgtC40LzQvtGB0YLQuFxyXG4gICAgICovXHJcbiAgICBkZWxlZ2F0ZTogZGVsZWdhdGUsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVTklYIFRJTUVcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRpbWU6IHRpbWUsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQk9C10L3QtdGA0LDRhtC40Y8g0YPQvdC40LrQsNC70YzQvdC+0Lkg0YHRgtGA0L7QutC4XHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICByYW5kb206IHJhbmRvbSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0L7QtNGB0YfRkdGCINC60L7Quy3QstCwINGN0LvQtdC80LXQvdGC0L7QsiDQvdCwINC60LDRgNGC0LVcclxuICAgICAqIEBwYXJhbSBtYXBcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50TWFwOiBjb3VudE1hcCxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCe0YfQuNGB0YLQutCwINGA0LDQsdC+0YfQtdC5INC60LDRgNGC0YtcclxuICAgICAqIEBwYXJhbSBtYXBcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBjbGVhck1hcDogY2xlYXJNYXBcclxufSk7IiwidmFyIENvcmVHbG9iID0gY2FuLkNvbnN0cnVjdCgnQ29yZUdsb2InLCB7XHJcbiAgICBzY29wZTogbnVsbCxcclxuXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICB0aGlzLnNjb3BlID0gc2NvcGU7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cHJlc3MgPSBuZXcgd2luZG93LmtleXByZXNzLkxpc3RlbmVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcGUucmVzdWx0ID0gbmV3IGNhbi5jb21wdXRlKGZhbHNlKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0J7RgdC90L7QstC90L7QtSDRhdGA0LDQvdC40LvQuNGJ0LUg0LTQsNC90L3Ri9GFINC/0YDQuNC70L7QttC10L3QuNGPLlxyXG4gICAgICAgICAqIEB0eXBlIHtjYW4uTWFwfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2NvcGUucG9vbCA9IG5ldyBjYW4uTWFwKHtcclxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgIGxvYWQ6IHt9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbGVzOiBuZXcgY2FuLk1hcC5MaXN0KFtdKSxcclxuICAgICAgICAgICAgdGVtcGxhdGVzOiBudWxsLFxyXG4gICAgICAgICAgICBhbGxNeUNlcnRpZmljYXRlOiBuZXcgY2FuLk1hcC5MaXN0KFtdKSxcclxuICAgICAgICAgICAga2V5czoge30sXHJcbiAgICAgICAgICAgIG5lZWRUb1Bpbjoge31cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29wZS5yZXEgPSBuZXcgUmVxdWVzdCh0aGlzLnNjb3BlKTtcclxuICAgICAgICB0aGlzLnNjb3BlLmlwcm9jZXNzID0gbmV3IEluZm9ybWF0aW9uUHJvY2Vzcyh0aGlzLnNjb3BlKTtcclxuICAgICAgICB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzID0gbmV3IFRlbXBsYXRlcyh0aGlzLnNjb3BlKTtcclxuXHJcbiAgICAgICAgY2FuLmJpbmQuY2FsbCh0aGlzLnNjb3BlLCAnc2V0dGluZ3NfbG9hZGVkJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBuZXcgTG9nZ2VyKCfQndCw0YHRgtGA0L7QudC60Lgg0LfQsNCz0YDRg9C20LXQvdGLJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zY29wZS5kZWJ1ZylcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuRGVidWcoKTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRiNCw0LHQu9C+0L3QvtCyLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5sb2FkKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5leHQoJ291dHNpZGUnLCBkZWxlZ2F0ZShmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2V4aXRzZW5kZmlsZXdpbmRvdycpIHtcclxuICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHRoaXMuc2NvcGUsICdjbG9zZV93aW5kb3dfc2VuZF9maWxlJywgW3RoaXMuc2NvcGVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5leHQoJ2dvVXJsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0JTQvtCx0LDQstC70LXQvdC40LUg0L3QvtCy0L7Qs9C+INGE0LDQudC70LBcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmV4dCgnYWRkRmlsZScsIGZ1bmN0aW9uIChuYW1lLCBsYXN0RGF0ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlID0gbmV3IEZpbGUobmFtZSwgbGFzdERhdGUsIHBhcmFtcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvb2wuZmlsZXMucHVzaChmaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQntGC0LTQsNGR0YIg0LzQsNGB0YHQuNCyINCz0L7RgtC+0LLRi9GFINC6INC+0LHRgNCw0LHQvtGC0LrQtSDRhNCw0LnQu9C+0LJcclxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmV4dCgnZ2V0RmlsZXNTdHJpbmcnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wb29sLmZpbGVzLmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLmlzSGFkZSgpID09PSB0cnVlIHx8IGZpbGUuZXJyb3IoKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBfb2JqID0ge307XHJcbiAgICAgICAgICAgICAgICBfb2JqWydGaWxlVXJpJ10gPSBmaWxlLnBhdGgoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZS5hdHRhY2hlZEZpbGUuYXR0YWNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBfb2JqWydEYXRhRmlsZVVyaSddID0gZmlsZS5hdHRhY2hlZEZpbGUucGF0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKF9vYmopO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZmlsZXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmV4dCgnZ2V0QXJyYXlGaWxlc1N0cmluZycsIGZ1bmN0aW9uIChoYXNfc2hvd19lcnJvcikge1xyXG4gICAgICAgICAgICBoYXNfc2hvd19lcnJvciA9IGhhc19zaG93X2Vycm9yIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9vbC5maWxlcy5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGZpbGUuaXNIYWRlKCkgPT09IHRydWUgfHwgZmlsZS5lcnJvcigpID09PSB0cnVlKSAmJiBoYXNfc2hvd19lcnJvciA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZS5wYXRoKCkpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsZXM7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCf0L7QuNGB0Log0YTQsNC50LvQsCDQv9C+INC40LzQtdC90LhcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmV4dCgnc2VhcmNoRmlsZScsIGZ1bmN0aW9uIChwYXRoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCwgZmlsZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9vbC5maWxlcy5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChfZiwgX2kpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfZi5wYXRoKCkgPT09IHBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IF9pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGUgPSB0aGlzLnBvb2wuZmlsZXNbX2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgZmlsZTogZmlsZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCf0LXRgNC10LHQvtGAINGE0LDQudC70L7QslxyXG4gICAgICAgICAqIHNvcnQgLSDQmtCw0LrQuNC1INGE0LDQudC70Ysg0L7RgtC00LDRgtGMIGVycm9yfGhpZGV8cmVhZHl8YWxsXHJcbiAgICAgICAgICogKNCy0L7Qt9C80L7QttC90L4g0LrQvtC80LHQuNC90LjRgNC+0LLQsNGC0YwsINGC0LjQv9CwOiBAaGlkZSxyZWFkeUApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5leHQoJ2ZpbGVFYWNoJywgZnVuY3Rpb24gKGNhbGwsIHNvcnQpIHtcclxuICAgICAgICAgICAgY2FsbCA9IGNhbGwgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzb3J0ID0gc29ydCB8fCAnYWxsJztcclxuXHJcbiAgICAgICAgICAgIHZhciBfX2NhbGwgPSBkZWxlZ2F0ZShmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGNhbGwuYXBwbHkobnVsbCwgW3RoaXMucG9vbC5maWxlc1tpbmRleF1dKTtcclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvb2wuZmlsZXMuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0LmluZGV4T2YoJ2Vycm9yJykgIT09IC0xICYmIGZpbGUuZXJyb3IoKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9fY2FsbChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnQuaW5kZXhPZignaGlkZScpICE9PSAtMSAmJiBmaWxlLmlzSGFkZSgpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX19jYWxsKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydC5pbmRleE9mKCdyZWFkeScpICE9PSAtMSAmJiAoIWZpbGUuZXJyb3IoKSAmJiAhZmlsZS5pc0hhZGUoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBfX2NhbGwoaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0ID09PSAnYWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIF9fY2FsbChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5leHQoJ2Vycm9yTWFzdGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYW4uJCgnZGl2W2Vycm9yXScpLnNob3coKTtcclxuICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXh0KCdsb2FkZXInLCBmdW5jdGlvbiAoc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgY2FuLiQoJ2Rpdltsb2FkZXJdJykuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2FuLiQoJ2Rpdltsb2FkZXJdJykuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY3JvbGwoMTAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0J7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40Lkg0L7QutC90LAg0LLRi9Cx0L7RgNCwINGD0LbQtSDQt9Cw0LPRgNGD0LbQtdC90L3Ri9GFINGE0LDQudC70L7Qsi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmV4dCgnT3BlbkZpbGVzRXZlbnRIYW5kbGVyJywgZnVuY3Rpb24gKG5hbWUsIHBhcmFtcykge1xyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2Nsb3NlJykge1xyXG4gICAgICAgICAgICAgICAgY2FuLnRyaWdnZXIod2luZG93LCAnd2luZG93X29wZW5fZmlsZXNfY2xvc2UnLCBbXSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnYWRkRmlsZScpIHtcclxuICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ3NlbGVjdF9maWxlcycsIFtwYXJhbXMua2V5LCBwYXJhbXMuZmlsZXNdKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdjaGFuZ2VUaXRsZScpIHtcclxuICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ2NoYW5nZV90aXRsZScsIFtwYXJhbXMua2V5LCBwYXJhbXMudGl0bGVdKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmV4dCgnb25Mb2FkTWVzc2FnZScsIGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWFzdGVyLmRlYnVnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAn0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDQvtCx0L3QvtCy0LjRgtGMINGB0YLRgNCw0L3QuNGG0YM/INCS0YHQtSDQvdC1INGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QvtGC0LXRgNGP0L3RiyEg0J/RgNC+0LTQvtC70LbQuNGC0Yw/JztcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlsb2dnZXIoKTtcclxuXHJcbiAgICAgICAgLypzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICBNYXN0ZXIub25Mb2FkTWVzc2FnZSh0cnVlKTtcclxuICAgICAgICAgfSwgMjAwMCk7Ki9cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQotC+0YfQutCwINCy0YXQvtC00LBcclxuICAgICAqL1xyXG4gICAgcnVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0JfQsNC/0YDQvtGBINC70LjRh9C90YvRhSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LJcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNjb3BlLnJlcS5iZWdpbignZmluZF9teV9jZXJ0aWZpY2F0ZScsIHt9LCBkZWxlZ2F0ZShmdW5jdGlvbiAocmVxKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXEuc3RhdHVzID09PSAnZXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCfQktC+0LfQvdC40LrQu9CwINC+0YjQuNCx0LrQsCDQv9GA0Lgg0LfQsNCz0YDRg9C30LrQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70YzRgdC60LjRhSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LInLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FuLmVhY2gocmVxLmRhdGEubW9kZWwsIGRlbGVnYXRlKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wuYWxsTXlDZXJ0aWZpY2F0ZS5wdXNoKGMpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GM0YHQutC40LUg0YHQtdGA0YLQuNGE0LjQutCw0YLRiyDQt9Cw0LPRgNGD0LbQtdC90Ysg0LAg0LrQvtC70LvQuNGH0LXRgdGC0LLQtSAlY291bnQg0YjRgtGD0LonLCB7XHJcbiAgICAgICAgICAgICAgICAnJWNvdW50JzogdGhpcy5zY29wZS5wb29sLmFsbE15Q2VydGlmaWNhdGUubGVuZ3RoXHJcbiAgICAgICAgICAgIH1dKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMucnVuTG9hZEZpbGVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcGUubGF5b3V0ID0gbmV3IExheW91dCh0aGlzLnNjb3BlLnBvb2wuc2V0dGluZ3MubG9hZC50YWcsIHtcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29wZS5pc0xvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCh0L7QsdGL0YLQuNC1OiDQn9GA0LjQu9C+0LbQtdC90LjQtSDQt9Cw0LPRgNGD0LbQtdC90L4g0Lgg0LjQvdC40LDQu9C40LfQuNGA0L7QstCw0L3QvdC+LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ2FwcFJ1bicsIFt0aGlzLnNjb3BlXSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/QtdGA0LXQstC+0LQg0YDQtdC20LjQvNCwINGA0LDQsdC+0YLRiyDQvNCw0YHRgtC10YDQsCDQsiDQt9Cw0LTQsNC90L3QvtC1INGBINCz0LvQsNCy0L3QvtC5INGB0YLRgNCw0L3QuNGG0YsuXHJcbiAgICAgKi9cclxuICAgIHJ1bkxvYWRGaWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpbml0ID0gdGhpcy5zY29wZS5wb29sLnNldHRpbmdzLmxvYWQuaW5pdGlhbGl6ZTtcclxuXHJcblxyXG4gICAgICAgIGlmIChpbml0LmZpbGVzLmxlbmd0aCA9PT0gMCAmJiBpbml0LnR5cGUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FuLmVhY2goaW5pdC5maWxlcywgZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuYWRkRmlsZShmaWxlLnBhdGgsIGZpbGUubGFzdENoYW5nZSwge1xyXG4gICAgICAgICAgICAgICAgcmVhZHk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhdHRhY2hlZDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgYWN0aW9ucyA9IHtcclxuICAgICAgICAgICAgRW5jcnlwdDogJ2VuY3J5cHQnLFxyXG4gICAgICAgICAgICBTaWduRW5jcnlwdDogJ3N1YnNjcmliZV9hbmRfZW5jcnlwdCcsXHJcbiAgICAgICAgICAgIFNpZ246ICdzdWJzY3JpYmUnLFxyXG4gICAgICAgICAgICBTaWduVmVyaWZ5OiAnY2hlY2tfc2lnbmF0dXJlJyxcclxuICAgICAgICAgICAgRGVjcnlwdDogJ2RlY2lwaGVyJyxcclxuICAgICAgICAgICAgRGVjcnlwdFNpZ252ZXJpZnk6ICdkZWNpcGhlcl9jaGVja19zaWduYXR1cmUnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY2FuLmJpbmQuY2FsbCh3aW5kb3csICdhcHBSdW4nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUubGF5b3V0Lm1haW4uYWN0aW9uUnVuKGFjdGlvbnNbaW5pdC50eXBlXSwge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0QWN0aW9uT25seTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0L3QsNGB0YLRgNC+0LXQulxyXG4gICAgICogQHBhcmFtIG9ialxyXG4gICAgICovXHJcbiAgICBsb2FkU2V0dGluZ3M6IGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgICBjYW4uZWFjaChvYmosIGRlbGVnYXRlKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUucG9vbC5zZXR0aW5ncy5sb2FkLmF0dHIoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQodC+0LHRi9GC0LjQtTog0J3QsNGB0YLRgNC+0LnQutC4INC40L3QuNGG0LjQsNC70LjQt9C40YDQvtCy0LDQvdC90YsuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2FuLnRyaWdnZXIodGhpcy5zY29wZSwgJ3NldHRpbmdzX2xvYWRlZCcsIFt0aGlzLnNjb3BlXSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/QvtC40YHQuiDQt9Cw0LPRgNGD0LbQtdC90L3QvtCz0L4g0YTQsNC50LvQsCDQv9C+INC10LPQviBJRFxyXG4gICAgICogQHBhcmFtIGlkXHJcbiAgICAgKiBAcmV0dXJucyB7e2ZpbGU6ICosIGluZGV4OiAqfX1cclxuICAgICAqL1xyXG4gICAgZmlsZVNlYXJjaDogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgdmFyIF9maWxlID0gbnVsbCxcclxuICAgICAgICAgICAgX2luZGV4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuZWFjaChmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKGZpbGUuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICBfZmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICBfaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBmaWxlOiBfZmlsZSxcclxuICAgICAgICAgICAgaW5kZXg6IF9pbmRleFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0K3RgtC+0YIg0LzQtdGC0L7QtCDQstGL0LfRi9Cy0LDQtdGC0YHRjyDQsiDQsiDQtNC10LHQsNCzINGA0LXQttC40LzQtVxyXG4gICAgICog0L/QvtGB0LvQtSDQv9C+0LvQvdC+0Lkg0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40Lgg0LzQsNGB0YLQtdGA0LAuXHJcbiAgICAgKi9cclxuICAgIHJ1bkRlYnVnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLyp0aGlzLnNjb3BlLmFkZEZpbGUoJ9CX0LDQs9GA0YPQttC10L3QvdGL0LUvTW9ub3NuYXAubXNpJywgbmV3IERhdGUoKSwge1xyXG4gICAgICAgICByZWFkeTogdHJ1ZSxcclxuICAgICAgICAgYXR0YWNoZWQ6IGZhbHNlXHJcbiAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgdGhpcy5zY29wZS5hZGRGaWxlKCfQl9Cw0LPRgNGD0LbQtdC90L3Ri9C1L0xXQVBsdWdpbjY0Qml0SW5zdGFsbGVyMzIubXNpJywgbmV3IERhdGUoKSwge1xyXG4gICAgICAgICByZWFkeTogdHJ1ZSxcclxuICAgICAgICAgYXR0YWNoZWQ6IGZhbHNlXHJcbiAgICAgICAgIH0pOyovXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KDQtdCz0LjRgdGC0YDQsNGG0LjRjyDQvtCx0YDQsNCx0L7RgtGH0LjQutC+0LIg0L3QsNC20LDRgtC40Y8g0LrQu9Cw0LLQuNGILlxyXG4gICAgICovXHJcbiAgICBrZXlsb2dnZXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlwcmVzcy5zaW1wbGVfY29tYm8oJ2YgdCcsIGRlbGVnYXRlKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuYWRkRmlsZSgn0JfQsNCz0YDRg9C20LXQvdC90YvQtS9GYXN0U2NyZWVuX1NldHVwLmV4ZScsIG5ldyBEYXRlKCksIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNoZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5hZGRGaWxlKCfQl9Cw0LPRgNGD0LbQtdC90L3Ri9C1L01vbm9zbmFwLm1zaScsIG5ldyBEYXRlKCksIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNoZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlwcmVzcy5zaW1wbGVfY29tYm8oJ2YgYycsIGRlbGVnYXRlKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNsZWFyTGlzdCh0aGlzLnNjb3BlLnBvb2wuZmlsZXMpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlwcmVzcy5zaW1wbGVfY29tYm8oJ2wgbyBzIHQnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBjYW4uJCgnYm9keScpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmVkJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMua2V5cHJlc3Muc2ltcGxlX2NvbWJvKCdpIHYnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0LXRgNGB0LjRjyDRgdC40YHRgtC10LzRiycsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQoJzxiPtCS0LXRgNGB0LjRjzo8L2I+Jm5ic3A7Jm5ic3A7JW51bWJlcjxiciAvPjxiPtCU0LDRgtCwOjwvYj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDslZGF0ZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAnJW51bWJlcic6IHRoaXMuc2NvcGUuVmVyc2lvbi5udW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgJyVkYXRlJzogdGhpcy5zY29wZS5WZXJzaW9uLmRhdGVcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgJ2luZm8nLCBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn0JTQsCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQoNC10LPQuNGB0YLRgNCw0YbQuNGPINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjNGB0LrQuNGFINC80LXRgtC+0LTQvtCyXHJcbiAgICAgKiDQstC90YPRgtGA0Lgg0Y/QtNGA0LAuXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDQmNC80Y8g0LzQtdGC0L7QtNCwXHJcbiAgICAgKiBAcGFyYW0gY2FsbCDQktGL0LfRi9Cy0LDQtdC80LDRjyDRhNGD0L3QutGG0LjRjyAo0LfQsNC80YvQutCw0L3QuNC1KVxyXG4gICAgICovXHJcbiAgICBleHQ6IGZ1bmN0aW9uIChuYW1lLCBjYWxsKSB7XHJcbiAgICAgICAgY2FsbCA9IGNhbGwgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcGVbbmFtZV0gPSBkZWxlZ2F0ZShjYWxsLCB0aGlzLnNjb3BlKTtcclxuICAgIH1cclxufSk7IiwidmFyIFJlcXVlc3QgPSBjYW4uQ29uc3RydWN0KCdDb3JlLlJlcXVlc3QnLCB7XHJcbiAgICBzY29wZTogbnVsbCxcclxuXHJcbiAgICBkZW1hbmRzOiBudWxsLFxyXG5cclxuICAgIG5hbWU6IG51bGwsXHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5zY29wZSA9IHNjb3BlO1xyXG5cclxuICAgICAgICB0aGlzLmRlbWFuZHMgPSBuZXcgY2FuLk1hcCh7fSk7XHJcblxyXG4gICAgICAgIHRoaXMuX19hZGREZW1hbmRzKCk7XHJcblxyXG4gICAgICAgIG5ldyBMb2dnZXIoWyfQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDRgdC10YDQstC40YHQsCDQt9Cw0L/RgNC+0YHQvtCyLi4uICVjb3VudCDQt9Cw0L/RgNC+0YHQvtCyINC00L7QsdCw0LLQu9C10L3QvicsIHtcclxuICAgICAgICAgICAgJyVjb3VudCc6IHRoaXMuc2NvcGUuY291bnRNYXAodGhpcy5kZW1hbmRzKVxyXG4gICAgICAgIH1dKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQl9Cw0L/RgNC+0YFcclxuICAgICAqIEBwYXJhbSBuYW1lINCd0LDQt9Cy0LDQvdC40LUg0LfQsNC/0YDQvtGB0LBcclxuICAgICAqIEBwYXJhbSBwYXJhbXMg0J/QsNGA0LDQvNC10YLRgNGLXHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgYmVnaW46IGZ1bmN0aW9uIChuYW1lLCBwYXJhbXMsIGZuLCBzY29wZSkge1xyXG4gICAgICAgIGZuID0gZm4gfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBhamF4T2JqID0gbnVsbDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHJlcSA9IHRoaXMuZGVtYW5kcy5hdHRyKG5hbWUpLFxyXG4gICAgICAgICAgICAgICAgcmVwbHkgPSBmdW5jdGlvbiAoc3RhdHVzLCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnYWJvcnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBMb2dnZXIoZm9ybWF0KCfQn9GA0L7QuNC30L7RiNC70LAg0L7RgtC80LXQvdCwINC30LDQv9GA0L7RgdCwICVuYW1lJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyVuYW1lJzogbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmcuZGF0YVsnc3RhdHVzJ10gIT09IHVuZGVmaW5lZCAmJiBhcmcuZGF0YVsnc3RhdHVzJ10gPT09ICdFcnJvcicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZy5kYXRhWydlcnJvckNvZGUnXSAhPT0gdW5kZWZpbmVkICYmIGFyZy5kYXRhWydlcnJvckNvZGUnXSA9PT0gJzQwMScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGVydCA9IE1hc3Rlci5sYXlvdXQubWVzc2FnZSgn0JLQvdC40LzQsNC90LjQtSEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfQktCw0YjQsCDRgdC10YHRgdC40Y8g0LjRgdGC0LXQutC70LAsINC90LXQvtCx0YXQvtC00LjQvNC+INCw0LLRgtC+0YDQuNC30L7QstCw0YLRjNGB0Y8uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXJyb3InLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQlNCwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmcuc3RhdHVzID09PSAncGFyc2VyZXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGVydCA9IE1hc3Rlci5sYXlvdXQubWVzc2FnZSgn0J7RiNC40LHQutCwINC80LDRgdGC0LXRgNCwIScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQoJ9CSINC/0YDQvtGG0LXRgdGB0LUg0L7QsdGA0LDQsdC+0YLQutC4INC30LDQv9GA0L7RgdCwINC/0YDQvtC40LfQvtGI0LvQsCDQvdC10L/RgNC10LTQstC40LTQtdC90L3QsNGPINC+0YjQuNCx0LrQsC4nLCB7fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2FybmluZycsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQl9Cw0LrRgNGL0YLRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHNjb3BlIHx8IHRoaXMuc2NvcGUsIFthcmddKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAocmVxID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG5ldyBMb2dnZXIoWyfQntGI0LjQsdC60LAg0LIg0LfQsNC/0YDQvtGB0LUuINCQ0LTRgNC10YHQsCBcIiVhZGRyZXNzXCIg0L3QtSAg0YHRg9GJ0LXRgdGC0LLRg9C10YInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgJyVhZGRyZXNzJzogbmFtZVxyXG4gICAgICAgICAgICAgICAgfV0sICdlcnJvcicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcS5ydWxlID09PSAnZnVuY3Rpb24nICYmIHJlcS5ydWxlLmFwcGx5KHRoaXMsIFtwYXJhbXMsIHRoaXMuc2NvcGVdKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhamF4T2JqID0gY2FuLiQuYWpheChjYW4uZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiByZXEubWV0aG9kIHx8ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogcmVxLnVybCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjYW4uZXh0ZW5kKHBhcmFtcywgKChyZXEucGFyYW1zKSA/IHJlcS5wYXJhbXMuc2VyaWFsaXplKCkgOiB7fSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiByZXEudHlwZSB8fCAnanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMgfHwge30sXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LCAoKHJlcS5hamF4UGFyYW0pID8gcmVxLmFqYXhQYXJhbSA6IHt9KSkpXHJcbiAgICAgICAgICAgICAgICAuZG9uZShkZWxlZ2F0ZShmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5KGIsIGEpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpXHJcbiAgICAgICAgICAgICAgICAuZmFpbChkZWxlZ2F0ZShmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5KGIsIGEpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQstGL0L/QvtC70L3QtdC90LjQuCDQt9Cw0L/RgNC+0YHQsCDQvdCwINGB0LXRgNCy0LXRgC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWpheE9iajtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQlNC+0LHQsNCy0LvQtdC90LjQtSDQvdC+0LLQvtC5INC30LDQv9C40YHQuCDQt9Cw0L/RgNC+0YHQsFxyXG4gICAgICogQHBhcmFtIG5hbWUg0JjQvNGPINC30LDQv9GA0L7RgdCwXHJcbiAgICAgKiBAcGFyYW0gcGFyYW1zINCf0LDRgNCw0LzQtdGC0YDRiyDQt9Cw0L/RgNC+0YHQsFxyXG4gICAgICogQHBhcmFtIHJld3JpdGUg0J/QtdGA0LXQt9Cw0L/QuNGB0LDRgtGMICjRhNC70LDQsylcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSDQo9GB0L/QtdGFINC+0L/QtdGA0LDRhtC40LhcclxuICAgICAqL1xyXG4gICAgYWRkOiBmdW5jdGlvbiAobmFtZSwgcGFyYW1zLCByZXdyaXRlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVtYW5kcy5hdHRyKG5hbWUpICE9PSB1bmRlZmluZWQgJiYgcmV3cml0ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0J7RiNC40LHQutCwINC00L7QsdCw0LLQu9C10L3QuNGPINC30LDQv9GA0L7RgdCwLiDQmNC80Y8gXCIlbmFtZVwiINGD0LbQtSDRgdGD0YnQtdGB0YLQstGD0LXRgi4nLCB7XHJcbiAgICAgICAgICAgICAgICAnJW5hbWUnOiBuYW1lXHJcbiAgICAgICAgICAgIH1dLCAnZXJyb3InKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLnVybCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbmV3IExvZ2dlcign0J7RiNC40LHQutCwINC00L7QsdCw0LLQu9C10L3QuNGPINC30LDQv9GA0L7RgdCwLiDQkiDQt9Cw0L/QuNGB0Lgg0L3QtSDQvdCw0LnQtNC10L0gVVJMJywgJ2Vycm9yJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlbWFuZHMuYXR0cihuYW1lLCBwYXJhbXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgX19hZGREZW1hbmRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5hZGQoJ3VzZXJfcHJvZmlsZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9HZXRVc2VyUHJvZmlsZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQoJ2NlcnRpZmljYXRlX2luZm8nLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9NYXN0ZXIvR2V0Q2VydGlmaWNhdGVzSW5mbycsXHJcbiAgICAgICAgICAgIGFqYXhQYXJhbToge1xyXG4gICAgICAgICAgICAgICAgdHJhZGl0aW9uYWw6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCgnZmluZF9teV9jZXJ0aWZpY2F0ZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9HZXRNeUNlcnRpZmljYXRlcydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQoJ2ZpbmRfYWxsX2NlcnRpZmljYXRlJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvTWFzdGVyL0ZpbmRDZXJ0aWZpY2F0ZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQoJ21ha2Vfb3BlcmF0aW9uJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvTWFzdGVyL01ha2VPcGVyYXRpb24nLFxyXG4gICAgICAgICAgICBhamF4UGFyYW06IHtcclxuICAgICAgICAgICAgICAgIHRyYWRpdGlvbmFsOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkKCdmaWxlX2RlbGV0ZScsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9EZWxldGVGaWxlJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCgnY2hlY2tfc2lnbmVkX2ZpbGVfc2V0YWNtZW50Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvTWFzdGVyL0NoZWNrU2lnbmVkRmlsZXNBdGFjaG1lbnQnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCgnZ2V0X215X2NlcnRpZmljYXRlcycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9HZXRNeUNlcnRpZmljYXRlcydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQoJ2dldF9kZWNyeXB0X2NlcnRpZmljYXRlcycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9HZXREZWNyeXB0Q2VydGlmaWNhdGVzJyxcclxuICAgICAgICAgICAgYWpheFBhcmFtOiB7XHJcbiAgICAgICAgICAgICAgICB0cmFkaXRpb25hbDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCgnc2V0X3RlbXBsYXRlX2FzX2RlZmF1bHQnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9NYXN0ZXIvU2V0VGVtcGxhdGVBc0RlZmF1bHQnLFxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog0JHQuNC30L3QtdGBINC/0YDQsNCy0LjQu9C+XHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBwYXJhbSDQktGF0L7QtNGP0YnQuNC1INC/0LDRgNCw0LzQtdGC0YDRiyDQt9Cw0L/RgNC+0YHQsFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gc2NvcGUg0KHQutC+0L8g0LzQsNGB0YLQtdGA0LBcclxuICAgICAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59INCg0LXQt9GD0LvRjNGC0LDRgiDQv9GA0L7QtNC+0LvQttC10L3QuNGPINGA0LDQsdC+0YLRi1xyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgcnVsZTogZnVuY3Rpb24gKHBhcmFtLCBzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtLnRlbXBsYXRlSWQgPT09ICcwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCgnZ2V0X3BpbicsIHtcclxuICAgICAgICAgICAgdXJsOiAnL01hc3Rlci9OZWVkVG9QSU4nLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTsiLCJ2YXIgTGF5b3V0ID0gY2FuLkNvbnRyb2woe1xyXG4gICAgc2NvcGU6IG51bGwsXHJcbiAgICBjb250YWluZXI6IG51bGwsXHJcblxyXG4gICAgb3BlbkZpbGVzOiBudWxsLFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xyXG5cclxuICAgICAgICB0aGlzLnRwTG9jayA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gY2FuLnZpZXcoJy9Bc3NldHMvdmlld3MvbWFzdGVyL2xheW91dC5oYnMnLCB7XHJcbiAgICAgICAgICAgICAgICB0cGxvY2s6IHRoaXMudHBMb2NrLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzLml0ZW1zLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHRoaXMuc2NvcGUucG9vbC50ZW1wbGF0ZXMuY3VycmVudFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlzQWRtaW46IHRoaXMuc2NvcGUucG9vbC5zZXR0aW5ncy5sb2FkLnVzZXIuaXNBZG1pbixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZV9jbGljazogZGVsZWdhdGUoZnVuY3Rpb24gKHRlbXBsYXRlLCBlbCwgZXYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0JLRi9Cx0YDQsNC9INC/0YDQvtGE0LjQu9GMOiAldGVtcGxhdGUnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyV0ZW1wbGF0ZSc6IHRlbXBsYXRlLk5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5pc0xvYWRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUucG9vbC5rZXlzLmF0dHIoJ3Byb2ZpbGVfbG9hZF9pZCcsIHRoaXMuc2NvcGUuaXByb2Nlc3MuYWRkKGZvcm1hdCgn0KPRgdGC0LDQvdCw0LLQu9C40LLQsNC10YLRgdGPINC/0YDQvtGE0LjQu9GMIMKrJXRlbXBsYXRlwrsuLi4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcldGVtcGxhdGUnOiB0ZW1wbGF0ZS5OYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUucG9vbC50ZW1wbGF0ZXMuY2hhbmdlQ3VycmVudCh0ZW1wbGF0ZS5JRCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYW4uJC5pbkFycmF5KHRoaXMubWFpbi5hY3Rpb25WYWx1ZSgpLCBbJ3N1YnNjcmliZScsICdlbmNyeXB0JywgJ3N1YnNjcmliZV9hbmRfZW5jcnlwdCddKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ29uZmlybSgn0J/RgNC4INGB0LzQtdC90LUg0YjQsNCx0LvQvtC90LAg0LLRgdC1INCy0L3QtdGB0LXQvdC90YvQtSDQuNC30LzQtdC90LXQvdC40Y8g0LHRg9C00YPRgiDQv9C+0YLQtdGA0Y/QvdGLLiDQktGLINGD0LLQtdGA0LXQvdGLLCDRh9GC0L4g0YXQvtGC0LjRgtC1INGB0LzQtdC90LjRgtGMINGI0LDQsdC70L7QvT8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dC5hcHBseSh0aGlzLCBbXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0LmFwcGx5KHRoaXMsIFtdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgbXlQcm9maWxlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLnJlc3VsdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvRGVmYXVsdC9NeVByb2ZpbGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0L/QvtC60LjQvdGD0YLRjCDQvNCw0YHRgtC10YA/INCS0YHQtSDQvdC1INGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QvtGC0LXRgNGP0L3RiyEnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvRGVmYXVsdC9NeVByb2ZpbGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSAsXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzc0Jvb2s6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUucmVzdWx0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9BZGRyZXNzQm9vayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ29uZmlybSgn0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDQv9C+0LrQuNC90YPRgtGMINC80LDRgdGC0LXRgD8g0JLRgdC1INC90LUg0YHQvtGF0YDQsNC90LXQvdC90YvQtSDQtNCw0L3QvdGL0LUg0LHRg9C00YPRgiDQv9C+0YLQtdGA0Y/QvdGLIScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9BZGRyZXNzQm9vayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLnJlc3VsdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvU2V0dGluZ3MnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0L/QvtC60LjQvdGD0YLRjCDQvNCw0YHRgtC10YA/INCS0YHQtSDQvdC1INGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QvtGC0LXRgNGP0L3RiyEnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvU2V0dGluZ3MnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBhZG1pbmlzdHJhdGlvbjogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5yZXN1bHQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL0FkbWluaXN0cmF0aW9uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDb25maXJtKCfQktGLINGD0LLQtdGA0LXQvdGLLCDRh9GC0L4g0YXQvtGC0LjRgtC1INC/0L7QutC40L3Rg9GC0Ywg0LzQsNGB0YLQtdGAPyDQktGB0LUg0L3QtSDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtSDQsdGD0LTRg9GCINC/0L7RgtC10YDRj9C90YshJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL0FkbWluaXN0cmF0aW9uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwb29sOiB0aGlzLnNjb3BlLnBvb2wsXHJcbiAgICAgICAgICAgICAgICBleGl0X2FwcDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLnJlc3VsdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9EZWZhdWx0L1dlYkRhdkJyb3dzZXInO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0L/QvtC60LjQvdGD0YLRjCDQvNCw0YHRgtC10YA/INCS0YHQtSDQvdC1INGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QvtGC0LXRgNGP0L3RiyEnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9EZWZhdWx0L1dlYkRhdkJyb3dzZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICBiYWNrRmlsZXM6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5yZXN1bHQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvRGVmYXVsdC9XZWJEYXZCcm93c2VyJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VDb25maXJtKCfQktGLINGD0LLQtdGA0LXQvdGLLCDRh9GC0L4g0YXQvtGC0LjRgtC1INC/0L7QutC40L3Rg9GC0Ywg0LzQsNGB0YLQtdGAPyDQktGB0LUg0L3QtSDRgdC+0YXRgNCw0L3QtdC90L3Ri9C1INC00LDQvdC90YvQtSDQsdGD0LTRg9GCINC/0L7RgtC10YDRj9C90YshJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvRGVmYXVsdC9XZWJEYXZCcm93c2VyJztcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5jdXJyZW50LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCh2aWV3KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gZWwuZmluZCgnZGl2W2FwcF0nKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWFpbiA9IG5ldyBNYWluKHRoaXMuY29udGFpbmVyLCB7XHJcbiAgICAgICAgICAgICAgICBzY29wZTogdGhpcy5zY29wZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBMb2dnZXIoJ0xheW91dCDQt9Cw0LPRgNGD0LbQtdC9Jyk7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog0KHQutGA0YvQstCw0LXQvCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0LpcclxuICAgICAgICAgICAgICog0YEg0L/RgNC+0YTQuNC70Y/QvNC4INC/0L4g0LrQu9C40LrRgyDQvdCwXHJcbiAgICAgICAgICAgICAqINC/0YPRgdGC0L7QvCDQvNC10YHRgtC1INCyINC70Y7QsdC+0Lkg0YfQsNGB0YLQuCDRgdGC0YDQsNC90LjRhtGLLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgY2FuLiQoJ2JvZHknKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZHJvcGRvd24tbWVudS5wcm9maWxlJykuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0L7RgtGA0LjRgdC+0LLQutC1INGB0YLRgNCw0L3QuNGG0YsuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQntGC0L7QsdGA0L7QttCw0LXRgiDQvNC+0LTQsNC70YzQvdC+0LUg0L7QutC90L5cclxuICAgICAqIEBwYXJhbSB0aXRsZSDQl9Cw0LPQvtC70L7QstC+0LpcclxuICAgICAqIEBwYXJhbSBjb250ZW50INCd0LDQv9C+0LvQvdC10L3QuNC1INGE0L7RgNC80LDRgtCwOlxyXG4gICAgICoge1xyXG4gICAgICogICAgICB0eXBlfFN0cmluZzogW3RleHR8cGF0aF0sXHJcbiAgICAgKiAgICAgIHBhdGh8U3RyaW5nOiAnJyxcclxuICAgICAqICAgICAgcGFyYW1zfFN0cmluZzogJydcclxuICAgICAqIH1cclxuICAgICAqIEBwYXJhbSB0eXBlINCi0LjQvyDQvtC60L3QsFxyXG4gICAgICogQHJldHVybnMge3tzZXRUaXRsZTogc2V0VGl0bGUsIHJlbW92ZTogcmVtb3ZlfX1cclxuICAgICAqL1xyXG4gICAgbW9kYWw6IGZ1bmN0aW9uICh0aXRsZSwgY29udGVudCwgdHlwZSwgc2VhcmNoTGluZSkge1xyXG5cclxuICAgICAgICB2YXIgbW9kYWxPYmogPSBudWxsLCBleGl0Rm5DYWxsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHR5cGUgPSB0eXBlIHx8ICdib3gnO1xyXG4gICAgICAgIHZhciBfc2VhcmNoTGluZSA9IChzZWFyY2hMaW5lID09PSB1bmRlZmluZWQpID8gZmFsc2UgOiB0cnVlLFxyXG4gICAgICAgICAgICBfY29udGVudCA9ICcnLFxyXG4gICAgICAgICAgICBfdGl0bGUgPSBuZXcgY2FuLmNvbXB1dGUodGl0bGUpLFxyXG4gICAgICAgICAgICBfc2VhcmNoVmFsdWUgPSBuZXcgY2FuLmNvbXB1dGUoJycpLFxyXG4gICAgICAgICAgICBfbG9hZGluZyA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSksXHJcbiAgICAgICAgICAgIHNlYXJjaExpbmUgPSBzZWFyY2hMaW5lIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKGNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAoY29udGVudC50eXBlID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgIF9jb250ZW50ID0gY29udGVudC5ib2R5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb250ZW50LnR5cGUgPT09ICdwYXRoJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIF9wYXJhbXMgPSBjYW4uZXh0ZW5kKGNvbnRlbnQucGFyYW1zLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoVmFsdWU6IF9zZWFyY2hWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfY29udGVudCA9IGNhbi52aWV3LnJlbmRlcignL1NjcmlwdHMvbWFzdGVyL3ZpZXcvbW9kYWxzLycgKyBjb250ZW50LnBhdGgsIF9wYXJhbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbW9kYWwgPSBjYW4udmlldygnL0Fzc2V0cy92aWV3cy9tYXN0ZXIvbW9kYWwuaGJzJywge1xyXG4gICAgICAgICAgICB0aXRsZTogX3RpdGxlLFxyXG4gICAgICAgICAgICBjb250ZW50OiBfY29udGVudCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgc2VhcmNoTGluZTogX3NlYXJjaExpbmUsXHJcbiAgICAgICAgICAgIHNlYXJjaFZhbHVlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsLCBldikge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoTGluZS5hcHBseSh0aGlzLCBbZWwudmFsKCldKTtcclxuICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgIGxvYWRpbmc6IF9sb2FkaW5nXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBjbG9zZTogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsT2JqID0gJChlbCkucGFyZW50KCkucGFyZW50KCkucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuY2xpY2soZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGl0Rm5DYWxsLmFwcGx5KHRoaXMsIFtdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxPYmoucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQobW9kYWwpO1xyXG5cclxuICAgICAgICAkKCcjbW9kYWwgLndpbmRvdycpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgfSwgJ2Zhc3QnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqINCj0YHRgtCw0L3QvtCy0LrQsCDQt9Cw0LPQvtC70L7QstC60LBcclxuICAgICAgICAgICAgICogQHBhcmFtIHRpdGxlXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzZXRUaXRsZTogZnVuY3Rpb24gKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICBfdGl0bGUodGl0bGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog0JfQsNC60YDRi9GC0LjQtSDQvNC+0LTQsNC70YzQvdC+0LPQviDQvtC60L3QsFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RhbE9iai5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqINCj0YHRgtCw0L3QvtCy0LrQsCDQuCDRgdC90Y/RgtC40LUg0LvQvtCw0LTQtdGA0LBcclxuICAgICAgICAgICAgICogQHBhcmFtIHRpdGxlXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBsb2FkaW5nOiBmdW5jdGlvbiAodGl0bGUpIHtcclxuICAgICAgICAgICAgICAgIF9sb2FkaW5nKHRpdGxlKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG9uRXhpdDogZnVuY3Rpb24gKGNhbGwpIHtcclxuICAgICAgICAgICAgICAgIGV4aXRGbkNhbGwgPSBjYWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQktGL0LLQvtC00LjRgiDQvNC+0LTQsNC70YzQvdC+0LUg0YHQvtC+0LHRidC10L3QuNC1XHJcbiAgICAgKiBAcGFyYW0gdGl0bGUg0JfQsNCz0L7Qu9C+0LLQvtC6XHJcbiAgICAgKiBAcGFyYW0gdGV4dCDQotC10LrRgdGCINGB0L7QvtCx0YnQtdC90LjRj1xyXG4gICAgICogQHBhcmFtIGljb24g0JjQutC+0L3QutCwIFt3YXJuaW5nfGVycm9yXVxyXG4gICAgICogQHBhcmFtIGJ0bnMg0JrQvdC+0L/QutC4INGE0L7RgNC80LDRgtCwOlxyXG4gICAgICpcclxuICAgICAqIFtcclxuICAgICAqICAgICAge1xyXG4gICAgICogICAgICAgICAgLy8g0KLQtdC60YHRgiDQutC90L7Qv9C60LhcclxuICAgICAqICAgICAgICAgIHRleHQ6ICcnLFxyXG4gICAgICogICAgICAgICAgLy8g0JrQu9Cw0YHRgSDQutC90L7Qv9C60LhcclxuICAgICAqICAgICAgICAgIGNsczogJycsXHJcbiAgICAgKiAgICAgICAgICAvLyDQodC+0LHRi9GC0LjQtSDQutC70LjQutCwXHJcbiAgICAgKiAgICAgICAgICBjYWxsOiBmdW5jdGlvbigpe31cclxuICAgICAqICAgICAgfVxyXG4gICAgICogXVxyXG4gICAgICogQHJldHVybnMge3tzZXRUaXRsZTogc2V0VGl0bGUsIHJlbW92ZTogcmVtb3ZlfX1cclxuICAgICAqL1xyXG4gICAgbWVzc2FnZTogZnVuY3Rpb24gKHRpdGxlLCB0ZXh0LCBpY29uLCBidG5zKSB7XHJcbiAgICAgICAgdmFyIGJvZHksIG1vZGFsLCBleGl0Rm4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYm9keSA9IGNhbi52aWV3LnJlbmRlcignL0Fzc2V0cy92aWV3cy9tYXN0ZXIvbW9kYWxzL21lc3NhZ2UuaGJzJywge1xyXG4gICAgICAgICAgICBpY29uOiBpY29uLFxyXG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICAgICAgICBidG5zOiBidG5zXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vZGFsID0gdGhpcy5tb2RhbCh0aXRsZSwge1xyXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgIGJvZHk6IGJvZHlcclxuICAgICAgICB9LCAnYWxlcnQnKTtcclxuXHJcbiAgICAgICAgY2FuLmVhY2goYnRucywgZGVsZWdhdGUoZnVuY3Rpb24gKGJ0bikge1xyXG4gICAgICAgICAgICBpZiAoYnRuLmV4aXQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGV4aXRGbiA9IGJ0bi5jYWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICBtb2RhbC5vbkV4aXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleGl0Rm4uYXBwbHkodGhpcywgW10pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbW9kYWw7XHJcbiAgICB9LFxyXG5cclxuICAgICcuc2hvd190ZW1wbGF0ZSBjbGljayc6IGZ1bmN0aW9uIChlbCwgZXYpIHtcclxuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgJCgnLmRyb3Bkb3duLW1lbnUucHJvZmlsZScpLnRvZ2dsZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAnLmRyb3Bkb3duLW1lbnUucHJvZmlsZSBsaSBhIGNsaWNrJzogZnVuY3Rpb24gKGVsLCBldikge1xyXG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICAkKCcuZHJvcGRvd24tbWVudS5wcm9maWxlJykuaGlkZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCX0LDQsdC70L7QutC40YDQvtCy0LDRgtGMIC8g0YDQsNC30LHQu9C+0LrQuNGA0L7QstCw0YLRjCDQstGL0LHQvtGAINC/0YDQvtGE0LjQu9GPXHJcbiAgICAgKiBAcGFyYW0gaGFzTG9ja1xyXG4gICAgICovXHJcbiAgICB0ZW1wbGF0ZUxvY2s6IGZ1bmN0aW9uIChoYXNMb2NrKSB7XHJcbiAgICAgICAgdGhpcy50cExvY2soaGFzTG9jayA9PT0gdHJ1ZSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY2FuLmV4dGVuZChMYXlvdXQucHJvdG90eXBlLCBjYW4uZXZlbnQpOyIsInZhciBJbmZvcm1hdGlvblByb2Nlc3MgPSBjYW4uQ29uc3RydWN0KCdIZWxwZXJzLkluZm9ybWF0aW9uUHJvY2VzcycsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgdGhpcy5wcm9jZXNzID0gbmV3IGNhbi5NYXAuTGlzdCgpO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvY2VzcyA9IG5ldyBjYW4uY29tcHV0ZShudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb3VudFByb2Nlc3MgPSBuZXcgY2FuLmNvbXB1dGUoMCk7XHJcbiAgICAgICAgdGhpcy50aW1lID0gbmV3IGNhbi5jb21wdXRlKCcwMDowMCcpO1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2FwID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy52aXNpYmlsaXR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuX190aW1lSW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX190aW1lVGlja3MgPSAwO1xyXG5cclxuICAgICAgICB2YXIgdmlldyA9IGNhbi52aWV3KCcvQXNzZXRzL3ZpZXdzL21hc3Rlci9pbmZvcm1hdGlvbl9wcm9jZXNzLmhicycsIHtcclxuICAgICAgICAgICAgY3VycmVudDogdGhpcy5jdXJyZW50LFxyXG4gICAgICAgICAgICBjb3VudFByb2Nlc3M6IHRoaXMuY291bnRQcm9jZXNzLFxyXG4gICAgICAgICAgICBleGl0OiBkZWxlZ2F0ZSh0aGlzLmV4aXQsIHRoaXMpLFxyXG4gICAgICAgICAgICB0aW1lOiB0aGlzLnRpbWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY2FuLmJpbmQuY2FsbCh3aW5kb3csICdhcHBSdW4nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIHNjb3BlKSB7XHJcbiAgICAgICAgICAgICQoJ2RpdltpbmZvcm1hdGlvbl9wcm9jZXNzXScpLmFwcGVuZCh2aWV3KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9ICQoJ2RpdltpbmZvcm1hdGlvbl9wcm9jZXNzXSBkaXZbbWVzc2FnZV0nKTtcclxuICAgICAgICAgICAgdGhpcy5jYXAgPSAkKCdkaXZbaW5mb3JtYXRpb25fcHJvY2Vzc10gLmNhcCcpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYXAuaGlkZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgY2FuLmJpbmQuY2FsbCh3aW5kb3csICdwcm9jZXNzX2V4aXQnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIGlkKSB7XHJcbiAgICAgICAgICAgIHZhciBpdGVtSUQgPSBsaXN0T2JqU2VhcmNoKHRoaXMucHJvY2VzcywgJ0lEJywgaWQpO1xyXG4gICAgICAgICAgICBpZiAoY2FuLiQuaW5BcnJheShpdGVtSUQsIFtudWxsLCB1bmRlZmluZWRdKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NbaXRlbUlEXS5FeGl0Rm4uYXBwbHkodGhpcywgWzBdKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzcy5zcGxpY2UoaXRlbUlELCAxKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMucHJvY2Vzcy5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIGF0dHIsIGhvdywgbmV3VmFsLCBvbGRWYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fX3J1bigpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQktC90YPRgtGA0LXQvdC90LjQuSDQt9Cw0L/Rg9GB0LpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9fcnVuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnByb2Nlc3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMudmlzaWJpbGl0eSlcclxuICAgICAgICAgICAgICAgIHRoaXMuX19zaG93KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2hvd0ZuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UHJvY2Vzcyh0aGlzLnByb2Nlc3NbMF0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCh0aGlzLmN1cnJlbnRQcm9jZXNzKCkuTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fX2FuaW1hdGVNZXNzYWdlU2hvdygpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICog0JLQvtC30L3QuNC60LDQtdGCINC60L7Qs9C00LAg0LfQsNC/0YPRgdC60LDQtdGC0YHRjyDQv9GA0L7RhtC10YHRgS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgY2FuLnRyaWdnZXIod2luZG93LCAncHJvY2Vzc19ydW4nLCBbdGhpcy5wcm9jZXNzWzBdLklELCB0aGlzLnByb2Nlc3NbMF0uTmFtZV0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudCgpICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fX2FuaW1hdGVNZXNzYWdlSGlkZShzaG93Rm4pO1xyXG5cclxuICAgICAgICAgICAgc2hvd0ZuLmFwcGx5KHRoaXMsIFtdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQobnVsbCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFByb2Nlc3MobnVsbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmlsaXR5KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fX2hpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY291bnRQcm9jZXNzKHRoaXMucHJvY2Vzcy5sZW5ndGgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCU0L7QsdCw0LLQu9C10L3QuNGPINC30LDQtNCw0YfQuFxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBhZGQ6IGZ1bmN0aW9uIChuYW1lLCBjYWxsRXhpdCkge1xyXG4gICAgICAgIHZhciBJRCA9IGd1aWQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wcm9jZXNzLnB1c2goe1xyXG4gICAgICAgICAgICBJRDogSUQsXHJcbiAgICAgICAgICAgIE5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIEV4aXRGbjogY2FsbEV4aXQgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBJRDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQntGC0L7QsdGA0LDQttC10L3QuNC1INC90L7QstC+0LPQviDRgdC+0L7QsdGJ0LXQvdC40Y9cclxuICAgICAqIEBwYXJhbSB0ZXh0INCi0LXQutGB0YIg0YHQvtC+0LHRidC10L3QuNGPXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfX3Nob3dNZXNzYWdlOiBmdW5jdGlvbiAodGV4dCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQntGC0L7QsdGA0LDQttC10L3QuNC1INC/0LDQvdC10LvQuFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX19zaG93OiBmdW5jdGlvbiAoY2FsbCkge1xyXG4gICAgICAgIGNhbGwgPSBjYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgJCgnI2luZm9ybWF0aW9uX3Byb2Nlc3MnKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgYm90dG9tOiAwXHJcbiAgICAgICAgfSwgJ2Zhc3QnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGwuYXBwbHkodGhpcywgW10pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYXAuc2hvdygpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy52aXNpYmlsaXR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5fX3RpbWVJbnRlcnZhbCA9IHNldEludGVydmFsKGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fX3RpbWVUaWNrcysrO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRoaXMuX190aW1lVGlja3MgLyA2MCk7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRzID0gdGhpcy5fX3RpbWVUaWNrcyAtIG1pbnV0ZXMgKiA2MDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGltZShmb3JtYXQoJ21tOnNzJywge1xyXG4gICAgICAgICAgICAgICAgJ21tJzogKG1pbnV0ZXMgPCAxMCkgPyAnMCcgKyBtaW51dGVzIDogbWludXRlcyxcclxuICAgICAgICAgICAgICAgICdzcyc6IChzZWNvbmRzIDwgMTApID8gJzAnICsgc2Vjb25kcyA6IHNlY29uZHNcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0sIHRoaXMpLCAxMDAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQodC60YDRi9Cy0LDQvdC40LUg0L/QsNC90LXQu9C4XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfX2hpZGU6IGZ1bmN0aW9uIChjYWxsKSB7XHJcbiAgICAgICAgY2FsbCA9IGNhbGwgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICQoJyNpbmZvcm1hdGlvbl9wcm9jZXNzJykuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIGJvdHRvbTogLTkwXHJcbiAgICAgICAgfSwgJ2Zhc3QnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGwuYXBwbHkodGhpcywgW10pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYXAuaGlkZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy52aXNpYmlsaXR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fX3RpbWVJbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy50aW1lKCcwMDowMCcpO1xyXG4gICAgICAgIHRoaXMuX190aW1lVGlja3MgPSAwO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCQ0L3QuNC80LDRhtC40Y8g0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDRgdC+0L7QsdGJ0LXQvdC40Y9cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9fYW5pbWF0ZU1lc3NhZ2VTaG93OiBmdW5jdGlvbiAoY2FsbCkge1xyXG4gICAgICAgIGNhbGwgPSBjYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2UuY3NzKHtcclxuICAgICAgICAgICAgJ21hcmdpbi10b3AnOiAzNSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgIH0pLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgJ21hcmdpbi10b3AnOiAxOCxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICAgICAgfSwgJ2Zhc3QnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhbGwuYXBwbHkodGhpcywgW10pO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQkNC90LjQvNCw0YbQuNGPINGB0LrRgNGL0LLQsNC90LjQtSDRgdC+0L7QsdGJ0LXQvdC40Y9cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9fYW5pbWF0ZU1lc3NhZ2VIaWRlOiBmdW5jdGlvbiAoY2FsbCkge1xyXG4gICAgICAgIGNhbGwgPSBjYWxsIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2UuY3NzKHtcclxuICAgICAgICAgICAgJ21hcmdpbi10b3AnOiAxOCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgJ21hcmdpbi10b3AnOiAxLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgICB9LCAnZmFzdCcsIGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FsbC5hcHBseSh0aGlzLCBbXSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICBleGl0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzLmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKHAsIGkpIHtcclxuICAgICAgICAgICAgcC5FeGl0Rm4uYXBwbHkodGhpcywgWy0xLCBwLklEXSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICBjbGVhckxpc3QodGhpcy5wcm9jZXNzKTtcclxuICAgIH1cclxufSk7IiwidmFyIFRlbXBsYXRlID0gY2FuLkNvbnN0cnVjdC5leHRlbmQoJ0NvcmUuVGVtcGxhdGVzLlRlbXBsYXRlJywge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKHNjb3BlLCBpZCwgbmFtZSkge1xyXG4gICAgICAgIHRoaXMuSUQgPSBpZCB8fCAwO1xyXG5cclxuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xyXG5cclxuICAgICAgICB0aGlzLlNldHRpbmdzID0gbmV3IGNhbi5NYXAoe1xyXG4gICAgICAgICAgICByYXc6IG51bGwsXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZToge1xyXG4gICAgICAgICAgICAgICAgZGV0YWNoZWQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgemlwVHlwZTogJycsXHJcbiAgICAgICAgICAgICAgICBlbmNvZGluZ1R5cGU6ICcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHtcclxuICAgICAgICAgICAgICAgIHppcFR5cGU6ICcnLFxyXG4gICAgICAgICAgICAgICAgZW5jb2RpbmdUeXBlOiAnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQ2VydGlmaWNhdGUgPSBuZXcgY2FuLk1hcCh7XHJcbiAgICAgICAgICAgIHNpZ25hdHVyZTogbmV3IGNhbi5NYXAuTGlzdChbXSksXHJcbiAgICAgICAgICAgIGVuY3J5cHRpb246IG5ldyBjYW4uTWFwLkxpc3QoW10pLFxyXG4gICAgICAgICAgICBwZXJzb25hbDogbmV3IGNhbi5NYXAuTGlzdChbXSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5EZXRhaWwgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLnNjb3BlID0gc2NvcGU7XHJcblxyXG4gICAgICAgIF9fbG9hZFRlbXBsYXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubG9vYWRJRCA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/QvtC70YPRh9C10L3QuNC1INC/0L7Qu9C90L7QuSDQuNC90YTQvtGA0LzQsNGG0LjQuCDQviDRiNCw0LHQu9C+0L3QtVxyXG4gICAgICog0LLQutC70Y7Rh9Cw0Y8g0LjQvdGE0L7RgNC80LDRhtC40Y4g0L4g0L/QvtC00LrQu9GO0YfQtdC90L3Ri9GFINGB0LXRgNGC0LjRhNC40LrQsNGC0L7Qsi5cclxuICAgICAqL1xyXG4gICAgZ2V0RGV0YWlsczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBjbGVhckxpc3QodGhpcy5DZXJ0aWZpY2F0ZS5zaWduYXR1cmUpO1xyXG4gICAgICAgIGNsZWFyTGlzdCh0aGlzLkNlcnRpZmljYXRlLmVuY3J5cHRpb24pO1xyXG4gICAgICAgIGNsZWFyTGlzdCh0aGlzLkNlcnRpZmljYXRlLnBlcnNvbmFsKTtcclxuXHJcbiAgICAgICAgdGhpcy5fX2dldFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCW0LTRkdC8INC60L7Qs9C00LAg0L/RgNC40LzQtdC90Y/RgtGB0Y8g0LLRgdC1INC90LDRgdGC0YDQvtC50LrQuCxcclxuICAgICAgICAgKiDQsiDRgtC+0Lwg0YfQuNGB0LvQtSDQuCDRgdC10YDRgtC40YTQuNC60LDRgtGLLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUodGhpcy5fX2dldENlcnRpZmljYXRlLCB0aGlzKSwgMTAwMCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNjb3BlLmlzTG9hZGVkICYmIHRoaXMuSUQgIT09ICcwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMCcpXHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdzZXRfdGVtcGxhdGVfYXNfZGVmYXVsdCcsIHt0ZW1wbGF0ZUlkOiB0aGlzLklEfSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5EZXRhaWwodHJ1ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/QvtC70YPRh9C10L3QuNC1INC90LDRgdGC0YDQvtC10Log0L/RgNC+0YTQuNC70Y9cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9fZ2V0U2V0dGluZ3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuSUQgPT09ICcwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAnKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9fcnVuQ29uZmlnKHRoaXMuc2NvcGUucG9vbC5zZXR0aW5ncy5sb2FkLnRlbXBsYXRlcy5kZWZhdWx0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zY29wZS5yZXEuYmVnaW4oJ3VzZXJfcHJvZmlsZScsIHtwcm9maWxlSWQ6IHRoaXMuSUR9LCBmdW5jdGlvbiAocmVxKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXEuc3RhdHVzID09PSAnZXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0J/RgNC4INC30LDQs9GA0YPQt9C60LUg0L3QsNGB0YLRgNC+0LXQuiDQv9GA0L7RhNC40LvRjyBcIiVuYW1lXCIg0LLQvtC30L3QuNC60LvQuCDQv9GA0L7QsdC70LXQvNGLJywge1xyXG4gICAgICAgICAgICAgICAgICAgICclbmFtZSc6IHRoaXMuTmFtZVxyXG4gICAgICAgICAgICAgICAgfV0sICdlcnJvcicsIHJlcSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX19ydW5Db25maWcocmVxLmRhdGEpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfX3J1bkNvbmZpZzogZnVuY3Rpb24gKGNvbmYpIHtcclxuICAgICAgICB0aGlzLlNldHRpbmdzLmF0dHIoJ3JhdycsIGNvbmYpO1xyXG5cclxuICAgICAgICB2YXIgX3NpZ25hdHVyZSA9IGNvbmYuX1NpZ25hdHVyZVNldHRpbmdzO1xyXG4gICAgICAgIHZhciBfZW5jcnlwdGlvbiA9IGNvbmYuX0VuY3J5cHRpb25TZXR0aW5ncztcclxuXHJcbiAgICAgICAgaWYgKF9zaWduYXR1cmUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0JLQvtC30L3QuNC60LvQsCDQvtGI0LjQsdC60LAg0L/RgNC4INC/0L7Qu9GD0YfQtdC90LjQuCDQvdCw0YHRgtGA0L7QtdC6INC00LvRjyDQv9C+0LTQv9C40YHQuCwg0YjQsNCx0LvQvtC90LAgXCIlbmFtZVwiJywge1xyXG4gICAgICAgICAgICAgICAgJyVuYW1lJzogdGhpcy5OYW1lXHJcbiAgICAgICAgICAgIH1dLCAnZXJyb3InKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfZW5jcnlwdGlvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIG5ldyBMb2dnZXIoWyfQktC+0LfQvdC40LrQu9CwINC+0YjQuNCx0LrQsCDQv9GA0Lgg0L/QvtC70YPRh9C10L3QuNC4INC90LDRgdGC0YDQvtC10Log0LTQu9GPINGI0LjRhNGA0L7QstCw0L3QuNGPLCDRiNCw0LHQu9C+0L3QsCBcIiVuYW1lXCInLCB7XHJcbiAgICAgICAgICAgICAgICAnJW5hbWUnOiB0aGlzLk5hbWVcclxuICAgICAgICAgICAgfV0sICdlcnJvcicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5TZXR0aW5ncy5zaWduYXR1cmUuYXR0cignZGV0YWNoZWQnLCBfc2lnbmF0dXJlLkRldGFjaGVkID8gZmFsc2UgOiB0cnVlKTtcclxuICAgICAgICB0aGlzLlNldHRpbmdzLnNpZ25hdHVyZS5hdHRyKCd6aXBUeXBlJywgX3NpZ25hdHVyZS5aaXBUeXBlKTtcclxuICAgICAgICB0aGlzLlNldHRpbmdzLnNpZ25hdHVyZS5hdHRyKCdlbmNvZGluZ1R5cGUnLCBfc2lnbmF0dXJlLl9FbmNvZGluZ1R5cGUpO1xyXG5cclxuICAgICAgICB0aGlzLlNldHRpbmdzLmVuY3J5cHRpb24uYXR0cignemlwVHlwZScsIF9lbmNyeXB0aW9uLlppcFR5cGUpO1xyXG4gICAgICAgIHRoaXMuU2V0dGluZ3MuZW5jcnlwdGlvbi5hdHRyKCdlbmNvZGluZ1R5cGUnLCBfZW5jcnlwdGlvbi5fRW5jb2RpbmdUeXBlKTtcclxuXHJcbiAgICAgICAgaWYgKF9zaWduYXR1cmUuU2lnbmVyQ2VydGlmaWNhdGUxICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQ2VydGlmaWNhdGUuc2lnbmF0dXJlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaGFzaDogX3NpZ25hdHVyZS5TaWduZXJDZXJ0aWZpY2F0ZTEsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBudWxsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF9lbmNyeXB0aW9uLlJlY2lwaWVudENlcnRpZmljYXRlczEgIT09IG51bGwgJiYgX2VuY3J5cHRpb24uUmVjaXBpZW50Q2VydGlmaWNhdGVzMS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNhbi5lYWNoKF9lbmNyeXB0aW9uLlJlY2lwaWVudENlcnRpZmljYXRlczEsIGRlbGVnYXRlKGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkNlcnRpZmljYXRlLmVuY3J5cHRpb24ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9C+0LvRg9GH0LXQvdC40LUg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyINC/0YDQvtGE0LjQu9GPXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfX2dldENlcnRpZmljYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF9fY29tcGxpdGVfcyA9IGZhbHNlLFxyXG4gICAgICAgICAgICBfX2NvbXBsaXRlX2UgPSBmYWxzZSxcclxuICAgICAgICAgICAgY2hlY2tDb21wbGl0ZSA9IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfX2NvbXBsaXRlX2UgPT09IHRydWUgJiYgX19jb21wbGl0ZV9zID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ3Byb2Nlc3NfZXhpdCcsIFt0aGlzLnNjb3BlLnBvb2wua2V5cy5hdHRyKCdwcm9maWxlX2xvYWRfaWQnKV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLCAyMDAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCX0LDQv9GA0LDRiNC40LLQsNC10Lwg0LTQtdGC0LDQu9GM0L3Rg9GOINC40L3RhNC+0YDQvNCw0YbQuNGOINC/0L4g0YHQtdGA0YLQuNGE0LjQutCw0YLRgyDQv9C+0LTQv9C40YHQuC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5DZXJ0aWZpY2F0ZS5zaWduYXR1cmUuc2VyaWFsaXplKCkpLmxlbmd0aCA+IDIpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYXNoID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuQ2VydGlmaWNhdGUuc2lnbmF0dXJlLmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0sIGluZGV4LCBvYmopIHtcclxuICAgICAgICAgICAgICAgIGhhc2gucHVzaChpdGVtLmhhc2gpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLnJlcS5iZWdpbignY2VydGlmaWNhdGVfaW5mbycsIHtcclxuICAgICAgICAgICAgICAgIHRodW1icHJpbnRzOiBoYXNoXHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChzUmVxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc1JlcS5zdGF0dXMgPT09ICdlcnJvcicpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwINC/0YDQuCDQv9C+0LvRg9GH0LXQvdC40Lgg0YHQtdGA0YLQuNGE0LjQutCw0YLQsCDQv9C+0LTQv9C40YHQuCcsICdlcnJvcicsIHNSZXEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCfQodC10YDRgtC40YTQuNC60LDRgiDQtNC70Y8g0L/QvtC00L/QuNGB0Lgg0YPRgdC/0LXRiNC90L4g0LfQsNGI0YDRg9C20LXQvdGLJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FuLmVhY2goc1JlcS5kYXRhLmNlcnRpZmljYXRlcywgZGVsZWdhdGUoZnVuY3Rpb24gKG9iaiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fc2VhcmNoQ2VydGlmaWNhdGUob2JqLlRodW1icHJpbnQsICdzaWduYXR1cmUnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoJ2RhdGEnLCBvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBfX2NvbXBsaXRlX3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tDb21wbGl0ZSgpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfX2NvbXBsaXRlX3MgPSB0cnVlO1xyXG4gICAgICAgICAgICBjaGVja0NvbXBsaXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQl9Cw0L/RgNCw0YjQuNCw0LXQvCDQtNC10YLQsNC70YzQvdGD0Y4g0LjQvdGE0L7RgNC80LDRhtC40Y4g0L/QviDRgdC10YDRgtC40YTQuNC60LDRgtCw0Lwg0YjQuNGE0YDQvtCy0LDQvdC40Y8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KHRoaXMuQ2VydGlmaWNhdGUuZW5jcnlwdGlvbi5zZXJpYWxpemUoKSkubGVuZ3RoID4gMikge1xyXG5cclxuICAgICAgICAgICAgdmFyIGhhc2ggPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5DZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uLmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoLnB1c2goaXRlbS5oYXNoKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5yZXEuYmVnaW4oJ2NlcnRpZmljYXRlX2luZm8nLCB7XHJcbiAgICAgICAgICAgICAgICB0aHVtYnByaW50czogaGFzaFxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoc1JlcSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNSZXEuc3RhdHVzID09PSAnZXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IExvZ2dlcign0J/RgNC+0LjQt9C+0YjQu9CwINC+0YjQuNCx0LrQsCDQv9GA0Lgg0L/QvtC70YPRh9C10L3QuNC4INGB0LXRgNGC0LjRhNC40LrQsNGC0L7QsiDRiNC40YTRgNC+0LLQsNC90LjRjycsICdlcnJvcicsIHNSZXEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCfQodC10YDRgtC40YTQuNC60LDRgiDQtNC70Y8g0YjQuNGE0YDQvtCy0LDQvdC40Y8g0YPRgdC/0LXRiNC90L4g0LfQsNGI0YDRg9C20LXQvdGLJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FuLmVhY2goc1JlcS5kYXRhLmNlcnRpZmljYXRlcywgZGVsZWdhdGUoZnVuY3Rpb24gKG9iaiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9fc2VhcmNoQ2VydGlmaWNhdGUob2JqLlRodW1icHJpbnQsICdlbmNyeXB0aW9uJywgZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5NeUNlcnRpZmljYXRlICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbGlzdE9ialNlYXJjaCh0aGlzLkNlcnRpZmljYXRlLmVuY3J5cHRpb24sICdoYXNoJywgb2JqLlRodW1icHJpbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuQ2VydGlmaWNhdGUuZW5jcnlwdGlvbi5zcGxpY2UoaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoJ2RhdGEnLCBvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5NeUNlcnRpZmljYXRlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBMb2dnZXIoJ9Cd0LDQudC00LXQvSDQu9C40YfQvdGL0Lkg0YHQtdGA0YLQuNGE0LjQutCw0YIg0YjQuNGE0YDQvtCy0LDQvdC40Y8nLCB1bmRlZmluZWQsIG9iaik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkNlcnRpZmljYXRlLnBlcnNvbmFsLnB1c2gob2JqKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBfX2NvbXBsaXRlX2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tDb21wbGl0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICog0KPRgdGC0LDQvdCw0LLQu9C40LLQsNC10Lwg0YTQu9Cw0LMg0L4g0L/QvtC70YPRh9C10L3QuNGPXHJcbiAgICAgICAgICAgICAgICAgKiDQtNC10YLQsNC70YzQvdC+0Lkg0LjQvdGE0L7RgNC80LDRhtC40LguXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHRoaXMuRGV0YWlsKHRydWUpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBfX2NvbXBsaXRlX2UgPSB0cnVlO1xyXG4gICAgICAgICAgICBjaGVja0NvbXBsaXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuRGV0YWlsKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX19zZWFyY2hDZXJ0aWZpY2F0ZTogZnVuY3Rpb24gKGhhc2gsIHR5cGUsIGNhbGwpIHtcclxuICAgICAgICB0eXBlID0gdHlwZSB8fCAnc2lnbmF0dXJlJztcclxuXHJcbiAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5DZXJ0aWZpY2F0ZVt0eXBlXSxcclxuICAgICAgICAgICAgaXRlbSA9IG51bGw7XHJcblxyXG4gICAgICAgIGNhbi5lYWNoKHN0b3JlLCBkZWxlZ2F0ZShmdW5jdGlvbiAob2JqLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAob2JqLmhhc2ggPT09IGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSBzdG9yZVtpbmRleF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIGlmIChpdGVtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNhbGwuYXBwbHkodGhpcywgW2l0ZW1dKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAyNC4wMy4xNC5cclxuICovXHJcblxyXG52YXIgVGVtcGxhdGVzID0gY2FuLkNvbnN0cnVjdC5leHRlbmQoJ0NvcmUuVGVtcGxhdGVzJywge1xyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IG5ldyBjYW4uTWFwLkxpc3QoW10pO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IGNhbi5jb21wdXRlKG51bGwpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIHZhciBjdXIgPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgYWxsID0gdGhpcy5zY29wZS5wb29sLnNldHRpbmdzLmxvYWQudGVtcGxhdGVzLmFsbDtcclxuXHJcbiAgICAgICAgICAgIGFsbC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYS5OYW1lWzBdLmNoYXJDb2RlQXQoKSA+IGIuTmFtZVswXS5jaGFyQ29kZUF0KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYS5OYW1lWzBdLmNoYXJDb2RlQXQoKSA8IGIuTmFtZVswXS5jaGFyQ29kZUF0KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY2FuLmVhY2goYWxsLCBkZWxlZ2F0ZShmdW5jdGlvbiAodGVtcGxhdGUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKG5ldyBUZW1wbGF0ZSh0aGlzLnNjb3BlLCB0ZW1wbGF0ZS5JRCwgdGVtcGxhdGUuTmFtZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5Jc0RlZmF1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXIgPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUN1cnJlbnQodGVtcGxhdGUuSUQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhbGwubGVuZ3RoID4gMSAmJiBjdXIgPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUN1cnJlbnQoYWxsWzBdLklEKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGFsbC5sZW5ndGggPT09IDEgfHwgKGN1ciA9PT0gbnVsbCAmJiBhbGwubGVuZ3RoICE9PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDdXJyZW50KGFsbFswXS5JRCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQoe1xyXG4gICAgICAgICAgICAgICAgICAgIE5hbWU6ICfQqNCw0LHQu9C+0L3QsCDQvdC10YInXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQvtCx0YDQsNCx0L7RgtC60LUg0YjQsNCx0LvQvtC90LAuIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VhcmNoOiBmdW5jdGlvbiAoc3RyLCB0eXBlKSB7XHJcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlIHx8ICdpZCcsXHJcbiAgICAgICAgICAgIF9pdGVtID0gbnVsbDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5pdGVtcy5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdpZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5JRCA9PT0gc3RyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICduYW1lJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLk5hbWUgPT09IHN0cikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INC+0LHRgNCw0LHQvtGC0LrQtSDRiNCw0LHQu9C+0L3QsC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgcmV0dXJuIF9pdGVtO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2hhbmdlQ3VycmVudDogZnVuY3Rpb24gKGlkKSB7XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5zZWFyY2goaWQsICdpZCcpO1xyXG5cclxuICAgICAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBuZXcgTG9nZ2VyKFsn0J3QtSDRg9C00LDQu9C+0YHRjCDQvtCx0L3QsNGA0YPQttC40YLRjCDRiNCw0LHQu9C+0L0g0L/QviBJRCBcIiVpZFwiJywge1xyXG4gICAgICAgICAgICAgICAgJyVpZCc6IGlkXHJcbiAgICAgICAgICAgIH1dLCAnZXJyb3InKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50KGl0ZW0pO1xyXG4gICAgICAgICQoJy5zaG93X3RlbXBsYXRlJykuaHRtbChpdGVtLk5hbWUpO1xyXG4gICAgICAgIGl0ZW0uZ2V0RGV0YWlscygpO1xyXG5cclxuICAgICAgICBuZXcgTG9nZ2VyKFsn0KjQsNCx0LvQvtC9INC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOIFwiJW5hbWVcIiwg0YPRgdGC0LDQvdC+0LLQu9C10L0nLCB7XHJcbiAgICAgICAgICAgICclbmFtZSc6IGl0ZW0uTmFtZVxyXG4gICAgICAgIH1dKTtcclxuICAgIH1cclxuXHJcbn0pOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5INCQ0LvQtdC60YHQsNC90LTRgCBvbiAwOS4wNC4xNC5cclxuICovXHJcbnZhciBGaWxlID0gY2FuLkNvbnN0cnVjdC5leHRlbmQoJ0NvcmUuRmlsZScsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChwYXRoLCBsYXN0RGF0ZSwgcGFyYW1zKSB7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCf0YPRgtGMINC00L4g0YTQsNC50LvQsFxyXG4gICAgICAgICAqIEB0eXBlIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucGF0aCA9IG5ldyBjYW4uY29tcHV0ZShwYXRoKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQktGA0LXQvNGPINC/0L7RgdC70LXQtNC90LXQs9C+INC40LfQvNC10L3QtdC90LjRj1xyXG4gICAgICAgICAqIEB0eXBlIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubGFzdERhdGUgPSBuZXcgY2FuLmNvbXB1dGUoJycpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQodC60YDRi9GCINC70Lgg0YTQsNC50LtcclxuICAgICAgICAgKiBAdHlwZSB7Y2FuLmNvbXB1dGV9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5pc0hhZGUgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLmVycm9yID0gbmV3IGNhbi5jb21wdXRlKGZhbHNlKTtcclxuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IG5ldyBjYW4uY29tcHV0ZSgnJyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCf0YDQvtGG0LXQvdGCINC30LDQs9GA0YPQt9C60LhcclxuICAgICAgICAgKiBAdHlwZSB7Y2FuLmNvbXB1dGV9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy51cFBlcmNlbiA9IG5ldyBjYW4uY29tcHV0ZSgwKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQl9Cw0LPRgNGD0LbQtdC9INC70Lgg0YTQsNC50LtcclxuICAgICAgICAgKiBAdHlwZSB7Y2FuLmNvbXB1dGV9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy51cGxvYWRlZCA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy51cGxvYWRlciA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNoZWRGaWxlID0gbmV3IGNhbi5NYXAoe1xyXG4gICAgICAgICAgICBhdHRhY2hlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIHBhdGg6ICcnLFxyXG4gICAgICAgICAgICBlcnJvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbm5lciA9IHBhcmFtc1snaW5uZXInXSB8fCBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQndC10L7QsdGA0LDQsdC+0YLQsNC90L3QvtC1INCy0YDQtdC80Y8g0LjQt9C80LXQvdC10L3QuNGPXHJcbiAgICAgICAgICogQHR5cGUgeyp9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9fcmF3TGFzdERhdGUgPSBsYXN0RGF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRMYXN0RGF0ZShsYXN0RGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fX3NldFBhcmFtcyhwYXJhbXMpO1xyXG5cclxuICAgICAgICB0aGlzLmlkID0gZ3VpZCgpO1xyXG5cclxuICAgICAgICBjYW4uYmluZC5jYWxsKHdpbmRvdywgJ3VwbG9hZF9maWxlX2F0dGFjaGVkX3JlZycsIGRlbGVnYXRlKGZ1bmN0aW9uIChldiwgaWQpIHtcclxuICAgICAgICAgICAgaWYgKGlkID09PSB0aGlzLmlkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cGxvYWRlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZXIudW5iaW5kQWxsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZSh0aGlzLl9fZmlsZVVwbG9hZFJlZywgdGhpcyksIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KHQutGA0YvQstCw0LXRgiDRhNCw0LnQu1xyXG4gICAgICogQHJldHVybnMge0ZpbGV9XHJcbiAgICAgKi9cclxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmlzSGFkZSh0cnVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9C+0LrQsNC30YvQstCw0LXRgiDRhNCw0LnQu1xyXG4gICAgICogQHJldHVybnMge0ZpbGV9XHJcbiAgICAgKi9cclxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmlzSGFkZShmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cclxuICAgICAqL1xyXG4gICAgdG9nZ2VsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5pc0hhZGUodGhpcy5pc0hhZGUoKSA9PT0gdHJ1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cclxuICAgICAqL1xyXG4gICAgc2V0TGFzdERhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0RGF0ZShtb21lbnQoZGF0ZSkuZm9ybWF0KCdERC5NTS5ZWVlZJykpO1xyXG4gICAgICAgIHRoaXMuX19yYXdMYXN0RGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0JLRi9Cy0L7QtNC40YIg0L7RiNC40LHQutGDXHJcbiAgICAgKiBAcGFyYW0gc3RyINCh0YLRgNC+0LrQsCDQvtGI0LjQsdC60LgsINC10YHQu9C4INGB0YLRgNC+0LrQsCDQv9GD0YHRgtCwLCDRgtC+INC+0YjQuNCx0LrQsCDRgdC90LjQvNCw0LXRgtGB0Y8uXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsZX1cclxuICAgICAqL1xyXG4gICAgSW5uZXJFcnJvcjogZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHRoaXMuZXJyb3Ioc3RyICE9PSBudWxsKTtcclxuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSgoc3RyID09PSBudWxsKSA/ICcnIDogc3RyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwYXJhbXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9fc2V0UGFyYW1zOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHBhcmFtcyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXNbJ3JlYWR5J10gPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy51cGxvYWRlZCh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy51cFBlcmNlbigxMDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtc1snYXR0YWNoZWQnXSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmF0dGFjaGVkRmlsZS5hdHRyKCdhdHRhY2hlZCcsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX19maWxlVXBsb2FkUmVnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudXBsb2FkZXIgIT09IG51bGwpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy51cGxvYWRlciA9IG5ldyBwbHVwbG9hZC5VcGxvYWRlcih7XHJcbiAgICAgICAgICAgIHJ1bnRpbWVzOiAnaHRtbDUnLFxyXG4gICAgICAgICAgICBicm93c2VfYnV0dG9uOiB0aGlzLmlkLFxyXG4gICAgICAgICAgICAvL21heF9maWxlX3NpemU6ICcyMG1iJyxcclxuICAgICAgICAgICAgdXJsOiBNYXN0ZXIucG9vbC5zZXR0aW5ncy5sb2FkLnVybFVwbG9hZCxcclxuICAgICAgICAgICAgbXVsdGlfc2VsZWN0aW9uOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5pdDoge1xyXG4gICAgICAgICAgICAgICAgRmlsZXNBZGRlZDogZGVsZWdhdGUoZnVuY3Rpb24gKHVwLCBmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vNTVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGVydCA9IE1hc3Rlci5sYXlvdXQubWVzc2FnZSgn0JLQvdC40LzQsNC90LjQtSEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0KCfQn9GA0LXQstGL0YjQtdC90L4g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80L7QtSDRh9C40YHQu9C+INC30LDQs9GA0YPQttCw0LXQvNGL0YUg0YTQsNC50LvQvtCyKDxiPiVmaWxlQ291bnQ8L2I+KSwg0L/QvtCy0YLQvtGA0LjRgtC1INC/0L7Qv9GL0YLQutGDLjxiciAvPtCc0LDQutGB0LjQvNCw0LvRjNC90L4g0LTQvtC/0YPRgdGC0LjQvNC+0LUg0YfQuNGB0LvQviDQvtC00L3QvtCy0YDQtdC80LXQvdC90L4g0LfQsNCz0YDRg9C20LDQtdC80YvRhSDRhNCw0LnQu9C+0LIg0YDQsNCy0L3QviA8Yj4xMDwvYj4uJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICclZmlsZUNvdW50JzogZmlsZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3YXJuaW5nJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ9CU0LAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdidG4tZ3JlZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVwbG9hZFZlcmlmeUZpbGVzKHRoaXMudXBsb2FkZXIsIGZpbGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRlci5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgRmlsZVVwbG9hZGVkOiBkZWxlZ2F0ZShmdW5jdGlvbiAodXAsIGZpbGUsIGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gKHR5cGVvZiBpbmZvLnJlc3BvbnNlID09PSAnc3RyaW5nJykgPyBKU09OLnBhcnNlKGluZm8ucmVzcG9uc2UpIDogaW5mby5yZXNwb25zZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gJ29rJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaGVkRmlsZS5hdHRyKCdlcnJvcicsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hlZEZpbGUuYXR0cigncGF0aCcsIHJlcy5maWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgVXBsb2FkUHJvZ3Jlc3M6IGRlbGVnYXRlKGZ1bmN0aW9uICh1cCwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZWQodXAudG90YWwucGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICBTdGF0ZUNoYW5nZWQ6IGRlbGVnYXRlKGZ1bmN0aW9uICh1cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cC5zdGF0ZSA9PSBwbHVwbG9hZC5TVEFSVEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwbG9hZGVyLmluaXQoKTtcclxuICAgIH1cclxufSk7IiwidmFyIEFjdGlvbnMgPSBjYW4uQ29udHJvbCh7XHJcbiAgICBzY29wZTogbnVsbCxcclxuICAgIC8qKlxyXG4gICAgICog0JPQvtGC0L7QstC90L7RgdGC0Ywg0YTQsNC50LvQvtCyLlxyXG4gICAgICovXHJcbiAgICBmaWxlc1JlYWR5OiBudWxsLFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xyXG4gICAgICAgIHRoaXMuZmlsZXNSZWFkeSA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcblxyXG4gICAgICAgIHZhciB2aWV3ID0gY2FuLnZpZXcoJ0Fzc2V0cy92aWV3L21hc3Rlci9hY3Rpb25zLmhicycsIHtcclxuICAgICAgICAgICAgcG9vbDogdGhpcy5zY29wZS5wb29sLFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgZmlsZV9saXN0X29wZW46IHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RmlsZXMoKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvQuNGC0Ywg0LjQtyDRgdC/0LjRgdC60LBcclxuICAgICAgICAgICAgICAgIGhpZGVfZm9yX2xpc3Q6IHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlLmF0dHIoJ2lzSGFkZScsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAvLyDQktC+0YHRgdGC0LDQvdC+0LLQuNGC0YxcclxuICAgICAgICAgICAgICAgIHNob3dfZm9yX2xpc3Q6IHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlLmF0dHIoJ2lzSGFkZScsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgLy8g0KHQutGA0YvRgtGMXHJcbiAgICAgICAgICAgICAgICBkZWxldGVfZm9yX2xpc3Q6IHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnNjb3BlLmNvcmUuZmlsZVNlYXJjaChmaWxlLm5hbWUpLmluZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgY2FuY2VsOiB0aGlzLnNjb3BlLmRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuZWFjaCh0aGlzLnNjb3BlLmRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaWxlc1JlYWR5OiB0aGlzLmZpbGVzUmVhZHksXHJcbiAgICAgICAgICAgIGFhYTogMTIzXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBhY3RpdmVVcGxvYWRlcjogdGhpcy5zY29wZS5kZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnVXBsb2FkZXIoKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLCA1MDApO1xyXG4gICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBlbC5hcHBlbmQodmlldyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RGaWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIG5ldyBMb2dnZXIoJ29wZW4nKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY29wZS5sYXlvdXQubW9kYWwoJ9CS0YvQsdC10YDQuNGC0LUg0YTQsNC50Lsg0LTQu9GPINC00L7QsdCw0LLQu9C10L3QuNGPJywgJ3NlbGVjdF9maWxlcy5oYnMnLCB7fSwgJ2JveCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCg0LXQs9C40YHRgtGA0LDRhtC40Y8g0LfQsNCz0YDRg9C30YfQuNC60LAg0YTQsNC50LvQvtCyLlxyXG4gICAgICogKNCR0LjQvdC00LjQvdCzINC90LAg0Y3Qu9C10LzQtdC90YIg0LTQvtC80LApXHJcbiAgICAgKi9cclxuICAgIHJlZ1VwbG9hZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy51cGxvYWRlciA9IG5ldyBwbHVwbG9hZC5VcGxvYWRlcih7XHJcbiAgICAgICAgICAgIHJ1bnRpbWVzOiAnaHRtbDUnLFxyXG4gICAgICAgICAgICBicm93c2VfYnV0dG9uOiAnbmV3RmlsZScsXHJcbiAgICAgICAgICAgIHVybDogdGhpcy5zY29wZS5wb29sLnNldHRpbmdzLmxvYWQudXJsVXBsb2FkLFxyXG4gICAgICAgICAgICBpbml0OiB7XHJcbiAgICAgICAgICAgICAgICBGaWxlc0FkZGVkOiB0aGlzLnNjb3BlLmRlbGVnYXRlKGZ1bmN0aW9uICh1cCwgZmlsZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2FuLmVhY2goZmlsZXMsIHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5wb29sLmZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogbW9tZW50LnVuaXgodGhpcy5zY29wZS50aW1lKCkpLmZvcm1hdCgnREQuTU0uWVlZWScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBsb2FkZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBQZXJjZW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0hhZGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5hID0gdGhpcy5zY29wZS5jb3JlLmZpbGVTZWFyY2goZmlsZS5uYW1lKS5maWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRlci5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgRmlsZVVwbG9hZGVkOiB0aGlzLnNjb3BlLmRlbGVnYXRlKGZ1bmN0aW9uICh1cCwgZmlsZSwgaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSAodHlwZW9mIGluZm8ucmVzcG9uc2UgPT09ICdzdHJpbmcnKSA/IEpTT04ucGFyc2UoaW5mby5yZXNwb25zZSkgOiBpbmZvLnJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSAnb2snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuYS5hdHRyKCd1cGxvYWRlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICBVcGxvYWRQcm9ncmVzczogdGhpcy5zY29wZS5kZWxlZ2F0ZShmdW5jdGlvbiAodXAsIGZpbGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5hLmF0dHIoJ3VwUGVyY2VuJywgdXAudG90YWwucGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICBTdGF0ZUNoYW5nZWQ6IHRoaXMuc2NvcGUuZGVsZWdhdGUoZnVuY3Rpb24gKHVwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVwLnN0YXRlID09IHBsdXBsb2FkLlNUQVJURUQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g0J3QsNGH0LDQu9C+INC30LDQs9GA0YPQt9C60LhcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDQl9Cw0LPRgNGD0LfQutCwINC30LDQutC+0L3Rh9C10L3QsFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy51cGxvYWRlci5pbml0KCk7XHJcbiAgICB9XHJcbn0pOyIsInZhciBNYWluID0gY2FuLkNvbnRyb2woe1xyXG4gICAgc2NvcGU6IG51bGwsXHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xyXG4gICAgICAgIHRoaXMuZmlsZXNSZWFkeSA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5hY3Rpb25SZWFkeSA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5tYXN0ZXJSZWFkeSA9IG5ldyBjYW4uY29tcHV0ZShmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5jZXJ0UmVhZHkgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuYWN0aW9uVmFsdWUgPSBuZXcgY2FuLmNvbXB1dGUoMCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzdWx0ID0gbmV3IGNhbi5jb21wdXRlKGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBsb2FkZXIgPSBudWxsO1xyXG4gICAgICAgIHZhciB2aWV3ID0gY2FuLnZpZXcoJy9Bc3NldHMvdmlld3MvbWFzdGVyL2FjdGlvbnMuaGJzJywge1xyXG4gICAgICAgICAgICBwb29sOiB0aGlzLnNjb3BlLnBvb2wsXHJcbiAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlX2xpc3Rfb3BlbjogZGVsZWdhdGUodGhpcy5zZWxlY3RGaWxlcywgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqINCj0LTQsNC70LjRgtGMINC40Lcg0YHQv9C40YHQutCwXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGhpZGVfZm9yX2xpc3Q6IGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5pc0hhZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICog0JLQvtGB0YHRgtCw0L3QvtCy0LjRgtGMXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHNob3dfZm9yX2xpc3Q6IGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5pc0hhZGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqINCj0LTQsNC70LjRgtGMINGB0L7QstGB0LXQvCAo0YPQsdGA0LDRgtGMINC40Lcg0YHQv9C40YHQutCwKVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBkZWxldGVfZm9yX2xpc3Q6IGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlUmVtb3ZlKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICB1cGxvYWRfZXhpdDogZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVSZW1vdmUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICog0JrQu9C40Log0L/QviDQutC90L7Qv9C60LUgXCLQvtGC0LzQtdC90LBcIlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBjYW5jZWw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZUNvbmZpcm0oJ9CS0Ysg0YPQstC10YDQtdC90YssINGH0YLQviDRhdC+0YLQuNGC0LUg0L/QvtC60LjQvdGD0YLRjCDQvNCw0YHRgtC10YA/INCS0YHQtSDQvdC1INGB0L7RhdGA0LDQvdC10L3QvdGL0LUg0LTQsNC90L3Ri9C1INCx0YPQtNGD0YIg0L/QvtGC0LXRgNGP0L3RiyEnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9EZWZhdWx0L1dlYkRhdkJyb3dzZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25fdmFsdWU6IHRoaXMuYWN0aW9uVmFsdWUsXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqINCa0LvQuNC6INC/0L4g0L3QvtC/0LrQtSBcItC/0YDQvtC00L7Qu9C20LjRgtGMXCIg0YEg0LLRi9Cx0YDQsNC90L3Ri9C8INC00LXQudGB0YLQstC40LXQvFxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25fcnVuOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IExvZ2dlcihbJ9CX0LDQv9GD0YHQutCw0LXQvCDQtNC10LnRgdGC0LLQuNC1IFwiJWFjdGlvblwiJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnJWFjdGlvbic6IHRoaXMuYWN0aW9uVmFsdWUoKVxyXG4gICAgICAgICAgICAgICAgICAgIH1dKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3Rpb25SdW4odGhpcy5hY3Rpb25WYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgcmVmaWxlczogZGVsZWdhdGUodGhpcy5yZUZpbGVzLCB0aGlzLCBbdHJ1ZV0pLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLnJlc3VsdFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaWxlc1JlYWR5OiB0aGlzLmZpbGVzUmVhZHksXHJcbiAgICAgICAgICAgIGFjdGlvblJlYWR5OiB0aGlzLmFjdGlvblJlYWR5LFxyXG4gICAgICAgICAgICBtYXN0ZXJSZWFkeTogdGhpcy5tYXN0ZXJSZWFkeSxcclxuICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcclxuXHJcbiAgICAgICAgICAgIG9wZW5TZWxlY3RGaWxlRGlhbG9nOiBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgZWwsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgX2ZpbGUgPSBmaWxlO1xyXG5cclxuICAgICAgICAgICAgICAgIG5ldyBPcGVuVXBsb2FkRmlsZURpYWxvZyhkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZXMsIHBhcmFtcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IHRoaXMuc2NvcGUuc2VhcmNoRmlsZShwYXJhbXMuZmlsZS5wYXRoKCkpLmZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5hdHRhY2hlZEZpbGUuYXR0cignZXJyb3InLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5hdHRhY2hlZEZpbGUuYXR0cigncGF0aCcsIGZpbGVzWzBdLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIG11bHRpX3NlbGVjdGlvbjogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCB0aGlzKVxyXG5cclxuXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBhY3RpdmVVcGxvYWRlcjogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdVcGxvYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksIDUwMCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGVsLmFwcGVuZCh2aWV3KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0J7RgtGB0LvQtdC20LjQstCw0L3QuNC1INC40LfQvNC10L3QtdC90LjQuSDQsiDRhNCw0LnQu9Cw0YVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKGV2LCBhdHRyLCBob3csIG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tGaWxlUmVhZHkoKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCe0YLRgdC70LXQttC40LLQsNC90LjQtSDQuNC30LzQtdC90LXQvdC40Y8g0LTQtdC50YHRgtCy0LjRj1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYWN0aW9uVmFsdWUuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKGV2LCB0ZXh0LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrQWN0aW9uUmVhZHkoKTtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpb25Ub1RlbXBhbGUodGV4dCk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQntGC0YHQu9C10LbQuNCy0LDQvdC40LUg0L7QsdGJ0LXQuSDQs9C+0YLQvtCy0L3QvtGB0YLQuCDQuiDQtNC10LnRgdGC0LLQuNGOLiAo0J7RgNC40LXQvdGC0LDRhtC40Y8g0L3QsCDRhNCw0LnQu9GLKVxyXG4gICAgICAgICAqICjQs9C+0YLQvtCyINC90LDQsdC+0YAg0YTQsNC50LvQvtCyINC4INCy0YvQsdGA0LDQvdC+INC00LXQudGB0YLQstC40LUg0L3QsNC0INC90LjQvNC4KVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZmlsZXNSZWFkeS5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIHRleHQsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tNYXN0ZXJSZWFkeSgpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZXJ0UmVhZHkuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKGV2LCB0ZXh0LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrTWFzdGVyUmVhZHkoKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCe0YLRgdC70LXQttC40LLQsNC90LjQtSDQvtCx0YnQtdC5INCz0L7RgtC+0LLQvdC+0YHRgtC4INC6INC00LXQudGB0YLQstC40Y4uICjQvtGA0LjQtdC90YLQsNGG0LjRjyDQvdCwINC00LXQudGB0YLQstC40LUpXHJcbiAgICAgICAgICogKNCz0L7RgtC+0LIg0L3QsNCx0L7RgCDRhNCw0LnQu9C+0LIg0Lgg0LLRi9Cx0YDQsNC90L4g0LTQtdC50YHRgtCy0LjQtSDQvdCw0LQg0L3QuNC80LgpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5hY3Rpb25SZWFkeS5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIHRleHQsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tNYXN0ZXJSZWFkeSgpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXN0ZXJSZWFkeS5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIG5ld1ZhbCwgb2xkVmFsKSB7XHJcblxyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcblxyXG4gICAgICAgIGNhbi5iaW5kLmNhbGwodGhpcy5zY29wZSwgJ2FwcFJ1bicsIGRlbGVnYXRlKGZ1bmN0aW9uIChldiwgc2NvcGUpIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqINCf0L7RgdC70LUg0L/QvtC70L3QvtC5INC30LDQs9GA0YPQt9C60LUg0LzQsNGB0YLQtdGA0LAsINC/0YDQvtCy0LXRgNGP0LXQvCDQs9C+0YLQvtCy0L3QvtGB0YLRjCDRhNCw0LnQu9C+0LIuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrRmlsZVJlYWR5KCk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICBjYW4uYmluZC5jYWxsKHRoaXMuc2NvcGUsICdhY3Rpb25fb2theScsIGRlbGVnYXRlKGZ1bmN0aW9uIChldiwgc2NvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHQodHJ1ZSk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICBzZXRJbnRlcnZhbChkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tGaWxlUmVhZHkoKTtcclxuICAgICAgICAgICAgdGhpcy5jaGVja0FjdGlvblJlYWR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tDZXJ0UmVhZHkoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tNYXN0ZXJSZWFkeSgpO1xyXG4gICAgICAgIH0sIHRoaXMpLCA1MDApO1xyXG4gICAgfSxcclxuXHJcbiAgICBmaWxlUmVtb3ZlOiBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgIGlmIChmaWxlLmlubmVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBsb2FkZXIucmVtb3ZlRmlsZShmaWxlLmlubmVyKTtcclxuICAgICAgICAgICAgZmlsZS5pbm5lci5kZXN0cm95KClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuc2NvcGUuY29yZS5maWxlU2VhcmNoKGZpbGUuaWQpLmluZGV4O1xyXG5cclxuICAgICAgICB0aGlzLnNjb3BlLnBvb2wuZmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcblxyXG4gICAgYWN0aW9uVG9UZW1wYWxlOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHRoaXMuc2NvcGUubGF5b3V0LnRlbXBsYXRlTG9jayhjYW4uJC5pbkFycmF5KG5hbWUsIFsnc3Vic2NyaWJlJywgJ2VuY3J5cHQnLCAnc3Vic2NyaWJlX2FuZF9lbmNyeXB0J10pID09PSAtMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrQ2VydFJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VydFJlYWR5KHRoaXMuc2NvcGUucG9vbC50ZW1wbGF0ZXMuY3VycmVudCgpLkRldGFpbCgpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9GA0L7QstC10YDQutCwINC90LAg0LPQvtGC0L7QstC90L7RgdGC0Ywg0YTQsNC50LvQvtCyXHJcbiAgICAgKi9cclxuICAgIGNoZWNrRmlsZVJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlYWR5ID0gdHJ1ZSxcclxuICAgICAgICAgICAgYWxsSGlkZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zY29wZS5wb29sLmZpbGVzLmVhY2goZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgaWYgKGZpbGUudXBsb2FkZWQoKSA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpbGUuaXNIYWRlKCkgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgYWxsSGlkZSA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zY29wZS5wb29sLmZpbGVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLnNjb3BlLnBvb2wuZmlsZXNbMF0uaXNIYWRlKCkgPT09IHRydWUpXHJcbiAgICAgICAgICAgIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChhbGxIaWRlKVxyXG4gICAgICAgICAgICByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmZpbGVzUmVhZHkocmVhZHkpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtCy0LXRgNC60LAg0L3QsCDQs9C+0YLQvtCy0L3QvtGB0YLRjCDQtNC10LnRgdGC0LLQuNGPXHJcbiAgICAgKi9cclxuICAgIGNoZWNrQWN0aW9uUmVhZHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmFjdGlvblJlYWR5KChwYXJzZUludCh0aGlzLmFjdGlvblZhbHVlKCkpICE9PSAwKSA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/RgNC+0LLQtdGA0LrQsCDQvdCwINCz0L7RgtC+0LLQvdC+0YHRgtGMINC80LDRgdGC0LXRgNCwINC6INGA0LDQsdC+0YLQtVxyXG4gICAgICovXHJcbiAgICBjaGVja01hc3RlclJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5tYXN0ZXJSZWFkeSgodGhpcy5maWxlc1JlYWR5KCkgPT09IHRydWUgJiYgdGhpcy5hY3Rpb25SZWFkeSgpID09PSB0cnVlICYmIHRoaXMuY2hlY2tDZXJ0UmVhZHkoKSA9PT0gdHJ1ZSkgPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RGaWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIG5ldyBPcGVuVXBsb2FkRmlsZURpYWxvZyhkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZXMpIHtcclxuICAgICAgICAgICAgY2FuLmVhY2goZmlsZXMsIGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmFkZEZpbGUoZmlsZS5wYXRoLCBmaWxlLmxhc3RDaGFuZ2UsIHtcclxuICAgICAgICAgICAgICAgICAgICByZWFkeTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KDQtdCz0LjRgdGC0YDQsNGG0LjRjyDQt9Cw0LPRgNGD0LfRh9C40LrQsFxyXG4gICAgICovXHJcbiAgICByZWdVcGxvYWRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudXBsb2FkZXIgPSBuZXcgcGx1cGxvYWQuVXBsb2FkZXIoe1xyXG4gICAgICAgICAgICBydW50aW1lczogJ2h0bWw1JyxcclxuICAgICAgICAgICAgYnJvd3NlX2J1dHRvbjogJ25ld0ZpbGUnLFxyXG4gICAgICAgICAgICBkcm9wX2VsZW1lbnQ6ICduZXdGaWxlJyxcclxuICAgICAgICAgICAgLy9tYXhfZmlsZV9zaXplOiAnMjBtYicsXHJcbiAgICAgICAgICAgIHVybDogdGhpcy5zY29wZS5wb29sLnNldHRpbmdzLmxvYWQudXJsVXBsb2FkLFxyXG4gICAgICAgICAgICBjaHVua19zaXplOiAnMTAwa2InLFxyXG4gICAgICAgICAgICBpbml0OiB7XHJcbiAgICAgICAgICAgICAgICBGaWxlc0FkZGVkOiBkZWxlZ2F0ZShmdW5jdGlvbiAodXAsIGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGVydCA9IE1hc3Rlci5sYXlvdXQubWVzc2FnZSgn0JLQvdC40LzQsNC90LjQtSEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0KCfQn9GA0LXQstGL0YjQtdC90L4g0LzQsNC60YHQuNC80LDQu9GM0L3QviDQtNC+0L/Rg9GB0YLQuNC80L7QtSDRh9C40YHQu9C+INC30LDQs9GA0YPQttCw0LXQvNGL0YUg0YTQsNC50LvQvtCyLCDQv9C+0LLRgtC+0YDQuNGC0LUg0L/QvtC/0YvRgtC60YMuINCc0LDQutGB0LjQvNCw0LvRjNC90L4g0LTQvtC/0YPRgdGC0LjQvNC+0LUg0YfQuNGB0LvQviDQvtC00L3QvtCy0YDQtdC80LXQvdC90L4g0LfQsNCz0YDRg9C20LDQtdC80YvRhSDRhNCw0LnQu9C+0LIg0YDQsNCy0L3QviA8Yj4xMDwvYj4uJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICclZmlsZUNvdW50JzogZmlsZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlcnJvcicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQl9Cw0LrRgNGL0YLRjCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy51cGxvYWQnKS5yZW1vdmVDbGFzcygnZHJhZycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVcGxvYWRWZXJpZnlGaWxlcyh0aGlzLnVwbG9hZGVyLCBmaWxlcywgZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbi5lYWNoKGZpbGVzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuZmlsZU9iaiA9IHRoaXMuc2NvcGUuYWRkRmlsZShmaWxlLm5hbWUsIG5ldyBEYXRlKCksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lcjogZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZXIuc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG5cclxuICAgICAgICAgICAgICAgIEZpbGVVcGxvYWRlZDogZGVsZWdhdGUoZnVuY3Rpb24gKHVwLCBmaWxlLCBpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9ICh0eXBlb2YgaW5mby5yZXNwb25zZSA9PT0gJ3N0cmluZycpID8gSlNPTi5wYXJzZShpbmZvLnJlc3BvbnNlKSA6IGluZm8ucmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09ICdvaycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5maWxlT2JqLnVwbG9hZGVkKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5maWxlT2JqLnBhdGgocmVzLmZpbGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAnRXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdCgn0J3QtdCy0L7Qt9C80L7QttC90L4g0LfQsNCz0YDRg9C30LjRgtGMINGE0LDQudC7IFwiJW5hbWVcIicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJW5hbWUnOiBmaWxlLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ9CX0LDQutGA0YvRgtGMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRlci5yZW1vdmVGaWxlKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICBVcGxvYWRQcm9ncmVzczogZGVsZWdhdGUoZnVuY3Rpb24gKHVwLCBmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5maWxlT2JqLnVwUGVyY2VuKGZpbGUucGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgU3RhdGVDaGFuZ2VkOiBkZWxlZ2F0ZShmdW5jdGlvbiAodXApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXAuc3RhdGUgPT0gcGx1cGxvYWQuU1RBUlRFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDQndCw0YfQsNC70L4g0LfQsNCz0YDRg9C30LrQuFxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vINCX0LDQs9GA0YPQt9C60LAg0LfQsNC60L7QvdGH0LXQvdCwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwbG9hZGVyLmluaXQoKTtcclxuXHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoJyNuZXdGaWxlJyk7XHJcblxyXG4gICAgICAgIGJ1dHRvbi5vbignZHJhZ2VudGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoJ2RyYWcnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYnV0dG9uLm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5yZW1vdmVDbGFzcygnZHJhZycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBhY3Rpb25SdW46IGZ1bmN0aW9uIChuYW1lLCBwYXJhbXMpIHtcclxuICAgICAgICBuYW1lID0gbmFtZSB8fCAnJztcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgIGlmIChuYW1lLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpb24obnVsbCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChleGlzdChwYXJhbXNbJ3NlbGVjdEFjdGlvbk9ubHknXSwgdHJ1ZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpb25WYWx1ZShuYW1lKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgICAgICAgICBjYW4uJCgnI3NlbGVjdEFjdGlvbicpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpLCA1MDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQlNC10LnRgdGC0LLQuNGPOlxyXG4gICAgICAgICAqIC0g0L/QvtC00L/QuNGB0YxcclxuICAgICAgICAgKiAtINGI0LjRhNGA0L7QstCw0L3QuNC1XHJcbiAgICAgICAgICogLSDQv9C+0LTQv9C40YHRjCDQuCDRiNC40YTRgNC+0LLQsNC90LjQtVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmIChjYW4uJC5pbkFycmF5KG5hbWUsIFsnc3Vic2NyaWJlJywgJ2VuY3J5cHQnLCAnc3Vic2NyaWJlX2FuZF9lbmNyeXB0J10pICE9PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGlvbihuZXcgU2lnbkFuZEVuY3J5cHQoY2FuLiQoJ2RpdlthY3Rpb25dJyksIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAgICAgbWFpbjogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6IG5hbWVcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdCh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqINCU0LXQudGB0YLQstC40LU6XHJcbiAgICAgICAgICogLSDQv9GA0L7QstC10YDQutCwINC/0L7QtNC/0LjRgdC4XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKG5hbWUgPT09ICdjaGVja19zaWduYXR1cmUnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uKG5ldyBDaGVja1NpZ25hdHVyZShjYW4uJCgnZGl2W2FjdGlvbl0nKSwge1xyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICAgICBtYWluOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogbmFtZVxyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLmxheW91dC50ZW1wbGF0ZUxvY2sodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmFtZSA9PT0gJ2RlY2lwaGVyJykge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGlvbihuZXcgRGVjaXBoZXIoY2FuLiQoJ2RpdlthY3Rpb25dJyksIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAgICAgbWFpbjogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6IG5hbWVcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdCh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUubGF5b3V0LnRlbXBsYXRlTG9jayh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuYW1lID09PSAnZGVjaXBoZXJfY2hlY2tfc2lnbmF0dXJlJykge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGlvbihuZXcgRGVjaXBoZXJBbmRDaGVja1NpZ25hdHVyZShjYW4uJCgnZGl2W2FjdGlvbl0nKSwge1xyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICAgICBtYWluOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogbmFtZVxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0KHRydWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5sYXlvdXQudGVtcGxhdGVMb2NrKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0JjQt9C80LXQvdC10L3QuNC1INGB0L7RgdGC0LDQstCwINGE0LDQudC70L7QslxyXG4gICAgICogQHBhcmFtIHNob3dNZXNzYWdlINCS0YvQstC10YHRgtGMINC70Lgg0L/RgNC10LTRg9C/0YDQtdC20LTQsNGO0YnQtdC1INGB0L7QvtCx0YnQtdC90LjQtVxyXG4gICAgICovXHJcbiAgICByZUZpbGVzOiBmdW5jdGlvbiAoc2hvd01lc3NhZ2UsIHRleHQpIHtcclxuICAgICAgICB0ZXh0ID0gdGV4dCB8fCAn0J/RgNC4INGB0LzQtdC90LUg0YHQvtGB0YLQsNCy0LAg0YTQsNC50LvQvtCyINCy0YHQtSDQuNC30LzQtdC90LXQvdC40Y8sINGB0LTQtdC70LDQvdC90YvQtSDQvdCwINC/0L7RgdC70LXQtNGD0Y7RidC40YUg0Y3RgtCw0L/QsNGFLCDQsdGD0LTRg9GCINC/0L7RgtC10YDRj9C90YsuINCf0YDQvtC00L7Qu9C20LjRgtGMPyc7XHJcblxyXG4gICAgICAgIGlmIChzaG93TWVzc2FnZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBjbG9zZUNvbmZpcm0odGV4dCwgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckFjdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hbmltYXRlKHsnc2Nyb2xsVG9wJzogMTAwfSwgJ3Nsb3cnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqINCS0L3QvtCy0Ywg0YDQtdCz0LjRgdGC0YDQuNGA0YPQtdC8INC30LDQs9GA0YPQt9GH0LjQuiDQstCw0LnQu9C+0LJcclxuICAgICAgICAgICAgICAgICAqINGBINC30LDQtNC10YDQttC60L7QuVxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGRlbGVnYXRlKHRoaXMucmVnVXBsb2FkZXIsIHRoaXMpLCA1MDApO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhckFjdGlvbigpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGRlbGVnYXRlKHRoaXMucmVnVXBsb2FkZXIsIHRoaXMpLCA1MDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0KPQsdC40YDQsNC10Lwg0L7RiNC40LHQutC4INGDINGE0LDQudC70L7QsiAo0LXRgdC70Lgg0LXRgdGC0YwpXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zY29wZS5wb29sLmZpbGVzLmVhY2goZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgZmlsZS5Jbm5lckVycm9yKG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCe0YfQuNGB0YLQutCwINC80LDRgdGC0LXRgNCwINC+0YIg0LTQtdC50YHRgtCy0LjRj1xyXG4gICAgICovXHJcbiAgICBjbGVhckFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aW9uKG51bGwpO1xyXG4gICAgICAgIHRoaXMucmVzdWx0KGZhbHNlKTtcclxuXHJcbiAgICAgICAgY2FuLiQoJ2RpdlthY3Rpb25dJykuaHRtbCgnJyk7XHJcbiAgICAgICAgY2FuLiQoJ2RpdltyZXN1bHRdJykuaHRtbCgnJyk7XHJcbiAgICAgICAgY2FuLiQoJyNzZWxlY3QtZmlsZXMgLmFjdGlvbi1jaGFuZ2Ugc2VsZWN0JykuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3Rpb25Ub1RlbXBhbGUodGhpcy5hY3Rpb25WYWx1ZSgpKTtcclxuICAgICAgICB0aGlzLnNjb3BlLnJlc3VsdChmYWxzZSk7XHJcbiAgICB9XHJcbn0pOyIsInZhciBTaWduQW5kRW5jcnlwdCA9IGNhbi5Db250cm9sKHtcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZWxcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIC8vINCSINC70Y7QsdC+0Lkg0L3QtdC/0L7QvdGP0YLQvdC+0Lkg0YHQuNGC0YPQsNGG0LjQuCDQv9GA0L7RgdGC0L4g0LvQvtC20LjRgdGMINGB0L/QsNGC0YwuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqINCe0KfQldCd0KwsINC+0YfQtdC90Ywg0L/Qu9C+0YXQviEg0J3QtSDQvdGD0LbQvdC+INGC0LDQuiDQtNC10LvQsNGC0YwhISFcclxuICAgICAgICAgICAgICogQHR5cGUge1NpZ25BbmRFbmNyeXB0fVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbiA9IG9wdGlvbnMubWFpbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzLmN1cnJlbnQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZXdfZGV0YWlsID0gbmV3IGNhbi5jb21wdXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLm9wZXJhdGlvbkNvZGUgPSBuZXcgY2FuLmNvbXB1dGUoMCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGFsRmlsZVNlbmQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zaWdBZGRJRCA9IGd1aWQoKTtcclxuICAgICAgICAgICAgdGhpcy5lcnJvclNlbGVjdEVuY1NlcnQgPSBjYW4uY29tcHV0ZShmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdERhdGEgPSBuZXcgY2FuLk1hcCh7XHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICcnLFxyXG4gICAgICAgICAgICAgICAgZmlsZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBzZW5kQWxsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdERhdGEuZmlsZXMuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuZXJyb3IgPT09IHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGZpbGUucGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2hhbmdlOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW1lOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZEZpbGUoZmlsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBiYWNrRmlsZXM6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL0RlZmF1bHQvV2ViRGF2QnJvd3Nlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dBbGVydDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxlcnQgPSBNYXN0ZXIubGF5b3V0Lm1lc3NhZ2UoJ9CS0L3QuNC80LDQvdC40LUhJywgJ9Ce0LTQvdC+0LLRgNC10LzQtdC90L3QviDQvNC+0LbQtdGCINCx0YvRgtGMINC+0YLQv9GA0LDQstC70LXQvdC+INC90LUg0LHQvtC70LXQtSAzMNGC0Lgg0YTQsNC50LvQvtCyICjQvtCx0YDQsNCx0L7RgtCw0L3QviAnICsgdGhpcy5yZXN1bHREYXRhLmZpbGVzLmxlbmd0aCArICcpJywgJ3dhcm5pbmcnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ9CX0LDQutGA0YvRgtGMJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdidG4tZ3JlZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xvc2UuYXBwbHkod2luZG93LCBbTWFzdGVyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmUgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHQgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog0KjQuNGE0YDQvtCy0LDQvdC40LUg0LvQuNGH0L3Ri9C80Lgg0YHRgtGA0YLQuNGE0LjQutCw0YLQsNC80LhcclxuICAgICAgICAgICAgICogQHR5cGUge2Nhbi5jb21wdXRlfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXMgPSBuZXcgY2FuLmNvbXB1dGUoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5waW4gPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZVBpbiA9IG5ldyBjYW4uY29tcHV0ZShudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5uZWVkVG9QSU4gPSBuZXcgY2FuLmNvbXB1dGUobnVsbCk7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDQnNCw0YHRgdC40LIg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXHJcbiAgICAgICAgICAgICAqIEB0eXBlIHtjYW4uTWFwfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZSA9IG5ldyBjYW4uTWFwKHtcclxuICAgICAgICAgICAgICAgIHNpZ25hdHVyZTogbmV3IGNhbi5NYXAuTGlzdChbXSksXHJcbiAgICAgICAgICAgICAgICBlbmNyeXB0aW9uOiBuZXcgY2FuLk1hcC5MaXN0KFtdKSxcclxuICAgICAgICAgICAgICAgIHBlcnNvbmFsOiBuZXcgY2FuLk1hcC5MaXN0KFtdKVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsZWRTZXR0aW5ncyA9IG5ldyBjYW4uTWFwKHtcclxuICAgICAgICAgICAgICAgIHNpZ25hdHVyZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRldGFjaGVkOiB0aGlzLnRlbXBsYXRlKCkuU2V0dGluZ3Muc2lnbmF0dXJlLmRldGFjaGVkID09PSB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHppcFR5cGU6IHRoaXMudGVtcGxhdGUoKS5TZXR0aW5ncy5zaWduYXR1cmUuemlwVHlwZSA9PT0gMixcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1R5cGU6IHRoaXMudGVtcGxhdGUoKS5TZXR0aW5ncy5zaWduYXR1cmUuZW5jb2RpbmdUeXBlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZW5jcnlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nVHlwZTogdGhpcy50ZW1wbGF0ZSgpLlNldHRpbmdzLmVuY3J5cHRpb24uZW5jb2RpbmdUeXBlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYWtlQ2VydGlmaWNhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhbGFjcml0eSA9IGNhbi5NYXAuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIC8vbm90RW5jcnlwdENlcnRpZmljYXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHN1YnNjcmliZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZW5jcnlwdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY2VydGlmaWNhdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbmFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlOiBmYWxzZVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHJ1bjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpYmUgPSB0aGlzLmF0dHIoJ3N1YnNjcmliZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNyeXB0ID0gdGhpcy5hdHRyKCdlbmNyeXB0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbmFsID0gdGhpcy5hdHRyKCdlbmNyeXB0LnBlcnNvbmFsJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY19jZXJ0ID0gc2VsZi5jaGVja0VuY3JpcHRDZXJ0QWN0aXZlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY19wX2NlcnQgPSBzZWxmLmNoZWNrRW5jcmlwdFBlcnNvbmFsQ2VydEFjdGl2ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaWJlLmFjdGl2ZSgpID09IHRydWUgJiYgZW5jcnlwdC5hY3RpdmUoKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3Vic2NyaWJlLmNlcnRpZmljYXRlID09PSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliZS5hY3RpdmUoKSA9PSBmYWxzZSAmJiBlbmNyeXB0LmFjdGl2ZSgpID09IHRydWUgJiYgcGVyc29uYWwuYWN0aXZlKCkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVuY3J5cHQuY2VydGlmaWNhdGUgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaWJlLmFjdGl2ZSgpID09IGZhbHNlICYmIGVuY3J5cHQuYWN0aXZlKCkgPT0gdHJ1ZSAmJiBwZXJzb25hbC5hY3RpdmUoKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfciA9IGVuY3J5cHQuY2VydGlmaWNhdGUgPT09IHRydWUgfHwgcGVyc29uYWwuY2VydGlmaWNhdGUgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3JTZWxlY3RFbmNTZXJ0KF9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliZS5hY3RpdmUoKSA9PSB0cnVlICYmIGVuY3J5cHQuYWN0aXZlKCkgPT0gdHJ1ZSAmJiBwZXJzb25hbC5hY3RpdmUoKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3IgPSBlbmNyeXB0LmNlcnRpZmljYXRlID09PSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lcnJvclNlbGVjdEVuY1NlcnQoX3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3Vic2NyaWJlLmNlcnRpZmljYXRlID09PSB0cnVlICYmIF9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliZS5hY3RpdmUoKSA9PSB0cnVlICYmIGVuY3J5cHQuYWN0aXZlKCkgPT0gdHJ1ZSAmJiBwZXJzb25hbC5hY3RpdmUoKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfciA9IGVuY3J5cHQuY2VydGlmaWNhdGUgPT09IHRydWUgfHwgcGVyc29uYWwuY2VydGlmaWNhdGUgPT09IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVycm9yU2VsZWN0RW5jU2VydChfcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJzY3JpYmUuY2VydGlmaWNhdGUgPT09IHRydWUgJiYgX3I7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5jX2NlcnQgPT09IHRydWUgfHwgZW5jX3BfY2VydCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVycm9yU2VsZWN0RW5jU2VydChfcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5jX2NlcnQgPT09IGZhbHNlIHx8IGVuY19wX2NlcnQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3JTZWxlY3RFbmNTZXJ0KF9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eSA9IG5ldyBhbGFjcml0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLmFsYWNyaXR5LmF0dHIoJ3N1YnNjcmliZS5hY3RpdmUnLCB0aGlzLnN1YnNjcmliZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWxhY3JpdHkuYXR0cignc3Vic2NyaWJlLmNlcnRpZmljYXRlJywgdGhpcy5jZXJ0aWZpY2F0ZS5zaWduYXR1cmUpO1xyXG4gICAgICAgICAgICB0aGlzLmFsYWNyaXR5LmF0dHIoJ2VuY3J5cHQuYWN0aXZlJywgdGhpcy5lbmNyeXB0KTtcclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgdGhpcy5jZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LnBlcnNvbmFsLmFjdGl2ZScsIHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzKTtcclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LnBlcnNvbmFsLmNlcnRpZmljYXRlJywgdGhpcy5jZXJ0aWZpY2F0ZS5wZXJzb25hbCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFsYWNyaXR5LmJpbmQoJ2NoYW5nZScsIGRlbGVnYXRlKGZ1bmN0aW9uIChldiwgYXR0ciwgaG93LCBuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF0dHIgIT09ICdlbmNyeXB0LmNlcnRpZmljYXRlJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvclNlbGVjdEVuY1NlcnQoKGF0dHIgPT09ICdlbmNyeXB0LmNlcnRpZmljYXRlJyAmJiAobmV3VmFsID09PSB0cnVlIHx8IG5ld1ZhbC5sZW5ndGggPiAwKSkgPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucmVzdWx0RGF0YSlcclxuICAgICAgICAgICAgLy8g0L/RjNGP0L0sINC40YHQv9GA0LDQstC40YLRjCDQv9C+0LfQttC1XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gY2FuLnZpZXcoJy9Bc3NldHMvdmlld3MvbWFzdGVyL2FjdGl2aXR5L3NpZ25fYW5kX2VuY3J5cHQuaGJzJywge1xyXG4gICAgICAgICAgICAgICAgYTogdGhpcy5hbGFjcml0eSxcclxuICAgICAgICAgICAgICAgIHNpZ2lkOiB0aGlzLnNpZ0FkZElELFxyXG4gICAgICAgICAgICAgICAgZXJyb3JTZWxlY3RFbmNTZXJ0OiB0aGlzLmVycm9yU2VsZWN0RW5jU2VydCxcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmaWxlczogZGVsZWdhdGUodGhpcy5tYWluLnJlRmlsZXMsIHRoaXMubWFpbiwgW3RydWUsICfQktGLINGD0LLQtdGA0LXQvdGLLCDRh9GC0L4g0YXQvtGC0LjRgtC1INC/0L7QstGC0L7RgNC40YLRjCDQvtC/0LXRgNCw0YbQuNGOINGBINC90LDRh9Cw0LvQsD8g0JLRgdC1INC90LUg0YHQvtGF0YDQsNC90LXQvdC90YvQtSDQtNCw0L3QvdGL0LUg0LHRg9C00YPRgiDQv9C+0YLQtdGA0Y/QvdGLISddKSxcclxuICAgICAgICAgICAgICAgICAgICB2aWV3X2RldGFpbDogdGhpcy52aWV3X2RldGFpbCxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VfZGV0YWlsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3X2RldGFpbCh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3X2RldGFpbChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlX2NlcnRpZmljYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZTogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNlbGVjdENlcnRpZmljYXRlKCdteScsIGRlbGVnYXRlKGZ1bmN0aW9uIChhcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyTGlzdCh0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZSkucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBpdGVtLlRodW1icHJpbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdzdWJzY3JpYmUuY2VydGlmaWNhdGUnLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vINCa0J7QodCi0KvQm9CsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXModHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY3J5cHRpb246IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZWxlY3RDZXJ0aWZpY2F0ZSgnYWxsJywgZGVsZWdhdGUoZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBpdGVtLlRodW1icHJpbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25hbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNlbGVjdENlcnRpZmljYXRlKCdsaXN0JywgZGVsZWdhdGUoZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLnBlcnNvbmFsLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzaDogaXRlbS5UaHVtYnByaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxhY3JpdHkuYXR0cignZW5jcnlwdC5wZXJzb25hbC5jZXJ0aWZpY2F0ZScsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g0JrQntCh0KLQq9Cb0KxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcyh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnQ6IHRoaXMuc2NvcGUucG9vbC5hbGxNeUNlcnRpZmljYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2Vfc3Vic2NyaWJlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKGVsLmlzKCc6Y2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlX2VuY3J5cHQ6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0KGVsLmlzKCc6Y2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VfZW5jcnlwdF9wZXJzb25hbDogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcyhlbC5pcygnOmNoZWNrZWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbl9ydW46IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCghdGhpcy5jZXJ0aWZpY2F0ZS5zaWduYXR1cmUubGVuZ3RoIHx8IHRoaXMuY2VydGlmaWNhdGUuc2lnbmF0dXJlLmxlbmd0aCA9PSAwKSB8fCB0aGlzLnN1YnNjcmliZSgpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW4oZmFsc2UsICcnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBpbkNvZGUodGhpcy5jZXJ0aWZpY2F0ZS5zaWduYXR1cmVbMF0uZGF0YS5UaHVtYnByaW50LCBkZWxlZ2F0ZShmdW5jdGlvbiAobmVlZCwgcGluLCBzYXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bihuZWVkLCBwaW4sIHNhdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSx7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBjYW5jZWw6IGRlbGVnYXRlKHRoaXMubWFpbi5yZUZpbGVzLCB0aGlzLm1haW4sIFt0cnVlXSksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICAgICAqINCj0LTQsNC70LXQvdC40LUg0YHQtdGA0YLQuNGE0LjQutCw0YLQvtCyXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY3J5cHRpb246IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwsIGV2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24uZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoc2VydCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VydC5oYXNoID09PSBzY29wZS5oYXNoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24uc3BsaWNlKHMsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbmFsOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsLCBldikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5wZXJzb25hbC5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChzZXJ0LCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXJ0Lmhhc2ggPT09IHNjb3BlLmhhc2gpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBpbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUucGVyc29uYWwuc3BsaWNlKHMsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlcnRpZmljYXRlLnBlcnNvbmFsLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxhY3JpdHkuYXR0cignZW5jcnlwdC5wZXJzb25hbC5jZXJ0aWZpY2F0ZScsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g0JrQntCh0KLQq9Cb0KxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcyhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXModHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogdGhpcy5yZXN1bHQsXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbl9jaGFuZ2U6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDb25maXJtKCfQn9GA0Lgg0YHQvNC10L3QtSDRgdC+0YHRgtCw0LLQsCDRgdC10YDRgtC40YTQuNC60LDRgtC+0LIg0Lgg0LjRhSDQv9Cw0YDQsNC80LXRgtGA0LDRhSDQstGB0LUg0LjQt9C80LXQvdC10L3QuNGPLCDRgdC00LXQu9Cw0L3QvdGL0LUg0L3QsCDQv9C+0YHQu9C10LTRg9GO0YnQuNGFINGN0YLQsNC/0LDRhSwg0LHRg9C00YPRgiDQv9C+0YLQtdGA0Y/QvdGLLiDQn9GA0L7QtNC+0LvQttC40YLRjD8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbihudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmxheW91dC50ZW1wbGF0ZUxvY2soZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5yZXN1bHQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgc2VydF9kb3dubG9hZDogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKGZvcm1hdCgnL2RlZmF1bHQvR2V0Q2VydGlmaWNhdGU/dGh1bWJQcmludD0ldXJsJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyV1cmwnOiBzY29wZS5oYXNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN1YnNjcmliZTogdGhpcy5zdWJzY3JpYmUsXHJcbiAgICAgICAgICAgICAgICBlbmNyeXB0OiB0aGlzLmVuY3J5cHQsXHJcbiAgICAgICAgICAgICAgICBlbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXM6IHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzLFxyXG5cclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLmNlcnRpZmljYXRlLFxyXG4gICAgICAgICAgICAgICAgZGV0YWlsZWRTZXR0aW5nczogdGhpcy5kZXRhaWxlZFNldHRpbmdzLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0RGF0YTogdGhpcy5yZXN1bHREYXRhLFxyXG4gICAgICAgICAgICAgICAgbW9yZVRoYW5UaGlydHlGaWxlczogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlLCBlbCwgZXYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5wb29sLmZpbGVzLmxlbmd0aCA+IDMwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG5cclxuXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGlmQ291bnRDZXJ0OiBkZWxlZ2F0ZShmdW5jdGlvbiAoY2VydCwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qc2V0VGltZW91dChkZWxlZ2F0ZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNlcnRpZmljYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksIDEwMDApOyovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUucG9vbC5hbGxNeUNlcnRpZmljYXRlLmxlbmd0aCA+IDEgfHwgY2VydC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVsLmFwcGVuZCh2aWV3KTsgLy90aGlzLmNlcnRpZmljYXRlXHJcblxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqINCS0YvQsdC40YDQsNC10Lwg0LvQuNGH0L3Ri9C5INGB0LXRgNGC0LjRhNC40LrQsNGCINC10YHQu9C4INC+0L0g0LXRgdGC0YxcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIC8qaWYodGhpcy5zY29wZS5wb29sLmFsbE15Q2VydGlmaWNhdGUubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgIHZhciB0aCA9IHRoaXMuc2NvcGUucG9vbC50ZW1wbGF0ZXMuY3VycmVudCgpLlNldHRpbmdzLnJhdy5zZXJpYWxpemUoKS5fU2lnbmF0dXJlU2V0dGluZ3MuU2lnbmVyQ2VydGlmaWNhdGUxO1xyXG5cclxuICAgICAgICAgICAgIGlmKHRoICE9PSBudWxsICYmIHRoLmxlbmd0aCA8IDEwKSB7XHJcbiAgICAgICAgICAgICB2YXIgX19teV9jZXJ0ID0gIHRoaXMuc2NvcGUucG9vbC5hbGxNeUNlcnRpZmljYXRlWzBdO1xyXG5cclxuICAgICAgICAgICAgIGNsZWFyTGlzdCh0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZSkucHVzaCh7XHJcbiAgICAgICAgICAgICBoYXNoOiBfX215X2NlcnQuVGh1bWJwcmludCxcclxuICAgICAgICAgICAgIGRhdGE6IF9fbXlfY2VydCxcclxuICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxyXG4gICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdzdWJzY3JpYmUuY2VydGlmaWNhdGUnLCB0cnVlKTtcclxuICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wuYWxsTXlDZXJ0aWZpY2F0ZS5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uKGNlcnQpe1xyXG4gICAgICAgICAgICAgaWYoY2VydC5UaHVtYnByaW50ID09PSB0aCkge1xyXG4gICAgICAgICAgICAgY2xlYXJMaXN0KHRoaXMuY2VydGlmaWNhdGUuc2lnbmF0dXJlKS5wdXNoKHtcclxuICAgICAgICAgICAgIGhhc2g6IGNlcnQuVGh1bWJwcmludCxcclxuICAgICAgICAgICAgIGRhdGE6IGNlcnQsXHJcbiAgICAgICAgICAgICBhY3RpdmU6IHRydWVcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLmFsYWNyaXR5LmF0dHIoJ3N1YnNjcmliZS5jZXJ0aWZpY2F0ZScsIHRydWUpO1xyXG4gICAgICAgICAgICAgfSovXHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzLmN1cnJlbnQuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZSh0aGlzLm1ha2VDZXJ0aWZpY2F0ZSwgdGhpcyksIDQwMDApO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24uYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0KHRoaXMuY2VydGlmaWNhdGUuZW5jcnlwdGlvbi5sZW5ndGggPCAwID8gdHJ1ZSA6IGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5jcnlwdCh0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24ubGVuZ3RoID4gMCA/IHRydWUgOiBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0VuY3JpcHRDZXJ0QWN0aXZlKCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUucGVyc29uYWwuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0VuY3JpcHRQZXJzb25hbENlcnRBY3RpdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDQmtCe0KHQotCr0JvQrFxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXModHJ1ZSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIGNhbi5iaW5kLmNhbGwodGhpcy5zY29wZSwgJ2Nsb3NlX3dpbmRvd19zZW5kX2ZpbGUnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RhbEZpbGVTZW5kICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RhbEZpbGVTZW5kLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kYWxGaWxlU2VuZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDQntGC0YHQu9C10LbQuNCy0LDQtdC8INGB0L7QsdGL0YLQuNC1INGA0LXQs9C40YHRgtGA0LjRgNC+0LLQsNC90LjRjyDQt9Cw0LPRgNGD0LfRh9C40LrQsFxyXG4gICAgICAgICAgICAgKiDQv9C+0LvRjNC30L7QstCw0YLQtdC70YzRgdC60LjRhSDRgdC10YDRgtC40YTQuNC60LDRgtC+0LJcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNhbi5iaW5kLmNhbGwod2luZG93LCAncmVnX3VwbG9hZF9lbmNfc2VyJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChkZWxlZ2F0ZSh0aGlzLmFkZFJlY2lwaWVudENlcnRpZmljYXRlLCB0aGlzKSwgMjAwKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmUuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0F2YWlsYWJpbGl0eUNlcnRpZmljYXRlcygpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHQuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0F2YWlsYWJpbGl0eUNlcnRpZmljYXRlcygpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcy5iaW5kKCdjaGFuZ2UnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQXZhaWxhYmlsaXR5Q2VydGlmaWNhdGVzUGVyc29uYWwoKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lcnJvclNlbGVjdEVuY1NlcnQuYmluZCgnY2hhbmdlJywgZGVsZWdhdGUoZnVuY3Rpb24gKGV2LCBuZXdWYWwsIG9sZFZhbCkge1xyXG5cclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGRlbGVnYXRlKHRoaXMuY2hlY2tBdmFpbGFiaWxpdHlDZXJ0aWZpY2F0ZXMsIHRoaXMpLCA1MDApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQv9C+0LTQv9C40YHQsNC90LjQuCDQuNC70Lgg0YjQuNGE0YDQvtCy0LDQvdC40LguIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKChjYW4uJC5pbkFycmF5KG9wdGlvbnMuYWN0aW9uTmFtZSwgWydzdWJzY3JpYmUnLCAnc3Vic2NyaWJlX2FuZF9lbmNyeXB0J10pICE9PSAtMSkgPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHQoKGNhbi4kLmluQXJyYXkob3B0aW9ucy5hY3Rpb25OYW1lLCBbJ2VuY3J5cHQnLCAnc3Vic2NyaWJlX2FuZF9lbmNyeXB0J10pICE9PSAtMSkgPyB0cnVlIDogZmFsc2UpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGNhbi50cmlnZ2VyKHRoaXMuc2NvcGUsICdhY3Rpb25fb2theScsIFt0aGlzLnNjb3BlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtCy0LXRgNGP0LXRgiDQtNC+0YHRgtGD0L/QvSDQu9C4INC30YXQvtGC0Y/QsdGLINC+0LTQuNC9INGB0LXRgNGC0LjRhNC40LrQsNGCINC00LvRjyDRiNC40YTRgNC+0LLQsNC90LjRj1xyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGNoZWNrRW5jcmlwdENlcnRBY3RpdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY2VydEFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY2VydGlmaWNhdGUuZW5jcnlwdGlvbi5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChjZXJ0KSB7XHJcbiAgICAgICAgICAgIGlmIChjZXJ0LmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIGNlcnRBY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgY2VydEFjdGl2ZSA9PT0gdHJ1ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjZXJ0QWN0aXZlID09PSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0VuY3JpcHRQZXJzb25hbENlcnRBY3RpdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY2VydEFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY2VydGlmaWNhdGUucGVyc29uYWwuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoY2VydCkge1xyXG4gICAgICAgICAgICBpZiAoY2VydC5hY3RpdmUpXHJcbiAgICAgICAgICAgICAgICBjZXJ0QWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxhY3JpdHkuYXR0cignZW5jcnlwdC5wZXJzb25hbC5jZXJ0aWZpY2F0ZScsIGNlcnRBY3RpdmUgPT09IHRydWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2VydEFjdGl2ZSA9PT0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tBdmFpbGFiaWxpdHlDZXJ0aWZpY2F0ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbGFjcml0eSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgdGhpcy5jZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uLmxlbmd0aCA+IDApO1xyXG4gICAgICAgICAgICB0aGlzLmFsYWNyaXR5LmF0dHIoJ2VuY3J5cHQucGVyc29uYWwuY2VydGlmaWNhdGUnLCB0aGlzLmNlcnRpZmljYXRlLnBlcnNvbmFsLmxlbmd0aCA+IDApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdzdWJzY3JpYmUuY2VydGlmaWNhdGUnLCB0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZS5sZW5ndGggPiAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1YnNjcmliZSgpID09PSB0cnVlICYmIHRoaXMuY2VydGlmaWNhdGUuc2lnbmF0dXJlLmxlbmd0aCA9PT0gMCAmJiB0aGlzLnNjb3BlLnBvb2wuYWxsTXlDZXJ0aWZpY2F0ZS5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBfX215X2NlcnQgPSB0aGlzLnNjb3BlLnBvb2wuYWxsTXlDZXJ0aWZpY2F0ZVswXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhckxpc3QodGhpcy5jZXJ0aWZpY2F0ZS5zaWduYXR1cmUpLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IF9fbXlfY2VydC5UaHVtYnByaW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IF9fbXlfY2VydCxcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKHRydWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g0JrQntCh0KLQq9Cb0KxcclxuICAgICAgICAgICAgICAgJCgnI2ExJykudHJpZ2dlcignY2xpY2snKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVnVGlwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIHRpcEpvaW50OiBcImxlZnRcIixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmNWQyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZmVlOGFlJ1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJChcIi5qcy10ZXN0LWNlcnRpZmljYXRlLXRpcFwiKS5lYWNoKGZ1bmN0aW9uKGksZWwpe1xyXG4gICAgICAgICAgICAgICAgbmV3IE9wZW50aXAoJChlbCksICfQodC10YDRgtC40YTQuNC60LDRgiDQstGL0L/Rg9GJ0LXQvSDQsdC10Lcg0YPRh9Cw0YHRgtC40Y88YnI+0LDQutC60YDQtdC00LjRgtC+0LLQsNC90L3QvtCz0L4g0KPQtNC+0YHRgtC+0LLQtdGA0Y/RjtGJ0LXQs9C+PGJyPtCm0LXQvdGC0YDQsCDQuCDQvdC1INC40LzQtdC10YIg0Y7RgNC40LTQuNGH0LXRgdC60L7QuSDRgdC40LvRiy4nLCAnJywgcmVnVGlwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBPcGVudGlwLmxhc3RaSW5kZXggPSA5MDAwO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INC/0L7QtNC/0LjRgdCw0L3QuNC4INC40LvQuCDRiNC40YTRgNC+0LLQsNC90LjQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0F2YWlsYWJpbGl0eUNlcnRpZmljYXRlc1BlcnNvbmFsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzKCkgPT09IHRydWUgJiYgdGhpcy5zY29wZS5wb29sLmFsbE15Q2VydGlmaWNhdGUubGVuZ3RoID09PSAxICYmIHRoaXMuY2VydGlmaWNhdGUucGVyc29uYWwubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgX19teV9jZXJ0ID0gdGhpcy5zY29wZS5wb29sLmFsbE15Q2VydGlmaWNhdGVbMF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLnBlcnNvbmFsLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaGFzaDogX19teV9jZXJ0LlRodW1icHJpbnQsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBfX215X2NlcnQsXHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcyhmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgYWRkUmVjaXBpZW50Q2VydGlmaWNhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZGVyID0gbmV3IHBsdXBsb2FkLlVwbG9hZGVyKHtcclxuICAgICAgICAgICAgICAgIHJ1bnRpbWVzOiAnaHRtbDUnLFxyXG4gICAgICAgICAgICAgICAgYnJvd3NlX2J1dHRvbjogdGhpcy5zaWdBZGRJRCxcclxuICAgICAgICAgICAgICAgIG1heF9maWxlX3NpemU6ICcyMG1iJyxcclxuICAgICAgICAgICAgICAgIHVybDogJy9NYXN0ZXIvQWRkUmVjaXBpZW50Q2VydGlmaWNhdGUnLFxyXG4gICAgICAgICAgICAgICAgZmlsdGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbWVfdHlwZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aXRsZTogXCJDZXJ0aWZpY2F0ZVwiLCBleHRlbnNpb25zOiBcImNlclwiIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW5pdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIEZpbGVzQWRkZWQ6IGRlbGVnYXRlKGZ1bmN0aW9uICh1cCwgZmlsZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkZXIuc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgRmlsZVVwbG9hZGVkOiBkZWxlZ2F0ZShmdW5jdGlvbiAodXAsIGZpbGUsIGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9ICh0eXBlb2YgaW5mby5yZXNwb25zZSA9PT0gJ3N0cmluZycpID8gSlNPTi5wYXJzZShpbmZvLnJlc3BvbnNlKSA6IGluZm8ucmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSAnb2snKSB7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUuZW5jcnlwdGlvbi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiByZXMuQWRkZWRDZXJ0aWZpY2F0ZS5UaHVtYnByaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlcy5BZGRlZENlcnRpZmljYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGFjcml0eS5hdHRyKCdlbmNyeXB0LmNlcnRpZmljYXRlJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXBsb2FkUHJvZ3Jlc3M6IGRlbGVnYXRlKGZ1bmN0aW9uICh1cCwgZmlsZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgU3RhdGVDaGFuZ2VkOiBkZWxlZ2F0ZShmdW5jdGlvbiAodXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwLnN0YXRlID09IHBsdXBsb2FkLlNUQVJURUQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZGVyLmluaXQoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0RXJyb3IoJ9Cd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0L/QvtC00L/QuNGB0LDQvdC40Lgg0LjQu9C4INGI0LjRhNGA0L7QstCw0L3QuNC4LiBcIiVtZXNzYWdlXCInLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDZXJ0aWZpY2F0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNsZWFyTGlzdCh0aGlzLmNlcnRpZmljYXRlLmVuY3J5cHRpb24pO1xyXG4gICAgICAgICAgICBjbGVhckxpc3QodGhpcy5jZXJ0aWZpY2F0ZS5zaWduYXR1cmUpO1xyXG4gICAgICAgICAgICBjbGVhckxpc3QodGhpcy5jZXJ0aWZpY2F0ZS5wZXJzb25hbCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmF0dHIoJ2VuY3J5cHRpb24nLCBbXSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUuYXR0cignc2lnbmF0dXJlJywgW10pO1xyXG4gICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLmF0dHIoJ3BlcnNvbmFsJywgW10pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzLmN1cnJlbnQoKTtcclxuXHJcbiAgICAgICAgICAgIG5ldyBMb2dnZXIoWyfQn9C10YDQtdGB0YLRgNC+0LnQutCwINGI0LDQsdC70L7QvdC+0LIgLSAo0KjQuNGE0YDQvtCy0LDQvdC40Y8gLSAlYSA6INCf0L7QtNC/0LjRgdC4IC0gJWIpJywge1xyXG4gICAgICAgICAgICAgICAgJyVhJzogdC5DZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICclYic6IHQuQ2VydGlmaWNhdGUuc2lnbmF0dXJlLmxlbmd0aFxyXG4gICAgICAgICAgICB9XSk7XHJcblxyXG4gICAgICAgICAgICB0LkNlcnRpZmljYXRlLmVuY3J5cHRpb24uZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoc2VyKSB7XHJcbiAgICAgICAgICAgICAgICBzZXIuYXR0cignYWN0aXZlJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uLnB1c2goc2VyKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdC5DZXJ0aWZpY2F0ZS5zaWduYXR1cmUuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoc2VyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZS5wdXNoKHNlcik7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsZWRTZXR0aW5ncy5zaWduYXR1cmUuYXR0cignZW5jb2RpbmdUeXBlJywgdC5TZXR0aW5ncy5zaWduYXR1cmUuZW5jb2RpbmdUeXBlKTtcclxuICAgICAgICAgICAgdGhpcy5kZXRhaWxlZFNldHRpbmdzLmVuY3J5cHRpb24uYXR0cignZW5jb2RpbmdUeXBlJywgdC5TZXR0aW5ncy5lbmNyeXB0aW9uLmVuY29kaW5nVHlwZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWlsZWRTZXR0aW5ncy5zaWduYXR1cmUuYXR0cignZGV0YWNoZWQnLCB0LlNldHRpbmdzLnNpZ25hdHVyZS5kZXRhY2hlZCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodC5DZXJ0aWZpY2F0ZS5wZXJzb25hbC5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdC5DZXJ0aWZpY2F0ZS5wZXJzb25hbC5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5wZXJzb25hbC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzaDogaXRlbS5UaHVtYnByaW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXMoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmNyeXB0UGVyc29uYWxDZXJ0aWZpY2F0ZXModHJ1ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuY3J5cHRQZXJzb25hbENlcnRpZmljYXRlcyh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5jcnlwdFBlcnNvbmFsQ2VydGlmaWNhdGVzKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jaGVja0F2YWlsYWJpbGl0eUNlcnRpZmljYXRlcygpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIC8vINCa0J7QodCi0KvQm9CsXHJcbiAgICAgICAgICAgIHRoaXMuZW5jcnlwdCghdGhpcy5lbmNyeXB0KCkpO1xyXG4gICAgICAgICAgICB0aGlzLmVuY3J5cHQoIXRoaXMuZW5jcnlwdCgpKTtcclxuXHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQv9C+0LTQv9C40YHQsNC90LjQuCDQuNC70Lgg0YjQuNGE0YDQvtCy0LDQvdC40LguIFwiJW1lc3NhZ2VcIicsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9C+0LTQs9C+0YLQvtCy0LrQsCDQvdCw0YHRgtGA0L7QtdC6LlxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIHByZXBhcmVTZXR0aW5nczogZnVuY3Rpb24gKHBpbikge1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuc2NvcGUucG9vbC50ZW1wbGF0ZXMuY3VycmVudCgpLlNldHRpbmdzLnJhdy5zZXJpYWxpemUoKTtcclxuXHJcbiAgICAgICAgc2V0dGluZ3MuX1NpZ25hdHVyZVNldHRpbmdzLkRldGFjaGVkID0gIXRoaXMuZGV0YWlsZWRTZXR0aW5ncy5zaWduYXR1cmUuZGV0YWNoZWQ7XHJcbiAgICAgICAgc2V0dGluZ3MuX1NpZ25hdHVyZVNldHRpbmdzLlppcFR5cGUgPSB0aGlzLmRldGFpbGVkU2V0dGluZ3Muc2lnbmF0dXJlLnppcFR5cGUgPT09IHRydWUgPyAxIDogMDtcclxuICAgICAgICBzZXR0aW5ncy5fU2lnbmF0dXJlU2V0dGluZ3MuX0VuY29kaW5nVHlwZSA9IHRoaXMuZGV0YWlsZWRTZXR0aW5ncy5zaWduYXR1cmUuZW5jb2RpbmdUeXBlO1xyXG5cclxuICAgICAgICBzZXR0aW5ncy5fRW5jcnlwdGlvblNldHRpbmdzLl9FbmNvZGluZ1R5cGUgPSB0aGlzLmRldGFpbGVkU2V0dGluZ3MuZW5jcnlwdGlvbi5lbmNvZGluZ1R5cGU7XHJcblxyXG4gICAgICAgIHNldHRpbmdzLl9TaWduYXR1cmVTZXR0aW5ncy5LZXlzZXRQYXNzd29yZCA9IHBpbjtcclxuXHJcbiAgICAgICAgc2V0dGluZ3MuX0VuY3J5cHRpb25TZXR0aW5ncy5SZWNpcGllbnRDZXJ0aWZpY2F0ZXMxID0gW107XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZS5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIHNldHRpbmdzLl9TaWduYXR1cmVTZXR0aW5ncy5TaWduZXJDZXJ0aWZpY2F0ZTEgPSB0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZVswXS5oYXNoXHJcblxyXG4gICAgICAgIHRoaXMuY2VydGlmaWNhdGUuZW5jcnlwdGlvbi5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLl9FbmNyeXB0aW9uU2V0dGluZ3MuUmVjaXBpZW50Q2VydGlmaWNhdGVzMSA9IHB1c2goc2V0dGluZ3MuX0VuY3J5cHRpb25TZXR0aW5ncy5SZWNpcGllbnRDZXJ0aWZpY2F0ZXMxLCBpdGVtLmhhc2gpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5wZXJzb25hbC5lYWNoKGRlbGVnYXRlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLl9FbmNyeXB0aW9uU2V0dGluZ3MuUmVjaXBpZW50Q2VydGlmaWNhdGVzMSA9IHB1c2goc2V0dGluZ3MuX0VuY3J5cHRpb25TZXR0aW5ncy5SZWNpcGllbnRDZXJ0aWZpY2F0ZXMxLCBpdGVtLmhhc2gpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgbmV3IExvZ2dlcign0J/QvtC00LPQvtGC0L7QstC70LXQvdC90YvQtSDQvdCw0YHRgtGA0L7QudC60LgnLCAnbG9nJywgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpO1xyXG4gICAgfSxcclxuXHJcbiAgICBydW46IGZ1bmN0aW9uIChuZWVkLCBwaW4sIHNhdmUpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDQn9GA0L7QstC10YDQutCwINC90LAg0L/QuNC9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5vcGVyYXRpb25Db2RlKCh0aGlzLnN1YnNjcmliZSgpID09PSB0cnVlICYmIHRoaXMuZW5jcnlwdCgpID09PSB0cnVlKSA/IDUgOiAoKHRoaXMuc3Vic2NyaWJlKCkgPT09IHRydWUpID8gMSA6IDIpKTtcclxuXHJcbiAgICAgICAgdmFyIGFqYXhPYmosIHByb2Nlc3NJRCA9IHRoaXMuc2NvcGUuaXByb2Nlc3MuYWRkKCh0aGlzLm9wZXJhdGlvbkNvZGUoKSA9PT0gMSkgPyAn0JLRi9C/0L7Qu9C90Y/QtdGC0YHRjyDQv9C+0LTQv9C40YHRjCDRhNCw0LnQu9C+0LIuLi4nIDogKCh0aGlzLm9wZXJhdGlvbkNvZGUoKSA9PT0gMikgPyAn0JLRi9C/0L7Qu9C90Y/QtdGC0YHRjyDRiNC40YTRgNC+0LLQsNC90LjQtSDRhNCw0LnQu9C+0LInIDogJ9CS0YvQv9C+0LvQvdGP0LXRgtGB0Y8g0L/QvtC00L/QuNGB0Ywg0Lgg0YjQuNGE0YDQvtCy0LDQvdC40LUg0YTQsNC50LvQvtCyLi4uJyksIGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYWpheE9iai5hYm9ydCgpO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICBhamF4T2JqID0gdGhpcy5zY29wZS5yZXEuYmVnaW4oJ21ha2Vfb3BlcmF0aW9uJywge1xyXG4gICAgICAgICAgICBzZXR0aW5nc0pTT046IHRoaXMucHJlcGFyZVNldHRpbmdzKHBpbiksXHJcbiAgICAgICAgICAgIHNpZ25lZEZpbGVJbmZvc0pTT046IHRoaXMuc2NvcGUuZ2V0RmlsZXNTdHJpbmcoKSxcclxuICAgICAgICAgICAgdHlwZTogdGhpcy5vcGVyYXRpb25Db2RlKCksXHJcbiAgICAgICAgICAgIHNhdmVQSU46IHNhdmUsXHJcbiAgICAgICAgICAgIG5lZWRUb1BJTjogbmVlZFxyXG4gICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0KHRydWUpO1xyXG4gICAgICAgICAgICBjYW4udHJpZ2dlcih3aW5kb3csICdwcm9jZXNzX2V4aXQnLCBbcHJvY2Vzc0lEXSk7XHJcblxyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGRhdGEuZGF0YS5PcGVyYXRpb25SZXN1bHQsXHJcbiAgICAgICAgICAgICAgICBmaWxlc1Jlc3VsdCA9IHJlc3VsdC5PcGVyYXRpb25SZXN1bHRzLFxyXG4gICAgICAgICAgICAgICAgZ2xvYkVycm9yID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LkV4Y2VwdGlvbiAhPT0gbnVsbCAmJiAkLmluQXJyYXkocmVzdWx0LkV4Y2VwdGlvbi5Db2RlLCBbLTIxNDY0MzQ5NjUsIC0yMTQ3NDY3MjU5XSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBuZXcgTG9nZ2VyKCdQSU4gRVJST1IhISEnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIG5ldyBQaW5Db2RlKHRoaXMuY2VydGlmaWNhdGUuc2lnbmF0dXJlWzBdLmRhdGEuVGh1bWJwcmludCwgZGVsZWdhdGUoZnVuY3Rpb24gKG5lZWQsIHBpbiwgc2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuKG5lZWQsIHBpbiwgc2F2ZSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHBpbkVycm9yOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgd3JvbmdTYXZlZFBpbiA6IHBpbj09bnVsbFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBnb3N0XHJcbiAgICAgICAgICAgIHZhciByZXN0cmljdGVkTWVzc2FnZSA9ICcnO1xyXG4gICAgICAgICAgICB2YXIgaXNSZXN0cmljdGVkRmlsZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgZmlsZXNSZXN1bHQuZm9yRWFjaChkZWxlZ2F0ZShmdW5jdGlvbihlbCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgb3BSZXN1bHQgPSAhIWVsLkZpcnNPcGVyYXRpb25SZXN1bHQgPyBlbC5GaXJzT3BlcmF0aW9uUmVzdWx0IDogZWw7XHJcbiAgICAgICAgICAgICAgICBpZiAob3BSZXN1bHQuRXhjZXB0aW9uICYmIG9wUmVzdWx0LkV4Y2VwdGlvbi5Db2RlICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFJlc3VsdC5FeGNlcHRpb24uQ29kZSA9PSAtMjAwMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdHJpY3RlZE1lc3NhZ2UgPSBvcFJlc3VsdC5FeGNlcHRpb24uTWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN0cmljdGVkTWVzc2FnZSA9ICfQn9GA0Lgg0L/RgNC+0LLQtdC00LXQvdC40Lgg0L7Qv9C10YDQsNGG0LjQuCDQv9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwLCDQv9C+0LLRgtC+0YDQuNGC0LUg0L7Qv9C10YDQsNGG0LjRjiDQv9C+0LfQttC1ISc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlzUmVzdHJpY3RlZEZpbGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzUmVzdHJpY3RlZEZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpbmZvTWVzc2FnZShyZXN0cmljdGVkTWVzc2FnZSwgZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vINCy0LTRgNGD0LMg0L/RgNC40LPQvtC00LjRgtGB0Y8gOilcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFpbi5yZUZpbGVzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LkV4Y2VwdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHREYXRhLmF0dHIoJ2Vycm9yJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdERhdGEuYXR0cignZXJyb3JNZXNzYWdlJywgcmVzdWx0LkV4Y2VwdGlvbi5NZXNzYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY3JvbGwoMTAwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGFyclN0YXR1cyA9IHtcclxuICAgICAgICAgICAgICAgIDE6ICfQo9GB0L/QtdGI0L3QviDQv9C+0LTQv9C40YHQsNC9JyxcclxuICAgICAgICAgICAgICAgIDI6ICfQo9GB0L/QtdGI0L3QviDQt9Cw0YjQuNGE0YDQvtCy0LDQvScsXHJcbiAgICAgICAgICAgICAgICA1OiAn0KPRgdC/0LXRiNC90L4g0L/QvtC00L/QuNGB0LDQvSDQuCDQt9Cw0YjQuNGE0YDQvtCy0LDQvSdcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNsZWFyTGlzdCh0aGlzLnJlc3VsdERhdGEuZmlsZXMpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5jdXJyZW50KCkuU2V0dGluZ3MucmF3LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmlzVGVzdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2VydGlmaWNhdGUuc2lnbmF0dXJlLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNlcnRpZmljYXRlLnNpZ25hdHVyZVswXS5kYXRhLklzVGVzdCApXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzVGVzdCA9IHRydWUgO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZS5lbmNyeXB0aW9uLmVhY2goZGVsZWdhdGUoZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmFjdGl2ZSAmJiBpdGVtLmRhdGEuSXNUZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Rlc3QgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUucGVyc29uYWwuZWFjaChkZWxlZ2F0ZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uYWN0aXZlICYmIGl0ZW0uZGF0YS5Jc1Rlc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVGVzdCA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgY2FuLmVhY2goZmlsZXNSZXN1bHQsIGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzRXJyb3IgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2RlID0gdGhpcy5vcGVyYXRpb25Db2RlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aE5hbWUsIE9wZXJhdGVkRmlsZSwgZXJyb3JNZXNzYWdlID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDEpIHsgLy8g0J/QvtC00L/QuNGB0YxcclxuICAgICAgICAgICAgICAgICAgICBPcGVyYXRlZEZpbGUgPSBwYXRoTmFtZSA9IGZpbGUuU2lnbmVkRmlsZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gMikgeyAvLyDQqNC40YTRgNC+0LLQsNC90LjQtVxyXG4gICAgICAgICAgICAgICAgICAgIE9wZXJhdGVkRmlsZSA9IHBhdGhOYW1lID0gZmlsZS5FbmNyeXB0ZWRGaWxlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSA1KSB7IC8vINCf0L7QtNC/0LjRgdGMINC4INGI0LjRhNGA0L7QstCw0L3QuNC1XHJcbiAgICAgICAgICAgICAgICAgICAgT3BlcmF0ZWRGaWxlID0gcGF0aE5hbWUgPSBmaWxlLlNlY29uZE9wZXJhdGlvblJlc3VsdC5FbmNyeXB0ZWRGaWxlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc0Vycm9yKVxyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JFcnJvciA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHREYXRhLmZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBndWlkKCksXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGlzRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYWxpZ25pbmdUZXh0KHBhdGhOYW1lLCA0NyksXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aE5hbWU6IHBhdGhOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogaXNFcnJvciA/ICfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJyA6IGFyclN0YXR1c1t0aGlzLm9wZXJhdGlvbkNvZGUoKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogT3BlcmF0ZWRGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246ICh0aGlzLm9wZXJhdGlvbkNvZGUoKSA9PT0gMSkgPyAnc2lnJyA6ICgodGhpcy5vcGVyYXRpb25Db2RlKCkgPT09IDIpID8gJ2VuYycgOiAnc2lnX2VuYycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTW9yZVNob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzVGVzdDogdGhpcy5pc1Rlc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWQ6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCcvaGVscGVyL0Rvd25sb2FkRmlsZT9kb3dubG9hZGVkRmlsZVVyaT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNjb3BlLnBhdGgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ29uZmlybSgn0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjCDRhNCw0LnQuz8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5yZXEuYmVnaW4oJ2ZpbGVfZGVsZXRlJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGluZ0ZpbGVVcmk6IHNjb3BlLnBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDQmtCw0LrQvtC5INGC0L4g0L7RgtCy0LXRglxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDQo9C00LDQu9GP0LXQvFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC4uINC4INC90LXQvNC90L7QttC60L4g0YPQtNC10YDQttC40LLQsNC10Lwg0LTQu9GPINC60YDQsNGB0L7RgtGLLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXN1bHREYXRhLmZpbGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJMaXN0KHRoaXMucmVzdWx0RGF0YS5maWxlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2luZGV4ID0gbGlzdE9ialNlYXJjaCh0aGlzLnJlc3VsdERhdGEuZmlsZXMsICdpZCcsIHNjb3BlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pbmRleCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdERhdGEuZmlsZXMuc3BsaWNlKF9pbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc3VsdERhdGEuZmlsZXMubGVuZ3RoID4gMzApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ2Rpdi5yZXN1bHQgZGl2LmZpbGUtZWRpdC1jb250cm9sIGRpdi5idG4ucmVzdWx0LnNob3ctYWxlcnQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdkaXYucmVzdWx0IGRpdi5maWxlLWVkaXQtY29udHJvbCBkaXYuYnRuLnJlc3VsdC5zZW5kLWFsbCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJ2Rpdi5yZXN1bHQgZGl2LmZpbGUtZWRpdC1jb250cm9sIGRpdi5idG4ucmVzdWx0LnNob3ctYWxlcnQnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdkaXYucmVzdWx0IGRpdi5maWxlLWVkaXQtY29udHJvbCBkaXYuYnRuLnJlc3VsdC5zZW5kLWFsbCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLCA1MDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUuaXNNb3JlU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoJ9Cf0L7QtNGA0L7QsdC90LXQtScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmF0dHIoJ2lzTW9yZVNob3cnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoJ9Ch0LrRgNGL0YLRjCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmF0dHIoJ2lzTW9yZVNob3cnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUsIGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRGaWxlKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHNjb3BlLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDaGFuZ2U6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWltZTogJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdsb2JFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHREYXRhLmF0dHIoJ2Vycm9yJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlc3VsdERhdGEuZmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdERhdGEuYXR0cignZXJyb3InLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0RGF0YS5hdHRyKCdlcnJvck1lc3NhZ2UnLCAn0J7RiNC40LHQutCwINC+0L/QtdGA0LDRhtC40LgnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zY29wZS5sYXlvdXQudGVtcGxhdGVMb2NrKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLnJlc3VsdCh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZWdUaXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgdGlwSm9pbnQ6IFwibGVmdFwiLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmY1ZDInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWU4YWUnXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKFwiLmpzLXRlc3QtZmlsZS10aXBcIikuZWFjaChmdW5jdGlvbihpLGVsKXtcclxuICAgICAgICAgICAgICAgIG5ldyBPcGVudGlwKCQoZWwpLCAn0JTQsNC90L3Ri9C5INGE0LDQudC7INCx0YvQuyDQv9C+0LTQstC10YDQs9C90YPRgiDQutGA0LjQv9GC0L7QvtC/0LXRgNCw0YbQuNC4INGBINC40YHQv9C+0LvRjNC30L7QstCw0L3QuNC10Lwg0YLQtdGB0YLQvtCy0L7Qs9C+INGB0LXRgNGC0LjRhNC40LrQsNGC0LAuINCi0LDQutC40LUg0YHQtdGA0YLQuNGE0LjQutCw0YLRiyDQstGL0L/Rg9GB0LrQsNGO0YLRgdGPINCx0LXQtyDRg9GH0LDRgdGC0LjRjyDQsNC60LrRgNC10LTQuNGC0L7QstCw0L3QvdC+0LPQviDQo9C00L7RgdGC0L7QstC10YDRj9GO0YnQtdCz0L4g0KbQtdC90YLRgNCwINC4INC90LUg0LjQvNC10Y7RgiDRjtGA0LjQtNC40YfQtdGB0LrQvtC5INGB0LjQu9GLLicsICcnLCByZWdUaXBPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIE9wZW50aXAubGFzdFpJbmRleCA9IDkwMDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2Nyb2xsKDEwMCk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kRmlsZTogZnVuY3Rpb24gKGFycikge1xyXG4gICAgICAgIHRoaXMubW9kYWxGaWxlU2VuZCA9IHRoaXMuc2NvcGUubGF5b3V0Lm1vZGFsKCfQntGC0L/RgNCw0LLQutCwINGE0LDQudC70L7QsicsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3BhdGgnLFxyXG4gICAgICAgICAgICBwYXRoOiAnc2VuZF9maWxlX3RvX21haWwuaGJzJyxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlczogZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGFycikpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY2FuLmJpbmQuY2FsbCh3aW5kb3csICdjaGFuZ2VfdGl0bGUnLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZXYsIGtleSwgdGl0bGUpIHtcclxuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3NlbmRmaWxlcycpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxGaWxlU2VuZC5zZXRUaXRsZSh0aXRsZSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMpLCA1MDApO1xyXG4gICAgICAgIH0sIHRoaXMpKTtcclxuICAgIH1cclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDA3LjA0LjE0LlxyXG4gKi9cclxudmFyIENoZWNrU2lnbmF0dXJlID0gY2FuLkNvbnRyb2woe1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XHJcbiAgICAgICAgdGhpcy5tYWluID0gb3B0aW9ucy5tYWluO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBuZXcgQ2hlY2tBdHRhY2htZW50RmlsZXModGhpcy5zY29wZSwgZGVsZWdhdGUoZnVuY3Rpb24gKHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlldygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW4uYWN0aW9uKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbi5yZXN1bHQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgX19yZXN1bHQgPSBjYW4uTWFwLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY291bnRNYXAodGhpcy5maWxlcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgX19yZXN1bHQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZXM6IHt9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgTWFzdGVyLmxheW91dC5tZXNzYWdlKCfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJyxcclxuICAgICAgICAgICAgICAgIGZvcm1hdChcItCd0LXQvtC20LjQtNCw0L3QvdCw0Y8g0L7RiNC40LHQutCwINC/0YDQvtC40LfQvtGI0LvQsCDQv9GA0Lgg0L/RgNC+0LLQtdGA0LrQtSDQv9C+0LTQv9C40YHQuC4gPGJyIC8+INCe0YjQuNCx0LrQsDogJW1lc3NhZ2VcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgICclbWVzc2FnZSc6IGUubmFtZVxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAnZXJyb3InLCBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn0JTQsCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2J0bi1ncmVlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVNldHRpbmdzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5jdXJyZW50KCkuU2V0dGluZ3MucmF3LnNlcmlhbGl6ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpO1xyXG4gICAgfSxcclxuXHJcbiAgICB2aWV3OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5tYWluLnJlc3VsdCh0cnVlKTtcclxuICAgICAgICB0aGlzLm1haW4uYWN0aW9uKHRoaXMpO1xyXG5cclxuICAgICAgICB2YXIgcHJvY2Vzc0lEID0gdGhpcy5zY29wZS5pcHJvY2Vzcy5hZGQoJ9CS0YvQv9C+0LvQvdGP0LXRgtGB0Y8g0L/RgNC+0LLQtdGA0LrQsCDQv9C+0LTQv9C40YHQuC4uLicpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnNjb3BlLnJlcS5iZWdpbignbWFrZV9vcGVyYXRpb24nLCB7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nc0pTT046IHRoaXMucHJlcGFyZVNldHRpbmdzKCksXHJcbiAgICAgICAgICAgICAgICBzaWduZWRGaWxlSW5mb3NKU09OOiB0aGlzLnNjb3BlLmdldEZpbGVzU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiA0XHJcbiAgICAgICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2xvYkVycm9yID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJkID0gZGF0YS5kYXRhLk9wZXJhdGlvblJlc3VsdDtcclxuICAgICAgICAgICAgICAgIGNhbi5lYWNoKHJkLk9wZXJhdGlvblJlc3VsdHMsIGRlbGVnYXRlKGZ1bmN0aW9uIChmaWxlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gZ3VpZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ0SW5mbyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzVGVzdCA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuRXhjZXB0aW9uID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuLmVhY2goZmlsZS5DZXJ0aWZpY2F0ZVN0YXR1c2VzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2VydGlmaWNhdGUgPSBzdGF0dXMuQ2VydGlmaWNhdGVJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlcnRpZmljYXRlLklzVGVzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNUZXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ0SW5mby5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAhZmlsZS5EZXRhY2hlZCA/ICfQn9GA0LjRgdC+0LXQtNC40L3QtdC90L3QsNGPJyA6ICfQntGC0YHQvtC10LTQuNC90LXQvdC90LDRjycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJwcmludDogY2VydGlmaWNhdGUuVGh1bWJwcmludCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNpcGllbnQ6IGNlcnRpZmljYXRlLlN1YmplY3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VyZU5hbWU6IGNlcnRpZmljYXRlLklzc3VyZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90QmVmb3JlOiBtb21lbnQocGFyc2VJbnQoY2VydGlmaWNhdGUuTm90QmVmb3JlLm1hdGNoKCdbMC05XSsnKVswXSkpLmNhbGVuZGFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90QWZ0ZXI6IG1vbWVudChwYXJzZUludChjZXJ0aWZpY2F0ZS5Ob3RBZnRlci5tYXRjaCgnWzAtOV0rJylbMF0pKS5jYWxlbmRhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnRFcnJvcjogbW9tZW50KHBhcnNlSW50KGNlcnRpZmljYXRlLk5vdEFmdGVyLm1hdGNoKCdbMC05XSsnKVswXSkpLnVuaXgoKSAtIG1vbWVudChuZXcgRGF0ZSgpKS51bml4KCkgPCAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuRXhjZXB0aW9uICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iRXJyb3IgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWNjZXB0RXh0ID0gWydvZHMnLCd4bHMnLCd4bHNiJywneGxzeCcsJ29kcycsJ3hsc2InLCd4bHNtJywneGxzeCcsJ29kcCcsJ3BvdCcsJ3BvdG0nLCdwb3R4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3BwcycsJ3Bwc20nLCdwcHN4JywncHB0JywncHB0bScsJ3BwdHgnLCdvZHAnLCdwcHN4JywncHB0eCcsJ2RvYycsJ2RvY20nLCdkb2N4JywnZG90JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RvdG0nLCdkb3R4Jywnb2R0JywncGRmJywnb25lJywnb25ldG9jMicsJ2pwZycsJ2pwZWcnLCdnaWYnLCdwbmcnLCdibXAnLCd4bWwnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZVZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gIGZpbGUuRGF0YUZpbGUuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZXh0ID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lW25hbWUubGVuZ3RoLTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dCA9IG5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ID0gZXh0W2V4dC5sZW5ndGgtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY2NlcHRFeHQuaW5kZXhPZihleHQudG9Mb3dlckNhc2UoKSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRlVmlldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g0JLRgNC10LzQtdC90L3Ri9C5INC60L7RgdGC0YvQu9GMINC/0L7Qu9GD0YfQtdC90LjRjyDQutC+0YDRgNC10LrRgtC90L7Qs9C+INC/0YPRgtC4INGE0LDQudC70LAg0LIg0YDQtdC30YPQu9GM0YLQsNGC0LVcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSBmaWxlLlNpZ25lZEZpbGUucmVwbGFjZSgvXFxcXC9nLCAnLycpLnJlcGxhY2UoL1xcL1teXFwvXSpcXC8/JC8sICcnKSArICcvJyArICAoJycgKyBmaWxlLkRhdGFGaWxlKS5yZXBsYWNlKC9eLipbXFxcXFxcL10vLCAnJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0LmZpbGVzLmF0dHIoaWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogZmlsZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ05hbWU6IGZpbGUuU2lnbmVkRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWNoZWQ6IGZpbGUuRGV0YWNoZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmaWxlLkV4Y2VwdGlvbiAhPT0gbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBmaWxlLkV4Y2VwdGlvbiAhPT0gbnVsbCA/IGZpbGUuRXhjZXB0aW9uLk1lc3NhZ2UgOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZVZpZXc6IGhpZGVWaWV3LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBzZXJ0SW5mbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNUZXN0OiB0aGlzLmlzVGVzdCxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld19maWxlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlsZW5hbWUgPSBzY29wZS5maWxlTmFtZSsnLnNpZyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBzY29wZS5zaWdOYW1lLnN1YnN0cmluZygwLCBzY29wZS5zaWdOYW1lLmxlbmd0aCAtIGZpbGVuYW1lLmxlbmd0aCkrc2NvcGUuZmlsZU5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2hlbHBlci9HZXRWaXN1YWxpemF0aW9uSW5mbycsYXN5bmM6IGZhbHNlLHR5cGU6IFwiR0VUXCIsZGF0YToge2ZpbGVuYW1lOiBmaWxlbmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LkVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBzY29wZS5maWxlTmFtZS5zcGxpdCgnLycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW49NDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbbmFtZS5sZW5ndGgtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUubGVuZ3RoID4gbGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSAnLi4uJytuYW1lLnN1YnN0cmluZyhuYW1lLmxlbmd0aC1sZW4sIG5hbWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5WaXN1YWxpemF0aW9uVXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZmFuY3lib3goe2hyZWYgOiByZXN1bHQuVmlzdWFsaXphdGlvblVybCx0eXBlOiAnaWZyYW1lJ30se1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlcnM6IHt0aXRsZToge3Bvc2l0aW9uOiAndG9wJ319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoXHQ6IDcwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgICAgICA6IDEwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGhcdDogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TaXplXHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1Jlc2l6ZVx0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZzogJ25vJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BSYXRpbzogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IFsyMCwgMjAsIDkwLCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDbGlja1x0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuRWZmZWN0XHQ6ICdmYWRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cmFwQ1NTICAgICA6ICd2aXN1YWxpc2VNb2RhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgICAgICAgOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyQ2xvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudmlzdWFsU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5mYW5jeWJveChcIjxpbWcgYWxpZ249J2NlbnRlcicgd2lkdGg9JzEwMCUnIHN0eWxlPSdtYXJnaW46IDAgYXV0bztkaXNwbGF5OiBibG9jazsnIHNyYz0nZGF0YTppbWFnZS9qcGc7YmFzZTY0LFwiK3Jlc3VsdC5CYXNlNjRQaWN0dXJlK1wiJz5cIix7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVscGVyczoge3RpdGxlOiB7cG9zaXRpb246ICd0b3AnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNwZWN0UmF0aW8gOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpdFRvVmlld1x0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TaXplXHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1Jlc2l6ZVx0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbGluZzogJ25vJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BSYXRpbzogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IFsyMCwgMjAsIDkwLCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VDbGlja1x0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuRWZmZWN0XHQ6ICdmYWRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cmFwQ1NTICAgICA6ICd2aXN1YWxpc2VNb2RhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgICAgICAgOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyQ2xvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudmlzdWFsU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5mYW5jeWJveCgnPGRpdiBjbGFzcz1cIm1vZGFsLXdpbmRvd1wiIGlkPVwibm8tdmlzdWFsaXplXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+0JLQvdC40LzQsNC90LjQtSE8L2Rpdj48Zm9ybSBhY3Rpb249XCJcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBtZXRob2Q9XCJwb3N0XCI+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJtZXNzLWJveFwiPjxkaXYgY2xhc3M9XCJpbmZvXCIgaWQ9XCJpbmZvUGxhY2VyXCI+PHNwYW4+0KTQsNC50Lsg0LTQsNC90L3QvtCz0L4g0YLQuNC/0LAg0L3QtSDQvNC+0LbQtdGCINCx0YvRgtGMINC/0YDQvtGB0LzQvtGC0YDQtdC9INCyINCx0YDQsNGD0LfQtdGA0LUhINCS0Ysg0LzQvtC20LXRgtC1INGB0LrQsNGH0LDRgtGMINGE0LDQudC7INC4INC/0L7RgdC80L7RgtGA0LXRgtGMINC10LPQviDQvdCwINGD0YHRgtGA0L7QudGB0YLQstC1LiA8L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cInJvdyBzYm10IHB1bGwtcmlnaHRcIj48aW5wdXQgY2xhc3M9XCJidG4gYnRuLWdyZWVuXCIgdHlwZT1cImJ1dHRvblwiIHZhbHVlPVwi0JfQsNC60YDRi9GC0YxcIiBvbmNsaWNrPVwiJC5mYW5jeWJveC5jbG9zZSgpO1wiIC8+PC9kaXY+PC9mb3JtPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt3cmFwQ1NTIDogJ25vLXZpc3VhbGlzZU1vZGFsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJDbG9zZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cudmlzdWFsU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXF1ZXN0LCBlcnJvciwgcmVzdWx0KSB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZF9maWxlOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignL2hlbHBlci9Eb3dubG9hZEZpbGU/ZG93bmxvYWRlZEZpbGVVcmk9JyArIGVuY29kZVVSSUNvbXBvbmVudChzY29wZS5zaWdOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkX2RhdGFfZmlsZTogZGVsZWdhdGUoZnVuY3Rpb24gKHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gc2NvcGUuZmlsZU5hbWUrJy5zaWcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lID0gc2NvcGUuc2lnTmFtZS5zdWJzdHJpbmcoMCwgc2NvcGUuc2lnTmFtZS5sZW5ndGggLSBmaWxlbmFtZS5sZW5ndGgpK3Njb3BlLmZpbGVOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCcvaGVscGVyL0Rvd25sb2FkRmlsZT9kb3dubG9hZGVkRmlsZVVyaT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZpbGVuYW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9kYXRhX2ZpbGU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ29uZmlybSgn0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjCDRhNCw0LnQuz8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdmaWxlX2RlbGV0ZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0aW5nRmlsZVVyaTogc2NvcGUuZmlsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vINCa0LDQutC+0Lkg0YLQviDQvtGC0LLQtdGCXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignZmlsZU5hbWUnLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQ29uZmlybSgn0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDRg9C00LDQu9C40YLRjCDRhNCw0LnQuz8nLCBkZWxlZ2F0ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdmaWxlX2RlbGV0ZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0aW5nRmlsZVVyaTogc2NvcGUuZmlsZU5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vINCa0LDQutC+0Lkg0YLQviDQvtGC0LLQtdGCXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvRj9C10LxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLi4g0Lgg0L3QtdC80L3QvtC20LrQviDRg9C00LXRgNC20LjQstCw0LXQvCDQtNC70Y8g0LrRgNCw0YHQvtGC0YsuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzdWx0Lmxlbmd0aCgpID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5sYXlvdXQubWFpbi5jbGVhckFjdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdC5maWxlcy5yZW1vdmVBdHRyKHNjb3BlLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyksIDUwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRfc2lnOiBkZWxlZ2F0ZShmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignL2hlbHBlci9Eb3dubG9hZEZpbGU/ZG93bmxvYWRlZEZpbGVVcmk9JyArIGVuY29kZVVSSUNvbXBvbmVudChzY29wZS5zaWdOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vcmU6IGRlbGVnYXRlKGZ1bmN0aW9uIChzY29wZSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUuaXNNb3JlU2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKCfQn9C+0LTRgNC+0LHQvdC10LUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignaXNNb3JlU2hvdycsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKCfQodC60YDRi9GC0YwnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXR0cignaXNNb3JlU2hvdycsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IGNhbi52aWV3KCcvQXNzZXRzL3ZpZXdzL21hc3Rlci9hY3Rpdml0eS9jaGVja19zaWduYXR1cmUuaGJzJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogdGhpcy5yZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGdsb2JFcnJvciA9PT0gdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrRmlsZXM6IGRlbGVnYXRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9EZWZhdWx0L1dlYkRhdkJyb3dzZXInO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmaWxlczogZGVsZWdhdGUodGhpcy5tYWluLnJlRmlsZXMsIHRoaXMubWFpbiwgW3RydWVdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ3Byb2Nlc3NfZXhpdCcsIFtwcm9jZXNzSURdKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kKHZpZXcpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByZWdUaXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpcEpvaW50OiBcImxlZnRcIixcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZjVkMicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI2ZlZThhZSdcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgJChcIi5qcy10ZXN0LWZpbGUtdGlwXCIpLmVhY2goZnVuY3Rpb24oaSxlbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE9wZW50aXAoJChlbCksICfQlNCw0L3QvdGL0Lkg0YTQsNC50Lsg0LHRi9C7INC/0L7QtNCy0LXRgNCz0L3Rg9GCINC60YDQuNC/0YLQvtC+0L/QtdGA0LDRhtC40Lgg0YEg0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40LXQvCDRgtC10YHRgtC+0LLQvtCz0L4g0YHQtdGA0YLQuNGE0LjQutCw0YLQsC4g0KLQsNC60LjQtSDRgdC10YDRgtC40YTQuNC60LDRgtGLINCy0YvQv9GD0YHQutCw0Y7RgtGB0Y8g0LHQtdC3INGD0YfQsNGB0YLQuNGPINCw0LrQutGA0LXQtNC40YLQvtCy0LDQvdC90L7Qs9C+INCj0LTQvtGB0YLQvtCy0LXRgNGP0Y7RidC10LPQviDQptC10L3RgtGA0LAg0Lgg0L3QtSDQuNC80LXRjtGCINGO0YDQuNC00LjRh9C10YHQutC+0Lkg0YHQuNC70YsuJywgJycsIHJlZ1RpcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIE9wZW50aXAubGFzdFpJbmRleCA9IDkwMDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLnJlc3VsdCh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY3JvbGwoMTAwKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgTWFzdGVyLmxheW91dC5tZXNzYWdlKCfQn9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJyxcclxuICAgICAgICAgICAgICAgIGZvcm1hdCgn0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQv9GA0L7QstC10YDQutC1INC/0L7QtNC/0LjRgdC4LiBcIiVtZXNzYWdlXCInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgJyVtZXNzYWdlJzogZS5uYW1lXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICdlcnJvcicsIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfQlNCwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnYnRuLWdyZWVuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkg0JDQu9C10LrRgdCw0L3QtNGAIG9uIDE1LjA0LjE0LlxyXG4gKi9cclxudmFyIERlY2lwaGVyID0gY2FuLkNvbnRyb2woe1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XHJcbiAgICAgICAgdGhpcy5tYWluID0gb3B0aW9ucy5tYWluO1xyXG5cclxuICAgICAgICB0aGlzLmNlcnRpZmljYXRlID0gJyc7XHJcbiAgICAgICAgdGhpcy5waW4gPSAnJztcclxuICAgICAgICB0aGlzLnNhdmVQaW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5lZWRUb1BJTiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2NTY29wZSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVfc2VsZWN0aW9uID0gbmV3IENlcnRpZmljYXRlU2VsZWN0aW9uKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICAgICBuZXh0Q2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKHNlcnQsIHBpbiwgc2F2ZVBpbiwgbmVlZFRvUElOLCBzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUgPSBzZXJ0KCkuVGh1bWJwcmludDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbiA9IHBpbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVBpbiA9IHNhdmVQaW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5lZWRUb1BJTiA9IG5lZWRUb1BJTigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjU2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5SZXN1bHQoc2VydCgpKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfQoNCw0YHRiNC40YTRgNC+0LLQsNGC0YwnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDRgNCw0YHRiNC40YTRgNC+0LLQutC1LiBcIiVtZXNzYWdlXCInLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJ1blJlc3VsdDogZnVuY3Rpb24gKHNlcnQpIHtcclxuICAgICAgICB2YXIgZmlsZXMgPSBuZXcgY2FuLk1hcC5MaXN0KFtdKTtcclxuXHJcbiAgICAgICAgdmFyIHByb2Nlc3NJRCA9IHRoaXMuc2NvcGUuaXByb2Nlc3MuYWRkKCfQktGL0L/QvtC70L3Rj9C10YLRgdGPINGA0LDRgdGI0LjRhNGA0L7QstC60LAg0YTQsNC50LvQvtCyLi4uJyk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdtYWtlX29wZXJhdGlvbicsIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzSlNPTjogdGhpcy5wcmVwYXJlU2V0dGluZ3MoKSxcclxuICAgICAgICAgICAgICAgIHNpZ25lZEZpbGVJbmZvc0pTT046IHRoaXMuc2NvcGUuZ2V0RmlsZXNTdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IDMsXHJcbiAgICAgICAgICAgICAgICBzYXZlUGluOiB0aGlzLnNhdmVQaW4sXHJcbiAgICAgICAgICAgICAgICBuZWVkVG9QSU46IHRoaXMubmVlZFRvUElOXHJcbiAgICAgICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2xvYkVycm9yID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGluRXJyb3IgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkYXRhLmRhdGEuT3BlcmF0aW9uUmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuRXhjZXB0aW9uICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xvYkVycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShwYXJzZUludChyZXN1bHQuRXhjZXB0aW9uLkNvZGUpLCBbLTIxNDY0MzQ5NjUsIC0yMTQ3NDY3MjU5XSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpbkVycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NTY29wZS5hY3Rpb25SdW4odHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW4udHJpZ2dlcih3aW5kb3csICdwcm9jZXNzX2V4aXQnLCBbcHJvY2Vzc0lEXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNhbi5lYWNoKHJlc3VsdC5PcGVyYXRpb25SZXN1bHRzLCBkZWxlZ2F0ZShmdW5jdGlvbiAoZmlsZSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGluRXJyb3IpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBPcGVyYXRlZEZpbGU6IGZpbGUuRW5jcnlwdGVkRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgU291cmNlRmlsZTogZmlsZS5EZWNyeXB0ZWRGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZmlsZS5FeGNlcHRpb24gIT09IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogKGZpbGUuRXhjZXB0aW9uICE9PSBudWxsKSA/IGZpbGUuRXhjZXB0aW9uLk1lc3NhZ2UgOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwaW5FcnJvcilcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgY2FuLnRyaWdnZXIod2luZG93LCAncHJvY2Vzc19leGl0JywgW3Byb2Nlc3NJRF0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmlld1Jlc3VsdChmaWxlcywgZ2xvYkVycm9yKTtcclxuICAgICAgICAgICAgfSwgdGhpcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQstGL0LLQvtC00LUg0YDQtdC30YPQu9GM0YLQsNGC0LAg0YDQsNGB0YjQuNGE0YDQvtCy0LrQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwYXJlU2V0dGluZ3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLnNjb3BlLnBvb2wudGVtcGxhdGVzLmN1cnJlbnQoKS5TZXR0aW5ncy5yYXcuc2VyaWFsaXplKCk7XHJcblxyXG4gICAgICAgIHNldHRpbmdzLl9EZWNyeXB0aW9uU2V0dGluZ3MuRGVjcnlwdENlcnRpZmljYXRlID0gdGhpcy5jZXJ0aWZpY2F0ZTtcclxuICAgICAgICBzZXR0aW5ncy5fRGVjcnlwdGlvblNldHRpbmdzLktleXNldFBhc3N3b3JkID0gdGhpcy5waW47XHJcblxyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncyk7XHJcbiAgICB9LFxyXG5cclxuICAgIHZpZXdSZXN1bHQ6IGZ1bmN0aW9uIChmaWxlcywgZXJyb3IpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdCA9IG5ldyBPcGVyYXRpb25SZXN1bHQodGhpcy5zY29wZSwge1xyXG4gICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVzLFxyXG4gICAgICAgICAgICAgICAgc291cmNlVHlwZTogJ9CY0YHRhdC+0LTQvdGL0Lkg0YTQsNC50Ls6JyxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgICAgIGljb246ICdlbmMnLFxyXG4gICAgICAgICAgICAgICAgc2hvd0xpbms6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgYWxlcnRFcnJvcign0J3QtdC+0LbQuNC00LDQvdC90LDRjyDQvtGI0LjQsdC60LAg0L/RgNC+0LjQt9C+0YjQu9CwINC/0YDQuCDQstGL0LLQvtC00LUg0YDQtdC30YPQu9GM0YLQsNGC0LAg0YDQsNGB0YjQuNGE0YDQvtCy0LrQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTsiLCIvKipcclxuICogQ3JlYXRlZCBieSDQkNC70LXQutGB0LDQvdC00YAgb24gMDguMDQuMTQuXHJcbiAqL1xyXG52YXIgRGVjaXBoZXJBbmRDaGVja1NpZ25hdHVyZSA9IGNhbi5Db250cm9sKHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlO1xyXG4gICAgICAgIHRoaXMubWFpbiA9IG9wdGlvbnMubWFpbjtcclxuXHJcbiAgICAgICAgdGhpcy5jZXJ0aWZpY2F0ZSA9ICcnO1xyXG4gICAgICAgIHRoaXMucGluID0gJyc7XHJcbiAgICAgICAgdGhpcy5zYXZlUGluID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uZWVkVG9QSU4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNjU2NvcGUgPSBudWxsO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGVfc2VsZWN0aW9uID0gbmV3IENlcnRpZmljYXRlU2VsZWN0aW9uKHRoaXMuZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICAgICBuZXh0Q2FsbDogZGVsZWdhdGUoZnVuY3Rpb24gKHNlcnQsIHBpbiwgc2F2ZVBpbiwgbmVlZFRvUElOLCBzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2VydGlmaWNhdGUgPSBzZXJ0KCkuVGh1bWJwcmludDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbiA9IHBpbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVBpbiA9IHNhdmVQaW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5lZWRUb1BJTiA9IG5lZWRUb1BJTigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NTY29wZSA9IHNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVuUmVzdWx0KHNlcnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzKSxcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn0KDQsNGB0YjQuNGE0YDQvtCy0LDRgtGMINC4INC/0YDQvtCy0LXRgNC40YLRjCDQv9C+0LTQv9C40YHRjCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INGA0LDRgdGI0LjRhNGA0L7QstC60LUg0Lgg0L/RgNC+0LLQtdGA0LrQuCDQv9C+0LTQv9C40YHQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBydW5SZXN1bHQ6IGZ1bmN0aW9uIChzZXJ0KSB7XHJcbiAgICAgICAgdmFyIGZpbGVzID0gbmV3IGNhbi5NYXAuTGlzdChbXSk7XHJcblxyXG4gICAgICAgIHZhciBwcm9jZXNzSUQgPSB0aGlzLnNjb3BlLmlwcm9jZXNzLmFkZCgn0JLRi9C/0L7Qu9C90Y/QtdGC0YHRjyDRgNCw0YHRiNC40YTRgNC+0LLQutCwINC4INC/0YDQvtCy0LXRgNC60LAg0L/QvtC00L/QuNGB0Lgg0YMg0YTQsNC50LvQvtCyLi4uJyk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NvcGUucmVxLmJlZ2luKCdtYWtlX29wZXJhdGlvbicsIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzSlNPTjogdGhpcy5wcmVwYXJlU2V0dGluZ3MoKSxcclxuICAgICAgICAgICAgICAgIHNpZ25lZEZpbGVJbmZvc0pTT046IHRoaXMuc2NvcGUuZ2V0RmlsZXNTdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IDYsXHJcbiAgICAgICAgICAgICAgICBzYXZlUGluOiB0aGlzLnNhdmVQaW4sXHJcbiAgICAgICAgICAgICAgICBuZWVkVG9QSU46IHRoaXMubmVlZFRvUElOXHJcbiAgICAgICAgICAgIH0sIGRlbGVnYXRlKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2xvYkVycm9yID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGluRXJyb3IgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkYXRhLmRhdGEuT3BlcmF0aW9uUmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzUmVzdWx0ID0gcmVzdWx0Lk9wZXJhdGlvblJlc3VsdHM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5FeGNlcHRpb24gIT09IG51bGwgJiYgJC5pbkFycmF5KHBhcnNlSW50KHJlc3VsdC5FeGNlcHRpb24uQ29kZSksIFstMjE0NjQzNDk2NSwgLTIxNDc0NjcyNTldKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBwaW5FcnJvciA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NTY29wZS5hY3Rpb25SdW4odHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhbi50cmlnZ2VyKHdpbmRvdywgJ3Byb2Nlc3NfZXhpdCcsIFtwcm9jZXNzSURdKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShyZXN1bHQpKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGluRXJyb3IpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBjYW4uZWFjaChmaWxlc1Jlc3VsdCwgZGVsZWdhdGUoZnVuY3Rpb24gKGZpbGUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuRXhjZXB0aW9uICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iRXJyb3IgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VydEluZm8gPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuU2Vjb25kT3BlcmF0aW9uUmVzdWx0ICE9PSBudWxsICYmIGZpbGUuU2Vjb25kT3BlcmF0aW9uUmVzdWx0LkV4Y2VwdGlvbiA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbi5lYWNoKGZpbGUuU2Vjb25kT3BlcmF0aW9uUmVzdWx0LkNlcnRpZmljYXRlU3RhdHVzZXMsIGRlbGVnYXRlKGZ1bmN0aW9uIChzdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZXJ0aWZpY2F0ZSA9IHN0YXR1cy5DZXJ0aWZpY2F0ZUluZm87XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydEluZm8ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogIWZpbGUuRGV0YWNoZWQgPyAn0J/RgNC40YHQvtC10LTQuNC90LXQvdC90LDRjycgOiAn0J7RgtGB0L7QtdC00LjQvdC10L3QvdCw0Y8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1icHJpbnQ6IGNlcnRpZmljYXRlLlRodW1icHJpbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjaXBpZW50OiBjZXJ0aWZpY2F0ZS5TdWJqZWN0TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1cmVOYW1lOiBjZXJ0aWZpY2F0ZS5Jc3N1cmVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdEJlZm9yZTogbW9tZW50KHBhcnNlSW50KGNlcnRpZmljYXRlLk5vdEJlZm9yZS5tYXRjaCgnWzAtOV0rJylbMF0pKS5jYWxlbmRhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdEFmdGVyOiBtb21lbnQocGFyc2VJbnQoY2VydGlmaWNhdGUuTm90QWZ0ZXIubWF0Y2goJ1swLTldKycpWzBdKSkuY2FsZW5kYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZXJ0RXJyb3I6IG1vbWVudChwYXJzZUludChjZXJ0aWZpY2F0ZS5Ob3RBZnRlci5tYXRjaCgnWzAtOV0rJylbMF0pKS51bml4KCkgLSBtb21lbnQobmV3IERhdGUoKSkudW5peCgpIDwgMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE9wZXJhdGVkRmlsZTogZmlsZS5TZWNvbmRPcGVyYXRpb25SZXN1bHQuRGF0YUZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNvdXJjZUZpbGU6IGZpbGUuRmlyc09wZXJhdGlvblJlc3VsdC5EZWNyeXB0ZWRGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFbmNyeXB0ZWRGaWxlOiBmaWxlLkZpcnNPcGVyYXRpb25SZXN1bHQuRW5jcnlwdGVkRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChmaWxlLkZpcnNPcGVyYXRpb25SZXN1bHQuRXhjZXB0aW9uICE9PSBudWxsIHx8IGZpbGUuU2Vjb25kT3BlcmF0aW9uUmVzdWx0LkV4Y2VwdGlvbiAhPT0gbnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZmlsZS5TZWNvbmRPcGVyYXRpb25SZXN1bHQuRXhjZXB0aW9uICE9PSBudWxsID8gZmlsZS5TZWNvbmRPcGVyYXRpb25SZXN1bHQuRXhjZXB0aW9uLk1lc3NhZ2UgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ0SW5mbzogc2VydEluZm9cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2NvcGUubG9hZGVyKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjYW4udHJpZ2dlcih3aW5kb3csICdwcm9jZXNzX2V4aXQnLCBbcHJvY2Vzc0lEXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3UmVzdWx0KGZpbGVzLCBnbG9iRXJyb3IpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INGA0LDRgdGI0LjRhNGA0L7QstC60LUg0Lgg0L/RgNC+0LLQtdGA0LrQuCDQv9C+0LTQv9C40YHQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB2aWV3UmVzdWx0OiBmdW5jdGlvbiAoZmlsZXMsIGVycm9yKSB7XHJcbiAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgT3BlcmF0aW9uUmVzdWx0KHRoaXMuc2NvcGUsIHtcclxuICAgICAgICAgICAgdHlwZTogJ2VuY19zaWcnLFxyXG4gICAgICAgICAgICBmaWxlczogZmlsZXMsXHJcbiAgICAgICAgICAgIHNvdXJjZVR5cGU6ICfQn9C+0LTQv9C40YHQsNC90L3Ri9C5INC4INC30LDRiNC40YTRgNC+0LLQsNC90L3Ri9C5INGE0LDQudC7OicsXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvcixcclxuICAgICAgICAgICAgaWNvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNob3dMaW5rOiB0cnVlLFxyXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICfQn9GA0Lgg0L/RgNC+0LLQtdGA0LrQtSDQv9C+0LTQv9C40YHQuCDQv9GA0L7QuNC30L7RiNC70LAg0L7RiNC40LHQutCwJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwYXJlU2V0dGluZ3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2V0dGluZ3M7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzID0gdGhpcy5zY29wZS5wb29sLnRlbXBsYXRlcy5jdXJyZW50KCkuU2V0dGluZ3MucmF3LnNlcmlhbGl6ZSgpO1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3MuX0RlY3J5cHRpb25TZXR0aW5ncy5EZWNyeXB0Q2VydGlmaWNhdGUgPSB0aGlzLmNlcnRpZmljYXRlO1xyXG4gICAgICAgICAgICBzZXR0aW5ncy5fRGVjcnlwdGlvblNldHRpbmdzLktleXNldFBhc3N3b3JkID0gdGhpcy5waW47XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBhbGVydEVycm9yKCfQndC10L7QttC40LTQsNC90L3QsNGPINC+0YjQuNCx0LrQsCDQv9GA0L7QuNC30L7RiNC70LAg0L/RgNC4INGA0LDRgdGI0LjRhNGA0L7QstC60LUg0Lgg0L/RgNC+0LLQtdGA0LrQuCDQv9C+0LTQv9C40YHQuC4gXCIlbWVzc2FnZVwiJywgZSk7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pOyIsIi8vXHJcbi8vINCf0LDRgNC10L3RjCDQsdC10YDQtdCz0LjRgdGMIVxyXG4vL1xyXG4vLyDQmtC+0LPQtNCwINGC0Ysg0LfQsNC60L7QvdGH0LjRiNGMIMKr0L7Qv9GC0LjQvNC40LfQuNGA0L7QstCw0YLRjMK7INGN0YLQvtGCINC80LDRgdGC0LXRgFxyXG4vLyDQuCDQv9C+0LnQvNC10YjRjCwg0L3QsNGB0LrQvtC70YzQutC+INCx0L7Qu9GM0YjQvtC5INC+0YjQuNCx0LrQvtC5INCx0YvQu9C+INC00LXQu9Cw0YLRjCDRjdGC0L4sXHJcbi8vINC/0L7QttCw0LvRg9C50YHRgtCwLCDRg9Cy0LXQu9C40YfRjCDRgdGH0LXRgtGH0LjQuiDQstC90LjQt9GDINC60LDQuiDQv9GA0LXQtNGD0L/RgNC10LbQtNC10L3QuNC1XHJcbi8vINC00LvRjyDRgdC70LXQtNGD0Y7RidC10LPQviDQv9Cw0YDQvdGPOlxyXG4vL1xyXG50b3RhbF9ob3Vyc193YXN0ZWRfaGVyZSA9IDE7XHJcbi8qKlxyXG4gKiDQk9C70L7QsdCw0LvRjNC90LDRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQvNCw0YHRgtC10YDQsFxyXG4gKi9cclxudmFyIEluaXRNYXN0ZXIgPSBDb3JlLmV4dGVuZCh7XHJcbiAgICBuYW1lOiAn0JzQsNGB0YLQtdGAINC/0L4g0YDQsNCx0L7RgtC1INGBINC00L7QutGD0LzQtdC90YLQsNC80LgnLFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uIChzZXR0aW5ncykge1xyXG4gICAgICAgIE1hc3Rlci5kZWJ1ZyA9IHRoaXMuZGVidWcgPSBzZXR0aW5ncy5kZWJ1ZztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog0JjQvdC40YbQuNCw0LvQuNC30LjRgNC+0LLQsNC90L4g0LvQuCDQv9GA0LjQu9C+0LbQtdC90LjQtS5cclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIG5ldyBMb2dnZXIoWyfQndCw0YfQsNC70L4g0YDQsNCx0L7RgtGLIFwiJW1cIicsIHsnJW0nOiB0aGlzLm5hbWV9XSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29yZSA9IG5ldyBDb3JlR2xvYih0aGlzKTtcclxuICAgICAgICB0aGlzLmNvcmUubG9hZFNldHRpbmdzKHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgdGhpcy5WZXJzaW9uID0ge1xyXG4gICAgICAgICAgICBudW1iZXI6ICcxLjIuMTQnLFxyXG4gICAgICAgICAgICBkYXRlOiAnMjQuMDcuMTQgMTI6MTEnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
