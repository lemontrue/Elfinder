window.addressbook = function(files, textareaVal, chbVal) {
    var disabled = 'ui-state-disabled',
        hover = 'ui-state-hover',
        select = 'ui-selected',
        addressBook = [],
        checkbox = '<span class="button-checkbox bootstrap-checkbox">' +
            '<input type="checkbox" class="{class}" autocomplete="off" style="display: none;">' +
            '<span class="icon cb-icon-check square" style="display: none;"></span>' +
            '<span class="icon cb-icon-check-empty square"></span>{text}' +
            '</span>',
        headCB = checkbox.replace('{class}', 'selectall').replace('{text}', 'Выбрать все'),
        bodyCB = checkbox.replace('{class}', '').replace('{text}', ''),
        contactsBl = $('<div class="window popup emails-popup">' +
            '<div class="header"><h2>' + 'Выберите получателя' + '</h2><div class="close"></div></div>' +
            '<div class="top-pan">' + headCB + '</div>' +
            '<div class="scroll-padder"><div class="scroll-wrap">' +
            '<div class="scroller">' +
            '<div class="contacts-list">' +
            '<div class="img">' +
            '<img src="~/Assets/i/old/preloader.gif">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="scroller__bar-wrapper"><div class="scroller__bar"></div></div>' +
            '</div><hr></div>' +
            '<div class="buttons right"><div class="elfinder-buttonset">' +
            '<div class="ui-state-default elfinder-button elfinder-link-button" title="' + 'Отмена' + '">' +
            '<a class="elfinder-button-text">' + 'Отмена' + '</a></div></div>' +
            '<div class="elfinder-buttonset btn btn-big btn-green">' + "Выбрать" + '</div>' +
            '</div>' +
            '</div>'),
        selectbut = contactsBl.find('.btn-green').addClass(disabled),
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
            if (!list || !list.length || list.length == 0) {
                showInfoBlock();
                return;
            }
            contactsBl.find('.top-pan').show();
            contactsBl.find('.contacts-list').empty();
            for (var key in list) {
                var val = list[key];
                var pattern = contactlBl;
                if (!val.Email || val.Email == "") continue;
                pattern = pattern.replace('{title}', val.Name);
                pattern = pattern.replace('{email}', val.Email);
                pattern = $(pattern);
                pattern.hover(function() {
                    $(this).toggleClass(hover);
                }).click(function(e) {
                    unselectAll();
                    var chb = $(this).find('input[type=checkbox]');
                    chb.change();
                    checkButton();
                }).dblclick(function() {
                    unselectAll();
                    var chb = $(this).find('input[type=checkbox]');
                    chb.change();
                    checkButton();
                    contactsBl.find('.btn-green').click();
                });
                pattern.find('.button-checkbox')
                    .click(function(e) {
                        e.stopPropagation();
                        var chb = $(this).find('input[type=checkbox]');
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
            contactsBl.find('.button-checkbox')
                .bind('hover', function() { $(this).toggleClass(hover); });
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

            window.scroll && window.scroll.update();
        },
        showErrorBlock = function() {
            contactsBl.find('.contacts-list').empty();
            contactsBl.find('.contacts-list').text("Произошла ошибка при получении адресной книги.");
        },
        showInfoBlock = function() {
            contactsBl.find('.contacts-list').empty();
            contactsBl.find('.contacts-list').text("Адресная книга пуста.");
        },
        showParentWindow = function() {
            sendmailpopup(files, addressBook, textareaVal, chbVal);
        };

    var key = '';
    var m = location.href.match('key=([A-Za-z0-9_]*)');
    if (m && m.length > 0) {
        key = m[1];
    }
    if (parent.Master && parent.Master.OpenFilesEventHandler) {
        parent.Master.OpenFilesEventHandler('changeTitle', { title: 'Выберите получателя', key: key });
    }
    contactsBl.find('.top-pan').hide();
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
    contactsBl.find('.btn-green').click(function() {
        var selectedChb = contactsBl.find('input[type=checkbox]:checked');
        $.each(selectedChb, function(key, inp) {
            var block = $(inp).parents('.contact-block');
            var email = block.find('.email span').text();
            if (email != "") addressBook.push(email);
        });
        contactsBl.remove();
        showParentWindow();
    });

    if (location.href.indexOf('parent=master') != -1) {
        contactsBl.find('.header').remove();
        contactsBl.addClass('emails-popup-master');
    }
    $('body').append(contactsBl);
    window.scroll = baron({
        root: '.scroll-wrap',
        scroller: '.scroller',
        bar: '.scroller__bar',
        barOnCls: 'baron'
    });

    $.ajax({
            url: "/default/getaddressbook",
            type: "POST",
            dataType: "json"
        })
        .done(function(resp) {
            if (resp.error) {
                showErrorBlock();
                window.console && window.console.log && window.console.log(resp.error);
            } else initBlock(resp);
        })
        .fail(function(resp) {
            if (resp.error) {
                showErrorBlock();
                window.console && window.console.log && window.console.log(resp.error);
            }
        });
}