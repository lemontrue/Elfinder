var Logger = function(message, type, data) {
    if (!Master.debug)
        return;

    type = type || 'info',
        data = data || '',
        message = (function(m) {
            var type = Object.prototype.toString.call(m);
            if (type === '[object String]') {
                return m;
            }

            if (type === '[object Array]') {
                var message = m[0];

                can.each(m[1], function(value, key) {
                    message = message.replace(new RegExp(key, 'g'), value);
                });

                return message;
            }
        })(message);

    if (type === 'error') {
        console.error(message, data);
        return;
    }

    if (type === 'info') {
        console.info(message, data);
        return;
    }

    if (type === 'warning') {
        console.warn(message, data);
        return;
    }
};