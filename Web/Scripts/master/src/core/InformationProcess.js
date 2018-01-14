/**
 *
 * @type {*}
 */
var InformationProcess = can.Construct('Helpers.InformationProcess', {
    init: function(scope) {
        this.scope = scope;

        this.process = new can.Map.List();

        this.current = new can.compute(null);
        this.currentProcess = new can.compute(null);

        this.countProcess = new can.compute(0);
        this.time = new can.compute('00:00');

        this.message = null;
        this.cap = null;

        this.visibility = false;

        this.__timeInterval = null;
        this.__timeTicks = 0;

        var view = can.view('/Scripts/master/view/information_process.hbs', {
            current: this.current,
            countProcess: this.countProcess,
            exit: delegate(this.exit, this),
            time: this.time
        });

        can.bind.call(window, 'appRun', delegate(function(ev, scope){
            $('div[information_process]').append(view);

            this.message = $('div[information_process] div[message]');
            this.cap = $('div[information_process] .cap');

            this.cap.hide();
        }, this));

        can.bind.call(window, 'process_exit', delegate(function(ev, id){
            var itemID = listObjSearch(this.process, 'ID', id);
            if(can.$.inArray(itemID, [null, undefined]) !== -1)
                return;

            this.process[itemID].ExitFn.apply(this, [0]);

            this.process.splice(itemID, 1);
        }, this));

        this.process.bind('change', delegate(function(ev, attr, how, newVal, oldVal){
            this.__run();
        }, this));
    },

    /**
     * Внутренний запуск
     * @private
     */
    __run: function() {

        if(this.process.length > 0) {
            if(!this.visibility)
                this.__show();

            var showFn = function() {
                this.currentProcess(this.process[0]);

                this.current(this.currentProcess().Name);

                this.__animateMessageShow();

                /**
                 * Возникает когда запускается процесс.
                 */
                can.trigger(window, 'process_run', [this.process[0].ID, this.process[0].Name]);
            };

            if(this.current() !== null)
                this.__animateMessageHide(showFn);

            showFn.apply(this, []);
        } else {
            this.current(null);
            this.currentProcess(null);

            if(this.visibility)
                this.__hide();
        }

        this.countProcess(this.process.length);
    },

    /**
     * Добавления задачи
     * @param name
     * @returns {*}
     */
    add: function(name, callExit) {
        var ID = guid();

        this.process.push({
            ID: ID,
            Name: name,
            ExitFn: callExit || function(){}
        });

        return ID;
    },

    /**
     * Отображение нового сообщения
     * @param text Текст сообщения
     * @private
     */
    __showMessage: function(text) {

    },

    /**
     * Отображение панели
     * @private
     */
    __show: function(call) {
        call = call || function(){};


        $('#information_process').animate({
            bottom: 0
        }, 'fast', delegate(function(){
            call.apply(this, []);

            this.cap.show();
        }, this));

        this.visibility = true;

        this.__timeInterval = setInterval(delegate(function(){
            this.__timeTicks++;

            var minutes = Math.floor(this.__timeTicks / 60);
            var seconds = this.__timeTicks - minutes * 60;

            this.time(format('mm:ss', {
                'mm': (minutes < 10) ? '0'+minutes:minutes,
                'ss': (seconds < 10) ? '0'+seconds:seconds
            }));
        }, this), 1000);
    },

    /**
     * Скрывание панели
     * @private
     */
    __hide: function(call) {
        call = call || function(){};

        $('#information_process').animate({
            bottom: -90
        }, 'fast', delegate(function(){
            call.apply(this, []);

            this.cap.hide();
        }, this));

        this.visibility = false;

        clearInterval(this.__timeInterval);
        this.time('00:00');
        this.__timeTicks = 0;
    },

    /**
     * Анимация отображения сообщения
     * @private
     */
    __animateMessageShow: function(call) {
        call = call || function(){};

        this.message.css({
            'margin-top': 35,
            opacity: 0
        }).animate({
            'margin-top': 18,
            opacity: 1
        }, 'fast', delegate(function(){
            call.apply(this, []);
        }, this));
    },

    /**
     * Анимация скрывание сообщения
     * @private
     */
    __animateMessageHide: function(call) {
        call = call || function(){};

        this.message.css({
            'margin-top': 18,
            opacity: 1
        }).animate({
            'margin-top': 1,
            opacity: 0
        }, 'fast', delegate(function(){
            call.apply(this, []);
        }, this));
    },

    exit: function() {
        this.process.each(delegate(function(p, i){
            p.ExitFn.apply(this, [-1, p.ID]);
        }, this));

        clearList(this.process);
    }
});