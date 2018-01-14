/**
 * Created by Александр on 16.04.14.
 */
var CheckAttachmentFiles = can.Construct({
    init: function(scope, callFn) {
        this.scope = scope;
        this.callFn = callFn;

        try {
            this.scope.req.begin('check_signed_file_setacment', {
                signedFileInfosJSON: this.scope.getFilesString()
            }, delegate(function(data) {
                if (data.data.status === 'Error') {
                    can.trigger(window, 'net_error', [data.data.errorMessage]);
                    this.scope.errorMaster();
                    return;
                }


                this.checkingResult(data.data.masterSignedFileInfos);
            }, this));
        } catch (e) {
            alertError('Неожиданная ошибка произошла при проверке присоединённого файла. "%message"', e);
        }
    },

    checkingResult: function(files) {
        try {
            var success = true;
            can.each(files, delegate(function(file, index) {
                _file = file.SignedFileInfo;

                var resultSearch = this.scope.searchFile(_file.FileUri);

                if (file.Exception !== null) {
                    resultSearch.file.InnerError('Подпись данного файла не может быть проверена');

                    return 0;
                }

                if (_file.Detached === true) {
                    success = false;

                    resultSearch.file.attachedFile.attr('attached', true);

                    resultSearch.file.attachedFile.attr('error', true);
                    resultSearch.file.attachedFile.attr('errorMessage', 'Укажите файл для подписи');
                }
            }, this));

            this.callFn.apply(this, [success === true]);
        } catch (e) {
            alertError('Неожиданная ошибка произошла при проверке присоединённого файла. "%message"', e);
        }
    }
});