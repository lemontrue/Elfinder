using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.MarkerActivationService;
using CryptxOnline.Web.Models.MarkerActivation;

namespace CryptxOnline.Web.Controllers
{
    public class MarkerActivationController : BaseController
    {
        /// <summary>
        /// Главная страница, где отрисовывается сам масьтер активации
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            return View();
        }
        /// <summary>
        /// проверка маркера
        /// </summary>
        /// <param name="login"></param>
        /// <param name="password"></param>
        /// <returns>статус, Id мастера</returns>
        public JsonResult Logon(string login, string password)
        {
            LogonModel model = new LogonModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }


            LogonResponse response = _markerService.LogOn(login, password, token);
            model.MarkerStatus = response.MarkerStatus;
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            MarkerActivationBase markerActivationBase = new MarkerActivationBase(response.SessionData);

            Session[markerActivationBase.Id.ToString()] = markerActivationBase;

            model.CurrentMarkerId = markerActivationBase.Id;

            model.Status = response.Status;
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// проверка верности смс
        /// </summary>
        /// <param name="pin">пин из смс</param>
        /// <param name="currentMarkerId"></param>
        /// <returns></returns>
        public JsonResult CheckSms(string pin, Guid currentMarkerId)
        {
            LogonModel model = new LogonModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }


            if (Session[currentMarkerId.ToString()] == null)
            {
                model.Status = MainStatus.NeedRelogin;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            MarkerActivationBase markerActivationBase = Session[currentMarkerId.ToString()] as MarkerActivationBase;

            MarkerActivationResponse response = _markerService.CheckSms(pin, markerActivationBase.PhpSessionStream, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }


            model.CurrentMarkerId = markerActivationBase.Id;
            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Возвращаем инфу для показа пользователю
        /// </summary>
        /// <param name="currentMarkerId"></param>
        /// <returns></returns>
        public JsonResult GetCertificateInfo(Guid currentMarkerId)
        {
            CertificateInfoModel model = new CertificateInfoModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }


            if (Session[currentMarkerId.ToString()] == null)
            {
                model.Status = MainStatus.NeedRelogin;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            MarkerActivationBase markerActivationBase = Session[currentMarkerId.ToString()] as MarkerActivationBase;

            GetCertificateInfoResponse response = _markerService.GetCertificateInfo(markerActivationBase.PhpSessionStream, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            if (response.Status == MainStatus.Failed || response.Status == MainStatus.NeedRelogin || response.Status == MainStatus.NeedSmsConfirmation)
            {
                model.Status = response.Status;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            markerActivationBase.LoadCertificateXML(response.CertificateXML, Session);
            model.ShowingInfo = response.CertInfoDictionary;
            model.Status = response.Status;
            return Json(model, JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetCertificateInfoConfirmedRequest(Guid currentMarkerId)
        {
            CertificateInfoModel model = new CertificateInfoModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }



            GetCertificateInfoResponse response = _markerService.GetCertificateInfoByLogin(currentMarkerId, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            if (response.Status == MainStatus.Failed || response.Status == MainStatus.NeedRelogin || response.Status == MainStatus.NeedSmsConfirmation)
            {
                model.Status = response.Status;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            
            model.ShowingInfo = response.CertInfoDictionary;
            model.Status = response.Status;
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ResendSms(Guid currentMarkerId)
        {
            MarkerActivationModel model = new MarkerActivationModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }


            if (Session[currentMarkerId.ToString()] == null)
            {
                model.Status = MainStatus.NeedRelogin;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            MarkerActivationBase markerActivationBase = Session[currentMarkerId.ToString()] as MarkerActivationBase;

            MarkerActivationResponse response = _markerService.ResendSms(markerActivationBase.PhpSessionStream, token);

            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            model.Status = MainStatus.Success;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CreateCertificateRequest(Guid currentMarkerId, string login, string password, string pin, bool SavePIN, bool SendSMS, bool SendEmail)
        {

            CreateRequestModel model = new CreateRequestModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            if (Session[currentMarkerId.ToString()] == null)
            {
                model.Status = MainStatus.NeedRelogin;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            MarkerActivationBase markerActivationBase = Session[currentMarkerId.ToString()] as MarkerActivationBase;

            CreateRequestParams param = new CreateRequestParams();
            param.Login = login;
            param.Password = password;
            param.Pin = pin;
            param.Savepin = SavePIN;
            param.SendEmail = SendEmail;
            param.SendSms = SendSMS;

            CreateRequestResponse response = _markerService.CreateRequest(markerActivationBase.PhpSessionStream, param, null, token, true);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);

        }

        public JsonResult GetUserHtmlCard(Guid requestId)
        {
            UserHtmlCardModel model = new UserHtmlCardModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            GetUserHtmlResponse response = _markerService.GetUserHtml(requestId, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            model.Html = response.UserHtml;
            model.Status = response.Status;
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetRequestData(Guid requestId,string fileName)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }

            GetRequestDataResponse response = _markerService.GetRequestData(requestId, token);

            if (response.Error != null)
            {
                throw new ApplicationException(response.Error.Message);
            }
            byte[] array = response.Data;
            return File(array, "application/octet-stream", fileName);
        }

        public JsonResult GetNSetCertificate(Guid requestId, string pin)
        {
            GetNSetCertificateModel model = new GetNSetCertificateModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            GetNSetCertificateResponse response = _markerService.GetNSetCertificate(requestId, pin, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            response.Status = model.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        [MyAuthorize("User, GroupAdmin, SysAdmin", "Confirmed,New")]
        public JsonResult GetNSetTestCertificate(string pin)
        {
            GetNSetCertificateModel model = new GetNSetCertificateModel();

            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            GetNSetTestCertificateResponse response = _markerService.GetNSetTestCertificate(pin, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                model.Status = MainStatus.Failed;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            model.Status = response.Status;
            model.CertificateInfo = response.TestCertificateInfo;
            return Json(model, JsonRequestBehavior.AllowGet);
        }


        public JsonResult DeleteRequest(Guid requestId)
        {

            MarkerActivationModel model = new MarkerActivationModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            MarkerActivationResponse response = _markerService.DeleteRequest(requestId, token);
            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ResendRequest(Guid requestId)
        {
            MarkerActivationModel model = new MarkerActivationModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            CreateRequestResponse response = _markerService.ResendRequest(requestId, token);
            if (response.Status == MainStatus.NeedSmsConfirmation)
            {
                MarkerActivationBase markerActivationBase = new MarkerActivationBase(response.SessionData,requestId);
                Session[markerActivationBase.Id.ToString()] = markerActivationBase;
            }


            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ResendRequestAfterCheckSms(Guid requestId)
        {
            MarkerActivationModel model = new MarkerActivationModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }
            MarkerActivationBase markerActivationBase = Session[requestId.ToString()] as MarkerActivationBase;


            CreateRequestResponse response = _markerService.ResendRequestPhpSessionLogin(requestId, markerActivationBase.PhpSessionStream, token);


            if (response.Error != null)
            {
                model.Error = response.Error;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetMyRequests(Guid? userId)
        {
            MyRequestsModel model = new MyRequestsModel();
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                model.Status = MainStatus.Failed;
                model.SystemLogoff = true;
                return Json(model, JsonRequestBehavior.AllowGet);
            }

            GetMyCertificatesRequestsResponse response = _markerService.GetMyCertificatesRequests(GetMyCertificatesRequestsResponse.Sort.NameASC, (userId == null ? Guid.Empty : (Guid)userId), token);
            model.Requests = response.MyCertificateRequests;
            model.Status = response.Status;

            return Json(model, JsonRequestBehavior.AllowGet);
        }
    }
}