using ElFinder.CryptxService;
using System;
using System.Collections.Generic;
using System.Web.UI.WebControls;

namespace CryptxOnline.Web.Models
{
    public enum AddressBookType
    {
        Contacts = 0,
        Certificates
    }

    public class AddressBookModel
    {
        public AddressBookModel()
        {
            Contacts = new Contacts();
            Certificates = new Certificates();
        }

        public AddressBookModel(UserAddressBookResponse data)
        {
            Contacts = new Contacts();
            Contacts.UserContacts = data.Contacts;
        }

        public AddressBookModel(CertificatesResponse data)
        {
            Certificates = new Certificates();
            Certificates.UserCertificates = new List<ContactCertificateRelationship>();
            foreach (CertificateInfo certificateInfo in data.Certificates)
            {
                var relationship = new ContactCertificateRelationship();
                relationship.CertificateInfo = certificateInfo;
                relationship.CertificateID = certificateInfo.CertificateId;
                relationship.FriendlyName = certificateInfo.RecipientCertificate.FriendlyName;
                
                Certificates.UserCertificates.Add(relationship);
            }
            Certificates.Filter = CertificateFilter.Active;
        }

        public string Status { get; set; }
        public AddressBookType Type { get; set; }
        public Certificates Certificates { get; set; }
        public Contacts Contacts { get; set; }
    }

    public class Certificates
    {
        public string SearchString { get; set; }
        public CertificateFilter Filter { get; set; }
        public CertificateSort Sort { get; set; }
        public List<ContactCertificateRelationship> UserCertificates { get; set; }

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
                //if (type.Equals(CertificateFilter.WithTestCert))
                //    listItems.Add(new ListItem { Text = "Показывать только тестовые сертификаты", Value = type.ToString() });
                //if (type.Equals(CertificateFilter.WithoutTestCert))
                //    listItems.Add(new ListItem { Text = "Показывать все, кроме тестовых сертификатов", Value = type.ToString() });
            }
            return listItems;
        }
    }

    public class Contacts
    {
        public string SearchString { get; set; }
        public AddressBookFilter Filter { get; set; }
        public AddressBookSort Sort { get; set; }
        public List<Contact> UserContacts { get; set; }

        public List<ListItem> GetSortList()
        {
            var listItems = new List<ListItem>();
            foreach (AddressBookSort type in Enum.GetValues(typeof (AddressBookSort)))
            {
                if (type.Equals(AddressBookSort.ContactNameASC))
                    listItems.Add(new ListItem {Text = "Названию контакта (по алфавиту)", Value = type.ToString()});
                if (type.Equals(AddressBookSort.ContactNameDESC))
                    listItems.Add(new ListItem {Text = "Названию контакта (обратно алфавиту)", Value = type.ToString()});
                if (type.Equals(AddressBookSort.EmailASC))
                    listItems.Add(new ListItem {Text = "E-mail (по алфавиту)", Value = type.ToString()});
                if (type.Equals(AddressBookSort.EmailDESC))
                    listItems.Add(new ListItem {Text = "E-mail (обратно алфавиту)", Value = type.ToString()});
            }
            return listItems;
        }

        public List<ListItem> GetFilterList()
        {
            var listItems = new List<ListItem>();
            foreach (AddressBookFilter type in Enum.GetValues(typeof (AddressBookFilter)))
            {
                if (type.Equals(AddressBookFilter.All))
                    listItems.Add(new ListItem {Text = "Показать все", Value = type.ToString()});
                if (type.Equals(AddressBookFilter.WithCert))
                    listItems.Add(new ListItem {Text = "Показать контакты с сертификатами", Value = type.ToString()});
                if (type.Equals(AddressBookFilter.WithoutCert))
                    listItems.Add(new ListItem {Text = "Показать контакты без сертификатов", Value = type.ToString()});
                //if (type.Equals(AddressBookFilter.WithTestCert))
                //    listItems.Add(new ListItem { Text = "Показать контакты с тестовыми сертификатами", Value = type.ToString() });
                //if (type.Equals(AddressBookFilter.WithoutTestCert))
                //    listItems.Add(new ListItem { Text = "Показать контакты без тестовых сертификатов", Value = type.ToString() });
            }
            return listItems;
        }
    }
}