using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.Serialization;
using System.Xml;
using System.Xml.Serialization;
using ElFinder.DTO;
using System.Collections.Generic;

namespace ElFinder.Response
{
    [DataContract]
    [XmlInclude(typeof(FileDTO))]
    [Serializable]
    public class InitResponse : OpenResponseBase
    {
        private static string[] _empty = new string[0];
        [DataMember(Name="api")]
        public string Api { get { return "2.0"; } }

        [DataMember(Name = "uplMaxSize")]
        public string UploadMaxSize { get; set; }

        [DataMember(Name = "netDrivers")]
        public IEnumerable<string> NetDrivers { get { return _empty; } }


        public InitResponse(DTOBase currentWorkingDirectory, Options options)
            : base(currentWorkingDirectory)
        {
            Options = options;
        }
        public InitResponse()
        { }
    }
}