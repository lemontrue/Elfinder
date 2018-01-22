using System;
using System.Collections.Generic;
using System.Web.UI.WebControls;
using CryptxOnline.Web.AuthorizeService;
using CryptxOnline.Web.MarkerActivationService;
using ElFinder.CryptxService;

namespace CryptxOnline.Web.Models
{
    public enum Filter
    {
        Active = 0,
        NotActive = 1,
        All = 2
    }

    public enum Sort
    {
        /// <summary>
        ///     Названию (по алфавиту)
        /// </summary>
        FriendlyNameASC = 0,

        /// <summary>
        ///     Названию (обратно алфавиту)
        /// </summary>
        FriendlyNameDESC,

        /// <summary>
        ///     Дате начала (сначала новые)
        /// </summary>
        IssureDateASC,

        /// <summary>
        ///     Дате начала (сначала старые)
        /// </summary>
        IssureDateDESC,

        /// <summary>
        ///     По владельцу (А-Я)
        /// </summary>
        OwnerASC,

        /// <summary>
        ///     По владельцу (Я-А)
        /// </summary>
        OwnerDESC
    }

    public class ProfileModel : Account
    {
        public MyCertificateListModel certList;
        public MyRequestListModel certRequestList;
        public bool ShowWelcomeModal;

        public ProfileModel()
        { }

        public ProfileModel(Account account)
        {
            Email = account.Email;
            Id = account.Id;
            Name = account.Name;
            ReceiveMessageFromSupport = account.ReceiveMessageFromSupport;
            SubscribeToNews = account.SubscribeToNews;
            AllowTransmissionFromCryptogrammUser = account.AllowTransmissionFromCryptogrammUser;
            IsAdmin = IsAdmin;
            Password = account.Password;
            AcceptType = account.AcceptType;
            RecoveryType = account.RecoveryType;
            RecoveryCheckPhone = account.RecoveryCheckPhone;
            KobilAuthPassRequired = account.KobilAuthPassRequired;
            Phone = ModifyPhone(account.Phone);
            EmailConfirmed = account.EmailConfirmed;
            HasMyCert = account.HasMyCert;
            if (!account.EmailConfirmed || !account.HasMyCert)
                ShowWelcomeModal = true;
            else
                ShowWelcomeModal = false;
        }

        public Guid UserId { get; set; }

        public List<ListItem> GetAuthList()
        {
            var listItems = new List<ListItem>();
            foreach (AcceptType type in Enum.GetValues(typeof (AcceptType)))
            {
                if (type.Equals(AcceptType.None))
                    listItems.Add(new ListItem {Text = "Отсутствует", Value = type.ToString()});
                if (type.Equals(AcceptType.Sms))
                    listItems.Add(new ListItem {Text = "По смс", Value = type.ToString()});
                if (type.Equals(AcceptType.Kobil))
                    listItems.Add(new ListItem {Text = "Taxnet Identification", Value = type.ToString()});
            }
            return listItems;
        }

        public List<ListItem> GetRecoveryTypeList(bool isEmailConfirmed)
        {
            
            var listItems = new List<ListItem>();
            foreach (RecoveryType type in Enum.GetValues(typeof (RecoveryType)))
            {
                if (type.Equals(RecoveryType.Ban))
                    listItems.Add(new ListItem {Text = "Запрещено", Value = type.ToString()});
                if (type.Equals(RecoveryType.Sms))
                    listItems.Add(new ListItem {Text = "По смс", Value = type.ToString()});
                //if (type.Equals(RecoveryType.Kobil))
                //    listItems.Add(new ListItem() { Text = "Taxnet Identification", Value = type.ToString() });
                if (type.Equals(RecoveryType.Email)&&isEmailConfirmed)
                    listItems.Add(new ListItem {Text = "По E-mail", Value = type.ToString()});
            }
            return listItems;
        }


        private string ModifyPhone(string phone)
        {
            string result = "";
            if (string.IsNullOrEmpty(phone))
                return phone;
            if (phone.Length < 4)
                result = phone;
            else
            {
                int count = 0;
                int length = phone.Length - 2;
                foreach (char c in phone)
                {
                    if (count > 1 && count < length)
                    {
                        result += '*';
                    }
                    else
                    {
                        result += c;
                    }
                    count++;
                }
            }
            return result;
        }
    }

    public class MyCertificateListModel
    {
        public IList<MarkerActivationService.CertificateInfo> certs;
        public CertificateFilter Filter { get; set; }
        public bool SaveState { get; set; }
        public Sort Sort { get; set; }
        public bool WhithPin { get; set; }
        public string JsonFormat;

        public List<ListItem> GetSortList()
        {
            var listItems = new List<ListItem>();
            foreach (Sort type in Enum.GetValues(typeof (Sort)))
            {
                if (type.Equals(Sort.FriendlyNameASC))
                    listItems.Add(new ListItem {Text = "По названию (А-Я)", Value = type.ToString()});
                if (type.Equals(Sort.FriendlyNameDESC))
                    listItems.Add(new ListItem {Text = "По названию (Я-А)", Value = type.ToString()});
                if (type.Equals(Sort.IssureDateASC))
                    listItems.Add(new ListItem {Text = "По сроку (новые сначала)", Value = type.ToString()});
                if (type.Equals(Sort.IssureDateDESC))
                    listItems.Add(new ListItem {Text = "По сроку (старые сначала)", Value = type.ToString()});
                if (type.Equals(Sort.OwnerASC))
                    listItems.Add(new ListItem {Text = "По владельцу (А-Я)", Value = type.ToString()});
                if (type.Equals(Sort.OwnerDESC))
                    listItems.Add(new ListItem {Text = "По владельцу (Я-А)", Value = type.ToString()});
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
                    listItems.Add(new ListItem {Text = "Показать только действующие", Value = type.ToString()});
            }
            return listItems;
        }
    }

    public class MyRequestListModel
    {
        public IList<GetMyCertificatesRequestsResponse.MyCertificateRequest> requests;
        public string JsonFormat; 
        public GetMyCertificatesRequestsResponse.Sort Sort;
    }
}