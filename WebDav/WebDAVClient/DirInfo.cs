using System;

namespace WebDav
{
    using System.Web;

    /// <summary>
    /// Информация о файле (или папке, если ContentLenght=0)
    /// </summary>
    public class DirInfo
    {
        public DirInfo() { }
        public string Server;
        /// <summary>
        /// имя файла или папки
        /// </summary>
        public string DisplayName;
        /// <summary>
        /// имя файла или папки
        /// </summary>
        public string RelPath;
        /// <summary>
        /// Размер в байтах (0 - папка)
        /// </summary>
        public int ContentLenght;
        /// <summary>
        /// Дата создания
        /// </summary>
        public string CreationDate;
        /// <summary>
        /// Дата последней модификации
        /// </summary>
        public string LastModified;
        /// <summary>
        /// Полный путь к файлу
        /// </summary>
        public string FullPath;

        public bool HasSubDirectories;

        public bool IsDirectory;

        /// <summary>
        /// Получает каталог в котором находится текущий каталог или файл
        /// </summary>
        /// <returns></returns>
        public string getDir()
        {
            var fp = FullPath;
            if (fp[fp.Length - 1] == '/') fp = fp.Substring(0, fp.Length - 1);
            var pos = fp.LastIndexOf('/');
            return fp.Substring(0, pos + 1).Replace(Server,"");
        }

        public static string getData(string xml, string tag)
        {
            var p1 = xml.IndexOf("<d:" + tag + ">", StringComparison.CurrentCultureIgnoreCase);
            var p2 = xml.IndexOf("</d:" + tag + ">", StringComparison.CurrentCultureIgnoreCase);
            //Костыль. tag displayname содержит &amp; вместо &
            return xml.Substring(p1 + tag.Length + 4, p2 - 4 - (p1 + tag.Length)).Replace("&amp;", "&");
        }

        public static DirInfo Parse(string xml, string server)
        {
            var rez = new DirInfo
            {
                CreationDate = getData(xml, "creationdate"),
                DisplayName = getData(xml, "displayname"),
                ContentLenght = Convert.ToInt32(getData(xml, "getcontentlength")),
                LastModified = getData(xml, "getlastmodified"),
                FullPath = HttpUtility.UrlDecode(getData(xml, "href")),
                IsDirectory = getData(xml, "isCollection") == "1",
            };
            rez.Server = server;
            rez.RelPath = rez.FullPath.Replace(server, "");

            var dt = DateTime.Parse(rez.LastModified);//.Subtract(new TimeSpan(4, 0, 0));
            rez.LastModified = dt.ToLongDateString().Replace(" г.", "") +" "+ dt.ToLongTimeString();
            dt = DateTime.Parse(rez.CreationDate);//.Subtract(new TimeSpan(4, 0, 0));
            rez.CreationDate = dt.ToLongDateString().Replace(" г.", "") + " " + dt.ToLongTimeString();
            return rez;
        }
    }
}