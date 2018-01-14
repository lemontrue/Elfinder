"use strict";
elFinder.prototype.commands.add = function() {

    this.getstate = function() {
        var sel = this.fm.selectedFiles(),
            cnt = sel.length;

        var files = $.map(sel, function(f) {
            return f.mime == 'directory' ? null : f;
        });
        return cnt >= 1 && cnt == files.length ? 0 : -1;
    };
    this.exec = function(hashes, opts) {

        var fm = this.fm,
            cwd = fm.cwd().hash,
            files = this.files(hashes),
            cnt = files.length,
            dfrd = $.Deferred()
                .fail(function(error) {
                    error && fm.error(error);
                });

        if (!cnt || this._disabled) {
            return dfrd.reject();
        }

        $.each(files, function(i, file) {
            if (!file.phash) {
                return !dfrd.reject(['errRm', file.name, 'errPerm']);
            }
            if (file.locked) {
                return !dfrd.reject(['errLocked', file.name]);
            }
        });
        if (dfrd.state() == 'pending') {
            var file = this.fm.selectedFiles();
            files = this.hashes(hashes);
            fm.request({
                    data: { cmd: 'add', targets: files },
                    notify: { type: 'add', cnt: cnt },
                    preventFail: true
                })
                .fail(function(error) {
                    dfrd.reject(error);
                })
                .done(function(data) {
                        var href = window.location.href;
                        var key = '';
                        var m = href.match('key=([A-Za-z0-9_]*)');
                        if (m && m.length > 0) {
                            key = m[1];
                        }
                        if (parent.Master && parent.Master.OpenFilesEventHandler) {
                            parent.Master.OpenFilesEventHandler('addFile', { files: data.Files, key: key });
                        } else {
                            visualisation(data.Files,file, opts);
                        }
                        dfrd.done();
                    }
                ).always(function() {
                });
        }
        return dfrd;
    };
};