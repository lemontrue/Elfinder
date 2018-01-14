/**
 * Created by Александр on 07.04.14.
 */
var CheckSignature = can.Control({
    init: function(el, options) {
        this.scope = options.scope;
        this.main = options.main;

        try {
            new CheckAttachmentFiles(this.scope, delegate(function(status) {
                if (status) {
                    this.view();
                } else {
                    this.main.action(null);
                    this.main.result(false);
                }
            }, this));

            var __result = can.Map.extend({
                length: function() {
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
                        call: delegate(function() {
                            alert.remove();
                        }, this)
                    }
                ]);
        }
    },

    prepareSettings: function() {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        return JSON.stringify(settings);
    },

    view: function() {
        this.main.result(true);
        this.main.action(this);

        var processID = this.scope.iprocess.add('Выполняется проверка подписи...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 4
            }, delegate(function(data) {
                var globError = false;

                var rd = data.data.OperationResult;

                can.each(rd.OperationResults, delegate(function(file, item) {
                    var id = guid(),
                        sertInfo = [];

                    if (file.Exception == null) {
                        can.each(file.CertificateStatuses, delegate(function(status) {
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

                    if (file.Exception !== null)
                        globError = true;

                    this.result.files.attr(id, {
                        id: id,
                        fileName: file.DataFile,
                        sigName: file.SignedFile,
                        detached: file.Detached,
                        error: file.Exception !== null,
                        errorMessage: file.Exception !== null ? file.Exception.Message : '',

                        info: sertInfo,

                        event: {
                            download_file: delegate(function(scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
                            }, this),
                            download_data_file: delegate(function(scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.fileName));
                            }, this),
                            delete_data_file: delegate(function(scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function() {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function(data) {
                                        // Какой то ответ
                                    }, this);

                                    scope.attr('fileName', '');
                                }, this));
                            }, this),
                            remove: delegate(function(scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function() {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function(data) {
                                        // Какой то ответ
                                    }, this);

                                    // Удаляем
                                    // .. и немножко удерживаем для красоты.
                                    setTimeout(delegate(function() {
                                        //debugger;
                                        if (this.result.length() === 1) {
                                            this.scope.layout.main.clearAction();
                                            return;
                                        }

                                        this.result.files.removeAttr(scope.id);
                                    }, this), 500);
                                }, this));

                            }, this),
                            download_sig: delegate(function(scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
                            }, this),
                            more: delegate(function(scope, el) {
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
                        backFiles: delegate(function() {
                            window.location.href = '/';
                        }, this),
                        refiles: delegate(this.main.reFiles, this.main, [true])
                    }
                });

                can.trigger(window, 'process_exit', [processID]);

                this.element.append(view);

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
                        call: delegate(function() {
                            alert.remove();
                        }, this)
                    }
                ]);
        }

    }
});