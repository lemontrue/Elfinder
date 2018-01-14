using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.MarkerActivationService;
using CryptxOnline.Web.Models.MarkerActivation;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class LogonModel:MarkerActivationModel
    {
        public MarkerStatus MarkerStatus { get; set; }
        public Guid CurrentMarkerId { get; set; }

    }
}