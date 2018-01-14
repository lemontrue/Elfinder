using System;
using System.Collections.Generic;
using System.Web.UI.WebControls;
using CryptxOnline.Web.CryptxService;

namespace CryptxOnline.Web.Models
{
    public class ContactCertificatesModel
    {
        public ContactCertificatesModel()
        {
            Certificates = new List<ContactCertificate>();
        }

        public Guid ID { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }

        public string SearchString { get; set; }
        public CertificateFilter Filter { get; set; }
        public CertificateSort Sort { get; set; }
        public List<ContactCertificate> Certificates { get; set; }



        public List<ListItem> GetSortList()
        {
            var listItems = new List<ListItem>();
            foreach (CertificateSort type in Enum.GetValues(typeof (CertificateSort)))
            {
                if (type.Equals(CertificateSort.FriendlyNameASC))
                    listItems.Add(new ListItem {Text = "Названию (по алфавиту)", Value = type.ToString()});
                if (type.Equals(CertificateSort.FriendlyNameDESC))
                    listItems.Add(new ListItem {Text = "Названию (обратно алфавиту)", Value = type.ToString()});
                if (type.Equals(CertificateSort.IssureDateASC))
                    listItems.Add(new ListItem {Text = "Дате начала (сначала новые)", Value = type.ToString()});
                if (type.Equals(CertificateSort.IssureDateDESC))
                    listItems.Add(new ListItem {Text = "Дате начала (сначала старые)", Value = type.ToString()});
                if (type.Equals(CertificateSort.ExpireDateASC))
                    listItems.Add(new ListItem {Text = "Дате окончания (сначала ранние)", Value = type.ToString()});
                if (type.Equals(CertificateSort.ExpireDateDESC))
                    listItems.Add(new ListItem {Text = "Дате окончания (сначала поздние)", Value = type.ToString()});
            }
            return listItems;
        }

        public List<ListItem> GetFilterList()
        {
            var listItems = new List<ListItem>();
            foreach (CertificateFilter type in Enum.GetValues(typeof (CertificateFilter)))
            {
                if (type.Equals(CertificateFilter.All))
                    listItems.Add(new ListItem {Text = "Показать все", Value = type.ToString()});
                if (type.Equals(CertificateFilter.Active))
                    listItems.Add(new ListItem {Text = "Показать действующие", Value = type.ToString()});
            }
            return listItems;
        }
    }

    public class ContactCertificate
    {
        public string NameLabel = "Название сертификата";
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public string FriendlyName { get; set; }
        public string Thumbprint { get; set; }
        public string SubjectName { get; set; }

        public string TimeMessage { get; set; }
        public string TimeMessageStyle { get; set; }

        public string Organization { get; set; }
        public string INN { get; set; }
        public bool IsTest { get; set; }
    }
}