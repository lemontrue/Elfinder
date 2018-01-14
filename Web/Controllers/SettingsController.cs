using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using NLog;

namespace CryptxOnline.Web.Controllers
{
    public enum Name
    {
        ASC,
        DESC
    }

    public enum SignText
    {
        ASC,
        DESC
    }

    public enum EncText
    {
        ASC,
        DESC
    }
    
    public class SettingsController : BaseController
    {
        private readonly Logger _logger = LogManager.GetCurrentClassLogger();

        public ActionResult Index(Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
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
                    Name = "Шаблоны настроек",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Шаблоны настроек",
                    Action = "Index",
                    Controller = "Settings",
                    IsUrl = false
                });
            }

            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            var userInfo = (UserInfo) Session["userInfo"];
            ViewBag.userInfo = userInfo;
            var response = new UserProfilesResponse();
            response = _cryptxService.GetUserProfiles(userId == null ? Guid.Empty : (Guid) userId, token);
            if (response.Exception != null)
                throw response.Exception;
            response.UserProfileList = response.UserProfileList.OrderBy(x => x.Name).ToList();
            ViewBag.name = Name.ASC;
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            return View(response.UserProfileList);
        }

        [HttpPost]
        public ActionResult Index(Name? name, SignText? signText, EncText? encText, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
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
                    Name = "Шаблоны настроек",
                    IsUrl = false
                });
            }
            else
            {
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Шаблоны настроек",
                    Action = "Index",
                    Controller = "Settings",
                    IsUrl = false
                });
            }

            ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
            var userInfo = (UserInfo) Session["userInfo"];
            ViewBag.userInfo = userInfo;

            UserProfilesResponse response = _cryptxService.GetUserProfiles(userId == null ? Guid.Empty : (Guid) userId,
                token);


            if (response.Exception != null)
                throw response.Exception;

            switch (name)
            {
                case Name.ASC:
                    signText = null;
                    encText = null;
                    ViewBag.name = name;
                    ViewBag.signText = null;
                    ViewBag.encText = null;
                    response.UserProfileList = response.UserProfileList.OrderBy(x => x.Name).ToList();
                    break;
                case Name.DESC:
                    signText = null;
                    encText = null;

                    ViewBag.name = name;
                    ViewBag.signText = null;
                    ViewBag.encText = null;
                    response.UserProfileList = response.UserProfileList.OrderByDescending(x => x.Name).ToList();
                    break;
            }

            switch (signText)
            {
                case SignText.ASC:
                    name = null;
                    encText = null;
                    ViewBag.name = null;
                    ViewBag.signText = signText;
                    ViewBag.encText = null;
                    response.UserProfileList = response.UserProfileList.OrderBy(x => x.SignText).ToList();
                    break;
                case SignText.DESC:
                    name = null;
                    encText = null;

                    ViewBag.name = null;
                    ViewBag.signText = signText;
                    ViewBag.encText = null;
                    response.UserProfileList = response.UserProfileList.OrderByDescending(x => x.SignText).ToList();
                    break;
            }

            switch (encText)
            {
                case EncText.ASC:
                    name = null;
                    signText = null;
                    ViewBag.name = null;
                    ViewBag.signText = null;
                    ViewBag.encText = encText;
                    response.UserProfileList = response.UserProfileList.OrderBy(x => x.EncryptionText).ToList();
                    break;
                case EncText.DESC:
                    name = null;
                    signText = null;

                    ViewBag.name = null;
                    ViewBag.signText = null;
                    ViewBag.encText = encText;
                    response.UserProfileList =
                        response.UserProfileList.OrderByDescending(x => x.EncryptionText).ToList();
                    break;
            }
            ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;
            return View(response.UserProfileList);
        }

        [HttpPost]
        public ActionResult Edit(Settings settings, Guid? userId, bool attached, bool zip = false)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            ProfileResponse response = _cryptxService.GetProfile(settings.Id,
                (userId == null ? Guid.Empty : (Guid) userId), token);
            if (response.Exception == null)
            {
                Settings model = response.Settings;
                var navigation = new MyNavigation();
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 1,
                    Name = "Шаблоны настроек",
                    Action = "Index",
                    Controller = "Settings",
                    IsUrl = true
                });
                navigation.Navigations.Add(new NavElement
                {
                    Depth = 2,
                    Name = model._MainSettings.Name,
                    Action = "Edit",
                    Controller = "Settings",
                    IsUrl = false
                });
                settings._EncryptionSettings.RecipientCertificates1 =
                    (settings._EncryptionSettings.RecipientCertificates1[0].Split(',')).Distinct().ToList();
                List<string> certs = settings._EncryptionSettings.RecipientCertificates1;
                settings._EncryptionSettings.RecipientCertificates1 =
                    settings._EncryptionSettings.RecipientCertificates1.Where(
                        x => (!string.IsNullOrEmpty(x.ToString(CultureInfo.InvariantCulture)))).ToList();
                ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
                var userInfo = (UserInfo) Session["userInfo"];
                ViewBag.userInfo = userInfo;
                //if (zip)
                //{
                //    settings._SignatureSettings.ZipType = ZipTypeEnum.ZipAfter;
                //    settings._EncryptionSettings.ZipType = ZipTypeEnum.ZipAfter;
                //}
                var defaultSettings = new Settings();
                var defaultResponse = new ProfileResponse();

                if (settings.Id == Guid.Empty)
                {
                    defaultResponse = _cryptxService.GetBlankProfile();
                }
                else
                {
                    defaultResponse = _cryptxService.GetProfile(settings.Id,
                        (userId == null ? Guid.Empty : (Guid) userId), token);
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

                defaultSettings._SignatureSettings.Detached = !attached;
                defaultSettings._SignatureSettings._EncodingType = settings._SignatureSettings._EncodingType;
                defaultSettings._SignatureSettings.SignerCertificate1 = settings._SignatureSettings.SignerCertificate1;
                defaultSettings._SignatureSettings.ZipType = settings._SignatureSettings.ZipType;

                defaultSettings._EncryptionSettings._EncodingType = settings._EncryptionSettings._EncodingType;
                defaultSettings._EncryptionSettings.RecipientCertificates1 =
                    settings._EncryptionSettings.RecipientCertificates1;
                defaultSettings._EncryptionSettings.ZipType = settings._EncryptionSettings.ZipType;

                //defaultSettings._DecryptionSettings.DecryptCertificate = settings._DecryptionSettings.DecryptCertificate;
                //defaultSettings._DecryptionSettings.KeysetPassword = settings._DecryptionSettings.KeysetPassword;

                ViewBag.Title = defaultSettings._MainSettings.Name;

                if (settings.Id == Guid.Empty)
                {
                    _cryptxService.SaveNewProfile(defaultSettings, token, (userId == null ? Guid.Empty : (Guid) userId));
                }
                else
                {
                    _cryptxService.SaveProfile(defaultSettings, token, (userId == null ? Guid.Empty : (Guid) userId));
                }
                var certBytes = new List<byte[]>();
                foreach (string thumbprint in certs)
                {
                    if (!string.IsNullOrEmpty(thumbprint))
                    {
                        if (Session[thumbprint] != null)
                        {
                            certBytes.Add((byte[]) Session[thumbprint]);
                        }
                    }
                }
                _cryptxService.AddCertificates(certBytes, false, (userId == null ? Guid.Empty : (Guid) userId), token);
                if (userId != null && userId != Guid.Empty)
                    return RedirectToAction("Index", new {userId = (Guid) userId});
                return RedirectToAction("Index");
            }
            throw response.Exception;
        }

        public ActionResult Edit(Guid? Id, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return RedirectToAction("LogOff", "Account");
            }
            
            ViewBag.canDelete = false;
            ProfileResponse response;

            var settings = new Settings();
            if (Id == null || Id == Guid.Empty)
            {
                ViewBag.Title = "Шаблоны настроек";
                response = _cryptxService.GetBlankProfile();
                if (response.Exception == null)
                {
                    settings = response.Settings;
                }
                else
                {
                    throw response.Exception;
                }
            }
            else
            {
                UserProfilesResponse responses =
                    _cryptxService.GetUserProfiles(userId == null ? Guid.Empty : (Guid) userId, token);
                if (responses.UserProfileList.Count == 1)
                {
                    ViewBag.canDelete = false;
                }
                else
                {
                    ViewBag.canDelete = true;
                }
                response = _cryptxService.GetProfile((Guid) Id, (userId == null ? Guid.Empty : (Guid) userId), token);
                if (response.Exception == null)
                {
                    settings = response.Settings;
                }
                else
                {
                    throw response.Exception;
                }
            }


            if (response.Exception == null)
            {
                Settings model = settings;
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
                        Name =
                            "Шаблон: " +
                            (string.IsNullOrEmpty(model._MainSettings.Name) ? "Новый" : model._MainSettings.Name),
                        IsUrl = false
                    });
                }
                else
                {
                    navigation.Navigations.Add(new NavElement
                    {
                        Depth = 1,
                        Name = "Шаблоны настроек",
                        Action = "Index",
                        Controller = "Settings",
                        IsUrl = true
                    });
                    navigation.Navigations.Add(new NavElement
                    {
                        Depth = 2,
                        Name = model._MainSettings.Name,
                        Action = "Edit",
                        Controller = "Settings",
                        IsUrl = false
                    });
                }

                ViewBag.nav = navigation.Navigations.OrderBy(x => x.Depth).ToList();
                var userInfo = (UserInfo) Session["userInfo"];
                ViewBag.userInfo = userInfo;
                ViewBag.UserId = userId == null ? Guid.Empty : (Guid) userId;

                return View(model);
            }
            throw response.Exception;
        }

        public ActionResult DeleteSettings(Guid Id, Guid? userId)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Json(new {Status = "logoff"}, JsonRequestBehavior.AllowGet);
            }
            ProfileResponse response = _cryptxService.DeleteProfile(Id, token,
                userId == null ? Guid.Empty : (Guid) userId);
            if (response.Exception == null)
            {
            }
            else
            {
                throw response.Exception;
            }
            if (Request.IsAjaxRequest())
                return Json(new {response}, JsonRequestBehavior.AllowGet);
            if (userId != null && userId != Guid.Empty)
                return RedirectToAction("Index", new {userId = (Guid) userId});
            return RedirectToAction("Index");
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