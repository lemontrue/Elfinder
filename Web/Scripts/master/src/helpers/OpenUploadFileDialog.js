/**
 * Created by Александр on 28.04.14.
 */
var OpenUploadFileDialog = can.Construct({
    init: function(fnCall, params) {
        params = params || {};

        this.key = random();
        this.fnCall = fnCall || function() {};

        this.multi_selection = (params['multi_selection'] === undefined) ? true : params['multi_selection'];

        try {
            this.modal = Master.layout.modal('Выберите файл для добавления', {
                type: 'path',
                path: 'select_files.hbs',
                params: {
                    key: this.key,
                    multi_selection: this.multi_selection
                }
            }, 'box');
        } catch (e) {
            alertError('Неожиданная ошибка произошла при открытии диалогового откна выбора файлов. "%message"', e);
        } finally {
            can.bind.call(window, 'select_files', delegate(function(ev, key, files) {
                if (key !== this.key)
                    return;

                this.fnCall.apply(Master, [files, params]);
                this.close();
            }, this));

            can.bind.call(window, 'window_open_files_close', delegate(function(ev, key, files) {
                this.close();
            }, this));
        }
    },

    close: function() {
        this.modal.remove();
    }
});