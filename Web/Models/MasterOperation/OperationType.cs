namespace CryptxOnline.Web.Models.MasterOperation
{
    public enum OperationType
    {
        /// <summary>
        ///     Подпись
        /// </summary>
        Sign = 1,

        /// <summary>
        ///     Шифрование
        /// </summary>
        Encrypt = 2,

        /// <summary>
        ///     Проверка подписи
        /// </summary>
        SignVerify = 3,

        /// <summary>
        ///     Расшифровка
        /// </summary>
        Decrypt = 4
    }
}