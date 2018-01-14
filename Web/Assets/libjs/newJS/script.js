window.onload = function() {
    window.scroll = $('.scroll-wrap').baron({
        root: '.scroll-wrap',
        scroller: '.scroller',
        bar: '.scroller__bar',
        barOnCls: 'baron'
    });
};


jQuery(document).ready(function() {

    $(".modal").fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        wrapCSS: 'modal-border',
        padding: [12, 22, 22, 22],
        topRatio: 0.2,
        afterShow: function() {
            scroll.update();
            scroll.update();
            $("[placeholder]").textPlaceholder();
        }
    });

    $('.modal-window a.close, div.close').click(function() {

        //pr.fancyboxClosed();
        $.fancybox.close();
    }); /*
    $(function () {
        var tabs = $('div.tabs > .tabs-content > div');
        tabs.hide().filter(':first').show();
        tabs.filter(':first').click();
        $('body').on('click','div.tabs ul.tabs-nav a',function () {
            tabs.hide();
            tabs.filter(this.hash).show();
            $('div.tabs ul.tabs-nav li').removeClass('active');
            $(this).parent().addClass('active');
            scroll.update();scroll.update();
            return false;
        }).filter(':first').click();
    });
    */

    $('.checkCaps').on('keydown', function(e) { $(this).data('_lastKey', e.which); });
    $('.checkCaps').on('keypress', function(e) {
        var lastKey = +$(this).data('_lastKey');
        if (lastKey < 47 || lastKey > 90)
            return true;
        var letter = String.fromCharCode(e.which);
        var upper = letter.toUpperCase();
        var lower = letter.toLowerCase();
        var isNumeric = lastKey >= 48 && lastKey <= 57;
        var caps = false;
        if (isNumeric)
            caps = (lastKey == e.which && e.shiftKey) || (lastKey != e.which && !e.shiftKey);
        else if ((letter === upper && !e.shiftKey) || (letter === lower && e.shiftKey))
            caps = !isNumeric;
        if (caps)
            $(this).parent().find('.checkBubble').show();
        else
            $(this).parent().find('.checkBubble').hide();
    });

    $(function() {
        $('.rowCheck td input[type=checkbox]').click(
            function() {
                var table = $(this).closest('table'),
                    tableExternal = $('#findedCertificatesHeader');

                var str = $(this).parent('td').parent('tr');
                if (this.checked) {
                    $(str).addClass('selected');
                    allChecked(table);
                    allCheckedExternal(table, tableExternal);
                } else {
                    $(table).find('input[type=checkbox].checkAll').removeAttr('checked');
                    $(table).find('thead .cb-icon-check').css('display', 'none');
                    $(table).find('thead .cb-icon-check-empty').css('display', 'inline-block');

                    $(tableExternal).find('input[type=checkbox].checkAll').removeAttr('checked');
                    $(tableExternal).find('thead .cb-icon-check').css('display', 'none');
                    $(tableExternal).find('thead .cb-icon-check-empty').css('display', 'inline-block');

                    $(str).removeClass('selected');
                }
            });
        $('.rowCheck input[type=checkbox].checkAll').click(
            function() {
                var table = $(this).closest('table');
                if (this.checked) {
                    $(table).find('tbody tr').addClass('selected');
                    $(table).find('tbody input[type=checkbox]').attr('checked', 'checked');
                    $(table).find('tbody .cb-icon-check').css('display', 'inline-block');
                    $(table).find('tbody .cb-icon-check-empty').css('display', 'none');
                } else {
                    $(table).find('tbody tr').removeClass('selected');
                    $(table).find('tbody tr input[type=checkbox]').removeAttr('checked');
                    $(table).find('tbody .cb-icon-check').css('display', 'none');
                    $(table).find('tbody .cb-icon-check-empty').css('display', 'inline-block');
                }
            });

        function allChecked(table) {
            var coun1 = $(table).find('td input[type=checkbox]').size();
            var coun2 = $(table).find('td input[type=checkbox]:checked').size();
            if (coun1 == coun2) {
                $(table).find('input[type=checkbox].checkAll').attr('checked', 'checked');
                $(table).find('thead .cb-icon-check').css('display', 'inline-block');
                $(table).find('thead .cb-icon-check-empty').css('display', 'none');
            }
        }

        function allCheckedExternal(table, headerTable) {
            var coun1 = $(table).find('td input[type=checkbox]').size();
            var coun2 = $(table).find('td input[type=checkbox]:checked').size();
            if (coun1 == coun2) {
                $(headerTable).find('input[type=checkbox].checkAll').attr('checked', 'checked'); //;
                $(headerTable).find('thead .cb-icon-check').css('display', 'inline-block');
                $(headerTable).find('thead .cb-icon-check-empty').css('display', 'none');
            }
        }

    });

    $(function() {
        $('.manyCheckBox input[type=checkbox]:not(.checkAll)').click(
            function() {
                var table = $(this).closest('.manyCheckBox');
                var str = $(this).closest('tr');
                var all = $(table).find('input[type=checkbox].checkAll');
                var allRow = $(all).closest('tr');
                $(str).toggleClass('selected');
                if (this.checked) allChecked(table);
                else {
                    $(all).removeAttr('checked');
                    $(allRow).find('.cb-icon-check').css('display', 'none');
                    $(allRow).find('.cb-icon-check-empty').css('display', 'inline-block');
                }
            });
        $('.manyCheckBox input[type=checkbox].checkAll').click(
            function() {
                var table = $(this).closest('.manyCheckBox');
                if (this.checked) {
                    $(table).find('input[type=checkbox]:not(.checkAll)').each(
                        function() {
                            $(this).closest('tr').addClass('selected');
                            $(this).attr('checked', 'checked');
                            $(this).closest('tr').find('.cb-icon-check').css('display', 'inline-block');
                            $(this).closest('tr').find('.cb-icon-check-empty').css('display', 'none');
                        }
                    );
                } else {
                    $(table).find('input[type=checkbox]:not(.checkAll)').each(
                        function() {
                            $(this).closest('tr').removeClass('selected');
                            $(this).removeAttr('checked');
                            $(this).closest('tr').find('.cb-icon-check').css('display', 'none');
                            $(this).closest('tr').find('.cb-icon-check-empty').css('display', 'inline-block');
                        }
                    );
                }
            });

        function allChecked(table) {
            var coun1 = $(table).find('td input[type=checkbox]').size();
            var coun2 = $(table).find('td input[type=checkbox]:checked').size();
            if (coun1 == coun2) {
                $(table).find('input[type=checkbox].checkAll').attr('checked', 'checked'); //;
                $(table).find('thead .cb-icon-check').css('display', 'inline-block');
                $(table).find('thead .cb-icon-check-empty').css('display', 'none');
            }
        }

    });

    $(function() {
        $('#certificats input[type=checkbox]').click(
            function() {
                var table = $(this).closest('#certificats');
                var str = $(this).closest('.certificat');
                if (this.checked) {
                    $(str).addClass('selected');
                    allChecked(table);
                } else {
                    $(table).find('input[type=checkbox].checkAll').removeAttr('checked');
                    $(table).find('.check-all .cb-icon-check').css('display', 'none');
                    $(table).find('.check-all .cb-icon-check-empty').css('display', 'inline-block');
                    $(str).removeClass('selected');
                }
            });
        $('#certificats .filter input[type=checkbox].checkAll').click(
            function() {
                var table = $(this).closest('#certificats').find('.certificats-list');
                if (this.checked) {
                    $(table).find('.certificat').addClass('selected');
                    $(table).find('.certificat input[type=checkbox]').attr('checked', 'checked');
                    $(table).find('.certificat .cb-icon-check').css('display', 'inline-block');
                    $(table).find('.certificat .cb-icon-check-empty').css('display', 'none');
                } else {
                    $(table).find('.certificat').removeClass('selected');
                    $(table).find('.certificat input[type=checkbox]').removeAttr('checked');
                    $(table).find('.certificat .cb-icon-check').css('display', 'none');
                    $(table).find('.certificat .cb-icon-check-empty').css('display', 'inline-block');
                }
            });

        function allChecked(table) {
            var coun1 = $(table).find('.certificat input[type=checkbox]').size();
            var coun2 = $(table).find('.certificat input[type=checkbox]:checked').size();
            if (coun1 == coun2) {
                $(table).find('input[type=checkbox].checkAll').attr('checked', 'checked'); //;
                $(table).find('.check-all .cb-icon-check').css('display', 'inline-block');
                $(table).find('.check-all .cb-icon-check-empty').css('display', 'none');
            }
        }

    });

    $(function() {
        $('#findedCertificatesHeader input[type=checkbox].checkAll').click(
            function() {
                var table = $('#findedCertificates');
                if (this.checked) {
                    $(table).find('input[type=checkbox]:not(.checkAll)').each(
                        function() {
                            $(this).closest('tr').addClass('selected');
                            $(this).attr('checked', 'checked');
                            $(this).closest('tr').find('.cb-icon-check').css('display', 'inline-block');
                            $(this).closest('tr').find('.cb-icon-check-empty').css('display', 'none');
                        }
                    );
                } else {
                    $(table).find('input[type=checkbox]:not(.checkAll)').each(
                        function() {
                            $(this).closest('tr').removeClass('selected');
                            $(this).removeAttr('checked');
                            $(this).closest('tr').find('.cb-icon-check').css('display', 'none');
                            $(this).closest('tr').find('.cb-icon-check-empty').css('display', 'inline-block');
                        }
                    );
                }
            });
    });

    $(function() {
        $('.contactpage .certificats-list input[type=checkbox]').click(
            function() {
                var str = $(this).closest('.certificat');
                if (this.checked) {
                    $(str).addClass('selected');
                } else {
                    $(str).removeClass('selected');
                }
            });
    });

    $('.encrypt-info > div').bind('mouseleave', function() { $(this).hide(); });

    $(".template-list .template .title a").hover(
        function() {
            var obj = $(this).data('obj');
            var top = $(this).offset().top;
            $('.encrypt-info').find('div').hide;
            var popup = $('.encrypt-info').find('div[data-object=' + obj + ']');
            $(popup).show().css('top', top - 190);
        }, function(e) {
            e = e || event;
            var obj = $(this).data('obj');
            var popup = $('.encrypt-info').find('div[data-object=' + obj + ']');
            if ($(e.relatedTarget).closest('.encrypt-info').length === 0) {
                $(popup).hide();
            }
        }
    );

    $(".users-list > .user .info[data-toggle=popup2]").hover(
        function() {
            var obj = $(this).data('obj');
            var top = $(this).offset().top;
            $('.encrypt-info').find('div').hide;
            var popup = $('.encrypt-info').find('div[data-object=' + obj + ']');
            $(popup).show().css('top', top - 225);
        }, function(e) {
            e = e || event;
            var obj = $(this).data('obj');
            var popup = $('.encrypt-info').find('div[data-object=' + obj + ']');
            if ($(e.relatedTarget).closest('.encrypt-info').length === 0)
                $(popup).hide();
        }
    );

    $("i[data-toggle=tooltip]").hover(
        function() { $(this).siblings('.tooltip').show(); },
        function(e) { $(this).siblings('.tooltip').hide(); }
    );

    $("a[data-toggle=tooltip]").hover(
        function() { $(this).siblings('.tooltip').show(); },
        function(e) { $(this).siblings('.tooltip').hide(); }
    );

    $('#navigation .nav-arrow').click(function() {
        $(this).siblings('ul').toggle();
        return false;
    });

    $('#error_wrapper .expand a').click(function() {
        var el = $(this).parent().siblings('.info-full');
        if ($(el).css('display') == 'none') {
            $(el).show();
            $(this).html('Свернуть');
        } else {
            $(el).hide();
            $(this).html('Подробнее');
        }
        return false;
    });

    $('.certificats-list input[type=text]').keyup(function(e) {
        if (e.which == 13) {
            $(this).closest('.new-title').find('a.action').html('Изменить').addClass('saved');
            $(this).attr('disabled', 'disabled');
        }
    });
    $('.certificats-list a.action').click(function(e) {
        if ($(this).hasClass('saved')) {
            $(this).html('Сохранить');
            $(this).closest('.new-title').find('input[type=text]').removeAttr('disabled').focus();
        } else {
            $(this).html('Изменить');
            $(this).closest('.new-title').find('input[type=text]').attr('disabled', 'disabled');
        }
        $(this).toggleClass('saved');
        return false;

    });

});