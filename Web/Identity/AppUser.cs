using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using CryptxOnline.Web.AuthorizeService;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace CryptxOnline.Web.Identity
{
    public class AppUser : IdentityUser
    {
        public AppUser()
        {
            Id = Guid.NewGuid().ToString();
            UserName = Id;
        }

        public AppUser(Guid token)
        {
            Id = Guid.NewGuid().ToString();
            UserName = Id;
            Token = token;
        }

        public AppUser(AppUser user)
        {
            FIO = user.FIO;
            Id = user.Id;
            Token = user.Token;
            City = user.City;
            UserName = user.UserName;
        }

        public override sealed string Id { get; set; }
        public override sealed string UserName { get; set; }

        public Guid Token { get; private set; }
        public string City { get; set; }
        public string FIO { get; set; }
        public DateTime? RoleChangeDateTime { get; set; }
        public UserStatuses Status { get; set; }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<AppUser> manager)
        {
            var userIdentity = await manager.CreateIdentityAsync(this,DefaultAuthenticationTypes.ApplicationCookie);
            // Add custom user claims here
            userIdentity.AddClaim(new Claim("City", City));
            userIdentity.AddClaim(new Claim("AuthToken", Token.ToString()));
            userIdentity.AddClaim(new Claim("FIO", FIO));
            userIdentity.AddClaim(new Claim("Status", ((int)Status).ToString()));
            userIdentity.AddClaim(new Claim("RoleChangeDateTime", RoleChangeDateTime.ToString()));
            return userIdentity;
        }
    }
}