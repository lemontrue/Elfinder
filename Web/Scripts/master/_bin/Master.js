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
                    this.addItem(item.SubjectName, format('Действителен до %time', {
                        '%time': moment(parseInt(item.NotAfter.match('[0-9]+')[0])).calendar().replace(/\//g,'.')
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
                'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp'];

            can.each(files, delegate(function (file, index) {

                var id = guid();
                var fileData = {
                    id: id,
                    fileName: file.OperatedFile,
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
            var view = can.view('/Scripts/master/view/layout.hbs', {
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

        var modal = can.view('/Scripts/master/view/modal.hbs', {
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

        body = can.view.render('/Scripts/master/view/modals/message.hbs', {
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
/**
 *
 * @type {*}
 */
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

        var view = can.view('/Scripts/master/view/information_process.hbs', {
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

        var view = can.view('Scripts/master/view/actions.hbs', {
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
        var view = can.view('/Scripts/master/view/actions.hbs', {
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
                                    close.apply(window, [Master]);
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
            var view = can.view('/Scripts/master/view/activity/sign_and_encrypt.hbs', {
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
                        'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp'],
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
                    this.result.files.attr(id, {
                        id: id,
                        fileName: file.DataFile,
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

                var view = can.view('/Scripts/master/view/activity/check_signature.hbs', {
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
