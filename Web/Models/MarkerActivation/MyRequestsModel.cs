using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.MarkerActivationService;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class MyRequestsModel:MarkerActivationModel
    {
        public List<GetMyCertificatesRequestsResponse.MyCertificateRequest> Requests { get; set; } 
    }
}