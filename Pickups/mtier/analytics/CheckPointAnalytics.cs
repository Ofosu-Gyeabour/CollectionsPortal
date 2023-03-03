using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Collections;
using System.Diagnostics;
using Pickups.bridge;

namespace Pickups.mtier.analytics
{
    public class CheckPointAnalytics
    {
        public CheckPointAnalytics() { }

        #region Properties

        public int Id { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public int currencyId { get; set; }
        public string currencySymbol { get; set; }
        public string BookCode { get; set; }
        public string BookType { get; set; }
        public int BookCount { get; set; }

        public DateTime dateFrom { get; set; }
        public DateTime dateTo { get; set; }
        public string recordStatus { get; set; }
        public string uploadFileName { get; set; }

        public string BranchApprover { get; set; }
        public string RetailAuthorizer { get; set; }

        public static List<CheckPointAnalytics> chkData = new List<CheckPointAnalytics>();

        #endregion

        #region APIs

        public List<CheckPointAnalytics> getCheckPointSummaryReport() {
            List<CheckPointAnalytics> results = null;

            try
            {
                using (var con = Connectors.getConnection()) {
                    var cd = new SqlCommand { 
                        Connection = con,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_chk_get]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@file", this.uploadFileName);
                    cd.Parameters.AddWithValue("@status", this.recordStatus);
                    cd.Parameters.AddWithValue("@isLoaded", 1);
                    cd.Parameters.AddWithValue("@dF", this.dateFrom);
                    cd.Parameters.AddWithValue("@dT", this.dateTo);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            results = new List<CheckPointAnalytics>();
                            chkData.Clear();
                            int i = 1;

                            while (d.Read())
                            {
                                var c = new CheckPointAnalytics { };

                                c.Id = i;
                                c.CompanyCode = d["Company_Code"].ToString();
                                c.CompanyName = d["Company"].ToString();
                                c.currencyId = int.Parse(d["Currency_Id"].ToString());
                                c.currencySymbol = d["Symbol"].ToString();
                                c.BookCode = d["BookCode"].ToString();
                                c.BookType = d["BookType"].ToString();
                                c.BookCount = int.Parse(d["BookCount"].ToString());
                                c.uploadFileName = d["FileName"].ToString();
                                c.BranchApprover = d["Branch_Approver"].ToString();
                                c.RetailAuthorizer = d["HO_Authorizer"].ToString();

                                results.Add(c);
                                i++;
                            }
                        }
                        else { return results; }
                    }

                    chkData = results;
                    return (results.ToList<CheckPointAnalytics>());
                }
            }
            catch { throw; }
        }

        #endregion


    }
}