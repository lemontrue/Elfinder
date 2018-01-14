using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.Identity;


namespace CryptxOnline.Web.Helpers
{
    public class ControllerAuthorizeAttribute : AuthorizeAttribute
    {
        private string[] allowedStatuses;
        private string[] allowedRoles;

        public ControllerAuthorizeAttribute(string roles, string statuses)
        {
            allowedStatuses = statuses.Replace(" ", "").Split(',');
            allowedRoles = roles.Replace(" ", "").Split(',');
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            return Status(httpContext) && Role(httpContext);
        }


        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var action = filterContext.ActionDescriptor;
            if (action.IsDefined(typeof(MyAuthorizeAttribute), true))
                return;

            base.OnAuthorization(filterContext);
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            //пользователь авторизовался
            if (filterContext.HttpContext.Request.IsAuthenticated)
            {
                //нет доступа к чему-либо
                if (filterContext.HttpContext.Request.Path.ToLower().Contains("webdavbrowser"))
                {
                    filterContext.Result = new RedirectResult("/Default/MyProfile");
                }
                else
                {
                    if (filterContext.HttpContext.Request.Path.ToLower() == "/")
                        filterContext.Result = new RedirectResult("/Default/MyProfile");
                    else
                        filterContext.Result = new RedirectResult("/Default/WebDavBrowser");
                }
            }
            else
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
        }



        private bool Status(HttpContextBase httpContext)
        {
            LoggedUser user = new LoggedUser(httpContext.User as ClaimsPrincipal);

            return allowedStatuses.Contains(user.Status.ToString());
        }
        private bool Role(HttpContextBase httpContext)
        {
            if (allowedRoles.Length > 0)
            {
                for (int i = 0; i < allowedRoles.Length; i++)
                {
                    if (httpContext.User.IsInRole(allowedRoles[i]))
                        return true;
                }
                return false;
            }
            return true;
        }

    }


    public class MyAuthorizeAttribute : System.Web.Mvc.AuthorizeAttribute
    {
        private string[] allowedStatuses;
        private string[] allowedRoles;

        public MyAuthorizeAttribute(string roles, string statuses)
        {
            allowedStatuses = statuses.Replace(" ", "").Split(',');
            allowedRoles = roles.Replace(" ", "").Split(',');
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            return Status(httpContext) && Role(httpContext);
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            //пользователь авторизовался
            if (filterContext.HttpContext.Request.IsAuthenticated)
            {
                //нет доступа к чему-либо
                if (filterContext.HttpContext.Request.Path.ToLower().Contains("webdavbrowser"))
                {
                    filterContext.Result = new RedirectResult("/Default/MyProfile");

                }
                else
                {
                    if (filterContext.HttpContext.Request.Path.ToLower().Contains("myprofile"))
                    {
                        filterContext.Result = new RedirectResult("/Account/login");
                    }
                    else
                    {
                        filterContext.Result = new RedirectResult("/Default/WebDavBrowser");
                    }


                    //if (!filterContext.HttpContext.Request.Path.ToLower().Contains("profile") &&
                    //    !filterContext.HttpContext.Request.Path.ToLower().Contains("certificate") &&
                    //    !filterContext.HttpContext.Request.Path.ToLower().Contains("check") &&
                    //    !filterContext.HttpContext.Request.Path.ToLower().Contains("change") &&
                    //    !filterContext.HttpContext.Request.Path.ToLower().Contains("resend"))
                }
            }
            else
            {
                base.HandleUnauthorizedRequest(filterContext);
            }
        }

        private bool Status(HttpContextBase httpContext)
        {
            LoggedUser user = new LoggedUser(httpContext.User as ClaimsPrincipal);

            return allowedStatuses.Contains(user.Status.ToString());
        }
        private bool Role(HttpContextBase httpContext)
        {
            if (allowedRoles.Length > 0)
            {
                for (int i = 0; i < allowedRoles.Length; i++)
                {
                    if (httpContext.User.IsInRole(allowedRoles[i]))
                        return true;
                }
                return false;
            }
            return true;
        }

    }
}