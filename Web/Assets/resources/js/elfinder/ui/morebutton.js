"use strict";
$.fn.elfindermorebutton = function(cmd) {

    return this.each(function() {
        var fm = cmd.fm,
            commands = fm._commands,
            name = cmd.name,
            c = 'class',
            disabled = fm.res(c, 'disabled'),
            hover = fm.res(c, 'hover'),
            item = 'elfinder-button-menu-item',
            includedCommands = ['copy', 'paste', 'rm', 'rename', 'download', 'opensendpopup'],

            button = $(this).addClass('ui-state-default elfinder-button elfinder-menubutton elfiner-button-' + name + ' ui-elfinder-button-last')
                .attr('title', cmd.title)
                .hover(function(e) {
                    !button.is('.' + disabled) && button.toggleClass(hover);
                })
                .click(function(e) {
                    if (!button.is('.' + disabled)) {
                        e.stopPropagation();
                        $.each(menu.children(), function() {
                            var t = $(this).attr('rel');
                            $(this).removeClass(disabled);
                            var com;
                            if (!(com = commands[t]) || com.getstate() != 0) {
                                $(this).addClass(disabled);
                            }
                        });
                        menu.is(':hidden') && cmd.fm.getUI().click();
                        menu.slideToggle(100);
                    }
                }),
            text = $(this).append('<span class="elfinder-button-text">' + cmd.title + '</span>'),
            icon = $(this).append('<span class="caret"></span>'),
            menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
                .hide()
                .appendTo(button)
                .zIndex(12 + button.zIndex())
                .delegate('.' + item, 'hover', function() { !$(this).is('.' + disabled) && $(this).toggleClass(hover); })
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
                $.each(includedCommands, function(name, value) {
                    menu.append($('<div class="' + item + '" rel="' + value + '"><span class="elfinder-button-icon elfinder-button-icon-' + value + '"/><span class="ui-icon ui-icon-arrowthick-1-s"/>'
                            + fm.i18n('cmd' + value) + '</div>')
                        .click(function(e) {
                            var t = $(this).attr('rel');
                            !$(this).is('.' + disabled) && cmd.exec(t);
                        }));
                });
            },

            addCommand = function(comName) {
                includedCommands.push(comName);
                clearMenu();
                initMenu();
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
    });

};