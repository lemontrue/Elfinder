/**
 * Created by Александр on 25.03.14.
 */

/**
 * Правильный вывод индекса
 */
can.stache.registerHelper('actionIndex', function(index) {
    return index() + 1;
});

can.stache.registerHelper('upload_file_attached_reg', function(id) {
    can.trigger(window, 'upload_file_attached_reg', [id]);
});

can.stache.registerHelper('text_trim', function(text, length, postfix) {
    var str = text(),
        _postfix = postfix || '',
        _length = length || 0;

    if (text().length > _length) {
        str = str.substr(0, _length) + _postfix;
    }

    return str;
});

can.stache.registerHelper('regUploadEncSer', function() {
    setTimeout(delegate(function() {
        can.trigger(window, 'reg_upload_enc_ser', []);
    }, this), 200);
});

can.stache.registerHelper('process_count_format', function(count) {
    return format('%count %title', {
        '%count': count(),
        '%title': declOfNum(count(), ['процесс', 'процесса', 'процессов'])
    });
});

can.stache.registerHelper('aligningText', function(text, ln) {
    return aligningText(text(), ln);
});

can.stache.registerHelper('debug', function(options) {
    if (Master.debug) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

can.stache.registerHelper('append', function(val) {

    return function(el) {
        $(el).append(val);
    };
});

can.stache.registerHelper('removeToClick', function(call) {
    call = typeof call !== 'function' ? function() {} : call;

    return function(el) {
        $(el).click(delegate(function() {
            $(el).remove();
            call.apply(this, []);
        }, this));
    };
});