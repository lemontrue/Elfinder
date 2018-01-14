"use strict";
$.fn.elfinderlinkbutton = function(cmd, thumb, buttontext) {
    return this.each(function() {
        var c = 'class',
            fm = cmd.fm,
            disabled = fm.res(c, 'disabled'),
            active = fm.res(c, 'active'),
            hover = fm.res(c, 'hover'),
            button = $(this).addClass('ui-state-default elfinder-button elfinder-link-button')
                .attr('title', buttontext ? buttontext.replace(/<\/?[^>]+>/gi, '') : cmd.title)
                .hover(function(e) {
                    !button.is('.' + disabled) && button[e.type == 'mouseleave' ? 'removeClass' : 'addClass'](hover);
                })
                .click(function(e) {
                    var t = $(this).attr('rel');
                    if (!button.is('.' + disabled)) {
                        if (t) cmd.exec(t);
                        else cmd.exec();
                    }
                }),
            linktext = '<a class="elfinder-button-text">{text}</a>';
        linktext = linktext.replace('{text}', buttontext ? buttontext : cmd.title);
        $(this).append(linktext);
        if (thumb)button.attr('rel', thumb);

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