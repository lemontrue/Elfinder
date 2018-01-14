var delegate = function(fn, scope, args) {
    if (!can.isFunction(fn))
        return false;

    return function() {
        return fn.apply(scope || this, args || arguments);
    };
};

can.stache.registerHelper('focusEl', function() {
    return function(el) {
        setTimeout(function() {
            $(el).focus();
        }, 150);
    };
});

can.stache.registerHelper('inverse', function(type, options) {
    if (type() === false) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

can.Construct('PR', {
    actions: {
        newPass: null
    }
}, {
    init: function(el) {
        this.el = el;
        this.action = new can.compute(null);

        this.token = null;

        this.activeAction('newPass');
    },

    activeAction: function(name) {
        if (this.constructor.actions[name] === undefined)
            return false;

        this.el.html('');

        this.action(new this.constructor.actions[name](this.el, {}));

        return true;
    },

    ready: function() {
        this.el.html(can.view('/Content/passRecoveryViews/ready.hbs', {}));
    }
});

PR.actions.newPass = can.Control({
    view: '/Content/passRecoveryViews/new_pass.hbs'
}, {
    init: function(el, options) {
        this.strongPassword = can.compute(false);
        this.passwordsNotMatch = can.compute(true);

        this.passValue = can.compute('');
        this.rePassValue = can.compute('');

        this.btnNextState = can.compute(false);

        this.render();
    },

    render: function() {
        this.element.html(can.view(this.constructor.view, {
            passValue: this.passValue,
            rePassValue: this.rePassValue,
            strongPassword: this.strongPassword,
            passwordsNotMatch: this.passwordsNotMatch,

            btnNextState: this.btnNextState,

            event: {
                next: delegate(function() {
                    $.post('/PassRecovery/setPassword', {
                        pass: this.passValue(),
                        guid: pr.token
                    }, delegate(function(resp) {
                        if (resp.Error) {
                            // !!!
                            return;
                        }

                        if (resp.State === 70) {
                            pr.ready();
                        } else {

                        }
                    }, this));
                }, this)
            }
        }, {
            trackingError: delegate(function(pv, rpv, options) {
                this.strongPassword(
                    pv().search(/^[a-zA-Z0-9]{6,20}\b/) === 0 &&
                    /[A-Z]+/.test(pv()) &&
                    /[a-z]+/.test(pv()) &&
                    /[0-9]+/.test(pv())
                );

                this.passwordsNotMatch(!(pv() === rpv()));

                this.btnNextState(this.strongPassword() === true && this.passwordsNotMatch() === false);
            }, this)
        }));
    }
});

$(function() {
    window.pr = new PR($('div[state1]'));
});