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