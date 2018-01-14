"use strict";
$.fn.elfinderfilterbutton = function(cmd) {
    return this.each(function() {
        //if (cmd.filterFolder != '') {
        //    cmd.filterState = cmd.filterFolder == cmd.fm.cwd().hash ? cmd.filterState : 'All';
        //} else {
        //    cmd.filterState = 'All';
        //}

        var fm = cmd.fm,
            result = false,
            c = 'class',
            name = cmd.name,
            disabled = fm.res(c, 'disabled'),
            hover = fm.res(c, 'hover'),
            item = 'elfinder-button-menu-item',
            filter = function(val) {
                if (val) {
                    cmd.exec(val).done(function() {
                        result = true;
                    });
                } else {
                    cmd.fm.trigger('filterend');
                }
            },
            filters = ['All', 'Crypt', 'Sign', 'NotCryptSign'],
            abort = function() {
                if (result) {
                    result = false;
                    cmd.fm.trigger('filterend');
                }
            },
            button = $(this).addClass('ui-state-default elfinder-button elfinder-menubutton elfiner-button-' + name + ' ui-elfinder-button-last')
                .attr('title', cmd.title),
            text = $('<div class="btn-group open elfinder-link-button"><a class="filter">' + fm.i18n('filter' + cmd.filterState) + '</a></div>')
                .click(function(e) {
                    if (!button.is('.' + disabled)) {
                        e.stopPropagation();
                        menu.is(':hidden') && cmd.fm.getUI().click();
                        menu.slideToggle(100);
                    }
                })
                .appendTo(button)
                .hover(function(e) {
                    !button.is('.' + disabled) && button.toggleClass(hover);
                }),
            mtext = $('<label class="left">' + cmd.title + '</label>').appendTo(button),

            menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
                .hide()
                .appendTo(button)
                .zIndex(12 + button.zIndex())
                .delegate('.' + item, 'hover', function() { $(this).toggleClass(hover); })
                .delegate('.' + item, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    hide();
                }),
            hide = function() { menu.hide(); },
            clearMenu = function() {
                menu.text("");
            },
            initMenu = function() {
                $.each(filters, function(i, value) {
                    menu.append($('<div class="' + item + '" rel="' + value + '">'
                            + fm.i18n('filter' + value) + '</div>')
                        .click(function(e) {
                            var t = $(this).attr('rel');
                            cmd.filterState = t;

                            cmd.filterFolder = fm.cwd().hash;
                            $($.find('.btn-group a.filter')).text(fm.i18n('filter' + t));
                            filter(t);
                        }));
                });
            };

        initMenu();
        fm.bind('disable select', hide).getUI().click(hide);

        if (menu.children().length > 1) {
            cmd.change(function() {
                button.toggleClass(disabled, cmd.disabled());
            }).change();

        } else {
            button.addClass(disabled);
        }

        cmd.fm
            .error(function() {
                //input.unbind('keydown');
            })
            .select(function() {
                //input.blur();
            })
            .bind('filterend', function() {
                cmd.filterState = 'NotCryptSign';
                $('.btn-group.open.elfinder-link-button a.filter').text(fm.i18n('filter' + 'NotCryptSign'));
            });
        //.viewchange(abort);
    });
};