using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Identity;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
//using StackExchange.Profiling;
using Helper = CryptxOnline.Web.Helpers.Helper;

namespace CryptxOnline.Web.Controllers
{
    [AllowAnonymous]
    public class AccountController : BaseAnonymousController
    {
        [HttpGet]
        public ActionResult Login()
        {
            //MiniProfiler.Current.Step("Login");
            if (Request.QueryString["ReturnUrl"] != null)
            {
                Session["retUrl"] = Request.QueryString["retUrl"];
                ViewBag.retUrl = Request.QueryString["retUrl"];
            }
            if (Session["retUrl"] != null)
            {
                ViewBag.retUrl = Session["retUrl"];
            }
            return View();
        }

        /// <summary>
        ///     Логин2
        /// </summary>
        /// <param name="login1">логин</param>
        /// <param name="password">пароль</param>
        /// <returns></returns>
        [AllowAnonymous]
        [System.Web.Mvc.HttpPost]
        public async Task<ActionResult> LoginGuid(string login1, string password)
        {
            string login = login1;
            ClearSession();
            if (string.IsNullOrEmpty(login) && string.IsNullOrEmpty(password))
            {
                return Json(new { errorMsg = "Введите E-mail и пароль!" }, JsonRequestBehavior.AllowGet);
            }
            Guid token = Guid.Empty;
            var loginResponse = new LoginResponse();
            try
            {
                if (string.IsNullOrEmpty(password))
                {
                    loginResponse = _authService.KobilLoginWithoutPassword(login);
                }
                else
                {
                    loginResponse = _authService.Login(login, password);
                }

                token = loginResponse.Token; // _sc.Login(login, password);
            }
            catch (Exception ex)
            {
                if (ex is EndpointNotFoundException)
                {
                    return Json(new { errorMsg = "Cервис временно недоступен, зайдите позже" },
                        JsonRequestBehavior.AllowGet);
                }
                return Json(new { errorMsg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            //if (loginResponse.KobilAuthEnabled != null)
            //    if (!(bool)loginResponse.KobilAuthEnabled)
            //    {
            //        return Json(new { loginResponse.KobilAuthEnabled }, JsonRequestBehavior.AllowGet);
            //    }
            if (token == Guid.Empty)
            {
                return Json(new { errorMsg = "Неверный Телефон, E-mail или пароль", errorCode = 4 },
                    JsonRequestBehavior.AllowGet);
            }
            if (loginResponse.Error != null)
            {
                return Json(new { errorMsg = loginResponse.Error.Message, errorCode = loginResponse.Error.Code },
                    JsonRequestBehavior.AllowGet);
            }

            //прошел все проверки
            AppUser user = new AppUser(token);

            UserInfoResponse userInfo = _authService.GetUserData(token);
            if (userInfo != null)
            {
                user.FIO = userInfo.User.Name;
                user.City = userInfo.User.City;
                user.RoleChangeDateTime = loginResponse.RoleChangeDateTime;
                user.Status = userInfo.User.UserStatus;
                var result = await userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await SignIn(user, userInfo.User.UserRoles);
                }
                //FormsAuthentication.SetAuthCookie(token.ToString(), false);
                Session["userId"] = user.Id;
            }
            else
            {
                Session["RoleChangeDateTime"] = loginResponse.RoleChangeDateTime;
                Session["tempAuth"] = token.ToString();
            }

            if (loginResponse.AuthAcceptType == AcceptType.Kobil)
            {
                return
                    Json(
                        new
                        {
                            pin = loginResponse.AuthAcceptType,
                            pinWaitingTime = loginResponse.AcceptWaitingTime,
                            loginResponse.KobilOption.KobilTransactionWaitingTime,
                            KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                            retUrl = Url.Action("WebDavBrowser", "Default")
                        }, JsonRequestBehavior.AllowGet);
            }
            if (loginResponse.AuthAcceptType == AcceptType.Sms)
            {
                return
                    Json(
                        new
                        {
                            pin = loginResponse.AuthAcceptType,
                            pinWaitingTime = loginResponse.AcceptWaitingTime,
                            loginResponse.KobilOption.KobilTransactionWaitingTime,
                            KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                            retUrl = Url.Action("WebDavBrowser", "Default")
                        }, JsonRequestBehavior.AllowGet);
            }


            UserInfoResponse curUser = _authService.GetUserData(token);

            if (curUser == null)
            {
                return Json(new { errorMsg = "Необходим ввод пин-кода" }, JsonRequestBehavior.AllowGet);
            }


            if (curUser.User.PasswordExpireTime != null && curUser.User.PasswordExpireTime > DateTime.Now)
            {
                //вызов окна ввода пароля
                Session["TempPassword"] = true;
                return Json(new { pin = loginResponse.AuthAcceptType, retUrl = Url.Action("MyProfile", "Default") },
                    JsonRequestBehavior.AllowGet);
                // RedirectToAction("MyProfile", "Default");
            }

            Session["userInfo"] = curUser.User;

            if (Session["retUrl"] != null)
            {
                string retUrl = Session["retUrl"].ToString();
                Session.Remove("retUrl");
                return Json(new { pin = loginResponse.AuthAcceptType, retUrl }, JsonRequestBehavior.AllowGet);
            }

            return
                Json(
                    new
                    {
                        pin = loginResponse.AuthAcceptType,
                        pinWaitingTime = loginResponse.AcceptWaitingTime,
                        loginResponse.KobilOption.KobilTransactionWaitingTime,
                        KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                        retUrl = Url.Action("WebDavBrowser", "Default")
                    }, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        [System.Web.Mvc.HttpPost]
        public async Task<ActionResult> KobilLogin(string login)
        {
            if (Request.QueryString["retUrl"] != null)
            {
                Session["retUrl"] = Request.QueryString["retUrl"];
                ViewBag.retUrl = Request.QueryString["retUrl"];
            }
            if (Session["retUrl"] != null)
            {
                ViewBag.retUrl = Session["retUrl"];
            }
            Guid token = Guid.Empty;
            var loginResponse = new LoginResponse();

            ClearSession();
            try
            {
                //авторизация
                loginResponse = _authService.KobilLoginWithoutPassword(login);
                token = loginResponse.Token; // _sc.Login(login, password);
            }
            catch (Exception ex)
            {
                if (ex is EndpointNotFoundException)
                {
                    return Json(new { errorMsg = "Cервис временно недоступен, зайдите позже" },
                        JsonRequestBehavior.AllowGet);
                }
                return Json(new { errorMsg = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            if (loginResponse.KobilAuthEnabled != null && loginResponse.Error == null)
                if (!(bool)loginResponse.KobilAuthEnabled)
                {
                    return Json(new { loginResponse.KobilAuthEnabled }, JsonRequestBehavior.AllowGet);
                }
            if (loginResponse.Error != null)
            {
                return Json(new { errorMsg = loginResponse.Error.Message, errorCode = loginResponse.Error.Code },
                    JsonRequestBehavior.AllowGet);
            }
            if (token == Guid.Empty)
            {
                return Json(new { errorMsg = "Неверный Телефон, E-mail или пароль" }, JsonRequestBehavior.AllowGet);
            }


            //прошел все проверки
            AppUser user = new AppUser(token);

            UserInfoResponse userInfo = _authService.GetUserData(token);

            if (userInfo != null)
            {
                user.FIO = userInfo.User.Name;
                user.City = userInfo.User.City;
                user.RoleChangeDateTime = loginResponse.RoleChangeDateTime;
                user.Status = userInfo.User.UserStatus;
                var result = await userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await SignIn(user, userInfo.User.UserRoles);
                }
                //FormsAuthentication.SetAuthCookie(token.ToString(), false);
                Session["userId"] = user.Id;
            }
            else
            {
                Session["RoleChangeDateTime"] = loginResponse.RoleChangeDateTime;
                Session["tempAuth"] = token.ToString();
            }

            if (loginResponse.AuthAcceptType == AcceptType.Kobil)
            {
                return
                    Json(
                        new
                        {
                            pin = loginResponse.AuthAcceptType,
                            pinWaitingTime = loginResponse.AcceptWaitingTime,
                            loginResponse.KobilOption.KobilTransactionWaitingTime,
                            KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                            retUrl = Url.Action("WebDavBrowser", "Default")
                        }, JsonRequestBehavior.AllowGet);
            }
            if (loginResponse.AuthAcceptType == AcceptType.Sms)
            {
                return
                    Json(
                        new
                        {
                            pin = loginResponse.AuthAcceptType,
                            pinWaitingTime = loginResponse.AcceptWaitingTime,
                            loginResponse.KobilOption.KobilTransactionWaitingTime,
                            KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                            retUrl = Url.Action("WebDavBrowser", "Default")
                        }, JsonRequestBehavior.AllowGet);
            }


            UserInfoResponse curUser = _authService.GetUserData(token);

            if (curUser == null)
            {
                return Json(new { errorMsg = "Необходим ввод пин-кода" }, JsonRequestBehavior.AllowGet);
            }


            if (curUser.User.PasswordExpireTime != null && curUser.User.PasswordExpireTime > DateTime.Now)
            {
                //вызов окна ввода пароля
                Session["TempPassword"] = true;
                return Json(new { pin = loginResponse.AuthAcceptType, retUrl = Url.Action("MyProfile", "Default") },
                    JsonRequestBehavior.AllowGet);
                // RedirectToAction("MyProfile", "Default");
            }

            Session["userInfo"] = curUser.User;

            if (Session["retUrl"] != null)
            {
                string retUrl = Session["retUrl"].ToString();
                Session.Remove("retUrl");
                return Json(new { pin = loginResponse.AuthAcceptType, retUrl }, JsonRequestBehavior.AllowGet);
            }

            return
                Json(
                    new
                    {
                        pin = loginResponse.AuthAcceptType,
                        pinWaitingTime = loginResponse.AcceptWaitingTime,
                        loginResponse.KobilOption.KobilTransactionWaitingTime,
                        KobilPollingTime = loginResponse.KobilOption.PollingInterval,
                        retUrl = Url.Action("WebDavBrowser", "Default")
                    }, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> CheckKobil(string retUrl)
        {
            if (!string.IsNullOrEmpty(retUrl))
            {
                Session.Remove("retUrl");
            }
            else
            {
                retUrl = Url.Action("WebDavBrowser", "Default");
            }
            string tokenStr = Session["tempAuth"].ToString();
            if (string.IsNullOrEmpty(tokenStr))
            {
                return Json(new { success = false, message = "token null" });
            }
            Guid curToken;
            bool guidParse = Guid.TryParse(tokenStr, out curToken);
            if (!guidParse)
                return Json(new { success = false, message = "Token not Guid" });

            //Подтверждение через сиситему kobil
            KobilAuthResponse response = _authService.CheckKobilAuth(curToken);
            if (response.Status == KobilStatus.Accept)
            {
                AppUser user = new AppUser(curToken);

                UserInfoResponse userInfo = _authService.GetUserData(curToken);
                user.FIO = userInfo.User.Name;
                user.City = userInfo.User.City;
                user.RoleChangeDateTime = (DateTime)Session["RoleChangeDateTime"];
                user.Status = userInfo.User.UserStatus;
                var result = await userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await SignIn(user, userInfo.User.UserRoles);
                }

                return Json(new { response.Status, success = true, redirect = retUrl });
            }
            if (response.Status == KobilStatus.Reject)
            {
                CancelKobil(retUrl);
                return Json(new { response.Status, success = false, message = response.Message });
            }

            return Json(new { response.Status, success = false });
        }

        public ActionResult CancelKobil(string retUrl)
        {
            string tokenStr = Session["tempAuth"].ToString();
            if (string.IsNullOrEmpty(tokenStr))
            {
                return Json(new { success = false, message = "token null" });
            }
            Guid curToken;
            bool guidParse = Guid.TryParse(tokenStr, out curToken);
            if (!guidParse)
                return Json(new { success = false, message = "Token not Guid" });

            _authService.CancelKobilAuth(curToken);
            if (!string.IsNullOrEmpty(retUrl))
            {
                return Redirect(retUrl);
            }
            return RedirectToAction("Login");
        }

        public ActionResult ResendSms()
        {
            string tokenStr = Session["tempAuth"].ToString();
            if (string.IsNullOrEmpty(tokenStr))
            {
                return Json(new { success = false, message = "token null" });
            }
            Guid curToken;
            bool guidParse = Guid.TryParse(tokenStr, out curToken);
            if (!guidParse)
                return Json(new { success = false, message = "Token not Guid" });

            //Отправка смс
            ResendPinResponse res = _authService.ResendPIN(curToken);
            if (res.Success)
            {
                return Json(new { success = true });
            }
            return Json(new { success = false, message = res.Error.Message, errorCode = res.Error.Code });
        }

        public async Task<ActionResult> CheckSmsPin(string pinCode, string retUrl)
        {
            if (!string.IsNullOrEmpty(retUrl))
            {
                Session.Remove("retUrl");
            }
            else
            {
                retUrl = Url.Action("WebDavBrowser", "Default");
            }
            string tokenStr = Session["tempAuth"].ToString();
            if (string.IsNullOrEmpty(tokenStr))
            {
                return Json(new { success = false, message = "token null" });
            }
            Guid curToken;
            bool guidParse = Guid.TryParse(tokenStr, out curToken);
            if (!guidParse)
                return Json(new { success = false, message = "Token not Guid" });

            if (!_authService.LoginWithPIN(curToken, pinCode))
                return Json(new { success = false, message = "Введен неверный пин-код" });

            AppUser user = new AppUser(curToken);

            UserInfoResponse userInfo = _authService.GetUserData(curToken);
            user.FIO = userInfo.User.Name;
            user.City = userInfo.User.City;
            if (Session["RoleChangeDateTime"] != null)
                user.RoleChangeDateTime = (DateTime) Session["RoleChangeDateTime"];
            user.Status = userInfo.User.UserStatus;
            var result = await userManager.CreateAsync(user);
            if (result.Succeeded)
            {
                await SignIn(user, userInfo.User.UserRoles);
            }

            return Json(new { success = true, redirect = retUrl });
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing && userManager != null)
            {
                userManager.Dispose();
            }
            base.Dispose(disposing);
        }

        /// <summary>
        ///     выход
        /// </summary>
        /// <returns></returns>
        [AllowAnonymous]
        public ActionResult LogOff()
        {
            string ReturnUrl = "";
            if (Session["retUrl"] != null)
            {
                ReturnUrl = Session["retUrl"].ToString();
            }
            GetAuthenticationManager().SignOut("ApplicationCookie");
            //ClearSession();
            Session.Abandon();

            return RedirectToAction("Login", "Account", new { ReturnUrl });
        }


        private IAuthenticationManager GetAuthenticationManager()
        {
            var ctx = Request.GetOwinContext();
            return ctx.Authentication;
        }
    }
}