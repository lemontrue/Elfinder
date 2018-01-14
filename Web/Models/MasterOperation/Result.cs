using System.Collections.Generic;

namespace CryptxOnline.Web.Models.MasterOperation
{
    public class Result
    {
        public Result()
        {
            OperationResults = new List<OperationResult>();
        }

        public MasterException Exception { get; set; }
        public List<OperationResult> OperationResults { get; set; }
    }
}