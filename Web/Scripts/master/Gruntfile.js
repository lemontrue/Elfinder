var _path = require('path');
var fs = require('fs');

module.exports = function(grunt) {
    var path = _path.join(_path.dirname(fs.realpathSync(__filename)));

    var version = [],
        path_master = path + '\_bin\Master.js';

    version.push(path_master);

    grunt.initConfig({
        version: {
            somejs: {
                options: {
                    prefix: '@version\\s*'
                },
                src: version
            }
        },

        concat: {
            options: {
                separator: '\r\n'
            },

            master_js: {
                src: [
                    path + '\src\helpers\Global.js',
                    path + '\src\helpers\RegisterHelper.js',
                    path + '\src\helpers\CheckAttachmentFiles.js',
                    path + '\src\helpers\CertificateSelection.js',
                    path + '\src\helpers\SelectCertificate.js',
                    path + '\src\helpers\OperationResult.js',
                    path + '\src\helpers\OpenUploadFileDialog.js',
                    path + '\src\helpers\PinCode.js',
                    path + '\src\helpers\UploadVerifyFiles.js',
                    path + '\src\core\Logger.js',
                    path + '\src\core\Core.js',
                    path + '\src\core\CoreGlob.js',
                    path + '\src\core\Request.js',
                    path + '\src\core\Layout.js',
                    path + '\src\core\InformationProcess.js',
                    path + '\src\core\template\Template.js',
                    path + '\src\core\template\Templates.js',
                    path + '\src\core\file\File.js',
                    path + '\src\activity\Actions.js',
                    path + '\src\activity\Main.js',
                    path + '\src\activity\SignAndEncrypt.js',
                    path + '\src\activity\CheckSignature.js',
                    path + '\src\activity\Decipher.js',
                    path + '\src\activity\DecipherAndCheckSignature.js',
                    path + '\src\Init.js',
                ],

                dest: path + '\_bin\Master.js'
            },

            master_css: {
                src: [
                    path + '\src\style\Common.css'
                ],

                dest: path + '\_bin\Master.css'
            }
        },

        watch: {
            debug: {
                files: [
                    '<%= concat.master_js.src %>',
                    '<%= concat.master_css.src %>'
                ],
                tasks: [
                    'concat:master_js',
                    'concat:master_css'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-version');

    grunt.registerTask('debug', [
        'concat:master_js',
        'concat:master_css',
        'watch:debug'
    ]);
};