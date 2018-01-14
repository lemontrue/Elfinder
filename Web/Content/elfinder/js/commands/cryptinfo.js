"use strict";
elFinder.prototype.commands.cryptinfo = function() {
    this.options = { ui: 'linkbutton' };

    this.getstate = function() {
        var sel = this.fm.selectedFiles();

        if (sel.length == 1) {
            var extension = sel[0].name.substr((sel[0].name.lastIndexOf('.') + 1));
            switch (extension) {
            case 'enc':
            case 'sig':
                return 0;
            default:
                return -1;
            }
        }

        return -1;
    };
    this.exec = function(hashes) {
        var fm = this.fm,
            cwd = fm.cwd().hash,
            files = this.files(hashes),
            cnt = files.length,
            cmd = fm._commands['infobarcmd'],
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
                    data: { cmd: 'cryptinfo', targets: files },
                    notify: { type: 'cryptinfo', cnt: cnt },
                    preventFail: true
                })
                .fail(function(error) {
                    if (cmd) {
                        cmd.exec("Empty");
                    }
                    dfrd.done();
                })
                .done(function(data) {
                        if (cmd) {
                            cmd.exec(data);
                        }
                        dfrd.done();
                    }
                ).always(function() {
                    fm.unlockfiles({ files: files });
                });
        }

        return dfrd;
    };
};