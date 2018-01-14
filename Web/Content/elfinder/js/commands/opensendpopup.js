"use strict";
elFinder.prototype.commands.opensendpopup = function() {
    var self = this,
        filter = function(hashes) {
            return $.map(self.files(hashes), function(f) { return f.mime == 'directory' ? null : f; });
        };
    this.getstate = function() {
        var sel = this.fm.selected(),
            cnt = sel.length;

        return sel.length >= 1 && sel.length <= 30 && cnt == filter(sel).length ? 0 : -1;
    };

    this.exec = function(hashes) {
        $('#elfinder').find('#modal').remove();
        var fm = this.fm,
            files = this.hashes(hashes),
            src = '/Default/sendmail?parent=elfinder&files=',
            popup = '<div id="modal"><div class="window send-popup popup">' +
                '<iframe src="{src}" style="border: none;height: 500px;width: 100%;"></iframe>' +
                '</div></div>',
            dfrd = $.Deferred()
                .fail(function(error) {
                    error && fm.error(error);
                });

        fm.request({
                data: { cmd: 'geturi', targets: files },
                preventFail: true
            })
            .fail(function(error) {
                dfrd.reject(error);
            })
            .done(function(data) {
                var uri = encodeURIComponent(JSON.stringify(data.Files));
                src = src + uri;
                popup = popup.replace('{src}', src);
                $('#elfinder').append(popup);

                window.hidePopup = function() {
                        $('#elfinder').find('#modal .popup').parent().remove();
                    },
                    dfrd.done();
            });
    };
};