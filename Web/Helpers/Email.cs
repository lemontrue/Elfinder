using System;
using System.Net;
using System.Net.Mail;
using System.Web.Configuration;

namespace CryptxOnline.Web.Helpers
{
    public static class Email
    {
        public static bool Send_Mail(string csSubject, string csBody)
        {
            var from = new MailAddress("marat-d@taxnet.ru", "aaa bbb");
            var to = new MailAddress("marat-d@taxnet.ru", "ccc ddd");
            var mMail = new MailMessage(from, to);
            mMail.Bcc.Add(from);
            mMail.Subject = "Test Subject";
            mMail.Body = csBody;
            mMail.IsBodyHtml = true;
            mMail.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
            mMail.ReplyToList.Add(from);

            var client = new SmtpClient("xxx-exg99.xxxx.xx.com");
            client.Credentials = CredentialCache.DefaultNetworkCredentials;

            try
            {
                client.Send(mMail);
            }
            catch (Exception)
            {
                mMail.Dispose();
                return false;
            }
            mMail.Dispose();
            return true;
        }

        public static bool Send(string subject, string content, string to)
        {
            return Send(subject, content, to, WebConfigurationManager.AppSettings["EmailSender"]);
        }

        public static bool Send(string subject, string content, string to, string from)
        {
            MailMessage msg = null;
            bool result = false;

            try
            {
                // Setup the SMTP client
                var client = new SmtpClient();

                string port = WebConfigurationManager.AppSettings["EmailPort"];
                if (!string.IsNullOrEmpty(port))
                    client.Port = int.Parse(port);
                client.Host = WebConfigurationManager.AppSettings["EmailHost"];
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(WebConfigurationManager.AppSettings["EmailUser"],
                    WebConfigurationManager.AppSettings["EmailPassword"]);

                // Create and send the email
                msg = new MailMessage();
                msg.From = new MailAddress(from);
                msg.To.Add(to);
                msg.Subject = subject;
                msg.Body = content;
                client.Send(msg);

                result = true;
            }
            finally
            {
                if (msg != null)
                    msg.Dispose();
            }
            return result;
        }
    }
}