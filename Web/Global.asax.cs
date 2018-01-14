using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using CryptxOnline.Web.App_Start;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Controllers;
using CryptxOnline.Web.Identity;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;


namespace CryptxOnline.Web
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(null, "connector", new { controller = "Files", action = "Index" });
            routes.MapRoute(null, "Thumbnails/{tmb}",
                new { controller = "Files", action = "Thumbs", tmb = UrlParameter.Optional });


            routes.MapRoute(
                "Settings", // Route name
                "Settings/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "Settings", action = "Index", id = UrlParameter.Optional }
                );

            routes.MapRoute(
                "AddressBook", // Route name
                "AddressBook/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional }
                );
            routes.MapRoute(
                "Administration", // Route name
                "Administration/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "Administration", action = "Index", id = UrlParameter.Optional }
                );
            routes.MapRoute(
                "PassRecovery", // Route name
                "PassRecovery/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "PassRecovery", action = "Index", id = UrlParameter.Optional }
                );
            routes.MapRoute(
                "Registration", // Route name
                "Registration/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "Registration", action = "Index", id = UrlParameter.Optional }
                );
            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                //new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional } // Parameter defaults
                new { controller = "Helper", action = "Landing", id = UrlParameter.Optional }
                );
            routes.IgnoreRoute("{*favicon}", new { favicon = @"(.*/)?favicon.ico(/.*)?" });
        }

        protected void Application_Start()
        {
            new AppDbContext().Seed();
            AreaRegistration.RegisterAllAreas();
            RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        }

        protected void Application_End()
        {
            new AppDbContext().Seed();
            //Session.Abandon();
            //if (Request.Cookies[".DSSAUTH"] != null)
            //{
            //    HttpCookie myCookie = new HttpCookie(".DSSAUTH");
            //    myCookie.Expires = DateTime.Now.AddDays(-1d);
            //    Response.Cookies.Add(myCookie);
            //}
        }

        protected void Session_End(object sender, EventArgs e)
        {
            
            if ((Session["userId"] != null))
            {
                AppUserManager usermanager = new AppUserManager(new UserStore<AppUser>(new AppDbContext()));
                var user = usermanager.FindById(Session["userId"].ToString());
                var deleteresult = usermanager.DeleteAsync(user);

                var token = user.Token;
                new AuthorizeServiceClient().DeactivateToken(token);
            }
        }


        //protected void Application_BeginRequest()
        //{
        //    if (Request.IsLocal)
        //    {
        //        MiniProfiler.Start();
        //        MiniProfiler.Current.Step("Application_BeginRequest");
        //    }
        //}
        //protected void Application_EndRequest()
        //{
        //    MiniProfiler.Current.Step("Application_EndRequest");
        //    MiniProfiler.Stop();
        //}

        protected void Application_Error1(object sender, EventArgs e)
        {
            HttpContext ctx = HttpContext.Current;
            Exception ex = ctx.Server.GetLastError();
            ctx.Response.Clear();

            RequestContext rc = ((MvcHandler)ctx.CurrentHandler).RequestContext;
            IController controller = new DefaultController();
            // Тут можно использовать любой контроллер, например тот что используется в качестве базового типа
            var context = new ControllerContext(rc, (ControllerBase)controller);

            var viewResult = new ViewResult();

            var httpException = ex as HttpException;
            if (httpException != null)
            {
                switch (httpException.GetHttpCode())
                {
                    case 404:
                        viewResult.ViewName = "Error404";
                        break;

                    case 500:
                        viewResult.ViewName = "Error500";
                        break;

                    default:
                        viewResult.ViewName = "Error.cshtml";
                        break;
                }
            }
            else
            {
                viewResult.ViewName = "Index";
            }

            viewResult.ViewData.Model = new HandleErrorInfo(ex, context.RouteData.GetRequiredString("controller"),
                context.RouteData.GetRequiredString("action"));
            viewResult.ExecuteResult(context);
            ctx.Server.ClearError();
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            HttpContext ctx = HttpContext.Current;
            Exception ex = ctx.Server.GetLastError();
            ctx.Response.Clear();
            RequestContext rc = ((MvcHandler)ctx.CurrentHandler).RequestContext;

            rc.RouteData.Values["action"] = "Index";

            // TODO: distinguish between 404 and other errors if needed

            rc.RouteData.Values["controller"] = "Error";
            IControllerFactory factory = ControllerBuilder.Current.GetControllerFactory();
            IController controller = factory.CreateController(rc, "Error");
            controller.Execute(rc);
            ctx.Server.ClearError();
            //}
            //последняя ошибка
            Exception exception = Server.GetLastError();
            if (exception == null)
                return;
            //TODO обработка ошибки
            //переход на страницу ошибок
            //Response.Redirect("~/Error/Index?ex=" + exception.Message);
            //Response.RedirectToRoute("Default", new { controller = "Error",action="Index" });
        }
    }
}