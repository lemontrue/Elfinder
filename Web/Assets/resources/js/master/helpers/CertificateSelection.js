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