namespace CryptxOnline.Web.Models.MasterOperation
{
    public class SignResult : OperationResult
    {
        public SignResult() : base(OperationType.Sign)
        {
        }

        public string UnsignedFile { get; set; }
        public string SignedFile { get; set; }
    }
}