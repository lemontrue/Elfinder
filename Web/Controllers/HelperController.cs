using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using CaptchaMvc.Attributes;
using CaptchaMvc.HtmlHelpers;
using CaptchaMvc.Interface;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using WebDav;

namespace CryptxOnline.Web.Controllers
{
    [AllowAnonymous]
    public class HelperController : BaseController
    {
        [HttpPost]
        public ActionResult FindCertificate(string searchString, bool? isActive, Guid? contactId, string addToContact,
            string selectedItem, Guid? userId, bool all = false)
        {
            ViewBag.all = all;
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
            }
            ViewBag.contactId = contactId;
            ViewBag.UserId = (userId == null ? Guid.Empty : (Guid)userId);
            bool isActiveCur = isActive ?? false;
            if (string.IsNullOrEmpty(addToContact))
            {
                var model = new List<CertificateInfoContactAdd>();
                SearchResultResponse response = _cryptxService.GetCertificatesBySearchString(searchString, isActiveCur,
                    all, token);
                if (response.Exception == null)
                {
                    foreach (CertificateInfo certificateInfo in response.Certificates)
                    {
                        var curCert = new CertificateInfoContactAdd();
                        curCert.CertificateId = certificateInfo.CertificateId;
                        curCert.SubjectName = certificateInfo.SubjectName;
                        curCert.IssureName = certificateInfo.IssureName;
                        if (certificateInfo.RecipientCertificate != null &&
                            certificateInfo.RecipientCertificate.FriendlyName != null)
                            curCert.FriendlyName = certificateInfo.RecipientCertificate.FriendlyName;
                        curCert.Thumbprint = certificateInfo.Thumbprint;
                        curCert.Organization = certificateInfo.Organization;
                        curCert.IsTest = certificateInfo.IsTest;
                        if (curCert.FriendlyName == null)
                            curCert.FriendlyName = string.Empty;
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
                return View(model);
            }
            if (!string.IsNullOrEmpty(selectedItem) && contactId != null && contactId != Guid.Empty)
            {
                var serializaer = new JavaScriptSerializer();
                var certs = serializaer.Deserialize<List<CertificateInfoContactAdd>>(selectedItem);
                var requestList = new List<CertificateAddRequest>();
                foreach (CertificateInfoContactAdd certificateInfoContactAdd in certs)
                {
                    requestList.Add(new CertificateAddRequest
                    {
                        CertificateId = certificateInfoContactAdd.CertificateId
                    });
                }
                _cryptxService.AddCertificatesToContact((Guid)contactId, requestList,
                    (userId == null ? Guid.Empty : (Guid)userId), token);
            }

            return View();
        }

        public ActionResult FindCertificate(Guid? contactId, Guid? userId, bool all = false)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                ViewBag.login = true;
            }
            ViewBag.contactId = contactId;
            ViewBag.all = all;
            var model = new List<CertificateInfoContactAdd>();
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid)userId;
            return View(model);
        }

        public ActionResult DownloadFile(string downloadedFileUri)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            string filenameForFF = downloadedFileUri;
            var downloadedFileUriInfo = new FileInfo(downloadedFileUri);
            string fileName = HttpUtility.UrlEncode(downloadedFileUriInfo.Name).Replace(@"+", @"%20");


            if (Request.Browser.Browser == "Firefox")
                fileName = filenameForFF;
            if (!string.IsNullOrEmpty(fileName))
            {
                WebDavClient webDavClient = Helper.InitWebDav(token, _authService);
                //new WebDavClient(downloadedFileUri, Model.UserInfo.User.Login, Model.UserInfo.User.Password);
                byte[] retfile = webDavClient.Download(downloadedFileUri);
                if (webDavClient.LastError != null)
                    throw new HttpException(404,
                        " Ошибка чтения исходного файла" + fileName + " : " + webDavClient.LastError);
                return File(retfile, "application/octet-stream", fileName);
            }
            if (Request.IsAjaxRequest())
            {
                return
                    Json(
                        new
                        {
                            status = "Error",
                            errorCode = "",
                            errorMessage = " Ошибка чтения исходного файла" + fileName
                        }, JsonRequestBehavior.AllowGet);
            }
            throw new HttpException(404, " Ошибка чтения исходного файла" + fileName);
        }

        public ActionResult MyCertificates(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            CertificatesResponse response =
                _cryptxService.GetMyCertificates((userId == null ? Guid.Empty : (Guid)userId), token);

            if (response.Exception != null)
            {
                throw response.Exception;
            }
            var model = new List<CertificateInfoContactAdd>();
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
            return View(model);
        }

        public ActionResult GetCertificatesInfo(List<string> thumbprints, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new { Status = "logoff" }, JsonRequestBehavior.AllowGet);
            }
            var certificates = new List<CertificateInfoContactAdd>();
            foreach (string thumbprint in thumbprints)
            {
                CertificateResponse response = _cryptxService.GetCertificate(thumbprint,
                    (userId == null ? Guid.Empty : (Guid)userId), token);

                CertificateInfo certificateInfo = response.Certificate;

                var curCert = new CertificateInfoContactAdd();
                curCert.IsMyCert = certificateInfo.MyCertificate != null;
                if (certificateInfo.RecipientCertificate != null &&
                    certificateInfo.RecipientCertificate.FriendlyName != null)
                    curCert.FriendlyName = certificateInfo.RecipientCertificate.FriendlyName;
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

                certificates.Add(curCert);
            }


            return Json(new { Status = "ok", certificates }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Captcha(string id)
        {
            return View();
        }

        [HttpPost, CaptchaVerify("Captcha is not valid")]
        public ActionResult Captcha()
        {
            if (ModelState.IsValid)
            {
                ModelState.Clear();
                if (Request.IsAjaxRequest())
                    return Json(new
                    {
                        Message = "Success",
                        IsOk = bool.TrueString
                    });
                return View();
            }
            if (Request.IsAjaxRequest())
            {
                IUpdateInfoModel captchaValue = this.GenerateCaptchaValue(5);
                return Json(new
                {
                    Message = "Captcha is not valid",
                    Captcha =
                        new Dictionary<string, string>
                        {
                            {captchaValue.ImageElementId, captchaValue.ImageUrl},
                            {captchaValue.TokenElementId, captchaValue.TokenValue}
                        }
                });
            }
            return View();
        }

        public JsonResult GetVisualizationInfo(string fileName)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            var response = new GetVisualizationResponse();
            if (token == Guid.Empty)
            {
                response.Error = new CryptxServiceError { Code = 401 };
            }
            else
            {
                response = _cryptxService.GetVisualizationUrl(fileName, token);
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        public ActionResult GetTaxnetIdActivation(string email)
        {
            if (!string.IsNullOrEmpty(email))
            {
                try
                {
                    GetKobilActivationResponse response = _authService.GetKobilActivation(email);
                    if (response.Status == GetKobilActivationResponse.GetKobilActivationStatus.SENDVIAEMAIL)
                        ViewBag.Status = "Код активации выслан по Email";
                    if (response.Status == GetKobilActivationResponse.GetKobilActivationStatus.SENDVIASMS)
                        ViewBag.Status = "Код активации выслан по СМС";
                    if (response.Status == GetKobilActivationResponse.GetKobilActivationStatus.FAILURE)
                        ViewBag.Status = "Ошибка при отправке кода активации";
                    if (response.Error != null)
                    {
                        ViewBag.Error = response.Error.Message;
                    }
                    if (Request.IsAjaxRequest())
                    {
                        return Json(response, JsonRequestBehavior.AllowGet);
                    }
                }
                catch (Exception ex)
                {
                    if (Request.IsAjaxRequest())
                        return new HttpStatusCodeResult(500, ex.Message);
                }

            }
            return View();
        }

        [AllowAnonymous]
        public ActionResult Landing()
        {

            return View();
        }


        [AllowAnonymous]
        public ActionResult UnderCounstruction()
        {

            return View();
        }
    }
}