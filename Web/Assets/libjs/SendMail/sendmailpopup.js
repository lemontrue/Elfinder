window.sendmailpopup = function(files, addressB, textareaVal, chbVal) {
    var me = this,
        mime2class = function(mime) {
            var prefix = 'elfinder-cwd-icon-';

            mime = mime.split('/');

            return prefix + mime[0] + (mime[0] != 'image' && mime[1] ? ' ' + prefix + mime[1].replace(/(\.|\+)/g, '-') : '');
        },
        mime2kind = function(f) {
            var mime = typeof (f) == 'object' ? f.mime : f, kind;

            if (f.alias) {
                kind = 'Alias';
            } else if (kinds[mime]) {
                kind = kinds[mime];
            } else {
                if (mime.indexOf('text') === 0) {
                    kind = 'Text';
                } else if (mime.indexOf('image') === 0) {
                    kind = 'Image';
                } else if (mime.indexOf('audio') === 0) {
                    kind = 'Audio';
                } else if (mime.indexOf('video') === 0) {
                    kind = 'Video';
                } else if (mime.indexOf('application') === 0) {
                    kind = 'App';
                } else {
                    kind = mime;
                }
            }
            if (kindsname.messages['kind' + kind])
                return kindsname.messages['kind' + kind];
            return mime;
        },
        kinds = {
            'unknown': 'Unknown',
            'directory': 'Folder',
            'symlink': 'Alias',
            'symlink-broken': 'AliasBroken',
            'application/x-empty': 'TextPlain',
            'application/postscript': 'Postscript',
            'application/vnd.ms-office': 'MsOffice',
            'application/vnd.ms-word': 'MsWord',
            'application/msword': 'MsWord',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'MsWord',
            'application/vnd.ms-word.document.macroEnabled.12': 'MsWord',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'MsWord',
            'application/vnd.ms-word.template.macroEnabled.12': 'MsWord',
            'application/x-docx': 'MsWord',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'MsExcel',
            'application/vnd.ms-excel': 'MsExcel',
            'application/vnd.ms-excel.sheet.macroEnabled.12': 'MsExcel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'MsExcel',
            'application/vnd.ms-excel.template.macroEnabled.12': 'MsExcel',
            'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'MsExcel',
            'application/vnd.ms-excel.addin.macroEnabled.12': 'MsExcel',
            'application/vnd.ms-powerpoint': 'MsPP',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'MsPP',
            'application/vnd.ms-powerpoint.presentation.macroEnabled.12': 'MsPP',
            'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'MsPP',
            'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': 'MsPP',
            'application/vnd.openxmlformats-officedocument.presentationml.template': 'MsPP',
            'application/vnd.ms-powerpoint.template.macroEnabled.12': 'MsPP',
            'application/vnd.ms-powerpoint.addin.macroEnabled.12': 'MsPP',
            'application/vnd.openxmlformats-officedocument.presentationml.slide': 'MsPP',
            'application/vnd.ms-powerpoint.slide.macroEnabled.12': 'MsPP',
            'application/pdf': 'PDF',
            'application/xml': 'XML',
            'application/vnd.oasis.opendocument.text': 'OO',
            'application/vnd.oasis.opendocument.text-template': 'OO',
            'application/vnd.oasis.opendocument.text-web': 'OO',
            'application/vnd.oasis.opendocument.text-master': 'OO',
            'application/vnd.oasis.opendocument.graphics': 'OO',
            'application/vnd.oasis.opendocument.graphics-template': 'OO',
            'application/vnd.oasis.opendocument.presentation': 'OO',
            'application/vnd.oasis.opendocument.presentation-template': 'OO',
            'application/vnd.oasis.opendocument.spreadsheet': 'OO',
            'application/vnd.oasis.opendocument.spreadsheet-template': 'OO',
            'application/vnd.oasis.opendocument.chart': 'OO',
            'application/vnd.oasis.opendocument.formula': 'OO',
            'application/vnd.oasis.opendocument.database': 'OO',
            'application/vnd.oasis.opendocument.image': 'OO',
            'application/vnd.openofficeorg.extension': 'OO',
            'application/x-shockwave-flash': 'AppFlash',
            'application/flash-video': 'FlashVideo',
            'application/x-bittorrent': 'Torrent',
            'application/javascript': 'JS',
            'application/rtf': 'RTF',
            'application/rtfd': 'RTF',
            'application/x-font-ttf': 'TTF',
            'application/x-font-otf': 'OTF',
            'application/x-rpm': 'RPM',
            'application/x-web-config': 'TextPlain',
            'application/xhtml+xml': 'HTML',
            'application/docbook+xml': 'DOCBOOK',
            'application/x-awk': 'AWK',
            'application/x-gzip': 'GZIP',
            'application/x-bzip2': 'BZIP',
            'application/zip': 'ZIP',
            'application/x-zip': 'ZIP',
            'application/x-rar': 'RAR',
            'application/x-tar': 'TAR',
            'application/x-7z-compressed': '7z',
            'application/x-compressed-tar': 'archive',
            'application/x-archive': 'archive',
            'application/x-jar': 'JAR',
            'application/vnd.sun.xml.writer.template': 'STW',
            'text/plain': 'TextPlain',
            'text/x-php': 'PHP',
            'text/html': 'HTML',
            'text/javascript': 'JS',
            'text/css': 'CSS',
            'text/rtf': 'RTF',
            'text/rtfd': 'RTF',
            'text/x-c': 'C',
            'text/x-csrc': 'C',
            'text/x-chdr': 'CHeader',
            'text/x-c++': 'CPP',
            'text/x-c++src': 'CPP',
            'text/x-c++hdr': 'CPPHeader',
            'text/x-shellscript': 'Shell',
            'application/x-csh': 'Shell',
            'text/x-python': 'Python',
            'text/x-java': 'Java',
            'text/x-java-source': 'Java',
            'text/x-ruby': 'Ruby',
            'text/x-perl': 'Perl',
            'text/x-sql': 'SQL',
            'text/xml': 'XML',
            'text/x-comma-separated-values': 'CSV',
            'image/x-ms-bmp': 'BMP',
            'image/jpeg': 'JPEG',
            'image/gif': 'GIF',
            'image/png': 'PNG',
            'image/tiff': 'TIFF',
            'image/x-targa': 'TGA',
            'image/vnd.adobe.photoshop': 'PSD',
            'image/xbm': 'XBITMAP',
            'image/pxm': 'PXM',
            'image/x-icn': 'ICON',
            'image/x-icon': 'ICON',
            'image/x-cr2': 'CR2',
            'image/bmp': 'BMP',
            'image/x-pic': 'PIC',
            'image/x-cdr': 'CDR',
            'audio/mpeg': 'AudioMPEG',
            'audio/midi': 'AudioMIDI',
            'audio/ogg': 'AudioOGG',
            'audio/mp4': 'AudioMPEG4',
            'audio/x-m4a': 'AudioMPEG4',
            'audio/wav': 'AudioWAV',
            'audio/x-wave': 'WAVE',
            'audio/x-m4r': 'M4R',
            'audio/x-aac': 'AAC',
            'audio/x-wma': 'WMA',
            'audio/x-mp2': 'MP2',
            'audio/x-dls': 'DLS',
            'audio/x-m4b': 'M4B',
            'audio/x-wav': 'WAV',
            'audio/x-mp1': 'MP1',
            'audio/x-mp3-playlist': 'AudioPlaylist',
            'video/x-dv': 'VideoDV',
            'video/mp4': 'VideoMPEG4',
            'video/mpeg': 'VideoMPEG',
            'video/x-msvideo': 'VideoAVI',
            'video/quicktime': 'VideoMOV',
            'video/x-ms-wmv': 'VideoWM',
            'video/x-flv': 'VideoFlash',
            'video/x-matroska': 'VideoMKV',
            'video/ogg': 'VideoOGG',
            'video/3gpp': '3GP',
            'video/x-mp4': 'MP4',
            'video/x-ms-asf': 'ASF',
            'video/x-amv': 'AMV',
            'video/x-aaf': 'AAF',
            'video/x-mpeg4': 'MPEG4',
            'video/x-xvid': 'XVID',
            'application/pgp-signature': 'Sign',
            'application/crypt': 'Crypt',
            'application/signcrypt': 'SignCrypt',
            'application/x-x509-ca-cert': 'Cert'
        },
        cmd,
        button,
        div,
        close = function() {
            if (location.href.indexOf('parent=elfinder') != -1) {
                if (parent && parent.hidePopup) {
                    parent.hidePopup();
                }
            } else if (location.href.indexOf('parent=master') != -1) {
                if (parent.Master && parent.Master.outside) {
                    parent.Master.outside('exitsendfilewindow');
                }
            }
            popup.remove();
        },
        checkbox = '<span class="button-checkbox bootstrap-checkbox">' +
            '<input type="checkbox" autocomplete="off" style="display: none;">' +
            '<span class="icon cb-icon-check square" style="display: none;"></span>' +
            '<span class="icon cb-icon-check-empty square"></span>запросить уведомление о получении' +
            '</span>',
        disabled = 'ui-state-disabled',
        hover = 'ui-state-hover',
        errortext = $('<div class="error-text">' + 'Адрес электронной почты введен неверно' + '</div>'),

        popup = $('<div class="window send-popup popup">' +
            '<div class="header"><h2>' + 'Отправка файлов' + '</h2><div class="close"></div></div>' +
            '<div class="scroll-padder"><div class="scroll-wrap">' +
            '<div class="scroller">' +
            '<div class="documents-list"></div>' +
            '</div>' +
            '<div class="scroller__bar-wrapper"><div class="scroller__bar"></div></div>' +
            '</div></div>' +
            '<div class="message-box">' +
            '<textarea cols="108" rows="8" placeholder="Введите текст сообщения"></textarea>' +
            '<div class="right">' + checkbox + '</div>' +
            '</div>' +
            '<div class = "action-box">' +
            '<div class = "abs-left">' +
            '<div class="text">' + 'Введите E-mail, на который вы планируете отправить файл:' + '</div>' +
            '<div class="email">' +
            '<div class="action"><a href="#">E-mail</a></div>' +
            '<div class="inp"><input type="text" class="emails" value="" name="emails1"></div>' +
            '</div>' +
            '<div class="info">' +
            '<div class="message"></div>' +
            '<div class="action"><a href="#">' + 'Отправить файлы на другой E-mail' + '</a></div>' +
            '</div>' +
            '<div class="preloader"><img src="~/Assets/i/old/preloader_send.gif"/></div>' +
            '</div>' +
            '<div class="abs-right">' +
            '<div class="buttons"><div class="elfinder-buttonset">' +
            '<div class="ui-state-default elfinder-button elfinder-link-button" style="padding-top:9px" title="' + 'Отмена' + '">' +
            '<a class="elfinder-button-text" >' + 'Отмена' + '</a></div></div>' +
            '<div class="elfinder-buttonset btn btn-big btn-green">' + 'Отправить' + '</div>' +
            '<div class="elfinder-buttonset btn btn-big btn-green js-close" style="display:none">' + 'Закрыть' + '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'),
        textarea = popup.find('textarea'),
        chb = popup.find('input[type=checkbox]'),
        sendbut = popup.find('.btn-green:not(.js-close)').addClass(disabled),
        doct = '<div class="document">' +
            '<div class="icoblock elfinder-cwd-view-list left">' +
            '<span class="elfinder-cwd-icon {icon}"></span>' +
            '</div>' +
            '<div class="textblock">' +
            '<div class="top">' +
            '<div class="title">{title}</div>' +
            '<div class="hash" style="display:none">{path}</div>' +
            '</div>' +
            '<div class="bottom">{type}</div>' +
            '</div>' +
            '<div class="icoblock right">' +
            '<span class="elfinder-button-icon elfinder-button-icon-rm"></span>' +
            '</div>' +
            '</div>',
        addFilesInPopup = function() {
            for (var key in files) {
                var file = files[key];
                var docPattern = doct;

                docPattern = docPattern.replace('{title}', file.name);
                docPattern = docPattern.replace('{path}', file.path);
                docPattern = docPattern.replace('{icon}', mime2class(file.mime));
                docPattern = docPattern.replace('{type}', mime2kind(file));
                docPattern = $(docPattern);
                docPattern.hover(function() {
                    $(this).toggleClass(hover);
                });
                docPattern.find('.icoblock:last')
                    .bind('hover', function() { $(this).toggleClass(hover); })
                    .click(function() {
                        var parent = $(this).parent(),
                            name = parent.find(".title").text(),
                            index = -1;
                        for (var k in files) {
                            var f = files[k];
                            if (f.name == name) {
                                index = k;
                                break;
                            }
                        }
                        $(this).parent().remove();
                        if (index > -1) {
                            files.splice(index, 1);
                        }
                        checkButton();
                    });
                popup.find('.documents-list').append(docPattern);
                checkButton();
            }
        },
        checkButton = function() {
            var email = popup.find('input[type=text].emails').val();
            if ((!checkEmail(email) || popup.find('.documents-list').is(':empty')) || $.inArray(email.split('@')[0].slice(-1), ['_', '-']) !== -1) {
                sendbut.removeClass(hover).addClass(disabled);
            } else {
                sendbut.removeClass(disabled);
            }
        },
        checkInp = function() {

            var inp = popup.find('input[type=text]');

            if (!checkEmail(inp.val())) {
                inp.parent().append(errortext);
                inp.parent().addClass('error');
            } else {
                inp.parent().find('.error-text').remove();
                inp.parent().removeClass('error');
            }
            checkButton();
        },
        checkEmail = function(emails) {
            var re = new RegExp(/^([A-Za-z0-9]+\.{0,1})+([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]+@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{2,6}$/);
            var emailArr = emails.split(',');
            if (emails == null || emails == "") {
                return false;
            }

            for (var i = 0; i < emailArr.length; i++) {
                if (emailArr[i] == "" || !re.test(emailArr[i]) || emailArr[i].length > 70) {
                    return false;
                }
            }
            return true;
        },
        showErrorBlock = function() {
            popup.find('.preloader').hide();
            popup.find('.info').show();
            popup.find('.info .message')
                .removeClass('success')
                .addClass('error')
                .text("Ошибка при отправке файлов");
            popup.find('.info .action').hide();
        },
        showSuccessBlock = function() {
            popup.find('.preloader').hide();
            popup.find('.info').show();
            popup.find('.info .message')
                .removeClass('error')
                .addClass('success')
                .text('Файлы успешно отправлены');
            popup.find('.buttons .btn-green, .buttons a').toggle();
            popup.find('.buttons .js-close').removeClass('ui-state-disabled');
            //
        };

    var key = '';
    var m = location.href.match('key=([A-Za-z0-9_]*)');
    if (m && m.length > 0) {
        key = m[1];
    }
    if (parent.Master && parent.Master.OpenFilesEventHandler) {
        parent.Master.OpenFilesEventHandler('changeTitle', { title: 'Отправка файлов', key: key });
    }

    var keyValue = document.cookie.match('(^|;) ?popupEmail=([^;]*)(;|$)');
    var cookieEmails = keyValue ? keyValue[2] : '';
    popup.find('input[type=text].emails').val(cookieEmails);

    popup.find('input[type=text].emails').keyup(function(e) {
        checkButton();
    });

    popup.find('.message-box textarea').keydown(function(e) {

        var val = $(this).val();
        var max = 500;
        if (val && val.length >= max && (e.keyCode >= 48 && e.keyCode <= 90 || e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode == 13)) {
            e.preventDefault();
            if (!$(this).parent().find(".info-text").length)
                $(this).after('<div class="info-text">Максимальная длина сообщения равна 500 символам</div>');
            return false;
        }
        return true;
    }).bind("keyup input change", function(e) {
        var val = $(this).val();
        var max = 500;
        if (val && val.length > max) {
            $(this).val(val.substring(0, max));
            if (!$(this).parent().find(".info-text").length)
                $(this).after('<div class="info-text">Максимальная длина сообщения равна 500 символам</div>');
        }
    }).focus(function() {
        $(this).parent().find(".info-text").remove();
    });
    popup.find('.button-checkbox')
        .click(function(e) {
            var c = $(this).find('input[type=checkbox]');
            c.change();
        });
    popup.find('input[type=checkbox]')
        .bind('change', function() {
            var pr = $(this).parent();
            var chbox = $(this);
            if (chbox.is(':checked')) {
                pr.find('.cb-icon-check').css('display', 'none');
                pr.find('.cb-icon-check-empty').css('display', 'inline-block');
                chbox.prop("checked", false);
            } else {
                pr.find('.cb-icon-check').css('display', 'inline-block');
                pr.find('.cb-icon-check-empty').css('display', 'none');
                chbox.prop("checked", true);
            }
        });
    addFilesInPopup();
    popup.find('.preloader').hide();
    popup.find('.info').hide();
    popup.find('.info a').click(function() {
        popup.find('.info').hide();
        popup.find('.text').show();
        popup.find('.email').show();
        popup.find('.buttons .btn-green, .buttons a').toggle();
        popup.find('input[type=text].emails').focus();
    });

    popup.find('.close, .js-close')
        .bind('hover', function() { $(this).toggleClass(hover); })
        .click(function() {
            close();
        });

    popup.find('.buttons .elfinder-link-button a').click(function() {
        close();
    });

    popup.find('.email .action a').click(function() {
        popup.remove();
        addressbook(files, $(textarea).val(), $(chb).is(':checked'));
    });

    popup.find('input[type=text]')
        .bind('blur', function() {
            checkInp();

        })
        .bind('focus', function() {
            $(this).parent().find('.error-text').remove();
            $(this).parent().removeClass('error');
        })
        .keydown(function(e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        })
        .keyup(function(e) {
            if (e.keyCode == 13) {
                popup.find('.btn-green').click();
            }
        });

    if (addressB && addressB.length > 0) {
        popup.find('input[type=text].emails').val('');
        $.each(addressB, function(key, val) {
            var txt = popup.find('input[type=text].emails');
            if (txt.val() != "") txt.val(txt.val() + ',' + val);
            else txt.val(val);
        });
        checkButton();
    }

    if (textareaVal) $(textarea).val(textareaVal);
    if (chbVal && !$(chb).is(':checked')) chb.change();

    popup.find('.btn-green')
        .click(function() {
            checkInp();
            if (!sendbut.is('.' + disabled)) {
                var expires = new Date();
                expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
                document.cookie = 'popupEmail=' + popup.find('input[type=text].emails').val() + ';path=/' + ';expires=' + expires.toUTCString();

                $.ajax({
                        url: "/default/sendmailmethod",
                        type: "POST",
                        data: {
                            files: JSON.stringify(files),
                            emails: popup.find('input[type=text].emails').val(),
                            messageText: popup.find('textarea').val(),
                            conformationOfReceipt: popup.find('input[type=checkbox]').is(':checked')
                        },
                        dataType: "json"
                    })
                    .done(function(resp) {
                        if (resp.error) {
                            showErrorBlock();
                            window.console && window.console.log && window.console.log(resp.error);
                        } else showSuccessBlock();
                    })
                    .fail(function(resp) {
                        showErrorBlock();
                        if (resp.error)
                            window.console && window.console.log && window.console.log(resp.error);
                    });

                popup.find('input[type=text].emails').val('');
                checkButton();
                popup.find('.email').hide();
                popup.find('.text').hide();
                popup.find('.preloader').show();
            }
        })
        .bind('hover', function() { !$(this).is('.' + disabled) && $(this).toggleClass(hover); });

    if (location.href.indexOf('parent=master') != -1) {
        popup.find('.header').remove();
        popup.addClass('send-popup-master');
    }

    $('body').append(popup);
    $('html').css('overflow', 'hidden');
    $('body').css('overflow', 'hidden');

    baron({
        root: '.scroll-wrap',
        scroller: '.scroller',
        bar: '.scroller__bar',
        barOnCls: 'baron'
    });
}