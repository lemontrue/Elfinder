
$.fn.elfindermultiplyaddbutton = function (cmd) {
	
	return this.each(function() {
	    var fm = cmd.fm,
	        commands = fm._commands,
	        name = cmd.name,
	        c = 'class',
	        disabled = fm.res(c, 'disabled'),
	        hover = fm.res(c, 'hover'),
	        item = 'elfinder-button-menu-item',
	        includedCommands = ['upload', 'mkdir', 'paste'],

            button = $(this).addClass('elfinder-buttonset btn btn-big btn-green')
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
	                        $(this).removeClass(hover);
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
            //icon = $(this).append('<span class="caret"></span>'),
	        menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
	            .hide()
	            .appendTo(button)
	            .zIndex(12 + button.zIndex())
	            .delegate('.' + item, 'hover', function() {
	                !$(this).is('.' + disabled) && $(this).toggleClass(hover);
	            })
	            .delegate('.' + item, 'click', function(e) {
	                var t = $(this).attr('rel');
	                if (t!='upload') {
	                    e.preventDefault();
	                    e.stopPropagation();

	                } else {
                        e.preventDefault();
                        e.stopPropagation();
                        $('.js-upload').click();
                    }
                    hide();
                    return false;
	            }),
	        
	        hide = function() { menu.hide(); },

            clearMenu = function () {
                menu.text("");
            },

            initMenu = function () {
                $.each(includedCommands, function (name, value) {
                    if (value == 'upload') {
                        var com;
                        if ((com = commands[value])) {
                            var form = $('<form/>'),
                                input = $('<input type="file" multiple="true" style="" class="js-upload" />')
				                    .change(function () {
				                        var _input = $(this);
				                        if (_input.val()) {
				                            com.exec({ input: _input.remove()[0] });
				                            input.clone(true).appendTo(form);
				                        }
				                    }).click(function(){menu.hide();}),
                                but = $('<div class="' + item + '" rel="' + value + '"><span class="elfinder-button-icon elfinder-button-icon-'
                                + value + '"/><span class="ui-icon ui-icon-arrowthick-1-s"/>' + fm.i18n('add' + value) + '</div>');
                            form.append(input.clone(true));
                            menu.append(but).parent().append(form);
                            com.change(function () {
                                form[com.disabled() ? 'hide' : 'show']();
                            })
		                    .change();

                        }
                    } else {
                        menu.append($('<div class="' + item + '" rel="' + value + '"><span class="elfinder-button-icon elfinder-button-icon-'
                            + value + '"/><span class="ui-icon ui-icon-arrowthick-1-s"/>' + fm.i18n('add' + value) + '</div>')
                            .click(function(e) {
                                var t = $(this).attr('rel');
                                !$(this).is('.' + disabled) && cmd.exec(t);
                            }));
                    }
                });
            },

            addCommand = function (comName) {
                includedCommands.push(comName);
                clearMenu();
                initMenu();
            };

	    initMenu();
	    fm.bind('disable select', hide).getUI().click(hide);

	    if (menu.children().length > 1) {
	        cmd.change(function () {
	            button.toggleClass(disabled, cmd.disabled());
	        }).change();

	    } else {
	        button.addClass(disabled);
	    }
	});
	
}


