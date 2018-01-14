namespace CryptxOnline.Web.Models.MasterOperation
{
    public class EncryptResult : OperationResult
    {
        public EncryptResult() : base(OperationType.Encrypt)
        {
        }

        public string UnencryptedFile { get; set; }
        public string EncryptedFile { get; set; }
    }
}