"use strict";
/**
 * @class  elFinder toolbar
 *
 * @author Dmitry (dio) Levashov
 **/
$.fn.elfindertoolbar = function(fm, opts) {
    this.each(function() {
        var commands = fm._commands,
            self,
            panels = opts || [],
            l = panels.length,
            i,
            cmd,
            panel,
            button,
            firstB = "ui-elfinder-button-first";

        $(this).css('height', '50px');

        if (!$(this).is('.elfinder-toolbar')) {
            self = $(this).addClass('ui-helper-clearfix ui-widget-header ui-corner-top elfinder-toolbar');
            self.prev().length && self.parent().prepend(this);
        } else {
            self = $(this);
        }

        self.empty();
        while (l--) {
            if (panels[l]) {
                panel = $('<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>');
                i = panels[l].length;
                while (i--) {
                    if ((cmd = commands[panels[l][i]])) {
                        button = 'elfinder' + cmd.options.ui;
                        if (panels[l - 1] == 'multiplyadd') button = 'elfinder' + 'bluebutton';
                        $.fn[button] && panel.prepend($('<div/>')[button](cmd));
                    }
                }
                if (panels[l] != 'more') $(panel).find(".elfinder-button-icon").css('padding-left', '5px');
                if (panels[l] == 'multiplyadd') panel.addClass(firstB);
                if (panels[l] == 'decryptandchecksign') panel.find('div:first').css('width', '155px');
                panel.children().length && self.prepend(panel);
                panel.children(':gt(0)').before('<span class="ui-widget-content elfinder-toolbar-button-separator"/>');
            }
        }

        self.children().length && self.show();
    });

    this.selectFile = function() {
        var showingButtons = [['multiplyadd'], ['paste'], ['copy'], ['paste'], ['rm'], ['rename']];
        var dir = false;
        for (var i = 0; i < fm.selectedFiles().length; i++) {
            var file = fm.selectedFiles()[i];
            if (file.mime == "directory") {
                dir = true;
                break;
            }
        }
        if (dir) {
            $(this)['elfindertoolbar'](fm, showingButtons);
        } else {
            $(this)['elfindertoolbar'](fm, fm.options.uiOptions.toolbar);
        }
    };
    this.openFolder = function() {
        var hover = fm.res('class', 'hover'),
            item = 'elfinder-button-menu-item',
            menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
                .hide()
                .delegate('.' + item, 'hover', function() { $(this).toggleClass(hover); })
                .delegate('.' + item, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    hide();
                }),
            dot = $('<a>...</a>')
                .click(function(e) {
                    e.stopPropagation();
                    menu.slideToggle(100);
                }),

            hide = function() { menu.hide(); },

            addItem = function(a) {
                var href = $(a).attr('href').substr(1);
                var text = $(a).text();
                menu.append(
                    $('<div class="' + item + '" rel="' + href + '">' +
                        '<span class="elfinder-button-icon elfinder-button-icon-directory"/>' + text + '</div>')
                    .click(function(e) {
                        if ($(this).attr('rel')) {
                            var hash = $(this).attr('rel');

                            e.preventDefault();
                            hash != fm.cwd().hash && fm.exec('open', hash);
                        }
                    })
                );

            };

        if (fm.selectedFiles().length != 0) {
            this.selectFile();
        } else {

            var path = $('<div class="ui-elfinder-toolbar-path"/>').html('&nbsp;')
                .delegate('a', 'click', function(e) {
                    if ($(this).attr('href')) {
                        var hash = $(this).attr('href').substr(1);

                        e.preventDefault();
                        hash != fm.cwd().hash && fm.exec('open', hash);
                    }
                });

            var dirs = [];
            //console.log(fm.cwd().hash)
            $.each(fm.parents(fm.cwd().hash), function(i, hash) {

                var name = fm.file(hash).name;
                if (name && name.length > 20) name = name.substring(0, 19) + "...";

                dirs.push('<a href="#' + hash + '">' + name + '</a>');
            });

            if (dirs.length >= 4) {
                menu.empty();
                menu.zIndex(12 + path.zIndex());
                path.prepend(menu);
                //for (var i = dirs.length - 2; i >= 1; i--) {
                //    var dir = dirs[i];
                //    addItem(dir);
                //}
                for (var i = 1; i <= dirs.length - 2; i++) {
                    var dir = dirs[i];
                    addItem(dir);
                }
                path.prepend($(dirs[dirs.length - 1]).addClass('last'));
                path.prepend('>');
                path.prepend(dot);
                path.prepend('>');
                path.prepend(dirs[0]);

                fm.bind('disable select', hide).getUI().click(hide);
            } else {
                path.html(dirs.join(' > '));
                path.find('a:last').addClass('last');
            }

            $(this).empty();
            var showingButtons = [['multiplyadd'], ['paste'], ['filter']];
            $(this)['elfindertoolbar'](fm, showingButtons);

            $(this).append(path);
        }
    };

    return this;
};