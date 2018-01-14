using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models;
using NLog;
using WebDav;

//using Profile = CryptxOnline.Web.CryptxService.Profile;

namespace CryptxOnline.Web.Controllers
{
    public class WizardController : BaseController
    {
        private readonly Logger _logger = LogManager.GetLogger("Controllers");

        private string _fileString = "_fileDownloaded";
        private string _modelString = "_model";

        private WizardModel Model
        {
            get { return (WizardModel) Session[_modelString]; }
            set { Session[_modelString] = value; }
        }

        public ActionResult Index(OperationType type, Guid? fileGroupSendId, Guid? wizardId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            Model.SignVerificationOptions = new SignVerificationOptions();
            Model.SignVerificationOptions.CertifictaesWithStatus = new List<CertificateStatus>();
            Model.DecryptionOptions = new DecryptionOptions();
            bool useDefault = false;
            if (Request.QueryString["useDefault"] != null)
            {
                useDefault = Boolean.Parse(Request.QueryString["useDefault"]);
            }

            if (Request.QueryString["profileId"] != null)
            {
                var profileId = new Guid(Request.QueryString["profileId"]);
                ProfileResponse defProfResponse;
                if (profileId == Guid.Empty)
                {
                    defProfResponse = _cryptxService.GetBlankProfile();
                    if (!useDefault)
                    {
                        defProfResponse = _cryptxService.GetDefaultProfile(token);
                        if (defProfResponse.Exception == null)
                        {
                            if (defProfResponse.Settings.Id == Guid.Empty)
                            {
                                defProfResponse = _cryptxService.GetBlankProfile();
                            }
                        }
                    }
                    if (defProfResponse.Exception == null)
                    {
                        Model.Settings = defProfResponse.Settings;
                    }
                    else
                    {
                        throw defProfResponse.Exception;
                    }
                    Model.ProfileSelect.UseDefault = useDefault;
                    Model.ProfileSelect.Profile = (defProfResponse.Settings.Id).ToString();
                }
                else
                {
                    defProfResponse = _cryptxService.GetProfile(profileId, Guid.Empty, token);
                    if (defProfResponse.Exception == null)
                    {
                        Model.Settings = defProfResponse.Settings;
                        Model.ProfileSelect.Profile = Model.Settings.Id.ToString();
                        Model.ProfileSelect.UseDefault = useDefault;
                    }
                    else
                    {
                        throw defProfResponse.Exception;
                    }
                }
            }
            Model.Settings._SignatureSettings.KeysetPassword = "";
            Model.Settings._DecryptionSettings.KeysetPassword = "";
            //Проверка на один сертификат
            CertificatesResponse response = _cryptxService.GetMyCertificates(Guid.Empty, token);
            if (response.Exception != null)
                throw new Exception(response.Exception.Message, response.Exception);
            if (response.Certificates.Count == 1 &&
                string.IsNullOrEmpty(Model.Settings._SignatureSettings.SignerCertificate1))
            {
                if (Model.SigningOptions == null)
                    Model.MapToSigningOptions();
                if (type == OperationType.Sign)
                    Model.SigningOptions.SignerCertificate1 = response.Certificates[0].Thumbprint;
                if (type == OperationType.Decrypt)
                {
                    Model.DecryptionOptions.DecryptCertificate = response.Certificates[0].Thumbprint;
                }
            }
            else
            {
                Model.MapToSigningOptions();
            }
            if (Model.SignersCertificate == null)
            {
                Model.SignersCertificate = new SignersCertificate();
                Model.SignersCertificate.RecipientCertificates = new List<string>();
            }

            Model.Type = type;
            if (type == OperationType.Sign)
            {
                Model.OperationName = "Подпись файла";
                Model.WizardName = "Мастер подписи";
                Model.MakeOperationText = "Подписать";

                Model.CustomWizardSteps = new List<CustomWizardStep>
                {
                    new CustomWizardStep
                    {
                        Step = "ProfileSelect",
                        StepText = "Выбор профиля",
                        NextStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "FileUpload",
                        StepText = "Выбор файла",
                        NextStep = "SignOptions",
                        PreviousStep = "ProfileSelect"
                    },
                    new CustomWizardStep
                    {
                        Step = "SignOptions",
                        StepText = "Параметры подписи",
                        NextStep = "SignersCertificate",
                        PreviousStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "SignersCertificate",
                        StepText = "Сертификаты подписанта",
                        PreviousStep = "SignOptions"
                    }
                };
            }
            if (type == OperationType.Encrypt)
            {
                Model.MapToSignersCertificate();
                Model.OperationName = "Шифрование файла";
                Model.WizardName = "Мастер шифрования";
                Model.MakeOperationText = "Шифровать";
                Model.CustomWizardSteps = new List<CustomWizardStep>
                {
                    new CustomWizardStep
                    {
                        Step = "ProfileSelect",
                        StepText = "Выбор профиля",
                        NextStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "FileUpload",
                        StepText = "Выбор файла",
                        NextStep = "SignOptions",
                        PreviousStep = "ProfileSelect"
                    },
                    new CustomWizardStep
                    {
                        Step = "SignOptions",
                        StepText = "Параметры шифрования",
                        NextStep = "SignersCertificate",
                        PreviousStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "SignersCertificate",
                        StepText = "Сертификаты получателя",
                        PreviousStep = "SignOptions"
                    }
                };
            }

            if (Model.Type == OperationType.Decrypt)
            {
                Model.OperationName = "Расшифровка файла";
                Model.WizardName = "Мастер расшифровки";
                Model.MakeOperationText = "Расшифровать";
                Model.CustomWizardSteps = new List<CustomWizardStep>
                {
                    new CustomWizardStep
                    {
                        Step = "ProfileSelect",
                        StepText = "Выбор профиля",
                        NextStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "FileUpload",
                        StepText = "Выбор файла",
                        NextStep = "SignersCertificate",
                        PreviousStep = "ProfileSelect"
                    },
                    new CustomWizardStep
                    {
                        Step = "SignersCertificate",
                        StepText = "Параметры",
                        PreviousStep = "FileUpload"
                    }
                };
            }
            if (Model.Type == OperationType.SignVerify)
            {
                Model.OperationName = "Проверка подписи";
                Model.WizardName = "Мастер проверки подписи";
                Model.MakeOperationText = "Проверить подпись";
                Model.CustomWizardSteps = new List<CustomWizardStep>
                {
                    new CustomWizardStep
                    {
                        Step = "ProfileSelect",
                        StepText = "Выбор профиля",
                        NextStep = "FileUpload"
                    },
                    new CustomWizardStep
                    {
                        Step = "FileUpload",
                        StepText = "Выбор файла",
                        PreviousStep = "ProfileSelect"
                    }
                };
            }
            Model.MapToDecryptOptions();

            if (fileGroupSendId != null)
            {
                var groupId = (Guid) fileGroupSendId;
                Guid receivedFileGroupId = _cryptxService.FileGroupReceive(groupId, token);
                List<OperationFile> operationFiles = _cryptxService.GetFileGroupFiles(receivedFileGroupId, token);
                foreach (OperationFile operationFile in operationFiles)
                {
                    var file = new FileInfo(operationFile.FileUri);
                    var downloadedFile = new DownloadedFile();
                    downloadedFile.Name = file.Name;
                    downloadedFile.Uri = operationFile.FileUri;
                    if (operationFile.SrcFileUri != null)
                        downloadedFile.SrcFileUri = operationFile.SrcFileUri;
                    Model.DownloadedFiles.Add(downloadedFile);

                    if (Model.Type == OperationType.Decrypt)
                    {
                        //такой же метод есть в SendFile
                        //используется для поиска сертов при загрузке в визарде


                        //CertificatesResponse responseCerts = _cryptxService.DAVGetDecryptCertificates(downloadedFile.Uri, token);//_cryptxService.GetDecryptCertificates(file, token);
                        //if (responseCerts.Exception == null)
                        //{
                        //    Model.DecryptionOptions.FileDecryptCertificates = responseCerts.Certificates.ToList();
                        //    List<CertificateInfo> MyCertInfo = responseCerts.Certificates.Where(x => x.MyCertificate != null).ToList();
                        //    if (MyCertInfo.Count == 1)
                        //    {
                        //        //canMakeOpDisabled = false;

                        //        Model.DecryptionOptions.DecryptCertificate = MyCertInfo[0].Thumbprint;
                        //    }
                        //    else
                        //    {
                        //        Model.DecryptionOptions.DecryptCertificate = "";
                        //    }
                        //}
                        //else
                        //{
                        //    Model.DecryptionOptions.DecryptCertificate = "";
                        //    throw new Exception("Ошибка получения сертификатов доступных для расшифровки из файла", responseCerts.Exception);
                        //    return RedirectToAction("Index", "Default",
                        //                            new { errorMsg = "Ошибка получения сертификатов из файла" });
                        //}
                    }
                }
                if (Model.Type == OperationType.Decrypt)
                {
                    //GetReceiverCerts(token);

                    DecryptCertificateResult decryptCertificatesResult =
                        Helper.GetDecryptCertificates(Model.DownloadedFiles, _cryptxService, token);
                    Model.DownloadedFiles = decryptCertificatesResult.DownloadedFiles;
                    Model.DecryptionOptions.FileDecryptCertificates = decryptCertificatesResult.CertificateInfos;
                    if (Model.DecryptionOptions.FileDecryptCertificates.Count == 0)
                    {
                        Model.DecryptionOptions.DecryptCertificate = "";
                    }
                }
            }
            //Можно передать гуид настроек
            return RedirectToAction("ProfileSelect", new {wizardId = Model.Id});
        }

        public bool Requestpin(Guid wizardId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            WizardModel model = Model;
            bool result = Helper.RequestPin(ref model, token);
            Model = model;
            return result;
        }


        public ActionResult CloseWizard(Guid wizardId)
        {
            Session.Remove(wizardId.ToString());
            return RedirectToAction("Index", "Default");
        }

        public void SendFileGroup(Guid wizardId, string emails, Guid token)
        {
            int type = 0;
            string template = "";
            if (Model.Type == OperationType.Sign)
            {
                template = "wizardverifysign";
                type = (int) OperationType.Sign;
            }
            if (Model.Type == OperationType.Encrypt)
            {
                template = "wizarddecrypt";
                type = (int) OperationType.Encrypt;
            }

            var operationFiles = new List<OperationFile>();

            foreach (DataOperationResult dataOperationResult in Model.OperatedFilesInfo)
            {
                if (dataOperationResult.Exception == null)
                {
                    var operationFile = new OperationFile();
                    operationFile.FileUri = dataOperationResult.OperatedFile;
                    if (Model.Settings._SignatureSettings.Detached)
                    {
                        operationFile.SrcFileUri = dataOperationResult.SourceFile;
                    }
                    operationFile.SrcFileUri = dataOperationResult.SourceFile;
                    operationFiles.Add(operationFile);
                }
            }


            Guid fileGroupId = _cryptxService.FileGroupCreate(operationFiles, (OperationType) type, token);

            Guid fileGroupSendId = _cryptxService.FileGroupSend(fileGroupId, template, emails, "", false, token, false);

            Uri retUrl = Request.RequestContext.HttpContext.Request.Url;
        }

        /// <summary>
        ///     получение файла для операции
        /// </summary>
        /// <param name="inputFile"></param>
        /// <param name="wizardId"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult GetFile(HttpPostedFileBase inputFile, Guid wizardId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            bool canMakeOpDisabled = true;
            Stream tmpStream1 = inputFile.InputStream;
            var signingFile1 = new byte[tmpStream1.Length];
            tmpStream1.Read(signingFile1, 0, (int) tmpStream1.Length);
            Session[_fileString] = signingFile1;
            WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                //new WebDavClient(Model.UserInfo.WebDavRootDir, Model.UserInfo.User.Login,Model.UserInfo.User.Password);

            var file = new FileInfo(inputFile.FileName);
            string uploadedFileName = "upload/" + file.Name;

            webDavClient.Upload(uploadedFileName, signingFile1);
            if (webDavClient.LastError != null)
                throw new Exception("Ошибка подключения к удаленному каталогу DAV: " + webDavClient.LastError);
            //Чистим весь список
            //Model.DownloadedFiles.Clear();
            //Вставляем на 0 элемент наши значения
            DownloadedFile duplicateFile = Model.DownloadedFiles.FirstOrDefault(x => x.Name == file.Name);
            if (duplicateFile != null)
            {
                Model.DownloadedFiles.Remove(duplicateFile);
            }
            var downloadedFile = new DownloadedFile
            {
                Name = file.Name,
                Uri = uploadedFileName
            };
            Model.DownloadedFiles.Insert(0, downloadedFile);
            canMakeOpDisabled = !CanMake();
            //FileStream fs = new FileStream(@"c:\webdav\files\" + Model.UserInfo.User.ID + "\\" + uploadedFileName,FileMode.Create, FileAccess.ReadWrite);
            //fs.Write(signingFile1,0,signingFile1.Length);
            //fs.Close();

            return Json(new {status = "ok", canMakeOperationDisabled = canMakeOpDisabled}, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult SendFile(Guid wizardId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            bool canMakeOpDisabled = true;
            if (Model.Type == OperationType.Decrypt)
            {
                //такой же кусок кода есть в методе Index
                //там он ищет серты для визарда инициализированного из ссылки

                #region получение списка сертификатов для расшифровки

                DecryptCertificateResult decryptCertificatesResult = Helper.GetDecryptCertificates(
                    Model.DownloadedFiles, _cryptxService, token);
                Model.DownloadedFiles = decryptCertificatesResult.DownloadedFiles;
                Model.DecryptionOptions.FileDecryptCertificates = decryptCertificatesResult.CertificateInfos;
                //Если сертификат из профиля пристуствует в списке сертов доступных для расшифровки
                if (
                    Model.DecryptionOptions.FileDecryptCertificates.Any(
                        x => x.Thumbprint == Model.DecryptionOptions.DecryptCertificate))
                {
                    canMakeOpDisabled = false;
                }
                if (Model.DecryptionOptions.FileDecryptCertificates.Count == 1)
                {
                    //Model.DecryptionOptions.DecryptCertificate = Model.DecryptionOptions.FileDecryptCertificates[0].Thumbprint;
                    canMakeOpDisabled = false;
                }
                if (Model.DecryptionOptions.FileDecryptCertificates.Count == 0)
                {
                    Model.DecryptionOptions.DecryptCertificate = "";
                }

                #endregion
            }

            if (Model.Type == OperationType.SignVerify)
            {
                //[0] т.к. гуи работает только с 1 файлом
                var signedfileinfo = new SignedFileInfo();
                signedfileinfo.FileUri = Model.DownloadedFiles[0].Uri;
                bool detached = _cryptxService.SignIsAttached(signedfileinfo, token).Detached;
                detached = false;
                if (detached)
                {
                    //CheckFileIsExist(Model.DownloadedFileUris[0]);
                    //canMakeOpDisabled = true;
                    //if (!string.IsNullOrEmpty(Model.SignVerificationOptions.DataFileUri))
                    //{
                    //    canMakeOpDisabled = false;
                    //    return Json(new { status = "ok", canMakeOperationDisabled = canMakeOpDisabled }, JsonRequestBehavior.AllowGet);
                    //}

                    //Model.DownloadedFileNames.RemoveAt(0);
                    //Model.DownloadedFileUris.RemoveAt(0);
                    //return Json(new { errorMsg = "Проверка отсоединенной подписи не поддерживается", canMakeOperationDisabled = canMakeOpDisabled }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    //тоже на удаление после реализации докачки файла
                    Model.SignVerificationOptions.DataFileUri = "";
                }
                canMakeOpDisabled = false;
            }
            return Json(new {status = "ok", canMakeOperationDisabled = canMakeOpDisabled}, JsonRequestBehavior.AllowGet);
        }

        public void GetReceiverCerts(Guid token)
        {
            #region получение списка сертификатов для расшифровки

            CertificatesResponse response = _cryptxService.DAVGetDecryptCertificates(Model.DownloadedFiles[0].Uri, token);
                //_cryptxService.GetDecryptCertificates(file, token);
            if (response.Exception == null)
            {
                Model.DecryptionOptions.FileDecryptCertificates = response.Certificates.ToList();
                List<CertificateInfo> MyCertInfo = response.Certificates.Where(x => x.MyCertificate != null).ToList();
                if (MyCertInfo.Count == 1)
                {
                    //canMakeOpDisabled = false;

                    Model.DecryptionOptions.DecryptCertificate = MyCertInfo[0].Thumbprint;
                }
                else
                {
                    if (!string.IsNullOrEmpty(Model.DecryptionOptions.DecryptCertificate))
                    {
                        //canMakeOpDisabled = false;
                        Model.DecryptionOptions.DecryptCertificate = Model.DecryptionOptions.DecryptCertificate;
                    }
                }
            }

            #endregion
        }

        public void CheckFileIsExist(string fileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);

            Model.SignVerificationOptions.DataFileUri = "";

            //Debugger.Launch();
            WebDavClient client = Helper.InitWebDav(token, _authService);
                //new WebDavClient(Model.UserInfo.WebDavRootDir, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
            List<DirInfo> dirInfos = client.GetDirectories("/upload");
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileUri);
            DirInfo dirInfo = dirInfos.FirstOrDefault(x => x.DisplayName == fileNameWithoutExtension);
            if (dirInfo != null)
            {
                Model.SignVerificationOptions.DataFileUri = dirInfo.FullPath;
            }
        }

        /// <summary>
        ///     получение обработанного файла
        /// </summary>
        /// <param name="wizardId"></param>
        /// <param name="downloadedFileUri"></param>
        /// <returns></returns>
        public ActionResult DownloadFile(Guid wizardId, string downloadedFileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            _logger.Info("Файл для загрузки:" + downloadedFileUri);
            string filenameForFF = downloadedFileUri;
            var downloadedFileUriInfo = new FileInfo(downloadedFileUri);
            string fileName = HttpUtility.UrlEncode(downloadedFileUriInfo.Name).Replace(@"+", @"%20");
            OperationType WizardType = Model.Type;


            if (Request.Browser.Browser == "Firefox")
                fileName = filenameForFF;
            if (WizardType == OperationType.SignVerify)
            {
                string rootDirToDAV = Model.UserInfo.WebDavRootDir;
                if (!downloadedFileUri.Contains(rootDirToDAV))
                {
                    //downloadedFileUri = rootDirToDAV + downloadedFileUri;
                }

                WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                    //new WebDavClient(downloadedFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
                _logger.Info("Файл для загрузки в webdav" + rootDirToDAV + downloadedFileUri);
                byte[] retfile = webDavClient.Download(downloadedFileUri);
                if (webDavClient.LastError != null)
                    throw new Exception("Ошибка операции получения файла");
                return File(retfile, "application/octet-stream", fileName);
            }
            if (!string.IsNullOrEmpty(fileName))
            {
                string rootDirToDAV = Model.UserInfo.WebDavRootDir;
                if (!downloadedFileUri.Contains(rootDirToDAV))
                {
                    //downloadedFileUri = rootDirToDAV + downloadedFileUri;
                }

                WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                    //new WebDavClient(downloadedFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
                byte[] retfile = webDavClient.Download(downloadedFileUri);
                if (webDavClient.LastError != null)
                    throw new Exception("Ошибка операции получения файла");
                //Session.Remove("retFile");
                //Session.Remove(wizardId.ToString());
                //Session.Remove(wizardId.ToString() + "_fileDownloaded");
                _logger.Info("Имя файла отдаваемое пользователю" + fileName);
                if (WizardType == OperationType.Sign)
                    return File(retfile, "application/octet-stream", fileName); //+ (isSourceFile?"":".sig"));
                if (WizardType == OperationType.Encrypt)
                    return File(retfile, "application/octet-stream", fileName); // + (isSourceFile?"":".enc"));
                if (WizardType == OperationType.Decrypt)
                    return File(retfile, "application/octet-stream", fileName);
                //isSourceFile?fileName:fileName.Replace(".enc", "").Replace(".p7e", ""));
            }

            if (Session["retFile"] != null)
            {
                var retfile = (byte[]) Session["retFile"];

                Session.Remove("retFile");
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + "_fileDownloaded");
                if (WizardType == OperationType.Sign)
                    return File(retfile, "application/octet-stream", fileName + ".sig");
                if (WizardType == OperationType.Encrypt)
                    return File(retfile, "application/octet-stream", fileName + ".enc");
                if (WizardType == OperationType.Decrypt)
                    return File(retfile, "application/octet-stream", fileName.Replace(".enc", "").Replace(".p7e", ""));
            }
            throw new Exception(Session["retFile"] + " Ошибка чтения исходного файла" + fileName);
        }

        public ActionResult DeleteFile(Guid wizardId, string deletingFileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            string deletingFileName = deletingFileUri;
            string message = "";
            //deletingFileUri = Model.UserInfo.WebDavRootDir + deletingFileUri;

            WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                // new WebDavClient(deletingFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
            webDavClient.Delete(deletingFileUri);
            if (webDavClient.LastError != null)
                message = "Ошибка удаления файла";
            else
            {
                message = "Файл: " + deletingFileName + " успешно удален";
            }
            return RedirectToAction("Operation", "Wizard", new {wizardId, message});
        }

        public ActionResult RemoveFile(Guid wizardId, string deletingFileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            string deletingFileName = deletingFileUri;
            string message = "";
            //deletingFileUri = Model.UserInfo.WebDavRootDir + deletingFileUri;

            WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                // new WebDavClient(deletingFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
            webDavClient.Delete(deletingFileUri);
            if (webDavClient.LastError != null)
                message = "Ошибка удаления файла";
            else
            {
                message = "Файл: " + deletingFileName + " успешно удален";
            }
            DownloadedFile curDownloadedFile = Model.DownloadedFiles.FirstOrDefault(x => x.Uri == deletingFileUri);
            Model.DownloadedFiles.Remove(curDownloadedFile);

            if (Model.Type == OperationType.Decrypt)
            {
                List<string> lightResult = Helper.GetDecryptCertificates(Model.DownloadedFiles);
                if (lightResult != null)
                {
                    var lightResultCerts = new List<CertificateInfo>();
                    foreach (string s in lightResult)
                    {
                        CertificateInfo certificateInfo =
                            Model.DecryptionOptions.FileDecryptCertificates.FirstOrDefault(x => x.Thumbprint == s);
                        if (certificateInfo == null)
                        {
                            CertificateResponse certificateResponse = _cryptxService.GetCertificate(s, Guid.Empty, token);
                            if (certificateResponse.Exception != null)
                            {
                                throw certificateResponse.Exception;
                            }
                            certificateInfo = certificateResponse.Certificate;
                        }
                        lightResultCerts.Add(certificateInfo);
                    }
                    //DecryptCertificateResult result = Helper.GetDecryptCertificates(Model.DownloadedFiles, _cryptxService, token);
                    Model.DecryptionOptions.FileDecryptCertificates = lightResultCerts;
                }
                else
                {
                    Model.DecryptionOptions.FileDecryptCertificates.Clear();
                }
            }
            return RedirectToAction("FileUpload", "Wizard", new {wizardId});
        }

        //public ActionResult DeleteFile(Guid wizardId, string deletingFileUri)
        //{
        //    string deletingFileName = deletingFileUri;
        //    string message = "";
        //    deletingFileUri = Model.UserInfo.WebDavRootDir + deletingFileUri;

        //    WebDavClient webDavClient = new WebDavClient(deletingFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
        //    webDavClient.Delete("");
        //    if(webDavClient.LastError!=null)
        //        message="Ошибка удаления файла";
        //    else
        //    {
        //        message = "Файл: " + deletingFileName + " успешно удален";
        //    }
        //    return Json(new {message});
        //}

        /// <summary>
        ///     полкчение сертификата по отпечатку
        /// </summary>
        /// <param name="thumbPrint"></param>
        /// <returns></returns>
        public ActionResult GetCertificate(string thumbPrint, Guid wizardId)
        {
            //Guid token = new Guid("b64eed3d-d69e-4311-aee7-0495abda0aa1");
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            CertificateResponse response = _cryptxService.GetCertificate(thumbPrint, Guid.Empty, token);
            if (response.Exception == null)
            {
                byte[] array = response.CertificateFileBytes;
                return File(array, "application/octet-stream", thumbPrint + ".cer");
            }
            return RedirectToAction("Login", "Default");
        }

        /// <summary>
        ///     доступность крипто - операции
        /// </summary>
        /// <returns></returns>
        public bool CanMake()
        {
            if (Model.Type == OperationType.Sign)
            {
                if (Model.SigningOptions != null)
                    if (!string.IsNullOrEmpty(Model.SigningOptions.SignerCertificate1) &&
                        (Model.DownloadedFiles.Count != 0))
                    {
                        return true;
                    }
                return false;
            }
            if (Model.Type == OperationType.Encrypt)
            {
                if (Model.SignersCertificate != null && (Model.DownloadedFiles.Count != 0))
                {
                    if (Model.SignersCertificate.EncryptToMe)
                        return true;
                    if (Model.SignersCertificate.RecipientCertificates != null &&
                        Model.SignersCertificate.RecipientCertificates.Count != 0)
                        return true;
                }
                return false;
            }
            if (Model.Type == OperationType.Decrypt)
            {
                if (Model.DecryptionOptions.FileDecryptCertificates != null &&
                    Model.DecryptionOptions.FileDecryptCertificates.Count == 1)
                {
                    Model.DecryptionOptions.DecryptCertificate =
                        Model.DecryptionOptions.FileDecryptCertificates[0].Thumbprint;
                    return true;
                }
                if (!string.IsNullOrEmpty(Model.DecryptionOptions.DecryptCertificate) &&
                    (Model.DownloadedFiles.Count != 0))
                    return true;
                return false;
            }
            if (Model.Type == OperationType.SignVerify)
            {
                if (Model.DownloadedFiles.Count != 0)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        ///     событие перед выполнением действия
        /// </summary>
        /// <param name="filterContext"></param>
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return;
            }
            if ((string) filterContext.RouteData.Values["controller"] == "Wizard" &&
                (string) filterContext.RouteData.Values["action"] != "Index")
            {
                if (NotWizardInSession(new Guid(filterContext.ActionParameters["wizardId"].ToString())))
                {
                    filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new
                    {
                        controller = "Default",
                        action = "Index",
                        errorMsg = "Данные устарели. Попробуйте открыть новый мастер."
                    }));
                    return;
                }
            }

            if (filterContext.ActionParameters.Keys.Contains("wizardId") &&
                filterContext.ActionParameters["wizardId"] != null)
            {
                var wizardId = (Guid) filterContext.ActionParameters["wizardId"];
                _modelString = wizardId.ToString();
                _fileString = wizardId + "_fileDownloaded";
                if (Session[_modelString] == null)
                    Model = new WizardModel(new Guid(_modelString), _cryptxService, _authService, token);

                var operStep = new CustomWizardStep
                {
                    Step = "Operation",
                    StepText = "Завершение работы"
                };

                if ((string) filterContext.RouteData.Values["controller"] == "Wizard" &&
                    (string) filterContext.RouteData.Values["action"] == "Operation")
                {
                    if (!Model.CustomWizardSteps.Any(x => x.Step == "Operation"))
                        Model.CustomWizardSteps.Add(operStep);
                }
                else
                {
                    if (Model.CustomWizardSteps.Any(z => z.Step == "Operation"))
                    {
                        List<CustomWizardStep> listOfStep =
                            Model.CustomWizardSteps.Where(x => x.Step != "Operation").ToList();
                        Model.CustomWizardSteps = listOfStep;
                    }
                }
            }
            else
            {
                Guid id = Guid.NewGuid();
                //modelString используется в get Model 
                //пожтому нам нужно знать Guid перед объявлением Модели
                _modelString = id.ToString();
                Model = new WizardModel(id, _cryptxService, _authService, token);
            }
            ViewBag.login = Model.UserInfo.User.Login;
        }

        /// <summary>
        ///     событие после выполнения действия
        /// </summary>
        /// <param name="filterContext"></param>
        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if ((string) filterContext.RouteData.Values["controller"] == "Wizard" &&
                (string) filterContext.RouteData.Values["action"] == "UploadFile")
            {
                //Session.Abandon();
            }
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                Response.RedirectToRoute("Default", new {controller = "Default", action = "Login"});
                //RedirectToAction("LogOff", "Account");
            }

            //UserInfoResponse curUser = _authService.GetUserData(token);
            //ViewBag.login = curUser.User.Login;
            //ViewBag.Title = ControllerContext.RouteData.Values["action"];
            // saving PersonInfo object to hidden field in view
        }

        public bool NotWizardInSession(Guid wizardId)
        {
            if (Session[wizardId.ToString()] == null)
                return true;
            return false;
        }

        #region Шаги Визарда

        /// <summary>
        ///     Выбор профиля
        /// </summary>
        /// <param name="Profile"></param>
        /// <param name="nextButton"></param>
        /// <param name="cancelButton"></param>
        /// <param name="makeOperation"></param>
        /// <param name="wizardId"></param>
        /// <returns></returns>
        public ActionResult ProfileSelect(string Profile, bool? useDefault, string nextButton, string cancelButton,
            string makeOperation, Guid wizardId, string PINcode)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            if (Request.Form.AllKeys.Contains("ProfileSelect.UseDefault"))
                Model.ProfileSelect.UseDefault = Boolean.Parse(Request.Form["ProfileSelect.UseDefault"]);
            //Model.MapToSignOptions();
            //Отмена
            if (!string.IsNullOrEmpty(cancelButton))
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("Index", "Default");
            }
            //Имя мастера
            ViewBag.WizardName = Model.WizardName;
            //текуший шаг
            CustomWizardStep curStep = Helper.GetCurrentStep(RouteData.Values["action"].ToString(),
                Model.CustomWizardSteps);
            Model.CustomWizardStep = curStep;
            //TODO получение списка профилей


            var listItems = new List<SelectListItem>();
            //    {
            //        new SelectListItem
            //            {
            //                Text = curSettings._MainSettings.Name,
            //                Value = curSettings.Id.ToString(),
            //                Selected = true
            //            }
            //    };

            if (useDefault != null)
            {
                Model.ProfileSelect.UseDefault = (bool) useDefault;
            }

            UserProfilesResponse response = _cryptxService.GetUserProfiles(Guid.Empty, token);
            if (response.Exception == null)
            {
                bool hasDefault = false;
                foreach (UserProfileListElement profile in response.UserProfileList)
                {
                    var item = new SelectListItem
                    {
                        Text = profile.Name,
                        Value = profile.ID.ToString(),
                        Selected = !hasDefault && profile.IsDefault
                    };
                    if (Model.ProfileSelect.Profile != null)
                    {
                        if (Model.ProfileSelect.Profile == profile.ID.ToString())
                        {
                            item.Selected = true;
                            hasDefault = true;
                        }
                    }
                    if (Model.ProfileSelect.Profile == (Guid.Empty).ToString())
                    {
                        item.Selected = false;
                    }
                    listItems.Add(item);
                }
            }
            else
            {
                throw response.Exception;
            }
            //досступные профили пользователя
            ViewBag.Profile = listItems.OrderBy(x => x.Text);
            //отдаём шаги визарда в мастер
            ViewBag.WizardSteps = Model.CustomWizardSteps;
            //проверка доступности
            Model.CanmakeOperation = CanMake();

            //подписать
            if (!string.IsNullOrEmpty(makeOperation))
            {
                //return RedirectToAction("Operation", new { PINcode, wizardId, retAction = RouteData.Values["action"].ToString(), retController = RouteData.Values["controller"].ToString() });
                return Operation(wizardId, PINcode, null, RouteData.Values["action"].ToString(),
                    RouteData.Values["controller"].ToString(), null, null, null, null, null, null);
            }
            //Вперед
            if (!string.IsNullOrEmpty(nextButton))
                return RedirectToAction(curStep.NextStep, new {wizardId = Model.Id});
            return View(Model);
        }


        /// <summary>
        ///     Выбор файла
        /// </summary>
        /// <param name="nextButton"></param>
        /// <param name="cancelButton"></param>
        /// <param name="backButton"></param>
        /// <param name="makeOperation"></param>
        /// <param name="wizardId"></param>
        /// <returns></returns>
        public ActionResult FileUpload(string nextButton, string cancelButton, string backButton, string makeOperation,
            Guid wizardId, string PINcode)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            //Отмена
            if (!string.IsNullOrEmpty(cancelButton))
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("Index", "Default");
            }

            ViewBag.WizardName = Model.WizardName;
            //Guid token = new Guid("b64eed3d-d69e-4311-aee7-0495abda0aa1");

            CustomWizardStep curStep = Helper.GetCurrentStep(RouteData.Values["action"].ToString(),
                Model.CustomWizardSteps);
            Model.CustomWizardStep = curStep;
            ViewBag.WizardSteps = Model.CustomWizardSteps;
            if (Model.DownloadedFiles.Count == 0)
            {
                ViewBag.DownloadedFileName = "";
            }
            else
            {
                ViewBag.DownloadedFileName = string.Join("<br/>", Model.DownloadedFiles);
            }
            Model.CanmakeOperation = CanMake();
            Model.DownloadedFiles = Model.DownloadedFiles.OrderBy(x => x.Name).ToList();

            //подписать
            if (!string.IsNullOrEmpty(makeOperation))
            {
                //return RedirectToAction("Operation", new { PINcode, wizardId, retAction = RouteData.Values["action"].ToString(), retController = RouteData.Values["controller"].ToString() });
                return Operation(wizardId, PINcode, null, RouteData.Values["action"].ToString(),
                    RouteData.Values["controller"].ToString(), null, null, null, null, null, null);
                //(PINcode, wizardId, RouteData.Values["action"].ToString(),RouteData.Values["controller"].ToString());
            }
            //вперед
            if (!string.IsNullOrEmpty(nextButton))
            {
                return RedirectToAction(curStep.NextStep, new {wizardId = Model.Id});
            }
            //назад
            if (!string.IsNullOrEmpty(backButton))
            {
                return RedirectToAction(curStep.PreviousStep, new {wizardId = Model.Id});
            }

            return View(Model);
        }

        /// <summary>
        ///     Параметры подписи
        /// </summary>
        /// <param name="nextButton"></param>
        /// <param name="cancelButton"></param>
        /// <param name="backButton"></param>
        /// <param name="makeOperation"></param>
        /// <param name="wizardId"></param>
        /// <returns></returns>
        public ActionResult SignOptions(string nextButton, string cancelButton, string backButton, string makeOperation,
            Guid wizardId, string PINcode)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            //Отмена
            if (!string.IsNullOrEmpty(cancelButton))
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("Index", "Default");
            }

            ViewBag.WizardName = Model.WizardName;
            //Guid token = new Guid("b64eed3d-d69e-4311-aee7-0495abda0aa1");

            CustomWizardStep curStep = Helper.GetCurrentStep(RouteData.Values["action"].ToString(),
                Model.CustomWizardSteps);
            Model.CustomWizardStep = curStep;
            bool detached;
            string type = "";
            EncodingType encType;

            if (Request.Form.AllKeys.Contains("SigningOptions.Detached"))
            {
                detached = bool.Parse(Request.Form["SigningOptions.Detached"]);
                Model.SigningOptions.Detached = detached;
            }
            if (Request.Form.AllKeys.Contains("SigningOptions.SignOutputFormat"))
            {
                type = Request.Form["SigningOptions.SignOutputFormat"];
                encType = (EncodingType) Enum.Parse(typeof (EncodingType), type);
                Model.SigningOptions.SignOutputFormat = encType;
            }

            ViewBag.WizardSteps = Model.CustomWizardSteps;
            if (Model.SigningOptions == null)
                Model.MapToSigningOptions();
            Model.CanmakeOperation = CanMake();


            //подписать
            if (!string.IsNullOrEmpty(makeOperation))
            {
                //return RedirectToAction("Operation", new { PINcode, wizardId, retAction = RouteData.Values["action"].ToString(), retController = RouteData.Values["controller"].ToString() });
                return Operation(wizardId, PINcode, null, RouteData.Values["action"].ToString(),
                    RouteData.Values["controller"].ToString(), null, null, null, null, null, null);
            }
            //вперед
            if (!string.IsNullOrEmpty(nextButton))
            {
                return RedirectToAction(curStep.NextStep, new {wizardId = Model.Id});
            }
            //назад
            if (!string.IsNullOrEmpty(backButton))
            {
                return RedirectToAction(curStep.PreviousStep, new {wizardId = Model.Id});
            }


            return View(Model);
        }

        /// <summary>
        ///     Сертификаты подписанта
        /// </summary>
        /// <param name="CertList">Выбранный сертификат пользователя</param>
        /// <param name="RecipList">Выбранные сертификаты получателей</param>
        /// //через запятую
        /// <param name="backButton"></param>
        /// <param name="cancelButton"></param>
        /// <param name="makeOperation"></param>
        /// <param name="wizardId"></param>
        /// <returns></returns>
        public ActionResult SignersCertificate(string CertList, bool? EncryptToMe, string backButton,
            string cancelButton, string makeOperation, Guid wizardId, string PINcode, string addRecipCert, string fName,
            Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("LogOff", "Account");
            }

            //Отмена
            if (!string.IsNullOrEmpty(cancelButton))
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("Index", "Default");
            }

            ViewBag.WizardName = Model.WizardName;
            //Guid token=new Guid("b64eed3d-d69e-4311-aee7-0495abda0aa1");

            //если добавление сертификата получателя
            if (!string.IsNullOrEmpty(addRecipCert))
            {
                if (Request.Files.Count == 1)
                {
                    Stream tmpStream1 = Request.Files[0].InputStream;
                    var recipientCertificateFile = new byte[tmpStream1.Length];
                    tmpStream1.Read(recipientCertificateFile, 0, (int) tmpStream1.Length);

                    AddRecipientResponse response1 = _cryptxService.AddRecipientCertificate(recipientCertificateFile,
                        fName, (userId == null ? Guid.Empty : (Guid) userId), token);
                    if (!Model.SignersCertificate.RecipientCertificates.Contains(response1.AddedCertificate.Thumbprint))
                        Model.SignersCertificate.RecipientCertificates.Add(response1.AddedCertificate.Thumbprint);
                    switch (response1.Status)
                    {
                        case AddRecipientResponse.StatusTypes.CertAdded:
                        {
                            Session["errorMsg"] =
                                "Сертификат сохранен и добавлен в Ваш список сертификатов контрагентов";
                            break;
                        }
                        case AddRecipientResponse.StatusTypes.CertHasRelation:
                        {
                            Session["errorMsg"] = "Сертификат был добавлен в Ваш список контрагентов ранее";
                            break;
                        }
                        case AddRecipientResponse.StatusTypes.CertInDB:
                        {
                            Session["errorMsg"] = "Сертификат добавлен в Ваш список сертификатов контрагентов";
                            break;
                        }
                    }
                }
            }

            CustomWizardStep curStep = Helper.GetCurrentStep(RouteData.Values["action"].ToString(),
                Model.CustomWizardSteps);
            Model.CustomWizardStep = curStep;
            ViewBag.WizardSteps = Model.CustomWizardSteps;

            if (!string.IsNullOrEmpty(CertList))
            {
                if (Model.Type == OperationType.Sign || Model.Type == OperationType.Encrypt)
                {
                    Model.SigningOptions.SignerCertificate1 = CertList;
                    Model.MapFromSigningOptions();
                }
                if (Model.Type == OperationType.Decrypt)
                {
                    Model.DecryptionOptions.DecryptCertificate = CertList;
                }
            }
            if (CertList == "")
            {
                if (Model.Type == OperationType.Sign || Model.Type == OperationType.Encrypt)
                    Model.SigningOptions.SignerCertificate1 = CertList;
                if (Model.Type == OperationType.Decrypt)
                    Model.DecryptionOptions.DecryptCertificate = CertList;
            }
            if (CertList == null && Model.Type == OperationType.Decrypt)
            {
                //заглшука пока работаем с 1 файлом
                if (Model.DecryptionOptions.FileDecryptCertificates != null)
                {
                    List<CertificateInfo> myCertificateInfos =
                        Model.DecryptionOptions.FileDecryptCertificates.Where(x => x.MyCertificate != null).ToList();
                    if (myCertificateInfos != null)
                    {
                        if (myCertificateInfos.Count == 1)
                        {
                            Model.DecryptionOptions.DecryptCertificate = myCertificateInfos[0].Thumbprint;
                        }
                    }
                }
            }
            var listItems = new List<SelectListItem>();

            #region Получение списка сертификатов пользователя

            if (Model.Type == OperationType.Sign || Model.Type == OperationType.Encrypt)
            {
                CertificatesResponse response = _cryptxService.GetMyCertificates(Guid.Empty, token);
                if (response.Exception == null)
                {
                    listItems.Clear();
                    foreach (CertificateInfo certificate in response.Certificates.ToList())
                    {
                        listItems.Add(new SelectListItem
                        {
                            Text = certificate.SubjectName,
                            Value = certificate.Thumbprint,
                            Selected = (certificate.Thumbprint == Model.SigningOptions.SignerCertificate1)
                        });
                    }
                }
                ViewBag.CertList = listItems;
            }

            #endregion

            #region Получение списка сертифкатов доступных для расшифровки

            if (Model.Type == OperationType.Decrypt)
            {
                listItems.Clear();
                //заглшука пока работаем с 1 файлом
                if (Model.DecryptionOptions.FileDecryptCertificates != null)
                    foreach (CertificateInfo certificate in Model.DecryptionOptions.FileDecryptCertificates)
                    {
                        if (certificate.MyCertificate != null)
                            listItems.Add(new SelectListItem
                            {
                                Text = certificate.SubjectName,
                                Value = certificate.Thumbprint,
                                Selected = (certificate.Thumbprint == Model.DecryptionOptions.DecryptCertificate)
                            });
                    }
                ViewBag.CertList = listItems;
            }

            #endregion

            //для шифрования
            if (Model.Type == OperationType.Encrypt)
            {
                #region Получение списка контрагентов

                if (EncryptToMe == null)
                {
                    if (Model.SignersCertificate.EncryptToMe == null)
                        Model.SignersCertificate.EncryptToMe = false;
                }
                else
                {
                    Model.SignersCertificate.EncryptToMe = (bool) EncryptToMe;
                }

                if (Request.Form.AllKeys.Contains("SignersCertificate.RecipientCertificates") &&
                    string.IsNullOrEmpty(addRecipCert))
                {
                    Model.SignersCertificate.RecipientCertificates =
                        Request.Form["SignersCertificate.RecipientCertificates"].Split(',').ToList();
                }
                else
                {
                    if (HttpContext.Request.HttpMethod == "POST")
                    {
                        if (Model.SignersCertificate.RecipientCertificates == null)
                        {
                            Model.SignersCertificate.RecipientCertificates = new List<string>();
                        }
                        Model.SignersCertificate.RecipientCertificates.Clear();
                    }
                }
                if (Request.Form.AllKeys.Contains("SignersCertificate.MyCertificates"))
                {
                    Model.SignersCertificate.MyCertificates =
                        Request.Form["SignersCertificate.MyCertificates"].Split(',').ToList();
                }
                else
                {
                    if (HttpContext.Request.HttpMethod == "POST")
                        Model.SignersCertificate.MyCertificates.Clear();
                }
                //if (RecipList != null)
                //    Model.SignersCertificate.RecipientCertificates = RecipList.ToList();


                CertificatesResponse responseRec = _cryptxService.GetRecipientCertificates(token);
                var listItemsRec = new List<SelectListItem>();
                if (responseRec.Exception == null)
                {
                    listItemsRec.Clear();
                    foreach (CertificateInfo certificate in responseRec.Certificates.ToList())
                    {
                        var selectListItem = new SelectListItem();
                        if (certificate.RecipientCertificate != null &&
                            !string.IsNullOrEmpty(certificate.RecipientCertificate.FriendlyName))
                        {
                            selectListItem.Text = certificate.RecipientCertificate.FriendlyName;
                        }
                        else
                        {
                            selectListItem.Text = certificate.SubjectName;
                        }
                        selectListItem.Value = certificate.Thumbprint;
                        if (Model.SignersCertificate.RecipientCertificates != null)
                            selectListItem.Selected =
                                Model.SignersCertificate.RecipientCertificates.Contains(certificate.Thumbprint);
                        listItemsRec.Add(selectListItem);
                    }
                }
                ViewBag.RecipList = listItemsRec;

                #endregion
            }
            Model.CanmakeOperation = CanMake();
            if (Model.Type == OperationType.Encrypt)
            {
                //if (EncryptToMe == null)
                //    EncryptToMe = false;
                //if ((bool)EncryptToMe)
                //Model.SignersCertificate.RecipientCertificates.Add(CertList);
                if (Model.SignersCertificate.MyCertificates != null)
                {
                    if (Model.SignersCertificate.RecipientCertificates == null)
                        Model.SignersCertificate.RecipientCertificates = new List<string>();
                    Model.SignersCertificate.RecipientCertificates.AddRange(Model.SignersCertificate.MyCertificates);
                }
            }

            //подписать
            if (!string.IsNullOrEmpty(makeOperation))
            {
                //return RedirectToAction("Operation", new { PINcode, wizardId, retAction = RouteData.Values["action"].ToString(), retController = RouteData.Values["controller"].ToString(),operationType=Model.Type  });
                return Operation(wizardId, PINcode, null, RouteData.Values["action"].ToString(),
                    RouteData.Values["controller"].ToString(), null, null, null, null, null, null);
            }
            //назад
            if (!string.IsNullOrEmpty(backButton))
            {
                return RedirectToAction(curStep.PreviousStep, new {wizardId = Model.Id});
            }
            return View(Model);
        }

        /// <summary>
        ///     Выполнение Криптооперации
        /// </summary>
        /// <param name="wizardId"></param>
        /// <param name="PINcode"></param>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Operation(Guid wizardId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            ViewBag.token = token;
            ViewBag.wizardId = wizardId;
            ViewBag.WizardName = Model.WizardName;
            ViewBag.WizardSteps = Model.CustomWizardSteps;
            return View(Model);
        }

        [HttpPost]
        public ActionResult Operation(Guid wizardId, string PINcode, string makeOperation, string retAction,
            string retController, string sendEmail, string emails, string cancelButton, string repeat,
            string curFilename, string sendEmailButton)
        {
            //повтор операции
            if (!string.IsNullOrEmpty(repeat))
            {
                OperationType type = Model.Type;
                Session.Remove(wizardId.ToString());
                return RedirectToAction("Index", "Wizard", new {type});
            }
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            //Отмена
            if (!string.IsNullOrEmpty(cancelButton))
            {
                Session.Remove(wizardId.ToString());
                Session.Remove(wizardId + _fileString);
                return RedirectToAction("Index", "Default");
            }

            if (!string.IsNullOrEmpty(sendEmailButton))
            {
            }
            if (!string.IsNullOrEmpty(emails))
            {
                Model.Settings._MainSettings.Email = emails;
            }
            if (!string.IsNullOrEmpty(sendEmail))
            {
                //отправка одного файла проверка подписи/расшифровка
                if (!string.IsNullOrEmpty(curFilename))
                {
                    try
                    {
                        _cryptxService.FileBinarySend(curFilename, emails, token);
                        Model.EmailSendMessage = "Сообщение успешно отправлено на адрес " + emails;
                        //Model.Settings._MainSettings.Email = "";
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Ошибка при отправке файла", ex);
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(emails))
                    {
                        ViewBag.emails = emails;
                    }
                    try
                    {
                        SendFileGroup(wizardId, emails, token);
                        Model.EmailSendMessage = "Сообщение успешно отправлено на адрес " +
                                                 Model.Settings._MainSettings.Email;
                        Model.Settings._MainSettings.Email = "";
                        emails = "";
                    }
                    catch (Exception ex)
                    {
                        //exception.Message = "Ошибка при отправке посылки";
                        throw new Exception("При отправке файлов произошла ошибка", ex);
                        //ViewBag.EmailSendMessage = "Ошибка при отправке письма";
                    }
                }
            }
            if (Model.SignersCertificate == null || Model.SignersCertificate.RecipientCertificates == null)
            {
                return RedirectToAction(retAction, retController,
                    new {errorMsg = "Необходимо выбрать хотя бы один сертификат для шифрования", wizardId});
            }
            if (Model.Type == OperationType.Sign)
            {
                CertificateResponse response = _cryptxService.GetCertificate(Model.SigningOptions.SignerCertificate1,
                    Guid.Empty, token);
                ViewBag.certSubjName = response.Certificate.SubjectName;
            }
            if (Model.Type == OperationType.Decrypt)
            {
                CertificateResponse response = _cryptxService.GetCertificate(
                    Model.DecryptionOptions.DecryptCertificate, Guid.Empty, token);
                ViewBag.certSubjName = response.Certificate.SubjectName;
            }
            if (Model.Type == OperationType.Encrypt)
            {
                string certList = "";
                foreach (string curCert in Model.SignersCertificate.RecipientCertificates)
                {
                    CertificateResponse resp = _cryptxService.GetCertificate(curCert, Guid.Empty, token);
                    if (resp.Exception == null)
                    {
                        certList += resp.Certificate.SubjectName + ",";
                    }
                    else
                    {
                        throw resp.Exception;
                    }
                }
                ViewBag.certSubjName = certList.Substring(0, certList.Length - 1);
            }

            var file = (byte[]) Session[_fileString];
            if (Session[_fileString] != null)
                file = (byte[]) Session[_fileString];

            ViewBag.wizardId = wizardId;
            ViewBag.WizardName = Model.WizardName;
            ViewBag.WizardSteps = Model.CustomWizardSteps;

            var cryptedCertInfos = new List<CertificateInfo>();


            var cryptoOperationResponse = new CryptoOperationResponse();
            var davListCryptoOperationResponse = new DAVListCryptoOperationResponse();
            if (!string.IsNullOrEmpty(PINcode))
            {
                if (Model.Type == OperationType.Sign)
                    Model.Settings._SignatureSettings.KeysetPassword = PINcode;
                if (Model.Type == OperationType.Decrypt)
                    Model.Settings._DecryptionSettings.KeysetPassword = PINcode;
            }

            if (Model.Type == OperationType.Sign)
            {
                Model.MapFromSigningOptions();
            }
            if (Model.Type == OperationType.Encrypt)
            {
                Model.MapFromSignersCertificate();
            }
            if (Model.Type == OperationType.Decrypt)
            {
                Model.MapFromDecryptOptions();
            }

            if (string.IsNullOrEmpty(sendEmail))
            {
                #region Криптооперации

                try
                {
                    if (Model.Type == OperationType.Sign)
                    {
                        List<string> execUris = (from a in Model.DownloadedFiles select a.Uri).ToList();
                        var pinsettings = new PINSettings();
                        davListCryptoOperationResponse = _cryptxService.DAVListSignOperation(execUris, Model.Settings,
                            pinsettings, token);
                        //_cryptxService.DAVSignOperation(Model.DownloadedFileUri,Model.Settings,token); 
                        //_cryptxService.SignOperation(signingFile, Model.Settings, token);
                        if (davListCryptoOperationResponse.OperationResults.Count != 0)
                        {
                            foreach (
                                DataOperationResult dataOperationResult in
                                    davListCryptoOperationResponse.OperationResults)
                            {
                                if (dataOperationResult.Exception != null &&
                                    dataOperationResult.Exception.Message.Contains(
                                        "0x8010006b"))
                                {
                                    Model.SigningOptions.WrongPIN = true;
                                    return RedirectToAction(retAction, retController,
                                        new {errorMsg = "Неверный пин-код", wizardId});
                                }
                            }

                            Model.OperatedFilesInfo = davListCryptoOperationResponse.OperationResults;
                        }
                        //else
                        //{
                        //    throw new Exception("Сервис вернул пустое имя обработанного файла");
                        //}
                    }
                    if (Model.Type == OperationType.Encrypt)
                    {
                        List<string> execUris = (from a in Model.DownloadedFiles select a.Uri).ToList();
                        davListCryptoOperationResponse = _cryptxService.DAVListEncryptOperation(execUris, Model.Settings,
                            token);
                        //_cryptxService.DAVSignOperation(Model.DownloadedFileUri,Model.Settings,token); 
                        //_cryptxService.SignOperation(signingFile, Model.Settings, token);
                        if (cryptoOperationResponse.OperationResult != null ||
                            davListCryptoOperationResponse.OperationResults.Count != 0)
                        {
                            Model.OperatedFilesInfo = davListCryptoOperationResponse.OperationResults;
                            if (cryptoOperationResponse.OperationResult != null)
                                if (cryptoOperationResponse.OperationResult.Exception == null)
                                {
                                    Model.OperatedFileUri = cryptoOperationResponse.OperationResult.OperatedFile;
                                }
                                else
                                {
                                    throw cryptoOperationResponse.OperationResult.Exception;
                                }
                        }
                        //else
                        //{
                        //    throw new Exception("Сервис вернул пустое имя обработанного файла");
                        //}
                    }
                    if (Model.Type == OperationType.Decrypt)
                    {
                        List<string> execUris = (from a in Model.DownloadedFiles select a.Uri).ToList();
                        var pinsettings = new PINSettings();
                        davListCryptoOperationResponse = _cryptxService.DAVListDecryptOperation(execUris, Model.Settings,
                            pinsettings, token);
                        //_cryptxService.DAVSignOperation(Model.DownloadedFileUri,Model.Settings,token); 
                        //_cryptxService.SignOperation(signingFile, Model.Settings, token);
                        if (cryptoOperationResponse.OperationResult != null ||
                            davListCryptoOperationResponse.OperationResults.Count != 0)
                        {
                            foreach (
                                DataOperationResult dataOperationResult in
                                    davListCryptoOperationResponse.OperationResults)
                            {
                                if (dataOperationResult.Exception != null &&
                                    dataOperationResult.Exception.InnerException.Message.Contains(
                                        "0x8010006b"))
                                {
                                    Model.DecryptionOptions.WrongPIN = true;
                                    return RedirectToAction(retAction, retController,
                                        new {errorMsg = "Неверный пин-код", wizardId});
                                }
                            }


                            Model.OperatedFilesInfo = davListCryptoOperationResponse.OperationResults;
                        }
                        //else
                        //{
                        //    throw new Exception("Сервис вернул пустое имя обработанного файла");
                        //}
                    }
                    if (Model.Type == OperationType.SignVerify)
                    {
                        var signedFileInfos = new List<SignedFileInfo>();
                        foreach (DownloadedFile downloadedFileUri in Model.DownloadedFiles)
                        {
                            var signedFileInfo = new SignedFileInfo();
                            //пока 1 файл будет работать!!!

                            signedFileInfo.DataFileUri = downloadedFileUri.SrcFileUri;
                                //Model.SignVerificationOptions.DataFileUri;
                            signedFileInfo.FileUri = downloadedFileUri.Uri;
                            signedFileInfos.Add(signedFileInfo);
                        }
                        Model.SignVerificationOptions = new SignVerificationOptions();
                        Model.SignVerificationOptions.CertifictaesWithStatus = new List<CertificateStatus>();
                        var signVerificationResults = new List<SignVerificationResult>();
                        List<SignVerifyResponse> response = _cryptxService.DAVListSignVerify(signedFileInfos,
                            Model.Settings,
                            true, token);
                        //_cryptxService.DAVSignVerify(signedFileInfo, Model.Settings,token);
                        foreach (SignVerifyResponse signVerifyResponse in response)
                        {
                            var signVerificationResult = new SignVerificationResult();
                            if (signVerifyResponse.Exception == null)
                            {
                                signVerificationResult.CertifictaesWithStatus = signVerifyResponse.CertificateStatuses;
                                signVerificationResult.MainStatus = signVerifyResponse.MainStatus;
                                signVerificationResult.SourceFile = signVerifyResponse.SourceFile;
                                signVerificationResult.DataSourceFile = signVerifyResponse.DataSourceFile;
                                signVerificationResult.Detached = signVerifyResponse.Detached;
                            }
                            else
                            {
                                signVerificationResult.SourceFile = signVerifyResponse.SourceFile;
                                signVerificationResult.Exception = signVerifyResponse.Exception;
                            }
                            signVerificationResults.Add(signVerificationResult);
                        }
                        Model.SignVerificationOptions.SignVerificationResults = signVerificationResults;
                    }
                    if (cryptoOperationResponse.Exception == null)
                    {
                        Session["retFile"] = cryptoOperationResponse.OperatedFile;
                    }
                    else
                    {
                        throw new Exception("Ошибка сервиса", cryptoOperationResponse.Exception);
                    }
                }
                catch (Exception ex)
                {
                    if (ex.Message.Contains("0x8010006b"))
                    {
                        return RedirectToAction(retAction, retController, new {errorMsg = "Неверный пин-код", wizardId});
                        // "?errorMsg=Неверный пин-код&wizardId=" + wizardId);
                    }
                    throw;
                }

                #endregion
            }

            if (!string.IsNullOrEmpty(Model.OperatedFileUri))
                Model.OperatedFileUri = Model.OperatedFileUri.Replace(Model.UserInfo.WebDavRootDir, "");
            if (!string.IsNullOrEmpty(Model.DownloadedFiles[0].Uri))
                Model.DownloadedFiles[0].Uri = Model.DownloadedFiles[0].Uri.Replace(Model.UserInfo.WebDavRootDir, "");

            return RedirectToAction("Operation", "Wizard", new {wizardId}); // View(Model);
        }

        #endregion
    }
}