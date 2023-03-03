using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using Pickups.bridge;
using Pickups.mtier.businessObjects;
using System.Configuration;

namespace Pickups.mtier.notifications
{
    public class Notification
    {
        /* method is responsible for sending notifications to branch operatives and head office officials as to the current status of operations */

        #region Private properties

        public Sender objSender { get; set; }

        #endregion

        #region Methods

        public bool pushBranchNotification() { 
            //method is used to push branch notifications
            //head office reps in copy

            return true;
        }

        public bool pushHeadOfficeNotification(string strSubject, string messageContent) { 
            //method is responsible for pushing notifications to head office
            //branch operative in copy

            try
            {
                this.objSender.receipient = ConfigurationManager.AppSettings["retailDepartment"].ToString();
                this.objSender.msgCopy = ConfigurationManager.AppSettings["CC"].ToString();
                this.objSender.subject = strSubject;
                this.objSender.msgBody = messageContent;

                return (this.objSender.sendMail());
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return false;
            }
        }

        public string serializeEmailAddresses(List<BranchOperative> bots) { 
            //serializing the content of the email address property
            var result = string.Empty;

            try
            {
                foreach (var b in bots) {
                    result += string.Format("{0},{1}", result, b.emailAddress);
                }

                return (result.TrimStart(',').TrimEnd(','));
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return (string.Empty);
            }
        }

        #endregion

    }
}