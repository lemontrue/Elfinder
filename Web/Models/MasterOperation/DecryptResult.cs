namespace CryptxOnline.Web.Models.MasterOperation
{
    public class DecryptResult : OperationResult
    {
        public DecryptResult() : base(OperationType.Decrypt)
        {
        }

        public string EncryptedFile { get; set; }
        public string DecryptedFile { get; set; }
    }
}