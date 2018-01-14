using CryptxOnline.Web.Identity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace CryptxOnline.Web.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<CryptxOnline.Web.Identity.AppDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(CryptxOnline.Web.Identity.AppDbContext context)
        {
            //context.Users.AddOrUpdate(x=>x.UserName,new AppUser(Guid.Empty));
            var manager = new AppUserManager(new UserStore<AppUser>());
            var user = new AppUser(Guid.NewGuid());
            user.City = "Migration";
            user.FIO = "Migration";
            user.RoleChangeDateTime = DateTime.Now;
                manager.Create(user);
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
            //    context.People.AddOrUpdate(
            //      p => p.FullName,
            //      new Person { FullName = "Andrew Peters" },
            //      new Person { FullName = "Brice Lambson" },
            //      new Person { FullName = "Rowan Miller" }
            //    );
            //
        }
    }
}
