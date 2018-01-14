using System;
using WebDav;
using ElFinder.DTO;

namespace ElFinder.WebDav
{
    public class WebDavRoot
    {
        #region public

            public WebDavRoot(DirInfo directory)
            {
                if (directory == null)
                    throw new ArgumentNullException("directory", "Root directory can not be null");
                _alias = directory.DisplayName;
                _directory = directory;
                
            }

            public string VolumeId
            {
                get { return _volumeId; }
                internal set { _volumeId = value; }
            }

            public string Alias
            {
                get { return _alias; }
                set { if (!string.IsNullOrEmpty(value))_alias = value; }
            }

            public DTOBase DTO
            {
                get { return _dto; }
                set { _dto = value; }
            }

            public DirInfo Directory
            {
                get { return _directory; }
                set
                {
                    if (value == null)
                        throw new ArgumentNullException("Root directory can not be null", "value");
                    _directory = value;
                }
            }
        #endregion

        #region private
            private string _volumeId;
            private string _alias;
            private DirInfo _directory;
            private DTOBase _dto;
        #endregion
    }
}