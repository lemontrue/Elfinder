using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Mvc;
using CryptxOnline.Web.CryptxService;
using CryptxOnline.Web.Helpers;

namespace CryptxOnline.Web.Controllers
{
    [MyAuthorize("User,GroupAdmin,SysAdmin", "New,Confirmed,NotActive,Deleted")]
    public class TestController : Controller
    {
        //
        // GET: /Test/

        public ActionResult Index(string settingsJSON)
        {
            return Content("Hi , Thanks for the details, a mail will be sent to  with all the login details.",
                "text/html");
        }

        public ActionResult AjaxView()
        {
            return Content("Hi , Thanks for the details, a mail will be sent to  with all the login details.",
                "text/html");
        }

        public ActionResult AjaxRedirect()
        {
            return RedirectToAction("CertificateList", "AddressBook", null);
        }
    }
}