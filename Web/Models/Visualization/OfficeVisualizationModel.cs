using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ElFinder.CryptxService;

namespace CryptxOnline.Web.Models.Visualization
{
    public class OfficeVisualizationModel
    {
        public OfficeVisualizationModel(GetVisualizationResponse data, string fileUri)
        {
            VisualizationUri = data.VisualizationUrl;
            FileUri = fileUri;
            if (data.Error != null)
                ErrorMessage = data.Error.Message;
        }

        public string FileUri { get; private set; }
        public string VisualizationUri { get; private set; }
        public string ErrorMessage { get; private set; }
    }
}