"use strict";
elFinder.prototype.commands.more = function() {
    this.options = { ui: 'morebutton' };

    this.getstate = function() {
        var sel = this.fm.selectedFiles();

        return sel.length >= 1 ? 0 : -1;
    };
    this.exec = function(commandName) {
        var fm = this.fm,
            com,
            c = 'class',
            disabled = fm.res(c, 'disabled'),
            commands = fm._commands;

        if ((com = commands[commandName])) {
            if (!$(this).is('.' + disabled)) {
                com.exec();
            }
        }
        return $.Deferred().resolve();
    };
};