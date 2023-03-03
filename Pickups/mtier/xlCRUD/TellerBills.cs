using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Data.OleDb;
using System.Data.Common;
using System.Data;

using System.Data.Sql;
using System.Data.SqlClient;

using Pickups.bridge;

namespace Pickups.mtier.xlCRUD
{
    public class TellerBills
    {

        public int No { get; set; }
        public string companyCode { get; set; }
        public string Location { get; set; }
        public int TellerNumber { get; set; }
        public string TellerNames { get; set; }
        public decimal Rate { get; set; }
        public decimal Amt { get; set; }

        public string filePath { get; set; }

        public List<TellerBills> getTellerBillsFromExcel()
        {
            List<TellerBills> tb = null;
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
                            CommandText = @"select * from [TELLER_BILLS$];",
                            CommandTimeout = 15
                        };

                        var k = 1;
                        using (var d = cd.ExecuteReader())
                        {
                            if (d.HasRows) { tb = new List<TellerBills>(); }
                            while (d.Read())
                            {
                                var r = new TellerBills();

                                r.No = int.Parse(d["No"].ToString());
                                r.companyCode = d["Branch"].ToString().Trim();
                                r.Location = d["Location"].ToString().Trim();
                                r.TellerNumber = int.Parse(d["TellerNumber"].ToString());
                                r.TellerNames = d["TellerNames"].ToString().Trim();
                                r.Rate = Convert.ToDecimal(d["Rate"].ToString().Trim());
                                r.Amt = Convert.ToDecimal(d["Amount"].ToString().Trim());

                                tb.Add(r);
                            }

                            return (tb.ToList<TellerBills>());
                        }
                    }
                    catch (Exception innEx)
                    {
                        Debug.Print(innEx.Message);
                        return tb;
                    }
                }
            }
            catch (Exception xer) {
                Debug.Print(xer.Message);
                return (tb);
            }
        }

        
    }
}