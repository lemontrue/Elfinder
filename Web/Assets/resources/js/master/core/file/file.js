/**
 * Created by Александр on 09.04.14.
 */
var File = can.Construct.extend('Core.File', {
    init: function (path, lastDate, params) {

        /**
         * Путь до файла
         * @type {*}
         */
        this.path = new can.compute(path);
        /**
         * Время последнего изменения
         * @type {*}
         */
        this.lastDate = new can.compute('');

        /**
         * Скрыт ли файл
         * @type {can.compute}
         */
        this.isHade = new can.compute(false);

        this.error = new can.compute(false);
        this.errorMessage = new can.compute('');

        /**
         * Процент загрузки
         * @type {can.compute}
         */
        this.upPercen = new can.compute(0);
        /**
         * Загружен ли файл
         * @type {can.compute}
         */
        this.uploaded = new can.compute(false);
        this.uploader = null;

        this.attachedFile = new can.Map({
            attached: false,
            path: '',
            error: false,
            errorMessage: ''
        });

        this.inner = params['inner'] || null;

        /**
         * Необработанное время изменения
         * @type {*}
         * @private
         */
        this.__rawLastDate = lastDate;

        this.setLastDate(lastDate);
        this.__setParams(params);

        this.id = guid();

        can.bind.call(window, 'upload_file_attached_reg', delegate(function (ev, id) {
            if (id === this.id) {
                if (this.uploader !== null) {
                    this.uploader.unbindAll();
                    this.uploader = null;
                }

                setTimeout(delegate(this.__fileUploadReg, this), 500);
            }
        }, this));
    },

    /**
     * Скрывает файл
     * @returns {File}
     */
    hide: function () {
        this.isHade(true);
        return this;
    },

    /**
     * Показывает файл
     * @returns {File}
     */
    show: function () {
        this.isHade(false);
        return this;
    },

    /**
     *
     *
     * @returns {File}
     */
    toggel: function () {
        this.isHade(this.isHade() === true);
        return this;
    },

    /**
     *
     * @param date
     * @returns {File}
     */
    setLastDate: function (date) {
        this.lastDate(moment(date).format('DD.MM.YYYY'));
        this.__rawLastDate = date;
        return this;
    },

    /**
     * Выводит ошибку
     * @param str Строка ошибки, если строка пуста, то ошибка снимается.
     * @returns {File}
     */
    InnerError: function (str) {
        this.error(str !== null);
        this.errorMessage((str === null) ? '' : str);

        return this;
    },

    /**
     *
     * @param params
     * @private
     */
    __setParams: function (params) {
        if (params === undefined)
            return;

        if (params['ready'] === true) {
            this.uploaded(true);
            this.upPercen(100);
        }

        if (params['attached'] === true) {
            this.attachedFile.attr('attached', true);
        }
    },

    __fileUploadReg: function () {
        if (this.uploader !== null)
            return;

        this.uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: this.id,
            //max_file_size: '20mb',
            url: Master.pool.settings.load.urlUpload,
            multi_selection: false,
            init: {
                FilesAdded: delegate(function (up, files) {
                    //55
                    if (files.length >= 10) {
                        var alert = Master.layout.message('Внимание!',
                            format('Превышено максимально допустимое число загружаемых файлов(<b>%fileCount</b>), повторите попытку.<br />Максимально допустимое число одновременно загружаемых файлов равно <b>10</b>.', {
                                '%fileCount': files.length
                            }),
                            'warning', [
                                {
                                    text: 'Да',
                                    cls: 'btn-green',
                                    call: delegate(function () {
                                        alert.remove();
                                    }, this)
                                }
                            ]);
                        return;
                    }

                    new UploadVerifyFiles(this.uploader, files);

                    this.uploader.start();
                }, this),

                FileUploaded: delegate(function (up, file, info) {
                    var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                    if (res.status == 'ok') {
                        this.attachedFile.attr('error', false);
                        this.attachedFile.attr('path', res.fileName);
                    }
                }, this),

                UploadProgress: delegate(function (up, file) {
                    this.uploaded(up.total.percent);
                }, this),

                StateChanged: delegate(function (up) {
                    if (up.state == plupload.STARTED) {
                        this.uploaded(false);
                    } else {
                        this.uploaded(true);
                    }
                }, this)
            }
        });

        this.uploader.init();
    }
});