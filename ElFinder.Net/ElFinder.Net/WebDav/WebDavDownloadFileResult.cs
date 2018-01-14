using System;
using System.IO;
using System.Web;
using System.Web.Mvc;
using WebDav;

namespace ElFinder.WebDav
{
    public class WebDavDownloadFileResult : ActionResult
    {
        public DirInfo File { get; private set; }
        public bool IsDownload { get; private set; }
        public byte[] content { get; private set; }
        public Stream stream { get; private set; }
        public WebDavDownloadFileResult(DirInfo file, byte[] content, bool isDownload)
        {
            File = file;
            IsDownload = isDownload;
            this.content = content;
        }

        public WebDavDownloadFileResult(DirInfo file, Stream stream, bool isDownload)
        {
            file.DisplayName = file.DisplayName;
            File = file;
            IsDownload = isDownload;
            this.stream = stream;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            //TODO сделать получение файлов из кэша
            HttpResponseBase response = context.HttpContext.Response;
            HttpRequestBase request = context.HttpContext.Request;
            string fileName;

            string fileNameEncoded = Uri.EscapeDataString(File.DisplayName);//HttpUtility.UrlEncode(File.DisplayName);

            if (context.HttpContext.Request.UserAgent.Contains("MSIE")) // IE < 9 do not support RFC 6266 (RFC 2231/RFC 5987)
            {
                fileName = "filename=\"" + fileNameEncoded + "\"";
            }
            else
            {
                fileName = "filename*=UTF-8\'\'" + fileNameEncoded; // RFC 6266 (RFC 2231/RFC 5987)
            }
            string mime;
            string disposition;
            if (IsDownload)
            {
                mime = "application/octet-stream";
                disposition = "attachment; " + fileName;
            }
            else
            {
                var ext = Path.GetExtension(File.DisplayName);
                if (!string.IsNullOrEmpty(ext))
                    ext = ext.ToLower().Substring(1);

                mime = Helper.GetMimeType(ext);
                disposition = (mime.Contains("image") || mime.Contains("text") || mime == "application/x-shockwave-flash" ? "inline; " : "attachment; ") + fileName;
            }

            response.ContentType = mime;
            response.AppendHeader("Content-Disposition", disposition);
            response.AppendHeader("Content-Location", File.DisplayName);
            response.AppendHeader("Content-Transfer-Encoding", "binary");
            response.AppendHeader("Content-Length", File.ContentLenght.ToString());

            if (content != null)
                response.BinaryWrite(content);

            if (stream != null)
            {
                var i = 0;
                while(true)
                {
                    var byte2 = stream.ReadByte();

                    if (byte2 == -1)
                    {
                        stream.Close();
                        break;
                    }
                        
                    response.OutputStream.WriteByte((byte)byte2);
                    i++;

                    if (i % 4096 == 0)
                        response.Flush();
                }
            }

            response.End();
            response.Flush();
        }
    }
}
