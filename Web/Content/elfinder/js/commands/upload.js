"use strict";
/**
 * @class elFinder command "upload"
 * Upload files using iframe or XMLHttpRequest & FormData.
 * Dialog allow to send files using drag and drop
 *
 * @type  elFinder.command
 * @author  Dmitry (dio) Levashov
 */
elFinder.prototype.commands.upload = function() {
    var hover = this.fm.res('class', 'hover');

    this.disableOnSearch = true;
    this.updateOnSelect = false;

    // Shortcut opens dialog
    this.shortcuts = [
        {
            pattern: 'ctrl+u'
        }
    ];

    /**
	 * Return command state
	 *
	 * @return Number
	 **/
    this.getstate = function() {
        return 0; //!this._disabled && this.fm.cwd().write ? 0 : -1;
    };
    this.exec = function(data) {
        var fm = this.fm,
            files,
            existed = [],
            notUpload = [],
            dublicateIndexes = [],

            errText = fm.i18n('errNotUplTitle') + '<br/>',
            error = false,
            opts = {
                title: fm.i18n('attention'),
                buttons: {},
                close: function() {
                    files.length != notUpload.length && fm.upload(data, notUpload);
                }
            },
            cwdFileNames = $.map(fm.files(), function(file) { return file.phash == fm.cwd().hash ? file.name : null; }),
            confirm = function(ndx) {
                var i = existed[ndx],
                    file = files[i],
                    last = ndx == existed.length - 1;

                if (!file) {
                    return;
                }

                fm.confirm({
                    title: fm.i18n('moveFiles'),
                    text: fm.i18n(['errExists', file.name, 'confirmRepl']),
                    //all: !last,
                    accept: {
                        label: 'btnYes',
                        callback: function(all) {
                            !last && !all ? confirm(++ndx)
                                : uploadConf();
                        }
                    },
                    reject: {
                        label: 'btnNo',
                        callback: function(all) {
                            var i;

                            if (all) {
                                i = existed.length;
                                while (ndx < i--) {
                                    //������ ���
                                    dublicateIndexes.push(existed[i]);
                                }
                            } else {
                                //������ ��������
                                dublicateIndexes.push(existed[ndx]);
                            }

                            !last && !all
                                ? confirm(++ndx)
                                : uploadConf();
                        }
                    },
                    cancel: {
                        label: 'btnCancel',
                        callback: function() {
                            dfrd2.resolve();
                        }
                    }
                });
            },
            intersect = function(files, names) {
                var ret = [],
                    i = files.length;

                while (i--) {
                    $.inArray(files[i].name, names) !== -1 && ret.unshift(i);
                }
                return ret;
            },
            uploadConf = function() {
                error
                    ? fm.dialog('<div class="error"><span>' + errText + '</span></div></div>', opts)
                    : fm.upload(data, notUpload, dublicateIndexes);
            },
            upload = function(data) {
                dialog.elfinderdialog('close');
                fm.upload(data)
                    .fail(function(error) {
                        dfrd.reject(error);
                    })
                    .done(function(data) {
                        dfrd.resolve(data);
                    });
            },
            dfrd2 = $.Deferred()
                .fail(function(error) {
                    error && fm.error(error);
                })
                .always(function() {
                    fm.enable();
                }),
            dfrd,
            dialog,
            input,
            button,
            dropbox;

        opts.buttons[fm.i18n('btnClose')] = function() {
            $(this).elfindercryptxdialog('close');
        };

        if (this.disabled()) {
            return $.Deferred().reject();
        }

        if (data && (data.input || data.files)) {
            if (data.input && data.input.files) {
                files = data.input.files;
            } else if (data.files) {
                files = data.files;
            }

            if (files.length > 10) {
                return dfrd2.reject('errUploadMax');
            }
            for (var key in files) {
                var f = files[key];
                if (typeof f.size == "undefined") break;
                if (typeof f.name == "undefined") break;
                if (f.size > 20971520) {
                    notUpload.push(key);
                    errText += '<b>"' + f.name + '"</b>: ' + fm.i18n('errUploadMaxSize') + ';<br/>';
                    error = true;
                } else if (f.size == 0) {
                    notUpload.push(key);
                    errText += '<b>"' + f.name + '"</b>: ' + fm.i18n('errUploadMinSize') + ';<br/>';
                    error = true;
                } else if (f.name.length > 100) {
                    notUpload.push(key);
                    errText += '<b>"' + f.name + '"</b>: ' + fm.i18n('errInvNameSize') + ';<br/>';
                    error = true;
                } else if (f.name.match("[\/|\\|\:|\*|\"|\<|\>|\+|\#|\|]")) {
                    notUpload.push(key);
                    errText += '<b>"' + f.name + '"</b>: ' + fm.i18n('errInvSym') + ';<br/>';
                    error = true;
                }
            }

            existed = intersect(files, cwdFileNames);
            existed.length
                ? confirm(0)
                : uploadConf();

            return;
        }

        dfrd = $.Deferred();


        input = $('<input type="file" multiple="true"/>')
            .change(function() {
                upload({ input: input[0] });
            });

        button = $('<div class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">' + fm.i18n('selectForUpload') + '</span></div>')
            .append($('<form/>').append(input))
            .hover(function() {
                button.toggleClass(hover);
            });
        dialog = $('<div class="elfinder-upload-dialog-wrapper"/>')
            .append(button);

        if (fm.dragUpload) {
            dropbox = $('<div class="ui-corner-all elfinder-upload-dropbox">' + fm.i18n('dropFiles') + '</div>')
                .prependTo(dialog)
                .after('<div class="elfinder-upload-dialog-or">' + fm.i18n('or') + '</div>')[0];

            dropbox.addEventListener('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(dropbox).addClass(hover);
            }, false);

            dropbox.addEventListener('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(dropbox).removeClass(hover);
            }, false);

            dropbox.addEventListener('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            }, false);

            dropbox.addEventListener('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();

                upload({ files: e.dataTransfer.files });
            }, false);

        }

        fm.dialog(dialog, {
            title: this.title,
            modal: true,
            resizable: false,
            destroyOnClose: true
        });

        return dfrd;
    };
};