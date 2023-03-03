using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using System.Diagnostics;

using Pickups.bridge;
using Pickups.mtier.xlCRUD;

namespace Pickups.mtier.repos
{
    public class VehicleRoutes
    {
        #region Properties

        public int Id { get; set; }
        public Company objCompany { get; set; }
        public string routeFrom { get; set; }
        public string routeTo { get; set; }
        public double distanceInKm { get; set; }
        public double acceptableVariance { get; set; }  //the level of discrepancy

        public decimal ratePerKm { get; set; }

        public Routes objRoute { get; set; }
        public Process objProcess { get; set; }

        #endregion


        #region Method APIs

        public bool Load() { 
            //method adds a vehicle route record to the staging area of the database
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_routes_i]",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@iFlag", "i");
                        cd.Parameters.AddWithValue("@routeId", objRoute.routeId);
                        cd.Parameters.AddWithValue("@compId", objCompany.getIdUsingBranchCode());
                        cd.Parameters.AddWithValue("@frm", objRoute.tripFrom);
                        cd.Parameters.AddWithValue("@tto", objRoute.tripTo);
                        cd.Parameters.AddWithValue("@km", objRoute.Km);
                        cd.Parameters.AddWithValue("@ratePerKm", objRoute.rateKm);
                        cd.Parameters.AddWithValue("@variance", 0);
                        cd.Parameters.AddWithValue("@process", objProcess.processName);

                        this.Id = int.Parse(cd.ExecuteScalar().ToString());

                        return (this.Id > 0 ? true : false);
                    }
                    catch (Exception ex) {
                        Debug.Print(ex.Message);
                        return false;
                    }
                }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return false;
            }
        }

        public bool isLoaded(string fn) { 
            //method determines if the file has already been uploaded into the system
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand(@"select count(*) from dbo.routesTemp where process= @p and isLoaded = @isLoad;", c);
                        cd.Parameters.AddWithValue("@p", fn);
                        cd.Parameters.AddWithValue("@isLoad", 0);

                        var cnt = int.Parse(cd.ExecuteScalar().ToString());
                        return (cnt > 0 ? false : true);
                    }
                    catch (Exception ex) {
                        Debug.Print(ex.Message);
                        return false;
                    }
                }
            }
            catch (Exception e) {
                return false;
            }
        }

        public bool PersistRoutesData(string fn)
        {
            try
            {
                using (var cn = Connectors.getConnection())
                {
                    using (var t = cn.BeginTransaction()) {
                        try
                        {
                            var cd = new SqlCommand
                            {
                                Connection = cn,
                                CommandType = CommandType.StoredProcedure,
                                CommandText = @"[proc_routes_p]",
                                CommandTimeout = 20,
                                Transaction = t
                            };

                            cd.Parameters.AddWithValue("@fn", fn);
                            cd.ExecuteNonQuery();

                            var cmd = new SqlCommand(@"update dbo.routesTemp set isLoaded = @loaded where process = @fn",cn,t);
                            cmd.Parameters.AddWithValue("@loaded", 1);
                            cmd.Parameters.AddWithValue("@fn", fn);

                            cmd.ExecuteNonQuery();

                            t.Commit();
                            return true;
                        }
                        catch (Exception routesErr)
                        {
                            Debug.Print(routesErr.Message);
                            t.Rollback();
                            return false;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return false;
            }
        }

        public List<VehicleRoutes> get() { 
            //method is for getting all loaded routes
            List<VehicleRoutes> r = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from routesTemp;",
                        CommandTimeout = 20
                    };

                    var d = cd.ExecuteReader();
                    if (d.HasRows) { r = new List<VehicleRoutes>(); }
                    while (d.Read()) {
                        var obj = new VehicleRoutes();

                        obj.Id = int.Parse(d["Id"].ToString());
                        obj.objCompany = new Company { Id =int.Parse(d["company_Id"].ToString()) };
                        obj.routeFrom = d["tfrm"].ToString();
                        obj.routeTo = d["tto"].ToString();
                        obj.distanceInKm = Convert.ToDouble(d["km"].ToString());
                        obj.ratePerKm = Convert.ToDecimal(d["ratePerKm"].ToString());


                        r.Add(obj);
                    }

                    return (r.ToList<VehicleRoutes>());
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (r);
                }
            }
        }

        public List<VehicleRoutes> get(string RTE_CAPTION) {
            List<VehicleRoutes> v = null;
            using (var con = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.routesTemp where process = @processName order by Id;", con);
                    cd.Parameters.AddWithValue("@processName", RTE_CAPTION);
                    //cd.Parameters.AddWithValue("@loadedFlag", 1);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows) { v = new List<VehicleRoutes>(); }
                        while (d.Read()) {
                            var o = new VehicleRoutes { };

                            o.Id = int.Parse(d["Id"].ToString());
                            o.objCompany = new Company { Id = int.Parse(d["company_Id"].ToString()) }.getCompany();
                            o.routeFrom = d["tfrm"].ToString();
                            o.routeTo = d["tto"].ToString();
                            o.distanceInKm = Convert.ToDouble(d["km"].ToString());
                            o.ratePerKm = Convert.ToDecimal(d["ratePerKm"].ToString());

                            v.Add(o);
                        }

                        return (v.ToList<VehicleRoutes>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (v);
                }
            }
        }

        public List<VehicleRoutes> getBranchRoutes() {
            List<VehicleRoutes> r = null;
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand
                    {
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from routes_Lookup where company_Id = @c_Id;",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@c_Id", objCompany.Id);

                    var d = cd.ExecuteReader();
                    if (d.HasRows) { r = new List<VehicleRoutes>(); }
                    while (d.Read())
                    {
                        var obj = new VehicleRoutes();

                        obj.Id = int.Parse(d["Id"].ToString());
                        obj.objCompany = new Company { Id = int.Parse(d["company_Id"].ToString()) }.getCompany();
                        obj.routeFrom = d["tfrm"].ToString();
                        obj.routeTo = d["tto"].ToString();
                        obj.distanceInKm = Convert.ToDouble(d["km"].ToString());
                        obj.ratePerKm = Convert.ToDecimal(d["ratePerKm"].ToString());

                        obj.objRoute = new Routes { routeId = int.Parse(d["route_Id"].ToString()) };
                        r.Add(obj);
                    }

                    return (r.ToList<VehicleRoutes>());
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (r);
                }
            }
        }

        #endregion


    }
}