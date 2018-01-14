/**
 * Created by Александр on 15.04.14.
 */
var Decipher = can.Control({
    init: function(el, options) {
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
                nextCall: delegate(function(sert, pin, savePin, needToPIN, scope) {
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

    runResult: function(sert) {
        var files = new can.Map.List([]);

        var processID = this.scope.iprocess.add('Выполняется расшифровка файлов...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 3,
                savePin: this.savePin,
                needToPIN: this.needToPIN
            }, delegate(function(data) {
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

                can.each(result.OperationResults, delegate(function(file, index) {
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

    prepareSettings: function() {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        settings._DecryptionSettings.DecryptCertificate = this.certificate;
        settings._DecryptionSettings.KeysetPassword = this.pin;

        return JSON.stringify(settings);
    },

    viewResult: function(files, error) {
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