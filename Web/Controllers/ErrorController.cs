using System;
using System.ServiceModel;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Helpers;
using NLog;

namespace CryptxOnline.Web.Controllers
{
    [System.Web.Mvc.AllowAnonymous]
    public class ErrorController : BaseController
    {
        private readonly Logger _logger = LogManager.GetLogger("ErrorController");

        public ActionResult Index()
        {
            try
            {
                Guid token = CheckSessionAuthState(CurrentUser, _authService);
                if (token != Guid.Empty)
                {
                    UserInfoResponse curUser = _authService.GetUserData(token);
                    ViewBag.login = curUser.User.Login;
                }
            }
            catch (Exception)
            {
            }
            
            if (Session["errorMsg"] is Exception)
            {
                ViewBag.Error = Session["errorMsg"];
                Session.Remove("errorMsg");
                return View();
            }
            if (HttpContext.Error != null)
            {
                _logger.Error(HttpContext.Error);

                var httpException = HttpContext.Error as HttpException;
                if (httpException != null)
                {
                    switch (httpException.GetHttpCode())
                    {
                        case 404:
                            ViewBag.HttpCode = 404;
                            break;

                        case 500:
                            ViewBag.HttpCode = 500;
                            break;

                        default:
                            break;
                    }
                }
                if (HttpContext.Error is EndpointNotFoundException)
                {
                    var err =
                        (EndpointNotFoundException) HttpContext.Error;
                    ViewBag.Error = new Exception("Cервис временно недоступен, зайдите позже");
                    return View();
                }
                ViewBag.Error = HttpContext.Error;
                return View();
            }
            ViewBag.Error = new Exception("Нет ошибок");
            return View();
        }

        //public ActionResult GetFile()
        //{
        //    FileStream fs = new FileStream(@"c:\2.txt", FileMode.Open, FileAccess.Read);
        //    byte[] arrF = new byte[fs.Length];
        //    fs.Read(arrF, 0, (int)fs.Length);
        //    fs.Close();

        //    Settings settings = Helpers.SettingInitializer.InitializeSettings();
        //    //тестовые данные
        //    settings._SignatureSettings.SignerCertificate1 = "17717DD00DEDEE917442D17E3A575B5EA9FE9066";
        //    settings._SignatureSettings._EncodingType = EncodingType.Base64;
        //    settings._SignatureSettings.KeysetPassword = "123";

        //    CryptoOperationResponse response = _csc.CryptoOperation(arrF, settings, new Guid("b64eed3d-d69e-4311-aee7-0495abda0aa1"));
        //    return File(response.OperatedFile, "application/octet-stream", settings._SignatureSettings._EncodingType.ToString()+".p7s");

        //}
    }
}