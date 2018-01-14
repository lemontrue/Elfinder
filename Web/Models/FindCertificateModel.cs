using System.Collections.Generic;
using CryptxOnline.Web.Helpers;

namespace CryptxOnline.Web.Models
{
    public class FindCertificateModel
    {
        public string SearchString { get; set; }
        public bool IsActive { get; set; }
        public List<CertificateInfoContactAdd> Certificates { get; set; }
    }
}