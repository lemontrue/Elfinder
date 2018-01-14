// modules
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prefix = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    cssmin = require('gulp-minify-css'),
    rimraf = require('rimraf'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    //scripts
    concat = require('gulp-concat'),
    coffee = require('gulp-coffee');

// config
var conf = {
    css: {
        from: './resources/sass/*.sass',
        to: './css/',
        pref: { browsers: ["last 8 version", "> 1%", "ie 8", "ie 7"], cascade: false },
        map: '../maps/'

    },
    js: {

    },
    img: {
        from: './resources/img/**',
        to: './i',
        opts: {
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }
    }
};
// prepare SASS styles with sourcemaps
gulp.task('styles', function () {
    gulp.src(conf.css.from)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write(conf.css.map))
        .pipe(gulp.dest(conf.css.to));

});
// copy & compress images from resources
gulp.task('images', function () {
    gulp.src(conf.img.from)
        .pipe(imagemin(conf.img.opts))
        .pipe(gulp.dest(conf.img.to));
});
// production versions css (minify & needed vendor prefixes)
// todo separate config for prod. without sourcemaps
gulp.task('prod', function () {
    gulp.src(conf.css.to +'**')
        .pipe(prefix(conf.css.pref))
        .pipe(cssmin())
        .pipe(gulp.dest(conf.css.to));

});
// clean destination folders
gulp.task('clean', function () {
    var cb = function(){};
    rimraf('./i',cb);
    rimraf('./css',cb);
    rimraf('./js',cb);
    rimraf('./maps',cb);
});
// compile .coffee, concat result .js files
gulp.task('scripts', function() {
    gulp.src('./resources/coffee/**/*.coffee')
       // .pipe(sourcemaps.init())
        .pipe(coffee({bare: true}))
       // .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js/'));

});

gulp.task('scripts:master', function() {
    gulp.src([
        './resources/js/master/helpers/Global.js',
        './resources/js/master/helpers/RegisterHelper.js',
        './resources/js/master/helpers/CheckAttachmentFiles.js',
        './resources/js/master/helpers/CertificateSelection.js',
        './resources/js/master/helpers/SelectCertificate.js',
        './resources/js/master/helpers/OperationResult.js',
        './resources/js/master/helpers/OpenUploadFileDialog.js',
        './resources/js/master/helpers/PinCode.js',
        './resources/js/master/helpers/UploadVerifyFiles.js',
        './resources/js/master/core/Logger.js',
        './resources/js/master/core/Core.js',
        './resources/js/master/core/CoreGlob.js',
        './resources/js/master/core/Request.js',
        './resources/js/master/core/Layout.js',
        './resources/js/master/core/InformationProcess.js',
        './resources/js/master/core/template/Template.js',
        './resources/js/master/core/template/Templates.js',
        './resources/js/master/core/file/File.js',
        './resources/js/master/activity/Actions.js',
        './resources/js/master/activity/Main.js',
        './resources/js/master/activity/SignAndEncrypt.js',
        './resources/js/master/activity/CheckSignature.js',
        './resources/js/master/activity/Decipher.js',
        './resources/js/master/activity/DecipherAndCheckSignature.js',
        './resources/js/master/Init.js',
       ])
        .pipe(sourcemaps.init())
        .pipe(concat('master.js'))

        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest('./js/'));
});

gulp.task('scripts:elfinder', function() {
    gulp.src([
            "./resources/js/elfinder/jquery-1.7.1.min.js",
            "./resources/js/elfinder/jquery-ui-1.8.11.min.js",
            "./resources/js/elfinder/elFinder.js",
            "./resources/js/elfinder/elFinder.version.js",
            "./resources/js/elfinder/jquery.elfinder.js",
            "./resources/js/elfinder/elFinder.resources.js",
            "./resources/js/elfinder/elFinder.options.js",
            "./resources/js/elfinder/elFinder.history.js",
            "./resources/js/elfinder/elFinder.command.js",
            "./resources/js/elfinder/i18n/elfinder.ru.js",
            "./resources/js/elfinder/proxy/elFinderSupportVer1.js",
            "./resources/js/elfinder/jquery.dialogelfinder.js",
            "./resources/js/elfinder/ui/overlay.js",
            "./resources/js/elfinder/ui/workzone.js",
            "./resources/js/elfinder/ui/navbar.js",
            "./resources/js/elfinder/ui/dialog.js",
            "./resources/js/elfinder/ui/tree.js",
            "./resources/js/elfinder/ui/cwd.js",
            "./resources/js/elfinder/ui/toolbar.js",
            "./resources/js/elfinder/ui/button.js",
            "./resources/js/elfinder/ui/bluebutton.js",
            "./resources/js/elfinder/ui/uploadButton.js",
            "./resources/js/elfinder/ui/viewbutton.js",
            "./resources/js/elfinder/ui/searchbutton.js",
            "./resources/js/elfinder/ui/sortbutton.js",
            "./resources/js/elfinder/ui/morebutton.js",
            "./resources/js/elfinder/ui/panel.js",
            "./resources/js/elfinder/ui/contextmenu.js",
            "./resources/js/elfinder/ui/path.js",
            "./resources/js/elfinder/ui/stat.js",
            "./resources/js/elfinder/ui/infobar.js",
            "./resources/js/elfinder/ui/places.js",
            "./resources/js/elfinder/ui/linkbutton.js",
            "./resources/js/elfinder/ui/filterbutton.js",
            "./resources/js/elfinder/ui/cryptxdialog.js",
            "./resources/js/elfinder/ui/bottomaddpanel.js",
            "./resources/js/elfinder/ui/multiplyaddbutton.js",
            "./resources/js/elfinder/commands/back.js",
            "./resources/js/elfinder/commands/forward.js",
            "./resources/js/elfinder/commands/reload.js",
            "./resources/js/elfinder/commands/up.js",
            "./resources/js/elfinder/commands/home.js",
            "./resources/js/elfinder/commands/copy.js",
            "./resources/js/elfinder/commands/paste.js",
            "./resources/js/elfinder/commands/open.js",
            "./resources/js/elfinder/commands/rm.js",
            "./resources/js/elfinder/commands/info.js",
            "./resources/js/elfinder/commands/duplicate.js",
            "./resources/js/elfinder/commands/rename.js",
            "./resources/js/elfinder/commands/help.js",
            "./resources/js/elfinder/commands/getfile.js",
            "./resources/js/elfinder/commands/mkdir.js",
            "./resources/js/elfinder/commands/mkfile.js",
            "./resources/js/elfinder/commands/upload.js",
            "./resources/js/elfinder/commands/download.js",
            "./resources/js/elfinder/commands/edit.js",
            "./resources/js/elfinder/commands/quicklook.js",
            "./resources/js/elfinder/commands/quicklook.plugins.js",
            "./resources/js/elfinder/commands/extract.js",
            "./resources/js/elfinder/commands/archive.js",
            "./resources/js/elfinder/commands/search.js",
            "./resources/js/elfinder/commands/view.js",
            "./resources/js/elfinder/commands/resize.js",
            "./resources/js/elfinder/commands/sort.js",
            "./resources/js/elfinder/commands/netmount.js",
            "./resources/js/elfinder/commands/more.js",
            "./resources/js/elfinder/commands/infobarcmd.js",
            "./resources/js/elfinder/commands/encrypt.js",
            "./resources/js/elfinder/commands/decrypt.js",
            "./resources/js/elfinder/commands/checksign.js",
            "./resources/js/elfinder/commands/receivedmail.js",
            "./resources/js/elfinder/commands/opensendpopup.js",
            "./resources/js/elfinder/commands/decryptandchecksign.js",
            "./resources/js/elfinder/commands/signandencrypt.js",
            "./resources/js/elfinder/commands/add.js",
            "./resources/js/elfinder/commands/cancel.js",
            "./resources/js/elfinder/commands/cryptinfo.js",
            "./resources/js/elfinder/commands/certdownload.js",
            "./resources/js/elfinder/commands/filter.js",
            "./resources/js/elfinder/commands/post.js",
            "./resources/js/elfinder/commands/multiplyadd.js",
            "./resources/js/elfinder/commands/sign.js"
       ])
        .pipe(sourcemaps.init())
        .pipe(concat('elfinder.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js/'));
});
gulp.task('scripts:mainpage', function() {
    gulp.src([
            "./resources/js/baron.min.js",
            "./resources/js/jquery.fancybox.pack.js",
            "./resources/js/opentip.js"
       ])
        .pipe(sourcemaps.init())
        .pipe(concat('mainpage.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js/'));
});
// base task
gulp.task('default', function() {

    gulp.run('scripts','scripts:elfinder','scripts:master','scripts:mainpage', 'styles', 'images');

    gulp.watch('resources/sass/**', function(event) {
        gulp.run('styles');
    });

    gulp.watch('resources/coffee/**', function(event) {
        gulp.run('scripts');
    });
    gulp.watch('resources/js/**', function(event) {
           gulp.run('scripts:mainpage');
    });

    gulp.watch('resources/js/master/**', function(event) {
       gulp.run('scripts:master');
    });

    gulp.watch('resources/js/elfinder/**', function(event) {
           gulp.run('scripts:elfinder');
       });

    gulp.watch('resources/img/**', function(event) {
        gulp.run('images');
    });


});
