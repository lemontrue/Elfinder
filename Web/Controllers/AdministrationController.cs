using System;
using System.Linq;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models;

namespace CryptxOnline.Web.Controllers
{
    [MyAuthorize("SysAdmin,GroupAdmin","Confirmed")]
    public class AdministrationController : BaseController
    {

        public ActionResult Index()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var model = new AdminModel();
            var navigation = new MyNavigation();
            navigation.Navigations.Add(new NavElement
            {
                Depth = 1,
                Name = "Администрирование",
                Action = "Index",
                Controller = "Administration",
                IsUrl = true
            });
            navigation.Navigations.Add(new NavElement
            {
                Depth = 2,
                Name = "Учетные записи",
                Action = "",
                Controller = "",
                IsUrl = false
            });


            var userInfo = (UserInfo) Session["userInfo"];
            ViewBag.userInfo = userInfo;

            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();

            AdminInfoResponse response = _cryptxService.GetGroupUsers("", AdminSort.LoginASC, token);

            if (response.Exception == null)
            {
                model.GroupUserInfos = response.GroupUserInfos;
                return View(model);
            }
            throw response.Exception;
        }

        /// <summary>
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public ActionResult Index(AdminModel model)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var navigation = new MyNavigation();
            navigation.Navigations.Add(new NavElement
            {
                Depth = 1,
                Name = "Администрирование",
                Action = "Index",
                Controller = "Administration",
                IsUrl = true
            });
            navigation.Navigations.Add(new NavElement
            {
                Depth = 2,
                Name = "Учетные записи",
                Action = "",
                Controller = "",
                IsUrl = false
            });


            var userInfo = (UserInfo) Session["userInfo"];
            ViewBag.userInfo = userInfo;

            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();

            AdminInfoResponse response = _cryptxService.GetGroupUsers(model.SearchString, model.AdminSort, token);

            if (response.Exception == null)
            {
                model.GroupUserInfos = response.GroupUserInfos;
                return View(model);
            }
            throw response.Exception;
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            //if (token  == Guid.Empty)
            //{
            //    filterContext.Result = RedirectToAction("LogOff", "Account");
            //    return;
            //}

            if (Session["userInfo"] == null)
            {
                if (token != Guid.Empty)
                {
                    UserInfoResponse curUser = _authService.GetUserData(token);
                    Session["userInfo"] = curUser.User;
                }
            }
        }

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (filterContext.Result is RedirectToRouteResult)
            {
                string resultAction =
                    ((RedirectToRouteResult) (filterContext.Result)).RouteValues["action"].ToString();
                string retUrl = Request.RequestContext.HttpContext.Request.Url.ToString();
                retUrl = retUrl.Replace("&amp;", "&");
                if (resultAction == "LogOff")
                {
                    Session["retUrl"] = retUrl;
                }
            }


            //TODO здесь можно поймать редирект при логине
        }
    }
}