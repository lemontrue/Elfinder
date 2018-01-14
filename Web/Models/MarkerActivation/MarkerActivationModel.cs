using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CryptxOnline.Web.MarkerActivationService;

namespace CryptxOnline.Web.Models.MarkerActivation
{
    public class MarkerActivationModel
    {
        public MainStatus Status { get; set; }
        public bool SystemLogoff { get; set; }
        public MarkerActivationError Error { get; set; }
        public MarkerActivationModel()
        {
            SystemLogoff = false;
        }
    }
}