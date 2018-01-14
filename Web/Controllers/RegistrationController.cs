using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Security;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Identity;
using CryptxOnline.Web.Models;
using CryptxOnline.Web.RegistrationService;


namespace CryptxOnline.Web.Controllers
{
    [System.Web.Mvc.AllowAnonymous]
    public class RegistrationController : BaseAnonymousController
    {
        public ActionResult Index()
        {
            return View();
        }

        [System.Web.Mvc.HttpPost]
        public async Task<ActionResult> Index(RegistrationModel model)
        {

            RegistrationResponse response = _registrationService.Registration(model);
            RegistrationResponseModel respModel = new RegistrationResponseModel();
            respModel.Model = model;
            respModel.RegReponse = response;

            if (response.AuthToken != Guid.Empty)
            {

                AppUser user = new AppUser(response.AuthToken);

                UserInfoResponse userInfo = _authService.GetUserData(response.AuthToken);
                user.FIO = userInfo.User.Name;
                user.City = userInfo.User.City;
                user.RoleChangeDateTime = response.RoleChangeDateTime;
                user.Status = userInfo.User.UserStatus;
                var result = await userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await SignIn(user, userInfo.User.UserRoles);
                }
                Session["userId"] = user.Id;
                //FormsAuthentication.SetAuthCookie(response.AuthToken.ToString(), false);
            }
            if (Request.IsAjaxRequest())
            {
                return Json(response, JsonRequestBehavior.AllowGet);
            }
            return View(respModel);
        }

        public ActionResult CheckPhoneNEmail(string phone,string email)
        {
            RegistrationResponse response = _registrationService.CheckRegistrationPhoneNEmail(phone,email);

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ResendSms(Guid smsConfirmationToken)
        {
            RegistrationResponse response = _registrationService.SmsRegistrationResend(smsConfirmationToken);

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SmsConfirmation(string PIN, Guid smsConfirmationToken)
        {
            RegistrationResponse response = _registrationService.SmsPhoneConfirmation(PIN, smsConfirmationToken);

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityAutocomplete(string pattern)
        {
            GetCityListResponse response = _registrationService.GetCityList(pattern);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}