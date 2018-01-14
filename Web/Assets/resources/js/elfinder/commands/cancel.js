"use strict";
elFinder.prototype.commands.cancel = function() {
    this.options = { ui: 'linkbutton' };

    this.getstate = function() {
        return 0;
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
        fm.trigger('cancel');
        return dfrd;
    };
};