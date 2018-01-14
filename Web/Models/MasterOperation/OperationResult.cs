namespace CryptxOnline.Web.Models.MasterOperation
{
    public class OperationResult
    {
        public OperationResult(OperationType operationType)
        {
            OperationType = operationType;
        }

        /// <summary>
        ///     Тип операции
        /// </summary>
        public OperationType OperationType { get; private set; }

        /// <summary>
        ///     Ошибка
        /// </summary>
        public MasterException Exception { get; set; }
    }
}