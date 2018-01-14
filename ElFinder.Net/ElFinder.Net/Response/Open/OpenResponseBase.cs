using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Xml;
using System.Xml.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response
{
    [DataContract]
    [XmlInclude(typeof(FileDTO))]
    [XmlInclude(typeof(RootDTO))]
    [XmlInclude(typeof(DirectoryDTO))]
    [Serializable]
    public class OpenResponseBase
    {
        [DataMember(Name="files")]
        public List<DTOBase> Files { get { return _files; } }

        [DataMember(Name = "cwd")]
        public DTOBase CurrentWorkingDirectory { get { return _currentWorkingDirectory; } }

        [DataMember(Name = "options")]
        public Options Options { get; set; }

        [DataMember(Name = "debug")]
        public Debug Debug { get { return _debug; } }

        public OpenResponseBase(DTOBase currentWorkingDirectory)
        {
            _files = new List<DTOBase>();
            _currentWorkingDirectory = currentWorkingDirectory;
        }
        public OpenResponseBase()
        {
        }

        private static Debug _debug = new Debug();
        protected List<DTOBase> _files;
        private DTOBase _currentWorkingDirectory;
    }
}