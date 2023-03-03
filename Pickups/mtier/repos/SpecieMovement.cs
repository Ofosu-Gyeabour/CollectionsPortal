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
using Pickups.mtier.businessObjects;

namespace Pickups.mtier.repos
{
    public class SpecieMovement
    {
        #region Properties

        public int Id { get; set; }

        public Company objCompany { get; set; }
        public Routes objRoute { get; set; }
        public Process objProcess { get; set; }
        public Specie objSpecie { get; set; }

        public static List<SpecieMovement> specieListData = new List<SpecieMovement>();

        #endregion

        #region Public APIs

        public bool Load() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_specieM_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@compId", objCompany.getIdUsingBranchCode());
                    cd.Parameters.AddWithValue("@routeId", objRoute.routeId);
                    cd.Parameters.AddWithValue("@milage", objSpecie.Milage);
                    cd.Parameters.AddWithValue("@mFreq", objSpecie.FrequencyOfTrip);
                    cd.Parameters.AddWithValue("@revAccrued", objSpecie.RevenueFromRate);
                    cd.Parameters.AddWithValue("@isLoaded", 0);
                    cd.Parameters.AddWithValue("@process", objProcess.processName);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id > 0 ? true : false);
                }
                catch (Exception smEr) {
                    Debug.Print(smEr.Message);
                    return false;
                }
            }
        }

        public bool isLoaded(string fn) {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.specieTemp where process = @p and isLoaded = @isL;", c);
                    cd.Parameters.AddWithValue("@p", fn);
                    cd.Parameters.AddWithValue("@isL", 0);

                    var cnt = int.Parse(cd.ExecuteScalar().ToString());
                    return (cnt > 0 ? false : true);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool PersistSpecieData(string fn) {
            using (var c = Connectors.getConnection()) {
                using (var t = c.BeginTransaction()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_specieM_p]",
                            CommandTimeout = 20,
                            Transaction = t
                        };

                        cd.Parameters.AddWithValue("@fn", fn);
                        cd.ExecuteNonQuery();

                        var cm = new SqlCommand(@"update dbo.SpecieTemp set isLoaded = @loaded where process = @fn",c,t);
                        cm.Parameters.AddWithValue("@loaded", 1);
                        cm.Parameters.AddWithValue("@fn", fn);

                        cm.ExecuteNonQuery();

                        t.Commit();

                        new Pickups.mtier.businessObjects.Auditor
                        {
                            msg = string.Format("file name {0} persisted into the SpecieMovement table", fn),
                            msgDate = DateTime.Now.ToShortDateString()
                        }.LogAction();

                        return true;
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        t.Rollback();

                        return false;
                    }
                }
            }
        }

        public List<SpecieMovement> get(string SPECIE_CAPTION) { 
            //method recalls all data uploaded for that month in the staging area
            List<SpecieMovement> rs = null;
            using (var con = Connectors.getConnection()) {
                var cd = new SqlCommand { 
                    Connection = con,
                    CommandType = CommandType.Text,
                    CommandText = @"select * from dbo.specieTemp where process = @processName order by SNo;",
                    CommandTimeout = 20
                };

                cd.Parameters.AddWithValue("@processName", SPECIE_CAPTION);
                //cd.Parameters.AddWithValue("@loadedFlag", 1);

                using (var d = cd.ExecuteReader()) {
                    if (d.HasRows) { rs = new List<SpecieMovement>(); }
                    while (d.Read()) {
                        var s = new SpecieMovement { };

                        s.Id = int.Parse(d["Sno"].ToString());
                        s.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();
                        s.objRoute = new Routes { routeId = int.Parse(d["route_Id"].ToString()) }.getRouteUsingRouteID();

                        s.objProcess = new Process { processName = SPECIE_CAPTION };

                        s.objSpecie = new Specie { 
                            Milage = Convert.ToDouble(d["milage"].ToString()),
                            FrequencyOfTrip = int.Parse(d["monthlyFreq"].ToString()),
                            RevenueFromRate = Convert.ToDecimal(d["revenueAccrued"].ToString())
                        };

                        rs.Add(s);
                    }

                    return (rs.ToList<SpecieMovement>());
                }
            }
        }

        public List<SpecieMovement> getBranchSpeciesUsingFileName(string fn){
            List<SpecieMovement> rs = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.SpecieMovement where process = @processName", c);
                    cd.Parameters.AddWithValue("@processName", fn);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            rs = new List<SpecieMovement>();
                            if (specieListData != null) { specieListData.Clear(); } else { specieListData = new List<SpecieMovement>(); }

                            while (d.Read())
                            {
                                var s = new SpecieMovement { };

                                s.Id = int.Parse(d["Sno"].ToString());
                                s.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();
                                s.objRoute = new Routes { routeId = int.Parse(d["route_Id"].ToString()) }.getRouteUsingRouteID();

                                s.objProcess = new Process { processName = fn };

                                s.objSpecie = new Specie
                                {
                                    Milage = Convert.ToDouble(d["milage"].ToString()),
                                    FrequencyOfTrip = int.Parse(d["monthlyFreq"].ToString()),
                                    RevenueFromRate = Convert.ToDecimal(d["revenueAccrued"].ToString())
                                };

                                s.objSpecie.branchRevenueInput = d["branchInput"].ToString();
                                s.objSpecie.HORevenueInput = d["HOInput"].ToString();
                                
                                rs.Add(s);
                            }
                        }
                        else { return rs; }

                        specieListData = rs;
                        return (rs.ToList<SpecieMovement>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs.ToList<SpecieMovement>());
                }
            }
        }

        public bool getAuthorizingStatus(int _id) {
            //determines if a particular record has been authorized or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.SpecieMovement where SNo = @id;", c);
                    cd.Parameters.AddWithValue("@id", _id);

                    var statId = int.Parse(cd.ExecuteScalar().ToString());
                    return (statId == 3 ? false : true);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool getApprovalStatus(int _id)
        {
            //determines if a particular record has been approved or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.SpecieMovement where SNo = @id;", c);
                    cd.Parameters.AddWithValue("@id", _id);

                    var statId = int.Parse(cd.ExecuteScalar().ToString());
                    return (statId == 2 ? false : true);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool AuthorizeSpecieMovementData(int _Id, string _value, int official_Id)
        {
            //method is used to approve branch pickup or collection data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.SpecieMovement set branchInput = @bInput, status = @status, branchOfficerId = @officerId where SNo = @id;", c);
                        cd.Parameters.AddWithValue("@bInput", _value);
                        cd.Parameters.AddWithValue("@status", 2);  //Branch Approval
                        cd.Parameters.AddWithValue("@officerId", official_Id); //approving officer Id
                        cd.Parameters.AddWithValue("@id", _Id);

                        cd.ExecuteNonQuery();
                    }
                    catch (Exception de)
                    {
                        Debug.Print(de.Message);
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return false;
            }
        }

        public bool ApproveSpecieMovementData(int _Id, string _value, int official_Id)
        {
            //method is used to approve head office specie data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.SpecieMovement set HOInput = @hInput, status = @status, HOfficerId = @officerId where SNo = @id;", c);
                        cd.Parameters.AddWithValue("@hInput", _value);
                        cd.Parameters.AddWithValue("@status", 3);  //SPECIE MOVEMENT approval by H/Office
                        cd.Parameters.AddWithValue("@officerId", official_Id); //H/O approving officer Id
                        cd.Parameters.AddWithValue("@id", _Id);

                        cd.ExecuteNonQuery();
                    }
                    catch (Exception de)
                    {
                        Debug.Print(de.Message);
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return false;
            }
        }
        
        #endregion

    }
}