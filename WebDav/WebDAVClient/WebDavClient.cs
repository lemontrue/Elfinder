using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

namespace WebDav
{
    /// <summary>
    /// Класс для доступа к серверу WebDAV
    /// </summary>
    public class WebDavClient
    {
        public const String TokenHeader = "X-Cryptogramm-Token";

        private readonly string server;
        private readonly string password;
        private readonly string login;
        private string lastError;
        private readonly Guid token;
        public bool UseSsl { get; set; }
        public X509Certificate2 ClientCertificate { get; set; }

        public bool ThrowErrors { get; set; }

        public string LastError
        {
            get { return lastError; }
        }

        /// <summary>
        /// Создает экземпляр класса и получает токен авторизуясь на сервере
        /// </summary>
        /// <param name="server">Адрес сервера</param>
        /// <param name="login">логин example@yandex.ru</param>
        /// <param name="password">пароль</param>
        [Obsolete]
        public WebDavClient(string server, string login, string password)
        {
            if (string.IsNullOrEmpty(server))
                throw new ArgumentNullException("server");

            if (string.IsNullOrEmpty(login))
                throw new ArgumentNullException("login");

            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException("password");

            this.server = server;
            this.login = login;
            this.password = password;
        }

        /// <summary>
        /// Создает экземпляр класса и получает токен авторизуясь на сервере
        /// </summary>
        /// <param name="server">Адрес сервера</param>
        /// <param name="token">Токен</param>
        public WebDavClient(string server, Guid token)
        {
            if (string.IsNullOrEmpty(server))
                throw new ArgumentNullException("server");

            if (token==Guid.Empty)
                throw new ArgumentNullException("token");


            this.server = server;
            this.token = token;
        }

        /// <summary>
        /// Создание HttpWebRequest'а
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private HttpWebRequest createRequest(
            string url)
        {
            var uri = new Uri(server + url);
            var request = (HttpWebRequest)WebRequest.Create(uri);
            if (!string.IsNullOrEmpty(login))
                request.Credentials = new NetworkCredential(login, password);

            if (!(token==Guid.Empty))
                request.Headers.Add(TokenHeader, token.ToString());

            if (UseSsl && ClientCertificate != null)
            {
                ServicePointManager.ServerCertificateValidationCallback += ServerCertificateValidationCallback;
                request.ClientCertificates.Add(ClientCertificate);
            }
                
            request.Credentials=new NetworkCredential("marat-d","Taxnet2016","office");
            request.PreAuthenticate = true;
            request.Accept = "*/*";
            request.ContentType = "text/html";
            //request.ProtocolVersion = HttpVersion.Version10;

            /*
             * The following line fixes an authentication problem explained here:
             * http://www.devnewsgroups.net/dotnetframework/t9525-http-protocol-violation-long.aspx
             */

            ServicePointManager.Expect100Continue = false;

            // If you want to disable SSL certificate validation
            /*
            System.Net.ServicePointManager.ServerCertificateValidationCallback +=
            delegate(object sender, X509Certificate cert, X509Chain chain, SslPolicyErrors sslError)
            {
                    bool validationResult = true;
                    return validationResult;
            };
            */

            return request;
        }

        private bool ServerCertificateValidationCallback(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslpolicyerrors)
        {
            return true;
        }

        /// <summary>
        /// Считывает файл из стрима
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        private static byte[] readStream(Stream input)
        {
            var buffer = new byte[16 * 1024];
            using (var ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

        #region Синхронные методы

        /// <summary>
        /// Запрос возвращает информацию о папке dir и всех папках и файлах в нем
        /// </summary>
        /// <param name="dir">Папка</param>
        /// <returns>Список файлов и папок в папке dir или null если произошла ошибка</returns>
        public DirInfo GetInfo(string dir)
        {
            var request = createRequest(dir);
            request.Headers.Add("Depth", "1");
            request.Method = "PROPFIND";

            try
            {
                var resp = (HttpWebResponse)request.GetResponse();
                using (var responseStream = resp.GetResponseStream())
                {
                    var sr = new StreamReader(responseStream);
                    var cont = sr.ReadToEnd();
                    var dinfo = new List<DirInfo>();
                    
                    while (true)
                    {
                        var posBeg = cont.IndexOf("<d:response>", StringComparison.InvariantCultureIgnoreCase);
                        var posEnd = cont.IndexOf("</d:response>", StringComparison.InvariantCultureIgnoreCase);
                        if (posBeg < 0) break;

                        try
                        {
                            dinfo.Add(DirInfo.Parse(cont.Substring(posBeg, posEnd - posBeg), server));
                        }
                        catch { }

                        cont = cont.Substring(posEnd + 1);
                    }

                    return dinfo != null && dinfo.Count > 0 ? dinfo[0] : null;
                }
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// Запрос возвращает информацию о папке dir и всех папках и файлах в нем
        /// </summary>
        /// <param name="dir">Папка</param>
        /// <param name="getRoot"></param>
        /// <returns>Список файлов и папок в папке dir или null если произошла ошибка</returns>
        public List<DirInfo> GetDirectories(string dir, bool getRoot = false)
        {
            var request = createRequest(dir);
            request.Headers.Add("Depth", "1");
            request.Method = "PROPFIND";
            try
            {
                //WebProxy proxy = new WebProxy();
                //proxy.Address = new Uri("http://127.0.0.1:8888");
                //request.Proxy = proxy;
                var resp = (HttpWebResponse) request.GetResponse();
                using (var responseStream = resp.GetResponseStream())
                {
                    var sr = new StreamReader(responseStream);
                    var cont = sr.ReadToEnd();
                    var dinfo = new List<DirInfo>();
                    while (true)
                    {
                        var posBeg = cont.IndexOf("<d:response>", StringComparison.InvariantCultureIgnoreCase);
                        var posEnd = cont.IndexOf("</d:response>", StringComparison.InvariantCultureIgnoreCase);
                        if (posBeg < 0) break;

                        try
                        {
                            dinfo.Add(DirInfo.Parse(cont.Substring(posBeg, posEnd - posBeg), server));
                        }
                        catch{}
                        
                        cont = cont.Substring(posEnd + 1);
                    }

                    if (!getRoot && dinfo.Count > 0)
                        dinfo.RemoveAt(0);

                    return dinfo;
                }
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// Запрос создает папку dir на сервере
        /// </summary>
        /// <param name="dir">Название папки</param>
        /// <returns>true если запрос выполнен успешно</returns>
        public bool CreateDirectory(string dir)
        {
            var request = createRequest(dir);
            request.Method = WebRequestMethods.Http.MkCol;

            try
            {
                request.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }
            return true;
        }

        /// <summary>
        /// Запрос удаляет папку (или файл) dir
        /// </summary>
        /// <param name="dir">Папка (или файл) которую надо удалить</param>
        /// <returns>true если запрос выполнен успешно</returns>
        public bool Delete(string dir)
        {
            var request = createRequest(dir);
            request.Headers.Add("translate", "f");
            request.Method = "DELETE";
            

            try
            {
                request.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }
            return true;
        }

        /// <summary>
        /// Запрос отправляет файл на сервер
        /// </summary>
        /// <param name="dir">Название файла на сервере (путь к файлу)</param>
        /// <param name="content">Контент загружаемого файла</param>
        /// <returns>true если запрос выполнен успешно</returns>
        public bool Upload(string dir, byte[] content)
        {
            if (dir == null)
                throw new ArgumentNullException("dir");

            if (content == null)
                throw new ArgumentNullException("content");

            var request = createRequest(dir);
            request.Method = WebRequestMethods.Http.Put;
            request.ContentType = "application/binary";
            try
            {
                using (var myReqStream = request.GetRequestStream())
                {
                    using (var memoryStream = new MemoryStream(content))
                    {
                        using (var myReader = new BinaryReader(memoryStream))
                        {
                            var buffer = myReader.ReadBytes(2048);
                            while (buffer.Length > 0)
                            {
                                myReqStream.Write(buffer, 0, buffer.Length);
                                buffer = myReader.ReadBytes(2048);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }

            try 
            {
                request.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }

            return true;
        }

        /// <summary>
        /// Запрос отправляет файл на сервер
        /// </summary>
        /// <param name="dir">Название файла на сервере (путь к файлу)</param>
        /// <param name="stream">Поток для загрузки на сервер</param>
        /// <returns>true если запрос выполнен успешно</returns>
        public bool Upload(string dir, Stream stream)
        {
            if (dir == null)
                throw new ArgumentNullException("dir");

            if (stream == null)
                throw new ArgumentNullException("stream");

            var request = createRequest(dir);
            request.Method = WebRequestMethods.Http.Put;
            request.ContentType = "application/binary";
            try
            {
                using (var myReqStream = request.GetRequestStream())
                {
                    using (var myReader = new BinaryReader(stream))
                    {
                        var buffer = myReader.ReadBytes(2048);
                        while (buffer.Length > 0)
                        {
                            myReqStream.Write(buffer, 0, buffer.Length);
                            buffer = myReader.ReadBytes(2048);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }

            try
            {
                request.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }

            return true;
        }

        /// <summary>
        /// Запрос скачивает файл с сервера
        /// </summary>
        /// <param name="dir">Путь к файлу на сервере</param>
        /// <returns>Если null, значит ошибка</returns>
        public byte[] Download(string dir)
        {
            
            var request = createRequest(dir);
            request.Method = WebRequestMethods.Http.Get;
            try
            {
                var resp = (HttpWebResponse) request.GetResponse();
                var responseSteam = resp.GetResponseStream();
                return readStream(responseSteam);
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// Запрос скачивает файл с сервера
        /// </summary>
        /// <param name="dir">Путь к файлу на сервере</param>
        /// <returns>Если null, значит ошибка</returns>
        public Stream DownloadStream(string dir)
        {

            var request = createRequest(dir);
            request.Method = WebRequestMethods.Http.Get;
            try
            {
                var resp = (HttpWebResponse)request.GetResponse();
                return resp.GetResponseStream();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// Перемещение
        /// </summary>
        /// <param name="curdir">текущий каталог или файл</param>
        /// <param name="destdir">Новый каталог или файл</param>
        /// <returns></returns>
        public bool Move(string curdir, string destdir)
        {
            var myweb = createRequest(curdir);
            var test = new Uri(server + destdir);
            myweb.Headers.Add("Destination", test.AbsoluteUri);
            myweb.Method = "MOVE";

            try
            {
                myweb.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }
            return true;
        }

        /// <summary>
        /// Копирование
        /// </summary>
        /// <param name="sourceDir">текущий каталог или файл</param>
        /// <param name="destDir">Новый каталог или файл</param>
        /// <returns></returns>
        public bool Copy(string sourceDir, string destDir)
        {
            var myweb = createRequest(sourceDir);
            var test = new Uri(server + destDir);
            myweb.Headers.Add("Destination", test.AbsoluteUri);
            myweb.Method = "COPY";

            try
            {
                myweb.GetResponse();
            }
            catch (Exception ex)
            {
                if (ThrowErrors)
                    throw;

                lastError = ex.Message;
                return false;
            }
            return true;
        }

        /// <summary>
        /// Переименовывает каталог или файл
        /// </summary>
        /// <param name="dir">Путь к каталогу или файлу</param>
        /// <param name="newName">Новое имя каталога или файла</param>
        /// <returns></returns>
        public bool Rename(string dir, string newName)
        {
            return Move(dir, newName);
        }

        #endregion

        #region Асинхронные методы

        ///// <summary>
        ///// Запрос возвращает информацию о папке dir и всех папках и файлах в нем
        ///// </summary>
        ///// <param name="dir">Папка</param>
        ///// <returns>Список файлов и папок в папке dir или null если произошла ошибка</returns>
        //public async Task<List<DirInfo>> GetDirectoriesAsync(string dir)
        //{
        //    var request = createRequest(dir, server, login, password);
        //    request.Headers.Add("Depth", "1");
        //    request.Method = "PROPFIND";

        //    try
        //    {
        //        var resp = await request.GetResponseAsync();
        //        using (var responseStream = resp.GetResponseStream())
        //        {
        //            var sr = new StreamReader(responseStream);
        //            var cont = sr.ReadToEnd();
        //            var dinfo = new List<DirInfo>();
        //            while (true)
        //            {
        //                var posBeg = cont.IndexOf("<d:response>", StringComparison.InvariantCultureIgnoreCase);
        //                var posEnd = cont.IndexOf("</d:response>", StringComparison.InvariantCultureIgnoreCase);
        //                if (posBeg < 0) break;
        //                dinfo.Add(DirInfo.Parse(cont.Substring(posBeg, posEnd - posBeg),server));
        //                cont = cont.Substring(posEnd + 1);
        //            }

        //            return dinfo;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return null;
        //    }
        //}

        ///// <summary>
        ///// Запрос создает папку dir на сервере
        ///// </summary>
        ///// <param name="dir">Название папки</param>
        ///// <returns>true если запрос выполнен успешно</returns>
        //public async Task<bool> CreateDirectoryAsync(string dir)
        //{
        //    var request = createRequest(dir, server, login, password);
        //    request.Method = WebRequestMethods.Http.MkCol;

        //    try
        //    {
        //        await request.GetResponseAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }
        //    return true;
        //}

        ///// <summary>
        ///// Запрос удаляет папку (или файл) dir
        ///// </summary>
        ///// <param name="dir">Папка (или файл) которую надо удалить</param>
        ///// <returns>true если запрос выполнен успешно</returns>
        //public async Task<bool> DeleteAsync(string dir)
        //{
        //    var request = createRequest(dir, server, login, password);
        //    request.Method = "DELETE";

        //    try
        //    {
        //        await request.GetResponseAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }
        //    return true;
        //}

        ///// <summary>
        ///// Запрос отправляет файл на сервер
        ///// </summary>
        ///// <param name="dir">Название файла на сервере (путь к файлу)</param>
        ///// <param name="content">Контент загружаемого файла</param>
        ///// <returns>true если запрос выполнен успешно</returns>
        //public async Task<bool> UploadAsync(string dir, byte[] content)
        //{
        //    if (dir == null)
        //        throw new ArgumentNullException("dir");

        //    if (content == null)
        //        throw new ArgumentNullException("content");

        //    var request = createRequest(dir, server, login, password);
        //    request.Method = WebRequestMethods.Http.Put;
        //    request.ContentType = "application/binary";
        //    try
        //    {
        //        using (var myReqStream = request.GetRequestStream())
        //        {
        //            using (var memoryStream = new MemoryStream(content))
        //            {
        //                using (var myReader = new BinaryReader(memoryStream))
        //                {
        //                    var buffer = myReader.ReadBytes(2048);
        //                    while (buffer.Length > 0)
        //                    {
        //                        myReqStream.Write(buffer, 0, buffer.Length);
        //                        buffer = myReader.ReadBytes(2048);
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }

        //    try
        //    {
        //        await request.GetResponseAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }

        //    return true;
        //}

        ///// <summary>
        ///// Запрос скачивает файл с сервера
        ///// </summary>
        ///// <param name="dir">Путь к файлу на сервере</param>
        ///// <returns>Если null, значит ошибка</returns>
        //public async Task<byte[]> DownloadAsync(string dir)
        //{
        //    var request = createRequest(dir, server, login, password);
        //    request.Method = WebRequestMethods.Http.Get;
        //    try
        //    {
        //        var resp = await request.GetResponseAsync();
        //        using (var responseSteam = resp.GetResponseStream())
        //            return readStream(responseSteam);
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return null;
        //    }
        //}

        ///// <summary>
        ///// Перемещение
        ///// </summary>
        ///// <param name="curdir">текущий каталог или файл</param>
        ///// <param name="destdir">Новый каталог или файл</param>
        ///// <returns></returns>
        //public async Task<bool> MoveAsync(string curdir, string destdir)
        //{
        //    var myweb = createRequest(curdir, server, login, password);
        //    var uri = new Uri(server + destdir);
        //    myweb.Headers.Add("Destination", uri.AbsolutePath);
        //    myweb.Method = "MOVE";

        //    try
        //    {
        //        await myweb.GetResponseAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }
        //    return true;
        //}

        ///// <summary>
        ///// Копирование
        ///// </summary>
        ///// <param name="sourceDir">текущий каталог или файл</param>
        ///// <param name="destDir">Новый каталог или файл</param>
        ///// <returns></returns>
        //public async Task<bool> CopyAsync(string sourceDir, string destDir)
        //{
        //    var myweb = createRequest(sourceDir, server, login, password);
        //    var uri = new Uri(server + destDir);
        //    myweb.Headers.Add("Destination", uri.AbsolutePath);
        //    myweb.Method = "COPY";

        //    try
        //    {
        //        await myweb.GetResponseAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ThrowErrors)
        //            throw;

        //        lastError = ex.Message;
        //        return false;
        //    }
        //    return true;
        //}

        ///// <summary>
        ///// Переименовывает каталог или файл
        ///// </summary>
        ///// <param name="dir">Путь к каталогу или файлу</param>
        ///// <param name="newName">Новое имя каталога или файла</param>
        ///// <returns></returns>
        //public Task<bool> RenameAsync(string dir, string newName)
        //{
        //    return MoveAsync(dir, newName);
        //}

        #endregion
    }
}