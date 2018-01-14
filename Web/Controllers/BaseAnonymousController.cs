using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Identity;
using CryptxOnline.Web.PasswordRecoveryService;
using CryptxOnline.Web.RegistrationService;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using ServiceResponse = CryptxOnline.Web.AuthorizeService.ServiceResponse;

//using StackExchange.Profiling;

namespace CryptxOnline.Web.Controllers
{
    public class BaseAnonymousController : Controller
    {
        /// <summary>
        /// сервис авторизации
        /// </summary>
        internal readonly AuthorizeServiceClient _authService = new AuthorizeServiceClient();
        /// <summary>
        /// сервис работы с крипто-методами
        /// </summary>
        internal readonly RegistrationServiceClient _registrationService = new RegistrationServiceClient();
        /// <summary>
        /// сервис восстановления пароля
        /// </summary>
        internal readonly PasswordRecoveryServiceClient _passwordRecoveryService = new PasswordRecoveryServiceClient();



         internal readonly UserManager<AppUser> userManager;
       
        public BaseAnonymousController(): this(Startup.UserManagerFactory.Invoke())
        {
            System.Net.ServicePointManager.ServerCertificateValidationCallback += (se, cert, chain, sslerror) => { return true; };
            //MiniProfiler.Current.Step("BaseAnonymousController(): this(Startup.UserManagerFactory.Invoke()");
        }
        public BaseAnonymousController(UserManager<AppUser> userManager)
        {
            System.Net.ServicePointManager.ServerCertificateValidationCallback += (se, cert, chain, sslerror) => { return true; };
            this.userManager = userManager;
            //MiniProfiler.Current.Step("BaseAnonymousController(UserManager<AppUser> userManager)");
        }
        
        /// <summary>
        /// проверка токена авторизации на клиентской части
        /// </summary>
        /// <param name="user"></param>
        /// <param name="_sc"></param>
        /// <returns></returns>
        public static Guid CheckSessionAuthState(LoggedUser user, AuthorizeServiceClient _sc)
        {
            if (user == null)
            {
                return Guid.Empty;
            }

            CheckTokenResponse response = _sc.CheckToken(new Guid(user.AuthToken), user.RoleChangeDateTime);

            if (response.Roles != null && response.Roles.Count != 0)
            {
                //пока, выходим из системы
                return Guid.Empty;
                var claimsUser = (ClaimsIdentity)user.Identity;
                //удаляем текущие роли
                List<Claim> userRoles = claimsUser.FindAll(ClaimTypes.Role).ToList();
                foreach (Claim userRole in userRoles)
                {
                    claimsUser.RemoveClaim(userRole);
                }

                foreach (UserRoles dicUserRole in response.Roles)
                {
                    Claim newRole = new Claim(ClaimTypes.Role, dicUserRole.ToString());
                    claimsUser.AddClaim(newRole);
                }
                
            }
            if (!response.OK)
                return Guid.Empty;
            return new Guid(user.AuthToken);
        }


        internal async Task SignIn(AppUser user, List<UserRoles> roles)
        {
            AppUserClaimsIdentityFactory factory = new AppUserClaimsIdentityFactory();

            var identity = factory.Create(userManager,
                user, DefaultAuthenticationTypes.ApplicationCookie);
            foreach (UserRoles role in roles)
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role.ToString()));
            }
            
            GetAuthenticationManager().SignIn(new AuthenticationProperties() { IsPersistent = true }, identity);
        }

        /// <summary>
        ///     Очистка данных сессии по авторизации
        /// </summary>
        internal void ClearSession()
        {
            if (Request.Cookies[".DSSAUTH"] != null)
            {
                var myCookie = new HttpCookie(".DSSAUTH");
                myCookie.Expires = DateTime.Now.AddDays(-1d);
                Response.Cookies.Add(myCookie);
            }
        }


        private IAuthenticationManager GetAuthenticationManager()
        {
            var ctx = Request.GetOwinContext();
            return ctx.Authentication;
        }

        [AllowAnonymous]
        public ActionResult SendToSupport(string name, string phone, string email, string message)
        {
            ServiceResponse response = _authService.SendToSupport(name, phone, email, message);
            return Json(response,JsonRequestBehavior.AllowGet);
            //return Json()
        }


        protected override void OnException(ExceptionContext filterContext)
        {
            //if (filterContext.ExceptionHandled)
            //{
            //    return;
            //}
            Session["errorMsg"] = filterContext.Exception;
            filterContext.Result = new RedirectResult("/Error/Index");
            //filterContext.ExceptionHandled = true;
        }
    }
}