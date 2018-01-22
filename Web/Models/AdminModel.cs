using System;
using System.Collections.Generic;
using System.Web.UI.WebControls;
using ElFinder.CryptxService;

namespace CryptxOnline.Web.Models
{
    public class AdminModel
    {
        public string SearchString { get; set; }
        public AdminSort AdminSort { get; set; }
        public List<GroupUserInfo> GroupUserInfos { get; set; }

        public List<ListItem> GetSortList()
        {
            var listItems = new List<ListItem>();
            foreach (AdminSort type in Enum.GetValues(typeof (AdminSort)))
            {
                if (type.Equals(AdminSort.LoginASC))
                    listItems.Add(new ListItem {Text = "По логину (A-Z)", Value = type.ToString()});
                if (type.Equals(AdminSort.LoginDESC))
                    listItems.Add(new ListItem {Text = "По логину (Z-A)", Value = type.ToString()});
                if (type.Equals(AdminSort.NameASC))
                    listItems.Add(new ListItem {Text = "По имени пользователя (А-Я)", Value = type.ToString()});
                if (type.Equals(AdminSort.NameDESC))
                    listItems.Add(new ListItem {Text = "По имени пользователя (Я-А)", Value = type.ToString()});
            }
            return listItems;
        }
    }
}