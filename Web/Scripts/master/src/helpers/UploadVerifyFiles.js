/**
 * Created by Александр on 17.06.14.
 */
var UploadVerifyFiles = can.Construct('helpers.UploadVerifyFiles', {
    init: function(uploader, files, fnCall) {
        this.uploader = uploader;
        this.files = files;
        this.fnCall = fnCall || function(){};

        this.__errors = new can.Map.List();
        this.__verified = new can.Map.List();

        can.each(files, delegate(function(file){
            this.__verifyFile(file);
        }, this));

        this.fnCall.apply(this, [this.__verified]);

        if(this.__errors.length === 0){

            return;
        }

        this.__showErrorMessage();
    },

    __verifyFile: function(file) {
        if(file.size > 20*1024*1024) {
            this.__addError(file, 'Превышен максимально допустимый размер загружаемого файла, повторите попытку. Максимально допустимый размер файла равен 20 мегабайтам.');
            return;
        }

        if(file.name.length > 100) {
            this.__addError(file, 'Превышена максимальная длина имени файла. В настоящий момент максимальная длина имени файла ограничена 100 символами.');
            return;
        }

        var mach = file.name.match(/[$\:\*\?\"\+\#\<\>\/]/g);

        if(mach !== null && mach.length > 0) {
            this.__addError(file, 'Файл содержит недопустимые символы в названии. Для ввода запрещены символы: "$ / : * ? " + # < > |"');
            return;
        }

        this.__verified.push(file);
    },

    __addError: function(file, errorMessage) {
        this.uploader.removeFile(file);

        this.__errors.push({
            name: aligningText(file.name, 40),
            message: errorMessage
        });
    },

    __showErrorMessage: function() {
        var message = '';

        this.__errors.each(delegate(function(error) {
            message += format('<b>«%name»</b> — %message<br />', {
                '%name': error.name,
                '%message': error.message
            });
        }, this));

        var _alert = Master.layout.message('Внимание!',
            format('Невозможно загрузить некоторые файлы по следующим причинам:<br />%errors%', {
                '%errors%': message
            }),
            'error', [
                {
                    text: 'Закрыть',
                    cls: 'btn-green',
                    call: delegate(function(){
                        _alert.remove();
                    }, this)
                }
            ]);

        $('.upload').removeClass('drag');
    }
});