using System;

namespace CryptxOnline.Web.Helpers
{
    public class CertificateInfoContactAdd
    {
        public Guid CertificateId { get; set; }
        public bool IsMyCert { get; set; }
        public string Thumbprint { get; set; }
        public string FriendlyName { get; set; }
        public string SubjectName { get; set; }
        public string TimeMessage { get; set; }
        public string Status { get; set; }
        public string Organization { get; set; }
        public string IssureName { get; set; }
        public bool IsTest { get; set; }
    }
}