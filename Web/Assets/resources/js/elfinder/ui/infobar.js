"use strict";
$.fn.elfinderinfobar = function(fm, opts) {
    this.not('.elfinder-infobar').each(function() {
        var includedCommands = ['rm', 'download', 'opensendpopup'],
            commands = fm._commands,
            com,
            button,
            icon = $('<div class="selectico"><span></span></div>'),
            name = $('<div class="titleblock"><div class="title"></div><div class="rename"></div></div>'),
            lastChange = $('<div class="dateblock">' + fm.i18n('lastchange') + '<span class="datespan"></span><br> '
                + fm.i18n('sizeinfo') + '<span class="sizespan"></span><div class="link"></div></div>'),
            buttons = $('<div class="selectfunc"><div class="visual-btn-box"><a class="visual-btn js-visaulize"></a></div><div class="view left"></div><div class="funcbuttons right"></div></div>'),
            cryptInfo = $('<div class="signature"/>'),

            infoblock = $('<div class="selectinfo"/>').append(name).append(lastChange).append(buttons),
            selblock = $('<div class="selectblock"/>').append(icon).append(infoblock).append(cryptInfo).hide(),
            self = $(this).addClass('ui-widget-header ui-helper-clearfix ui-corner-bottom elfinder-infobar')
                .css('height', '173px')
                .css('font-size', '12px')
                .prepend(selblock);

        $.each(includedCommands, function(i, value) {
            if ((com = commands[value])) {
                button = 'elfinder' + com.options.ui;
                $.fn[button] && buttons.find(".funcbuttons").append($('<div/>')[button](com));
            }
        });

        if ((com = commands['cryptinfo'])) {
            button = 'elfinder' + com.options.ui;
            $.fn[button] && lastChange.find(".link").prepend($('<div/>')[button](com));
        }

        if ((com = commands['rename'])) {
            button = 'elfinderlinkbutton';
            $.fn[button] && name.find(".rename").prepend($('<div/>')[button](com));
        }

        self.prev().length && self.parent().append(this);

    });

    return this;
};