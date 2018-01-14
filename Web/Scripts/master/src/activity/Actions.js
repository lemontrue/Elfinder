var Actions = can.Control({
    scope: null,
    /**
     * Готовность файлов.
     */
    filesReady: null,

    init: function(el, options) {
        this.scope = options.scope;
        this.filesReady = new can.compute(false);

        var view = can.view('Scripts/master/view/actions.hbs', {
            pool: this.scope.pool,
            event: {
                file_list_open: this.scope.delegate(function() {
                    this.selectFiles();
                }, this),
                // Удалить из списка
                hide_for_list: this.scope.delegate(function(file) {
                    file.attr('isHade', true);
                }, this),
                // Восстановить
                show_for_list: this.scope.delegate(function(file) {
                    file.attr('isHade', false);
                }, this),
                // Скрыть
                delete_for_list: this.scope.delegate(function(file) {
                    var index = this.scope.core.fileSearch(file.name).index;

                    this.scope.pool.files.splice(index, 1);
                }, this),
                cancel: this.scope.delegate(function() {
                    this.scope.pool.files.each(this.scope.delegate(function(file, index) {
                        this.scope.pool.files.splice(index, 1);
                    }, this));
                }, this)
            },
            filesReady: this.filesReady,
            aaa: 123
        }, {
            activeUploader: this.scope.delegate(function() {
                setTimeout(this.scope.delegate(function() {
                    this.regUploader();
                }, this), 500);
            }, this)
        });

        el.append(view);

    },

    selectFiles: function() {
        new Logger('open');

        this.scope.layout.modal('Выберите файл для добавления', 'select_files.hbs', {}, 'box');
    },

    /**
     * Регистрация загрузчика файлов.
     * (Биндинг на элемент дома)
     */
    regUploader: function() {
        this.uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: 'newFile',
            url: this.scope.pool.settings.load.urlUpload,
            init: {
                FilesAdded: this.scope.delegate(function(up, files) {

                    can.each(files, this.scope.delegate(function(file) {
                        this.scope.pool.files.push({
                            name: file.name,
                            date: moment.unix(this.scope.time()).format('DD.MM.YYYY'),
                            uploaded: false,
                            upPercen: 0,
                            isHade: false
                        });

                        file.a = this.scope.core.fileSearch(file.name).file;
                    }, this));

                    this.uploader.start();
                }, this),

                FileUploaded: this.scope.delegate(function(up, file, info) {
                    var res = (typeof info.response === 'string') ? JSON.parse(info.response) : info.response;

                    if (res.status == 'ok') {
                        file.a.attr('uploaded', true);
                    }

                }, this),

                UploadProgress: this.scope.delegate(function(up, file) {

                    file.a.attr('upPercen', up.total.percent);
                }, this),

                StateChanged: this.scope.delegate(function(up) {
                    if (up.state == plupload.STARTED) {
                        // Начало загрузки
                    } else {
                        // Загрузка закончена
                    }
                }, this)
            }
        });

        this.uploader.init();
    }
});