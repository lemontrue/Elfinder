using System;
namespace ElFinder.InternalException
{
    public class ElFinderDownloadException : Exception
    {
        public ElFinderDownloadException(string message)
            : base(message){}
    }
}
