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

                        return false
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
                'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp','xml'];

            can.each(files, delegate(function (file, index) {

                var id = guid();
                var fileName;
                //Временный костыль получения корректного пути файла в результате
                if (file.EncryptedFile)
                    fileName = file.EncryptedFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/' +  ('' + file.OperatedFile).replace(/^.*[\\\/]/, '');
                else
                    fileName = file.OperatedFile;

                var fileData = {
                    id: id,
                    fileName: fileName,
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