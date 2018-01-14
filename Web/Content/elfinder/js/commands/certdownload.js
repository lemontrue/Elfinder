"use strict";
elFinder.prototype.commands.certdownload = function() {
    var self = this,
        fm = this.fm;

    this.getstate = function() {
        return 0;
    };
    this.exec = function(certThumb) {
        var fm = this.fm,
            base = fm.options.url,
            dfrd = $.Deferred(),
            iframe = '',
            cdata = '',
            i = 1,
            url;

        if (this.disabled() || !certThumb) {
            return dfrd.reject();
        }

        if (fm.oldAPI) {
            fm.error('errCmdNoSupport');
            return dfrd.reject();
        }

        base += base.indexOf('?') === -1 ? '?' : '&';

        iframe += '<iframe class="downloader" id="downloader-cert" style="display:none" src="' +
            base + 'cmd=certdownload&target=' + certThumb + '&download=1"/>';

        $(iframe)
            .appendTo('body')
            .ready(function() {
                setTimeout(function() {
                    $(iframe).each(function() {
                        $('#' + $(this).attr('id')).remove();
                    });
                }, fm.UA.Firefox ? (20000 + (10000 * i)) : 10000); // give mozilla 20 sec + 10 sec for each file to be saved
            });

        return dfrd.resolve();
    };
};