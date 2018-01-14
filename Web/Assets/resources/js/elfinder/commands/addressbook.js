"use strict";
elFinder.prototype.commands.addressbook = function() {

    this.getstate = function() {
        var sel = this.fm.selectedFiles();

        return sel.length >= 1 ? 0 : -1;
    };
    this.exec = function(parentWinCmdName) {
        $('#elfinder').find('#modal .popup').parent().remove();
        var fm = this.fm,
            hover = fm.res('class', 'hover'),
            disabled = fm.res('class', 'disabled'),
            select = 'ui-selected',
            addressBook = [],
            checkbox = '<span class="button-checkbox bootstrap-checkbox">' +
                '<input type="checkbox" class="{class}" autocomplete="off" style="display: none;">' +
                '<span class="icon cb-icon-check square" style="display: none;"></span>' +
                '<span class="icon cb-icon-check-empty square"></span>' +
                '</span>',
            headCB = checkbox.replace('{class}', 'selectall'),
            bodyCB = checkbox.replace('{class}', ''),
            contactsBl = $('<div id="modal"><div class="window popup emails-popup">' +
                '<div class="header"><div class="close"></div></div>' +
                '<div class="top-pan">' + headCB + fm.i18n('selectall') + '</div>' +
                '<div class="scroll-wrap">' +
                '<div class="scroller">' +
                '<div class="contacts-list">' + fm.i18n('addressbookempty') + '</div>' +
                '</div>' +
                '<div class="scroller__bar-wrapper"><div class="scroller__bar"></div></div>' +
                '</div>' +
                '<div class="buttons right"><div class="elfinder-buttonset">' +
                '<div class="ui-state-default elfinder-button elfinder-link-button" title="' + fm.i18n('cmdcancel') + '">' +
                '<a class="elfinder-button-text">' + fm.i18n('cmdcancel') + '</a></div></div>' +
                '<div class="elfinder-buttonset ui-elfinder-button-green">' +
                '<div class="ui-state-default elfinder-button" title="' + fm.i18n('select') + '">' +
                '<span class="elfinder-button-icon elfinder-button-icon-send"></span>' +
                '<span class="elfinder-button-text">' + fm.i18n('select') + '</span></div></div>' +
                '</div>' +
                '</div></div>'),
            selectbut = contactsBl.find('.ui-elfinder-button-green .elfinder-button').addClass(disabled),
            contactlBl = '<div class="contact-block">' +
                '<div class="left checkbox">' +
                bodyCB +
                '</div>' +
                '<div class="textblock">' +
                '<div class="top">' +
                '<div class="title">{title}</div>' +
                '</div>' +
                '</div>' +
                '<div class="email right">' +
                '<span>{email}</span>' +
                '</div>' +
                '</div>',
            selectAll = function() {
                contactsBl.find('input[type=checkbox]:not(:checked)').change();
            },
            unselectAll = function() {
                contactsBl.find('input[type=checkbox]:checked').change();
            },
            addEmailsInPopup = function(list) {
                if (list.length > 0) contactsBl.find('.contacts-list').empty();
                for (var key in list) {
                    var val = list[key];
                    var pattern = contactlBl;

                    pattern = pattern.replace('{title}', val.Name);
                    pattern = pattern.replace('{email}', val.Email);
                    pattern = $(pattern);
                    pattern.find('.button-checkbox')
                        .click(function() {
                            var chb;
                            chb = $(this).find('input[type=checkbox]');
                            chb.change();
                            checkButton();
                        });
                    contactsBl.find('.contacts-list').append(pattern);
                }
            },
            checkButton = function() {
                if (contactsBl.find('input[type=checkbox]:checked').length > 0) {
                    selectbut.removeClass(disabled);
                } else {
                    selectbut.removeClass(hover).addClass(disabled);
                }
            },
            initBlock = function(data) {
                addEmailsInPopup(data.Contacts);
                contactsBl.find('.button-checkbox').bind('hover', function() { $(this).toggleClass(hover); });
                contactsBl.find('input[type=checkbox]')
                    .bind('change', function() {
                        var pr = $(this).parent();
                        var chbox = $(this);
                        if (chbox.is(':checked')) {
                            pr.find('.cb-icon-check').hide();
                            pr.find('.cb-icon-check-empty').show();
                            chbox.prop("checked", false);
                            $(this).parents('.contact-block').removeClass(select);
                        } else {
                            pr.find('.cb-icon-check').show();
                            pr.find('.cb-icon-check-empty').hide();
                            chbox.prop("checked", true);
                            $(this).parents('.contact-block').addClass(select);
                        }
                    });
                contactsBl.find('.top-pan .button-checkbox')
                    .click(function() {
                        var chb;
                        chb = $(this).find('input[type=checkbox]');
                        if (chb.is(':checked')) {
                            unselectAll();
                        } else {
                            selectAll();
                        }
                        checkButton();
                    });

                contactsBl.find('.contact-block').bind('hover', function() { $(this).toggleClass(hover); });

                baron({
                    root: '.scroll-wrap',
                    scroller: '.scroller',
                    bar: '.scroller__bar',
                    barOnCls: 'baron'
                });
            },
            showParentWindow = function() {
                var cmd;
                if ((cmd = fm._commands[parentWinCmdName])) {
                    if (addressBook.length == 0) cmd.exec();
                    else cmd.exec(undefined, addressBook);
                }
            },
            dfrd = $.Deferred()
                .fail(function(error) {
                    error && fm.error(error);
                });

        fm.request({
                data: { cmd: 'getaddressbook', targets: '' },
                preventFail: true
            })
            .fail(function(error) {
                window.console && window.console.log && window.console.log(error);
                dfrd.reject();
            })
            .done(function(data) {
                initBlock(data);
                dfrd.done();
            });

        contactsBl.find('.close')
            .bind('hover', function() { $(this).toggleClass(hover); })
            .click(function() {
                contactsBl.remove();
                showParentWindow();
            });
        contactsBl.find('.buttons .elfinder-link-button a').click(function() {
            contactsBl.remove();
            showParentWindow();
        });
        contactsBl.find('.ui-elfinder-button-green .elfinder-button').click(function() {
            var selectedChb = contactsBl.find('input[type=checkbox]:checked');
            $.each(selectedChb, function(key, inp) {
                var block = $(inp).parents('.contact-block');
                var email = block.find('.email span').text();
                if (email != "") addressBook.push(email);
            });
            showParentWindow();
            contactsBl.remove();
        });

        $('#elfinder').append(contactsBl);

        return dfrd;
    };
};