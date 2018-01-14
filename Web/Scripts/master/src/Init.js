//
// Парень берегись!
//
// Когда ты закончишь «оптимизировать» этот мастер
// и поймешь, насколько большой ошибкой было делать это,
// пожалуйста, увеличь счетчик внизу как предупреждение
// для следующего парня:
//
total_hours_wasted_here = 1;
/**
 * Глобальная инициализация мастера
 */
var InitMaster = Core.extend({
    name: 'Мастер по работе с документами',

    init: function(settings) {
        Master.debug = this.debug = settings.debug;

        /**
         * Инициализировано ли приложение.
         * @type {boolean}
         */
        this.isLoaded = false;

        new Logger(['Начало работы "%m"', { '%m': this.name }]);

        this.core = new CoreGlob(this);
        this.core.loadSettings(settings);

        this.Version = {
            number: '1.2.14',
            date: '24.07.14 12:11'
        };
    }
});