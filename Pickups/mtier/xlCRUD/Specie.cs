using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Data.OleDb;
using System.Data.Common;
using System.Data;

using Pickups.bridge;

namespace Pickups.mtier.xlCRUD
{
    public class Specie
    {

        #region Properties

        public int Id { get; set; }
        public string branch { get; set; }
        public Routes objRoute { get; set; }
        public string routeDescription { get; set; }  //description for the route number

        public double Milage { get; set; }
        public int FrequencyOfTrip { get; set; }
        public decimal RevenueFromRate { get; set; }

        public string branchRevenueInput { get; set; }
        public string HORevenueInput { get; set; }

        public string filePath { get; set; }

        #endregion

        public List<Specie> getSpecieFromExcel() {
            List<Specie> s = null;
            try
            {
                using (var c = Connectors.getXLSXConnection(this.filePath)) {
                    try
                    {
                        var cd = new OleDbCommand { 
                            Connection = c,
                            CommandType = CommandType.Text,
                            CommandText = @"select * from [SPECIE_Movement$];",
                            CommandTimeout = 15
                        };

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows) { s = new List<Specie>(); }
                            while (d.Read()) {
                                var o = new Specie();

                                o.Id = int.Parse(d["Sno"].ToString());
                                o.branch = d["Branch"].ToString();
                                o.objRoute = new Routes { routeId = int.Parse(d["RouteNo"].ToString()) }.getRouteUsingRouteID();
                                o.Milage = Convert.ToDouble(d["TotalMilage"].ToString());
                                o.FrequencyOfTrip = int.Parse(d["TripFrequency"].ToString());
                                o.RevenueFromRate = Convert.ToDecimal(d["RevenueFromRate"].ToString());

                                s.Add(o);
                            }

                            return (s.ToList<Specie>());
                        }
                    }
                    catch (Exception specieErr) {
                        Debug.Print(specieErr.Message);
                        return (s);
                    }
                }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return (s);
            }
        }

        #region Excel CRUD



        #endregion


    }
}