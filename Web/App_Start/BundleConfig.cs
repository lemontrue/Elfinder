using System.Web.Optimization;

namespace CryptxOnline.Web.App_Start
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/Global").Include(
                "~/Assets/libjs/Lib/jquery/jquery-migrate-1.2.1.js",
                "~/Assets/libjs/Login/modernizr.js",
                "~/Assets/libjs/Login/respond.js",
                "~/Assets/libjs/Login/bootstrap.min.js",
                "~/Assets/libjs/Login/jquery.fancybox.pack.js",
                "~/Assets/libjs/jquery.cookie.js",
                "~/Assets/libjs/Login/bootstrap-checkbox.js",
                "~/Assets/libjs/Login/jquery.radio.min.js",
                "~/Assets/libjs/Login/jquery.textPlaceholder.js",

                "~/Assets/js/Crypt.Base.js",
                "~/Assets/js/Crypt.Config.js",
                "~/Assets/js/Crypt.Dialog.js",
                "~/Assets/js/Crypt.Helpers.js",
                "~/Assets/js/Crypt.Preloader.js",
                "~/Assets/js/Crypt.Timer.js",
                "~/Assets/js/Crypt.l18n.js",
                "~/Assets/js/Crypt.Pages.js"
	            ));

            bundles.Add(new ScriptBundle("~/bundles/Login").Include(
                "~/Assets/libjs/Lib/underscore-min.js",

                "~/Assets/js/dialogs/Crypt.Dialog.Login.js",
                "~/Assets/js/dialogs/Crypt.Dialog.LoginKobil.js",
                "~/Assets/js/Crypt.Pages.Login.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/Landing").Include(
                "~/Assets/libjs/Lib/underscore-min.js",
                "~/Assets/libjs/Lib/jquery/jquery.validate.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.scrollTo.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.autocomplete.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.maskedinput.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.opentip.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.jcarousel.min.js",

                "~/Assets/js/dialogs/Crypt.Dialog.RegPhoneConfirm.js",
                "~/Assets/js/dialogs/Crypt.Dialog.Feedback.js",
                "~/Assets/js/dialogs/Crypt.Dialog.BaseTemporary.js",
                "~/Assets/js/Crypt.Pages.Landing.js"
                ));

            // временный бандл для профиля, 
            // todo: Объединить с глобальным, вынести локальные для профиля 
            bundles.Add(new ScriptBundle("~/bundles/Profile").Include(
                "~/Assets/libjs/Login/jquery.1.8.0.min.js",
                "~/Assets/libjs/Login/modernizr.js",
                "~/Assets/libjs/Login/respond.js",
                "~/Assets/libjs/Login/bootstrap.min.js",
                "~/Assets/libjs/Login/baron.min.js",
                "~/Assets/libjs/Login/jquery.fancybox.pack.js",
                "~/Assets/libjs/Login/cusel.min.js",
                "~/Assets/libjs/Login/bootstrap-checkbox.js",
                "~/Assets/libjs/Login/jquery.radio.min.js",
                "~/Assets/libjs/Lib/jquery/jquery.maskedinput.min.js",
                "~/Assets/libjs/Login/jquery.textPlaceholder.js",
                "~/Assets/libjs/Login/script.js",
                "~/Assets/libjs/jquery.cookie.js",
                "~/Assets/libjs/Lib/underscore-min.js",


                "~/Assets/js/Crypt.Base.js",
                "~/Assets/js/Crypt.Config.js",
                "~/Assets/js/Crypt.l18n.js",
                "~/Assets/js/Crypt.Helpers.js",
                "~/Assets/js/Crypt.Preloader.js",
                "~/Assets/js/Crypt.Dialog.js",
                "~/Assets/js/Crypt.Timer.js",
                "~/Assets/js/Crypt.View.js",
                "~/Assets/js/dialogs/Crypt.Dialog.Welcome.js",
                "~/Assets/js/dialogs/Crypt.Dialog.NewTestCertificate.js",
                "~/Assets/js/dialogs/Crypt.Dialog.NewCertificateLoader.js",
                "~/Assets/js/dialogs/Crypt.Dialog.NewCertificateCongratulations.js",
                "~/Assets/js/dialogs/Crypt.Dialog.RequestSmsConfirm.js",

                "~/Assets/js/dialogs/Crypt.Dialog.MarkerActivation.js"
                ));


            bundles.Add(new StyleBundle("~/bundles/css/Login").Include(
                "~/Content/CustomStyle.css",
                "~/Content/CSS/New/common.css",
                "~/Content/CSS/New/normalize.css",
                "~/Content/CSS/New/icons.css",
                "~/Content/opentip.css",
                "~/Content/CSS/New/style.css",
                "~/Content/CSS/New/jquery.fancybox.css",
                "~/Content/CSS/New/modals.css",
                "~/Content/assets/css/default.login.css",
                "~/A/assets/css/modal.css"
                ));


            bundles.Add(new ScriptBundle("~/bundles/New").Include(
                "~/Scripts/Login/jquery.1.8.0.min.js",
                "~/Scripts/Login/modernizr.js",
                "~/Scripts/Login/respond.js",
                "~/Scripts/Login/bootstrap.min.js",
                "~/Scripts/Login/baron.min.js",
                "~/Scripts/Login/jquery.fancybox.pack.js",
                "~/Scripts/Login/cusel.min.js",
                "~/Scripts/Login/bootstrap-checkbox.js",
                "~/Scripts/Login/jquery.radio.min.js",
                "~/Scripts/Login/jquery.textPlaceholder.js",
                "~/Scripts/Login/script.js",
                "~/Scripts/jquery.cookie.js",
                "~/Scripts/Lib/jquery/jquery.opentip.min.js"

                ));



            bundles.Add(new StyleBundle("~/bundles/CSS/profile").Include(
                //"~/Content/CSS/New/reset.css",
                "~/Content/CSS/New/common.css",
                "~/Content/CSS/New/normalize.css",
                "~/Content/CSS/New/modals.css",
                "~/Content/CSS/New/icons.css",
                "~/Content/CSS/New/profile.css",
                "~/Content/CSS/New/jquery.fancybox.css",
                "~/Content/CSS/New/custompopup.css"
                ));

            bundles.Add(new StyleBundle("~/Content/elfinder/css").Include(
                //"~/Content/elfinder/css/smoothness-1.8.23/jquery-ui-1.8.23.custom.css",
                "~/Content/elfinder/css/common.css",
                "~/Content/elfinder/css/dialog.css",
                "~/Content/elfinder/css/toolbar.css",
                "~/Content/elfinder/css/navbar.css",
                "~/Content/elfinder/css/statusbar.css",
                "~/Content/elfinder/css/contextmenu.css",
                "~/Content/elfinder/css/cwd.css",
                "~/Content/elfinder/css/quicklook.css",
                "~/Content/elfinder/css/commands.css",
                "~/Content/elfinder/css/fonts.css",
                "~/Content/elfinder/css/customtheme.css",
                "~/Content/MainPage.css"
                //"~/Content/elfinder/css/theme.css", 
                ));

            bundles.Add(new ScriptBundle("~/bundles/elfinder_jquery").Include(
                "~/Content/elfinder/js/jquery-1.7.1.min.js",
                "~/Content/elfinder/js/jquery-ui-1.8.11.min.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/elfinder_core").Include(
                "~/Content/elfinder/js/elFinder.js",
                "~/Content/elfinder/js/elFinder.version.js",
                "~/Content/elfinder/js/jquery.elfinder.js",
                "~/Content/elfinder/js/elFinder.resources.js",
                "~/Content/elfinder/js/elFinder.options.js",
                "~/Content/elfinder/js/elFinder.history.js",
                "~/Content/elfinder/js/elFinder.command.js",
                "~/Content/elfinder/js/i18n/elfinder.ru.js",
                "~/Content/elfinder/js/proxy/elFinderSupportVer1.js",
                "~/Content/elfinder/js/jquery.dialogelfinder.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/elfinder_ui").Include(
                "~/Content/elfinder/js/ui/overlay.js",
                "~/Content/elfinder/js/ui/workzone.js",
                "~/Content/elfinder/js/ui/navbar.js",
                "~/Content/elfinder/js/ui/dialog.js",
                "~/Content/elfinder/js/ui/tree.js",
                "~/Content/elfinder/js/ui/cwd.js",
                "~/Content/elfinder/js/ui/toolbar.js",
                "~/Content/elfinder/js/ui/button.js",
                "~/Content/elfinder/js/ui/bluebutton.js",
                "~/Content/elfinder/js/ui/uploadButton.js",
                "~/Content/elfinder/js/ui/viewbutton.js",
                "~/Content/elfinder/js/ui/searchbutton.js",
                "~/Content/elfinder/js/ui/sortbutton.js",
                "~/Content/elfinder/js/ui/morebutton.js",
                "~/Content/elfinder/js/ui/panel.js",
                "~/Content/elfinder/js/ui/contextmenu.js",
                "~/Content/elfinder/js/ui/path.js",
                "~/Content/elfinder/js/ui/stat.js",
                "~/Content/elfinder/js/ui/infobar.js",
                "~/Content/elfinder/js/ui/places.js",
                "~/Content/elfinder/js/ui/linkbutton.js",
                "~/Content/elfinder/js/ui/filterbutton.js",
                "~/Content/elfinder/js/ui/cryptxdialog.js",
                "~/Content/elfinder/js/ui/bottomaddpanel.js",
                "~/Content/elfinder/js/ui/multiplyaddbutton.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/elfinder_commands").Include(
                "~/Content/elfinder/js/commands/back.js",
                "~/Content/elfinder/js/commands/forward.js",
                "~/Content/elfinder/js/commands/reload.js",
                "~/Content/elfinder/js/commands/up.js",
                "~/Content/elfinder/js/commands/home.js",
                "~/Content/elfinder/js/commands/copy.js",
                //"~/Content/elfinder/js/commands/cut.js",
                "~/Content/elfinder/js/commands/paste.js",
                "~/Content/elfinder/js/commands/open.js",
                "~/Content/elfinder/js/commands/rm.js",
                "~/Content/elfinder/js/commands/info.js",
                "~/Content/elfinder/js/commands/duplicate.js",
                "~/Content/elfinder/js/commands/rename.js",
                "~/Content/elfinder/js/commands/help.js",
                "~/Content/elfinder/js/commands/getfile.js",
                "~/Content/elfinder/js/commands/mkdir.js",
                "~/Content/elfinder/js/commands/mkfile.js",
                "~/Content/elfinder/js/commands/upload.js",
                "~/Content/elfinder/js/commands/download.js",
                "~/Content/elfinder/js/commands/edit.js",
                "~/Content/elfinder/js/commands/quicklook.js",
                "~/Content/elfinder/js/commands/quicklook.plugins.js",
                "~/Content/elfinder/js/commands/extract.js",
                "~/Content/elfinder/js/commands/archive.js",
                "~/Content/elfinder/js/commands/search.js",
                "~/Content/elfinder/js/commands/view.js",
                "~/Content/elfinder/js/commands/resize.js",
                "~/Content/elfinder/js/commands/sort.js",
                "~/Content/elfinder/js/commands/netmount.js",
                "~/Content/elfinder/js/commands/more.js",
                "~/Content/elfinder/js/commands/infobarcmd.js",
                "~/Content/elfinder/js/commands/encrypt.js",
                "~/Content/elfinder/js/commands/decrypt.js",
                "~/Content/elfinder/js/commands/checksign.js",
                "~/Content/elfinder/js/commands/receivedmail.js",
                "~/Content/elfinder/js/commands/opensendpopup.js",
                "~/Content/elfinder/js/commands/decryptandchecksign.js",
                "~/Content/elfinder/js/commands/signandencrypt.js",
                "~/Content/elfinder/js/commands/add.js",
                "~/Content/elfinder/js/commands/cancel.js",
                "~/Content/elfinder/js/commands/cryptinfo.js",
                "~/Content/elfinder/js/commands/certdownload.js",
                "~/Content/elfinder/js/commands/filter.js",
                "~/Content/elfinder/js/commands/post.js",
                "~/Content/elfinder/js/commands/multiplyadd.js",
                //"~/Content/elfinder/js/commands/addressbook.js",
                "~/Content/elfinder/js/commands/sign.js"
                ));
        }
    }
}