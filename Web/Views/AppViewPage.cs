using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.Identity;

namespace CryptxOnline.Web.Views
{
    public abstract class AppViewPage<TModel> : WebViewPage<TModel>
    {
        protected LoggedUser CurrentUser
        {
            get
            {
                return new LoggedUser(User as ClaimsPrincipal);
            }
        }

        protected int AssetsVersion
        {
            get
            {
                return 17;
            }
        }
    }

    public abstract class AppViewPage : AppViewPage<dynamic>
    {
    }
}