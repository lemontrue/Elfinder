using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models;
using Newtonsoft.Json;


namespace CryptxOnline.Web.Controllers
{
    public class AddressBookController : BaseController
    {
        public ActionResult Index(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            var navigation = new MyNavigation();
            navigation.Navigations.Add(new NavElement
            {
                Depth = 1,
                Name = "Адресная книга",
                Action = "Index",
                Controller = "AddressBook",
                IsUrl = false
            });
            var userInfo = (UserInfo) Session["userInfo"];
            ViewBag.userInfo = userInfo;
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            return View();
        }

        [HttpPost]
        public ActionResult ContactList(Contacts contacts, Guid? userId)
        {
            string status = "";
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                status = "logoff";
                return View(new AddressBookModel {Status = status});
            }

            UserAddressBookResponse response = _cryptxService.GetAddressBook(contacts.SearchString, contacts.Sort,
                contacts.Filter, (userId == null ? Guid.Empty : (Guid) userId), token, 0);
            var model = new AddressBookModel(response);
            model.Status = status;
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            var navigation = new MyNavigation();

            if (userId != null && userId != Guid.Empty)
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });
                UserInfoResponse responseUser = _authService.GetUserDataByID((Guid) userId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = responseUser.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Список контактов",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Адресная книга",
                    Action = "Index",
                    Controller = "AddressBook",
                    IsUrl = false
                });
            }
            navigation.Navigations = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            ViewBag.nav = Helper.HtmlNavElement(navigation, Request.RequestContext);

            return View(model);
        }

        [HttpGet]
        public ActionResult ContactList(Guid? userId)
        {
            string status = "";
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                status = "logoff";
                var modelr = new AddressBookModel();
                modelr.Status = status;
                return View(modelr);
                //return RedirectToAction("LogOff", "Account");
            }
            UserAddressBookResponse response = _cryptxService.GetAddressBook("", AddressBookSort.ContactNameASC,
                AddressBookFilter.All, (userId == null ? Guid.Empty : (Guid) userId), token, 0);
            var model = new AddressBookModel(response);
            model.Status = status;

            var navigation = new MyNavigation();
            if (userId != null && userId != Guid.Empty)
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });
                UserInfoResponse responseUser = _authService.GetUserDataByID((Guid) userId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = responseUser.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Список контактов",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Адресная книга",
                    Action = "Index",
                    Controller = "AddressBook",
                    IsUrl = false
                });
            }
            navigation.Navigations = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            ViewBag.nav = Helper.HtmlNavElement(navigation, Request.RequestContext);
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;


            return View(model);
        }

        [HttpPost]
        public ActionResult CertificateList(Certificates certificates, string que, string save, string deletingCerts,
            string toContactList, Guid? userId)
        {
            var js = new JavaScriptSerializer();
            var delCerts = (List<string>) js.Deserialize(deletingCerts, typeof (List<string>));

            string status = "";
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            AddressBookModel model;
            if (token == Guid.Empty)
            {
                status = "logoff";
                model = new AddressBookModel();
                model.Status = status;
                return View(model);
            }

            //удаление сертов
            if (delCerts != null && delCerts.Count > 0 && que == null)
            {
                foreach (string delCert in delCerts)
                {
                    _cryptxService.DeleteRecipientRelation(delCert, (userId == null ? Guid.Empty : (Guid) userId), token);
                }
            }

            try
            {
                CertificatesResponse response = _cryptxService.GetUserCertificates(certificates.SearchString,
                    certificates.Sort, certificates.Filter, (userId == null ? Guid.Empty : (Guid) userId), token, 0);
                model = new AddressBookModel(response);
            }
            catch (Exception exception)
            {
                model = new AddressBookModel();
                status = "logoff";
            }
            var navigation = new MyNavigation();

            if (userId != null && userId != Guid.Empty)
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });
                UserInfoResponse responseUser = _authService.GetUserDataByID((Guid) userId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = responseUser.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Список сертификатов",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Адресная книга",
                    Action = "Index",
                    Controller = "AddressBook",
                    IsUrl = false
                });
            }
            navigation.Navigations = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            ViewBag.nav = Helper.HtmlNavElement(navigation, Request.RequestContext);

            model.Status = status;
            ViewBag.UserId = (userId == null ? Guid.Empty : (Guid) userId);
            return View(model);
        }

        public ActionResult CertificateList(Guid? userId)
        {
            string status = "";
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            AddressBookModel model;
            if (token == Guid.Empty)
            {
                status = "logoff";
                model = new AddressBookModel();
                model.Status = status;
                return View(model);
                //return RedirectToAction("LogOff", "Account");
            }
            try
            {
                CertificatesResponse response = _cryptxService.GetUserCertificates("", CertificateSort.FriendlyNameASC,
                    CertificateFilter.Active, (userId == null ? Guid.Empty : (Guid) userId), token, 0);
                model = new AddressBookModel(response);
            }
            catch (Exception exception)
            {
                throw;
            }

            var navigation = new MyNavigation();

            if (userId != null && userId != Guid.Empty)
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });
                UserInfoResponse responseUser = _authService.GetUserDataByID((Guid) userId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = responseUser.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Список сертификатов",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Адресная книга",
                    Action = "Index",
                    Controller = "AddressBook",
                    IsUrl = false
                });
            }
            navigation.Navigations = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            ViewBag.nav = Helper.HtmlNavElement(navigation, Request.RequestContext);


            ViewBag.UserId = (userId == null ? Guid.Empty : (Guid) userId);
            model.Status = status;

            return View(model);
        }

        /// <summary>
        ///     удаляем свзяь контакта с сертификатом
        /// </summary>
        /// <param name="contactId"></param>
        /// <param name="certificateId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult DeleteCertificateRelation(Guid contactId, Guid certificateId, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new {status = "logoff"}, JsonRequestBehavior.AllowGet);
            }
            string statusText = "ok";
            try
            {
                _cryptxService.DeleteCertificateFromContact(contactId, certificateId,
                    (userId == null ? Guid.Empty : (Guid) userId), token);
            }
            catch
            {
                statusText = "Возникла ошибка при удалении сертификата из контакта";
            }
            return Json(new {status = statusText}, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult CreateContact(string Name, string Email, string certificates, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                return View();
            }

            var serializaer = new JavaScriptSerializer();
            var contact = new Contact();
            contact.Email = Email;
            contact.Name = Name;
            contact.ID = Guid.NewGuid();
            var certs =
                serializaer.Deserialize<List<CertificateInfoContactAdd>>(certificates);
            contact.Certificates = new List<ContactCertificateRelationship>();
            foreach (CertificateInfoContactAdd certificateInfoContactAdd in certs)
            {
                var contactCertificateRelationship = new ContactCertificateRelationship();
                //серт не в сессии
                if (Session[certificateInfoContactAdd.Thumbprint] != null)
                {
                    contactCertificateRelationship.CertificateBytes =
                        (byte[]) Session[certificateInfoContactAdd.Thumbprint];
                }
                    //серт из БД
                else
                {
                    contactCertificateRelationship.CertificateID = certificateInfoContactAdd.CertificateId;
                }
                contactCertificateRelationship.FriendlyName = certificateInfoContactAdd.FriendlyName;
                contact.Certificates.Add(contactCertificateRelationship);
            }
            _cryptxService.CreateContact(contact, (userId == null ? Guid.Empty : (Guid) userId), token);
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            ViewBag.refresh = true;
            return View();
        }

        [HttpGet]
        public ActionResult CreateContact(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                //return RedirectToAction("LogOff", "Account");
            }
            if (Request.QueryString.AllKeys.Contains("Thumbprint"))
            {
                string thmbprnt = Request.QueryString["Thumbprint"];
                string sbjctName = Request.QueryString["SubjectName"];
                string timeMsg = Request.QueryString["TimeMessage"];
                var cert = new CertificateInfoContactAdd();
                cert.Thumbprint = thmbprnt;
                cert.SubjectName = sbjctName;
                cert.TimeMessage = timeMsg;
                ViewBag.cert = JsonConvert.SerializeObject(cert);
                    //JsonConvert.SerializeObject(cert,Formatting.Indented);
                ViewBag.cert = ViewBag.cert.ToString().Replace("&quot;", "");
            }
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;

            return View();
        }

        [HttpPost]
        public ActionResult AddCertificateToContact(Guid? contactId, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                //return RedirectToAction("LogOff", "Account");
            }

            //string fileName =  Uri.EscapeDataString(Request.Headers["X-File-Name"]);
            string fileType = Request.Headers["X-File-Type"];
            int fileSize = Convert.ToInt32(Request.Headers["X-File-Size"]);
            Stream fileContent = Request.InputStream;
            var buf = new byte[fileSize];
            fileContent.Read(buf, 0, fileSize);
            var data = new CertificateInfoContactAdd();
            try
            {
                var x509Certificate2 = new X509Certificate2(buf);
            }
            catch (Exception ex)
            {
                data.Status =
                    "Файл не соответствует требованиям к сертификатам, используемым в Cryptogramm. Загрузка невозможна.";
                return Json(data);
            }

            if (contactId == null)
            {
                try
                {
                    var x509Certificate2 = new X509Certificate2(buf);
                    if (!x509Certificate2.SignatureAlgorithm.FriendlyName.ToLower().Contains("гост"))
                    {
                        data.Status =
                            "Файл не соответствует требованиям к сертификатам, используемым в Cryptogramm. Загрузка невозможна.";
                        return Json(data);
                    }


                    Session[x509Certificate2.Thumbprint] = buf;

                    data.SubjectName = x509Certificate2.GetNameInfo(X509NameType.SimpleName, false);
                    data.Thumbprint = x509Certificate2.Thumbprint;
                    if (DateTime.Now < x509Certificate2.NotBefore)
                    {
                        data.TimeMessage = "Недействителен до " +
                                           x509Certificate2.NotBefore.Date.ToShortDateString().Replace("/", ".");
                    }
                    if (DateTime.Now > x509Certificate2.NotBefore && DateTime.Now < x509Certificate2.NotAfter)
                    {
                        data.TimeMessage = "Действителен до " +
                                           x509Certificate2.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    else
                    {
                        data.TimeMessage = "Недействителен с " +
                                           x509Certificate2.NotAfter.Date.ToShortDateString().Replace("/", ".");
                    }
                    data.FriendlyName = "";
                    data.Status = "ok";
                    return Json(data);
                }
                catch (Exception ex)
                {
                    data.Status =
                        "Файл не соответствует требованиям к сертификатам, используемым в Cryptogramm. Загрузка невозможна.";
                    return Json(data);
                }
            }

            #region Проверка на наличие серта в списке

            if (Request.Headers.AllKeys.Contains("contactCertificates"))
            {
                var js = new JavaScriptSerializer();
                var contactCertificates =
                    (List<string>) js.Deserialize(Request.Headers["contactCertificates"], typeof (List<string>));
                var x509Cert2 = new X509Certificate2(buf);
                if (contactCertificates.Contains(x509Cert2.Thumbprint))
                {
                    data.Status = "Выбранный сертификат уже присутствует в списке";
                    return Json(data);
                }
            }

            #endregion

            var listCerts = new List<CertificateAddRequest>();
            listCerts.Add(new CertificateAddRequest
            {
                CertificateBytes = buf
            });

            _cryptxService.AddCertificatesToContact((Guid) contactId, listCerts,
                (userId == null ? Guid.Empty : (Guid) userId), token);
            data.Status = "refresh";
            return Json(data);
        }

        public ActionResult AddRecipientCertificateToUser(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new {Status = "logoff"});
                //return RedirectToAction("LogOff", "Account");
            }

            string fileName = Request.Headers["X-File-Name"];
            string fileType = Request.Headers["X-File-Type"];
            int fileSize = Convert.ToInt32(Request.Headers["X-File-Size"]);
            Stream fileContent = Request.InputStream;
            var buf = new byte[fileSize];
            fileContent.Read(buf, 0, fileSize);
            try
            {
                var x509Certificate2 = new X509Certificate2(buf);
                if (!x509Certificate2.SignatureAlgorithm.FriendlyName.ToLower().Contains("гост"))
                {
                    return
                        Json(
                            new
                            {
                                Status =
                                    "Файл не соответствует требованиям к сертификатам, используемым в Cryptogramm. Загрузка невозможна."
                            });
                }
            }
            catch (Exception)
            {
                return
                    Json(
                        new
                        {
                            Status =
                                "Файл не соответствует требованиям к сертификатам, используемым в Cryptogramm. Загрузка невозможна."
                        });
            }

            AddRecipientResponse response = _cryptxService.AddRecipientCertificate(buf, "",
                (userId == null ? Guid.Empty : (Guid) userId), token);
            if (response.Exception == null)
            {
                string status = "";
                if (response.Status == AddRecipientResponse.StatusTypes.CertInDB)
                {
                    status = "refresh";
                }
                if (response.Status == AddRecipientResponse.StatusTypes.CertAdded)
                {
                    status = "refresh";
                }
                if (response.Status == AddRecipientResponse.StatusTypes.CertHasRelation)
                {
                    status = "Выбранный сертификат уже присутствует в списке";
                }
                return Json(new {Status = status});
            }
            return Json(new {ErrorMessage = response.Exception.Message});
        }

        [HttpPost]
        public ActionResult EditContact(Guid contactId, ContactCertificatesModel model, string que, string save,
            string deleteContact, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                return View();
            }
            if (!string.IsNullOrEmpty(save))
            {
                var contactToEdit = new Contact();
                contactToEdit.ID = model.ID;
                contactToEdit.Name = model.Name;
                contactToEdit.Email = model.Email;
                contactToEdit.Certificates = new List<ContactCertificateRelationship>();
                if (Request.Form.AllKeys.Contains("certificate.FriendlyName"))
                {
                    //List<string> frNames = Request.Form["certificate.FriendlyName"].Split(',').ToList();
                    List<string> ids = Request.Form["certificate.Id"].Split(',').ToList();
                    List<string> thumbprints = Request.Form["certificate.Thumbprint"].Split(',').ToList();

                    for (int i = 0; i < ids.Count; i++)
                    {
                        var certificateRelationship = new ContactCertificateRelationship();
                        certificateRelationship.CertificateInfo = new CertificateInfo();
                        certificateRelationship.CertificateID = new Guid(ids[i]);
                        certificateRelationship.CertificateInfo.CertificateId = new Guid(ids[i]);
                        //certificateRelationship.FriendlyName = frNames[i];
                        certificateRelationship.CertificateInfo.Thumbprint = thumbprints[i];
                        contactToEdit.Certificates.Add(certificateRelationship);
                    }
                }
                _cryptxService.EditContact(contactToEdit, (userId == null ? Guid.Empty : (Guid) userId), token);
            }

            List<ContactCertificateRelationship> certificates = _cryptxService.GetContactCertificates(contactId,
                model.SearchString, model.Sort, model.Filter, (userId == null ? Guid.Empty : (Guid) userId), token);
            model.Certificates.Clear();
            Contact contact = _cryptxService.GetContact(contactId, (userId == null ? Guid.Empty : (Guid) userId), token);
            model.Name = contact.Name;
            model.Email = contact.Email;
            foreach (ContactCertificateRelationship contactCertificateRelationship in certificates)
            {
                var certificate = new ContactCertificate();
                certificate.Id = contactCertificateRelationship.CertificateID;
                certificate.FriendlyName = contactCertificateRelationship.FriendlyName;
                certificate.Thumbprint = contactCertificateRelationship.CertificateInfo.Thumbprint;
                certificate.SubjectName = contactCertificateRelationship.CertificateInfo.SubjectName;
                certificate.IsTest = contactCertificateRelationship.CertificateInfo.IsTest;

                if (DateTime.Now < contactCertificateRelationship.CertificateInfo.NotBefore)
                {
                    certificate.TimeMessage = "Недействителен до " +
                                              contactCertificateRelationship.CertificateInfo.NotBefore.Date
                                                  .ToShortDateString().Replace("/", ".");
                }
                if (DateTime.Now > contactCertificateRelationship.CertificateInfo.NotBefore &&
                    DateTime.Now < contactCertificateRelationship.CertificateInfo.NotAfter)
                {
                    certificate.TimeMessage = "Действителен до " +
                                              contactCertificateRelationship.CertificateInfo.NotAfter.Date
                                                  .ToShortDateString().Replace("/", ".");
                }
                else
                {
                    certificate.TimeMessage = "Недействителен с " +
                                              contactCertificateRelationship.CertificateInfo.NotAfter.Date
                                                  .ToShortDateString().Replace("/", ".");
                    certificate.TimeMessageStyle = "color: red";
                }
                if (contactCertificateRelationship.CertificateInfo != null &&
                    !string.IsNullOrEmpty(contactCertificateRelationship.CertificateInfo.Organization))
                    certificate.Organization = contactCertificateRelationship.CertificateInfo.Organization;
                if (contactCertificateRelationship.CertificateInfo != null &&
                    !string.IsNullOrEmpty(contactCertificateRelationship.CertificateInfo.INN))
                    certificate.INN = "ИНН " + contactCertificateRelationship.CertificateInfo.INN;
                model.Certificates.Add(certificate);
            }
            //запрос с потерей данных
            if (!string.IsNullOrEmpty(que))
            {
                ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
                return View(model);
            }
            return RedirectToAction("ContactList", new {userId = (userId == null ? Guid.Empty : (Guid) userId)});
        }

        public ActionResult EditContact(Guid contactId, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                return View();
            }
            Contact contact = _cryptxService.GetContact(contactId, (userId == null ? Guid.Empty : (Guid) userId), token);

            var model = new ContactCertificatesModel();
            model.ID = contact.ID;
            model.Name = contact.Name;
            model.Email = contact.Email;
            model.Sort = CertificateSort.FriendlyNameASC;
            model.Filter = CertificateFilter.All;
            //model.Certificates = contact.Certificates;
            foreach (ContactCertificateRelationship contactCertificateRelationship in contact.Certificates)
            {
                var certificate = new ContactCertificate();
                certificate.ContactId = contact.ID;
                certificate.Id = contactCertificateRelationship.CertificateID;
                certificate.FriendlyName = contactCertificateRelationship.FriendlyName;
                certificate.Thumbprint = contactCertificateRelationship.CertificateInfo.Thumbprint;
                certificate.SubjectName = contactCertificateRelationship.CertificateInfo.SubjectName;
                certificate.IsTest = contactCertificateRelationship.CertificateInfo.IsTest;

                if (DateTime.Now < contactCertificateRelationship.CertificateInfo.NotBefore)
                {
                    certificate.TimeMessage = "Недействителен до " +
                                              contactCertificateRelationship.CertificateInfo.NotBefore.Date
                                                  .ToShortDateString().Replace("/", ".");
                }
                if (DateTime.Now > contactCertificateRelationship.CertificateInfo.NotBefore &&
                    DateTime.Now < contactCertificateRelationship.CertificateInfo.NotAfter)
                {
                    certificate.TimeMessage = "Действителен до " +
                                              contactCertificateRelationship.CertificateInfo.NotAfter.Date
                                                  .ToShortDateString().Replace("/", ".");
                }
                else
                {
                    certificate.TimeMessage = "Недействителен с " +
                                              contactCertificateRelationship.CertificateInfo.NotAfter.Date
                                                  .ToShortDateString().Replace("/", ".");
                    certificate.TimeMessageStyle = "color: red";
                }
                if (contactCertificateRelationship.CertificateInfo != null &&
                    !string.IsNullOrEmpty(contactCertificateRelationship.CertificateInfo.Organization))
                    certificate.Organization = contactCertificateRelationship.CertificateInfo.Organization;
                if (contactCertificateRelationship.CertificateInfo != null &&
                    !string.IsNullOrEmpty(contactCertificateRelationship.CertificateInfo.INN))
                    certificate.INN = "ИНН " + contactCertificateRelationship.CertificateInfo.INN;

                model.Certificates.Add(certificate);
            }

            var navigation = new MyNavigation();

            if (userId != null && userId != Guid.Empty)
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Администрирование",
                    Action = "Index",
                    Controller = "Administration",
                    IsUrl = true
                });
                UserInfoResponse responseUser = _authService.GetUserDataByID((Guid) userId);
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 3,
                    Name = responseUser.User.Name,
                    IsUrl = false
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 4,
                    Name = "Контакт: " + contact.Name,
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Адресная книга",
                    Action = "Index",
                    Controller = "AddressBook",
                    IsUrl = true
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 2,
                    Name = model.Name,
                    Action = "",
                    Controller = "",
                    IsUrl = false
                });
            }
            navigation.Navigations = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            ViewBag.nav = Helper.HtmlNavElement(navigation, Request.RequestContext);
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            return View(model);
        }

        public ActionResult DeleteContact(Guid contactId, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("ContactList", "AddressBook");
            }
            _cryptxService.DeleteContact(contactId, (userId == null ? Guid.Empty : (Guid) userId), token);
            return RedirectToAction("ContactList", new {userId = (userId == null ? Guid.Empty : (Guid) userId)});
        }

        public JsonResult ChangeFriendlyName(string frName, string thumbprint, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
                return Json(new {Status = "logoff"});
            }
            bool result = _cryptxService.ChangeFriendlyName(thumbprint, frName,
                (userId == null ? Guid.Empty : (Guid) userId), token);
            return Json(new {Status = (result ? "ok" : "not ok")});
        }

        /// <summary>
        ///     удаляем связь сенртификата с пользователем
        /// </summary>
        /// <param name="thumbprint"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult DeleteReceipientCertificate(string thumbprint, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new {Status = "logoff"});
            }

            _cryptxService.DeleteRecipientRelation(thumbprint, (userId == null ? Guid.Empty : (Guid) userId), token);
            return Json(new {Status = "ok"});
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            //if (token  == Guid.Empty)
            //{
            //    filterContext.Result = RedirectToAction("LogOff", "Account");
            //    return;
            //}

            if (Session["userInfo"] == null)
            {
                if (token != Guid.Empty)
                {
                    UserInfoResponse curUser = _authService.GetUserData(token);
                    Session["userInfo"] = curUser.User;
                }
            }
        }

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (filterContext.Result is RedirectToRouteResult)
            {
                string resultAction =
                    ((RedirectToRouteResult) (filterContext.Result)).RouteValues["action"].ToString();
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