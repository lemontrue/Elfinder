using System;
using System.Runtime.Serialization;
using System.IO;
using WebDav;

namespace ElFinder.DTO
{
    using ElFinder.WebDav;

    [DataContract]
    public abstract class DTOBase
    {
        protected static readonly DateTime _unixOrigin = new DateTime(1970, 1, 1, 0, 0, 0);
        
        /// <summary>
        ///  Name of file/dir. Required
        /// </summary>
        [DataMember(Name = "name")]
        public string Name { get;  set; }
        
        /// <summary>
        ///  Hash of current file/dir path, first symbol must be letter, symbols before _underline_ - volume id, Required.
        /// </summary>
        [DataMember(Name = "hash")]
        public string Hash { get;  set; } 
       
        /// <summary>
        ///  mime type. Required.
        /// </summary>
        [DataMember(Name = "mime")]
        public string Mime { get;  set; } 
 
        /// <summary>
        /// file modification time in unix timestamp. Required.
        /// </summary>
        [DataMember(Name = "ts")]
        public long UnixTimeStamp { get;  set; } 

        /// <summary>
        ///  file size in bytes
        /// </summary>
        [DataMember(Name = "size")]
        public long Size { get;  set; } 

        /// <summary>
        ///  is readable
        /// </summary>
        [DataMember(Name = "read")]
        public byte Read { get;  set; }

        /// <summary>
        /// is writable
        /// </summary>
        [DataMember(Name = "write")]
        public byte Write { get;  set; }

        /// <summary>
        ///  is file locked. If locked that object cannot be deleted and renamed
        /// </summary>
        [DataMember(Name = "locked")]
        public byte Locked { get;  set; }

        public static DTOBase Create(FileInfo info, Root root)
        {
            if (info == null)
                throw new ArgumentNullException("info");
            if (root == null)
                throw new ArgumentNullException("root");
            string parentPath = info.Directory.FullName.Substring(root.Directory.FullName.Length);
            string relativePath = info.FullName.Substring(root.Directory.FullName.Length);
            FileDTO response;
            if (root.CanCreateThumbnail(info))
            {
                ImageDTO imageResponse = new ImageDTO();
                imageResponse.Thumbnail = root.GetExistingThumbHash(info) ?? (object)1;
                var dim = root.GetImageDimension(info);
                imageResponse.Dimension = string.Format("{0}x{1}", dim.Width, dim.Height);
                response = imageResponse;
            }
            else
            {
                response = new FileDTO();
            }
            response.Read = 1;
            response.Write = root.IsReadOnly ? (byte)0 : (byte)1;
            response.Locked = root.IsLocked ? (byte)1 : (byte)0;
            response.Name = info.Name;
            response.VisualizationType = FileDTO.GetVisualization(info.Extension);
            response.Size = info.Length;
            response.UnixTimeStamp = (long)(info.LastWriteTimeUtc - _unixOrigin).TotalSeconds;
            response.Mime = Helper.GetMimeType(info);
            response.Hash = root.VolumeId + Helper.EncodePath(relativePath);
            response.ParentHash = root.VolumeId + Helper.EncodePath(parentPath.Length > 0 ? parentPath : info.Directory.Name);
            return response;
        }

        public static DTOBase Create(DirInfo directory, WebDavRoot root)
        {
            if (directory == null)
                throw new ArgumentNullException("directory");
            if (root == null)
                throw new ArgumentNullException("root");
            
            RootDTO response = new RootDTO()
            {
                Mime = "directory",
                Dirs = directory.HasSubDirectories ? (byte)1 : (byte)0,
                Hash = root.VolumeId + Helper.EncodePath(directory.RelPath),
                Read = 1,
                Write = 1,
                Locked =0,
                Name = root.Alias,
                Size = 0,
                VolumeId = root.VolumeId
            };

            DateTime lastModified;
            if (DateTime.TryParse(directory.LastModified, out lastModified))
                response.UnixTimeStamp = (long)(lastModified - _unixOrigin).TotalSeconds;

            return response;
        }

        public static DTOBase Create(DirectoryInfo directory, Root root)
        {
            if (directory == null)
                throw new ArgumentNullException("directory");
            if (root == null)
                throw new ArgumentNullException("root");
            if (root.Directory.FullName == directory.FullName)
            {
                bool hasSubdirs = false;
                DirectoryInfo[] subdirs = directory.GetDirectories();
                foreach (var item in subdirs)
                {
                    if ((item.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
                    {
                        hasSubdirs = true;
                        break;
                    }
                }
                RootDTO response = new RootDTO()
                {
                    Mime = "directory",
                    Dirs = hasSubdirs ? (byte)1 : (byte)0,
                    Hash = root.VolumeId + Helper.EncodePath(directory.Name),
                    Read = 1,
                    Write = root.IsReadOnly ? (byte)0 : (byte)1,
                    Locked = root.IsLocked ? (byte)1 : (byte)0,                    
                    Name = root.Alias,                    
                    Size = 0,
                    UnixTimeStamp = (long)(directory.LastWriteTimeUtc - _unixOrigin).TotalSeconds,
                    VolumeId = root.VolumeId                    
                };
                return response;
            }
            else
            {
                string parentPath = directory.Parent.FullName.Substring(root.Directory.FullName.Length);
                DirectoryDTO response = new DirectoryDTO()
                {
                    Mime = "directory",
                    ContainsChildDirs = directory.GetDirectories().Length > 0 ? (byte)1 : (byte)0,
                    Hash = root.VolumeId + Helper.EncodePath(directory.FullName.Substring(root.Directory.FullName.Length)),
                    Read = 1,
                    Write = root.IsReadOnly ? (byte)0 : (byte)1,
                    Locked = root.IsLocked ? (byte)1 : (byte)0,                    
                    Size = 0,
                    Name = directory.Name,
                    UnixTimeStamp = (long)(directory.LastWriteTimeUtc - _unixOrigin).TotalSeconds,                    
                    ParentHash = root.VolumeId + Helper.EncodePath(parentPath.Length > 0 ? parentPath : directory.Parent.Name)
                };
                return response;
            }
        }
        public static DTOBase Create(DirInfo directory, DirInfo parent, WebDavRoot root)
        {
            if (directory == null)
                throw new ArgumentNullException("directory");

            if (parent == null && directory.IsDirectory)
            {
                //throw new Exception("Что то пошло не так!");
            }
            
            if (directory.IsDirectory)
            {
                var response = new DirectoryDTO()
                {
                    Mime = "directory",
                    ContainsChildDirs = directory.HasSubDirectories ? (byte)1 : (byte)0,
                    Hash = root.VolumeId + Helper.EncodePath(directory.RelPath),
                    Read = 1,
                    Write = 1,
                    Locked = 0,
                    Size = 0,
                    Name = directory.DisplayName
                };

                if (parent != null)
                    response.ParentHash = root.VolumeId + Helper.EncodePath(parent.RelPath);

                DateTime lastModified;
                if (DateTime.TryParse(directory.LastModified, out lastModified))
                    response.UnixTimeStamp = (long)(lastModified - _unixOrigin).TotalSeconds;

                return response;
            }
            else
            {
                var ext = Path.GetExtension(directory.DisplayName);
                if (ext == ".enc")
                {
                    var name = directory.DisplayName.Substring(0, directory.DisplayName.LastIndexOf(".", System.StringComparison.Ordinal));
                    var ext2 = Path.GetExtension(name);
                    if (ext2 == ".sig") ext=".sig.enc";
                }
                FileDTO response = new FileDTO();
                response.Read = 1;
                response.Write = (byte)1;
                response.Locked = (byte)0;
                response.Name = directory.DisplayName;
                response.VisualizationType = FileDTO.GetVisualization(ext);
                response.Size = directory.ContentLenght;
                response.Hash = root.VolumeId + Helper.EncodePath(directory.RelPath);
                response.ParentHash = root.VolumeId + Helper.EncodePath(parent.RelPath);
                response.Mime = string.IsNullOrEmpty(ext) ? "unknown" : Helper.GetMimeType(ext.ToLower().Substring(1));
                DateTime lastModified;
                if (DateTime.TryParse(directory.LastModified, out lastModified))
                    response.UnixTimeStamp = (long)(lastModified - _unixOrigin).TotalSeconds;

                return response;
            }
        }

        public static DTOBase Create(DirInfo file)
        {
            if (file == null)
                throw new ArgumentNullException("file");

            if (file.IsDirectory) throw new Exception("Работа с папками не допускается");

            var ext = Path.GetExtension(file.DisplayName);
            if (ext == ".enc")
            {
                var name = file.DisplayName.Substring(0, file.DisplayName.LastIndexOf(".", System.StringComparison.Ordinal));
                var ext2 = Path.GetExtension(name);
                if (ext2 == ".sig") ext = ".sig.enc";
            }
            var response = new FileDTO();
            response.Read = 1;
            response.Write = (byte)1;
            response.Locked = (byte)0;
            response.Name = file.DisplayName;
            response.VisualizationType = FileDTO.GetVisualization(ext);
            response.Size = file.ContentLenght;
            response.Hash = Helper.EncodePath(file.RelPath);
            response.ParentHash = Helper.EncodePath(file.RelPath);
            response.Mime = string.IsNullOrEmpty(ext) ? "unknown" : Helper.GetMimeType(ext.ToLower().Substring(1));
            DateTime lastModified;
            if (DateTime.TryParse(file.LastModified, out lastModified))
                response.UnixTimeStamp = (long)(lastModified - _unixOrigin).TotalSeconds;

            return response;
        }
    }
}