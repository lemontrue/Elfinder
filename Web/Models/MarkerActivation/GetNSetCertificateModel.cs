using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class GetNSetCertificateModel:MarkerActivationModel
    {
        public MarkerActivationService.CertificateInfo CertificateInfo { get; set; }
    }
}