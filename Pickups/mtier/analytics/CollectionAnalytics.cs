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
    public class CollectionAnalytics
    {
        public CollectionAnalytics() { }

        #region Properties

        public int Id { get; set; }
        public string branchId { get; set; }
        public string branchName { get; set; }
        public string customerName { get; set; }
        public string customerLocation { get; set; }
        public decimal frequency { get; set; }
        public decimal rate { get; set; }
        public decimal amount { get; set; }
        public decimal total { get; set; }
        public string BranchApprover { get; set; }
        public string HOAuthorizer { get; set; }

        public string processName { get; set; }

        public static List<CollectionAnalytics> tColl = new List<CollectionAnalytics>();

        #endregion

        #region Methods

        public List<CollectionAnalytics> getCollectionSummary() {
            List<CollectionAnalytics> rs = null;
            try
            {
                using (var con = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = con,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_Collection_get]",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@process", processName);

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                rs = new List<CollectionAnalytics>();
                                tColl.Clear();

                                int k = 1;
                                while (d.Read()) 
                                {
                                    var cs = new CollectionAnalytics { };

                                    cs.Id = k;
                                    cs.branchId = d["branchId"].ToString();
                                    cs.branchName = d["branch_name"].ToString().ToUpper();
                                    cs.customerName = d["customerName"].ToString().ToUpper();
                                    cs.customerLocation = d["customerLocatn"].ToString().ToUpper();
                                    cs.frequency = Convert.ToDecimal(d["frequency"].ToString());
                                    cs.rate = Convert.ToDecimal(d["rate"].ToString());
                                    cs.amount = Convert.ToDecimal(d["amount"].ToString());
                                    cs.total = Convert.ToDecimal(d["total"].ToString());
                                    cs.BranchApprover = d["Branch_Approver"].ToString();
                                    cs.HOAuthorizer = d["HO_Authorizer"].ToString();

                                    rs.Add(cs);
                                    k++;
                                }
                            }
                            else { return (rs); }

                            tColl = rs;
                            return (rs.ToList<CollectionAnalytics>());
                        }
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        return (rs);
                    }
                }
            }
            catch 
            {
                return new List<CollectionAnalytics>();
            }
        }

        #endregion

    }
}