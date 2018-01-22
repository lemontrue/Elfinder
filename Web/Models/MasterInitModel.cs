using System;
using CryptxOnline.Web.AuthorizeService;
using Newtonsoft.Json;
using ElFinder.CryptxService;


namespace CryptxOnline.Web.Models
{
    public class MasterInitModel
    {
        public MasterInitModel(Guid token, CryptxServiceClient cryptx, AuthorizeServiceClient authorize, string files,
            OperationType? type)
        {
            UserInfoResponse curUser = authorize.GetUserData(token);

            ProfileResponse blankProfileResponse = cryptx.GetBlankProfile();
            UserProfilesResponse response = cryptx.GetUserProfiles(Guid.Empty, token);
            OperationType = (type == null) ? 0 : (OperationType) type;
            FilesJSON = string.IsNullOrEmpty(files) ? "[]" : files;
            BlankProfileJSON = JsonConvert.SerializeObject(blankProfileResponse.Settings, Formatting.Indented);

            if (response.UserProfileList.Count == 0)
            {
                response.UserProfileList.Add(new UserProfileListElement
                {
                    Name = "Стандартные"
                });
            }

            SettingsJSON = JsonConvert.SerializeObject(response.UserProfileList, Formatting.Indented);
            UserInfo = curUser.User;
        }

        public string SettingsJSON { get; set; }
        public string FilesJSON { get; set; }
        public string BlankProfileJSON { get; set; }
        public OperationType OperationType { get; set; }
        public UserInfo UserInfo { get; set; }
    }
}