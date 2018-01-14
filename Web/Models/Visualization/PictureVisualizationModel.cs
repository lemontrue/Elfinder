using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models.Visualization
{
    public class PictureVisualizationModel
    {
        public PictureVisualizationModel(GetVisualizationResponse data, string fileuri)
        {
            Fileuri = fileuri;
            PictureBase64 = data.Base64Picture;
            if (data.Error != null)
                ErrorMessage = data.Error.Message;
        }

        public string Fileuri { get;private set; }
        public string PictureBase64 { get; private set; }
        public string ErrorMessage { get; private set; }
    }
}