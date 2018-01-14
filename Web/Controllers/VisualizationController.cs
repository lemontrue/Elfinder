using System;
using System.Web;
using System.Web.Mvc;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;
using CryptxOnline.Web.Models.Visualization;

namespace CryptxOnline.Web.Controllers
{
    public class VisualizationController : BaseController
    {
        [AllowAnonymous]
        public ActionResult Office(string fileUri)
        {
            Guid token = Guid.Empty;
            try
            {
                token = CheckSessionAuthState(CurrentUser, _authService);
            }
            catch
            {
            }

            if (token == Guid.Empty)
            {
                return new HttpNotFoundResult();
            }

            GetVisualizationResponse response = _cryptxService.GetVisualizationUrl(fileUri, token);
            OfficeVisualizationModel model = new OfficeVisualizationModel(response, fileUri);

            return View(model);
        }
        [AllowAnonymous]
        public ActionResult Picture(string fileUri)
        {
            Guid token = Guid.Empty;
            try
            {
                token = CheckSessionAuthState(CurrentUser, _authService);
            }
            catch
            {
            }
            if (token == Guid.Empty)
            {
                return new HttpNotFoundResult();
                //return RedirectToAction("LogOff", "Account");
            }
            GetVisualizationResponse response = _cryptxService.GetVisualizationUrl(fileUri, token);

            PictureVisualizationModel model = new PictureVisualizationModel(response, fileUri);


            return View(model);
        }
        public ActionResult Xml(string fileUri)
        {
            Guid token = Guid.Empty;
            try
            {
                token = CheckSessionAuthState(CurrentUser, _authService);
            }
            catch
            {
            }
            if (token == Guid.Empty)
            {
                return new HttpNotFoundResult();
                //return RedirectToAction("LogOff", "Account");
            }
            GetVisualizationResponse response = _cryptxService.GetVisualizationUrl(fileUri, token);

            XmlVisualizationModel model = new XmlVisualizationModel(response, fileUri);


            return View(model);
        }

    }
}
