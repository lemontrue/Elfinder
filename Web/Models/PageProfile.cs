using System;

namespace CryptxOnline.Web.Models
{
    public class PageProfile
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
    }
}