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
    public class CourierAnalytics
    {
        #region Properties

        public int Id { get; set; }
        public string branchId { get; set; }
        public string branchName { get; set; }
        public decimal charge { get; set; }
        public decimal discount { get; set; }
        public decimal subTotal { get; set; }
        public decimal VAT { get; set; }
        public decimal NHIL { get; set; }
        public decimal Insurance { get; set; }
        public decimal netAmount { get; set; }
        public decimal amountDue { get; set; }

        public string branchApprover { get; set; }
        public string hoAuthorizer { get; set; }
        public string remarks { get; set; }

        public string reportType { get; set; }  //the property that determines the data source and report to fetch
        public DateTime dateFrom { get; set; }
        public DateTime dateTo { get; set; }
        public string reportStatus { get; set; }

        public static List<CourierAnalytics> tData = new List<CourierAnalytics>();
        public static List<CourierAnalytics> tDHLDTA = new List<CourierAnalytics>();

        #endregion

        #region Methods

        public List<CourierAnalytics> getDHLSummaryReport() {
            try
            {
                List<CourierAnalytics> result = null;
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand 
                        { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"proc_DHLSummary_get",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@df", this.dateFrom);
                        cd.Parameters.AddWithValue("@dt", this.dateTo);

                        switch (reportStatus)
                        {
                            case "Pending":
                                cd.Parameters.AddWithValue("@statusId", 1);
                                break;
                            case "Branch Approved":
                                cd.Parameters.AddWithValue("@statusId", 2);
                                break;
                            case "H/O Authorized":
                                cd.Parameters.AddWithValue("@statusId", 3);
                                break;
                        }

                        //if (reportStatus == "Pending") { cd.Parameters.AddWithValue("@statusId", 2); } else { cd.Parameters.AddWithValue("@statusId", 3); }

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                int k = 1;
                                result = new List<CourierAnalytics>();
                                tDHLDTA.Clear();

                                while (d.Read()) {
                                    var dd = new CourierAnalytics { };

                                    dd.Id = k;
                                    dd.branchId = d["branchId"].ToString();
                                    dd.branchName = d["branch_name"].ToString();
                                    dd.charge = Convert.ToDecimal(d["charge"].ToString());
                                    dd.discount = Convert.ToDecimal(d["discount"].ToString());
                                    dd.subTotal = Convert.ToDecimal(d["Sub-Total"].ToString());
                                    dd.VAT = Convert.ToDecimal(d["VAT"].ToString());
                                    dd.NHIL = Convert.ToDecimal(d["NHIL"].ToString());
                                    dd.Insurance = Convert.ToDecimal(d["Insurance"].ToString());
                                    dd.netAmount = Convert.ToDecimal(d["NetAmount"].ToString());
                                    dd.amountDue = Convert.ToDecimal(d["AmountDue"].ToString());

                                    dd.branchApprover = d["Branch_Approver"].ToString();
                                    dd.hoAuthorizer = d["HO_Authorizer"].ToString();
                                    dd.remarks = d["comments"].ToString();

                                    result.Add(dd);
                                    k++;
                                }
                            }
                            else { return (result); }

                            tDHLDTA = result;
                            return (result.ToList<CourierAnalytics>());
                        }
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        return result;
                    }
                }
            }
            catch 
            {
                return new List<CourierAnalytics>();
            }
        }

        public List<CourierAnalytics> getFedexSummaryReport()
        {
            try
            {
                List<CourierAnalytics> result = null;
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand
                        {
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"proc_FEDEXSummary_get",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@df", this.dateFrom);
                        cd.Parameters.AddWithValue("@dt", this.dateTo);
                     
                        if (reportStatus == "Pending") { cd.Parameters.AddWithValue("@statusId", 1); } else if (reportStatus == "Branch Approved") { cd.Parameters.AddWithValue("@statusId", 2); } else if(reportStatus == "H/O Authorized") { cd.Parameters.AddWithValue("@statusId", 3); }
                        
                        using (var d = cd.ExecuteReader())
                        {
                            if (d.HasRows)
                            {
                                int k = 1;
                                result = new List<CourierAnalytics>();
                                tData.Clear();

                                while (d.Read())
                                {
                                    var dd = new CourierAnalytics { };

                                    dd.Id = k;
                                    dd.branchId = d["branchId"].ToString();
                                    dd.branchName = d["branch_name"].ToString();
                                    dd.charge = Convert.ToDecimal(d["charge"].ToString());
                                    dd.discount = Convert.ToDecimal(d["discount"].ToString());
                                    dd.subTotal = Convert.ToDecimal(d["Sub-Total"].ToString());
                                    dd.VAT = Convert.ToDecimal(d["VAT"].ToString());
                                    dd.NHIL = Convert.ToDecimal(d["NHIL"].ToString());
                                    dd.Insurance = Convert.ToDecimal(d["Insurance"].ToString());
                                    dd.netAmount = Convert.ToDecimal(d["NetAmount"].ToString());
                                    dd.amountDue = Convert.ToDecimal(d["AmountDue"].ToString());

                                    result.Add(dd);
                                    k++;
                                }
                            }
                            else { return (result); }

                            tData = result;
                            return (result.ToList<CourierAnalytics>());
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.Print(e.Message);
                        return result;
                    }
                }
            }
            catch
            {
                return new List<CourierAnalytics>();
            }
        }

        #endregion

    }
}