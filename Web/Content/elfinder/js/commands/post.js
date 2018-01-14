"use strict";
elFinder.prototype.commands.post = function() {

    this.getstate = function() {
        return 0;
    };
    this.exec = function(path, data) {
        var fm = this.fm,
            method = 'post',
            form = $('<form/>').attr("method", method).attr("action", path),
            addHidden = function(name, value) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", name);
                hiddenField.setAttribute("value", value);
                form.append(hiddenField);
            },
            constructElements = function(item, parentString) {
                if (typeof (item) == 'object') {
                    for (var key in item) {
                        if (item.hasOwnProperty(key) && item[key] != null) {
                            if (Object.prototype.toString.call(item[key]) === '[object Array]') {
                                for (var i = 0; i < item[key].length; i++) {
                                    constructElements(item[key][i], parentString + key + "[" + i + "]");
                                }
                            } else if (Object.prototype.toString.call(item[key]) === '[object Object]') {
                                constructElements(item[key], parentString + key + ".");
                            } else {
                                addHidden(parentString + key, item[key]);
                            }
                        }
                    }
                } else {
                    addHidden(parentString, item);
                }
            };
        if (data.Files) data.Files = JSON.stringify(data.Files);
        constructElements(data, "");

        $(document.body).append(form);
        $(form).submit();
    };
};