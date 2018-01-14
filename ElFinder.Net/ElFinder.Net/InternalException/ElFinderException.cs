using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElFinder.InternalException
{
    public class ElFinderException : Exception
    {
        public ElFinderException(string message)
            : base(message){}
    }
}
