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
    public class SpecieAnalytics
    {
        public SpecieAnalytics() { }

        #region

        public int Id { get; set; }
        public string branchId { get; set; }
        public string branchName{get;set;}
        public string routeFrom{get;set;}
        public string routeTo { get; set; }
        public decimal Milage { get; set; }
        public int Frequency { get; set; }
        public decimal RevenueAccrued { get; set; }
        public string BranchApprover { get; set; }
        public string HOAuthorizer { get; set; }

        public string nameOfFile { get; set; }
        public static List<SpecieAnalytics> specieResults = new List<SpecieAnalytics>();

        #endregion

        #region Methods

        public List<SpecieAnalytics> getSpecieSummary() {
            try
            {
                List<SpecieAnalytics> rs = null;
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_specieSummary_get]",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@proc", this.nameOfFile);

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                rs = new List<SpecieAnalytics>();
                                specieResults.Clear();

                                while (d.Read()) {
                                    var sp = new SpecieAnalytics { };

                                    sp.Id = int.Parse(d["branch_id"].ToString());
                                    sp.branchId = d["branchId"].ToString();
                                    sp.branchName = d["branch_name"].ToString();
                                    sp.routeFrom = d["routeFrom"].ToString();
                                    sp.routeTo = d["routeTo"].ToString();
                                    sp.Milage = Convert.ToDecimal(d["Milage"].ToString());
                                    sp.Frequency = int.Parse(d["Frequency"].ToString());
                                    sp.RevenueAccrued = Convert.ToDecimal(d["RevenueAccrued"].ToString());
                                    sp.BranchApprover = d["Branch_Approver"].ToString();
                                    sp.HOAuthorizer = d["HO_Authorizer"].ToString();

                                    rs.Add(sp);
                                }
                            }
                            else { return (rs); }

                            specieResults = rs;
                            return (rs.ToList<SpecieAnalytics>());
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
                return new List<SpecieAnalytics>();
            }
        }

        #endregion

    }
}