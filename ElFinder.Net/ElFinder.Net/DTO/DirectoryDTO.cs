using System;
using System.Runtime.Serialization;

namespace ElFinder.DTO
{
    [Serializable]
    [DataContract]
    public class DirectoryDTO : DTOBase
    {           
        /// <summary>
        ///  Hash of parent directory. Required except roots dirs.
        /// </summary>
        [DataMember(Name = "phash")]
        public string ParentHash { get; set; }
        
        /// <summary>
        /// Is directory contains subfolders
        /// </summary>
        [DataMember(Name = "dirs")]
        public byte ContainsChildDirs { get; set; }
    }
}