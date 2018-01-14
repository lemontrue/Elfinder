var Template = can.Construct.extend('Core.Templates.Template', {
    init: function (scope, id, name) {
        this.ID = id || 0;

        this.Name = name;

        this.Settings = new can.Map({
            raw: null,
            signature: {
                detached: '',
                zipType: '',
                encodingType: ''
            },
            encryption: {
                zipType: '',
                encodingType: ''
            }
        });

        this.Certificate = new can.Map({
            signature: new can.Map.List([]),
            encryption: new can.Map.List([]),
            personal: new can.Map.List([])
        });

        this.Detail = new can.compute(false);

        this.scope = scope;

        __loadTemplate = false;

        this.looadID = null;
    },

    /**
     * Получение полной информации о шаблоне
     * включая информацию о подключенных сертификатов.
     */
    getDetails: function () {

        clearList(this.Certificate.signature);
        clearList(this.Certificate.encryption);
        clearList(this.Certificate.personal);

        this.__getSettings();

        /**
         * Ждём когда применятся все настройки,
         * в том числе и сертификаты.
         */
        setTimeout(delegate(this.__getCertificate, this), 1000);

        if (this.scope.isLoaded && this.ID !== '00000000-0000-0000-0000-00000000000')
            this.scope.req.begin('set_template_as_default', {templateId: this.ID});

        //this.Detail(true);
    },

    /**
     * Получение настроек профиля
     * @private
     */
    __getSettings: function () {

        if (this.ID === '00000000-0000-0000-0000-000000000000') {

            this.__runConfig(this.scope.pool.settings.load.templates.default);
            return;
        }

        this.scope.req.begin('user_profile', {profileId: this.ID}, function (req) {
            if (req.status === 'error') {
                new Logger(['При загрузке настроек профиля "%name" возникли проблемы', {
                    '%name': this.Name
                }], 'error', req);
                return false;
            }

            this.__runConfig(req.data);
        }, this);
    },

    __runConfig: function (conf) {
        this.Settings.attr('raw', conf);

        var _signature = conf._SignatureSettings;
        var _encryption = conf._EncryptionSettings;

        if (_signature === undefined) {
            new Logger(['Возникла ошибка при получении настроек для подписи, шаблона "%name"', {
                '%name': this.Name
            }], 'error');
        }

        if (_encryption === undefined) {
            new Logger(['Возникла ошибка при получении настроек для шифрования, шаблона "%name"', {
                '%name': this.Name
            }], 'error');
        }

        this.Settings.signature.attr('detached', _signature.Detached ? false : true);
        this.Settings.signature.attr('zipType', _signature.ZipType);
        this.Settings.signature.attr('encodingType', _signature._EncodingType);

        this.Settings.encryption.attr('zipType', _encryption.ZipType);
        this.Settings.encryption.attr('encodingType', _encryption._EncodingType);

        if (_signature.SignerCertificate1 !== null) {
            this.Certificate.signature.push({
                hash: _signature.SignerCertificate1,
                data: null
            });
        }

        if (_encryption.RecipientCertificates1 !== null && _encryption.RecipientCertificates1.length > 0) {
            can.each(_encryption.RecipientCertificates1, delegate(function (hash) {
                this.Certificate.encryption.push({
                    hash: hash,
                    data: null
                });
            }, this));
        }
    },

    /**
     * Получение сертификатов профиля
     * @private
     */
    __getCertificate: function () {
        var __complite_s = false,
            __complite_e = false,
            checkComplite = delegate(function () {
                if (__complite_e === true && __complite_s === true) {
                    setTimeout(delegate(function () {
                        can.trigger(window, 'process_exit', [this.scope.pool.keys.attr('profile_load_id')]);
                    }, this), 2000);
                }
            }, this);

        /**
         * Запрашиваем детальную информацию по сертификату подписи.
         */
        if (JSON.stringify(this.Certificate.signature.serialize()).length > 2) {

            var hash = [];
            this.Certificate.signature.each(delegate(function (item, index, obj) {
                hash.push(item.hash);
            }, this));

            this.scope.req.begin('certificate_info', {
                thumbprints: hash
            }, function (sReq) {
                if (sReq.status === 'error') {
                    new Logger('Произошла ошибка при получении сертификата подписи', 'error', sReq);
                    return false;
                }

                new Logger('Сертификат для подписи успешно зашружены');

                can.each(sReq.data.certificates, delegate(function (obj, index) {
                    this.__searchCertificate(obj.Thumbprint, 'signature', delegate(function (item) {
                        item.attr('data', obj);
                    }, this));
                }, this));

                __complite_s = true;
                checkComplite();
            }, this);
        } else {
            __complite_s = true;
            checkComplite();
        }

        /**
         * Запрашиаем детальную информацию по сертификатам шифрования.
         */
        if (JSON.stringify(this.Certificate.encryption.serialize()).length > 2) {

            var hash = [];
            this.Certificate.encryption.each(delegate(function (item, index) {
                hash.push(item.hash);
            }, this));

            this.scope.req.begin('certificate_info', {
                thumbprints: hash
            }, function (sReq) {
                if (sReq.status === 'error') {
                    new Logger('Произошла ошибка при получении сертификатов шифрования', 'error', sReq);
                    return false;
                }

                new Logger('Сертификат для шифрования успешно зашружены');

                can.each(sReq.data.certificates, delegate(function (obj, index) {
                    this.__searchCertificate(obj.Thumbprint, 'encryption', delegate(function (item) {
                        if (obj.MyCertificate !== null) {

                            var index = listObjSearch(this.Certificate.encryption, 'hash', obj.Thumbprint);
                            if (index === undefined)
                                return;

                            this.Certificate.encryption.splice(index);
                            return;
                        }

                        item.attr('data', obj);
                    }, this));

                    if (obj.MyCertificate !== null) {
                        new Logger('Найден личный сертификат шифрования', undefined, obj);

                        this.Certificate.personal.push(obj);
                    }

                }, this));


                __complite_e = true;
                checkComplite();

                /**
                 * Устанавливаем флаг о получения
                 * детальной информации.
                 */
                this.Detail(true);
            }, this);
        } else {
            __complite_e = true;
            checkComplite();
            this.Detail(true);
        }
    },

    __searchCertificate: function (hash, type, call) {
        type = type || 'signature';

        var store = this.Certificate[type],
            item = null;

        can.each(store, delegate(function (obj, index) {
            if (obj.hash === hash) {
                item = store[index];
            }
        }, this));

        if (item !== null) {
            call.apply(this, [item]);
        }
    }
});