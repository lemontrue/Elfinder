"use strict";
elFinder.prototype.commands.multiplyadd = function() {
    this.options = { ui: 'multiplyaddbutton' };

    this.getstate = function() {
        return 0;
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