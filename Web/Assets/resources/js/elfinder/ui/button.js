"use strict"; /**
 * @class  elFinder toolbar button widget.
 * If command has variants - create menu
 *
 * @author Dmitry (dio) Levashov
 **/
$.fn.elfinderbutton = function(cmd) {
    return this.each(function() {

        var c = 'class',
            fm = cmd.fm,
            disabled = fm.res(c, 'disabled'),
            active = fm.res(c, 'active'),
            hover = fm.res(c, 'hover'),
            item = 'elfinder-button-menu-item',
            selected = 'elfinder-button-menu-item-selected',
            menu,
            table = $("<table><tr><td></td><td></td></tr></table>").css('height', '100%'),
            button = $(this).addClass('ui-state-default elfinder-button') //.append(table)
                .attr('title', cmd.title)
                .append('<span class="elfinder-button-icon elfinder-button-icon-' + cmd.name + '"></span>')
                .hover(function(e) {
                    !button.is('.' + disabled) && button[e.type == 'mouseleave' ? 'removeClass' : 'addClass'](hover); /**button.toggleClass(hover);*/
                })
                .click(function(e) {
                    if (!button.is('.' + disabled)) {
                        $(this).removeClass(hover);
                        if (menu && cmd.variants.length > 1) {
                            // close other menus
                            menu.is(':hidden') && cmd.fm.getUI().click();
                            e.stopPropagation();
                            menu.slideToggle(100);
                        } else {
                            cmd.exec();
                        }

                    } else {
                        if (cmd.name == 'opensendpopup') {
                            var messageWindow = '<div id="modal" style="display: none;" class="message-window"><div class="window alert elfinder-dialog "><div class="header"><div class="close"></div><h2>' + cmd.fm.i18.ru.messages.attentionTheRestriction + '</h2></div><div class="content">' +
                                '<div id="message-panel"><div class="content-group mess-box"><div class="info"><span>' + cmd.fm.i18.ru.messages.noMoreThirtyFiles + '</span></div></div><div class="btn-group"><div class="btn btn-green btn-close">' + cmd.fm.i18.ru.messages.btnClose + '</div></div></div>' +
                                '</div></div></div></div>';
                            $('#elfinder').after(messageWindow);
                            $('#modal.message-window').show();
                            $('#modal.message-window .window .header .close, #modal.message-window .window .content #message-panel .btn-close').click(function() {
                                close();
                            });
                            $(document).keydown(function(e) {
                                if (e.keyCode == 27) {
                                    close();
                                }
                            });

                            var close = function() {
                                $('#modal.message-window').hide().remove();
                            };
                        }
                    }
                }),
            text = $(this).append('<span class="elfinder-button-text">' + cmd.title + '</span>'),
            hideMenu = function() {
                menu.hide();
            };
        //table.find("td:first").append('<span class="elfinder-button-icon elfinder-button-icon-' + cmd.name + '"></span>');
        //table.find("td:last").append('<span class="elfinder-button-text">' + cmd.title + '</span>');
        // if command has variants create menu
        if ($.isArray(cmd.variants)) {
            button.addClass('elfinder-menubutton');

            menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
                .hide()
                .appendTo(button)
                .zIndex(12 + button.zIndex())
                .delegate('.' + item, 'hover', function() { $(this).toggleClass(hover); })
                .delegate('.' + item, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    button.removeClass(hover);
                    cmd.exec(cmd.fm.selected(), $(this).data('value'));
                });

            cmd.fm.bind('disable select', hideMenu).getUI().click(hideMenu);

            cmd.change(function() {
                menu.html('');
                $.each(cmd.variants, function(i, variant) {
                    menu.append($('<div class="' + item + '">' + variant[1] + '</div>').data('value', variant[0]).addClass(variant[0] == cmd.value ? selected : ''));
                });
            });
        }

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