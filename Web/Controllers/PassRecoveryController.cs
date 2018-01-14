using System;
using System.Web.Mvc;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.PasswordRecoveryService;

namespace CryptxOnline.Web.Controllers
{
    [AllowAnonymous]
    public class PassRecoveryController : BaseAnonymousController
    {
        public ActionResult Index()
        {
            ViewBag.image = "";

            return View("index");
        }

        public String EmailExist(string[] email)
        {
            return "";
        }

        public String getImageCAPTCHA()
        {
            var captcha = new CaptchaGenerator();

            CaptchaGenerator.Info result = captcha.Run();

            System.Web.HttpContext.Current.Session["captchaCode"] = result.text;

            return result.imageBase64;
        }

        public JsonResult existCaptchaCode(string code)
        {
            bool state = ((string) System.Web.HttpContext.Current.Session["captchaCode"] == code) ? true : false;

            return Json(new {state}, JsonRequestBehavior.AllowGet);
        }

        public JsonResult beginRecovery(string email)
        {
            PasswordRecoveryBeginResponse response = _passwordRecoveryService.BeginPasswordRecovery(email);

            if (response.Error != null)
            {
                return Json(new
                {
                    Error = true,
                    response.Error.Code,
                    response.Error.Message
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                Error = false,
                response.State,
                Token = response.RecoveryToken
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult existPhone(string phone, Guid guid)
        {
            PasswordRecoveryResponse response = _passwordRecoveryService.CheckRecoveryPhone(phone, guid);

            if (response.Error != null)
            {
                return Json(new
                {
                    Error = true,
                    response.Error.Code,
                    response.Error.Message
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                Error = false,
                response.State,
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult resentSMS(Guid guid)
        {
            PasswordRecoveryResponse response = _passwordRecoveryService.ResendSmsRecoveryConfirmation(guid);

            if (response.Error != null)
            {
                return Json(new
                {
                    Error = true,
                    response.Error.Code,
                    response.Error.Message
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                Error = false,
                response.State,
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult checkCode(string code, Guid guid)
        {
            PasswordRecoveryResponse response = _passwordRecoveryService.SmsRecoveryConfirmation(code, guid);

            if (response.Error != null)
            {
                return Json(new
                {
                    Error = true,
                    response.Error.Code,
                    response.Error.Message
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                Error = false,
                response.State,
            }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult NewPass(String Id)
        {
            NewPasswordSettingFromRecoveryResponse response = _passwordRecoveryService.EmailRecoveryConfirmation(Id);

            if (response.Error != null && response.RecoveryToken == null)
            {
                return View("linkIsNotActive");
            }
            if (response.State == PasswordRecoveryResponse.RecoveryState.Expire || response.State == PasswordRecoveryResponse.RecoveryState.RecoveryEmailWasUsed)
            {
                return View("linkIsNotActive");
            }
            ViewBag.Token = response.RecoveryToken;

            return View("newPassword");
        }

        public JsonResult setPassword(string pass, Guid guid)
        {
            PasswordRecoveryResponse response = _passwordRecoveryService.NewPasswordFromEmailRecoverySet(pass, guid);

            if (response.Error != null)
            {
                return Json(new
                {
                    Error = true,
                    response.Error.Code,
                    response.Error.Message
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                Error = false,
                response.State
            }, JsonRequestBehavior.AllowGet);
        }
    }
}