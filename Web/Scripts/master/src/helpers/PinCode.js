/**
 * Created by Александр on 11.06.14.
 *
 * Класс запроса пин-кода
 */
var PinCode = can.Construct('helpers.PinCode', {
    /**
     * Конструктор запроса пин-кода
     * @param thumbprint Отпечаток сертификата
     * @param function callFn Ф. обратного вызова (3 параметра)
     * (нужен ли пин, пин-код, сохранить или нет)
     * @param object options Опции
     */
    init: function(thumbprint, callFn, options) {
        options = options || {};

        /**
         *
         * @type {*|Function}
         */
        this.callFn = callFn || function(){};
        /**
         *
         * @type {*|string}
         */
        this.thumbprint = thumbprint || '';
        this.__modalWindow = null;

        this.options = {
            pinError: options['pinError'] === true
        };

        if(this.options.pinError) {
            this.getPin('Неверный пин');
            return;
        }

        this.needToPin(delegate(function(need){
            if(need) {
                this.getPin();
            } else {
                this.__return(false, null, undefined);
            }
        }, this));
    },

    /**
     * Нужен ли пин-код
     * @param function call
     */
    needToPin: function(call) {
        if(!this.__hasToPool()) {
            Master.req.begin('get_pin', {
                thumbprint: this.thumbprint
            }, function (data) {
                var state = data.data.NeedToPIN === true;

                Master.pool.needToPin.attr(this.thumbprint, state);
                call.apply(this, [state]);
            });
        } else {
            call.apply(this, [true]);
        }
    },

    /**
     * Вывод модального окна для ввода пин-кода
     * @param errorMessage Сообщение об ошибке
     */
    getPin: function(errorMessage) {
        this.__modalWindow = this.__showModal(delegate(function(pin, save){
            this.__return(true, pin, save);
        }, this));

        if(errorMessage !== undefined) {
            this.__modalWindow.error(errorMessage);
        }
    },

    /**
     * Вызов обратной ф-ции вызова.
     * @param boolean need Нужен ли пин
     * @param string pin Пин-код
     * @param boolean save Нужно ли сохранять
     * @private
     */
    __return: function(need, pin, save) {
        this.callFn.apply(this, [need, pin, save]);
    },

    /**
     * Поиск сохранённого значения в пуле
     * @returns {boolean}
     * @private
     */
    __hasToPool: function() {
        var _need = Master.pool.needToPin.attr(this.thumbprint);

        if(_need === undefined || _need === false)
            return false
        else
            return true;
    },

    __showModal: function(call, scope, params) {
        call = call || function(){};
        params = params || {};

        var pin = new can.compute(''),
            save = new can.compute(false),
            error = new can.compute(params['error'] || '');

        try {
            if(Master.debug) {
                pin('11111111');
            }

            var modal = {},body = can.view.render('/Scripts/master/view/modals/pin.hbs', {
                pin: pin,
                btns: [
                    {
                        text: 'Отмена',
                        call: delegate(function(){
                            modal.remove();
                        }, this)
                    },
                    {
                        text: 'Продолжить',
                        cls: 'btn-green',
                        call: delegate(function(){
                            if(pin().length === 0) {
                                error('Введен пустой пин!');
                                return;
                            }

                            error('');

                            call.apply(scope, [pin(), save()]);
                            modal.remove();
                        }, this)
                    }
                ],
                save: save,
                error: error
            });

            modal = Master.layout.modal('Ввод пин-кода', {
                type: 'text',
                body: body
            }, 'alert');
        } catch (e) {
            alertError('Неожиданная ошибка произошла при установке пин-кода. "%message"', e);
        }

        return {
            exit: function() {
                modal.remove();
            },
            error: function(message) {
                if(message === undefined)
                    return error();
                else
                    return error(message);
            }
        };
    }
});