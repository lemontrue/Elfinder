using System.Collections.Generic;
using ElFinder.CryptxService;


namespace CryptxOnline.Web.Helpers
{
    internal class CertificateInfoEqualityComparer : IEqualityComparer<CertificateInfo>
    {
        public bool Equals(CertificateInfo a, CertificateInfo b)
        {
            return a.Thumbprint.Equals(b.Thumbprint);
        }

        public int GetHashCode(CertificateInfo obj)
        {
            return 0;
        }
    }
}