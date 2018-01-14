using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.RegistrationService;

namespace CryptxOnline.Web.Models
{
    public class RegistrationResponseModel
    {
        public RegistrationModel Model { get; set; }
        public RegistrationResponse RegReponse { get; set; }

    }
}