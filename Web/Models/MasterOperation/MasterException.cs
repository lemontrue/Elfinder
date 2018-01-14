using System;

namespace CryptxOnline.Web.Models.MasterOperation
{
    /// <summary>
    ///     Ошибка для Мастера
    /// </summary>
    public class MasterException
    {
        public MasterException(int code, string customMessage, Exception exception)
        {
            Code = code;
            Message = customMessage;
            Exception = exception;
        }

        /// <summary>
        ///     Код ошибки
        /// </summary>
        public int Code { get; private set; }

        /// <summary>
        ///     Дополнительное сообщение
        /// </summary>
        public string Message { get; private set; }

        /// <summary>
        ///     Ошибка
        /// </summary>
        public Exception Exception { get; set; }
    }
}