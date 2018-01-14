using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;
using System.Web.Mvc;

using ElFinder.DTO;
using ElFinder.Response;
using WebDav;

namespace ElFinder
{
    using ElFinder.CryptxService;

    //[DataContract]
    //public class File
    //{
    //    [DataMember(Name = "path")]
    //    public string path;
    //    [DataMember(Name = "lastChange")]
    //    public DateTime lastChange;
    //    [DataMember(Name = "name")]
    //    public string name;
    //    [DataMember(Name = "mime")]
    //    public string mime;
    //}
    //[DataContract]
    //public class ReceivedFile : WebDav.File
    //{
    //    [DataMember(Name = "type")]
    //    public OperationType Type;
    //}

    //[DataContract]
    //public class MasterData
    //{
    //    [DataMember(Name = "Files")]
    //    public List<WebDav.File> Files;
    //    [DataMember(Name = "Type")]
    //    public OperationType Type;
    //}


    /// <summary>
    /// Represents a driver for local file system
    /// </summary>
    public class FileSystemDriver : IDriver
    {
        #region private  
        private const string _volumePrefix = "v";
        private List<Root> _roots;
        private readonly DirInfo clientRootDirInfo;
        private readonly Guid token;
        private readonly CryptxServiceClient service = new CryptxServiceClient();
        private const string Recived = "Полученные";
        private const string Upload = "Загруженные";

        private JsonResult Json(object data)
        {
            return new JsonDataContractResult(data) { JsonRequestBehavior = JsonRequestBehavior.AllowGet, ContentType = "text/html" };
        }
        private void DirectoryCopy(DirectoryInfo sourceDir, string destDirName, bool copySubDirs)
        {
            DirectoryInfo[] dirs = sourceDir.GetDirectories();

            // If the source directory does not exist, throw an exception.
            if (!sourceDir.Exists)
            {
                throw new DirectoryNotFoundException("Source directory does not exist or could not be found: " + sourceDir.FullName);
            }

            // If the destination directory does not exist, create it.
            if (!Directory.Exists(destDirName))
            {
                Directory.CreateDirectory(destDirName);
            }

            // Get the file contents of the directory to copy.
            FileInfo[] files = sourceDir.GetFiles();

            foreach (FileInfo file in files)
            {
                // Create the path to the new copy of the file.
                string temppath = Path.Combine(destDirName, file.Name);

                // Copy the file.
                file.CopyTo(temppath, false);
            }

            // If copySubDirs is true, copy the subdirectories.
            if (copySubDirs)
            {
                foreach (DirectoryInfo subdir in dirs)
                {
                    // Create the subdirectory.
                    string temppath = Path.Combine(destDirName, subdir.Name);

                    // Copy the subdirectories.
                    DirectoryCopy(subdir, temppath, copySubDirs);
                }
            }
        }

        private void RemoveThumbs(FullPath path)
        {
            if (path.Directory != null)
            {
                string thumbPath = path.Root.GetExistingThumbPath(path.Directory);
                if (thumbPath != null)
                    Directory.Delete(thumbPath, true);
            }
            else
            {
                string thumbPath = path.Root.GetExistingThumbPath(path.File);
                if (thumbPath != null)
                    File.Delete(thumbPath);
            }
        }
        #endregion

        #region public 

        public FullPath ParsePath(string target)
        {
            string volumePrefix = null;
            string pathHash = null;
            for (int i = 0; i < target.Length; i++)
            {
                if (target[i] == '_')
                {
                    pathHash = target.Substring(i + 1);
                    volumePrefix = target.Substring(0, i + 1);
                    break;
                }
            }
            Root root = _roots.First(r => r.VolumeId == volumePrefix);
            string path = Helper.DecodePath(pathHash);
            string dirUrl = path != root.Directory.Name ? path : string.Empty;
            var dir = new DirectoryInfo(root.Directory.FullName + dirUrl);
            if (dir.Exists)
            {
                return new FullPath(root, dir);
            }
            else
            {
                var file = new FileInfo(root.Directory.FullName + dirUrl);
                return new FullPath(root, file);
            }
        }

        /// <summary>
        /// Initialize new instance of class ElFinder.FileSystemDriver 
        /// </summary>
        public FileSystemDriver()
        {
            _roots = new List<Root>();
        }

        public FileSystemDriver(string server, Guid token)
        {
            this.token = token;
            DirectoryInfo thumbsStorage = new DirectoryInfo(Server.MapPath("~/Files"));
            this.AddRoot(new Root(new DirectoryInfo(@"C:\Program Files"))
            {
                IsLocked = true,
                IsReadOnly = true,
                IsShowOnly = true,
                ThumbnailsStorage = thumbsStorage,
                ThumbnailsUrl = "Thumbnails/"
            });
            //this.AddRoot(new Root(new DirectoryInfo(Server.MapPath("~/Files")), "/Files/")
            //{
            //    Alias = "My documents",
            //    StartPath = new DirectoryInfo(Server.MapPath("~/Files/новая папка")),
            //    ThumbnailsStorage = thumbsStorage,
            //    MaxUploadSizeInMb = 2.2,
            //    ThumbnailsUrl = "Thumbnails/"
            //});

            _roots = new List<Root>();
        }

        /// <summary>
        /// Adds an object to the end of the roots.
        /// </summary>
        /// <param name="item"></param>
        public void AddRoot(Root item)
        {
            _roots.Add(item);
            item.VolumeId = _volumePrefix + _roots.Count + "_";
        }

        /// <summary>
        /// Gets collection of roots
        /// </summary>
        public IEnumerable<Root> Roots { get { return _roots; } }
        #endregion public

        #region   IDriver
        JsonResult IDriver.Open(string target, bool tree)
        {
            FullPath fullPath = ParsePath(target);
            OpenResponse answer = new OpenResponse(DTOBase.Create(fullPath.Directory, fullPath.Root), fullPath);
            foreach (FileInfo item in fullPath.Directory.GetFiles())
            {
                if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    answer.Files.Add(DTOBase.Create(item, fullPath.Root));
            }
            foreach (DirectoryInfo item in fullPath.Directory.GetDirectories())
            {
                if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    answer.Files.Add(DTOBase.Create(item, fullPath.Root));
            }
            return Json(answer);
        }

        JsonResult Init(string target)
        {
            FullPath fullPath;
            if (string.IsNullOrEmpty(target))
            {
                Root root = _roots.FirstOrDefault(r => r.StartPath != null);
                if (root == null)
                    root = _roots.First();
                fullPath = new FullPath(root, root.StartPath ?? root.Directory);
            }
            else
            {
                fullPath = ParsePath(target);
            }
            InitResponse answer = new InitResponse(DTOBase.Create(fullPath.Directory, fullPath.Root), new Options(fullPath));

            foreach (FileInfo item in fullPath.Directory.GetFiles())
            {
                if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    answer.Files.Add(DTOBase.Create(item, fullPath.Root));
            }
            foreach (DirectoryInfo item in fullPath.Directory.GetDirectories())
            {
                if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    answer.Files.Add(DTOBase.Create(item, fullPath.Root));
            }
            foreach (Root item in _roots)
            {
                answer.Files.Add(DTOBase.Create(item.Directory, item));
            }
            if (fullPath.Root.Directory.FullName != fullPath.Directory.FullName)
            {
                foreach (DirectoryInfo item in fullPath.Root.Directory.GetDirectories())
                {
                    if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                        answer.Files.Add(DTOBase.Create(item, fullPath.Root));
                }
            }
            if (fullPath.Root.MaxUploadSize.HasValue)
            {
                answer.UploadMaxSize = fullPath.Root.MaxUploadSizeInKb.Value + "K";
            }
            return Json(answer);
        }
        ActionResult IDriver.File(string target, bool download)
        {
            FullPath fullPath = ParsePath(target);
            if (fullPath.IsDirectoty)
                return new HttpStatusCodeResult(403, "You can not download whole folder");
            if (!fullPath.File.Exists)
                return new HttpNotFoundResult("File not found");
            if (fullPath.Root.IsShowOnly)
                return new HttpStatusCodeResult(403, "Access denied. Volume is for show only");
            return new DownloadFileResult(fullPath.File, download);
        }
        JsonResult IDriver.Parents(string target)
        {
            FullPath fullPath = ParsePath(target);
            TreeResponse answer = new TreeResponse();
            if (fullPath.Directory.FullName == fullPath.Root.Directory.FullName)
            {
                answer.Tree.Add(DTOBase.Create(fullPath.Directory, fullPath.Root));
            }
            else
            {
                DirectoryInfo parent = fullPath.Directory;
                foreach (var item in parent.Parent.GetDirectories())
                {
                    answer.Tree.Add(DTOBase.Create(item, fullPath.Root));
                }
                while (parent.FullName != fullPath.Root.Directory.FullName)
                {
                    parent = parent.Parent;
                    answer.Tree.Add(DTOBase.Create(parent, fullPath.Root));
                }
            }
            return Json(answer);
        }
        JsonResult IDriver.Tree(string target)
        {
            FullPath fullPath = ParsePath(target);
            TreeResponse answer = new TreeResponse();
            foreach (var item in fullPath.Directory.GetDirectories())
            {
                if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    answer.Tree.Add(DTOBase.Create(item, fullPath.Root));
            }
            return Json(answer);
        }
        JsonResult IDriver.List(string target)
        {
            FullPath fullPath = ParsePath(target);
            ListResponse answer = new ListResponse();
            foreach (var item in fullPath.Directory.GetFileSystemInfos())
            {
                answer.List.Add(item.Name);
            }
            return Json(answer);
        }
        JsonResult IDriver.MakeDir(string target, string name)
        {
            FullPath fullPath = ParsePath(target);
            DirectoryInfo newDir = Directory.CreateDirectory(Path.Combine(fullPath.Directory.FullName, name));
            return Json(new AddResponse(newDir, fullPath.Root));
        }
        JsonResult IDriver.MakeFile(string target, string name)
        {
            FullPath fullPath = ParsePath(target);
            FileInfo newFile = new FileInfo(Path.Combine(fullPath.Directory.FullName, name));
            newFile.Create().Close();
            return Json(new AddResponse(newFile, fullPath.Root));
        }
        JsonResult IDriver.Rename(string target, string name)
        {
            FullPath fullPath = ParsePath(target);
            var answer = new ReplaceResponse();
            answer.Removed.Add(target);
            RemoveThumbs(fullPath);
            if (fullPath.Directory != null)
            {
                string newPath = Path.Combine(fullPath.Directory.Parent.FullName, name);
                System.IO.Directory.Move(fullPath.Directory.FullName, newPath);
                answer.Added.Add(DTOBase.Create(new DirectoryInfo(newPath), fullPath.Root));
            }
            else
            {
                string newPath = Path.Combine(fullPath.File.DirectoryName, name);
                File.Move(fullPath.File.FullName, newPath);
                answer.Added.Add(DTOBase.Create(new FileInfo(newPath), fullPath.Root));
            }
            return Json(answer);
        }

        JsonResult IDriver.Remove(IEnumerable<string> targets)
        {
            RemoveResponse answer = new RemoveResponse();
            foreach (string item in targets)
            {
                FullPath fullPath = ParsePath(item);
                RemoveThumbs(fullPath);
                if (fullPath.Directory != null)
                {
                    System.IO.Directory.Delete(fullPath.Directory.FullName, true);
                }
                else
                {
                    File.Delete(fullPath.File.FullName);
                }
                answer.Removed.Add(item);
            }
            return Json(answer);
        }
        JsonResult IDriver.Get(string target)
        {
            FullPath fullPath = ParsePath(target);
            GetResponse answer = new GetResponse();
            using (StreamReader reader = new StreamReader(fullPath.File.OpenRead()))
            {
                answer.Content = reader.ReadToEnd();
            }
            return Json(answer);
        }
        JsonResult IDriver.Put(string target, string content)
        {
            FullPath fullPath = ParsePath(target);
            ChangedResponse answer = new ChangedResponse();
            using (StreamWriter writer = new StreamWriter(fullPath.File.FullName, false))
            {
                writer.Write(content);
            }
            answer.Changed.Add((FileDTO)DTOBase.Create(fullPath.File, fullPath.Root));
            return Json(answer);
        }
        JsonResult IDriver.Paste(string source, string dest, IEnumerable<string> targets, bool isCut, IList<int> dublicateIndexes = null)
        {
            FullPath destPath = ParsePath(dest);
            ReplaceResponse response = new ReplaceResponse();
            foreach (var item in targets)
            {
                FullPath src = ParsePath(item);
                if (src.Directory != null)
                {
                    DirectoryInfo newDir = new DirectoryInfo(Path.Combine(destPath.Directory.FullName, src.Directory.Name));
                    if (newDir.Exists)
                        Directory.Delete(newDir.FullName, true);
                    if (isCut)
                    {
                        RemoveThumbs(src);
                        src.Directory.MoveTo(newDir.FullName);
                        response.Removed.Add(item);
                    }
                    else
                    {
                        DirectoryCopy(src.Directory, newDir.FullName, true);
                    }
                    response.Added.Add(DTOBase.Create(newDir, destPath.Root));
                }
                else
                {
                    string newFilePath = Path.Combine(destPath.Directory.FullName, src.File.Name);
                    if (File.Exists(newFilePath))
                        File.Delete(newFilePath);
                    if (isCut)
                    {
                        RemoveThumbs(src);
                        src.File.MoveTo(newFilePath);
                        response.Removed.Add(item);
                    }
                    else
                    {
                        File.Copy(src.File.FullName, newFilePath);
                    }
                    response.Added.Add(DTOBase.Create(new FileInfo(newFilePath), destPath.Root));
                }
            }
            return Json(response);
        }
        JsonResult IDriver.Upload(string target, System.Web.HttpFileCollectionBase targets, bool addWithNewIndex)
        {
            FullPath dest = ParsePath(target);
            var response = new AddResponse();
            if (dest.Root.MaxUploadSize.HasValue)
            {
                for (int i = 0; i < targets.AllKeys.Length; i++)
                {
                    HttpPostedFileBase file = targets[i];
                    if (file.ContentLength > dest.Root.MaxUploadSize.Value)
                    {
                        return Error.MaxUploadFileSize();
                    }
                }
            }
            for (int i = 0; i < targets.AllKeys.Length; i++)
            {
                HttpPostedFileBase file = targets[i];
                FileInfo path = new FileInfo(Path.Combine(dest.Directory.FullName, Path.GetFileName(file.FileName)));

                if (path.Exists)
                {
                    if (dest.Root.UploadOverwrite)
                    {
                        //if file already exist we rename the current file, 
                        //and if upload is succesfully delete temp file, in otherwise we restore old file
                        string tmpPath = path.FullName + Guid.NewGuid();
                        bool uploaded = false;
                        try
                        {
                            file.SaveAs(tmpPath);
                            uploaded = true;
                        }
                        catch { }
                        finally
                        {
                            if (uploaded)
                            {
                                File.Delete(path.FullName);
                                File.Move(tmpPath, path.FullName);
                            }
                            else
                            {
                                File.Delete(tmpPath);
                            }
                        }
                    }
                    else
                    {
                        file.SaveAs(Path.Combine(path.DirectoryName, Helper.GetDuplicatedName(path)));
                    }
                }
                else
                {
                    file.SaveAs(path.FullName);
                }
                response.Added.Add((FileDTO)DTOBase.Create(new FileInfo(path.FullName), dest.Root));
            }
            return Json(response);
        }
        JsonResult IDriver.Duplicate(IEnumerable<string> targets)
        {
            AddResponse response = new AddResponse();
            foreach (var target in targets)
            {
                FullPath fullPath = ParsePath(target);
                if (fullPath.Directory != null)
                {
                    var parentPath = fullPath.Directory.Parent.FullName;
                    var name = fullPath.Directory.Name;
                    var newName = string.Format(@"{0}\{1} copy", parentPath, name);
                    if (!Directory.Exists(newName))
                    {
                        DirectoryCopy(fullPath.Directory, newName, true);
                    }
                    else
                    {
                        for (int i = 1; i < 100; i++)
                        {
                            newName = string.Format(@"{0}\{1} copy {2}", parentPath, name, i);
                            if (!Directory.Exists(newName))
                            {
                                DirectoryCopy(fullPath.Directory, newName, true);
                                break;
                            }
                        }
                    }
                    response.Added.Add(DTOBase.Create(new DirectoryInfo(newName), fullPath.Root));
                }
                else
                {
                    var parentPath = fullPath.File.Directory.FullName;
                    var name = fullPath.File.Name.Substring(0, fullPath.File.Name.Length - fullPath.File.Extension.Length);
                    var ext = fullPath.File.Extension;

                    var newName = string.Format(@"{0}\{1} copy{2}", parentPath, name, ext);

                    if (!File.Exists(newName))
                    {
                        fullPath.File.CopyTo(newName);
                    }
                    else
                    {
                        for (int i = 1; i < 100; i++)
                        {
                            newName = string.Format(@"{0}\{1} copy {2}{3}", parentPath, name, i, ext);
                            if (!File.Exists(newName))
                            {
                                fullPath.File.CopyTo(newName);
                                break;
                            }
                        }
                    }
                    response.Added.Add(DTOBase.Create(new FileInfo(newName), fullPath.Root));
                }
            }
            return Json(response);
        }
        JsonResult IDriver.Thumbs(IEnumerable<string> targets)
        {
            ThumbsResponse response = new ThumbsResponse();
            foreach (string target in targets)
            {
                FullPath path = ParsePath(target);
                response.Images.Add(target, path.Root.GenerateThumbHash(path.File));
            }
            return Json(response);
        }
        JsonResult IDriver.Dim(string target)
        {
            FullPath path = ParsePath(target);
            DimResponse response = new DimResponse(path.Root.GetImageDimension(path.File));
            return Json(response);
        }
        JsonResult IDriver.Resize(string target, int width, int height)
        {
            FullPath path = ParsePath(target);
            RemoveThumbs(path);
            path.Root.PicturesEditor.Resize(path.File.FullName, width, height);
            var output = new ChangedResponse();
            output.Changed.Add((FileDTO)DTOBase.Create(path.File, path.Root));
            return Json(output);
        }
        JsonResult IDriver.Crop(string target, int x, int y, int width, int height)
        {
            FullPath path = ParsePath(target);
            RemoveThumbs(path);
            path.Root.PicturesEditor.Crop(path.File.FullName, x, y, width, height);
            var output = new ChangedResponse();
            output.Changed.Add((FileDTO)DTOBase.Create(path.File, path.Root));
            return Json(output);
        }
        JsonResult IDriver.Rotate(string target, int degree)
        {
            FullPath path = ParsePath(target);
            RemoveThumbs(path);
            path.Root.PicturesEditor.Rotate(path.File.FullName, degree);
            var output = new ChangedResponse();
            output.Changed.Add((FileDTO)DTOBase.Create(path.File, path.Root));
            return Json(output);
        }

        JsonResult IDriver.TestOperation(string target)
        {
            return Json(new Object());
        }

        #endregion IDriver

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
            throw new NotImplementedException();
        }

        FullPath IDriver.ParsePath(string target)
        {
            throw new NotImplementedException();
        }

        JsonResult IDriver.CryptInfo(string target)
        {
            throw new NotImplementedException();
        }

        ActionResult IDriver.CertDownload(string thumb)
        {
            throw new NotImplementedException();
        }

        JsonResult IDriver.Filter(string target, string query)
        {
            throw new NotImplementedException();
        }

        JsonResult IDriver.GetAddressBook()
        {
            throw new NotImplementedException();
        }

        JsonResult IDriver.Send(IEnumerable<string> targets, string emailList)
        {
            throw new NotImplementedException();
        }

        JsonResult IDriver.GetUri(IEnumerable<string> targets, OperationType type)
        {
            throw new NotImplementedException();
        }


        JsonResult IDriver.Init(string retTarget, string isModal, bool initReceivedFolder)
        {
            Root lroot = !initReceivedFolder ?
                this._roots.FirstOrDefault(x => x.Directory.Name == Upload) :
                this._roots.FirstOrDefault(x => x.Directory.Name == Recived);
            if (lroot == null) throw new ArgumentNullException(string.Format("Не найдена ожидаемая папка({0} или {1})", Upload, Recived));


            //string mytarget = lroot.Directory.RelPath;
            //if (!string.IsNullOrEmpty(retTarget))
            //{
            //    lroot = GetRoot(retTarget);
            //    mytarget = GetCorectTarget(retTarget);
            //    mytarget = DecodeTarget(mytarget);
            //}
            //List<DirInfo> filesFormWebFav = client.GetDirectories(mytarget, true);
            //if (filesFormWebFav == null)
            //    return null;

            //List<DirInfo> directories = filesFormWebFav.FindAll(d => d.IsDirectory);

            //DirInfo targetDirInfo = directories[0];
            ////var parent = getParent(targetDirInfo);
            //targetDirInfo.HasSubDirectories = filesFormWebFav != null && directories != null && directories.Count > 1;

            //Options options = new Options
            //{
            //    Path = mytarget,
            //    ThumbnailsUrl = "Thumbnails/"
            //};

            //var curDir = lroot.DTO;

            //if (!string.IsNullOrEmpty(retTarget))
            //{
            //    DirInfo parentDirInfo = this.GetParent(targetDirInfo);
            //    curDir = DTOBase.Create(targetDirInfo, parentDirInfo, lroot);
            //}
            ////curDir = lroot.DTO;

            //InitResponse answer = new InitResponse(curDir, options);
            //if (filesFormWebFav != null)
            //{
            //    filesFormWebFav.Remove(targetDirInfo);
            //    foreach (DirInfo dirInfo in filesFormWebFav)
            //    {
            //        dirInfo.HasSubDirectories = IsConstainsChild(dirInfo);
            //        answer.Files.Add(DTOBase.Create(dirInfo, targetDirInfo, lroot));
            //    }
            //}


            //foreach (WebDavRoot item in this.roots)
            //{
            //    answer.Files.Add(item.DTO);
            //}



            //List<DTOBase> filteredFiles = new List<DTOBase>();
            //foreach (DTOBase dtoBase in answer.Files)
            //{
            //    string fileName = (dtoBase.Name);
            //    string ext = Path.GetExtension(fileName);
            //    if (isModal != "1")
            //    {
            //        //поиск по неподписан и не зашифрован
            //        if (ext != ".sig" && ext != ".enc")
            //        {
            //            filteredFiles.Add(dtoBase);
            //        }
            //        //filteredFiles.Add(dtoBase);
            //    }
            //    else
            //    {
            //        filteredFiles.Add(dtoBase);
            //    }

            //}
            //answer.Files.Clear();
            //answer.Files.AddRange(filteredFiles);
            //var answer1 = new InitResponse(answer.Files[0], options);
            //answer1.Files.AddRange(answer.Files);


            //return Json(answer);
            return null;
        }


        JsonResult IDriver.GetReceivedMailFiles(Guid fileGroupSendId)
        {
            throw new NotImplementedException();
        }


        ActionResult IDriver.Download(IEnumerable<string> targets)
        {
            throw new NotImplementedException();
        }
    }
}