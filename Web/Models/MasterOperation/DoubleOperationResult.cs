using System.Collections.Generic;

namespace CryptxOnline.Web.Models.MasterOperation
{
    /// <summary>
    ///     Элемент результата двойной операции
    /// </summary>
    public class DoubleOperationResult
    {
        public DoubleOperationResult()
        {
            OperationResults = new List<DoubleResult>();
        }

        /// <summary>
        ///     глобальная ошибка
        /// </summary>
        public MasterException Exception { get; set; }

        /// <summary>
        ///     Результат операций
        /// </summary>
        public List<DoubleResult> OperationResults { get; set; }
    }

    public class DoubleResult
    {
        public OperationResult FirsOperationResult { get; set; }
        public OperationResult SecondOperationResult { get; set; }
    }
}