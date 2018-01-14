using System;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Identity;

namespace CryptxOnline.Web.Controllers
{
    [System.Web.Mvc.AllowAnonymous]
    public class AsmController : BaseAnonymousController
    {
        public async Task<ActionResult> AppEntry()
        {
            if (Request.QueryString["action"] != null)
            {
                string action = Request.QueryString["action"];
                if (action == "forgotActivationCode" || action == "forgotPin"||action=="newRegistration")
                {
                    return RedirectToAction("GetTaxnetIdActivation", "Helper");
                }

                ViewBag.result = action;
            }
            Request.GetOwinContext().Authentication.SignOut("ApplicationCookie");
            if (Request.QueryString["otp"] != null)
            {
                //ServicePointManager.ServerCertificateValidationCallback =new RemoteCertificateValidationCallback(IgnoreCertificateErrorHandler);
                string otp = Request.QueryString["otp"];

                LoginResponse loginResponse = _authService.LoginToKobilDevice(otp);
                if (loginResponse.Token != Guid.Empty)
                {
                    Guid token = loginResponse.Token;

                    AppUser user = new AppUser(token);
                    UserInfoResponse userInfo = _authService.GetUserData(token);
                    ViewBag.userInfo = userInfo.User;
                    user.FIO = userInfo.User.Name;
                    user.City = userInfo.User.City;
                    user.RoleChangeDateTime = loginResponse.RoleChangeDateTime;
                    user.Status = userInfo.User.UserStatus;
                    var result = await userManager.CreateAsync(user);
                    if (result.Succeeded)
                    {
                        await SignIn(user, userInfo.User.UserRoles);
                    }
                    //FormsAuthentication.SetAuthCookie(token.ToString(), false);
                    Session["userId"] = user.Id;
                    return RedirectToAction("WebDavBrowser", "Default");
                }
                ViewBag.result = "Не найден пользователь Cryptogramm";
                //XmlSerializer serializer = new XmlSerializer(typeof(LoginResponse));
                //StringWriter sww = new StringWriter();
                //XmlWriter writer = XmlWriter.Create(sww);
                //serializer.Serialize(writer, response);
                //ViewBag.result = sww.ToString();
            }

            return View();
        }

        public ActionResult Login()
        {
            return View();
        }

        public static bool IgnoreCertificateErrorHandler(object sender,
            X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }
    }
}