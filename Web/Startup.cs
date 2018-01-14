using System;
using System.Threading.Tasks;
using CryptxOnline.Web.Identity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Owin;

[assembly: OwinStartup(typeof(CryptxOnline.Web.Startup))]

namespace CryptxOnline.Web
{
    public class Startup
    {
        public static Func<UserManager<AppUser>> UserManagerFactory { get; private set; }

        public void Configuration(IAppBuilder app)
        {
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/login"),
                Provider = new CookieAuthenticationProvider()
                {
                    OnApplyRedirect = ctx =>
                    {
                        if (!Identity.Helper.IsAjaxRequest(ctx.Request))
                        {
                            ctx.Response.Redirect(ctx.RedirectUri);
                        }
                        //ctx.Response.StatusCode = (int)(System.Net.HttpStatusCode.Unauthorized);
                    }
                },
                AuthenticationMode = AuthenticationMode.Active

            });
            UserManagerFactory = () =>
            {
                var usermanager = new AppUserManager(
                                    new UserStore<AppUser>(new AppDbContext()));
                // allow alphanumeric characters in username
                usermanager.UserValidator = new UserValidator<AppUser>(usermanager)
                {
                    AllowOnlyAlphanumericUserNames = false
                };
                usermanager.ClaimsIdentityFactory = new AppUserClaimsIdentityFactory();
                return usermanager;
            };
        }

    }
}
