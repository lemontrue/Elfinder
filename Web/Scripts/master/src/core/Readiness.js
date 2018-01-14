/**
 * Created by Александр on 02.04.14.
 */

/**
 *
 * @type {*}
 */
var Readiness = can.Construct({
    init: function() {
        /**
         * Зарегистрированные профили
         * @type {exports.List}
         */
        this.profiles = new can.Map.List([]);
    },

    /**
     * Регистрируем новый профиль
     * @param name Имя
     * @param arguments Отслеживаемые параметры
     * @param call Функция вызова
     * @returns {boolean}
     */
    newProfile: function(name, params, call, active) {

        active = active === undefined ? true : active === true;

        if (listObjSearch(this.profiles, 'name', name) !== null) {
            new Logger([
                'Регистрируемый профиль отслеживания готовности "%name" уже существует', {
                    '%name': name
                }
            ], 'error');

            return false;
        }

        if (typeof call !== 'function') {
            new Logger('Регистрируемый профиль отслеживания готовности требует обязательной функции вызова', 'error');
            return false;
        }

        var _params = {};
        can.each(params, delegate(function(item) {
            _params[item] = false;
        }, this));

        this.profiles.push({
            name: name,
            params: _params,
            call: call,
            active: active
        });

        return true;
    },

    /**
     * Отслеживание группы профилей
     * @param profiles
     */
    newProfileGroup: function(profiles, call) {

    },

    /**
     * Активация и деактивация профилей
     * @param profile
     * @param val
     * @returns {boolean}
     */
    active: function(profile, val) {
        val = val === true;

        var pi = this.__getProfile(profile),
            profile = null;

        if (pi === null) {
            return false;
        }

        profile = this.profiles[pi];

        profile.attr('active', val);

        return true;
    },

    /**
     *
     * @param profile
     * @param param
     * @param status
     * @returns {boolean}
     */
    event: function(profile, param, status) {
        status = (status === true);

        var _profile_index = listObjSearch(this.profiles, 'name', profile),
            _profile = null;
        if (_profile_index === null) {
            new Logger([
                'Профиль отслеживания готовности "%name" не существует', {
                    '%name': profile
                }
            ], 'error');

            return false;
        }

        _profile = this.profiles[_profile_index];

        var _param = _profile.params.attr(param);
        if (_param === undefined) {
            new Logger([
                'Параметра "%name" не существует', {
                    '%name': param
                }
            ], 'error');

            return false;
        }

        if (_param === status) {
            new Logger([
                'Значение параметра "%name" не изменились', {
                    '%name': param
                }
            ], 'warning');

            return true;
        }

        _profile.params.attr(param, status);

        this.__analiz(_profile);

        return true;
    },

    /**
     *
     * @param profile
     * @private
     */
    __analiz: function(profile) {
        var _arr_status = [];

        profile.params.each(delegate(function(val, key) {
            _arr_status.push(val);
        }, this));

        if (can.$.inArray(false, _arr_status) === -1) {
            profile.call.apply(null, [profile]);
        }
    },
    /**
     * Поиск профиля
     * @param name
     * @returns {*}
     * @private
     */
    __getProfile: function(name) {
        var profileIndex = null;

        this.profiles.each(function(_profile, _index) {
            if (_profile.name === name)
                profileIndex = _index;
        });

        return profileIndex;
    }
});