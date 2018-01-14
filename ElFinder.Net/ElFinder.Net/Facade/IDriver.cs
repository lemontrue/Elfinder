using System.Collections.Generic;
using System.Web.Mvc;
using System.Web;
using System;
using ElFinder.CryptxService;

namespace ElFinder
{
    public interface IDriver
    {
        JsonResult Open(string target, bool tree);
        JsonResult Filter(string target,string query);
        JsonResult Init(string retUrl, string isModal, bool initReceivedFolder = false);
        JsonResult Parents(string target);
        JsonResult Tree(string target);
        JsonResult List(string target);
        JsonResult MakeDir(string target, string name);
        JsonResult MakeFile(string target, string name);
        JsonResult Rename(string target, string name);
        JsonResult Remove(IEnumerable<string> targets);
        JsonResult Duplicate(IEnumerable<string> targets);
        JsonResult Get(string target);
        JsonResult Put(string target, string content);
        JsonResult Paste(string source, string dest, IEnumerable<string> targets, bool isCut, IList<int> dublicateIndexes = null);
        JsonResult Upload(string target, HttpFileCollectionBase targets, bool addWithNewIndex);
        JsonResult Thumbs(IEnumerable<string> targets);
        JsonResult Dim(string target);
        JsonResult Resize(string target, int width, int height);
        JsonResult Crop(string target, int x, int y, int width, int height);
        JsonResult Rotate(string target, int degree);
        ActionResult File(string target, bool download);
        FullPath ParsePath(string target);
        JsonResult TestOperation(string target);
        JsonResult GetAddressBook();
        JsonResult Encrypt(IEnumerable<string> targets);
        JsonResult Decrypt(IEnumerable<string> targets);
        JsonResult Sign(IEnumerable<string> targets);
        JsonResult CheckSign(IEnumerable<string> targets);
        JsonResult Send(IEnumerable<string> targets, string emailList);
        JsonResult SignAndEncrypt(IEnumerable<string> targets);
        JsonResult DecryptAndCheckSign(IEnumerable<string> targets);
        JsonResult CryptInfo(string target);
        ActionResult CertDownload(string thumb);
        JsonResult GetUri(IEnumerable<string> targets,OperationType type);
        JsonResult GetReceivedMailFiles(Guid fileGroupSendId);
        JsonResult Add(IEnumerable<string> targets);
        ActionResult Download(IEnumerable<string> targets);
    }
}