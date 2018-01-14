using System;
using System.Collections.Generic;
using System.Web.UI.WebControls;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;

namespace CryptxOnline.Web.Models
{
    public class WizardModel
    {
        #region Member

        public Guid Id { get; set; }

        public bool CanBack { get; set; }
        public bool CanNext { get; set; }

        /// <summary>
        ///     доступно проведение крипто-операции
        /// </summary>
        public bool CanmakeOperation { get; set; }

        public OperationType Type { get; set; }

        public UserInfoW UserInfo { get; set; }

        /// <summary>
        ///     шаг выбор профиля
        /// </summary>
        public ProfileSelect ProfileSelect { get; set; }

        /// <summary>
        ///     шаг загрузка файла
        /// </summary>
        public FileUpload FileUpload { get; set; }

        /// <summary>
        ///     шаг параметров подписи
        /// </summary>
        public SigningOptions SigningOptions { get; set; }

        /// <summary>
        ///     шаг выбора сертификатов
        /// </summary>
        public SignersCertificate SignersCertificate { get; set; }

        public SignVerificationOptions SignVerificationOptions { get; set; }

        /// <summary>
        ///     Настройки для будущего маппинг в КриптоКом
        /// </summary>
        public Settings Settings { get; set; }

        //public string DownloadedFileName { get; set; }
        //public List<string> DownloadedFileNames { get; set; }
        /// <summary>
        ///     имя загруженного файла
        /// </summary>
        /// <summary>
        ///     Ссылка на закаченый файл
        /// </summary>
        //public string DownloadedFileUri { get; set; }
        //public List<string> DownloadedFileUris { get; set; }
        public List<DownloadedFile> DownloadedFiles { get; set; }

        /// <summary>
        ///     Ссылка на результирующий файл
        /// </summary>
        public string OperatedFileUri { get; set; }

        public List<DataOperationResult> OperatedFilesInfo { get; set; }

        /// <summary>
        ///     имя мастера
        /// </summary>
        public string WizardName { get; set; }

        /// <summary>
        ///     название операции
        /// </summary>
        public string OperationName { get; set; }

        /// <summary>
        ///     Текст на кнопке операции
        /// </summary>
        public string MakeOperationText { get; set; }

        public DecryptionOptions DecryptionOptions { get; set; }

        /// <summary>
        ///     шаги мастера
        /// </summary>
        public List<CustomWizardStep> CustomWizardSteps { get; set; }

        /// <summary>
        ///     текущий шаг
        /// </summary>
        public CustomWizardStep CustomWizardStep { get; set; }

        public DateTime CreationTime { get; private set; }

        public string EmailSendMessage { get; set; }

        #endregion

        /// <summary>
        ///     инициализация визарда
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cryptxService"></param>
        /// <param name="authService"></param>
        /// <param name="token"></param>
        public WizardModel(Guid id, CryptxServiceClient cryptxService, AuthorizeServiceClient authService, Guid token)
        {
            ProfileSelect = new ProfileSelect();
            CanBack = true;
            CanNext = true;
            CanmakeOperation = false;
            ProfileSelect.UseDefault = false;
            ProfileResponse userDefaultResponse = cryptxService.GetDefaultProfile(token);
            if (userDefaultResponse.Exception == null)
            {
                if (userDefaultResponse.Settings.Id == Guid.Empty)
                {
                    ProfileResponse response = cryptxService.GetBlankProfile();
                    if (response.Exception == null)
                    {
                        ProfileSelect.UseDefault = true;
                        Settings = response.Settings;
                    }
                    else
                    {
                        throw new Exception("Ошибка при получении настроек по умолчанию");
                    }
                }
                else
                {
                    Settings = userDefaultResponse.Settings;
                }
            }
            else
            {
                throw new Exception("Ошибка при получении ваших настроек по умолчанию");
            }
            //зануляем пароли 
            Settings._SignatureSettings.KeysetPassword = "";
            Settings._DecryptionSettings.KeysetPassword = "";

            //Settings = _cryptxService.GetDefaultProfile();// SettingInitializer.InitializeSettings();
            UserInfo = new UserInfoW();
            UserInfoResponse userInfo = authService.GetUserData(token);
            DownloadedFiles = new List<DownloadedFile>();
            UserInfo.WebDavRootDir = userInfo.WebDavRootDir;
            UserInfo.User = userInfo.User;
            Id = id;
            CreationTime = DateTime.Now;
        }

        /// <summary>
        ///     Копирование значений из Настроек подписи Cryptx в настройки подписи Визарда
        /// </summary>
        public void MapToSigningOptions()
        {
            if (SigningOptions != null)
            {
                SigningOptions.SignOutputFormat = Settings._SignatureSettings._EncodingType;
                SigningOptions.Detached = Settings._SignatureSettings.Detached;
                if (!string.IsNullOrEmpty(Settings._SignatureSettings.SignerCertificate1))
                {
                    SigningOptions.SignerCertificate1 = Settings._SignatureSettings.SignerCertificate1;
                }
            }
            else
            {
                SigningOptions = new SigningOptions
                {
                    SignOutputFormat = Settings._SignatureSettings._EncodingType,
                    Detached = Settings._SignatureSettings.Detached
                };
                if (!string.IsNullOrEmpty(Settings._SignatureSettings.SignerCertificate1))
                {
                    SigningOptions.SignerCertificate1 = Settings._SignatureSettings.SignerCertificate1;
                }
            }
        }

        /// <summary>
        ///     Копирование значений из Настроек подписи Визарда в настройки подписи Cryptx
        /// </summary>
        public void MapFromSigningOptions()
        {
            Settings._SignatureSettings.SignerCertificate1 = SigningOptions.SignerCertificate1;
            Settings._SignatureSettings._EncodingType = SigningOptions.SignOutputFormat;
            Settings._SignatureSettings.Detached = SigningOptions.Detached;
        }

        /// <summary>
        ///     Копирование значений из Настроек Выбора сертификатов Визарда в настройки подписи Cryptx
        /// </summary>
        public void MapFromSignersCertificate()
        {
            Settings._EncryptionSettings.RecipientCertificates1 = SignersCertificate.RecipientCertificates;
            Settings._SignatureSettings._EncodingType = SigningOptions.SignOutputFormat;
        }

        public void MapToSignersCertificate()
        {
            SignersCertificate.MyCertificates = Settings._EncryptionSettings.RecipientCertificates1;
            SignersCertificate.RecipientCertificates = Settings._EncryptionSettings.RecipientCertificates1;
        }

        public void MapFromDecryptOptions()
        {
            Settings._DecryptionSettings.DecryptCertificate = DecryptionOptions.DecryptCertificate;
        }

        public void MapToDecryptOptions()
        {
            if (Settings._DecryptionSettings.DecryptCertificate != null)
                DecryptionOptions.DecryptCertificate = Settings._DecryptionSettings.DecryptCertificate;
        }
    }

    /// <summary>
    ///     выбор профиля
    /// </summary>
    public class ProfileSelect
    {
        public string Profile { get; set; }
        public bool UseDefault { get; set; }
    }

    /// <summary>
    ///     загрузка файла
    /// </summary>
    public class FileUpload
    {
        public string FileName { get; set; }
        public bool FileUploaded { get; set; }
    }

    /// <summary>
    ///     Модель действия Параметр подписи
    /// </summary>
    public class SigningOptions
    {
        public bool Detached { get; set; }
        //public bool LocalDateTimeInSign { get; set; }
        public EncodingType SignOutputFormat { get; set; }
        public string SignerCertificate1 { get; set; }

        public bool WrongPIN { get; set; }


        public List<ListItem> GetEncodingTypesList()
        {
            var listItems = new List<ListItem>();
            foreach (EncodingType type in Enum.GetValues(typeof (EncodingType)))
            {
                if (type.Equals(EncodingType.Binary))
                    listItems.Add(new ListItem {Text = "DER кодировка (бинарные данные)", Value = type.ToString()});
                if (type.Equals(EncodingType.Base64))
                    listItems.Add(new ListItem {Text = "Данные в кодировке base64", Value = type.ToString()});
                if (type.Equals(EncodingType.Base64WithHeaders))
                    listItems.Add(new ListItem
                    {
                        Text = "Данные в кодировке base64 с заголовками",
                        Value = type.ToString()
                    });
            }
            return listItems;
        }
    }

    /// <summary>
    ///     Модель действия Сертифкат подписанта
    /// </summary>
    public class SignersCertificate
    {
        /// <summary>
        ///     список выбранных получателей
        /// </summary>
        public List<string> RecipientCertificates { get; set; }

        /// <summary>
        ///     список выбранных сертификатов из личных для шифрования
        /// </summary>
        public List<string> MyCertificates { get; set; }

        /// <summary>
        ///     комбобокс на шифрование в себя
        /// </summary>
        public bool EncryptToMe { get; set; }
    }

    public class DecryptionOptions
    {
        /// <summary>
        ///     Сертификаты разрешенные для расшифровки данного файла
        /// </summary>
        public List<CertificateInfo> FileDecryptCertificates { get; set; }

        /// <summary>
        ///     Выбран из профиля или является единственным
        /// </summary>
        public string DecryptCertificate { get; set; }

        public bool WrongPIN { get; set; }
    }

    public class OperationOptions
    {
        public string SourceFile { get; set; }
        public string ResultFile { get; set; }
    }

    public class UserInfoW
    {
        public UserInfo User { get; set; }
        public string WebDavRootDir { get; set; }
    }

    public class SignVerificationOptions
    {
        public List<CertificateStatus> CertifictaesWithStatus { get; set; }
        public string MainStatus { get; set; }
        public string DataFileUri { get; set; }
        public List<SignVerificationResult> SignVerificationResults { get; set; }
        ///// <summary>
        ///// Отсоединенная подпись
        ///// </summary>
        //public bool Detached { get; set; }

        //public string SignedFileUri { get; set; }
        //public string SourceFileUri { get; set; }
        ////public bool OnlineVerification { get; set; }
    }

    public class SignVerificationResult
    {
        public List<CertificateStatus> CertifictaesWithStatus { get; set; }
        public string MainStatus { get; set; }
        public string SourceFile { get; set; }
        public string DataSourceFile { get; set; }
        public bool Detached { get; set; }
        public Exception Exception { get; set; }
    }

    public class DownloadedFile
    {
        public string Uri { get; set; }
        public string Name { get; set; }
        public string SrcFileUri { get; set; }
        public List<string> DecryptCertificatesThumbprints { get; set; }
        public List<string> DecryptCertificatesNames { get; set; }
        public Exception Exception { get; set; }
    }
}