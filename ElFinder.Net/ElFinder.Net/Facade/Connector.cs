using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Serialization;
using ElFinder.CryptxService;
using ElFinder.DTO;
using ElFinder.InternalException;

namespace ElFinder
{
    /// <summary>
    /// Represents a connector which process elFinder request
    /// </summary>
    public class Connector
    {
        private IDriver _driver;
        /// <summary>
        /// Initialize new instance of ElFinder.Connector
        /// </summary>
        /// <param name="driver">Driver to process request</param>
        public Connector(IDriver driver)
        {
            _driver = driver;
        }

        /// <summary>
        /// Process elFinder request
        /// </summary>
        /// <param name="request">Request from elFinder</param>
        /// <returns>Json response, which must be sent to elfinder</returns>
        public ActionResult Process(HttpRequestBase request)
        {
            NameValueCollection parameters = request.QueryString.Count > 0 ? request.QueryString : request.Form;
            string cmdName = parameters["cmd"];
            if (string.IsNullOrEmpty(cmdName))
                return Error.CommandNotFound();
            string isModal = parameters["isModal"];
            string target = parameters["target"];
            if (target != null && target.ToLower() == "null")
                target = null;
            try
            {
                switch (cmdName)
                {
                    case "open":
                        if (!string.IsNullOrEmpty(parameters["init"]) && parameters["init"] == "1")
                        {
                            try
                            {
                                if (!string.IsNullOrEmpty(parameters["isReceivedMail"]) &&
                                    parameters["isReceivedMail"] == "1")
                                    return _driver.Init("", isModal, true);
                                var initResult = _driver.Init(target, isModal);
                                return initResult;
                            }
                            catch (ArgumentNullException ex)
                            {
                                return Error.Message(ex.Message);
                            }
                        }
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        var result = _driver.Open(
                            target,
                            !string.IsNullOrEmpty(parameters["tree"]) && parameters["tree"] == "1");

                        return result;
                    case "recivedmail":
                        {
                            Guid guid;
                            if (!string.IsNullOrEmpty(parameters["fileGroupSendId"]) &&
                                Guid.TryParse(parameters["fileGroupSendId"], out guid) && guid != Guid.Empty)
                                return _driver.GetReceivedMailFiles(guid);
                            return Error.Message("Некорректный guid для получения файлов");
                        }
                    case "file":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.File(
                            target,
                            !string.IsNullOrEmpty(parameters["download"]) && parameters["download"] == "1");
                    case "download":
                        {
                            var targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            var res = _driver.Download(targets);
                            return res;
                        }
                    case "certdownload":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.CertDownload(target);
                    case "filter":
                        if (string.IsNullOrEmpty(target) || string.IsNullOrEmpty(parameters["q"]))
                            return Error.MissedParameter(cmdName);
                        JsonResult filterResult = _driver.Filter(target, parameters["q"]);

                        return filterResult;
                    case "tree":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.Tree(target);
                    case "parents":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.Parents(target);
                    case "mkdir":
                        {
                            if (string.IsNullOrEmpty(target))
                                return Error.MissedParameter(cmdName);
                            string name = parameters["name"];

                            if (string.IsNullOrEmpty(name))
                                return Error.MissedParameter("name");
                            return _driver.MakeDir(target, name);
                        }
                    case "mkfile":
                        {
                            if (string.IsNullOrEmpty(target))
                                return Error.MissedParameter(cmdName);
                            string name = parameters["name"];

                            if (string.IsNullOrEmpty(name))
                                return Error.MissedParameter("name");
                            return _driver.MakeFile(target, name);
                        }
                    case "rename":
                        {
                            if (string.IsNullOrEmpty(target))
                                return Error.MissedParameter(cmdName);
                            string name = parameters["name"];

                            if (string.IsNullOrEmpty(name))
                                return Error.MissedParameter("name");
                            return _driver.Rename(target, name);
                        }
                    case "rm":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.Remove(targets);
                        }
                    case "encrypt":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.Encrypt);
                        }
                    case "decrypt":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.Decrypt);
                        }
                    case "sign":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.Sign);
                        }
                    case "cryptinfo":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.CryptInfo(targets.First());
                        }

                    case "checksign":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.SignVerify);
                        }
                    case "send":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            var emailList = parameters["emails"];
                            if (targets == null || string.IsNullOrEmpty(emailList))
                                Error.MissedParameter("targets");

                            return _driver.Send(targets, emailList);
                        }
                    case "decryptandchecksign":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.DecryptSignverify);
                        }
                    case "signandencrypt":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.SignEncrypt);
                        }
                    case "geturi":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.GetUri(targets, OperationType.SignEncrypt);
                        }

                    case "add":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.Add(targets);
                        }
                    case "ls":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.List(target);
                    case "get":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        return _driver.Get(target);
                    case "put":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);
                        string content = parameters["content"];

                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter("content");
                        return _driver.Put(target, content);
                    case "paste":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            string src = parameters["src"];
                            if (string.IsNullOrEmpty(src))
                                return Error.MissedParameter("src");

                            string dst = parameters["dst"];
                            if (string.IsNullOrEmpty(src))
                                return Error.MissedParameter("dst");

                            var dublIndexes = ExtractDataOfRequestParameter(request, "dublindexes");
                            return _driver.Paste(
                                src,
                                dst,
                                targets,
                                !string.IsNullOrEmpty(parameters["cut"]) && parameters["cut"] == "1",
                                dublIndexes);
                        }
                    case "upload":
                        if (string.IsNullOrEmpty(target))
                            return Error.MissedParameter(cmdName);

                        var addWithNewIndex = false;
                        if (!string.IsNullOrEmpty(parameters["addWithNewIndex"]))
                            bool.TryParse(parameters["addWithNewIndex"], out addWithNewIndex);

                        return _driver.Upload(target, request.Files, addWithNewIndex);
                    case "duplicate":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.Duplicate(targets);
                        }
                    case "tmb":
                        {
                            IEnumerable<string> targets = GetTargetsArray(request);
                            if (targets == null)
                                Error.MissedParameter("targets");
                            return _driver.Thumbs(targets);
                        }
                    case "getaddressbook":
                        {
                            return _driver.GetAddressBook();
                        }
                    case "dim":
                        {
                            if (string.IsNullOrEmpty(target))
                                return Error.MissedParameter(cmdName);
                            return _driver.Dim(target);
                        }
                    case "resize":
                        {
                            if (string.IsNullOrEmpty(target))
                                return Error.MissedParameter(cmdName);
                            switch (parameters["mode"])
                            {
                                case "resize":
                                    return _driver.Resize(
                                        target,
                                        int.Parse(parameters["width"]),
                                        int.Parse(parameters["height"]));
                                case "crop":
                                    return _driver.Crop(
                                        target,
                                        int.Parse(parameters["x"]),
                                        int.Parse(parameters["y"]),
                                        int.Parse(parameters["width"]),
                                        int.Parse(parameters["height"]));
                                case "rotate":
                                    return _driver.Rotate(target, int.Parse(parameters["degree"]));
                                default:
                                    break;
                            }
                            return Error.CommandNotFound();
                        }
                    default:
                        return Error.CommandNotFound();
                }
            }
            catch (ElFinderFileNotExists ex)
            {
                return Error.Message(ex.Message);
            }
            catch (ElFinderDownloadException ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                return Error.Message("Произошла неизвестная ошибка.", ex.Message);
            }
        }

        private List<int> ConvertStringMasToInt(IEnumerable<string> mas)
        {
            var list = new List<int>();
            if (mas == null) return list;
            foreach (var item in mas)
            {
                int intItem;
                if (int.TryParse(item, out intItem))
                {
                    list.Add(intItem);
                }
            }
            return list;
        }

        /// <summary>
        /// Get actual filesystem path by hash
        /// </summary>
        /// <param name="hash">Hash of file or directory</param>
        public FileSystemInfo GetFileByHash(string hash)
        {
            FullPath path = _driver.ParsePath(hash);
            return !path.IsDirectoty ? path.File : (FileSystemInfo)path.Directory;
        }

        public ActionResult GetThumbnail(HttpRequestBase request, HttpResponseBase response, string hash)
        {
            string thumbHash = hash;
            if (thumbHash != null)
            {
                FullPath path = _driver.ParsePath(thumbHash);
                if (!path.IsDirectoty && path.Root.CanCreateThumbnail(path.File))
                {
                    if (!HttpCacheHelper.IsFileFromCache(path.File, request, response))
                    {
                        ImageWithMime thumb = path.Root.GenerateThumbnail(path);
                        return new FileStreamResult(thumb.ImageStream, thumb.Mime);
                    }
                    response.ContentType = Helper.GetMimeType(path.Root.PicturesEditor.ConvertThumbnailExtension(path.File.Extension));
                    response.End();
                }
            }
            return new EmptyResult();
        }

        private IEnumerable<string> GetTargetsArray(HttpRequestBase request)
        {
            IEnumerable<string> targets = request.Form.GetValues("targets");
            NameValueCollection parameters = request.QueryString.Count > 0 ? request.QueryString : request.Form;
            if (targets == null)
            {
                string t = parameters["targets[]"];
                if (string.IsNullOrEmpty(t))
                    t = parameters["targets"];
                if (string.IsNullOrEmpty(t))
                    return null;
                targets = t.Split(',');
            }
            return targets;
        }

        private IList<int> ExtractDataOfRequestParameter(HttpRequestBase request, string parameter)
        {
            IEnumerable<string> notUploadFilesIndex = request.Form.GetValues(parameter);
            NameValueCollection parameters = request.QueryString.Count > 0 ? request.QueryString : request.Form;
            if (notUploadFilesIndex == null)
            {
                string t = parameters[parameter + "[]"];
                if (string.IsNullOrEmpty(t))
                    t = parameters[parameter];
                if (string.IsNullOrEmpty(t))
                    return new List<int>();
                notUploadFilesIndex = t.Split(',');
            }
            return ConvertStringMasToInt(notUploadFilesIndex);
        }
    }
}