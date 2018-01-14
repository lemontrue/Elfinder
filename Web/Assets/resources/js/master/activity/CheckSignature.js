/**
 * Created by Александр on 07.04.14.
 */
var CheckSignature = can.Control({
    init: function (el, options) {
        this.scope = options.scope;
        this.main = options.main;

        try {
            new CheckAttachmentFiles(this.scope, delegate(function (status) {
                if (status) {
                    this.view();
                } else {
                    this.main.action(null);
                    this.main.result(false);
                }
            }, this));

            var __result = can.Map.extend({
                length: function () {
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
                        call: delegate(function () {
                            alert.remove();
                        }, this)
                    }
                ]);
        }
    },

    prepareSettings: function () {
        var settings = this.scope.pool.templates.current().Settings.raw.serialize();

        return JSON.stringify(settings);
    },

    view: function () {
        this.main.result(true);
        this.main.action(this);

        var processID = this.scope.iprocess.add('Выполняется проверка подписи...');

        try {
            this.scope.req.begin('make_operation', {
                settingsJSON: this.prepareSettings(),
                signedFileInfosJSON: this.scope.getFilesString(),
                type: 4
            }, delegate(function (data) {
                var globError = false;

                var rd = data.data.OperationResult;
                can.each(rd.OperationResults, delegate(function (file, item) {
                    var id = guid(),
                        sertInfo = [];

                    this.isTest = false
                    if (file.Exception == null) {
                        can.each(file.CertificateStatuses, delegate(function (status) {
                            var certificate = status.CertificateInfo;
                            if (certificate.IsTest) {
                                this.isTest = true;
                            }

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

                    var acceptExt = ['ods','xls','xlsb','xlsx','ods','xlsb','xlsm','xlsx','odp','pot','potm','potx',
                        'pps','ppsm','ppsx','ppt','pptm','pptx','odp','ppsx','pptx','doc','docm','docx','dot',
                        'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp','xml'],
                        hideView = true;
                    var name =  file.DataFile.split('/');
                    var ext = '';

                    name = name[name.length-1];
                    if (name !== null) {
                        ext = name.split('.');
                        ext = ext[ext.length-1];
                        if (acceptExt.indexOf(ext.toLowerCase()) !== -1) {
                            hideView = false;
                        }
                    }


                    // Временный костыль получения корректного пути файла в результате
                    var fileName = file.SignedFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '') + '/' +  ('' + file.DataFile).replace(/^.*[\\\/]/, '');

                    this.result.files.attr(id, {
                        id: id,
                        fileName: fileName,
                        sigName: file.SignedFile,
                        detached: file.Detached,
                        error: file.Exception !== null,
                        errorMessage: file.Exception !== null ? file.Exception.Message : '',
                        hideView: hideView,
                        info: sertInfo,
                        isTest: this.isTest,

                        event: {

                            view_file: delegate(function (scope) {
                                var filename = scope.fileName+'.sig';
                                filename = scope.sigName.substring(0, scope.sigName.length - filename.length)+scope.fileName;
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

                                            $.fancybox('<div class="modal-window" id="no-visualize"><div class="title">Внимание!</div><form action="" autocomplete="off" method="post"><div class="row"><div class="mess-box"><div class="info" id="infoPlacer"><span>Файл данного типа не может быть просмотрен в браузере! Вы можете скачать файл и посмотреть его на устройстве. </span></div></div></div><div class="row sbmt pull-right"><input class="btn btn-green" type="button" value="Закрыть" onclick="$.fancybox.close();" /></div></form></div>',
                                                {wrapCSS : 'no-visualiseModal',
                                                afterClose: function() {
                                                    window.visualState = false;
                                                }
                                            });
                                        }

                                    },
                                    error: function (request, error, result) {}
                                });
                                return false
                            }, this),
                            download_file: delegate(function (scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
                            }, this),
                            download_data_file: delegate(function (scope) {
                                var filename = scope.fileName+'.sig';
                                filename = scope.sigName.substring(0, scope.sigName.length - filename.length)+scope.fileName;
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(filename));
                            }, this),
                            delete_data_file: delegate(function (scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function (data) {
                                        // Какой то ответ
                                    }, this);

                                    scope.attr('fileName', '');
                                }, this));
                            }, this),
                            remove: delegate(function (scope) {
                                closeConfirm('Вы уверены, что хотите удалить файл?', delegate(function () {
                                    this.scope.req.begin('file_delete', {
                                        deletingFileUri: scope.fileName
                                    }, function (data) {
                                        // Какой то ответ
                                    }, this);

                                    // Удаляем
                                    // .. и немножко удерживаем для красоты.
                                    setTimeout(delegate(function () {
                                        if (this.result.length() === 1) {
                                            this.scope.layout.main.clearAction();
                                            return;
                                        }

                                        this.result.files.removeAttr(scope.id);
                                    }, this), 500);
                                }, this));

                            }, this),
                            download_sig: delegate(function (scope) {
                                window.open('/helper/DownloadFile?downloadedFileUri=' + encodeURIComponent(scope.sigName));
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
                        }
                    });
                }, this));

                var view = can.view('/Assets/views/master/activity/check_signature.hbs', {
                    scope: this.scope,
                    result: this.result,
                    error: globError === true,
                    event: {
                        backFiles: delegate(function () {
                            window.location.href = '/Default/WebDavBrowser';
                        }, this),
                        refiles: delegate(this.main.reFiles, this.main, [true])
                    }
                });

                can.trigger(window, 'process_exit', [processID]);

                this.element.append(view);

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
                        call: delegate(function () {
                            alert.remove();
                        }, this)
                    }
                ]);
        }

    }
});