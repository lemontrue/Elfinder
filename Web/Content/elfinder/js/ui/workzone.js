"use strict";
/**
 * @class elfinderworkzone - elFinder container for nav and current directory
 * @author Dmitry (dio) Levashov
 **/
$.fn.elfinderworkzone = function(fm) {
    var cl = 'elfinder-workzone';

    this.not('.' + cl).each(function() {
        var wz = $(this).addClass(cl),
            wdelta = wz.outerHeight(true) - wz.height(),
            parent = wz.parent();

        parent.add(window).bind('resize', function() {
            var height = parent.height() + 20; // +20px show bottom scrollbar arrow [rail-s]

            parent.children(':visible:not(.' + cl + ')').each(function() {
                var ch = $(this);

                if (ch.css('position') != 'absolute') {
                    height -= ch.outerHeight(true);
                }
            });

            wz.height(height - wdelta);
        });
    });
    return this;
};