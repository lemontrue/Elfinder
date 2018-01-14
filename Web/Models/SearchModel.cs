using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models
{
    public class SearchModel
    {
        public SearchModel()
        {
            Active = true;
        }

        /// <summary>
        ///     строка поиска
        /// </summary>
        [DisplayName("Текст для поиска")]
        [StringLength(50, MinimumLength = 5, ErrorMessage = "Строка поиска должна быть минимум 5 символов")]
        public string SearchText { get; set; }

        /// <summary>
        ///     Выбираем активные
        /// </summary>
        [DisplayName("Только действующие сертификаты")]
        [DefaultValue(true)]
        public bool Active { get; set; }

        /// <summary>
        ///     Результат поиска
        /// </summary>
        public List<CertificateInfo> ResultCertificates { get; set; }

        public int ViewCount { get; set; }
        public int ResultLength { get; set; }
    }
}