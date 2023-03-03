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

namespace Pickups.mtier.businessObjects
{
    public class Auditor
    {
        #region Properties

        public int Id { get; set; }
        public Usr objUser { get; set; }
        public string msg { get; set; }
        public string msgDate { get; set; }

        #endregion

        #region Methods

        public bool LogAction() 
        { 
            //method is used to log an action happening on the data store
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"insert into dbo.[Log](usrId,logMsg,dte) VALUES(@usr,@msg,@dte);select @@identity as Id;",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@usr", 1);
                    cd.Parameters.AddWithValue("@msg", this.msg);
                    cd.Parameters.AddWithValue("@dte", this.msgDate);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.Id > 0 ? true : false);
                }
                catch (Exception e) 
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        #endregion

    }
}