using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.ServiceModel;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Security;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models;
using ElFinder.DTO;
using Newtonsoft.Json;
using CertificateInfo = ElFinder.CryptxService.CertificateInfo;
using File = ElFinder.WebDav.File;
using ElFinder.CryptxService;


//using OldServiceResponse = CryptxOnline.Web.AuthorizeService.OldServiceResponse;

namespace CryptxOnline.Web.Controllers
{
    [ControllerAuthorizeAttribute("User, GroupAdmin, SysAdmin", "Confirmed")]
    public class DefaultController : BaseController
    {
        #region Страницы

        /// <summary>
        ///     Главная страница пользователя
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);

            var data = (ClaimsIdentity)User.Identity;

            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            UserInfoResponse curUser = _authService.GetUserData(token);
            ViewBag.login = curUser.User.Login;
            if (Request.QueryString["errorMsg"] == null)
                return RedirectToAction("MyCertificates", "Default");
            return View();
        }

        public ActionResult MyCertificates()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            UserInfoResponse curUser = _authService.GetUserData(token);
            ViewBag.login = curUser.User.Login;

            CertificatesResponse response = _cryptxService.GetMyCertificates(Guid.Empty, token);
            if (response.Exception == null)
            {
                ViewBag.certificates = response.Certificates;
            }
            else
            {
                return RedirectToAction("LogOff", "Account");
            }

            return View();
        }

        public ActionResult RecipientCertificates(string fName, string curfName, string curThumbprint, string delButton,
            Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            //редактирование описания
            if (!string.IsNullOrEmpty(curThumbprint) && string.IsNullOrEmpty(delButton))
            {
                _cryptxService.ChangeFriendlyName(curThumbprint, curfName, (userId == null ? Guid.Empty : (Guid)userId),
                    token);
            }
            //удаление
            if (!string.IsNullOrEmpty(curThumbprint) && !string.IsNullOrEmpty(delButton))
            {
                _cryptxService.DeleteRecipientRelation(curThumbprint, (userId == null ? Guid.Empty : (Guid)userId),
                    token);
            }
            //добавление файла
            if (Request.Files.Count == 1 && Request.Files[0].ContentLength != 0)
            {
                var fileInfo = new FileInfo(Request.Files[0].FileName);
                if (!fileInfo.Extension.Contains("cer"))
                {
                    Session["errorMsg"] = "Тип файла не поддерживается. Используйте файл сертификата .cer";
                }
                else
                {
                    Stream tmpStream1 = Request.Files[0].InputStream;
                    var recipientCertificateFile = new byte[tmpStream1.Length];
                    tmpStream1.Read(recipientCertificateFile, 0, (int)tmpStream1.Length);

                    AddRecipientResponse response1 = _cryptxService.AddRecipientCertificate(recipientCertificateFile,
                        fName, (userId == null ? Guid.Empty : (Guid)userId), token);
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

            UserInfoResponse curUser = _authService.GetUserData(token);
            ViewBag.login = curUser.User.Login;

            CertificatesResponse response = _cryptxService.GetRecipientCertificates(token);
            if (response.Exception == null)
            {
                ViewBag.certificates = response.Certificates;
            }
            else
            {
                return RedirectToAction("LogOff", "Account");
            }

            return View();
        }

        public ActionResult SearchRecipientCertificates(SearchModel model, string addRelationU2R, string curThumbprint,
            string curfName, Guid? userId)
        {
            if (ModelState.IsValid)
            {
                Guid token = CheckSessionAuthState(CurrentUser, _authService);
                if (token == Guid.Empty)
                {
                    return RedirectToAction("LogOff", "Account");
                }
                UserInfoResponse curUser = _authService.GetUserData(token);
                ViewBag.login = curUser.User.Login;
                if (!string.IsNullOrEmpty(curThumbprint) && !string.IsNullOrEmpty(addRelationU2R))
                {
                    _cryptxService.AddRecipientCertificateByThumbprint(curThumbprint, curfName,
                        (userId == null ? Guid.Empty : (Guid)userId), token);
                }
                if (!string.IsNullOrEmpty(model.SearchText))
                {
                    SearchResultResponse response = _cryptxService.GetCertificatesBySearchString(model.SearchText,
                        model.Active, false, token);
                    model.ViewCount = response.ViewCount;
                    model.ResultLength = response.Certificates.Count;
                    model.ResultCertificates = response.Certificates;

                    //Debugger.Launch();
                    model.ResultCertificates = model.ResultCertificates.Take(model.ViewCount).ToList();
                    //model.ResultCertificates = response.Certificates.OrderBy(x => x.SubjectName).ToList();
                    //model.ResultCertificates.RemoveRange(model.ViewCount,model.ResultCertificates.Count-1);
                }
            }
            return View(model);
        }


        public ActionResult Profiles(string createProfile, string curThumbprint, string delButton)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            if (!string.IsNullOrEmpty(createProfile))
            {
                return RedirectToAction("CreateEditProfile");
            }

            if (!string.IsNullOrEmpty(delButton))
            {
                if (!string.IsNullOrEmpty(curThumbprint))
                {
                    DeleteProfile(new Guid(curThumbprint));
                }
            }
            UserInfoResponse curUser = _authService.GetUserData(token);
            ViewBag.login = curUser.User.Login;

            var profiles = new List<UserProfileListElement>();
            UserProfilesResponse response = _cryptxService.GetUserProfiles(Guid.Empty, token);
            if (response.Exception == null)
            {
                profiles = response.UserProfileList;
            }
            //profiles.AddRange(new List<Profile>()
            //    {
            //        new Profile()
            //            {
            //                Id = Guid.NewGuid(),
            //                Name = "p1",
            //                IsDefault = true
            //            },
            //        new Profile()
            //            {
            //                Id = Guid.NewGuid(),
            //                Name = "p2",
            //                IsDefault = false
            //            }
            //    });
            return View(profiles.OrderBy(x => x.Name).ToList());
        }

        [System.Web.Mvc.HttpGet]
        public ActionResult CreateEditProfile(Guid? Id, Guid userId)
        {
            //Debugger.Launch();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            UserInfoResponse curUser = _authService.GetUserData(token);
            ViewBag.login = curUser.User.Login;

            var settings = new Settings();
            if (Id == null || Id == Guid.Empty)
            {
                ProfileResponse response = _cryptxService.GetBlankProfile();
                if (response.Exception == null)
                {
                    settings = response.Settings;
                    //settings._EncryptionSettings.RecipientCertificates1=new List<string>()
                    //    {
                    //        "1FEED4944CDF20DE3A02F1D44BE944D3F524B50B",
                    //        "27717DD00DEDEE917442D17E3A575B5EA9FE9066",
                    //        "6707D557BAFF6EAF2DEC7AD450E6B5509CFDCD6A"
                    //    };
                }
                else
                {
                    throw response.Exception;
                }
            }
            else
            {
                ProfileResponse response = _cryptxService.GetProfile((Guid)Id, Guid.Empty, token);
                if (response.Exception == null)
                {
                    settings = response.Settings;
                }
                else
                {
                    throw response.Exception;
                }
            }

            #region Получение сертификатов контрагентов

            CertificatesResponse recipCertResponse = _cryptxService.GetRecipientCertificates(token);
            if (recipCertResponse.Exception == null)
            {
                var list = new List<SelectListItem>();
                foreach (var certificateInfo in recipCertResponse.Certificates)
                {
                    var selectListItem = new SelectListItem();
                    if (certificateInfo.RecipientCertificate != null &&
                        !string.IsNullOrEmpty(certificateInfo.RecipientCertificate.FriendlyName))
                    {
                        selectListItem.Text = certificateInfo.RecipientCertificate.FriendlyName;
                    }
                    else
                    {
                        selectListItem.Text = certificateInfo.SubjectName;
                    }
                    selectListItem.Value = certificateInfo.Thumbprint;

                    list.Add(selectListItem);
                }

                ViewBag.RecipientCertificateList = list;
            }
            else
            {
                throw new Exception("Ошибка получения сертификатов своих контрагентов", recipCertResponse.Exception);
                //неудачное получение моих сертов контрагентов
            }

            #endregion

            var listItems = new List<SelectListItem>();
            CertificatesResponse certificatesResponse = _cryptxService.GetMyCertificates(userId, token);
            if (certificatesResponse.Exception == null)
            {
                foreach (ElFinder.CryptxService.CertificateInfo certificateInfo in certificatesResponse.Certificates)
                {
                    listItems.Add(new SelectListItem
                    {
                        Text = certificateInfo.SubjectName,
                        Value = certificateInfo.Thumbprint
                    });
                }
                ViewBag.MyCertificateList = listItems;
            }
            else
            {
                throw new Exception("Ошибка получения своих сертификатов", certificatesResponse.Exception);
            }


            return View(settings);
        }

        [System.Web.Mvc.HttpPost]
        public ActionResult CreateEditProfile(Settings settings, string saveDecrPin, string saveSignPin)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            var defaultResponse = new ProfileResponse();
            var defaultSettings = new Settings();

            if (!string.IsNullOrEmpty(saveDecrPin))
            {
                defaultResponse = _cryptxService.GetProfile(settings.Id, Guid.Empty, token);
                if (defaultResponse.Exception == null)
                {
                    defaultSettings = defaultResponse.Settings;
                }
                else
                {
                    throw defaultResponse.Exception;
                }
                defaultSettings._DecryptionSettings.KeysetPassword = settings._DecryptionSettings.KeysetPassword;
                defaultSettings._DecryptionSettings.DecryptCertificate = settings._DecryptionSettings.DecryptCertificate;
                _cryptxService.SaveProfile(defaultSettings, token, Guid.Empty);
                return RedirectToAction("CreateEditProfile", "Default", new { settings.Id });
            }
            if (!string.IsNullOrEmpty(saveSignPin))
            {
                defaultResponse = _cryptxService.GetProfile(settings.Id, Guid.Empty, token);
                if (defaultResponse.Exception == null)
                {
                    defaultSettings = defaultResponse.Settings;
                }
                else
                {
                    throw defaultResponse.Exception;
                }
                defaultSettings._SignatureSettings.KeysetPassword = settings._SignatureSettings.KeysetPassword;
                defaultSettings._SignatureSettings.SignerCertificate1 = settings._SignatureSettings.SignerCertificate1;
                _cryptxService.SaveProfile(defaultSettings, token, Guid.Empty);
                return RedirectToAction("CreateEditProfile", "Default", new { settings.Id });
            }

            //проверка на новый или для редактирования профиль
            if (settings.Id == Guid.Empty)
            {
                defaultResponse = _cryptxService.GetBlankProfile();
            }
            else
            {
                defaultResponse = _cryptxService.GetProfile(settings.Id, Guid.Empty, token);
            }

            if (defaultResponse.Exception == null)
            {
                defaultSettings = defaultResponse.Settings;
            }
            else
            {
                throw defaultResponse.Exception;
            }


            //Глупое место необходимо как-то автоматизировать
            defaultSettings.Id = settings.Id;
            defaultSettings._MainSettings.Name = settings._MainSettings.Name;
            defaultSettings._MainSettings.Email = settings._MainSettings.Email;
            defaultSettings._MainSettings.Description = settings._MainSettings.Description;
            defaultSettings._MainSettings.IsDefault = settings._MainSettings.IsDefault;

            defaultSettings._SignatureSettings.Detached = settings._SignatureSettings.Detached;
            defaultSettings._SignatureSettings._EncodingType = settings._SignatureSettings._EncodingType;
            defaultSettings._SignatureSettings.SignerCertificate1 = settings._SignatureSettings.SignerCertificate1;
            defaultSettings._SignatureSettings.KeysetPassword = settings._SignatureSettings.KeysetPassword;

            defaultSettings._EncryptionSettings._EncodingType = settings._EncryptionSettings._EncodingType;
            defaultSettings._EncryptionSettings.RecipientCertificates1 =
                settings._EncryptionSettings.RecipientCertificates1;

            defaultSettings._DecryptionSettings.DecryptCertificate = settings._DecryptionSettings.DecryptCertificate;
            defaultSettings._DecryptionSettings.KeysetPassword = settings._DecryptionSettings.KeysetPassword;
            if (settings.Id == Guid.Empty)
            {
                _cryptxService.SaveNewProfile(defaultSettings, token, Guid.Empty);
            }
            else
            {
                _cryptxService.SaveProfile(defaultSettings, token, Guid.Empty);
            }

            return RedirectToAction("Profiles");
        }

        public ActionResult WebDavBrowser(Guid? fileGroupSendId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var userInfo = (UserInfo)Session["userInfo"];

            return View();
        }

        public ActionResult SendMail(string files, string parent)
        {
            //var files = "[{\"path\":\"Upload/& !  '.cer\",\"lastChange\":\"2014-04-07T16:47:44\",\"name\":null,\"mime\":null},{\"path\":\"Upload/423DA73C1D070CF1DCF22E08A470F0249D6A117A (7).cer\",\"lastChange\":\"2014-04-06T12:53:32\",\"name\":null,\"mime\":null},{\"path\":\"Upload/423DA73C1D070CF1DCF22E08A470F0249D6A117A (4).cer\",\"lastChange\":\"2014-04-06T12:50:01\",\"name\":null,\"mime\":null},{\"path\":\"Upload/423DA73C1D070CF1DCF22E08A470F0249D6A117A (5).cer\",\"lastChange\":\"2014-04-06T13:14:24\",\"name\":null,\"mime\":null},{\"path\":\"Upload/423DA73C1D070CF1DCF22E08A470F0249D6A117A (6).cer\",\"lastChange\":\"2014-04-06T13:02:14\",\"name\":null,\"mime\":null}]";
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            List<File> Files;
            try
            {
                var js = new JavaScriptSerializer();
                Files = js.Deserialize<List<File>>(files);
            }
            catch
            {
                //throw new ArgumentNullException("Неверные параметры");
                Files = new List<File>();
            }

            foreach (File file in Files)
            {
                string ext = Path.GetExtension(file.path);
                if (ext == ".enc")
                {
                    string name = file.path.Substring(0, file.path.LastIndexOf(".", StringComparison.Ordinal));
                    string ext2 = Path.GetExtension(name);
                    if (ext2 == ".sig") ext = ".sig.enc";
                }
                if (string.IsNullOrEmpty(file.mime))
                    file.mime = string.IsNullOrEmpty(ext)
                        ? "unknown"
                        : ElFinder.Helper.GetMimeType(ext.ToLower().Substring(1));
                if (string.IsNullOrEmpty(file.name))
                    file.name = Path.GetFileName(file.path);
            }

            ViewBag.Files = JsonConvert.SerializeObject(Files);
            return View();
        }

        public ActionResult SendMailMethod(string files, string emails, string messageText, bool? conformationOfReceipt)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Error.Redirect("", Url.Action("LogOff", "Account"));
            }

            List<File> Files;
            try
            {
                var js = new JavaScriptSerializer();
                Files = js.Deserialize<List<File>>(files);
            }
            catch
            {
                return Error.Message("SendMailMethod: Ошибка данных!");
            }

            var list = new List<OperationFile>();
            foreach (File file in Files)
            {
                list.Add(new OperationFile
                {
                    FileUri = HttpUtility.UrlDecode(file.path)
                });
            }
            try
            {
                Guid fileGroupId = _cryptxService.FileGroupCreate(list, OperationType.SendFiles, token);
                Guid fileGroupSendId = _cryptxService.FileGroupSend(fileGroupId, "sendfiles", emails, messageText,
                    (conformationOfReceipt != null && (bool)conformationOfReceipt), token, false);
            }
            catch (Exception ex)
            {
                return Error.Message("SendMailMethod: Ошибка сервиса при отправке почты!" + ex.Message);
            }
            return Json(new { isSend = true });
        }

        public ActionResult GetAddressBook()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Error.Redirect("", Url.Action("LogOff", "Account"));
            }

            try
            {
                UserAddressBookResponse addressBook = _cryptxService.GetAddressBook("", AddressBookSort.ContactNameASC,
                    AddressBookFilter.All, Guid.Empty, token, 0);
                return Json(addressBook);
            }
            catch (Exception ex)
            {
                return Error.Message("GetAddressBook: Ошибка сервиса при получении адресной книги!" + ex.Message);
            }
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult MyProfile(Guid? userId)
        {
            var a = Thread.CurrentPrincipal;
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var navigation = new MyNavigation();
            var userInfo = (UserInfo)Session["userInfo"];
            ViewBag.userInfo = userInfo;
            if (Session["EmailChangeError"] != null)
            {
                if (Session["EmailChangeError"].ToString() == bool.TrueString)
                {
                    ViewBag.EmailChangeError = bool.TrueString;
                }
                else
                {
                    ViewBag.EmailChangeError = bool.FalseString;
                }
                Session.Remove("EmailChangeError");
            }
            var respAccount = new AccountResponse();
            Guid activeUserId = Guid.Empty;
            if (userId != null)
            {
                activeUserId = (Guid)userId;
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });

                UserInfoResponse response = _authService.GetUserDataByID(activeUserId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = response.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Профиль",
                    IsUrl = false
                });

                respAccount = _authService.GetAccount(activeUserId, token);
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Мой профиль",
                    Action = "Index",
                    Controller = "Default",
                    IsUrl = false
                });
                respAccount = _authService.GetAccount(Guid.Empty, token);
            }

            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            if (Session["TempPassword"] != null)
            {
                ViewBag.showPasswordChangeModal = true;
                Session.Remove("TempPassword");
            }
            CertificatesResponse respCert = _cryptxService.GetMyCertificates(activeUserId, token);
            if (respCert.Exception != null)
                throw new Exception("Ошибка получения своих сертификатов", respCert.Exception);
            var certRequests = _markerService.GetMyCertificatesRequests(MarkerActivationService.GetMyCertificatesRequestsResponse.Sort.NameASC, activeUserId, token);
            if (certRequests.Error != null)
                throw new Exception("Ошибка получения списка запросов на сертификаты " + certRequests.Error.Message);

            ProfileModel model = new ProfileModel(respAccount.Account);
            model.certList = new MyCertificateListModel { certs = respCert.Certificates };
            model.certRequestList = new MyRequestListModel { requests = certRequests.MyCertificateRequests };

            model.certList.JsonFormat = new JavaScriptSerializer().Serialize(model.certList);
            model.certRequestList.JsonFormat = new JavaScriptSerializer().Serialize(model.certRequestList);


            if (!string.IsNullOrEmpty(model.Phone))
                model.Phone = model.Phone.Substring(1);
            model.UserId = (userId != null ? (Guid)userId : Guid.Empty);
            return View(model);
        }
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        [System.Web.Mvc.HttpPost]
        public ActionResult MyProfile(Account model, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            Guid curUserId = Guid.Empty;
            if (userId != null)
            {
                curUserId = (Guid)userId;
            }
            //апдейт номера телефона для России
            model.Phone = "7" + model.Phone;
            bool response = _authService.SaveAccount(model, curUserId, token);
            if (response)
            {
                //UserInfoResponse curUser = _authService.GetUserData(token);
                //Session["userInfo"] = curUser.User;
            }
            if (Request.IsAjaxRequest())
            {
                return Json(response,JsonRequestBehavior.AllowGet);
            }
            if (curUserId == Guid.Empty)
                return RedirectToAction("MyProfile");
            return RedirectToAction("MyProfile", new { userId = curUserId });
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult FilterCertificates(MyCertificateListModel model, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }
            CertificatesResponse response =
                _cryptxService.GetMyCertificates((userId == null ? Guid.Empty : (Guid)userId), token);
            if (response.Exception != null)
                throw new Exception("Ошибка получения своих сертификатов", response.Exception);
            List<ElFinder.CryptxService.CertificateInfo> filterCert = FilterCertificates(response.Certificates, model.Filter, model.Sort,
                model.WhithPin);
            return PartialView("_partialCertificatesList", filterCert);
        }
        [MyAuthorize("User,GroupAdmin,SysAdmin", "Confirmed,New")]
        public ActionResult MyCertificatesList(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            CertificatesResponse response =
                _cryptxService.GetMyCertificates((userId == null ? Guid.Empty : (Guid)userId), token);
            if (response.Exception != null)
                throw new Exception("Ошибка получения своих сертификатов", response.Exception);

            var model = new ProfileModel()
            {
                certList = new MyCertificateListModel()
                {
                    certs = response.Certificates
                }
            };
            return View(model);
        }

        #endregion

        #region Веб-Методы

        #region profile
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult SendTestSms(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            bool result = false;
            string exception = "";
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }

            try
            {
                OldServiceResponse response = _authService.SendTestSMS((userId == null ? Guid.Empty : (Guid)userId),
                    token);
                if (response.Exception == null) result = true;
            }
            catch (Exception ex)
            {
                result = false;
                exception = ex.Message;
            }

            return
                Json(
                    new
                    {
                        success = result,
                        message = result ? "Успешно" : "Произошла ошибка, попробуйте повторить позже.",
                        exception
                    });
        }
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        private List<CertificateInfo> FilterCertificates(IEnumerable<CertificateInfo> certificates,
            CertificateFilter filterType, Sort sortType, bool withPin)
        {
            var result = new List<CertificateInfo>();
            foreach (CertificateInfo certificateInfo in certificates)
            {
                if (withPin && !certificateInfo.MyCertificate.HasPIN) continue;
                if (filterType == CertificateFilter.Active)
                {
                    if (certificateInfo.NotAfter > DateTime.Now && certificateInfo.NotBefore < DateTime.Now)
                        result.Add(certificateInfo);
                }
                else result.Add(certificateInfo);
            }
            switch (sortType)
            {
                case Sort.FriendlyNameASC:
                    result = result.OrderBy(x => x.MyCertificate != null ? x.MyCertificate.FriendlyName : "").ToList();
                    break;
                case Sort.FriendlyNameDESC:
                    result =
                        result.OrderByDescending(x => x.MyCertificate != null ? x.MyCertificate.FriendlyName : "")
                            .ToList();
                    break;
                case Sort.IssureDateASC:
                    result = result.OrderBy(x => x.NotBefore).ToList();
                    break;
                case Sort.IssureDateDESC:
                    result = result.OrderByDescending(x => x.NotBefore).ToList();
                    break;
                case Sort.OwnerASC:
                    result = result.OrderBy(x => x.SubjectName).ToList();
                    break;
                case Sort.OwnerDESC:
                    result = result.OrderByDescending(x => x.SubjectName).ToList();
                    break;
                default:
                    throw new ArgumentOutOfRangeException("sortType");
            }
            return result;
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult SetPin(string newPin, Guid? user2Cert, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            bool result = false;
            string exception = "";
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }
            try
            {
                if (user2Cert != null && user2Cert != Guid.Empty)
                {
                    OldServiceResponse response = _cryptxService.SetMyCertPIN((Guid)user2Cert, newPin,
                        (userId == null ? Guid.Empty : (Guid)userId), token);
                    if (response.Exception == null) result = true;
                }
            }
            catch (Exception ex)
            {
                exception = ex.Message;
                result = false;
            }

            return
                Json(
                    new
                    {
                        success = result,
                        message = result ? "Успешно" : "Произошла ошибка, попробуйте повторить позже.",
                        exception
                    });
        }
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult DeletePin(Guid? user2Cert, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            bool result = false;
            string exception = "";
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }

            try
            {
                if (user2Cert != null && user2Cert != Guid.Empty)
                {
                    ElFinder.CryptxService.OldServiceResponse response = _cryptxService.DeleteMyCertPIN((Guid)user2Cert,
                        (userId == null ? Guid.Empty : (Guid)userId), token);
                    if (response.Exception != null) return Json(new { success = false, errorOldPin = true });
                    result = true;
                }
            }
            catch (Exception ex)
            {
                exception = ex.Message;
                result = false;
            }

            return
                Json(
                    new
                    {
                        success = result,
                        message = result ? "Успешно" : "Произошла ошибка, попробуйте повторить позже.",
                        exception
                    });
        }
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult ChangePin(string newPin, string oldPin, Guid? user2Cert, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            bool result = false;
            string exception = "";
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }

            try
            {
                if (user2Cert != null && user2Cert != Guid.Empty)
                {
                    OldServiceResponse response = _cryptxService.ChangeMyCertPIN((Guid)user2Cert, oldPin,
                        newPin, (userId == null ? Guid.Empty : (Guid)userId), token);
                    if (response.Exception != null) return Json(new { success = false, errorOldPin = true });
                    result = true;
                }
            }
            catch (Exception ex)
            {
                exception = ex.Message;
                result = false;
            }

            return
                Json(
                    new
                    {
                        success = result,
                        message = result ? "Успешно" : "Произошла ошибка, попробуйте повторить позже.",
                        exception
                    });
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult ChangePass(string newPass, string oldPass, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            OldServiceResponse operRes;
            bool result = false;
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }

            try
            {
                operRes = _authService.ChangePassword(oldPass, newPass, (userId == null ? Guid.Empty : (Guid)userId),
                    token);
                if (operRes.Exception != null)
                {
                    return Json(new { success = result, errorOldPass = true });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
            if (operRes.Message.ToLower().Contains("успешно")) result = true;
            return Json(new { success = result, message = operRes.Message });
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult ChangeEmail(Guid id)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            Guid confirmationKey = id;
            EmailChangeConfirmationResponse response = _authService.EmailChangeConfirmation(id, token);
            if (response.Status != EmailChangeConfirmationResponse.ResponseStatus.Ok)
            {
                Session["EmailChangeError"] = bool.TrueString;
                return RedirectToAction("MyProfile");
            }
            Session["EmailChangeError"] = bool.FalseString;
            return RedirectToAction("MyProfile");
        }

        public ActionResult SaveCertFriendlyName(string name, Guid? certId, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            bool result = false;
            string exception = "";
            if (token == Guid.Empty)
            {
                return Json(new { redirectUrl = Url.Action("LogOff", "Account") });
            }

            try
            {
                if (certId != null && certId != Guid.Empty)
                    result = _cryptxService.ChangeMyCertificateFriendlyName((Guid)certId, name,
                        (userId == null ? Guid.Empty : (Guid)userId), token);
            }
            catch (Exception ex)
            {
                exception = ex.Message;
                result = false;
            }

            return
                Json(
                    new
                    {
                        success = result,
                        message = result ? "Успешно" : "Произошла ошибка, попробуйте повторить позже.",
                        exception
                    });
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public JsonResult CheckPhone(string phoneNumber, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { error = "relogin" }, JsonRequestBehavior.AllowGet);
            }
            string error = "";
            PhoneChangeResponse response;
            phoneNumber = "7" + phoneNumber;
            try
            {
                response = _authService.PhoneChangeBegin(phoneNumber, (userId == null ? Guid.Empty : (Guid)userId), token);
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return Json(new { error }, JsonRequestBehavior.AllowGet);
            }

            if (response.Error != null)
            {
                error = response.Error.Message;
                return Json(new { error }, JsonRequestBehavior.AllowGet);
            }
            Session["SmsConfirmationID"] = response.SmsConfirmationID;
            return
                Json(
                    new
                    {
                        response.Status,
                        response.PinWaitingTime,
                        response.SmsConfirmationID,
                        SmsConfirmationType = "PhoneChange"
                    }, JsonRequestBehavior.AllowGet);
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public ActionResult CheckEmail(string email, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { error = "relogin" }, JsonRequestBehavior.AllowGet);
            }

            EmailChangeResponse response = _authService.EmailChangeBegin(email,
                (userId == null ? Guid.Empty : (Guid)userId), token);
            if (!Request.IsAjaxRequest())
            {
                return RedirectToAction("MyProfile", "Default");
            }
            string error = "";
            if (response.Error != null)
            {
                error = response.Error.Message;
                return Json(new { error }, JsonRequestBehavior.AllowGet);
            }
            if (response.Status == EmailChangeResponse.ResponseStatus.SmsConfirmationSent)
            {
                Session["SmsConfirmationID"] = response.SmsConfirmationID;
                return
                    Json(
                        new
                        {
                            response.Status,
                            response.SmsConfirmationID,
                            response.PinWaitingTime,
                            SmsConfirmationType = "EmailChange"
                        }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { response.Status }, JsonRequestBehavior.AllowGet);
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public JsonResult CheckSmsConfirmation(string pin)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { error = "relogin" }, JsonRequestBehavior.AllowGet);
            }
            if (Session["SmsConfirmationID"] == null)
            {
                return Json(new { error = "Не возможно выполнить проверку" });
            }
            var smsConfirmationID = new Guid(Session["SmsConfirmationID"].ToString());
            SmsConfirmationResponse response = _authService.SmsConfirmation(pin, smsConfirmationID, token);
            if (response.Error != null)
            {
                return Json(new { error = response.Error }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { response.Status }, JsonRequestBehavior.AllowGet);
        }
        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public JsonResult ResendSmsConfirmation(Guid smsConfirmationID)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { error = "relogin" }, JsonRequestBehavior.AllowGet);
            }
            if (smsConfirmationID == Guid.Empty)
            {
                return Json(new { error = "Не возможно выполнить проверку" });
            }
            SmsConfirmationResponse response = _authService.ResendSmsConfirmation(smsConfirmationID, token);

            return Json(new { response.Status }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        public ActionResult Incoming(Guid id, string type)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            const string verifySignType = "wizardverifysign";
            const string decryptType = "wizarddecrypt";
            const string sendfiles = "sendfiles";
            switch (type)
            {
                case verifySignType:
                    {
                        return RedirectToAction("Index", "Wizard", new { type = 4, fileGroupSendId = id });
                    }
                case decryptType:
                    {
                        return RedirectToAction("Index", "Wizard", new { type = 3, fileGroupSendId = id });
                    }
                case sendfiles:
                    return RedirectToAction("WebDavBrowser", "Default", new { fileGroupSendId = id });

                default:
                    {
                        return RedirectToAction("Index", "Default", new { errorMsg = "Не допустимый тип операции:" + type });
                    }
            }
        }

        public ActionResult DeleteProfile(Guid Id)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            ProfileResponse response = _cryptxService.DeleteProfile(Id, token, Guid.Empty);
            if (response.Exception == null)
            {
            }
            else
            {
                throw response.Exception;
            }
            return RedirectToAction("Profiles");
        }

        public ActionResult SetProfileAsDefault(Guid ID)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            ProfileResponse response = _cryptxService.SetProfileAsDefault(ID, token);
            if (response.Exception != null)
            {
                throw response.Exception;
            }

            return RedirectToAction("Profiles");
        }

        /// <summary>
        ///     удаление контрагента из списка
        /// </summary>
        /// <param name="thumbprint"></param>
        /// <returns></returns>
        public ActionResult DeleteRecipient(string thumbprint)
        {
            return RedirectToAction("Index");
        }

        public ActionResult ChangeFriendlyName(string thumbprint)
        {
            return RedirectToAction("Index");
        }

        /// <summary>
        ///     Вернуть файл сертификата
        /// </summary>
        /// <param name="thumbPrint"></param>
        /// <returns></returns>
        public ActionResult GetCertificate(string thumbPrint)
        {
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
            return RedirectToAction("LogOff", "Account");
        }

        /// <summary>
        ///     Обновление хранилища
        /// </summary>
        /// <returns></returns>
        public ActionResult RefreshStore()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            if (token != Guid.Empty)
            {
                _cryptxService.RefreshStore(token);
                return RedirectToAction("MyProfile");
            }
            return RedirectToAction("Login", "Account");
        }


        #endregion

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //Guid token = CheckSessionAuthState(CurrentUser, _authService);

            //if (Session["userInfo"] == null)
            //{
            //    if (token != Guid.Empty)
            //    {
            //        UserInfoResponse curUser = _authService.GetUserData(token);
            //        if (curUser != null)
            //        {
            //            Session["userInfo"] = curUser.User;
            //        }

            //    }
            //}
        }

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (filterContext.Result is RedirectToRouteResult || filterContext.Result is RedirectResult)
            {
                string resultAction = "";
                if (filterContext.Result is RedirectToRouteResult)
                    resultAction = ((RedirectToRouteResult)(filterContext.Result)).RouteValues["action"].ToString();
                if (filterContext.Result is RedirectResult)
                    resultAction = ((RedirectResult)(filterContext.Result)).Url;
                string retUrl = Request.RequestContext.HttpContext.Request.Url.ToString();
                retUrl = retUrl.Replace("&amp;", "&");
                if (resultAction.Contains("LogOff"))
                {
                    Session["retUrl"] = retUrl;
                }
            }
        }
    }
}