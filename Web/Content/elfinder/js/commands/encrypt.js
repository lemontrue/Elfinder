"use strict";
elFinder.prototype.commands.encrypt = function() {

    this.getstate = function() {
        var sel = this.fm.selectedFiles(),
            cnt = sel.length;

        var files = $.map(sel, function(f) { return f.mime == 'directory' ? null : f; });
        return cnt >= 1 && cnt == files.length ? 0 : -1;
    };
    this.exec = function(hashes) {
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
            files = this.hashes(hashes);

            //fm.lockfiles({ files: files });
            fm.request({
                    data: { cmd: 'encrypt', targets: files },
                    notify: { type: 'encrypt', cnt: cnt },
                    preventFail: true
                })
                .fail(function(error) {
                    dfrd.reject(error);
                })
                .done(function(data) {
                        var com;
                        if ((com = fm._commands['post'])) {
                            com.exec(fm.MasterUrl, data);
                        }
                        dfrd.done();
                    }
                ).always(function() {
                    //fm.unlockfiles({ files: files });
                });
        }

        return dfrd;
    };
};