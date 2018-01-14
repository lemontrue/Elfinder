using System.Runtime.Serialization;

namespace ElFinder.Response
{
    [DataContract]
    public class Debug
    {
        [DataMember(Name = "connector")]
        public string Connector { get { return ".net"; } }
    }
}
