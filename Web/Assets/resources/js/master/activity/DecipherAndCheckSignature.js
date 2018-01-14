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