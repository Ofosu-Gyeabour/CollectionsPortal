using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.OleDb;
using System.Diagnostics;
using Pickups.bridge;

namespace Pickups.mtier.xlCRUD
{
    public class DHLSourceUpload
    {
        #region Properties

        public int Id { get; set; }
        public string airwayBillNo { get; set; }
        public string shipper { get; set; }
        public string receipient { get; set; }
        public decimal weightInKg { get; set; }
        public DateTime airwayBillDate { get; set; }
        public string airwayBillDateString { get; set; }

        public decimal charge { get; set; }
        public decimal discount { get; set; }
        public decimal subTotal { get; set; }
        public decimal valueAddedTax { get; set; }
        public decimal NHIL { get; set; }
        public decimal netAmount { get; set; }
        public decimal insurance { get; set; }
        public decimal total { get; set; }
        public string remarks { get; set; }
        public string companyCode { get; set; }

        public string filePath { get; set; }

        #endregion

        #region Methods

        public List<DHLSourceUpload> getDHLRecordsFromExcel()
        {
            List<DHLSourceUpload> rs = null;

            try
            {
                using (var c = Connectors.getXLSXConnection(this.filePath))
                {
                    try
                    {
                        var cd = new OleDbCommand
                        {
                            Connection = c,
                            CommandType = CommandType.Text,
                            CommandText = @"select * from [DHL$]",
                            CommandTimeout = 20
                        };

                        using (var d = cd.ExecuteReader())
                        {
                            if (d.HasRows)
                            {
                                var i = 1;
                                rs = new List<DHLSourceUpload>();
                                while (d.Read())
                                {
                                    var dd = new DHLSourceUpload { };

                                    dd.Id = i;
                                    dd.airwayBillNo = d["AirwayBillNo"].ToString();
                                    dd.shipper = d["Shipper"].ToString();
                                    dd.receipient = d["Receipient"].ToString();
                                    dd.weightInKg = Convert.ToDecimal(d["WeightInKg"].ToString());
                                    dd.airwayBillDate = Convert.ToDateTime(d["AirwayBillDate"].ToString());
                                    dd.airwayBillDateString = dd.airwayBillDate.ToShortDateString();
                                    dd.charge = Convert.ToDecimal(d["Charge"].ToString());
                                    dd.discount = Convert.ToDecimal(d["Discount"].ToString());
                                    dd.subTotal = Convert.ToDecimal(d["Sub-Total"].ToString());
                                    dd.valueAddedTax = Convert.ToDecimal(d["VAT"].ToString());
                                    dd.NHIL = Convert.ToDecimal(d["NHIL"].ToString());
                                    dd.netAmount = Convert.ToDecimal(d["Net-Amount"].ToString());
                                    dd.insurance = Convert.ToDecimal(d["Insurance"].ToString());
                                    dd.total = Convert.ToDecimal(d["Total"].ToString());
                                    dd.remarks = d["Remarks"].ToString();
                                    dd.companyCode = d["Company"].ToString();

                                    rs.Add(dd);
                                    i++;
                                }
                            }
                            else { return (rs); }

                            return (rs.ToList<DHLSourceUpload>());
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.Print(e.Message);
                        return (rs);
                    }
                }
            }
            catch { return (rs); }
        }

        #endregion

    }
}