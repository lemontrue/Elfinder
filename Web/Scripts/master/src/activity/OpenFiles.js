var OpenFiles = can.Control({
    scope: null,

    init: function(el, options) {
        this.scope = options.scope;

        var viewSelectFiles = can.view('Scripts/master_1/view/activity/open_files/main.hbs');

        el.append(viewSelectFiles);

        var uploader = new plupload.Uploader({
            runtimes: 'html5',
            browse_button: 'newFile',
            url: this.scope.pool.settings.load.urlUpload,
            init: {
                FilesAdded: function(up, files) {
                    uploader.start();
                },

                FileUploaded: function(up, file, info) {

                }
            }
        });

        uploader.init();
    },

    openFileDialog: function() {
        $('#fileDialog').show();
        $('#fileDialog iframe')[0].src = '/Default/WebDavBrowser';
    },

    closeFileDialog: function() {
        $('#fileDialog').hide();
        $('#fileDialog iframe')[0].src = '';
    },

    '#openFileDialog click': function() {
        this.openFileDialog();
    },

    '.closeFileDialog click': function() {
        this.closeFileDialog();
    }
});