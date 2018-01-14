using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models.Visualization
{
    public class XmlVisualizationModel
    {
        public XmlVisualizationModel(GetVisualizationResponse data, string fileuri)
        {
            Fileuri = fileuri;
            XmlRaw = data.Base64Picture;
            if (data.Error != null)
                ErrorMessage = data.Error.Message;
        }

        public string Fileuri { get;private set; }
        public string XmlRaw { get; private set; }
        public string ErrorMessage { get; private set; }
    }
}