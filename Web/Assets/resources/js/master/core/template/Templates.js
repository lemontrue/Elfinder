/**
 * Created by Александр on 24.03.14.
 */

var Templates = can.Construct.extend('Core.Templates', {

    init: function (scope) {
        this.scope = scope;

        this.items = new can.Map.List([]);
        this.current = can.compute(null);
    },

    load: function () {
        try {

            var cur = null,
                all = this.scope.pool.settings.load.templates.all;

            all.sort(function (a, b) {
                if (a.Name[0].charCodeAt() > b.Name[0].charCodeAt())
                    return 1

                if (a.Name[0].charCodeAt() < b.Name[0].charCodeAt())
                    return -1

                return 0;
            });

            can.each(all, delegate(function (template, key) {
                this.items.push(new Template(this.scope, template.ID, template.Name));

                if (template.IsDefault === true) {
                    cur = template;
                    this.changeCurrent(template.ID);
                }
            }, this));

            if (cur !== null) {
                return;
            }

            if (all.length > 1 && cur === null) {

                this.changeCurrent(all[0].ID);
                return;
            }

            if (all.length === 1 || (cur === null && all.length !== 0)) {
                this.changeCurrent(all[0].ID);
            } else {
                this.current({
                    Name: 'Шаблона нет'
                });
            }
        } catch (e) {
            alertError('Неожиданная ошибка произошла при обработке шаблона. "%message"', e);
        }
    },

    search: function (str, type) {
        var type = type || 'id',
            _item = null;

        try {
            this.items.each(delegate(function (item, index) {
                if (type === 'id') {
                    if (item.ID === str) {
                        _item = this.items[index];
                    }

                    return;
                }

                if (type === 'name') {
                    if (item.Name === str) {
                        _item = this.items[index];
                    }

                    return;
                }
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при обработке шаблона. "%message"', e);
        } finally {
            return _item;
        }
    },

    changeCurrent: function (id) {

        var item = this.search(id, 'id');

        if (item === null) {
            new Logger(['Не удалось обнаружить шаблон по ID "%id"', {
                '%id': id
            }], 'error');

            return;
        }
        this.current(item);
        $('.show_template').html(item.Name);
        item.getDetails();

        new Logger(['Шаблон по умолчанию "%name", установлен', {
            '%name': item.Name
        }]);
    }

});