var Core = can.Construct('Core', {
    init: function() {},

    /**
     * Ссылка на делегат оставлен для совместимости
     */
    delegate: delegate,

    /**
     * UNIX TIME
     * @returns {number}
     */
    time: time,

    /**
     * Генерация уникальной строки
     * @returns {string}
     */
    random: random,

    /**
     * Подсчёт кол-ва элементов на карте
     * @param map
     * @returns {number}
     */
    countMap: countMap,

    /**
     * Очистка рабочей карты
     * @param map
     * @returns {*}
     */
    clearMap: clearMap
});