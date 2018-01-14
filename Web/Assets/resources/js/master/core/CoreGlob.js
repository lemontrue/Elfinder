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