using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;

namespace CryptxOnline.Web.Identity
{
    public class AppUserManager : UserManager<AppUser>
    {
        public AppUserManager(IUserStore<AppUser> store)
            : base(store)
        {
            PasswordValidator = new MinimumLengthValidator(0);
            UserValidator = new UserValidator<AppUser>(this)
            {
                AllowOnlyAlphanumericUserNames = true,
                RequireUniqueEmail = false
            };

        }

        public override Task<AppUser> FindAsync(string userName, string password)
        {
            return base.FindAsync(userName, password);
        }
        public override Task<IdentityResult> CreateAsync(AppUser user)
        {
            return base.CreateAsync(user);
        }
        public override Task<IdentityResult> DeleteAsync(AppUser user)
        {

            return base.DeleteAsync(user);
        }
    }
}