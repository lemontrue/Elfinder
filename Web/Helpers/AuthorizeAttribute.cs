using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.Providers.Entities;

namespace CryptxOnline.Web.Helpers
{
    public class DefaultAuthorizeAttribute : AuthorizeAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var action = filterContext.ActionDescriptor;
            if (action.IsDefined(typeof(OverrideAuthorizeAttribute), true)) return;

            base.OnAuthorization(filterContext);
        }
        protected override void HandleUnauthorizedRequest(System.Web.Mvc.AuthorizationContext filterContext)
        {
            //пользователь авторизовался
            if (filterContext.HttpContext.Request.IsAuthenticated)
            {
                //нет доступа к чему-либо
                if (filterContext.HttpContext.Request.Path.ToLower().Contains("webdavbrowser"))
                {
                    filterContext.Result = new RedirectResult("/Default/WebDavBrowser");
                }
                else
                {
                    if (!filterContext.HttpContext.Request.Path.ToLower().Contains("profile") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("certificate") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("check") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("change") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("resend"))
                        filterContext.Result = new RedirectResult("/Default/MyProfile");
                }
            }
            else
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
        }

    }

    //[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class OverrideAuthorizeAttribute : System.Web.Mvc.AuthorizeAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);
        }

        protected override void HandleUnauthorizedRequest(System.Web.Mvc.AuthorizationContext filterContext)
        {
            //пользователь авторизовался
            if (filterContext.HttpContext.Request.IsAuthenticated)
            {
                //нет доступа к чему-либо
                if (filterContext.HttpContext.Request.Path.ToLower().Contains("webdavbrowser"))
                {
                    filterContext.Result = new RedirectResult("/Default/WebDavBrowser");
                }
                else
                {
                    if (!filterContext.HttpContext.Request.Path.ToLower().Contains("profile") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("certificate") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("check") &&
                        !filterContext.HttpContext.Request.Path.ToLower().Contains("change"))
                        filterContext.Result = new RedirectResult("/Default/MyProfile");
                }
            }
            else
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
        }
    }
}