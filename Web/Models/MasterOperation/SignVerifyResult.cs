using System.Collections.Generic;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models.MasterOperation
{
    public class SignVerifyResult : OperationResult
    {
        public SignVerifyResult() : base(OperationType.SignVerify)
        {
        }

        public string MainStatus { get; set; }
        public List<CertificateStatus> CertificateStatuses { get; set; }
        public string SignedFile { get; set; }
        public string DataFile { get; set; }
        public bool Detached { get; set; }

        public byte[] SignedFileBytes { get; set; }
        public byte[] DataFileBytes { get; set; }
    }
}