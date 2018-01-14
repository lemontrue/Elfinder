"use strict";
$.fn.elfindercryptxdialog = function(opts) {
    var dialog, modal;

    if (typeof (opts) == 'string' && (dialog = this.closest('.window.alert')).length && (modal = dialog.parent('#modal')).length) {
        if (opts == 'open') {
            modal.css('display') == 'none' && modal.fadeIn(120, function() {
                dialog.trigger('open');
            });
        } else if (opts == 'close') {
            modal.css('display') != 'none' && modal.hide() && dialog.trigger('close');
        } else if (opts == 'destroy') {
            modal.hide().remove();
        } else if (opts == 'toTop') {
            //modal.trigger('totop');
        }
    }

    opts = $.extend({}, $.fn.elfindercryptxdialog.defaults, opts);

    this.filter(':not(.content, .content-group)').each(function() {
        var parent = $(this).parent(),
            self = $('<div/>').addClass('content'),
            messagepan = $('<div id="message-panel"/>').appendTo(self),
            contgr = $(this).addClass("content-group mess-box").appendTo(messagepan),
            modal = $('<div/>').attr('id', 'modal').hide().appendTo(parent),
            clactive = 'elfinder-dialog-active',
            cldialog = 'elfinder-dialog',
            clnotify = 'elfinder-dialog-notify',
            clhover = 'ui-state-hover',
            id = parseInt(Math.random() * 1000000),
            buttonset = $('<div class="btn-group"/>'),

            dialog = $('<div class="window alert ' + cldialog + ' ' + opts.cssClass + '"/>') //ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable std42-dialog 
                .append(self)
                .appendTo(modal)
                .bind('open', function() {
                    typeof (opts.open) == 'function' && $.proxy(opts.open, self[0])();
                })
                .bind('close', function() {
                    setTimeout(function() {
                        parent.mousedown().click();
                    }, 10);

                    if (typeof (opts.close) == 'function') {
                        $.proxy(opts.close, self[0])();
                    } else if (opts.destroyOnClose) {
                        modal.hide().remove();
                    }
                })
                .data({ modal: opts.modal });


        if (opts.closeOnEscape) {
            $(document).bind('keyup.' + id, function(e) {
                if (e.keyCode == $.ui.keyCode.ESCAPE && dialog.is('.' + clactive)) {
                    self.elfindercryptxdialog('close');
                    $(document).unbind('keyup.' + id);
                }
            });
        }
        dialog.prepend(
            $('<div class="header"><h2>' + opts.title + '</h2></div>')
            .prepend($('<div class="close"></div>')
                .mousedown(function(e) {
                    e.preventDefault();
                    self.elfindercryptxdialog('close');
                }))
        );

        $.each(opts.buttons, function(name, cb) {
            var button;
            if (name.indexOf("Отмена") == -1) button = $('<div class="btn btn-green">' + name + '</div>');
            else button = $('<div class="btn">' + name + '</div>');
            //var button = $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">' + name + '</span></button>')
            button
                .click($.proxy(cb, self[0]))
                .hover(function(e) { $(this)[e.type == 'mouseenter' ? 'focus' : 'blur'](); })
                .focus(function() { $(this).addClass(clhover); })
                .blur(function() { $(this).removeClass(clhover); })
                .keydown(function(e) {
                    var next;

                    if (e.keyCode == $.ui.keyCode.ENTER) {
                        $(this).click();
                    } else if (e.keyCode == $.ui.keyCode.TAB) {
                        next = $(this).next('.ui-button');
                        next.length ? next.focus() : $(this).parent().children('.ui-button:first').focus();
                    }
                });
            buttonset.prepend(button);
        });

        buttonset.children().length && messagepan.append(buttonset);

        typeof (opts.create) == 'function' && $.proxy(opts.create, this)();

        opts.autoOpen && self.elfindercryptxdialog('open');

    });

    return this;
};
$.fn.elfindercryptxdialog.defaults = {
    cssClass: '',
    title: '',
    modal: false,
    resizable: true,
    autoOpen: true,
    closeOnEscape: true,
    destroyOnClose: false,
    buttons: {},
    position: null,
    width: 320,
    height: 'auto',
    minWidth: 200,
    minHeight: 110
};