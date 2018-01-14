/**
 * Created by Александр on 16.04.14.
 */
var OperationResult = can.Construct({
    init: function(scope, settings) {
        this.scope = scope;

        this.tag = $('div[result]');

        this.type = settings['type'] || '';

        try {
            var __result = can.Map.extend({
                length: function() {
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
                    error: delegate(function(e) {
                        alertError('Неожиданная ошибка произошла при выводе результата. "%message"', e.message);
                    }, this)
                }
            });

            this.errorMessage = settings.errorMessage || 'Произошла ошибка';

            this.refreshFiles(settings.files);

            settings.files.bind('change', delegate(function() {
                this.refreshFiles(settings.files);
            }, this));

            this.sourceType = settings.sourceType;

            var view = can.view('/Scripts/master/view/activity/operation_result.hbs', {
                result: this.result,
                error: this.error,
                globError: this.globError,
                errorMes: this.errorMessage,

                icon: this.icon,
                showLink: settings['showLink'] === true,
                lineError: this.lineError,

                isEncSig: this.type === 'enc_sig',

                event: {
                    backFiles: delegate(function() {
                        window.location.href = '/';
                    }, this),
                    refiles: delegate(this.scope.layout.main.reFiles, this.scope.layout.main, [true]),
                    download_file: delegate(function(scope, ev) {
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.fileName));
                    }, this),
                    download_source: delegate(function(scope, ev) {
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sourcefileName));
                    }, this),
                    download_encrypted: delegate(function(scope, ev) {
                        window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.encryptedName));
                    }, this),

                    remove_encrypted: delegate(function(scope, ev) {
                        closeConfirm('Вы уверены, что хотите удалить файл получечнный в результате операции? Все не сохраненные данные будут потеряны.', delegate(function() {
                            this.scope.req.begin('file_delete', {
                                deletingFileUri: scope.encryptedName
                            }, function(data) {
                                // Какой то ответ
                            }, this);

                            // Удаляем
                            // .. и немножко удерживаем для красоты.
                            setTimeout(delegate(function() {
                                scope.attr('encryptedName', '');
                            }, this), 200);
                        }, this));
                    }, this),

                    remove: delegate(function(scope, ev) {
                        closeConfirm('Вы уверены, что хотите удалить файл получечнный в результате операции? Все не сохраненные данные будут потеряны.', delegate(function() {
                            this.scope.req.begin('file_delete', {
                                deletingFileUri: scope.fileName
                            }, function(data) {
                                // Какой то ответ
                            }, this);

                            // Удаляем
                            // .. и немножко удерживаем для красоты.
                            setTimeout(delegate(function() {

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
                    more: delegate(function(scope, el) {
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

            this.tag.append(view);
        } catch (e) {
            alertError('Неожиданная ошибка произошла при выводе результата. "%message"', e);
        } finally {
            this.scope.result(true);
            scroll(100);
        }
    },

    remove: function() {
        this.tag.html('');
    },

    refreshFiles: function(files) {
        try {
            clearMap(this.result.files);

            can.each(files, delegate(function(file, index) {
                var id = guid();
                var fileData = {
                    id: id,
                    fileName: file.OperatedFile,
                    sourcefileName: file.SourceFile,
                    error: file.error,
                    errorMessage: file.errorMessage,
                    sertInfo: this.icon === false ? file.sertInfo : false
                };

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