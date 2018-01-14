using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity.EntityFramework;
using NLog;

namespace CryptxOnline.Web.Identity
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        private readonly Logger _logger = LogManager.GetLogger("AppDbContext");
        public AppDbContext()
            : base("DefaultConnection")
        {
            this.Database.Log = l => _logger.Info(l);
        }

        public void Seed()
        {
            try
            {
                if (this.Database.Exists())
                {

                }
                else
                {
                    Database.Create();
                }
            }
            catch (Exception ex)
            {
                
                throw;
            }
            
        }
    }
}