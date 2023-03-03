using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.OleDb;
using System.Data.SqlClient;

using System.Diagnostics;
using Pickups.bridge;


namespace Pickups.mtier.xlCRUD
{
    public class Pickups
    {
        #region Properties

        public int Id { get; set; }
        public string Date { get; set; }
        public string branch { get; set; }
        public string vehicleRegistration { get; set; }
        public string NameOfDriver { get; set; }
        public Routes objRoute { get; set; }
        public string tripStartTime { get; set; }
        public string tripEndTime { get; set; }
        public decimal amountDelivered { get; set; }
        public decimal amountRepatriated { get; set; }
        public string NIBOfficer { get; set; }
        public double totalMilage { get; set; }
        public double KmEquivalent { get; set; }

        public string filePath { get; set; }

        #endregion

        #region Methods

        public List<Pickups> getPickupFromExcel() {
            List<Pickups> picks = null;
            using (var cn = Connectors.getXLSXConnection(this.filePath)) {
                try
                {
                    var cmd = new OleDbCommand { 
                        Connection = cn,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from [SKONES_Report$]",
                        CommandTimeout = 20
                    };

                    using (var d = cmd.ExecuteReader()) {
                        if (d.HasRows) { picks = new List<Pickups>(); }
                        while (d.Read()) {
                            var p = new Pickups { };

                            p.Id = int.Parse(d["Sno"].ToString());
                            p.Date = d["Date"].ToString();
                            p.branch = d["Branch"].ToString();
                            p.vehicleRegistration = d["VehicleRegistrationNo"].ToString();
                            p.NameOfDriver = d["NameOfDriver"].ToString();
                            p.objRoute = new Routes { routeId = int.Parse(d["RouteNo"].ToString()) }.getRouteUsingRouteID();
                            p.tripStartTime = d["TripStartTime"].ToString();
                            p.tripEndTime = d["TripEndTime"].ToString();
                            p.amountDelivered = Convert.ToDecimal(d["amountDelivered"].ToString());
                            p.amountRepatriated = Convert.ToDecimal(d["Repatriation"].ToString());
                            p.NIBOfficer = d["NIBOfficer"].ToString();
                            p.totalMilage = Convert.ToDouble(d["TotalMileage"].ToString());
                            p.KmEquivalent = Convert.ToDouble(d["KmEquivalent"].ToString());

                            picks.Add(p);
                        }

                        return (picks.ToList<Pickups>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (picks);
                }
            }
        }

        #endregion

    }

    public class CashColl {
        public int Id { get; set; }
        public string branch { get; set; }
        public string customerName { get; set; }
        public string customerLocation { get; set; }
        public int pickFrequency { get; set; }
        public int isWeekDay { get; set; }
        public string isWeekDayExpr { get; set; }

        public decimal rate { get; set; }
        public decimal amt { get; set; }
        public decimal total { get; set; }
        public string btotal { get; set; }  //branch input total..previously decimal, now changed to varchar
        public string htotal { get; set; }  //head office total...previously decimal, now changed to varchar

        public Process objProcess { get; set; }
        public string filePath { get; set; }

        public List<CashColl> getCollectionsFromExcel() {
            List<CashColl> rs = null;
            using (var cn = Connectors.getXLSXConnection(this.filePath)) {
                try
                {
                    var cmd = new OleDbCommand { 
                        Connection = cn,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from [PICKUP$]",
                        CommandTimeout = 20
                    };

                    using (var d = cmd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            rs = new List<CashColl>();
                            while (d.Read()) {
                                var c = new CashColl { };

                                c.Id = int.Parse(d["No"].ToString());
                                c.branch = d["Branch"].ToString().Trim();
                                c.customerName = d["CustomerName"].ToString();
                                c.customerLocation = d["Location"].ToString();
                                c.pickFrequency = int.Parse(d["freqPicks"].ToString());

                                if (d["isWeekDay"].ToString() == "Y") { c.isWeekDay = 1; c.isWeekDayExpr = "Yes"; } else { c.isWeekDay = 0; c.isWeekDayExpr = "No"; }

                                c.rate = Convert.ToDecimal(d["AgreedRate"].ToString());
                                c.amt = Convert.ToDecimal(d["Amount"].ToString());
                                c.total = Convert.ToDecimal(d["GrandTotal"].ToString());

                                rs.Add(c);
                            }

                            return (rs.ToList<CashColl>());
                        }
                        else { return (rs); }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs);
                }
            }
        }
    }

}