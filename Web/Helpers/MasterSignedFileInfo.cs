﻿using System;
using ElFinder.CryptxService;


namespace CryptxOnline.Web.Helpers
{
    public class MasterSignedFileInfo
    {
        public Exception Exception { get; set; }
        public SignedFileInfo SignedFileInfo { get; set; }
    }
}