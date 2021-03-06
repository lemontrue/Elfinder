﻿using System.Collections.Generic;
using CryptxOnline.Web.MarkerActivationService;
using CryptxOnline.Web.Models;

namespace CryptxOnline.Web.Helpers
{
    public class DecryptCertificateResult
    {
        public List<DownloadedFile> DownloadedFiles { get; set; }
        public List<CertificateInfo> CertificateInfos { get; set; }
    }
}