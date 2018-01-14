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