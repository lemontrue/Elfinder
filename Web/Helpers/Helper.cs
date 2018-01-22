using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.UI.WebControls;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.Controllers;
using CryptxOnline.Web.Identity;
using CryptxOnline.Web.Models;
using Microsoft.AspNet.Identity;
using ElFinder.CryptxService;
using Microsoft.AspNet.Identity.EntityFramework;
using WebDav;

namespace CryptxOnline.Web.Helpers
{
    public static class Helper
    {
        /// <summary>
        ///     проверка токена авторизации на клиентской части
        /// </summary>
        /// <param name="user"></param>
        /// <param name="_sc"></param>
        /// <returns></returns>
        //public static Guid CheckSessionAuthState1(LoggedUser user, AuthorizeServiceClient _sc)
        //{
            
        //    if (user == null)
        //    {
        //        return Guid.Empty;
        //    }

        //    CheckTokenResponse response = _sc.CheckToken(new Guid(user.AuthToken), user.RoleChangeDateTime);

        //    if (response.Roles != null && response.Roles.Count != 0)
        //    {
        //        //повторный Signin
        //        AppUserManager um = new AppUserManager(new UserStore<AppUser>(new AppDbContext()));
        //        try
        //        {
        //            AppUser appUser = um.FindById(user.Name);
        //            var deleteResult = um.Delete(appUser);

        //            using (BaseAnonymousController ac = new AccountController())
        //            {
        //                GetAuthenticationManager().SignOut("ApplicationCookie");
        //                appUser.RoleChangeDateTime = response.RoleChangeDateTime;

        //                Task signIn = new BaseAnonymousController().SignIn(appUser, response.Roles);
        //            }

        //        }
        //        catch (Exception)
        //        {
                    
        //            throw;
        //        }
                


        //        //ClaimsIdentity claimsUser =user.Identities.ElementAt(0);
        //        ////удаляем текущие роли
        //        //List<Claim> userRoles = claimsUser.FindAll(ClaimTypes.Role).ToList();
        //        //foreach (Claim userRole in userRoles)
        //        //{
        //        //    claimsUser.RemoveClaim(userRole);
        //        //}

        //        //foreach (DicUserRoles dicUserRole in response.Roles)
        //        //{
        //        //    Claim newRole=new Claim(ClaimTypes.Role,dicUserRole.ToString());
        //        //    claimsUser.AddClaim(newRole);
        //        //}

        //        //обновляем дату
        //        //user.RoleChangeDateTime = response.RoleChangeDateTime;
        //        //claimsUser.RemoveClaim(claimsUser.FindFirst("RoleChangeDateTime"));
        //        //claimsUser.AddClaim(new Claim("RoleChangeDateTime",response.RoleChangeDateTime.ToString()));
        //    }
        //    if (!response.OK)
        //        return Guid.Empty;
        //    return new Guid(user.AuthToken);
        //}


        /// <summary>
        ///     получение текущего шага по имени
        /// </summary>
        /// <param name="actionName">имя действия</param>
        /// <param name="steps">список шаговт мастера</param>
        /// <returns></returns>
        public static CustomWizardStep GetCurrentStep(string actionName, List<CustomWizardStep> steps)
        {
            var curStep = new CustomWizardStep();
            foreach (CustomWizardStep step in steps)
            {
                if (step.Step == actionName)
                    curStep = step;
            }
            return curStep;
        }

        public static List<ListItem> GetEncodingTypesList()
        {
            var listItems = new List<ListItem>();
            foreach (EncodingType type in Enum.GetValues(typeof(EncodingType)))
            {
                if (type.Equals(EncodingType.Binary))
                    listItems.Add(new ListItem { Text = "DER кодировка (бинарные данные)", Value = type.ToString() });
                if (type.Equals(EncodingType.Base64))
                    listItems.Add(new ListItem { Text = "base64 кодировка", Value = type.ToString() });
                if (type.Equals(EncodingType.Base64WithHeaders))
                    listItems.Add(new ListItem { Text = "base64 кодировка с заголовками", Value = type.ToString() });
            }
            return listItems;
        }

        public static bool FileExist(string fileUri, Guid token)
        {
            var _authService = new AuthorizeServiceClient();
            WebDavClient webDavClient = InitWebDav(token, _authService);
            var fileInfo = new FileInfo(fileUri);
            bool result = true;
            byte[] file = webDavClient.Download(fileUri);
            //List<DirInfo> dirInfos = webDavClient.GetDirectories(fileInfo.Directory.Name);
            //bool result=dirInfos.Any(x => x.IsDirectory == false && x.DisplayName.Equals(fileInfo.Name));
            if (file == null)
                result = false;
            return result;
        }

        public static WebDavClient InitWebDav(Guid token, AuthorizeServiceClient authorizeService)
        {
            UserInfoResponse userInfoResponse = authorizeService.GetUserData(token);
            if (userInfoResponse.Exception == null)
            {
                UserInfo user = userInfoResponse.User;
                var webDavClient = new WebDavClient(userInfoResponse.WebDavRootDir, token);

                return webDavClient;
            }
            throw new Exception("Ошибка получения данных о пользователе", userInfoResponse.Exception);
        }

        /// <summary>
        ///     запросить пин-код?
        /// </summary>
        /// <param name="model"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        public static bool RequestPin(ref WizardModel model, Guid token)
        {
            if (model.SigningOptions.WrongPIN || model.DecryptionOptions.WrongPIN)
            {
                return true;
            }
            var client = new CryptxServiceClient();
            if (model.Settings.Id == Guid.Empty)
            {
                return true;
            }
            ProfileResponse profileResponse = client.GetProfile(model.Settings.Id, Guid.Empty, token);
            //произошла ошибка в получении профиля
            //запросим пинкод
            if (profileResponse.Exception != null)
            {
                return true;
            }

            if (model.Type == OperationType.Decrypt)
            {
                if (model.DecryptionOptions.DecryptCertificate ==
                    profileResponse.Settings._DecryptionSettings.DecryptCertificate &&
                    !string.IsNullOrEmpty(profileResponse.Settings._DecryptionSettings.KeysetPassword))
                {
                    model.Settings._DecryptionSettings.KeysetPassword =
                        profileResponse.Settings._DecryptionSettings.KeysetPassword;
                    return false;
                }
            }
            if (model.Type == OperationType.Sign)
            {
                if (model.SigningOptions.SignerCertificate1 ==
                    profileResponse.Settings._SignatureSettings.SignerCertificate1 &&
                    !string.IsNullOrEmpty(profileResponse.Settings._SignatureSettings.KeysetPassword))
                {
                    model.Settings._SignatureSettings.KeysetPassword =
                        profileResponse.Settings._SignatureSettings.KeysetPassword;
                    return false;
                }
            }


            return true;
        }

        /// <summary>
        ///     обрабатываем существующие серты в моделе
        /// </summary>
        /// <param name="downloadedFiles"></param>
        /// <returns></returns>
        public static List<string> GetDecryptCertificates(List<DownloadedFile> downloadedFiles)
        {
            List<string> result = null;

            foreach (DownloadedFile downloadedFile in downloadedFiles)
            {
                if (result == null)
                {
                    result = downloadedFile.DecryptCertificatesThumbprints;
                }
                else
                {
                    result = result.Intersect(downloadedFile.DecryptCertificatesThumbprints).ToList();
                }
            }

            return result;
        }

        /// <summary>
        ///     Обрабатываем все файлы(загрузка и из ссылки)
        /// </summary>
        /// <param name="files"></param>
        /// <param name="_cryptxService"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        public static DecryptCertificateResult GetDecryptCertificates(List<DownloadedFile> files,
            CryptxServiceClient _cryptxService, Guid token)
        {
            var result = new DecryptCertificateResult();

            List<CertificateInfo> prevCertlist = null;
            var prevDownloadedFiles = new List<DownloadedFile>();

            foreach (DownloadedFile downloadedFile in files)
            {
                CertificatesResponse response = _cryptxService.DAVGetDecryptCertificates(downloadedFile.Uri, token);
                if (response.Exception != null)
                {
                    downloadedFile.Exception =
                        new Exception("Ошибка при нахождении доступных сертификатов для расшифровки", response.Exception);
                    //throw new Exception("Ошибка при нахождении доступных сертификатов для расшифровки",response.Exception);
                    downloadedFile.Exception = response.Exception;
                    if (prevCertlist == null)
                        prevCertlist = new List<CertificateInfo>();
                    prevDownloadedFiles.Add(downloadedFile);
                }
                else
                {
                    List<CertificateInfo> myCertifcatesInFile =
                        response.Certificates.Where(x => x.MyCertificate != null).ToList();

                    downloadedFile.DecryptCertificatesNames = myCertifcatesInFile.Select(x => x.SubjectName).ToList();
                    downloadedFile.DecryptCertificatesThumbprints =
                        myCertifcatesInFile.Select(x => x.Thumbprint).ToList();
                    prevDownloadedFiles.Add(downloadedFile);

                    if (prevCertlist == null)
                    {
                        prevCertlist = myCertifcatesInFile;
                    }
                    else
                    {
                        prevCertlist =
                            prevCertlist.Union(myCertifcatesInFile, new CertificateInfoEqualityComparer()).ToList();
                    }
                }
            }
            result.CertificateInfos = prevCertlist;
            result.DownloadedFiles = prevDownloadedFiles;

            return result;
        }

        public static string HtmlNavElement(MyNavigation navigation, RequestContext context)
        {
            var helper = new UrlHelper(context);

            string html = "<ul>";
            foreach (NavElement navElement in navigation.Navigations)
            {
                html += "<li class=\"col\">";
                if (navElement.IsUrl)
                {
                    if (navElement.UserId != Guid.Empty)
                    {
                        html += "<a href=\"" +
                                helper.Action(navElement.Action, navElement.Controller, new { userId = navElement.UserId }) +
                                "\" >" + navElement.Name + "</a>";
                    }
                    else
                    {
                        html += "<a href=\"" + helper.Action(navElement.Action, navElement.Controller) + "\" >" +
                                navElement.Name + "</a>";
                    }
                }
                else
                {
                    html += "<span>" + navElement.Name + "</span >";
                }
                html += "</li>";
            }
            html += "</ul>";

            return html;
        }

        public static string IOSDownloadUri()
        {
            string data = WebConfigurationManager.AppSettings["IOSDownloadUri"];
            return data;
        }

        public static string AndroidDownloadUri()
        {
            string data = WebConfigurationManager.AppSettings["AndroidDownloadUri"];
            return data;
        }
    }
}