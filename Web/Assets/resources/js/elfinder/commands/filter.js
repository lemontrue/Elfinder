"use strict";
elFinder.prototype.commands.filter = function() {
    this.options = { ui: 'filterbutton' };
    this.alwaysEnabled = true;
    this.updateOnSelect = false;
    this.getstate = function() {
        return 0;
    };

    this.filterState = 'NotCryptSign';
    this.filterFolder = '';

    this.exec = function(q) {
        var fm = this.fm,
            hash = fm.cwd().hash;
        //console.log(hash)
        if (typeof(q) == 'string' && q) {
            fm.trigger('filterstart', { query: q });

            return fm.request({
                data: { cmd: 'filter', target: hash, q: q },
                notify: { type: 'filter', cnt: 1, hideCnt: true }
            });
        }
        return $.Deferred().reject();
    };
};