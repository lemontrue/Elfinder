"use strict";
/**
 * @class  elFinder toolbar's button tor upload file
 *
 * @author Dmitry (dio) Levashov
 **/
$.fn.elfinderuploadbutton = function(cmd, islink,text) {
    return this.each(function () {
        var button;
        console.log(1);
        if (islink) button = $(this).elfinderlinkbutton(cmd,null,text).unbind('click');
        else button = $(this).elfinderbutton(cmd).unbind('click');

        var form = $('<form/>').appendTo(button),
			input = $('<input type="file" multiple="true"/>')
				.change(function() {
					var _input = $(this);
					if (_input.val()) {
						cmd.exec({input : _input.remove()[0]});
						input.clone(true).appendTo(form);
					}
				});

		form.append(input.clone(true));

		cmd.change(function() {
			form[cmd.disabled() ? 'hide' : 'show']();
		})
		.change();
	});
}
