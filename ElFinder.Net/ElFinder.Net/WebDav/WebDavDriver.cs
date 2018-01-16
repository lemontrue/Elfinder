using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Xml;
using System.Xml.Serialization;
using ElFinder.DTO;
using ElFinder.Response;
using WebDav;
using ElFinder.CryptxService;
using System.Runtime.Serialization;
using System.Web;
using System.Web.Mvc;

namespace ElFinder.WebDav
{
    using ElFinder.InternalException;

    [DataContract]
    public class File
    {
        [DataMember(Name = "path")]
        public string path;
        [DataMember(Name = "lastChange")]
        public DateTime lastChange;
        [DataMember(Name = "name")]
        public string name;
        [DataMember(Name = "mime")]
        public string mime;
    }

    [DataContract]
    public class ReceivedFile : File
    {
        [DataMember(Name = "type")]
        public OperationType Type;
    }

    [DataContract]
    public class MasterData
    {
        [DataMember(Name = "Files")]
        public List<File> Files;
        [DataMember(Name = "Type")]
        public OperationType Type;
    }
    /// <summary>
    /// Represents a driver for local file system
    /// </summary>
    public class WebDavDriver : IDriver
    {
        private const string VolumePrefix = "v";
        private readonly List<WebDavRoot> roots;
        private readonly DirInfo clientRootDirInfo;
        private readonly Guid token;
        private readonly CryptxServiceClient service = new CryptxServiceClient();
        private const string Recived = "Полученные";
        private const string Upload = "Загруженные";

        readonly WebDavClient client;

        #region help methods

        private string GetCorrectDestinationFileName(string targetDecrypted)
        {
            DirInfo targetInfo = client.GetInfo(targetDecrypted);
            string destinationFileName, ext = "", path = "", nameWithoutExt = "";
            if (targetInfo.IsDirectory && targetDecrypted.EndsWith("/"))
                destinationFileName = targetDecrypted.Substring(0, targetDecrypted.Length - 1) + " (1)";
            else
            {
                path = targetDecrypted.Replace(targetInfo.DisplayName, "");
                ext = Path.GetExtension(targetInfo.DisplayName);
                nameWithoutExt = !string.IsNullOrEmpty(ext) ? targetInfo.DisplayName.Replace(ext, "") : targetInfo.DisplayName;
                destinationFileName = string.Format("{0}{1} (1){2}", path, nameWithoutExt, ext);
            }

            DirInfo newDestInfo = client.GetInfo(destinationFileName);
            int i = 2;
            while (newDestInfo != null)
            {
                if (targetInfo.IsDirectory && targetDecrypted.EndsWith("/"))
                    destinationFileName = string.Format("{0} ({1})", targetDecrypted.Substring(0, targetDecrypted.Length - 1), i);
                else
                    destinationFileName = string.Format("{0}{1} ({3}){2}", path, nameWithoutExt, ext, i);

                newDestInfo = client.GetInfo(destinationFileName);
                i++;
            }

            return destinationFileName;
        }

        private static JsonResult Json(object data)
        {
            return new JsonDataContractResult(data) { JsonRequestBehavior = JsonRequestBehavior.AllowGet, ContentType = "text/html" };
        }

        public string DecodeTarget(string target, string rootName = null)
        {
            return string.IsNullOrEmpty(target) ? rootName : Helper.DecodePath(target);
        }

        /// <summary>
        /// Добавление корня для отоброжение в elFinder
        /// </summary>
        /// <param name="folder">путь к папке относительно серверной папки пользователя</param>
        /// <param name="alias">имя отображаемое в elFinder</param>
        public void AddRootFolder(string folder, string alias = null)
        {
            DirInfo dirInfo = client.GetInfo(string.Format("{0}/{1}", clientRootDirInfo.RelPath, folder));
            if (dirInfo == null)
                return;

            WebDavRoot item = new WebDavRoot(dirInfo) { Alias = alias };

            item.Directory.HasSubDirectories = IsConstainsChild(item.Directory);
            item.VolumeId = VolumePrefix + this.roots.Count + "_";
            item.DTO = DTOBase.Create(item.Directory, item);
            this.roots.Add(item);
        }

        public DTOBase GetDtoDir(string folder, string alias = null)
        {
            DirectoryDTO response=new DirectoryDTO();

            return response;
        }

        public bool IsConstainsChild(DirInfo dir)
        {
            if (dir == null)
                return false;

            List<DirInfo> files = this.client.GetDirectories(dir.RelPath);
            return files != null && files.Any(d => d.IsDirectory);
        }

        /// <summary>
        /// Вернет номальный хэш файла без учета корня
        /// </summary>
        /// <param name="target"></param>
        /// <returns></returns>
        public string GetCorectTarget(string target)
        {
            string pathHash = null;
            for (int i = 0; i < target.Length; i++)
            {
                if (target[i] == '_')
                {
                    pathHash = target.Substring(i + 1);
                    break;
                }
            }
            return pathHash ?? target;
        }

        public WebDavRoot GetRoot(string target)
        {
            string volumePrefix = null;
            for (int i = 0; i < target.Length; i++)
            {
                if (target[i] == '_')
                {
                    volumePrefix = target.Substring(0, i + 1);
                    break;
                }
            }

            return this.roots.First(x => x.VolumeId == volumePrefix);
        }

        private DirInfo GetParent(DirInfo directory)
        {
            if (directory == null)
                return null;

            string parentPath;
            if (directory.RelPath.EndsWith("/"))
                parentPath = directory.RelPath.Substring(0, directory.RelPath.Length - 1);
            else
                parentPath = directory.RelPath;

            int lastIndex = parentPath.LastIndexOf("/", StringComparison.Ordinal);
            if (lastIndex == -1)
                return null;

            parentPath = parentPath.Substring(0, lastIndex);
            if (string.IsNullOrEmpty(parentPath))
                return null;

            List<DirInfo> parentInfo = client.GetDirectories(parentPath, true);
            return parentInfo != null && parentInfo.Count > 0 ? parentInfo[0] : null;
        }

        private bool Filter(DirInfo dirInfo, string filterQuery)
        {
            string name = dirInfo.DisplayName;
            if (dirInfo.IsDirectory) return true;
            string ext = Path.GetExtension(name);
            switch (filterQuery)
            {
                case "All":
                    return true;
                case "Crypt":
                    return ext == ".enc";
                case "Sign":
                    return ext == ".sig";
                case "NotCryptSign":
                    return ext != ".sig" && ext != ".enc"; ;
                default:
                    return true;
            }
        }

        private List<string> GetPathes(IEnumerable<string> targets)
        {
            List<string> list = new List<string>();
            foreach (string target in targets)
            {
                string trgt = this.GetCorectTarget(target);
                trgt = this.DecodeTarget(trgt);
                list.Add(HttpUtility.UrlDecode(trgt));
            }
            return list;
        }

        private List<File> GetFiles(IEnumerable<string> targets)
        {
            List<File> files = new List<File>();
            foreach (string target in targets)
            {
                string trgt = this.GetCorectTarget(target);
                trgt = this.DecodeTarget(trgt);
                DirInfo dirInfo = client.GetInfo(trgt);
                if (dirInfo == null) throw new ElFinderFileNotExists();
                files.Add(new File()
                {
                    path = HttpUtility.UrlDecode(dirInfo.RelPath),
                    lastChange = Convert.ToDateTime(dirInfo.LastModified)
                });
            }

            return files;
        }

        private object GetDataForSendingMaster(IEnumerable<string> targets, OperationType type)
        {
            List<File> files = GetFiles(targets);
            return new MasterData()
            {
                Files = files,
                Type = type
            };
        }

        #endregion help methods

        /// <summary>
        /// Initialize new instance of class ElFinder.FileSystemDriver 
        /// </summary>
        public WebDavDriver(string server, Guid token)
        {
            this.roots = new List<WebDavRoot>();
            //client = new WebDavClient(server, login, password);
            client = new WebDavClient(server, token);
            if (client == null)
                throw new ElFinderException("Произошла ошибка при инициализации WebDav.");
            if (!String.IsNullOrEmpty(client.LastError))
                throw new ElFinderException("Произошла ошибка при инициализации WebDav" + client.LastError);
            clientRootDirInfo = client.GetInfo("");

            if (clientRootDirInfo == null || token == Guid.Empty)
                throw new ElFinderException("Произошла ошибка при инициализации WebDav. Нет доступа к корневой директории.");

            this.AddRootFolder(Recived);
            this.AddRootFolder(Upload);
            this.token = token;
        }

        #region   IDriver
        FullPath IDriver.ParsePath(string target)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.Open(string target, bool tree)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);

            target = this.DecodeTarget(target, lroot.Directory.RelPath);
            List<DirInfo> filesFormWebFav = client.GetDirectories(target, true);
            List<DirInfo> directories = filesFormWebFav.FindAll(d => d.IsDirectory);
            DirInfo targetDirInfo = directories[0];
            DirInfo parentDirInfo = this.GetParent(targetDirInfo);
            targetDirInfo.HasSubDirectories = filesFormWebFav != null && directories != null && directories.Count > 1;

            OpenResponseBase answer = new OpenResponseBase(DTOBase.Create(targetDirInfo, parentDirInfo, lroot));
            if (filesFormWebFav != null)
            {
                filesFormWebFav.Remove(targetDirInfo);
                foreach (DirInfo dirInfo in filesFormWebFav)
                {
                    dirInfo.HasSubDirectories = IsConstainsChild(dirInfo);
                    answer.Files.Add(DTOBase.Create(dirInfo, targetDirInfo, lroot));
                }
            }
            //HttpContext.Current.Session[RetTarget] = answer.CurrentWorkingDirectory.Hash;
            return Json(answer);
        }
        JsonResult IDriver.GetReceivedMailFiles(Guid fileGroupSendId)
        {
            List<OperationFile> operationFiles;
            try
            {
                Guid receivedFileGroupId = service.FileGroupReceive(fileGroupSendId, token);
                operationFiles = service.GetFileGroupFiles(receivedFileGroupId, token);
            }
            catch (Exception ex)
            {
                return Error.Message(ex.Message);
            }

            List<ReceivedFile> files = new List<ReceivedFile>();
            foreach (OperationFile operationFile in operationFiles)
            {
                ReceivedFile file = new ReceivedFile();
                DirInfo dirInfo = client.GetInfo(operationFile.FileUri);
                if (dirInfo == null) throw new ElFinderFileNotExists();
                string ext = Path.GetExtension(dirInfo.DisplayName);
                file.name = dirInfo.DisplayName;
                file.mime = string.IsNullOrEmpty(ext) ? "unknown" : Helper.GetMimeType(ext.ToLower().Substring(1));
                file.path = HttpUtility.UrlDecode(dirInfo.RelPath);
                DateTime.TryParse(dirInfo.LastModified, out file.lastChange);
                if (ext == ".enc")
                {
                    string name = dirInfo.DisplayName.Substring(0, dirInfo.DisplayName.LastIndexOf(".", System.StringComparison.Ordinal));
                    string ext2 = Path.GetExtension(name);
                    if (ext2 == ".sig") file.Type = OperationType.DecryptSignverify;
                    else file.Type = OperationType.Decrypt;
                }
                else if (ext == ".sig") file.Type = OperationType.SignVerify;
                files.Add(file);
            }

            return Json(new { Files = files });
        }
        JsonResult IDriver.Filter(string target, string query)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);

            target = this.DecodeTarget(target, lroot.Directory.RelPath);
            List<DirInfo> filesFormWebFav = client.GetDirectories(target, true);
            List<DirInfo> directories = filesFormWebFav.FindAll(d => d.IsDirectory);
            DirInfo targetDirInfo = directories[0];
            DirInfo parentDirInfo = this.GetParent(targetDirInfo);
            targetDirInfo.HasSubDirectories = filesFormWebFav != null && directories != null && directories.Count > 1;

            OpenResponseBase answer = new OpenResponseBase(DTOBase.Create(targetDirInfo, parentDirInfo, lroot));
            if (filesFormWebFav != null)
            {
                filesFormWebFav.Remove(targetDirInfo);
                foreach (DirInfo dirInfo in filesFormWebFav)
                {
                    if (!Filter(dirInfo, query)) continue;

                    answer.Files.Add(DTOBase.Create(dirInfo, targetDirInfo, lroot));
                }
            }
            var r = Json(answer);
            return r;
        }
        JsonResult IDriver.Init(string retTarget,string isModal,bool initReceivedFolder)
        {
            //if (HttpContext.Current.Session[RetTarget]!=null && !ReferenceEquals(HttpContext.Current.Session[RetTarget], ""))
            //{
            //    return ((IDriver)this).Open(HttpContext.Current.Session[RetTarget].ToString(),false);
            //}
            WebDavRoot lroot = !initReceivedFolder ?
                this.roots.FirstOrDefault(x => x.Directory.DisplayName == Upload) :
                this.roots.FirstOrDefault(x => x.Directory.DisplayName == Recived);
            if (lroot == null) throw new ArgumentNullException(string.Format("Не найдена ожидаемая папка({0} или {1})", Upload, Recived));


            string mytarget = lroot.Directory.RelPath;
            if (!string.IsNullOrEmpty(retTarget))
            {
                lroot = GetRoot(retTarget);
                mytarget = GetCorectTarget(retTarget);
                mytarget = DecodeTarget(mytarget);
            }
            List<DirInfo> filesFormWebFav = client.GetDirectories(mytarget, true);
            if (filesFormWebFav == null)
                return null;

            List<DirInfo> directories = filesFormWebFav.FindAll(d => d.IsDirectory);

            DirInfo targetDirInfo = directories[0];
            //var parent = getParent(targetDirInfo);
            targetDirInfo.HasSubDirectories = filesFormWebFav != null && directories != null && directories.Count > 1;

            Options options = new Options
            {
                Path = mytarget,
                ThumbnailsUrl = "Thumbnails/"
            };

            var curDir = lroot.DTO;

            if (!string.IsNullOrEmpty(retTarget))
            {
                DirInfo parentDirInfo = this.GetParent(targetDirInfo);
                curDir = DTOBase.Create(targetDirInfo, parentDirInfo, lroot);
            }
            //curDir = lroot.DTO;

            InitResponse answer = new InitResponse(curDir, options);
            if (filesFormWebFav != null)
            {
                filesFormWebFav.Remove(targetDirInfo);
                foreach (DirInfo dirInfo in filesFormWebFav)
                {
                    dirInfo.HasSubDirectories = IsConstainsChild(dirInfo);
                    answer.Files.Add(DTOBase.Create(dirInfo, targetDirInfo, lroot));
                }
            }


            foreach (WebDavRoot item in this.roots)
            {
                answer.Files.Add(item.DTO);
            }

            

            List<DTOBase> filteredFiles=new List<DTOBase>();
            foreach (DTOBase dtoBase in answer.Files)
            {
                string fileName = (dtoBase.Name);
                string ext = Path.GetExtension(fileName);
                if (isModal != "1")
                {
                    //поиск по неподписан и не зашифрован
                    if (ext != ".sig" && ext != ".enc")
                    {
                        filteredFiles.Add(dtoBase);
                    }
                    //filteredFiles.Add(dtoBase);
                }
                else
                {
                    filteredFiles.Add(dtoBase);
                }

            }
            answer.Files.Clear();
            answer.Files.AddRange(filteredFiles); 
            //var answer1 = new InitResponse(answer.Files[0], options);
            //answer1.Files.AddRange(answer.Files);
            

            return Json(answer);
        }
        ActionResult IDriver.File(string target, bool download)
        {
            target = this.GetCorectTarget(target);
            target = this.DecodeTarget(target);
            DirInfo dirInfo = client.GetInfo(target);
            if (dirInfo == null) throw new ElFinderFileNotExists();
            Stream stream = client.DownloadStream(target);
            return new WebDavDownloadFileResult(dirInfo, stream, download);
        }
        ActionResult IDriver.Download(IEnumerable<string> targets)
        {
            string[] enumerable = targets as string[] ?? targets.ToArray();
            if (enumerable.Count() == 1)
            {
                string target = enumerable[0];
                target = this.GetCorectTarget(target);
                target = this.DecodeTarget(target);
                DirInfo dirInfo = client.GetInfo(target);
                if (dirInfo == null) throw new ElFinderDownloadException("Файл не существует или удален.");
                Stream stream = client.DownloadStream(target);
                WebDavDownloadFileResult retVal=new WebDavDownloadFileResult(dirInfo, stream, true);
                
                return retVal;
            }
            List<DirInfo> dirInfoList = new List<DirInfo>();
            foreach (string item in enumerable)
            {
                string target = this.DecodeTarget(this.GetCorectTarget(item));
                DirInfo dirInfo = client.GetInfo(target);
                if (dirInfo != null) dirInfoList.Add(dirInfo);
            }
            byte[] content = Helper.GetZip(dirInfoList, client);
            return new WebDavDownloadZip(content);
        }
        ActionResult IDriver.CertDownload(string thumb)
        {
            CertificateResponse response = service.GetCertificate(thumb,Guid.Empty,token );

            return new WebDavDownloadFileResult(new DirInfo()
            {
                ContentLenght = response.CertificateFileBytes.Length,
                DisplayName = thumb + ".cer"
            }, response.CertificateFileBytes, true);
        }
        JsonResult IDriver.Parents(string target)
        {
            WebDavRoot lroot = this.GetRoot(target);
            
            target = this.GetCorectTarget(target);

            target = this.DecodeTarget(target);
            TreeResponse answer = new TreeResponse();
            DirInfo dirInfo = client.GetInfo(target);
            if (dirInfo == null) throw new ElFinderFileNotExists();
            DirInfo parent = this.GetParent(dirInfo);
            if (parent == null)
            {
                answer.Tree.Add(DTOBase.Create(dirInfo, null, lroot));
            }
            else
            {
                
                List<DirInfo> directories = client.GetDirectories(parent.RelPath);
                foreach (DirInfo d in directories)
                {
                    if (!d.IsDirectory)
                        continue;

                    answer.Tree.Add(DTOBase.Create(d, parent, lroot));
                }

                while (parent.FullPath != lroot.Directory.FullPath)
                {
                     
                     var thisParent = (client.GetInfo(parent.getDir()));
                   //parent = (client.GetInfo(parent.getDir()));
                   answer.Tree.Add(DTOBase.Create(parent,thisParent, lroot));
                    parent = thisParent;
                }
            }
            return Json(answer);
        }
        JsonResult IDriver.Tree(string target)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);

            target = this.DecodeTarget(target);
            TreeResponse answer = new TreeResponse();
            List<DirInfo> directories = client.GetDirectories(target, true);
            for (int i = 1; i < directories.Count; i++)
            {
                if (!directories[i].IsDirectory)
                    continue;

                directories[i].HasSubDirectories = IsConstainsChild(directories[i]);
                answer.Tree.Add(DTOBase.Create(directories[i], directories[0], lroot));
            }

            return Json(answer);
        }
        JsonResult IDriver.List(string target)
        {
            target = this.GetCorectTarget(target);

            target = this.DecodeTarget(target);
            List<DirInfo> filesFormWebFav = client.GetDirectories(target);
            ListResponse answer = new ListResponse();
            foreach (DirInfo dirInfo in filesFormWebFav)
                answer.List.Add(dirInfo.DisplayName);

            return Json(answer);
        }
        JsonResult IDriver.MakeDir(string target, string name)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            target = this.DecodeTarget(target);
            client.CreateDirectory(target + name);
            DirInfo dirInfo = client.GetInfo(target + name);
            DirInfo parent = this.GetParent(dirInfo);
            return Json(new AddResponse(dirInfo, parent, lroot));
        }
        JsonResult IDriver.MakeFile(string target, string name)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            byte[] content = new byte[0];
            client.Upload(decodedTarget + name, content);
            DirInfo fileInfo = client.GetInfo(decodedTarget + name);
            DirInfo parent = this.GetParent(fileInfo);
            return Json(new AddResponse(fileInfo, parent, lroot));
        }
        JsonResult IDriver.Rename(string target, string name)
        {
            string oldTarget = target;
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            target = this.DecodeTarget(target);
            DirInfo oldDirInfo = client.GetInfo(target);
            if (oldDirInfo == null) throw new ElFinderFileNotExists();
            DirInfo parent = this.GetParent(oldDirInfo);
            client.Rename(target, parent.RelPath + name);
            DirInfo newDirInfo = client.GetInfo(parent.RelPath + name);
            if (newDirInfo == null)
                return Error.Message("Невозможно переименовать файл. Задано некорректное имя.");
            ReplaceResponse answer = new ReplaceResponse();
            answer.Removed.Add(oldTarget);
            answer.Added.Add(DTOBase.Create(newDirInfo, parent, lroot));
            return Json(answer);
        }
        JsonResult IDriver.Remove(IEnumerable<string> targets)
        {
            RemoveResponse answer = new RemoveResponse();
            foreach (string item in targets)
            {
                string decodedItem = this.DecodeTarget(this.GetCorectTarget(item));
                client.Delete(decodedItem);
                answer.Removed.Add(item);
            }
            return Json(answer);
        }
        JsonResult IDriver.GetAddressBook()
        {
            try
            {
                UserAddressBookResponse addressBook = this.service.GetAddressBook("", AddressBookSort.ContactNameASC, AddressBookFilter.All, Guid.Empty, token, 0);
                return Json(addressBook);
            }
            catch (Exception ex)
            {
                return Error.Message("Connector.WebDavDriver: Ошибка сервиса при получении адресной книги!");
            }
        }
        JsonResult IDriver.GetUri(IEnumerable<string> targets, OperationType type)
        {
            try
            {
                object data = this.GetDataForSendingMaster(targets, type);
                return Json(data);
            }
            catch (ElFinderFileNotExists ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                return Error.Message("Connector.WebDavDriver: Ошибка сервиса при получении Uri файла!");
            }
        }
        JsonResult IDriver.Encrypt(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.Decrypt(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.Sign(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.CheckSign(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.Send(IEnumerable<string> targets, string emailList)
        {
            List<OperationFile> list = new List<OperationFile>();
            foreach (string target in targets)
            {
                string t = this.GetCorectTarget(target);
                t = this.DecodeTarget(t);
                list.Add(new OperationFile()
                {
                    FileUri = HttpUtility.UrlDecode(t)
                });
            }
            try
            {
                Guid fileGroupId = service.FileGroupCreate(list, OperationType.SendFiles, token);
                Guid fileGroupSendId = service.FileGroupSend(fileGroupId, "sendfiles", emailList,"",false, token,false);
            }
            catch (Exception ex)
            {
                return Error.Message("Connector.WebDavDriver: Ошибка сервиса при отправке почты!");
            }
            return Json(new { isSend = true });
        }
        JsonResult IDriver.SignAndEncrypt(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.DecryptAndCheckSign(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
        JsonResult IDriver.Add(IEnumerable<string> targets)
        {
            try
            {
                List<File> resList = GetFiles(targets);
                return Json(
                    new
                    {
                        Files = resList
                    });
            }
            catch (Exception ex)
            {
                return Error.Message("Connector.WebDavDriver: Ошибка сервиса при получении Uri файла!");
            }
        }
        JsonResult IDriver.CryptInfo(string target)
        {
            try
            {
                target = this.GetCorectTarget(target);
                target = this.DecodeTarget(target);
                DirInfo dirInfo = client.GetInfo(target);
                if (dirInfo == null)
                    throw new ElFinderFileNotExists();
                CustomFileInfo info = service.GetFileInfo(target, token);
                return Json(info);
            }
            catch (ElFinderFileNotExists ex)
            {
                throw;
            }
            catch (Exception ex)
            {
                return Error.Message("Connector.WebDavDriver: Ошибка сервиса при получении информации о сертификатах!");
            }
        }
        JsonResult IDriver.Get(string target)
        {
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            GetResponse answer = new GetResponse();
            answer.Content = Encoding.Default.GetString(client.Download(decodedTarget));
            return Json(answer);
        }
        JsonResult IDriver.Put(string target, string content)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            ChangedResponse answer = new ChangedResponse();
            client.Upload(decodedTarget, Encoding.Default.GetBytes(content));
            DirInfo targetInfo = client.GetInfo(decodedTarget);
            if (targetInfo == null) throw new ElFinderFileNotExists();
            DirInfo parent = this.GetParent(targetInfo);
            answer.Changed.Add((FileDTO)DTOBase.Create(targetInfo, parent, lroot));
            return Json(answer);
        }
        JsonResult IDriver.Paste(string source, string dest, IEnumerable<string> targets, bool isCut, IList<int> dublicateIndexes = null)
        {
            ReplaceResponse response = new ReplaceResponse();
            string destDecrypted = this.DecodeTarget(this.GetCorectTarget(dest));
            DirInfo destInfo = client.GetInfo(destDecrypted);
            int ind = 0;
            foreach (string target in targets)
            {
                WebDavRoot lroot = this.GetRoot(dest);
                string targetDecrypted = this.DecodeTarget(this.GetCorectTarget(target));
                DirInfo targetInfo = client.GetInfo(targetDecrypted);
                if (targetInfo == null) throw new ElFinderFileNotExists();
                if (isCut)
                {
                    response.Removed.Add(this.GetCorectTarget(target));
                    client.Move(targetDecrypted, destDecrypted + targetInfo.DisplayName);
                    targetInfo = client.GetInfo(destInfo.RelPath + targetInfo.DisplayName);
                    response.Added.Add(DTOBase.Create(targetInfo, destInfo, lroot));
                }
                else
                {
                    string destinationFileName = dublicateIndexes != null && dublicateIndexes.Contains(ind)
                        ? GetCorrectDestinationFileName(destInfo.RelPath + targetInfo.DisplayName)
                        : destInfo.RelPath + targetInfo.DisplayName;

                    client.Copy(targetDecrypted, destinationFileName);
                    targetInfo = client.GetInfo(destinationFileName);
                    DirInfo parent = this.GetParent(targetInfo);
                    response.Added.Add(DTOBase.Create(targetInfo, parent, lroot));
                }
                ind++;
            }

            return Json(response);
        }
        JsonResult IDriver.Upload(string target, System.Web.HttpFileCollectionBase targets, bool addWithNewIndex)
        {
            string dest = this.DecodeTarget(this.GetCorectTarget(target));
            WebDavRoot lroot = this.GetRoot(target);
            if (lroot.Directory.DisplayName == Recived)
            {
                dest = Upload + "/";
                lroot = this.roots.FirstOrDefault(x => x.Directory.DisplayName == Upload);
            }
            AddResponse response = new AddResponse();
            DirInfo destInfo = client.GetInfo(dest);
            JsonResult errorResp = Error.Message("Connector.WebDavDriver: Ошибка сервиса. Невозможно загрузить файл. Некорректное имя файла!");
            for (int i = 0; i < targets.AllKeys.Length; i++)
            {
                HttpPostedFileBase file = targets[i];
                if (file == null) return errorResp;
                string name = file.FileName;

                if (file.FileName.Contains("#"))
                    name = file.FileName.Replace("#", "");
                if (addWithNewIndex)
                    name = GetCorrectDestinationFileName(destInfo.RelPath + name);
                client.Upload(dest + Path.GetFileName(name), file.InputStream);
                DirInfo fileInfo = client.GetInfo(dest + Path.GetFileName(name));
                if (fileInfo == null) return errorResp;
                response.Added.Add((FileDTO)DTOBase.Create(fileInfo, destInfo, lroot));
            }

            return Json(response);
        }
        JsonResult IDriver.Duplicate(IEnumerable<string> targets)
        {
            AddResponse response = new AddResponse();
            foreach (string target in targets)
            {
                WebDavRoot lroot = this.GetRoot(target);
                string ext = "", path = "", nameWithoutExt = "";
                string targetDecrypted = this.DecodeTarget(this.GetCorectTarget(target));
                DirInfo targetInfo = client.GetInfo(targetDecrypted);
                if (targetInfo == null) throw new ElFinderFileNotExists();
                string destinationFileName;
                if (targetInfo.IsDirectory && targetDecrypted.EndsWith("/"))
                    destinationFileName = targetDecrypted.Substring(0, targetDecrypted.Length - 1) + " (1)";
                else
                {
                    path = targetDecrypted.Replace(targetInfo.DisplayName, "");
                    ext = Path.GetExtension(targetInfo.DisplayName);
                    nameWithoutExt = targetInfo.DisplayName.Replace(ext, "");
                    destinationFileName = string.Format("{0}{1} (1){2}", path, nameWithoutExt, ext);
                }

                DirInfo destInfo = client.GetInfo(destinationFileName);
                int i = 2;
                while (destInfo != null)
                {
                    if (targetInfo.IsDirectory && targetDecrypted.EndsWith("/"))
                        destinationFileName = string.Format("{0} ({1})", targetDecrypted.Substring(0, targetDecrypted.Length - 1), i);
                    else
                        destinationFileName = string.Format("{0}{1} ({3}){2}", path, nameWithoutExt, ext, i);

                    destInfo = client.GetInfo(destinationFileName);
                    i++;
                }

                client.Copy(targetDecrypted, destinationFileName);
                destInfo = client.GetInfo(destinationFileName);
                DirInfo parent = this.GetParent(destInfo);
                response.Added.Add(DTOBase.Create(destInfo, parent, lroot));
            }

            return Json(response);
        }
        JsonResult IDriver.Thumbs(IEnumerable<string> targets)
        {
            ThumbsResponse response = new ThumbsResponse();
            foreach (string target in targets)
            {
                string targetDecoded = this.DecodeTarget(this.GetCorectTarget(target));
                DirInfo targetInfo = client.GetInfo(targetDecoded);
                DirInfo parentInfo = this.GetParent(targetInfo);
                DateTime lastTimeModified;
                if (!DateTime.TryParse(targetInfo.LastModified, out lastTimeModified))
                    continue;

                string thumbName = Path.GetFileNameWithoutExtension(targetInfo.DisplayName) +
                    "_" + Helper.GetFileMd5(targetInfo.DisplayName, lastTimeModified) +
                    Path.GetExtension(targetInfo.DisplayName);

                response.Images.Add(this.GetCorectTarget(target), Helper.EncodePath(parentInfo.RelPath + thumbName));
            }
            return Json(response);
        }
        JsonResult IDriver.Dim(string target)
        {
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            WebDavPicturesEditor pictureEditor = new WebDav.WebDavPicturesEditor(client);
            DimResponse response = new DimResponse(pictureEditor.GetSize(decodedTarget));
            return Json(response);
        }
        JsonResult IDriver.Resize(string target, int width, int height)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            WebDavPicturesEditor pictureEditor = new WebDav.WebDavPicturesEditor(client);
            pictureEditor.Resize(decodedTarget, width, height);
            DirInfo targetInfo = client.GetInfo(decodedTarget);
            DirInfo parentInfo = this.GetParent(targetInfo);
            ChangedResponse response = new ChangedResponse();
            response.Changed.Add((FileDTO)DTOBase.Create(targetInfo, parentInfo, lroot));
            return Json(response);
        }
        JsonResult IDriver.Crop(string target, int x, int y, int width, int height)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            WebDavPicturesEditor pictureEditor = new WebDav.WebDavPicturesEditor(client);
            pictureEditor.Crop(decodedTarget, x, y, width, height);
            DirInfo targetInfo = client.GetInfo(decodedTarget);
            DirInfo parentInfo = this.GetParent(targetInfo);
            ChangedResponse response = new ChangedResponse();
            response.Changed.Add((FileDTO)DTOBase.Create(targetInfo, parentInfo, lroot));
            return Json(response);
        }
        JsonResult IDriver.Rotate(string target, int degree)
        {
            WebDavRoot lroot = this.GetRoot(target);
            target = this.GetCorectTarget(target);
            string decodedTarget = this.DecodeTarget(target);
            WebDavPicturesEditor pictureEditor = new WebDav.WebDavPicturesEditor(client);
            pictureEditor.Rotate(decodedTarget, degree);
            DirInfo targetInfo = client.GetInfo(decodedTarget);
            DirInfo parentInfo = this.GetParent(targetInfo);
            ChangedResponse response = new ChangedResponse();
            response.Changed.Add((FileDTO)DTOBase.Create(targetInfo, parentInfo, lroot));
            return Json(response);
        }
        JsonResult IDriver.TestOperation(string target)
        {
            target = this.GetCorectTarget(target);
            return Json(new Object());
        }
        #endregion IDriver
    }
}