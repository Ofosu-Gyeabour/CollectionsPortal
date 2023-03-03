using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Configuration;
using System.Net.Security;
using System.IO;

using System.Globalization;
using System.Security.Cryptography.X509Certificates;

namespace Pickups.mtier.notifications
{
    public class Sender
    {
        #region Properties

        public string receipient { get; set; }
        public string subject { get; set; }
        public string msgBody { get; set; }
        public string msgCopy { get; set; }

        public string smtp { get; set; }
        public int smtpPort { get; set; }
        public string smtpUserCredential { get; set; }
        public string smtpPassword { get; set; }

        #endregion

        #region Methods

        public bool sendMail() { 
            //method is used to send mail notifications
            try
            {
                SmtpClient client = new SmtpClient(this.smtp, this.smtpPort);
                client.EnableSsl = true;

                client.Timeout = 20000;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(this.smtpUserCredential, this.smtpPassword);

                var msg = new MailMessage { };
                msg.To.Add(this.receipient);
                msg.CC.Add(this.msgCopy);
                msg.From = new MailAddress(this.smtpUserCredential);
                msg.Subject = this.subject;
                msg.Body = this.msgBody;

                //msg.IsBodyHtml = true;
                ServicePointManager.ServerCertificateValidationCallback = delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
                { return true; };

                //client.Send(msg);
                return true;
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return false;
            }
        }

        #endregion

    }
}