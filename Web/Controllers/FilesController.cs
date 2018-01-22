using System;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using ElFinder;
using ElFinder.CryptxService;
using ElFinder.DTO;
using ElFinder.InternalException;
using ElFinder.WebDav;
using Helper = CryptxOnline.Web.Helpers.Helper;

namespace CryptxOnline.Web.Controllers
{
    [AllowAnonymous]
    public class FilesController : BaseController
    {

        private Connector connector;
        private Guid token;

        public Connector Connector
        {
            get
            {
                UserInfoResponse userInfoResponse = _authService.GetUserData(token);
                var driver = new FileSystemDriver(userInfoResponse.WebDavRootDir, token);//WebDavDriver(userInfoResponse.WebDavRootDir, token);
                connector = new Connector(driver);

                return connector;
            }
        }

        public ActionResult Index()
        {
            token = CheckSessionAuthState(CurrentUser, _authService);
            if (token == Guid.Empty)
            {
                return Error.Redirect("Сессия истекла!", Url.Action("LogOff", "Account"));
            }
            try
            {
                ActionResult connector1=Connector.Process(HttpContext.Request);
                return connector1;
            }
            catch (ElFinderException ex)
            {
                return Error.Message(ex.Message);
            }
        }

        public ActionResult SelectFile(string target)
        {
            return Json(Connector.GetFileByHash(target).FullName);
        }

        public ActionResult Thumbs(string tmb)
        {
            return Connector.GetThumbnail(Request, Response, tmb);
        }

        [HttpGet]
        public ActionResult CheckFile(string url)
        {
            Guid token = CheckSessionAuthState(CurrentUser, _authService);
            return token == Guid.Empty ? RedirectToAction("LogOff", "Account") : null;
        }
    }
}