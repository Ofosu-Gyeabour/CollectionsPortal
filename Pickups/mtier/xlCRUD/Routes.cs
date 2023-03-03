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
    public class Routes
    {

        #region Properties

        public int Id { get; set; }
        public int routeId { get; set; }
        public string branch { get; set; }
        public string tripFrom { get; set; }
        public string tripTo { get; set; }
        public double Km { get; set; }
        public decimal rateKm { get; set; }

        public double acceptableVariance { get; set; }
        
        #endregion

        #region Excel CRUD

        public string filePath { get; set; }

        public List<Routes> getRoutesFromExcel()
        {
            List<Routes> uploadedRoutes = null;
            try
            {
                using (var c = Connectors.getXLSXConnection(this.filePath))
                {
                    try
                    {
                        var cd = new OleDbCommand { 
                            Connection = c,
                            CommandType = CommandType.Text,
                            CommandText = @"select * from [Routes_Lookup$];",
                            CommandTimeout = 15
                        };

                        var k = 1;
                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows) { uploadedRoutes = new List<Routes>(); }
                            while (d.Read()) {
                                var r = new Routes();

                                r.Id = k;
                                r.routeId = int.Parse(d["RouteNo"].ToString());
                                r.branch = d["Branch"].ToString();
                                r.tripFrom = d["TripFrom"].ToString().ToUpper();
                                r.tripTo = d["TripTo"].ToString().ToUpper();
                                r.Km = Convert.ToDouble(d["Km"].ToString());
                                r.rateKm = Convert.ToDecimal(d["RatePerKm"].ToString());

                                uploadedRoutes.Add(r);
                                k++;
                            }

                            return (uploadedRoutes.ToList<Routes>());
                        }
                    }
                    catch (Exception innEx) {
                        Debug.Print(innEx.Message);
                        return uploadedRoutes;
                    }
                }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return uploadedRoutes;
            }
        }

        public Routes getRouteUsingRouteID() { 
            //method gets route using the routeId
            var x = new Routes { };
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cmd = new SqlCommand(@"select * from dbo.routes_Lookup where route_Id = @RId;", c);
                    cmd.Parameters.AddWithValue("@RId", this.routeId);

                    var d = cmd.ExecuteReader();

                    if (d.HasRows)
                    {
                        d.Read();
                        
                        x.routeId = this.routeId;
                        x.tripFrom = d["tfrm"].ToString().ToUpper();
                        x.tripTo = d["tto"].ToString().ToUpper();
                        
                        //added later
                        x.Id = int.Parse(d["Id"].ToString());
                        x.Km = Convert.ToDouble(d["km"].ToString());
                        x.rateKm = Convert.ToDecimal(d["ratePerKm"].ToString());
                        x.acceptableVariance = Convert.ToDouble(d["acceptableVariance"].ToString());

                        return (x);
                    }
                    else { return x; }
                }
                catch (Exception r) {
                    Debug.Print(r.Message);
                    return x;
                }
            }
        }

        #endregion


    }
}