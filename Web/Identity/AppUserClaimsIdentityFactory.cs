using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.Identity;

namespace CryptxOnline.Web.Identity
{
    public class AppUserClaimsIdentityFactory : ClaimsIdentityFactory<AppUser>
    {
        public async Task<ClaimsIdentity> CreateAsync(
            UserManager<AppUser> manager,
            AppUser user,
            string authenticationType)
        {
            try
            {
                var identity = await base.CreateAsync(manager, user, authenticationType);
                identity.AddClaim(new Claim("City", user.City));
                identity.AddClaim(new Claim("AuthToken", user.Token.ToString()));
                identity.AddClaim(new Claim("FIO", user.FIO));
                identity.AddClaim(new Claim("Status", ((int)user.Status).ToString())); 
                identity.AddClaim(new Claim("RoleChangeDateTime", user.RoleChangeDateTime.ToString()));

                return identity;
            }
            catch (Exception ex)
            {

                throw ex;
            }

        }

        public ClaimsIdentity Create(
            UserManager<AppUser> manager,
            AppUser user,
            string authenticationType)
        {
            Task<ClaimsIdentity> task = base.CreateAsync(manager, user, authenticationType);
            ClaimsIdentity identity = task.Result;
            identity.AddClaim(new Claim("City", user.City));
            identity.AddClaim(new Claim("AuthToken", user.Token.ToString()));
            identity.AddClaim(new Claim("FIO", user.FIO));
            identity.AddClaim(new Claim("Status", ((int)user.Status).ToString())); 
            identity.AddClaim(new Claim("RoleChangeDateTime", user.RoleChangeDateTime.ToString()));

            return identity;
        }
    }
}