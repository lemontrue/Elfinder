using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Identity;
using CryptxOnline.Web.MarkerActivationService;

namespace CryptxOnline.Web.Controllers
{
    [ControllerAuthorize("User, GroupAdmin, SysAdmin", "Confirmed")]
    public class BaseController : BaseAnonymousController
    {
        internal MarkerActivationServiceClient _markerService = new MarkerActivationServiceClient();

        public LoggedUser CurrentUser
        {
            get
            {
                return new LoggedUser(this.User as ClaimsPrincipal);
            }
        }

        /// <summary>
        ///     сервис работы с крипто-методами
        /// </summary>
        internal readonly CryptxServiceClient _cryptxService = new CryptxServiceClient();

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (filterContext.Result is RedirectToRouteResult || filterContext.Result is RedirectResult)
            {
                string resultAction = "";
                if (filterContext.Result is RedirectToRouteResult)
                    resultAction = ((RedirectToRouteResult)(filterContext.Result)).RouteValues["action"].ToString();
                if (filterContext.Result is RedirectResult)
                    resultAction = ((RedirectResult)(filterContext.Result)).Url;
                string retUrl = Request.RequestContext.HttpContext.Request.Url.ToString();
                retUrl = retUrl.Replace("&amp;", "&");
                if (resultAction.Contains("LogOff"))
                {
                    Session["retUrl"] = retUrl;
                }
            }
        }

    }
}