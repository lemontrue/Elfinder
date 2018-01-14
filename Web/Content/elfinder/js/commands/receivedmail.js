"use strict";
elFinder.prototype.commands.receivedmail = function () {
    var self = this,
        fm = self.fm;

    this.getstate = function () {
        return 0;
    };

    fm.bind('received', function () {
        var guid = fm.GetReceivedMailId();
        if (guid) {
            self.exec(guid);
        }
    });
    var $elFinder = $('#elfinder');

    this.exec = function (id) {
        $elFinder.find('#modal .popup').parent().remove();

        var disabled = fm.res('class', 'disabled'),
            hover = fm.res('class', 'hover'),
            popup = $('<div id="modal"><div class="window received-popup popup">' +
                '<div class="header"><h2>' + fm.i18n("receivedmailheader") + '</h2><div class="close"></div></div>' +
                '<div class="scroll-wrap">' +
                '<div class="scroller">' +
                '<div class="img">' +
                '<img src="../../Content/Images/preloader.GIF">' +
                '</div>' +
                '<div class="info">' +
                '<div class="message"></div>' +
                '</div>' +
                '<div class="documents-list ui-helper-clearfix elfinder-cwd ui-selectable ui-droppable elfinder-cwd-view-list"><table></table></div>' +
                '</div>' +
                '<div class="scroller__bar-wrapper"><div class="scroller__bar"></div></div>' +
                '</div>' +
                '<div class="buttons right">' +
                '<div class="elfinder-buttonset">' +
                '<div class="ui-state-default elfinder-button elfinder-link-button" title="' + fm.i18n('cmdcancel2') + '">' +
                '<a class="elfinder-button-text">' + fm.i18n('cmdcancel2') + '</a></div></div>' +
                '<div class="elfinder-buttonset btn btn-big btn-green">' + fm.i18n('gomaster') + '</div>' +
                //'<div class="elfinder-buttonset ui-elfinder-button-green">' +
                //'<div class="ui-state-default elfinder-button" title="' + fm.i18n('gomaster') + '">' +
                //'<span class="elfinder-button-text">' + fm.i18n('gomaster') + '</span></div></div>' +
                '</div>' +
                '</div></div>'),
            mainbut = popup.find('.btn.btn-big.btn-green').addClass(disabled),
            document = '' +
                '<tr  class="elfinder-cwd-file document js-visualize" >' +
                '<td class="name" title="{title}">' +
                '<div class="elfinder-cwd-file-wrapper">' +
                '<span class="elfinder-cwd-icon {icon}"></span>' +
                '<span class="elfinder-cwd-filename">{title}</span>' +
                '</div>' +
                '<div class="top">' +
                '<div class="path js-path" style="display:none">{path}</div>' +
                '<div class="lastChange" style="display:none">{lastChange}</div>' +
                '<div class="operationtype" style="display:none"></div>' +
                '</div>' +
                '</td>' +
                '<td class="kind" title="{type}">{type}</td>' +
                '<td class="actions text-right right" ><a href="#" class="action"></a></td>' +
                '</tr>',

            actionHandler = function (me) {
                var com;
                var file = { name: null, path: null, lastChange: null, mime: null };
                var doc = $(me).parents('.document');
                var type = doc.find('.top .operationtype').text();
                file.path = doc.find('.top .path').text();
                file.lastChange = doc.find('.top .lastChange').text();
                if ((com = fm._commands['post'])) {
                    var data = { Type: type, Files: [] };
                    data.Files.push(file);
                    com.exec(fm.MasterUrl, data);
                }
            },
            addFilesInPopup = function (fs) {

                if (!fs.length || fs.length == 0) showErrorBlock();
                popup.find('.img').hide();
                for (var key in fs) {
                    var file = fs[key];
                    var docPattern = document;

                    docPattern = docPattern.replace('{title}', file.name);
                    docPattern = docPattern.replace('{title}', file.name);
                    docPattern = docPattern.replace('{path}', file.path);
                    docPattern = docPattern.replace('{lastChange}', file.lastChange);
                    docPattern = docPattern.replace('{icon}', fm.mime2class(file.mime));
                    docPattern = docPattern.replace('{type}', fm.mime2kind(file));
                    docPattern = docPattern.replace('{type}', fm.mime2kind(file));
                    docPattern = $(docPattern);

                    var ext = file.name.split('.').pop();
                    var cmd = docPattern.find(".right a");
                    var type = file.type;
                    if (type == 3) {
                        cmd.text(fm.i18n('cmd' + 'decrypt'));
                        docPattern.find(".top .operationtype").text(type);
                        cmd.click(function () {
                            actionHandler($(this));
                        });
                    } else if (type == 4) {
                        cmd.text(fm.i18n('cmd' + 'checksign'));
                        docPattern.find(".top .operationtype").text(type);
                        cmd.click(function (e) {
                            actionHandler($(this));
                        });
                    } else if (type == 6) {
                        cmd.text(fm.i18n('cmd' + 'decryptandchecksign'));
                        docPattern.find(".top .operationtype").text(type);
                        cmd.click(function (e) {
                            actionHandler($(this));
                        });
                    }
                    else {
                        cmd.remove();
                    }

                    popup.find('.documents-list table').append(docPattern);
                }
            },
            checkButton = function () {
                if (popup.find('.documents-list').is(':empty')) {
                    mainbut.removeClass(hover).addClass(disabled);
                } else {
                    mainbut.removeClass(disabled);
                }
            },
            showErrorBlock = function () {
                popup.find('.info').show();
                popup.find('.img').hide();
                popup.find('.info .message')
                    .addClass('error')
                    .text(fm.i18n('errreceivedmail'));
            },
            dfrd = $.Deferred()
                .fail(function (error) {
                    error && fm.error(error);
                });
        checkButton();
        popup.find('.info').hide();
        popup.find('.close')
            .bind('hover', function () {
                $(this).toggleClass(hover);
            })
            .click(function () {
                window.location.href = window.location.href.split('?')[0];
            });
        popup.find('.buttons .elfinder-link-button a').click(function () {
            window.location.href = window.location.href.split('?')[0];
        });

        mainbut
            .click(function () {

                if (!mainbut.is('.' + disabled)) {
                    var docList = popup.find('.documents-list').children().find('tr');
                    var data = { Type: null, Files: [] };
                    var types = [];
                    $.each(docList, function (i, doc) {
                        doc = $(doc);
                        var file = { name: null, path: null, lastChange: null, mime: null };
                        types.push(doc.find('.top .operationtype').text());
                        file.path = doc.find('.top .path').text();
                        file.lastChange = doc.find('.top .lastChange').text();
                        data.Files.push(file);
                    });
                    var type1 = types[0];
                    var undefOper = false;
                    for (var key in types) {
                        if (types[key] != type1) {
                            undefOper = true;
                        }
                    }
                    if (!undefOper && type1 != "") data.Type = type1;
                    var com;
                    if ((com = fm._commands['post'])) {
                        com.exec(fm.MasterUrl, data);
                    }
                }
            })
            .bind("mouseenter mouseleave", function () {
                checkButton();
            })
            .bind('hover', function () {
                !$(this).is('.' + disabled) && $(this).toggleClass(hover);
            });

        $elFinder.append(popup);

        window.scroll = baron({
            root: '.scroll-wrap',
            scroller: '.scroller',
            bar: '.scroller__bar',
            barOnCls: 'baron'
        });



        fm.request({
            data: { cmd: 'recivedmail', fileGroupSendId: id },
            preventFail: true
        })
            .fail(function (error) {
                showErrorBlock();
                window.console && window.console.log && window.console.log(error);
                dfrd.reject();
            })
            .done(function (data) {
                addFilesInPopup(data.Files);
                $('.js-visualize').on('click', function (e) {

                    if ($(e.target).hasClass('action'))
                        return false;

                    var path = $(this).find('.js-path').html();

                    var acceptExt = ['ods','xls','xlsb','xlsx','ods','xlsb','xlsm','xlsx','odp','pot','potm','potx',
                        'pps','ppsm','ppsx','ppt','pptm','pptx','odp','ppsx','pptx','doc','docm','docx','dot',
                        'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp'];
                    var name =  path.split('/');
                    var ext = '';
                    name = name[name.length-1];
                    if (name !== null) {
                        ext = name.split('.');
                        ext = ext[ext.length-1];
                        if (acceptExt.indexOf(ext.toLowerCase()) !== -1) {
                            $.fancybox('#no-visualize',{
                                wrapCSS : 'no-visualiseModal',
                                autoSize	: true,
                                autoResize	: true,
                                scrolling: 'no',
                                afterClose: function() {
                                    window.visualState = false;
                                }
                            });
                        }
                    }

                    $.ajax({
                        url: '/helper/GetVisualizationInfo',async: false,type: "GET",data: {filename: path},
                        success: function (result) {
                            if (!result.Error) {
                                var len = 100;
                                if (name.length > len) {
                                    name = '...'+name.substring(name.length-len, name.length);
                                }
                                if (result.VisualizationUrl) {
                                    var leng=40;
                                    if (name.length > leng) {
                                        name = '...'+name.substring(name.length-leng, name.length);
                                    }
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
                                    });
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
                                    });
                                }
                            } else {
                                $.fancybox('#no-visualize',{
                                    wrapCSS : 'no-visualiseModal',
                                    autoSize	: true,
                                    autoResize	: true,
                                    scrolling: 'no',
                                    afterClose: function() {
                                        window.visualState = false;
                                    }
                                });
                            }
                        },
                        error: function (request, error, result) {}
                    });
                });
                checkButton();
                dfrd.done();
            })
            .always(function () {
                window.scroll && window.scroll.update();
            });
        return dfrd;
    }
};
