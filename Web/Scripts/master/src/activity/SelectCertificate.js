/**
 * Created by Александр on 28.03.14.
 */
var SelectCertificate = can.Construct({
    init: function(type, call) {
        /**
         * Тип выбора
         * @type {*}
         */
        this.type = (can.$.inArray(type, ['my', 'all']) !== -1) ? type : 'my';
        /**
         * Функция вызова с массивом выбранных
         * сертифиатов в качестве параметра.
         * @type {*}
         */
        this.call = (typeof call === 'function') ? call : function() {};

        /**
         * Список всех сертификатов
         * @type {exports.List}
         */
        this.certificateList = new can.Map.List([]);
        /**
         * Список выбранных сертификатов
         * @type {exports.List}
         */
        this.certificateListSelect = new can.Map.List([]);

        this.run();
    },

    run: function() {
        var search = (this.type === 'all') ? delegate(function(value) {
            value.bind('change', delegate(function(ev, newVal, oldVal) {
                if (newVal.length >= 5) {
                    Master.req.begin('find_all_certificate', {
                        searchString: newVal
                    }, delegate(function(req) {
                        if (req.status === 'error') {
                            new Logger('Возникла ошибка при загрузке пользовательских сертификатов', 'error');
                            return;
                        }

                        listCopy(req.data.model, clearList(this.certificateList));

                    }, this));
                } else {
                    new Logger('Введено меньше 5 символов!', 'error');
                }
            }, this));
        }, this) : undefined;

        if (this.type === 'my') {
            listCopy(Master.pool.allMyCertificate, this.certificateList);
        }

        this.modal = Master.layout.modal(
            'Выберте сертификат' + ((this.type === 'all') ? 'ы' : '') + ' для добавления',
            {
                type: 'path',
                path: 'find_certificate.hbs',
                params: {
                    modMy: this.type === 'my',
                    modAll: this.type === 'all',
                    event: {
                        exit: delegate(function() {
                            this.modal.remove();
                        }, this),
                        select: delegate(function(scope, el, ev) {
                            if (this.type === 'my') {
                                if (this.certificateListSelect.length > 0) {
                                    this.certificateListSelect[0].el.removeClass('active');
                                    this.certificateListSelect.splice(0, 1);
                                }

                            } else {
                                var _objIndex = listObjSearch(this.certificateListSelect, 'certificate.Thumbprint', scope.Thumbprint);

                                if (_objIndex !== null && _objIndex >= 0) {
                                    var obj = this.certificateListSelect[_objIndex];
                                    obj.el.removeClass('active');
                                    this.certificateListSelect.splice(_objIndex, 1);
                                    return;
                                }
                            }

                            this.certificateListSelect.push({
                                el: el,
                                certificate: scope
                            });

                            el.addClass('active');
                        }, this),
                        add: delegate(function() {
                            var val = new can.Map.List([]);

                            this.certificateListSelect.each(delegate(function(item) {
                                val.push(item.certificate);
                            }, this));

                            this.call.apply(null, [val]);
                            this.modal.remove();
                        }, this)
                    },

                    certificate: this.certificateList,
                    cls: this.certificateListSelect
                }
            },
            undefined,
            search
        );
    }
});