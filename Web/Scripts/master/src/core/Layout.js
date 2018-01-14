var Layout = can.Control({
    scope: null,
    container: null,

    openFiles: null,

    init: function(el, options) {
        this.scope = options.scope;

        this.tpLock = new can.compute(false);

        try {
            var view = can.view('/Scripts/master/view/layout.hbs', {
                tplock: this.tpLock,
                template: {
                    data: this.scope.pool.templates.items,
                    current: this.scope.pool.templates.current
                },
                isAdmin: this.scope.pool.settings.load.user.isAdmin,
                event: {
                    template_click: delegate(function(template, el, ev) {
                        var next = delegate(function() {
                            new Logger([
                                'Выбран профиль: %template', {
                                    '%template': template.Name
                                }
                            ]);

                            if (this.scope.isLoaded) {
                                this.scope.pool.keys.attr('profile_load_id', this.scope.iprocess.add(format('Устанавливается профиль «%template»...', {
                                    '%template': template.Name
                                }), delegate(function() {
                                    scroll(100);
                                }, this)));
                            }

                            this.scope.pool.templates.changeCurrent(template.ID);
                        }, this);

                        if (can.$.inArray(this.main.actionValue(), ['subscribe', 'encrypt', 'subscribe_and_encrypt']) !== -1) {
                            closeConfirm('При смене шаблона все внесенные изменения будут потеряны. Вы уверены, что хотите сменить шаблон?', delegate(function() {
                                next.apply(this, []);
                                scroll(100);
                            }, this));
                        } else {
                            next.apply(this, []);
                        }


                    }, this),
                    myProfile: delegate(function() {
                        if (this.scope.result()) {
                            window.location.href = '/Default/MyProfile';
                            return;
                        }

                        closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function() {
                            window.location.href = '/Default/MyProfile';
                        });
                    }, this)
                },
                pool: this.scope.pool,
                exit_app: delegate(function() {
                    if (this.scope.result()) {
                        window.location.href = '/';
                        return;
                    }

                    closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function() {
                        window.location.href = '/';
                    });
                }, this),
                backFiles: delegate(function() {
                    if (this.scope.result()) {
                        window.location.href = '/';
                        return;
                    }

                    closeConfirm('Вы уверены, что хотите покинуть мастер? Все не сохраненные данные будут потеряны!', function() {
                        window.location.href = '/';
                    });
                }, this)
            });

            this.scope.pool.templates.current.bind('change', function() {
                console.log(arguments);
            });

            this.element.append(view);

            this.container = el.find('div[app]');

            this.main = new Main(this.container, {
                scope: this.scope
            });

            new Logger('Layout загружен');

            /**
             * Скрываем выпадающий список
             * с профилями по клику на
             * пустом месте в любой части страницы.
             */
            can.$('body').click(function() {
                $('.dropdown-menu.profile').hide();
            });
        } catch (e) {
            alertError('Неожиданная ошибка произошла при отрисовке страницы. "%message"', e);
        }
    },

    /**
     * Отоброжает модальное окно
     * @param title Заголовок
     * @param content Наполнение формата:
     * {
     *      type|String: [text|path],
     *      path|String: '',
     *      params|String: ''
     * }
     * @param type Тип окна
     * @returns {{setTitle: setTitle, remove: remove}}
     */
    modal: function(title, content, type, searchLine) {

        var modalObj = null, exitFnCall = function() {};

        type = type || 'box';
        var _searchLine = (searchLine === undefined) ? false : true,
            _content = '',
            _title = new can.compute(title),
            _searchValue = new can.compute(''),
            _loading = new can.compute(false),
            searchLine = searchLine || function() {};

        if (content !== undefined) {
            if (content.type === 'text') {
                _content = content.body;
            }
            if (content.type === 'path') {
                var _params = can.extend(content.params, {
                    searchValue: _searchValue
                });
                _content = can.view.render('/Scripts/master/view/modals/' + content.path, _params);
            }
        }

        var modal = can.view('/Scripts/master/view/modal.hbs', {
            title: _title,
            content: _content,
            type: type,
            searchLine: _searchLine,
            searchValue: delegate(function(scope, el, ev) {
                searchLine.apply(this, [el.val()]);
            }, this),
            loading: _loading
        }, {
            close: delegate(function() {
                return delegate(function(el) {
                    modalObj = $(el).parent().parent().parent();
                    $(el).click(delegate(function() {
                        exitFnCall.apply(this, []);
                        modalObj.remove();
                    }, this));
                }, this);
            }, this)
        });

        this.element.append(modal);

        $('#modal .window').animate({
            opacity: 1
        }, 'fast');

        return {
            /**
             * Установка заголовка
             * @param title
             */
            setTitle: function(title) {
                _title(title);
            },
            /**
             * Закрытие модального окна
             */
            remove: function() {
                modalObj.remove();
            },
            /**
             * Установка и снятие лоадера
             * @param title
             */
            loading: function(title) {
                _loading(title);
            },

            onExit: function(call) {
                exitFnCall = call;
            }
        };
    },

    /**
     * Выводит модальное сообщение
     * @param title Заголовок
     * @param text Текст сообщения
     * @param icon Иконка [warning|error]
     * @param btns Кнопки формата:
     *
     * [
     *      {
     *          // Текст кнопки
     *          text: '',
     *          // Класс кнопки
     *          cls: '',
     *          // Событие клика
     *          call: function(){}
     *      }
     * ]
     * @returns {{setTitle: setTitle, remove: remove}}
     */
    message: function(title, text, icon, btns) {
        var body, modal, exitFn = function() {};

        body = can.view.render('/Scripts/master/view/modals/message.hbs', {
            icon: icon,
            text: text,
            btns: btns
        });

        modal = this.modal(title, {
            type: 'text',
            body: body
        }, 'alert');

        can.each(btns, delegate(function(btn) {
            if (btn.exit === true) {
                exitFn = btn.call;
            }
        }, this));

        modal.onExit(function() {
            exitFn.apply(this, []);
        });

        return modal;
    },

    '.show_template click': function(el, ev) {
        ev.stopPropagation();

        $('.dropdown-menu.profile').toggle();
    },

    '.dropdown-menu.profile li a click': function(el, ev) {
        ev.stopPropagation();

        $('.dropdown-menu.profile').hide();
    },

    /**
     * Заблокировать / разблокировать выбор профиля
     * @param hasLock
     */
    templateLock: function(hasLock) {
        this.tpLock(hasLock === true);
    }
});

can.extend(Layout.prototype, can.event);