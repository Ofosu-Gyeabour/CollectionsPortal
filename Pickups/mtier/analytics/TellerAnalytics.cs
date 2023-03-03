using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Collections;

using Pickups.bridge;

namespace Pickups.mtier.analytics
{
    public class TellerAnalytics
    {
        public TellerAnalytics() { }

        #region Properties

        public int Id { get; set; }
        public string branchId { get; set; }
        public string branchName { get; set; }
        public string Location { get; set; }
        public decimal rate { get; set; }
        public decimal Amount { get; set; }
        public string Branch_Approver { get; set; }
        public string HO_Authorizer { get; set; }

        public string processName { get; set; }  //name of the file

        public static List<TellerAnalytics> tellerResultant = new List<TellerAnalytics>();

        #endregion

        #region Methods

        public List<TellerAnalytics> getTellerSummaryUsingFile() {
            try
            {
                List<TellerAnalytics> rs = null;
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand 
                        { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_teller_get]",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@process", this.processName);

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                rs = new List<TellerAnalytics>();
                                tellerResultant.Clear();
                                int k = 1;

                                while (d.Read()) 
                                {
                                    var t = new TellerAnalytics { };

                                    t.Id = k;
                                    t.branchId = d["Company_Id"].ToString();
                                    t.branchName = d["Branch"].ToString();
                                    t.Location = d["Location"].ToString();
                                    t.rate = Convert.ToDecimal(d["rate"].ToString());
                                    t.Amount = Convert.ToDecimal(d["Amount"].ToString());
                                    t.Branch_Approver = d["Branch_Approver"].ToString();
                                    t.HO_Authorizer = d["HO_Authorizer"].ToString();

                                    rs.Add(t);
                                    k++;
                                }
                            }
                            else { return (rs); }

                            tellerResultant = rs;
                            return (rs.ToList<TellerAnalytics>());
                        }
                    }
                    catch (Exception e) 
                    {
                        Debug.Print(e.Message);
                        return (rs);
                    }
                }
            }
            catch 
            {
                return new List<TellerAnalytics>();
            }
        }

        #endregion

    }
}