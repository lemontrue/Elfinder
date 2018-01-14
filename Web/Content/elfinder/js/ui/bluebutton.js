"use strict";
$.fn.elfinderbluebutton = function(cmd) {
    return this.each(function() {

        var c = 'class',
            fm = cmd.fm,
            disabled = fm.res(c, 'disabled'),
            active = fm.res(c, 'active'),
            hover = fm.res(c, 'hover'),
            item = 'elfinder-button-menu-item',
            selected = 'elfinder-button-menu-item-selected',
            menu,
            button = $(this).addClass('ui-state-default elfinder-button btn btn-blue')
                .attr('title', cmd.title)
                .append('<span class="elfinder-button-icon elfinder-button-icon-' + cmd.name + '"></span>')
                .hover(function(e) {
                    !button.is('.' + disabled) && button[e.type == 'mouseleave' ? 'removeClass' : 'addClass'](hover);
                })
                .click(function(e) {
                    if (!button.is('.' + disabled)) {
                        cmd.exec();
                    }
                });

        cmd.change(function() {
                if (cmd.disabled()) {
                    button.removeClass(active + ' ' + hover).addClass(disabled);
                } else {
                    button.removeClass(disabled);
                    button[cmd.active() ? 'addClass' : 'removeClass'](active);
                }
            })
            .change();
    });
};