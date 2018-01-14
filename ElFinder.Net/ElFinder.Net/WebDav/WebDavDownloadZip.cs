using System.Web.Mvc;
using System;
using System.Globalization;

namespace ElFinder.WebDav
{
    internal class WebDavDownloadZip : ActionResult
    {
        public byte[] content { get; private set; }
        public WebDavDownloadZip(byte[] content)
        {
            this.content = content;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            var response = context.HttpContext.Response;
            response.Clear();
            response.BufferOutput = false;
            var archiveName = String.Format("Cryptogramm_{0}.zip", DateTime.Now.ToString("yyyy-MMM-dd-HHmmss"));
            response.ContentType = "application/zip";
            response.AddHeader("content-disposition", "filename=" + archiveName);
            response.AddHeader("Content-Length", content.Length.ToString(CultureInfo.InvariantCulture));
            response.BinaryWrite(content);
            response.End();
            response.Flush();
        }
    }
}
