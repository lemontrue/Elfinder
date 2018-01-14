var delegate = function (fn, scope, args) {
    if (!can.isFunction(fn))
        return false;

    return function () {
        return fn.apply(scope || this, args || arguments);
    };
};


can.stache.registerHelper('focusEl', function () {
    return function (el) {
        setTimeout(function () {
            $(el).focus();
        }, 150);
    };
});

can.stache.registerHelper('inverse', function (type, options) {
    if (type() === false) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

can.Construct('PR', {
    actions: {
        enterEmail: null,
        enterPhone: null,
        enterSMS: null,
        captcha: null
    }
}, {
    init: function (el) {
        this.el = el;
        this.action = new can.compute(null);
        this.captcha = new PR.actions.captcha('div[captcha]', {});

        this.token = null;


        this.activeAction('enterEmail');
    },

    activeAction: function (name) {
        if (this.constructor.actions[name] === undefined)
            return false;

        this.el.html('');

        this.action(new this.constructor.actions[name](this.el, {}));

        return true;
    },

    validateEmail: function (email) {
        var re = /^([A-Za-z0-9]+\.{0,1})+([A-Za-z0-9_-]+\.)*[A-Za-z0-9_-]*[A-Za-z0-9]+@[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{2,6}$/;
        return re.test(email);
    },


    emailExist: function (email) {
        var action;

        action = this.action();


        $.get('/PassRecovery/beginRecovery?email=' + email.replace(/\D+/g,""), delegate(function (resp) {

            if (resp.Error) {
                action.error({
                    message: resp.Message
                });
            } else {
                this.token = resp.Token;

                if (resp.State === 7) {
                    // Письмо отправлено

                    this.showLetterSent();

                    return;
                }

                if (resp.State === 3) {
                    // Ожидаем подтверждения телефона
                    this.activeAction('enterPhone');


                    return;
                }

                if (resp.State === 8) {
                    this.notRecovery();
                    return;
                }

                if (resp.State === 5) {
                    // Ожидаем кода смс

                    this.activeAction('enterSMS');
                    return;
                }
            }
        }, this));
    },

    showLetterSent: function () {
        this.el.html(can.view('/Content/passRecoveryViews/letter_sent.hbs', {
            event: {
                /**
                 * Вернуться к началу ввода почтового адреса
                 */
                start: delegate(function () {
                    this.activeAction('enterEmail');
                }, this)
            }
        }));
    },

    notRecovery: function () {
        this.el.html(can.view('/Content/passRecoveryViews/link_not_active.hbs', {}));
    }
});

PR.actions.enterSMS = can.Control({
    view: '/Content/passRecoveryViews/enter_sms.hbs'
}, {
    init: function (el, options) {
        this.newCodeActive = can.compute(false);
        this.enterCodeActive = can.compute(true);
        this.codeValue = can.compute('');
        this.timer = can.compute(60 * 3);
        this.error = can.compute(false);

        this.count = 0;

        this.render();

        this.interval = setInterval(delegate(function () {
            if (this.timer() === 0)
                return;

            this.timer(this.timer() - 1);

            var timer;

            timer = this.timer();

            if (timer <= 60 * 2 && this.newCodeActive() === false)
                this.newCodeActive(true);

            if (timer > 60 * 2 && this.newCodeActive() === true)
                this.newCodeActive(false);

        }, this), 1000);

        this.codeValue.bind('change', delegate(function (ev, newVal, oldVal) {
            this.error(false);

            if (this.timer() <= 0) {
                this.error({
                    message: 'Срок действия кода истек!'
                });
                this.enterCodeActive(false);
            }
        }, this));
    },

    render: function () {
        this.element.html(can.view(this.constructor.view, {
            newCodeActive: this.newCodeActive,
            enterCodeActive: this.enterCodeActive,
            codeValue: this.codeValue,
            timer: this.timer,
            error: this.error,

            event: {
                cancel: delegate(function (obj, el, ev) {
                    pr.activeAction('enterEmail');
                }, this),
                newCode: delegate(function (obj, el, ev) {
                    this.newCode();

                    this.enterCodeActive(true);
                }, this),
                enter: delegate(function (obj, el, ev) {
                    this.checkCode(this.codeValue());
                }, this)
            }
        }, {
            parseTime: delegate(function (_time) {
                _time = _time();

                var sec_num, hours, minutes, seconds, time;

                sec_num = parseInt(_time, 10);
                hours = Math.floor(sec_num / 3600);
                minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                time = minutes + ':' + seconds;

                return time;
            }, this)
        }));
    },

    newCode: function () {
        /*if(this.count >= 5) {
         this.error({
         message: 'Превышено максимальное количество попыток. Пройдите процедуру восстановления пароля с начала'
         });
         return;
         }*/

        this.error(false);

        $.get('/PassRecovery/resentSMS?guid=' + pr.token, delegate(function (resp) {
            if (resp.Error === true) {
                this.error({
                    message: resp.Message
                });

                if (resp.Code === 1) {
                    this.newCodeActive(false);
                    this.enterCodeActive(false);

                    this.timer(0);
                }
            }

            if (resp.State === 6) {
                this.error({
                    message: 'Превышено максимальное количество попыток. Пройдите процедуру восстановления пароля с начала'
                });

                this.newCodeActive(false);
                this.enterCodeActive(false);

                this.timer(0);

                return;
            }

        }, this));

        this.timer(60 * 3);

        this.count++;
    },

    checkCode: function (code) {
        this.error(false);

        if (code.length === 0) {
            this.error({
                message: 'Введите код'
            });
            return;
        }

        $.post('/PassRecovery/checkCode', {
            guid: pr.token,
            code: code
        }, delegate(function (resp) {
            if (resp.Error === true) {

                //this.timer(0);
                //this.newCodeActive(true);
                //this.enterCodeActive(false);

                this.codeValue('');

                this.error({
                    message: resp.Message
                });

                return;
            }

            if (resp.State === 50 || resp.State === 9 ) {
                this.showLetterSent();
                return;
            }
        }, this));
    },

    showLetterSent: function () {
        this.element.html(can.view('/Content/passRecoveryViews/letter_sent_sms.hbs', {
            event: {}
        }));
    }
});

PR.actions.enterPhone = can.Control({
    view: '/Content/passRecoveryViews/enter_phone.hbs'
}, {
    init: function (el, options) {
        this.phoneValue = can.compute('');
        this.error = can.compute(false);

        this.count = 0;

        this.render();
    },

    render: function () {
        this.element.html(can.view(this.constructor.view, {
            phoneValue: this.phoneValue,
            error: this.error,

            event: {
                enter: delegate(function (obj, el, ev) {
                    var phoneVal;

                    phoneVal = this.phoneValue();

                    this.error(false);

                    if (this.count <= 0) {
                        this.send(phoneVal);
                    } else {
                        pr.captcha.open(delegate(function (state) {
                            if (!state) {
                                // !!!
                                return;
                            }

                            this.send(phoneVal);
                        }, this));
                    }

                    this.count++;
                }, this),
                cancel: delegate(function () {
                    pr.activeAction('enterEmail');
                }, this)
            }
        }));
    },

    send: function (phoneVal) {
        /**
         * Проверка на введённые цифры
         */

        var $phone = $('.js-phone'),
            $phoneError = $('.js-error-phone');

        $phoneError.hide().html('');

        if ((parseInt(phoneVal) + '').length !== phoneVal.length) {
            $phone.addClass('error');
            $phoneError.html('Неверный номер телефона').show();
            event.preventDefault();
            return;
        } else {

            if ($phone.val().length != 10) {
                $phone.addClass('error');
                $phoneError.html('Введите номер, зарегистрированный в РФ, в международном формате,<br> например +7 1234567890').show();
                event.preventDefault();
                return false;
            }
        }

        $.post('/PassRecovery/existPhone', {
            phone: phoneVal,
            guid: pr.token
        }, delegate(function (resp) {

            if (resp.Error) {
                this.error({
                    message: resp.Message
                });
                return;
            }

            if (resp.State === 7) {
                // Отправлено письмо

                pr.showLetterSent();

                return;
            }

            if (resp.State === 5) {
                // Ожидаем кода смс

                pr.activeAction('enterSMS');
                return;
            }

            if (resp.State === 4) {
                // Не верный телефон

                this.error({
                    message: 'Неверный номер телефона!'
                });

                return;
            }

            if (resp.State === 8) {
                pr.notRecovery();
                return;
            }
        }, this))
    },
    'input[name="phoneValue"] keydown': function (el, event) {

        var phoneVal = this.phoneValue();
        var $phone = $('.js-phone'),
            $phoneError = $('.js-error-phone');

        $phoneError.hide().html('');
        $phone.removeClass('error');

        //Enter
        if (event.keyCode == 13) {
            this.send(phoneVal);
        }

        if (event.shiftKey || event.altKey || event.ctrlKey) {
            event.preventDefault();
            return false;
        }

        // Разрешаем нажатие клавиш backspace, del, tab и esc
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            // Разрешаем выделение: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Разрешаем клавиши навигации: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {

            return;
        }
        else {

            if ($phone.val().length >= 10) {
                $phone.addClass('error');
                $phoneError.html('Введите номер, зарегистрированный в РФ, в международном формате,<br> например +7 1234567890').show();
                event.preventDefault();
                return false;
            }
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                $phone.addClass('error');
                $phoneError.html('Введите номер, зарегистрированный в РФ, в международном формате,<br> например +7 1234567890').show();
                event.preventDefault();
                return false;
            }
        }
    }
});

PR.actions.enterEmail = can.Control({
    view: '/Content/passRecoveryViews/enter_email.hbs'
}, {
    init: function (el, options) {
        this.emailValue = can.compute('');
        this.error = can.compute(false);

        this.render();

        $('.js-phone-mask').mask("+7 (999) 999-99-99");

        this.emailValue.bind('change', delegate(function (ev, newVal, oldVal) {

            this.checkEmail();
        }, this));

    },

    render: function () {
        this.element.append(can.view(this.constructor.view, {
            error: this.error,
            captchaError: this.captchaError,
            emailValue: this.emailValue,

            event: {
                enter: delegate(function (obj, el, ev) {
                    this.captchaOpen();
                }, this)
            }
        }, {

        }));


    },

    checkEmail: function () {
        this.error(false);


        if ($.inArray(this.emailValue(), ['', null, undefined]) !== -1)
            return;

        return true;

        if (pr.validateEmail(this.emailValue())) {
            // Всё верно
            return true;
        } else {
            this.error({
                message: 'Адрес электронной почты введен неверно'
            });

            return false;
        }
    },

    captchaOpen: function () {
        if (!this.checkEmail())
            return;

        pr.captcha.open(delegate(function (state) {
            if (!state) {
                // !!!
                return;
            }
            pr.emailExist(this.emailValue());
        }, this));
    },

    'input[name="emailRecovery"] keyup': function (el, ev) {
        if (ev.keyCode == 13) {
            this.captchaOpen();
        }
    }
});

PR.actions.captcha = can.Control({
    view: '/Content/passRecoveryViews/captcha.hbs'
}, {
    init: function (el, options) {
        this.error = can.compute(false);
        this.codeValue = can.compute('');

        this.call = function () {
        };

        this.element.append(can.view(this.constructor.view, {
            error: this.error,
            codeValue: this.codeValue,

            event: {
                check: delegate(function () {
                    $.get('/PassRecovery/existCaptchaCode?code=' + this.codeValue(), delegate(function (resp) {
                        if (resp.state) {
                            this.error(false);

                            this.hide();
                        } else {
                            this.error(true);
                        }

                        this.call.apply(this, [resp.state === true]);
                    }, this))
                }, this)
            }
        }, {
            setImage: delegate(function () {
                var newImage = function (el) {
                    $.get('/PassRecovery/getImageCAPTCHA', function (resp) {
                        el.attr('src', 'data:image/png;base64,' + resp);
                    });
                };

                return delegate(function (el) {
                    newImage($(el));

                    $(el).click(function () {
                        newImage($(el));
                    });
                }, this);
            }, this)
        }));
    },

    open: function (call) {
        this.call = call || function () { };

        this.newImage();

        this.codeValue('');
        this.error(false);
        $.fancybox($('#captcha'));
        $('#captcha').find('input').focus();

    },

    hide: function () {
        $.fancybox.close();
    },

    newImage: function () {
        var img, codeValEl;

        img = this.element.find('img');
        codeValEl = this.element.find('codeValue');
        // ie cache
        $.ajaxSetup({ cache: false });
        var newImage = function (el) {
            $.get('/PassRecovery/getImageCAPTCHA?t=1', function (resp) {
                el.attr('src', 'data:image/png;base64,' + resp);
            });
            codeValEl.focus();
        };

        newImage(img);

        img.click(function () {
            newImage(img);
        });
    },

    '.checkCode click': function (el, ev) {
        ev.preventDefault();
    }
});

can.extend(PR.actions.enterEmail.prototype, can.event);

$(function () {
    window.pr = new PR($('div[state1]'));
});