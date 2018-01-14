var Request = can.Construct('Core.Request', {
    scope: null,

    demands: null,

    name: null,

    init: function(scope) {
        this.scope = scope;

        this.demands = new can.Map({});

        this.__addDemands();

        new Logger([
            'Инициализация сервиса запросов... %count запросов добавлено', {
                '%count': this.scope.countMap(this.demands)
            }
        ]);
    },

    /**
     * Запрос
     * @param name Название запроса
     * @param params Параметры
     * @returns {*}
     */
    begin: function(name, params, fn, scope) {
        fn = fn || function() {};

        var ajaxObj = null;

        try {
            var req = this.demands.attr(name),
                reply = function(status, data) {
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
                                        call: delegate(function() {
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
                                    call: delegate(function() {
                                        alert.remove();
                                    }, this)
                                }
                            ]);
                        return 0;
                    }

                    fn.apply(scope || this.scope, [arg]);
                };

            if (req === undefined) {
                new Logger([
                    'Ошибка в запросе. Адреса "%address" не  существует', {
                        '%address': name
                    }
                ], 'error');

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
                .done(delegate(function(a, b) {
                    reply(b, a);
                }, this))
                .fail(delegate(function(a, b) {
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
    add: function(name, params, rewrite) {
        if (this.demands.attr(name) !== undefined && rewrite !== true) {
            new Logger([
                'Ошибка добавления запроса. Имя "%name" уже существует.', {
                    '%name': name
                }
            ], 'error');

            return false;
        }

        if (typeof params.url !== 'string') {
            new Logger('Ошибка добавления запроса. В записи не найден URL', 'error');

            return false;
        }

        this.demands.attr(name, params);

        return true;
    },

    __addDemands: function() {
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
            rule: function(param, scope) {
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