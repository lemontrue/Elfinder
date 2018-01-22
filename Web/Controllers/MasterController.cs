using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models;
using CryptxOnline.Web.Models.MasterOperation;
using ElFinder.CryptxService;
using NLog;
using WebDav;
using OperationType = ElFinder.CryptxService.OperationType;

namespace CryptxOnline.Web.Controllers
{
    public class MasterController : BaseController
    {
        private readonly Logger _logger = LogManager.GetCurrentClassLogger();

        public ActionResult Index(string files, OperationType? type)
        {
            //List<ElFinder.WebDav.File> Files;
            //try
            //{
            //    var js = new JavaScriptSerializer();
            //    Files = js.Deserialize<List<ElFinder.WebDav.File>>(files);
            //}
            //catch{}

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var masterModel = new MasterInitModel(token, _cryptxService, _authService, files, type);
            ViewBag.masterModel = masterModel;
            //ViewBag.Debug = (Convert.ToBoolean(Request.Params["debug"]) == true).ToString().ToLower();

            return View("Index");
        }

        /// <summary>
        ///     Получение профиля по ID
        /// </summary>
        /// <param name="profileId"></param>
        /// <returns></returns>
        public ActionResult GetUserProfile(Guid profileId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
                //return RedirectToAction("LogOff", "Account");
            }
            ProfileResponse response = _cryptxService.GetProfile(profileId, Guid.Empty, token);
            if (response.Exception != null)
            {
                throw response.Exception;
            }
            return Json(response.Settings, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Получение списка личных сертификатов
        /// </summary>
        /// <returns></returns>
        public ActionResult GetMyCertificates()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            //bool isActiveCur = isActive ?? false;

            var model = new List<CertificateInfoContactAdd>();
            CertificatesResponse response = _cryptxService.GetMyCertificates(Guid.Empty, token);
            if (response.Exception == null)
            {
                foreach (CertificateInfo certificateInfo in response.Certificates)
                {
                    var curCert = new CertificateInfoContactAdd();
                    curCert.CertificateId = certificateInfo.CertificateId;
                    curCert.SubjectName = certificateInfo.SubjectName;
                    curCert.IssureName = certificateInfo.IssureName;
                    curCert.Thumbprint = certificateInfo.Thumbprint;
                    curCert.Organization = certificateInfo.Organization;
                    curCert.IsTest = certificateInfo.IsTest;
                    if (DateTime.Now < certificateInfo.NotBefore)
                    {
                        curCert.TimeMessage = "Недействителен до " +
                                              certificateInfo.NotBefore.Date.ToShortDateString().Replace("/", ".");
                    }
                    if (DateTime.Now > certificateInfo.NotBefore && DateTime.Now < certificateInfo.NotAfter)
                    {
                        curCert.TimeMessage = "Действителен до " +
                                              certificateInfo.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    else
                    {
                        curCert.TimeMessage = "Недействителен с " +
                                              certificateInfo.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    model.Add(curCert);
                }
            }
            else
            {
                return Json(new { status = "Error", errorCode = "", errorMessage = response.Exception.Message },
                    JsonRequestBehavior.AllowGet);
            }

            return Json(new { model, status = "ok" }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Запрос на поиск сертов
        /// </summary>
        /// <param name="isActive"></param>
        /// <param name="searchString"></param>
        /// <returns></returns>
        public ActionResult FindCertificate(bool isActive = false, string searchString = "")
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            //bool isActiveCur = isActive ?? false;

            var model = new List<CertificateInfoContactAdd>();
            SearchResultResponse response = _cryptxService.GetCertificatesBySearchString(searchString, isActive, false,
                token);
            if (response.Exception == null)
            {
                foreach (CertificateInfo certificateInfo in response.Certificates)
                {
                    var curCert = new CertificateInfoContactAdd();
                    curCert.CertificateId = certificateInfo.CertificateId;
                    curCert.SubjectName = certificateInfo.SubjectName;
                    curCert.IssureName = certificateInfo.IssureName;
                    curCert.Thumbprint = certificateInfo.Thumbprint;
                    curCert.Organization = certificateInfo.Organization;
                    curCert.IsTest = certificateInfo.IsTest;
                    if (DateTime.Now < certificateInfo.NotBefore)
                    {
                        curCert.TimeMessage = "Недействителен до " +
                                              certificateInfo.NotBefore.Date.ToShortDateString().Replace("/", ".");
                    }
                    if (DateTime.Now > certificateInfo.NotBefore && DateTime.Now < certificateInfo.NotAfter)
                    {
                        curCert.TimeMessage = "Действителен до " +
                                              certificateInfo.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    else
                    {
                        curCert.TimeMessage = "Недействителен с " +
                                              certificateInfo.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    model.Add(curCert);
                }
            }
            else
            {
                return Json(new { status = "Error", errorCode = "", errorMessage = response.Exception.Message },
                    JsonRequestBehavior.AllowGet);
            }

            return Json(new { model, status = "ok" }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Получение информации по сертификату
        /// </summary>
        /// <param name="thumbprints"></param>
        /// <returns></returns>
        public ActionResult GetCertificatesInfo(List<string> thumbprints)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            var certificates = new List<CertificateInfo>();
            foreach (string thumbprint in thumbprints)
            {
                CertificateResponse response = _cryptxService.GetCertificate(thumbprint, Guid.Empty, token);
                certificates.Add(response.Certificate);
            }


            return Json(new { certificates }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Получение нулевого профиля
        /// </summary>
        /// <returns></returns>
        public ActionResult GetBlankProfile()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            ProfileResponse response = _cryptxService.GetBlankProfile();
            if (response.Exception == null)
            {
                return Json(new { response.Settings }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { status = "Error", errorCode = "401", errorMessage = response.Exception.Message },
                JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Проверка подписанного файла на отсоединенность подписи
        /// </summary>
        /// <param name="signedFileInfosJSON"></param>
        /// <returns></returns>
        public ActionResult CheckSignedFilesAtachment(string signedFileInfosJSON)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }

            List<SignedFileInfo> signedFileInfos;
            try
            {
                var serializer = new DataContractJsonSerializer(typeof(List<SignedFileInfo>));
                var stream = new MemoryStream(Encoding.UTF8.GetBytes(signedFileInfosJSON));
                signedFileInfos = (List<SignedFileInfo>)serializer.ReadObject(stream);
                stream.Close();
            }
            catch (Exception exception)
            {
                return
                    Json(
                        new
                        {
                            status = "Error",
                            errorCode = "",
                            errorMessage = "Не удалось сериализовать список файлов от клиента"
                        },
                        JsonRequestBehavior.AllowGet);
            }

            var masterSignedFileInfos = new List<MasterSignedFileInfo>();
            foreach (SignedFileInfo signedFileInfo in signedFileInfos)
            {
                var masterSignedFileInfo = new MasterSignedFileInfo();
                SignAttachmentResponse response = _cryptxService.SignIsAttached(signedFileInfo, token);
                if (response.Exception != null)
                {
                    masterSignedFileInfo.Exception = response.Exception;
                }
                else
                {
                    signedFileInfo.Detached = response.Detached;
                }
                masterSignedFileInfo.SignedFileInfo = signedFileInfo;
                masterSignedFileInfos.Add(masterSignedFileInfo);
            }

            return Json(new { masterSignedFileInfos });
        }

        /// <summary>
        ///     запрашивать ПИН
        /// </summary>
        /// <param name="thumbprint"></param>
        /// <returns></returns>
        public ActionResult NeedToPIN(string thumbprint)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            NeedToPINResponse response = _cryptxService.NeedToPIN(thumbprint, token);
            if (response.Exception != null)
            {
                //Ошибки не отдают в браузер
                //return Json(new { status = "Error", errorCode = "", errorMessage = response.Exception }, JsonRequestBehavior.AllowGet);
                return Json(new { NeedToPIN = true });
            }
            return Json(new { response.NeedToPIN });
        }

        /// <summary>
        ///     Загрузка файла
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult GetFile(HttpPostedFileBase name)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
                //return RedirectToAction("LogOff", "Account");
            }
            bool canMakeOpDisabled = true;
            Stream tmpStream1 = Request.Files[0].InputStream;
            var signingFile1 = new byte[tmpStream1.Length];
            tmpStream1.Read(signingFile1, 0, (int)tmpStream1.Length);
            WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
            //new WebDavClient(Model.UserInfo.WebDavRootDir, Model.UserInfo.User.Login,Model.UserInfo.User.Password);

            var file = new FileInfo(Request.Files[0].FileName);
            string uploadedFileName = "Загруженные/" + file.Name;
            //string fileExtension = file.Extension;
            //DirInfo dirInfo = new DirInfo();
            //string curFileName = uploadedFileName;
            //int i = 1;
            //do
            //{

            //    dirInfo = webDavClient.GetInfo(curFileName);
            //    if (dirInfo != null)
            //    {
            //        curFileName = uploadedFileName + " (" + i + ")";
            //    }
            //}
            //while (dirInfo != null);
            //uploadedFileName = curFileName;
            webDavClient.Upload(uploadedFileName, signingFile1);
            if (webDavClient.LastError != null)
                return
                    Json(
                        new
                        {
                            status = "Error",
                            errorCode = "None",
                            errorMessage = "Ошибка подключения к удаленному каталогу DAV: " + webDavClient.LastError,
                            fileName = uploadedFileName
                        }, JsonRequestBehavior.AllowGet);
            //throw new Exception("Ошибка подключения к удаленному каталогу DAV: " + webDavClient.LastError);
            //Чистим весь список
            //Model.DownloadedFiles.Clear();
            //Вставляем на 0 элемент наши значения

            //FileStream fs = new FileStream(@"c:\webdav\files\" + Model.UserInfo.User.ID + "\\" + uploadedFileName,FileMode.Create, FileAccess.ReadWrite);
            //fs.Write(signingFile1,0,signingFile1.Length);
            //fs.Close();

            return Json(new { status = "ok", errorCode = "None", fileName = uploadedFileName },
                JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        ///     Получение списка доступных для расшифровки сертов
        /// </summary>
        /// <param name="files"></param>
        /// <returns></returns>
        public ActionResult GetDecryptCertificates(List<string> files)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
                //return RedirectToAction("LogOff", "Account");
            }

            var downloadedFiles = new List<DownloadedFile>();
            foreach (string fileUri in files)
            {
                var file = new DownloadedFile();
                file.Uri = fileUri;
                downloadedFiles.Add(file);
            }

            DecryptCertificateResult result = Helper.GetDecryptCertificates(downloadedFiles, _cryptxService, token);

            JsonResult jsonResult = Json(new { result });
            _logger.Info(new JavaScriptSerializer().Serialize(jsonResult.Data));
            return jsonResult;
        }

        /// <summary>
        ///     Выполнить операцию
        /// </summary>
        /// <param name="settingsJSON"></param>
        /// <param name="signedFileInfosJSON"></param>
        /// <param name="type"></param>
        /// <param name="savePIN"></param>
        /// <returns></returns>
        public ActionResult MakeOperation(string settingsJSON, string signedFileInfosJSON, OperationType type,
            bool? savePIN, bool? needToPIN)
        {
            //_logger.Info("MakeOperation PID:" + System.Diagnostics.Process.GetCurrentProcess().Id);
            //_logger.Info("MakeOperation TID:" + System.Threading.Thread.CurrentThread.ManagedThreadId);

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return
                    Json(
                        new { OperationResult = new Result { Exception = new MasterException(401, "Токен истек", null) } },
                        JsonRequestBehavior.AllowGet);
            }
            Settings settings;
            Exception globalException = null;
            List<SignedFileInfo> signedFileInfos;
            try
            {
                var serializer = new DataContractJsonSerializer(typeof(List<SignedFileInfo>));
                var stream = new MemoryStream(Encoding.UTF8.GetBytes(signedFileInfosJSON));
                signedFileInfos = (List<SignedFileInfo>)serializer.ReadObject(stream);
                stream.Close();
            }
            catch (Exception exception)
            {
                return
                    Json(
                        new
                        {
                            OperationResult =
                                new Result
                                {
                                    Exception =
                                        new MasterException(500, "Не удалось сериализовать список файлов от клиента",
                                            null)
                                }
                        }, JsonRequestBehavior.AllowGet);
            }

            try
            {
                var serializer = new DataContractJsonSerializer(typeof(Settings));
                var stream = new MemoryStream(Encoding.UTF8.GetBytes(settingsJSON));
                settings = (Settings)serializer.ReadObject(stream);
                stream.Close();
            }
            catch (Exception exception)
            {
                return
                    Json(
                        new
                        {
                            OperationResult =
                                new Result
                                {
                                    Exception =
                                        new MasterException(500, "Не удалось сериализовать настройки от клиента", null)
                                }
                        }, JsonRequestBehavior.AllowGet);
            }
            var davListCryptoOperationResponse = new DAVListCryptoOperationResponse();

            var pinsettings = new PINSettings
            {
                NeedToPIN = (needToPIN != null && (bool)needToPIN),
                PIN = settings._SignatureSettings.KeysetPassword,
                SavePIN = (savePIN != null && (bool)savePIN)
            };
            if (!string.IsNullOrEmpty(settings._SignatureSettings.KeysetPassword))
            {
                pinsettings.PIN = settings._SignatureSettings.KeysetPassword;
            }
            if (!string.IsNullOrEmpty(settings._DecryptionSettings.KeysetPassword))
            {
                pinsettings.PIN = settings._DecryptionSettings.KeysetPassword;
            }
            
            var doubleOperationResult = new DoubleOperationResult();

            //список файлов с ошибками
            var errorDataOperationResults = new List<DataOperationResult>();

            #region Единичные операции

            if (type != OperationType.DecryptSignverify && type != OperationType.SignEncrypt)
            {
                
                var result = new Result();

                #region Подпись

                if (type == OperationType.Sign)
                {
                    settings._SignatureSettings.KeysetPassword = string.Empty;
                    List<string> files = signedFileInfos.Select(signedFileInfo => signedFileInfo.FileUri).ToList();
                    try
                    {
                        davListCryptoOperationResponse = _cryptxService.DAVListSignOperation(files, settings,
                            pinsettings, token);
                        if (davListCryptoOperationResponse.Exception != null)
                        {
                            if (davListCryptoOperationResponse.Exception.Message.Contains("0x8010006b"))
                            {
                                result.Exception = new MasterException(Int32.Parse("8010006b", NumberStyles.HexNumber),
                                    davListCryptoOperationResponse.Exception.Message,
                                    davListCryptoOperationResponse.Exception);
                            }
                            else
                            {
                                result.Exception = new MasterException(
                                    davListCryptoOperationResponse.Exception.HResult,
                                    davListCryptoOperationResponse.Exception.Message,
                                    davListCryptoOperationResponse.Exception);
                            }
                        }
                        else
                        {
                            foreach (
                                DataOperationResult dataOperationResult in
                                    davListCryptoOperationResponse.OperationResults)
                            {
                                
                                var signResult = new SignResult();
                                
                                signResult.UnsignedFile = dataOperationResult.SourceFile;
                                if (dataOperationResult.Exception != null)
                                {
                                    Exception curException = dataOperationResult.Exception;
                                    signResult.Exception = new MasterException(curException.HResult,
                                        curException.Message, curException);
                                }
                                else
                                {
                                    
                                    signResult.SignedFile = dataOperationResult.OperatedFile;
                                }
                                
                                result.OperationResults.Add(signResult);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        
                        result.Exception = new MasterException(ex.HResult, "", ex);
                        globalException = ex;
                    }
                }

                #endregion

                #region Шифровка

                if (type == OperationType.Encrypt)
                {
                    try
                    {
                        List<string> files = signedFileInfos.Select(signedFileInfo => signedFileInfo.FileUri).ToList();
                        davListCryptoOperationResponse = _cryptxService.DAVListEncryptOperation(files, settings, token);
                        if (davListCryptoOperationResponse.Exception != null)
                        {
                            
                            result.Exception = new MasterException(davListCryptoOperationResponse.Exception.HResult,
                                davListCryptoOperationResponse.Exception.Message,
                                davListCryptoOperationResponse.Exception);
                            globalException = davListCryptoOperationResponse.Exception;
                        }
                        else
                        {
                            foreach (
                                DataOperationResult dataOperationResult in
                                    davListCryptoOperationResponse.OperationResults)
                            {
                                
                                var encryptResult = new EncryptResult();
                                
                                encryptResult.UnencryptedFile = dataOperationResult.SourceFile;
                                if (dataOperationResult.Exception != null)
                                {
                                    Exception curException = dataOperationResult.Exception;
                                    
                                    encryptResult.Exception = new MasterException(curException.HResult,
                                        curException.Message, curException);
                                }
                                else
                                {
                                    
                                    encryptResult.EncryptedFile = dataOperationResult.OperatedFile;
                                }
                                
                                result.OperationResults.Add(encryptResult);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        
                        result.Exception = new MasterException(ex.HResult, ex.Message, ex);
                        globalException = ex;
                    }
                }

                #endregion

                #region Проверка подписи

                if (type == OperationType.SignVerify)
                {
                    var response = new List<SignVerifyResponse>();
                    try
                    {
                        response = _cryptxService.DAVListSignVerify(signedFileInfos, settings, true, token);

                        
                        foreach (SignVerifyResponse signVerifyResponse in response)
                        {
                            var signVerifyResult = new SignVerifyResult();
                            signVerifyResult.CertificateStatuses = signVerifyResponse.CertificateStatuses;
                            signVerifyResult.MainStatus = signVerifyResponse.MainStatus;
                            signVerifyResult.Detached = signVerifyResponse.Detached;
                            signVerifyResult.SignedFile = signVerifyResponse.SourceFile;
                            signVerifyResult.DataFile = signVerifyResponse.DataSourceFile;
                            result.OperationResults.Add(signVerifyResult);
                        }
                    }
                    catch (Exception ex)
                    {
                        
                        result.Exception = new MasterException(ex.HResult, ex.Message, ex);
                        globalException = ex;
                    }
                    //return Json(new { response, errorDataOperationResults, operationError = globalException }, JsonRequestBehavior.AllowGet);
                }

                #endregion

                #region Расшифровать

                if (type == OperationType.Decrypt)
                {
                    try
                    {
                        
                        settings._DecryptionSettings.KeysetPassword = string.Empty;
                        List<string> files = signedFileInfos.Select(signedFileInfo => signedFileInfo.FileUri).ToList();
                        davListCryptoOperationResponse = _cryptxService.DAVListDecryptOperation(files, settings,
                            pinsettings, token);
                        if (davListCryptoOperationResponse.Exception != null)
                        {
                            
                            Exception curException = davListCryptoOperationResponse.Exception;

                            
                            result.Exception = new MasterException(curException.HResult, curException.Message,
                                curException);
                            globalException = davListCryptoOperationResponse.Exception;
                        }
                        
                        else
                        {
                            foreach (
                                DataOperationResult dataOperationResult in
                                    davListCryptoOperationResponse.OperationResults)
                            {
                                var decryptResult = new DecryptResult();

                                if (dataOperationResult.Exception != null)
                                {
                                    Exception curException = dataOperationResult.Exception;
                                    decryptResult.Exception = new MasterException(curException.HResult,
                                        curException.Message, curException);
                                }
                                decryptResult.DecryptedFile = dataOperationResult.SourceFile;
                                decryptResult.EncryptedFile = dataOperationResult.OperatedFile;
                                result.OperationResults.Add(decryptResult);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Exception = new MasterException(ex.HResult, ex.Message, ex);
                        globalException = ex;
                    }
                }

                #endregion

                
                return Json(new { OperationResult = result }, JsonRequestBehavior.AllowGet);
            }
            #endregion

            #region Двойные операции

            #region Подпись-шифрование

            if (type == OperationType.SignEncrypt)
            {
                try
                {
                    List<string> files = signedFileInfos.Select(signedFileInfo => signedFileInfo.FileUri).ToList();
                    //подпись
                    davListCryptoOperationResponse = _cryptxService.DAVListSignOperation(files, settings, pinsettings,
                        token);
                    if (davListCryptoOperationResponse.Exception != null)
                    {
                        
                        doubleOperationResult.Exception =
                            new MasterException(davListCryptoOperationResponse.Exception.HResult,
                                davListCryptoOperationResponse.Exception.Message,
                                davListCryptoOperationResponse.Exception);
                        return Json(new { OperationResult = doubleOperationResult }, JsonRequestBehavior.AllowGet);
                    }
                    var toEncrypt = new List<string>();
                    foreach (DataOperationResult dataOperationResult in davListCryptoOperationResponse.OperationResults)
                    {
                        
                        var signResult = new SignResult();
                        
                        signResult.UnsignedFile = dataOperationResult.SourceFile;
                        //firsOperationResult.Add(signResult);

                        if (dataOperationResult.Exception != null)
                        {
                            Exception curException = dataOperationResult.Exception;
                            signResult.Exception = new MasterException(curException.HResult, curException.Message,
                                curException);
                            errorDataOperationResults.Add(dataOperationResult);
                        }
                        else
                        {
                            
                            signResult.SignedFile = dataOperationResult.OperatedFile;

                            toEncrypt.Add(dataOperationResult.OperatedFile);
                        }
                        
                        doubleOperationResult.OperationResults.Add(new DoubleResult
                        {
                            FirsOperationResult = signResult
                        });
                    }
                    
                    List<string> filesToEncryption =
                        doubleOperationResult.OperationResults.Where(x => x.FirsOperationResult.Exception == null)
                            .Select(x => ((SignResult)x.FirsOperationResult).SignedFile)
                            .ToList();
                    //шифрование
                    davListCryptoOperationResponse = _cryptxService.DAVListEncryptOperation(toEncrypt, settings, token);

                    
                    //цикл в цикле для сопастовления данных первой операции со второй
                    foreach (DataOperationResult dataOperationResult in davListCryptoOperationResponse.OperationResults)
                    {
                        foreach (DoubleResult doubleResult in doubleOperationResult.OperationResults)
                        {
                            if (((SignResult)doubleResult.FirsOperationResult).SignedFile ==
                                dataOperationResult.SourceFile)
                            {
                                var encryptResult = new EncryptResult();
                                encryptResult.UnencryptedFile = dataOperationResult.SourceFile;
                                if (dataOperationResult.Exception != null)
                                {
                                    encryptResult.Exception = new MasterException(
                                        dataOperationResult.Exception.HResult, dataOperationResult.Exception.Message,
                                        dataOperationResult.Exception);
                                }
                                else
                                {
                                    encryptResult.EncryptedFile = dataOperationResult.OperatedFile;
                                }
                                doubleResult.SecondOperationResult = encryptResult;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    
                    doubleOperationResult.Exception = new MasterException(ex.HResult, ex.Message, ex);
                }
            }

            #endregion

            #region Расшифровать - проверить подпись

            if (type == OperationType.DecryptSignverify)
            {
                var response = new List<SignVerifyResponse>();
                try
                {
                    settings._DecryptionSettings.KeysetPassword = string.Empty;
                    List<string> files = signedFileInfos.Select(signedFileInfo => signedFileInfo.FileUri).ToList();
                    davListCryptoOperationResponse = _cryptxService.DAVListDecryptOperation(files, settings, pinsettings,
                        token);
                    if (davListCryptoOperationResponse.Exception != null)
                    {
                        doubleOperationResult.Exception =
                            new MasterException(davListCryptoOperationResponse.Exception.HResult,
                                davListCryptoOperationResponse.Exception.Message,
                                davListCryptoOperationResponse.Exception);
                        return Json(new { OperationResult = doubleOperationResult }, JsonRequestBehavior.AllowGet);
                    }
                    var toSignVerify = new List<SignedFileInfo>();
                    foreach (DataOperationResult dataOperationResult in davListCryptoOperationResponse.OperationResults)
                    {
                        
                        var decryptResult = new DecryptResult();
                        decryptResult.DecryptedFile = dataOperationResult.SourceFile;
                        if (dataOperationResult.Exception != null)
                        {
                            
                            Exception curException = dataOperationResult.Exception;
                            
                            decryptResult.Exception = new MasterException(curException.HResult, curException.Message,
                                curException);
                            errorDataOperationResults.Add(dataOperationResult);
                        }
                        else
                        {
                            
                            decryptResult.EncryptedFile = dataOperationResult.OperatedFile;

                            var info = new SignedFileInfo();
                            info.FileUri = dataOperationResult.OperatedFile;
                            toSignVerify.Add(info);
                        }
                        
                        doubleOperationResult.OperationResults.Add(new DoubleResult
                        {
                            FirsOperationResult = decryptResult
                        });
                    }

                    response = _cryptxService.DAVListSignVerify(toSignVerify, settings, true, token);

                    foreach (SignVerifyResponse signVerifyResponse in response)
                    {
                        foreach (DoubleResult doubleResult in doubleOperationResult.OperationResults)
                        {
                            //сопоставляем выход первой операции со входом второй
                            if (((DecryptResult)doubleResult.FirsOperationResult).EncryptedFile ==
                                signVerifyResponse.SourceFile)
                            {
                                var signVerifyResult = new SignVerifyResult();
                                if (signVerifyResponse.Exception != null)
                                {
                                    Exception curException = signVerifyResponse.Exception;
                                    signVerifyResult.Exception = new MasterException(curException.HResult,
                                        curException.Message, curException);
                                }
                                else
                                {
                                    signVerifyResult.CertificateStatuses = signVerifyResponse.CertificateStatuses;
                                    signVerifyResult.MainStatus = signVerifyResponse.MainStatus;
                                    signVerifyResult.Detached = signVerifyResponse.Detached;
                                    signVerifyResult.SignedFile = signVerifyResponse.SourceFile;
                                    signVerifyResult.DataFile = signVerifyResponse.DataSourceFile;
                                }
                                doubleResult.SecondOperationResult = signVerifyResult;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    doubleOperationResult.Exception = new MasterException(ex.HResult, ex.Message, ex);
                }
            }

            #endregion

            
            return Json(new { OperationResult = doubleOperationResult }, JsonRequestBehavior.AllowGet);

            #endregion
        }

        public ActionResult DeleteFile(string deletingFileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            string message = "";
            string deletingFileName = deletingFileUri;
            WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
            // new WebDavClient(deletingFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
            webDavClient.Delete(deletingFileUri);
            if (webDavClient.LastError != null)
                message = "Ошибка удаления файла";
            else
            {
                message = "Файл: " + deletingFileName + " успешно удален";
            }
            return Json(new { status = "ok", errorCode = "", errorMessage = "", message }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddRecipientCertificate(HttpPostedFile file)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            Stream tmpStream1 = Request.Files[0].InputStream;
            var fileBytes = new byte[tmpStream1.Length];
            tmpStream1.Read(fileBytes, 0, (int)tmpStream1.Length);
            AddRecipientResponse response = _cryptxService.AddRecipientCertificate(fileBytes, "", Guid.Empty, token);
            if (response.Exception != null)
                return Json(new { status = "Error", errorCode = "", errorMessage = response.Exception.Message },
                    JsonRequestBehavior.AllowGet);


            return Json(new { status = "ok", response.AddedCertificate }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SetTemplateAsDefault(Guid templateId)
        {
            //задача в ТФС 5368
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { status = "Error", errorCode = "401", errorMessage = "" }, JsonRequestBehavior.AllowGet);
            }
            ProfileResponse response = _cryptxService.SetProfileAsDefault(templateId, token);
            if (response.Exception != null)
                return Json(new { status = "Error", errorCode = "", errorMessage = response.Exception.Message },
                    JsonRequestBehavior.AllowGet);
            return Json(new { status = "ok", errorCode = "", errorMessage = "" }, JsonRequestBehavior.AllowGet);
        }

        public string GetWebDAVFileUri(string fileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            UserInfoResponse curUser = _authService.GetUserData(token);

            string fullFileIUri = curUser.WebDavRootDir + fileUri;
            return fullFileIUri;
        }

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (filterContext.Result is RedirectToRouteResult)
            {
                string resultAction =
                    ((RedirectToRouteResult)(filterContext.Result)).RouteValues["action"].ToString();
                string retUrl = Request.RequestContext.HttpContext.Request.Url.ToString();
                retUrl = retUrl.Replace("&amp;", "&");
                if (resultAction == "LogOff")
                {
                    Session["retUrl"] = retUrl;
                }
            }


            //TODO здесь можно поймать редирект при логине
        }
    }
}