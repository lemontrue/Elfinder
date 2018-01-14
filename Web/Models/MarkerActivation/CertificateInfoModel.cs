using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.MarkerActivationService;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class CertificateInfoModel:MarkerActivationModel
    {
        public List<GetCertificateInfoResponse.CertInfo> ShowingInfo { get; set; }
    }
}