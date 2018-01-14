/**
 * Created by Александр on 28.03.14.
 */
var SelectCertificate = can.Construct({
    init: function(type, call, options) {
        /**
         * Тип выбора
         * @type {*}
         */
        this.type = (can.$.inArray(type, ['my', 'all', 'list']) !== -1) ? type : 'my';
        /**
         * Функция вызова с массивом выбранных
         * сертифиатов в качестве параметра.
         * @type {*}
         */
        this.call = (typeof call === 'function') ? call : function() {};

        this.options = options;

        /**
         * Список всех сертификатов
         * @type {exports.List}
         */
        this.certificateList = new can.Map.List();
        /**
         * Список выбранных сертификатов
         * @type {exports.List}
         */
        this.certificateListSelect = new can.Map.List();

        this.checkAll = new can.compute(false);

        this.nothingFound = can.compute(false);

        this.run();
    },

    run: function() {
        try {
            var search = (this.type === 'all') ? delegate(function(value) {
                value = value.toLocaleLowerCase();
                var clean = value === '';
                this.certificateList.each(delegate(function(item) {
                    if (clean === true) {
                        item.attr('show', true);
                        return;
                    }

                    if (item.owner.toLocaleLowerCase().search(value) === -1 && item.organization.toLocaleLowerCase().search(value) === -1) {
                        item.attr('show', false);
                    } else {
                        item.attr('show', true);
                    }
                }, this));

                foundLength = function(certList) {
                    return $.grep(certList, function(n, i) {
                        return n.show === true;
                    }).length;
                };
                if (foundLength(this.certificateList) == 0) {
                    this.nothingFound(true);
                } else {
                    this.nothingFound(false);
                }
            }, this) : undefined;

            if (this.type === 'all') {
                Master.req.begin('find_all_certificate', {
                    searchString: ''
                }, delegate(function(req) {
                    if (req.status === 'error') {
                        new Logger('Возникла ошибка при загрузке пользовательских сертификатов', 'error');
                        return;
                    }

                    can.each(req.data.model, delegate(function(item) {
                        this.addItem(item.SubjectName, item.TimeMessage, item.IssureName, item.Thumbprint, item);
                    }, this));

                    this.modal.loading(false);
                }, this));
            }

            if (this.type === 'my') {
                can.each(Master.pool.allMyCertificate, delegate(function(item) {
                    this.addItem(item.SubjectName, item.TimeMessage, item.IssureName, item.Thumbprint, item);
                }, this));
            }

            if (this.type === 'list') {
                console.log('Изменить привязку!!!');

                this.options.cert.bind('change', delegate(function(ev, attr, type, newVal, oldVal) {

                }, this));

                can.each(this.options.cert, delegate(function(item) {
                    this.addItem(item.SubjectName, format('до %time', {
                        '%time': moment(parseInt(item.NotAfter.match('[0-9]+')[0])).calendar()
                    }), item.Organization, item.Thumbprint, item);
                }, this));
            }

            this.modal = Master.layout.modal(
                'Выберите сертификат' + ((this.type === 'all') ? 'ы' : '') + ' для добавления.',
                {
                    type: 'path',
                    path: 'find_certificate.hbs',
                    params: {
                        modMy: this.type === 'my',
                        modAll: this.type === 'all',
                        checkAll: this.checkAll,
                        event: {
                            exit: delegate(function() {
                                this.modal.remove();
                            }, this),
                            select: delegate(function(scope, el, ev) {
                                if (ev.target.tagName !== 'TD')
                                    return;

                                if (can.$.inArray(this.type, ['my', 'list']) !== -1 && this.certificateListSelect[0] !== undefined) {
                                    var cert = this.certificateListSelect[0];
                                    var _itemIndex = listObjSearch(this.certificateList, 'ID', cert.ID);
                                    this.certificateListSelect.splice(0, 1);

                                    this.itemSelect(this.certificateList[_itemIndex], false);
                                } else {
                                    var _item = listObjSearch(this.certificateListSelect, 'ID', scope.ID);

                                    if (_item !== null && _item >= 0) {
                                        this.itemSelect(scope, false);

                                        return;
                                    }
                                }

                                this.itemSelect(scope, true);
                            }, this),
                            add: delegate(this.add, this),
                            dblclick: delegate(this.dblclick, this),
                            certCheck: delegate(this.certCheck, this),
                            notclick: delegate(function(scope, el, ev) {
                                if (can.$.inArray(this.type, ['my', 'list']) !== -1) {
                                    this.itemSelect(scope, false);
                                } else {
                                    var _item = listObjSearch(this.certificateListSelect, 'ID', scope.ID);

                                    if (_item !== null && _item >= 0) {
                                        this.itemSelect(scope, false);

                                        return;
                                    }
                                }

                                this.itemSelect(scope, true);
                            }, this),
                            sort: {
                                owner: delegate(function(scope, el, ev) {
                                    this.certificateList.comparator = 'owner';
                                    this.certificateList.sort();
                                    /*this.certificateList.sort(function(a, b) {
                                        var ca = a.owner[0].charCodeAt(),
                                            cb = b.owner[0].charCodeAt();

                                        if(ca < cb) {
                                            return -1;
                                        }

                                        if(ca > cb) {
                                            return 1;
                                        }

                                        return 0;
                                    });*/
                                }, this),
                                validity: delegate(function(scope, el, ev) {
                                    this.certificateList.sort(function(a, b) {
                                        var ca = a.validity[0].charCodeAt(),
                                            cb = b.validity[0].charCodeAt();

                                        if (ca < cb) {
                                            return -1;
                                        }

                                        if (ca > cb) {
                                            return 1;
                                        }

                                        return 0;
                                    });
                                }, this),
                                organization: delegate(function(scope, el, ev) {
                                    this.certificateList.sort(function(a, b) {
                                        var ca = a.organization[0].charCodeAt(),
                                            cb = b.organization[0].charCodeAt();

                                        if (ca < cb) {
                                            return -1;
                                        }

                                        if (ca > cb) {
                                            return 1;
                                        }

                                        return 0;
                                    });
                                }, this)
                            }
                        },

                        certificate: this.certificateList,
                        cls: this.certificateListSelect,
                        nothingFound: this.nothingFound
                    }
                },
                undefined,
                search
            );

            this.checkAll.bind('change', delegate(function(ev, newVal, oldVal) {
                this.certificateList.each(delegate(function(cert) {
                    this.itemSelect(cert, newVal);
                }, this));
            }, this));

        } catch (e) {
            alertError('Неожиданная ошибка произошла при открытии диалогового окна выбора сертификата. "%message"', e);
        } finally {
            if (this.type === 'all') {
                this.modal.loading('Загрузка списка сертификатов...');
            }
        }
    },

    /**
     *
     * @param owner
     * @param validity
     * @param organization
     * @returns {*}
     */
    addItem: function(owner, validity, organization, thumbprint, data) {
        var id = guid();

        this.certificateList.push({
            ID: id,
            owner: owner,
            validity: validity,
            organization: organization,
            thumbprint: thumbprint,
            data: data,
            check: false,
            show: true
        });

        return id;
    },

    itemSelect: function(item, selected) {
        if (selected === true) {
            item.attr('check', true);

            this.certificateListSelect.push(item);
        } else {
            item.attr('check', false);
            var _item = listObjSearch(this.certificateListSelect, 'ID', item.ID);
            this.certificateListSelect.splice(_item, 1);
        }
    },

    dblclick: function() {
        if (can.$.inArray(this.type, ['my', 'list']) !== -1) {
            this.add();
        }
    },

    add: function() {
        var val = new can.Map.List([]);

        this.certificateListSelect.each(delegate(function(item) {
            val.push(item.data);
        }, this));

        this.call.apply(null, [val]);
        this.modal.remove();
    },

    certCheck: function() {
        console.log('certCheck', arguments);
    }
});