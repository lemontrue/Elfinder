using System;
using System.Collections.Generic;

namespace CryptxOnline.Web.Helpers
{
    public class MyNavigation
    {
        public MyNavigation()
        {
            Navigations = new List<NavElement>();

            Navigations.Add(new NavElement
            {
                Depth = 0,
                Name = "Cryptogramm",
                Action = "WebDavBrowser",
                Controller = "Default",
                IsUrl = true
            });
        }

        public IList<NavElement> Navigations { get; set; }
    }

    public class NavElement
    {
        public string Name { get; set; }
        public string Action { get; set; }
        public string Controller { get; set; }
        public Guid UserId { get; set; }
        public int Depth { get; set; }
        public bool IsUrl { get; set; }
    }
}