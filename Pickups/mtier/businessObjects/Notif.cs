using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using System.Diagnostics;

using Pickups.bridge;
using Pickups.mtier.xlCRUD;
using Pickups.mtier.businessObjects;
using Pickups.mtier.repos;

namespace Pickups.mtier.businessObjects
{
    public class Notif
    {
        public Company objCompany { get; set; }

        public string getEmails() { 
            //this method fetches the emails of the officials to be notified
            string finString = string.Empty;

            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select emailaddress from dbo.NIBOfficial where company_Id = @c_Id;", c);
                    cd.Parameters.AddWithValue("@c_Id", this.objCompany.Id);

                    using (var d = cd.ExecuteReader()) {
                        try
                        {
                            if (d.HasRows)
                            {
                                while (d.Read())
                                {
                                    var str = d["emailaddress"].ToString().Trim().ToLower();
                                    finString += string.Format("{0},", str);
                                }

                                return (finString.TrimEnd(','));
                            }
                            else { return string.Empty; }
                        }
                        catch (Exception derr) {
                            Debug.Print(derr.Message);
                            return (string.Empty);
                        }
                    }
                }
                catch (Exception ee) {
                    Debug.Print(ee.Message);
                    return (string.Empty);
                }
            }
        }

        public string draftedMessage { get; set; }

        public string receipients { get; set; }
        public string cc { get; set; }



    }
}