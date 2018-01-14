using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Web;
using CryptxOnline.Web.AuthorizeService;

namespace CryptxOnline.Web.Identity
{
    public class LoggedUser : ClaimsPrincipal
    {
        public LoggedUser(ClaimsPrincipal principal): base(principal)
        {
         
        }

        public string Name
        {
            get { return this.FindFirst(ClaimTypes.Name).Value; }
        }
        public string AuthToken
        {
            get { return this.FindFirst("AuthToken").Value; }
        }
        public string FIO
        {
            get { return this.FindFirst("FIO").Value    ; }
        }
        public DateTime? RoleChangeDateTime
        {
            get
            {
                var date = this.FindFirst("RoleChangeDateTime").Value;
                if (string.IsNullOrEmpty(date))
                    return null;
                return DateTime.Parse(date);
            }
        }

        public UserStatuses Status
        {
            get
            {
                var val = this.FindFirst("Status").Value;
                var intVal= Convert.ToInt32(val);
                return (UserStatuses)intVal;
            }
        }

         
    }
}