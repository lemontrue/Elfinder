"use strict";
$.fn.elfinderbottomaddpanel = function(fm, opts) {
    this.not('.elfinder-bottomaddpanel').each(function() {
        var c = 'class',
            green = 'ui-elfinder-button-green',
            mainclass = 'ui-widget-content ui-corner-all elfinder-buttonset',
            disabled = fm.res(c, 'disabled'),
            hover = fm.res(c, 'hover'),
            commands = fm._commands,
            cmd = commands['add'],
            buttons = $('<div class="buttons"/>'),
            cancelB = $('<div class="elfinder-buttonset">' +
                    '<div class="ui-state-default elfinder-button elfinder-link-button" title="' + fm.i18n('cmdcancel') + '">' +
                    '<a class="elfinder-button-text">' + fm.i18n('cmdcancel2') + '</a></div>' +
                    '</div>')
                .click(function() {
                    if (parent.Master && parent.Master.OpenFilesEventHandler) {
                        parent.Master.OpenFilesEventHandler('close');
                    }
                }),
            addBut = $('<div class="elfinder-buttonset btn btn-big btn-green">' + fm.i18n('cmdadd') + '</div>')
                .click(function() {
                    if (!addBut.is('.' + disabled) && cmd) {
                        cmd.exec();
                    }
                }),
            self = $(this).addClass('ui-widget-header ui-helper-clearfix ui-corner-bottom elfinder-bottomaddpanel')
                .css('height', '38px')
                .css('font-size', '12px')
                .prepend(buttons);


        cmd.change(function() {
                if (cmd.disabled()) {
                    addBut.removeClass(hover).addClass(disabled);
                } else {
                    addBut.removeClass(disabled);
                }
            })
            .change();

        buttons.prepend(cancelB);
        buttons.append(addBut);
        //$.each(includedCommands, function (name, value) {
        //    var cmd, button, div=$("<div/>");
        //    if ((cmd = commands[value])) {
        //        div.addClass(mainclass);
        //        if (value == 'add') div.addClass(green);
        //        button = 'elfinder' + cmd.options.ui;
        //        $.fn[button] && div.prepend($('<div/>')[button](cmd)) && buttons.append(div);
        //    }
        //});

        self.prev().length && self.parent().append(this) && self.show();
    });

    return this;
};